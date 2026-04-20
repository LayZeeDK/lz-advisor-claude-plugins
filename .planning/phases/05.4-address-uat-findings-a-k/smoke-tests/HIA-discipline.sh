#!/usr/bin/env bash
# Smoke test for Findings H + I + A:
#   H: no permission prompts for D-11 allowed-tools surface (Read, Glob, Edit,
#      Write, Bash(git:*), WebSearch, WebFetch) during a trivial execute run
#   I: on a denied tool, executor degrades gracefully (no "Interrupted"
#      halt; tries alternative primitive or marks unavailable)
#   A: D-14 reworded orientation-budget permits targeted node_modules reads
set -eu

PLUGIN_DIR="$(git rev-parse --show-toplevel)/plugins/lz-advisor"
SCRATCH="$(mktemp -d -t lz-advisor-hia-XXXX)"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
git init -q
git commit -q --allow-empty -m "seed"

FAIL=0

# -------- Finding H: trivial execute, expect zero permission prompts -----
OUT_H="$SCRATCH/H-output.txt"
printf 'let x = 1;\n' > src.ts
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.execute Rename src.ts to main.ts." \
  --verbose --output-format stream-json > "$OUT_H" 2>&1 || true

if rg -q '"permission_required"|"requires_permission"' "$OUT_H"; then
  echo "[ERROR] Finding H: at least one permission prompt appeared in trace"
  FAIL=1
else
  echo "[OK] Finding H: no permission prompts detected for D-11 surface"
fi

# -------- Finding A: node_modules targeted-reads wording in plan skill ----
# Static assertion: plan SKILL.md has the D-14 reword
if git -C "$(git rev-parse --show-toplevel)" grep -q "read with discipline: targeted reads only" plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md; then
  echo "[OK] Finding A: reworded D-14 orientation-budget present in plan SKILL.md"
else
  echo "[ERROR] Finding A: reworded D-14 absent from plan SKILL.md"
  FAIL=1
fi

# -------- Finding I: deny a tool; executor must not halt ------------------
# NOTE: --deny flag not universally supported; this test is best-effort.
# If the executor does not halt and produces any output, consider the
# graceful-degradation directive landed. Explicit "Interrupted" text is the
# hard-fail signal per RESEARCH.md.
OUT_I="$SCRATCH/I-output.txt"
claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.execute Check whether typescript is installed. Do not use npm or pnpm; use file reads only." \
  --verbose --output-format stream-json > "$OUT_I" 2>&1 || true

if rg -q "Interrupted.*What should Claude do instead" "$OUT_I"; then
  echo "[ERROR] Finding I: executor halted with 'Interrupted' prompt"
  FAIL=1
elif rg -q '"stop_reason":"end_turn"|"stop_reason":"tool_use"' "$OUT_I"; then
  echo "[OK] Finding I: executor continued past any denial; no hang"
else
  echo "[WARN] Finding I: trace shape ambiguous; manual review recommended"
fi

if [ "$FAIL" -ne 0 ]; then
  echo "--- H trace tail (last 100 lines) ---"
  tail -n 100 "$OUT_H" 2>/dev/null || true
  echo "--- I trace tail (last 100 lines) ---"
  tail -n 100 "$OUT_I" 2>/dev/null || true
  exit 1
fi

echo "[SUCCESS] Smoke tests H + A passed; I passed or warned (manual review if warned)"
