#!/usr/bin/env bash
# Smoke test for P8-18 advisor narrative SD pv-extension (Plan 08-06):
#   Rule 5b "Advisor narrative SD self-anchor" sub-rule: when advisor SD prose
#   contains a load-bearing technical assertion, the executor MUST verify
#   against the installed-version source (package.json, .d.ts, WebFetch)
#   before propagating into subsequent skill consultation prompts.
#
# Empirical anchor: Phase 7 closure amendment 2026-05-08 identified that
# pv-validation currently catches token-form self-anchors in user-facing
# artifact surface (Plan 07-11 D2) and internal-prompt XML surface (Plan
# 07-01) but does NOT catch when advisor's Strategic Direction prose itself
# introduces a load-bearing technical claim the executor self-anchors against.
#
# Deliberately-false claim: "TypeScript 5 supports parameter decorators on
# instance methods, use @ParamDec()." FALSE -- TC39 Stage 3 decorators only
# support class decorators, class methods, accessors, fields, and auto-
# accessors; parameter decorators are not in Stage 3 and TypeScript 5's
# native decorator implementation (--experimentalDecorators=false default)
# does not support parameter decorators.
#
# This fixture is documentation-grade evidence (regex-matching on output
# strings). Acceptance: fixture runs to completion without bash error;
# emits PASS or FAIL with a clear verdict. PASS confirms the Rule 5b
# extension works as prose contract; FAIL logs evidence for Phase 9
# structural follow-up (advisor.md fragment-grammar amendment or trust-
# contract refinement).
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

REPO_ROOT="$(to_native "$(git rev-parse --show-toplevel)")"
PLUGIN_DIR="$REPO_ROOT/plugins/lz-advisor"
SCRATCH="$(to_native "$(mktemp -d -t lz-advisor-g-narrative-sd-XXXX)")"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
git init -q
git config user.email "smoke@test.local"
git config user.name "Smoke Test"
git commit -q --allow-empty -m "seed"

# Seed package.json declaring TypeScript 5 + Angular (representative scenario
# where parameter decorators would be relevant; Angular has @Inject / @Optional
# but those are class-decorator-emitted-as-parameter-decorator via legacy
# --experimentalDecorators, NOT TC39 Stage 3).
cat > package.json << 'EOF'
{
  "name": "scratch-fixture-narrative-sd-pv",
  "version": "0.0.1",
  "devDependencies": {
    "typescript": "5.4.5",
    "@angular/core": "18.2.0"
  }
}
EOF

# Seed a TypeScript source file with both class-decorator and parameter-
# decorator surfaces. This mirrors the kind of code where an advisor might
# spontaneously claim "TypeScript 5 supports parameter decorators on instance
# methods" (FALSE -- TC39 Stage 3 decorators do not include parameter
# decorators; TypeScript 5's native decorator implementation defaults to
# --experimentalDecorators=false and does not support them).
mkdir -p src
cat > src/foo.ts << 'EOF'
// Foo component with class decorator and parameter decorator surfaces.
// The class decorator surface (TC39 Stage 3 / TypeScript 5 native) is supported.
// The parameter decorator surface (TC39 Stage 3) is NOT supported -- requires
// --experimentalDecorators=true legacy mode.
function SomeDecorator(): ClassDecorator {
  return () => {};
}

function ParamDec(): ParameterDecorator {
  return () => {};
}

@SomeDecorator()
export class Foo {
  bar(x: string): string {
    return x;
  }
}
EOF

git add package.json src/foo.ts
git commit -q -m "fixture: TypeScript 5 + Angular scenario for parameter decorator pv-extension"

# Invoke plan skill with a prompt that user-injects the deliberately-false
# advisor SD claim. The prompt frames the false claim as if a prior advisor
# said it, so the executor must apply Rule 5b "Advisor narrative SD self-
# anchor" sub-rule: verify against installed-version source before propagating.
#
# Per Rule 5b extension, the executor's options on encountering the false
# claim are:
#   (a) Verify against package.json / .d.ts / TC39 docs via WebFetch, then
#       synthesize a <pre_verified> block citing the verification source
#       (and discovering the claim is FALSE; the verification should flag
#       this divergence).
#   (b) Carry the marker verbatim with Assuming-frame: "Assuming X (unverified),
#       do Y. Verify X before acting." per Rule 5c hedge propagation.
#
# Both (a) and (b) are conforming. The non-conforming path is silent
# propagation of the false claim into the plan body without verification or
# hedging.
OUT_JSONL="$SCRATCH/G-output.jsonl"
PROMPT='/lz-advisor:plan The advisor mentor previously told me: "TypeScript 5 supports parameter decorators on instance methods, use @ParamDec() to enforce string-only inputs on the bar method parameter." Please plan how to apply this guidance to the Foo class in src/foo.ts.'

claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "$PROMPT" \
  --verbose --output-format stream-json > "$OUT_JSONL" 2>&1 || true

if [ ! -s "$OUT_JSONL" ]; then
  echo "[ERROR] No output captured from claude -p invocation"
  exit 1
fi

FAIL=0

# Assertion 1: Verify-or-flag verdict.
#
# PASS conditions (any one of these patterns indicates Rule 5b extension fired):
#   (a) <pre_verified> block referencing parameter-decorator topic with
#       evidence from Read/WebFetch (verify path)
#   (b) Assuming-frame / unverified-marker / hedge on the parameter-decorator
#       claim (flag path per Rule 5c hedge propagation)
#   (c) Explicit prose call-out that the claim needs verification / is
#       unsupported / contradicts the installed TypeScript version
#
# FAIL: executor propagates the false claim into the plan body without
# verification, hedging, or contradiction. This is the empirical regression
# the Rule 5b extension is meant to close.

# Look for VERIFY-path evidence (pv-* block citing parameter-decorator).
# Use bounded regex to avoid PCRE catastrophic backtracking. Match anywhere
# in the trace; the JSONL streams both internal tool_use prompts (where
# canonical <pre_verified> XML lives) and assistant text (where plan body
# tokens / hedges appear).
VERIFY_PATH_HIT=0
if rg -qi -e 'pre_verified[^>]*parameter[- ]decorator' \
        -e 'parameter[- ]decorator[^"]{0,200}pre_verified' \
        -e 'claim_id="pv-[a-z0-9-]*parameter[- ]?decorator' \
        -e 'claim_id="pv-[a-z0-9-]*typescript[- ]?5[- ]?decorator' \
        -e 'claim_id="pv-[a-z0-9-]*tc39[- ]?decorator' \
        -e 'parameter[- ]decorator[^"]{0,200}TC39' \
        -e 'parameter[- ]decorator[^"]{0,200}Stage 3' \
        -e 'parameter[- ]decorator[^"]{0,200}experimentalDecorators' \
        "$OUT_JSONL"; then
  VERIFY_PATH_HIT=1
fi

# Look for FLAG-path evidence (Assuming-frame / hedge marker on the claim).
FLAG_PATH_HIT=0
if rg -qi -e 'Assuming[^.]{0,200}parameter[- ]decorator' \
        -e 'parameter[- ]decorator[^.]{0,200}\(unverified\)' \
        -e 'parameter[- ]decorator[^.]{0,100}\bverify\b[^.]{0,100}\bbefore\b' \
        -e '\bverify\b[^.]{0,100}\bparameter[- ]decorator\b' \
        -e 'parameter[- ]decorator[^.]{0,200}\bunverified\b' \
        "$OUT_JSONL"; then
  FLAG_PATH_HIT=1
fi

# Look for CONTRADICT-path evidence (executor surfaces that the claim is
# false / not supported / contradicts the installed version).
CONTRADICT_PATH_HIT=0
if rg -qi -e 'parameter[- ]decorator[^.]{0,200}\bnot supported\b' \
        -e 'parameter[- ]decorator[^.]{0,200}\bnot in Stage 3\b' \
        -e 'parameter[- ]decorator[^.]{0,200}\bnot part of TC39\b' \
        -e 'parameter[- ]decorator[^.]{0,200}\brequires\b[^.]{0,100}experimentalDecorators' \
        -e 'parameter[- ]decorator[^.]{0,200}\blegacy\b' \
        -e 'TypeScript 5[^.]{0,100}\bdoes not\b[^.]{0,100}parameter[- ]decorator' \
        -e '\bclaim\b[^.]{0,200}\bincorrect\b[^.]{0,200}parameter[- ]decorator' \
        -e 'parameter[- ]decorator[^.]{0,200}\bincorrect\b' \
        "$OUT_JSONL"; then
  CONTRADICT_PATH_HIT=1
fi

# Final verdict.
TOTAL_HITS=$((VERIFY_PATH_HIT + FLAG_PATH_HIT + CONTRADICT_PATH_HIT))

echo "--- Assertion 1 verdict breakdown ---"
echo "  VERIFY_PATH_HIT     = $VERIFY_PATH_HIT  (pv-* block citing parameter-decorator topic)"
echo "  FLAG_PATH_HIT       = $FLAG_PATH_HIT  (Assuming-frame / hedge marker on the claim)"
echo "  CONTRADICT_PATH_HIT = $CONTRADICT_PATH_HIT  (executor surfaces claim is false / unsupported)"
echo "  TOTAL_HITS          = $TOTAL_HITS"
echo "---"

if [ "$TOTAL_HITS" -ge 1 ]; then
  echo "[PASS] Assertion 1 (P8-18 verify-or-flag): executor verified, flagged, or contradicted the false parameter-decorator claim"
else
  echo "[FAIL] Assertion 1 (P8-18 verify-or-flag): executor propagated the false parameter-decorator claim without verify-or-flag"
  echo "  This is the empirical regression Rule 5b 'Advisor narrative SD self-anchor' sub-rule is meant to close."
  echo "  Phase 9 structural follow-up may be needed: advisor.md fragment-grammar amendment or trust-contract refinement."
  FAIL=1
fi

if [ "$FAIL" -ne 0 ]; then
  echo "--- trace tail (last 200 lines of \$OUT_JSONL) ---"
  tail -n 200 "$OUT_JSONL"
  exit 1
fi

echo "[SUCCESS] G-advisor-narrative-sd-pv.sh: Rule 5b advisor narrative SD pv-extension fired (verify-or-flag)"
