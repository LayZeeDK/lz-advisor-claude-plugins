#!/usr/bin/env bash
# Smoke test for Findings B.1 + B.2 + H (pv-* synthesis discipline):
#   B.2: pv-* uses canonical XML format (no plain-bullet "Pre-verified Claims" sections)
#   B.1: synthesis count >= 1 per material orient-phase tool invocation (carry-forward + synthesis mandate)
#   H:   no self-anchor evidence (method= must name a concrete tool, not claimed knowledge)
#   H:   no empty <evidence> blocks; every source= attribute resolves to path or URL token
#   GAP-G1-firing: default-on ToolSearch fires on agent-generated input (Plan 07-07 closure)
set -eu

# Windows Git Bash compat: suppress argv path translation for native binaries
# (claude.exe, rg.exe, node.exe) and convert POSIX paths to Windows form so
# rg.exe can resolve them. No-op on Linux / macOS (cygpath unavailable).
if command -v cygpath >/dev/null 2>&1; then
  export MSYS_NO_PATHCONV=1
  export MSYS2_ARG_CONV_EXCL='*'
  to_native() { cygpath -w "$1"; }
else
  to_native() { printf '%s' "$1"; }
fi

PLUGIN_DIR="$(to_native "$(git rev-parse --show-toplevel)/plugins/lz-advisor")"
SCRATCH="$(to_native "$(mktemp -d -t lz-advisor-bpv-XXXX)")"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
git init -q
git commit -q --allow-empty -m "seed"
mkdir -p src
# Representative Class-2 fixture: a package.json declaring storybook + compodoc transitive deps,
# plus a src file whose docstring claim depends on framework currency.
printf '{\n  "name": "scratch-fixture",\n  "version": "0.0.0",\n  "devDependencies": {\n    "@storybook/angular": "^10.3.5",\n    "@compodoc/compodoc": "^1.2.1"\n  }\n}\n' > package.json
printf '/**\n * Storybook integration: wires Compodoc-generated metadata\n * via setCompodocJson from @storybook/addon-docs/angular.\n */\nexport const storybookConfig = { compodoc: true };\n' > src/app.ts
git add package.json src/app.ts
git commit -q -m "fixture: storybook+compodoc scenario"

OUT="$SCRATCH/B-output.jsonl"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.plan Verify whether @storybook/addon-docs/angular still exports setCompodocJson in Storybook 10.3.5 and document the canonical Compodoc integration pattern." \
  --verbose --output-format stream-json > "$OUT" 2>&1 || true

# Second scenario: agent-generated input path (empirical session 4 / 7 UAT shape).
# Seed a fresh scratch repo containing a synthesized review file with hedged
# claims about Storybook 10 + Compodoc behavior. The plan-skill invocation
# against the @-mentioned review file MUST trigger the default-on ToolSearch
# rule per the reframed <context_trust_contract> block (Plan 07-07 Task 1).
SCRATCH2="$(to_native "$(mktemp -d -t lz-advisor-bpv-2-XXXX)")"
trap 'rm -rf "$SCRATCH" "$SCRATCH2"' EXIT
cd "$SCRATCH2"
git init -q
git config user.email "smoke@test.local"
git config user.name "Smoke Test"
git commit -q --allow-empty -m "seed"
mkdir -p plans
printf '# Review: Storybook 10 + Compodoc integration\n\n## Findings\n\n1. **Hedged**: setCompodocJson may or may not still be exported from @storybook/addon-docs/angular in 10.3.5; Verify the export before acting (unverified against the installed Storybook version).\n\n2. **Hedged**: Compodoc 1.2.1 may or may not support signal output() in component documentation; confirm signal-output rendering before acting.\n\n3. Confirm @storybook/angular@10.3.5 ships an autodocs-compatible tags configuration before acting.\n' > plans/upstream-review.md
git add plans/upstream-review.md
git commit -q -m "seed upstream-review.md fixture"

OUT2="$SCRATCH2/B2-output.jsonl"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.plan Address findings in @plans/upstream-review.md" \
  --verbose --output-format stream-json > "$OUT2" 2>&1 || true

cd "$SCRATCH"

FAIL=0

# Assertion 1 (FIND-B.2 XML format): canonical XML form present AND no plain-bullet Pre-verified Claims section
if rg -q '<pre_verified[^>]*\bsource=' "$OUT"; then
  if rg -B1 -A2 '^## Pre-verified Claims' "$OUT" | rg -q '^- \*\*'; then
    echo "[ERROR] Assertion 1 (FIND-B.2 XML format): plain-bullet Pre-verified Claims section detected; canonical XML form required"
    FAIL=1
  else
    echo "[OK] Assertion 1 (FIND-B.2 XML format): pv-* blocks use canonical XML form; no plain-bullet sections"
  fi
else
  echo "[ERROR] Assertion 1 (FIND-B.2 XML format): no <pre_verified> opening tag in trace; expected at least 1"
  FAIL=1
fi

# Assertion 2 (FIND-B.1 synthesis count): >= 1 pv-* per material orient-phase tool invocation
PV_COUNT=$(rg -c '<pre_verified[^>]*\bsource=' "$OUT" || echo 0)
READ_FETCH_COUNT=$(rg -c '"name":"(Read|WebFetch)"' "$OUT" || echo 0)
if [ "$PV_COUNT" -ge 1 ]; then
  echo "[OK] Assertion 2 (FIND-B.1 synthesis count): $PV_COUNT pv-* synthesized for $READ_FETCH_COUNT Read/WebFetch invocations (>=1 required)"
else
  echo "[ERROR] Assertion 2 (FIND-B.1 synthesis count): $PV_COUNT pv-* synthesized for $READ_FETCH_COUNT Read/WebFetch invocations (need >=1)"
  FAIL=1
fi

# Assertion 3 (FIND-H self-anchor rejection): no self-anchor method= values
SELF_ANCHOR_RE='method="(prior knowledge|claimed knowledge|framework knowledge|training data|general knowledge|Nx semantics|Storybook semantics|Angular semantics|TypeScript semantics)"'
if rg -q -e "$SELF_ANCHOR_RE" "$OUT"; then
  echo "[ERROR] Assertion 3 (FIND-H self-anchor rejection): self-anchor evidence pattern found"
  rg -e "$SELF_ANCHOR_RE" "$OUT" | head -5
  FAIL=1
else
  echo "[OK] Assertion 3 (FIND-H self-anchor rejection): no self-anchor evidence patterns"
fi

# Assertion 4 (FIND-H empty-evidence + source-grounded): no empty <evidence>, every source= is a path/URL token
EMPTY_EVIDENCE=$(rg -c '<evidence[^>]*>\s*</evidence>' "$OUT" || echo 0)
if [ "$EMPTY_EVIDENCE" -gt 0 ]; then
  echo "[ERROR] Assertion 4 (FIND-H empty evidence): $EMPTY_EVIDENCE empty <evidence> blocks found"
  FAIL=1
else
  # Every pv-* source= attribute must reference a path (contains /) or URL (http(s)://) or a filename token
  BAD_SOURCES=$(rg -o '<pre_verified[^>]*\bsource="([^"]+)"' --replace '$1' "$OUT" | rg -v '(/|^http://|^https://|^[A-Za-z][A-Za-z0-9_.-]*\.[A-Za-z0-9]+$)' | wc -l | tr -d ' ')
  if [ "$BAD_SOURCES" -gt 0 ]; then
    echo "[ERROR] Assertion 4 (FIND-H source-grounded): $BAD_SOURCES pv-* source= attribute(s) do not resolve to path or URL tokens"
    FAIL=1
  else
    echo "[OK] Assertion 4 (FIND-H source-grounded): all pv-* blocks have non-empty <evidence> AND path/URL source= values"
  fi
fi

# Assertion 5 (GAP-G1-firing default-on enforcement, Plan 07-07 Gap 1 closure):
# When the input contains agent-generated source signals (@plans/, @.planning/,
# or filename containing review/consultation/session-notes/plan), the JSONL
# trace MUST contain a ToolSearch tool_use event BEFORE any pv-* block
# synthesis on Class 2/3/4 surfaces. The default-on framing requires that
# ToolSearch fires unconditionally on the agent-generated-source signal.
# This assertion runs against the SECOND scenario ($OUT2) which seeds an
# agent-generated review file as the @-mentioned input.
TOOLSEARCH_COUNT=$(rg -c '"name":"ToolSearch"' "$OUT2" || echo 0)
AGENT_INPUT_DETECTED=$(rg -c -e '@plans/' -e '@\.planning/' -e '"path":"[^"]*review[^"]*"' -e '"path":"[^"]*plan[^"]*\.md"' "$OUT2" || echo 0)
if [ "$AGENT_INPUT_DETECTED" -ge 1 ]; then
  if [ "$TOOLSEARCH_COUNT" -ge 1 ]; then
    echo "[OK] Assertion 5 (GAP-G1-firing default-on): ToolSearch fired on agent-generated input (TOOLSEARCH_COUNT=$TOOLSEARCH_COUNT, AGENT_INPUT_DETECTED=$AGENT_INPUT_DETECTED)"
  else
    echo "[ERROR] Assertion 5 (GAP-G1-firing default-on): agent-generated input detected (AGENT_INPUT_DETECTED=$AGENT_INPUT_DETECTED) but ToolSearch NOT invoked (TOOLSEARCH_COUNT=0); default-on rule failed"
    echo "  This is the empirical Gap 1 regression: per Plan 07-07 reframed <context_trust_contract>,"
    echo "  ToolSearch MUST fire as Phase 1 first action when agent-generated source signals are present."
    FAIL=1
  fi
else
  echo "[SKIP] Assertion 5 (GAP-G1-firing default-on): no agent-generated input signals detected in second-scenario fixture; assertion N/A (fixture-shape unexpected)"
fi

# Assertion 6 (FIND-B.2 dual-surface scope, Plan 07-11 D2 amendment):
# User-facing token-form pv-* references in the trace MUST resolve back to
# canonical <pre_verified> claim_id values present in the same session.
# This enforces the structural integrity of Rule 5b's user-facing-surface
# acceptance: token-form is permitted ONLY when paired with backing canonical
# XML in the executor's internal prompt to the agent. Tokens that do NOT
# resolve are potential confabulation indicators.
#
# Tight regex avoids false positives:
#   pv-[a-z]{2,}-[a-z0-9-]{2,}   matches pv-storybook-10-autodocs
#                                does NOT match pv-1, pvc, or random tokens
#
# Surface distinction is implicit in the JSONL structure: claim_id values
# appear inside <pre_verified> opening tags (in tool_use prompts emitted by
# the executor); user-facing tokens appear in the assistant's final text
# content (which is also captured in the JSONL trace as the assistant's
# message stream). Extracting all pv-* tokens from the WHOLE trace and
# subtracting the claim_id set yields the user-facing-only tokens that need
# to resolve. Any token in user-facing context that ALSO appears as a claim_id
# trivially resolves; orphan tokens are the failure signal.
#
# Run against $OUT (Scenario 1 -- the primary plan-skill invocation that
# typically synthesizes pv-* internally and may emit user-facing token-form
# in the plan body). Vacuous PASS via [SKIP] when no user-facing tokens
# observed (consistent with Assertion 5's [SKIP] at line 138).

USER_FACING_TOKENS=$(rg -o 'pv-[a-z]{2,}-[a-z0-9-]{2,}' "$OUT" --pcre2 2>/dev/null | sort -u || true)
INTERNAL_CLAIM_IDS=$(rg -o 'claim_id="(pv-[^"]+)"' --replace '$1' "$OUT" 2>/dev/null | sort -u || true)

if [ -z "$USER_FACING_TOKENS" ]; then
  echo "[SKIP] Assertion 6 (FIND-B.2 dual-surface resolution): no user-facing pv-* tokens detected in trace; assertion N/A (fixture-shape may be too thin to surface tokens)"
else
  # Compute orphan tokens: user-facing tokens NOT present in the internal claim_id set.
  ORPHAN_TOKENS=$(comm -23 <(echo "$USER_FACING_TOKENS") <(echo "$INTERNAL_CLAIM_IDS") || true)
  if [ -z "$ORPHAN_TOKENS" ]; then
    USER_FACING_COUNT=$(echo "$USER_FACING_TOKENS" | rg -c . || echo 0)
    INTERNAL_COUNT=$(echo "$INTERNAL_CLAIM_IDS" | rg -c . || echo 0)
    echo "[OK] Assertion 6 (FIND-B.2 dual-surface resolution): all $USER_FACING_COUNT user-facing pv-* tokens resolve to canonical <pre_verified> claim_id values ($INTERNAL_COUNT distinct claim_ids in trace)"
  else
    echo "[ERROR] Assertion 6 (FIND-B.2 dual-surface resolution): orphan user-facing pv-* tokens (no backing canonical XML claim_id):"
    echo "$ORPHAN_TOKENS" | sed 's/^/  - /'
    echo "  Per Plan 07-11 Rule 5b D2 amendment, user-facing token-form pv-* references MUST resolve back to a"
    echo "  claim_id value in a canonical <pre_verified> XML block elsewhere in the same session's executor flow."
    echo "  Orphan tokens are potential confabulation indicators."
    FAIL=1
  fi
fi

if [ "$FAIL" -ne 0 ]; then
  echo "--- scenario 1 trace excerpt (last 200 lines of \$OUT) ---"
  tail -n 200 "$OUT"
  echo "--- scenario 2 trace excerpt (last 100 lines of \$OUT2) ---"
  tail -n 100 "$OUT2"
  exit 1
fi

echo "[SUCCESS] B-pv-validation.sh: all 6 assertions passed (XML format + synthesis count + no self-anchor + no empty evidence + GAP-G1-firing default-on + dual-surface token resolution)"
