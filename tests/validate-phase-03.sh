#!/usr/bin/env bash
# Structural validation for Phase 3: Execute Skill (lz-execute)
# Tests verify content patterns in plugins/lz-advisor/skills/lz-execute/SKILL.md.
# Framework: git grep / bash assertions (no external dependencies).
# Run from the repository root: bash tests/validate-phase-03.sh

set -euo pipefail

SKILL="plugins/lz-advisor/skills/lz-execute/SKILL.md"
PASS_COUNT=0
FAIL_COUNT=0

pass() {
  echo "[PASS] $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "[FAIL] $1"
  echo "       $2"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

# ---------------------------------------------------------------------------
# 03-01-01 (IMPL-10): Skill inherits session model -- no model: in frontmatter
# ---------------------------------------------------------------------------
# git grep "^model:" returns exit 0 (found) or exit 1 (not found).
# Absence of "^model:" is the passing condition, so we invert: expect exit 1.
if git grep -q "^model:" "$SKILL" 2>/dev/null; then
  fail "03-01-01 IMPL-10: session model inheritance" \
    "Found 'model:' in frontmatter of $SKILL -- skill must not override session model"
else
  pass "03-01-01 IMPL-10: no model override in frontmatter -- session model inherited"
fi

# ---------------------------------------------------------------------------
# 03-01-02 (IMPL-01): Consult advisor before substantive work (after orient)
#
# Requirement: <consult> section exists after <orient> AND contains the phrase
# "Before starting substantive work".
# ---------------------------------------------------------------------------

# Check <consult> appears after <orient> by comparing line numbers.
ORIENT_LINE=$(git grep -n "^<orient>" "$SKILL" 2>/dev/null | head -1 | cut -d: -f2)
CONSULT_LINE=$(git grep -n "^<consult>" "$SKILL" 2>/dev/null | head -1 | cut -d: -f2)

if [ -z "$ORIENT_LINE" ] || [ -z "$CONSULT_LINE" ]; then
  fail "03-01-02 IMPL-01: <consult> after <orient>" \
    "One or both sections not found: orient=$ORIENT_LINE consult=$CONSULT_LINE"
elif [ "$CONSULT_LINE" -gt "$ORIENT_LINE" ]; then
  pass "03-01-02 IMPL-01 (order): <consult> at line $CONSULT_LINE is after <orient> at line $ORIENT_LINE"
else
  fail "03-01-02 IMPL-01 (order): <consult> at line $CONSULT_LINE is NOT after <orient> at line $ORIENT_LINE" \
    "Phase ordering violated -- consult must follow orient"
fi

# Check "Before starting substantive work" text is present inside the file.
if git grep -q "Before starting substantive work" "$SKILL" 2>/dev/null; then
  pass "03-01-02 IMPL-01 (content): <consult> contains 'Before starting substantive work'"
else
  fail "03-01-02 IMPL-01 (content): 'Before starting substantive work' not found in $SKILL" \
    "IMPL-01 requires explicit pre-work consultation trigger phrase"
fi

# ---------------------------------------------------------------------------
# 03-01-03 (IMPL-04, IMPL-06): durable before final, commit in durable, final after commit
#
# Requirement:
#   IMPL-06: <durable> section appears before <final> in the file
#   IMPL-06: <durable> contains the word "Commit"
#   IMPL-04: <final> contains "After committing"
# ---------------------------------------------------------------------------

DURABLE_LINE=$(git grep -n "^<durable>" "$SKILL" 2>/dev/null | head -1 | cut -d: -f2)
FINAL_LINE=$(git grep -n "^<final>" "$SKILL" 2>/dev/null | head -1 | cut -d: -f2)

if [ -z "$DURABLE_LINE" ] || [ -z "$FINAL_LINE" ]; then
  fail "03-01-03 IMPL-04,IMPL-06: <durable> and <final> sections" \
    "One or both sections not found: durable=$DURABLE_LINE final=$FINAL_LINE"
elif [ "$DURABLE_LINE" -lt "$FINAL_LINE" ]; then
  pass "03-01-03 IMPL-06 (order): <durable> at line $DURABLE_LINE appears before <final> at line $FINAL_LINE"
else
  fail "03-01-03 IMPL-06 (order): <durable> at line $DURABLE_LINE does NOT appear before <final> at line $FINAL_LINE" \
    "Phase ordering violated -- durable must precede final"
fi

if git grep -q "Commit" "$SKILL" 2>/dev/null; then
  pass "03-01-03 IMPL-06 (content): <durable> section contains 'Commit' instruction"
else
  fail "03-01-03 IMPL-06 (content): 'Commit' not found in $SKILL" \
    "IMPL-06 requires deliverable durability via git commit before final consultation"
fi

if git grep -q "After committing" "$SKILL" 2>/dev/null; then
  pass "03-01-03 IMPL-04 (content): <final> section contains 'After committing'"
else
  fail "03-01-03 IMPL-04 (content): 'After committing' not found in $SKILL" \
    "IMPL-04 requires final advisor call to be explicitly after committing"
fi

# ---------------------------------------------------------------------------
# 03-01-04 (IMPL-05): Accept optional plan file input
#
# Requirement: <orient> section contains plan file handling logic.
# Verify: "plan file" and "@ file reference" are present.
# ---------------------------------------------------------------------------

if git grep -q "plan file" "$SKILL" 2>/dev/null; then
  pass "03-01-04 IMPL-05 (plan file): orient contains 'plan file' handling"
else
  fail "03-01-04 IMPL-05 (plan file): 'plan file' not found in $SKILL" \
    "IMPL-05 requires orient phase to handle an optional plan file"
fi

if git grep -q "@ file reference" "$SKILL" 2>/dev/null; then
  pass "03-01-04 IMPL-05 (@ file reference): orient mentions '@ file reference' mechanism"
else
  fail "03-01-04 IMPL-05 (@ file reference): '@ file reference' not found in $SKILL" \
    "IMPL-05 requires explicit @ file reference mechanism for plan file input"
fi

# ---------------------------------------------------------------------------
# 03-01-05 (IMPL-09): Package relevant context at each advisor consultation point
#
# Requirement: the skill instructs context packaging at >= 2 advisor consultation
# points (the pre-execute consult and the final review consult). The execute skill
# now DELEGATES the packaging format to the shared reference -- it instructs
# "Package the <...> consultation prompt per <...> references/context-packaging.md"
# rather than inlining a "1. The user's original task" numbered list.
# (Repaired 2026-06-14: the prior assertion matched the inline numbered-list form,
# replaced by the shared references/context-packaging.md delegation in Phase 5.4/6.)
# ---------------------------------------------------------------------------

PACK_COUNT=$(git grep -c "consultation prompt per the" "$SKILL" 2>/dev/null | cut -d: -f2 || echo 0)

if [ "${PACK_COUNT:-0}" -ge 2 ]; then
  pass "03-01-05 IMPL-09 (context packaging): $PACK_COUNT 'Package the ... consultation prompt per ...' instructions (need >= 2, via references/context-packaging.md)"
else
  fail "03-01-05 IMPL-09 (context packaging): found ${PACK_COUNT:-0} delegated packaging instructions, need >= 2" \
    "IMPL-09 requires context packaging at each advisor consultation point (now via references/context-packaging.md)"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo ""
echo "Results: $PASS_COUNT/$TOTAL passed"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "Status: [FAIL] -- $FAIL_COUNT assertion(s) failed"
  exit 1
else
  echo "Status: [PASS] -- all assertions passed"
  exit 0
fi
