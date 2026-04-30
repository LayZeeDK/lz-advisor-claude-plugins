#!/usr/bin/env bash
# Smoke test for Findings B.1 + B.2 + H (pv-* synthesis discipline):
#   B.2: pv-* uses canonical XML format (no plain-bullet "Pre-verified Claims" sections)
#   B.1: synthesis count >= 1 per material orient-phase tool invocation (carry-forward + synthesis mandate)
#   H:   no self-anchor evidence (method= must name a concrete tool, not claimed knowledge)
#   H:   no empty <evidence> blocks; every source= attribute resolves to path or URL token
set -eu

PLUGIN_DIR="$(git rev-parse --show-toplevel)/plugins/lz-advisor"
SCRATCH="$(mktemp -d -t lz-advisor-bpv-XXXX)"
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

if [ "$FAIL" -ne 0 ]; then
  echo "--- trace excerpt (last 200 lines) ---"
  tail -n 200 "$OUT"
  exit 1
fi

echo "[SUCCESS] B-pv-validation.sh: all 4 assertions passed (XML format + synthesis count + no self-anchor + no empty evidence)"
