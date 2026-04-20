#!/usr/bin/env bash
# Smoke test for Findings K + C + B:
#   K: executor uses WebSearch/WebFetch for API-migration questions (cheap path)
#   C: executor's advisor package contains a Pre-Verified Package Behavior Claims block
#   B: executor pre-verifies external claims rather than flagging-and-punting
set -eu

PLUGIN_DIR="$(git rev-parse --show-toplevel)/plugins/lz-advisor"
SCRATCH="$(mktemp -d -t lz-advisor-kcb-XXXX)"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
git init -q
git commit -q --allow-empty -m "seed"
mkdir -p src
printf 'export const storybookConfig = { docs: { autodocs: true } };\n' > src/storybook-shim.ts
git add src/storybook-shim.ts
git commit -q -m "initial shim"

OUT="$SCRATCH/kcb-output.txt"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.plan Verify whether setCompodocJson is still exported from @storybook/addon-docs/angular in Storybook 10.3.5. The config claims it is." \
  --verbose --output-format stream-json > "$OUT" 2>&1 || true

FAIL=0

# Finding K: check for WebSearch or WebFetch tool usage in the trace
if rg -q '"name":"(WebSearch|WebFetch)"' "$OUT"; then
  echo "[OK] Finding K: executor used WebSearch or WebFetch"
else
  echo "[WARN] Finding K: no WebSearch/WebFetch in trace. Executor may have skipped the cheap path."
  FAIL=1
fi

# Finding C: check for Pre-Verified Package Behavior Claims section in the advisor package
if rg -q "Pre-Verified Package Behavior Claims" "$OUT"; then
  echo "[OK] Finding C: Pre-Verified section appeared in executor prompt to advisor"
else
  echo "[ERROR] Finding C: Pre-Verified section missing from advisor package"
  FAIL=1
fi

# Finding B: check for <pre_verified source= block in the advisor package
if rg -q "<pre_verified source=" "$OUT"; then
  echo "[OK] Finding B: executor packaged at least one <pre_verified> block"
else
  echo "[ERROR] Finding B: no <pre_verified> block -- executor did not resolve uncertainty"
  FAIL=1
fi

if [ "$FAIL" -ne 0 ]; then
  echo "--- trace excerpt (last 200 lines) ---"
  tail -n 200 "$OUT"
  exit 1
fi

echo "[SUCCESS] All three smoke tests (K, C, B) passed"
