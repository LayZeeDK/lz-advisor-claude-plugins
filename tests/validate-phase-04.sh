#!/usr/bin/env bash
# Structural validation for Phase 4: Review Skills
# Tests verify content patterns in skills and agents for both
# lz-advisor-review and lz-advisor-security-review.
# Framework: git grep / bash assertions (no external dependencies).
# Run from the repository root: bash tests/validate-phase-04.sh

set -euo pipefail

REVIEW_SKILL="skills/lz-advisor-review/SKILL.md"
SECURITY_SKILL="skills/lz-advisor-security-review/SKILL.md"
REVIEWER_AGENT="agents/reviewer.md"
SECURITY_AGENT="agents/security-reviewer.md"

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

# ===========================================================================
# REVW-01: Executor scans code first
# ===========================================================================

if [ ! -f "$REVIEW_SKILL" ]; then
  fail "REVW-01: review skill file exists" \
    "File not found: $REVIEW_SKILL"
else
  # 04-01-01 (REVW-01): <scan> tag exists
  if git grep -q "<scan>" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-01 (scan tag): <scan> section exists in review skill"
  else
    fail "REVW-01 (scan tag): <scan> section missing" \
      "Expected <scan> tag in $REVIEW_SKILL"
  fi

  # 04-01-01 (REVW-01): <scan> appears before <consult>
  SCAN_LINE=$(git grep -n "<scan>" "$REVIEW_SKILL" 2>/dev/null | head -1 | cut -d: -f2)
  CONSULT_LINE=$(git grep -n "<consult>" "$REVIEW_SKILL" 2>/dev/null | head -1 | cut -d: -f2)

  if [ -n "$SCAN_LINE" ] && [ -n "$CONSULT_LINE" ] && [ "$SCAN_LINE" -lt "$CONSULT_LINE" ]; then
    pass "REVW-01 (order): <scan> at line $SCAN_LINE before <consult> at line $CONSULT_LINE"
  else
    fail "REVW-01 (order): scan-before-consult ordering" \
      "scan=$SCAN_LINE consult=$CONSULT_LINE -- scan must appear first"
  fi

  # 04-01-01 (REVW-01): scan section mentions reading files/code
  if git grep -q -e "Read" -e "read" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-01 (content): scan section references reading files"
  else
    fail "REVW-01 (content): no file reading instruction" \
      "Expected 'read' or 'Read' in $REVIEW_SKILL"
  fi
fi

# ===========================================================================
# REVW-02: Executor packages findings for reviewer
# ===========================================================================

if [ ! -f "$REVIEW_SKILL" ]; then
  fail "REVW-02: review skill file exists" \
    "File not found: $REVIEW_SKILL"
else
  # 04-01-02 (REVW-02): <consult> tag exists
  if git grep -q "<consult>" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-02 (consult tag): <consult> section exists in review skill"
  else
    fail "REVW-02 (consult tag): <consult> section missing" \
      "Expected <consult> tag in $REVIEW_SKILL"
  fi

  # 04-01-02 (REVW-02): packaging instruction
  if git grep -q -i "package" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-02 (packaging): skill contains packaging instruction"
  else
    fail "REVW-02 (packaging): no packaging instruction" \
      "Expected 'package' or 'Package' in $REVIEW_SKILL"
  fi

  # 04-01-02 (REVW-02): findings reference
  if git grep -q "findings" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-02 (findings): skill references findings"
  else
    fail "REVW-02 (findings): no findings reference" \
      "Expected 'findings' in $REVIEW_SKILL"
  fi
fi

# ===========================================================================
# REVW-03: Reviewer provides deep analysis
# ===========================================================================

if [ ! -f "$REVIEWER_AGENT" ]; then
  fail "REVW-03: reviewer agent file exists" \
    "File not found: $REVIEWER_AGENT"
else
  # 04-01-03 (REVW-03): agent file exists with model: opus
  if git grep -q "^model: opus" "$REVIEWER_AGENT" 2>/dev/null; then
    pass "REVW-03 (model): reviewer agent uses model: opus"
  else
    fail "REVW-03 (model): model: opus not found" \
      "Expected 'model: opus' in $REVIEWER_AGENT"
  fi

  # 04-01-03 (REVW-03): ~300 word output budget (D-02)
  if git grep -q "300 words" "$REVIEWER_AGENT" 2>/dev/null; then
    pass "REVW-03 (budget): reviewer agent has ~300 word output budget"
  else
    fail "REVW-03 (budget): 300 word budget not found" \
      "Expected '300 words' in $REVIEWER_AGENT"
  fi

  # 04-01-03 (REVW-03): cross-cutting pattern recognition (D-11)
  if git grep -q "cross-cutting" "$REVIEWER_AGENT" 2>/dev/null; then
    pass "REVW-03 (cross-cutting): reviewer agent includes cross-cutting analysis"
  else
    fail "REVW-03 (cross-cutting): cross-cutting analysis not found" \
      "Expected 'cross-cutting' in $REVIEWER_AGENT"
  fi
fi

# ===========================================================================
# REVW-04: Structured severity-classified output
# ===========================================================================

if [ ! -f "$REVIEW_SKILL" ]; then
  fail "REVW-04: review skill file exists" \
    "File not found: $REVIEW_SKILL"
else
  # 04-01-04 (REVW-04): <output> tag exists
  if git grep -q "<output>" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-04 (output tag): <output> section exists in review skill"
  else
    fail "REVW-04 (output tag): <output> section missing" \
      "Expected <output> tag in $REVIEW_SKILL"
  fi

  # 04-01-04 (REVW-04): severity tier -- Critical (D-20)
  if git grep -q "Critical" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-04 (Critical): severity tier Critical present"
  else
    fail "REVW-04 (Critical): Critical severity tier missing" \
      "Expected 'Critical' in $REVIEW_SKILL"
  fi

  # 04-01-04 (REVW-04): severity tier -- Important (D-20)
  if git grep -q "Important" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-04 (Important): severity tier Important present"
  else
    fail "REVW-04 (Important): Important severity tier missing" \
      "Expected 'Important' in $REVIEW_SKILL"
  fi

  # 04-01-04 (REVW-04): severity tier -- Suggestion (D-20)
  if git grep -q "Suggestion" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-04 (Suggestion): severity tier Suggestion present"
  else
    fail "REVW-04 (Suggestion): Suggestion severity tier missing" \
      "Expected 'Suggestion' in $REVIEW_SKILL"
  fi

  # 04-01-04 (REVW-04): fix suggestions (D-16)
  if git grep -q -i "fix" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-04 (fix): fix suggestion instruction present"
  else
    fail "REVW-04 (fix): fix suggestion instruction missing" \
      "Expected 'Fix' or 'fix' in $REVIEW_SKILL"
  fi
fi

# ===========================================================================
# REVW-05: Review files, directories, or recent changes
# ===========================================================================

if [ ! -f "$REVIEW_SKILL" ]; then
  fail "REVW-05: review skill file exists" \
    "File not found: $REVIEW_SKILL"
else
  # 04-01-05 (REVW-05): files and directories
  if git grep -q "file" "$REVIEW_SKILL" 2>/dev/null && git grep -q "director" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-05 (scope): skill mentions files and directories"
  else
    fail "REVW-05 (scope): file/directory scope missing" \
      "Expected both 'file' and 'director' in $REVIEW_SKILL"
  fi

  # 04-01-05 (REVW-05): recent changes mode
  if git grep -q -e "git diff" -e "recent changes" -e "git log" "$REVIEW_SKILL" 2>/dev/null; then
    pass "REVW-05 (changes): skill supports recent changes review"
  else
    fail "REVW-05 (changes): recent changes mode missing" \
      "Expected 'git diff', 'recent changes', or 'git log' in $REVIEW_SKILL"
  fi
fi

# ===========================================================================
# REVW-06: Inherits session model (no model: in frontmatter)
# ===========================================================================

if [ ! -f "$REVIEW_SKILL" ]; then
  fail "REVW-06: review skill file exists" \
    "File not found: $REVIEW_SKILL"
else
  # 04-01-06 (REVW-06): no model override
  if git grep -q "^model:" "$REVIEW_SKILL" 2>/dev/null; then
    fail "REVW-06: session model inheritance" \
      "Found 'model:' in frontmatter of $REVIEW_SKILL -- skill must not override session model"
  else
    pass "REVW-06: no model override in frontmatter -- session model inherited"
  fi
fi

# ===========================================================================
# SECR-01: Executor scans with security focus
# ===========================================================================

if [ ! -f "$SECURITY_SKILL" ]; then
  fail "SECR-01: security skill file exists" \
    "File not found: $SECURITY_SKILL (expected from Plan 02)"
else
  # 04-02-01 (SECR-01): <scan> tag exists
  if git grep -q "<scan>" "$SECURITY_SKILL" 2>/dev/null; then
    pass "SECR-01 (scan tag): <scan> section exists in security skill"
  else
    fail "SECR-01 (scan tag): <scan> section missing" \
      "Expected <scan> tag in $SECURITY_SKILL"
  fi

  # 04-02-01 (SECR-01): security focus in scan
  if git grep -q -e "attack surface" -e "security" "$SECURITY_SKILL" 2>/dev/null; then
    pass "SECR-01 (focus): security scan focus present"
  else
    fail "SECR-01 (focus): security focus missing from scan" \
      "Expected 'attack surface' or 'security' in $SECURITY_SKILL"
  fi
fi

# ===========================================================================
# SECR-02: Executor packages security findings
# ===========================================================================

if [ ! -f "$SECURITY_SKILL" ]; then
  fail "SECR-02: security skill file exists" \
    "File not found: $SECURITY_SKILL (expected from Plan 02)"
else
  # 04-02-02 (SECR-02): <consult> tag exists
  if git grep -q "<consult>" "$SECURITY_SKILL" 2>/dev/null; then
    pass "SECR-02 (consult tag): <consult> section exists in security skill"
  else
    fail "SECR-02 (consult tag): <consult> section missing" \
      "Expected <consult> tag in $SECURITY_SKILL"
  fi

  # 04-02-02 (SECR-02): packaging instruction
  if git grep -q -i "package" "$SECURITY_SKILL" 2>/dev/null; then
    pass "SECR-02 (packaging): security skill contains packaging instruction"
  else
    fail "SECR-02 (packaging): no packaging instruction" \
      "Expected 'package' or 'Package' in $SECURITY_SKILL"
  fi
fi

# ===========================================================================
# SECR-03: Advisor applies OWASP Top 10 lens
# ===========================================================================

if [ ! -f "$SECURITY_AGENT" ]; then
  fail "SECR-03: security agent file exists" \
    "File not found: $SECURITY_AGENT (expected from Plan 02)"
else
  # 04-02-03 (SECR-03): OWASP in agent (D-23)
  if git grep -q "OWASP" "$SECURITY_AGENT" 2>/dev/null; then
    pass "SECR-03 (OWASP): security agent includes OWASP lens"
  else
    fail "SECR-03 (OWASP): OWASP not found" \
      "Expected 'OWASP' in $SECURITY_AGENT"
  fi
fi

# ===========================================================================
# SECR-04: Advisor performs threat modeling
# ===========================================================================

if [ ! -f "$SECURITY_AGENT" ]; then
  fail "SECR-04: security agent file exists" \
    "File not found: $SECURITY_AGENT (expected from Plan 02)"
else
  # 04-02-04 (SECR-04): threat modeling (D-23)
  if git grep -q "threat" "$SECURITY_AGENT" 2>/dev/null; then
    pass "SECR-04 (threat): security agent includes threat modeling"
  else
    fail "SECR-04 (threat): threat modeling not found" \
      "Expected 'threat' in $SECURITY_AGENT"
  fi
fi

# ===========================================================================
# SECR-05: Severity-classified security findings
# ===========================================================================

if [ ! -f "$SECURITY_SKILL" ]; then
  fail "SECR-05: security skill file exists" \
    "File not found: $SECURITY_SKILL (expected from Plan 02)"
else
  # 04-02-05 (SECR-05): severity tier -- Critical (D-22)
  if git grep -q "Critical" "$SECURITY_SKILL" 2>/dev/null; then
    pass "SECR-05 (Critical): severity tier Critical present in security skill"
  else
    fail "SECR-05 (Critical): Critical severity tier missing" \
      "Expected 'Critical' in $SECURITY_SKILL"
  fi

  # 04-02-05 (SECR-05): severity tier -- High (D-22)
  if git grep -q "High" "$SECURITY_SKILL" 2>/dev/null; then
    pass "SECR-05 (High): severity tier High present in security skill"
  else
    fail "SECR-05 (High): High severity tier missing" \
      "Expected 'High' in $SECURITY_SKILL"
  fi

  # 04-02-05 (SECR-05): severity tier -- Medium (D-22)
  if git grep -q "Medium" "$SECURITY_SKILL" 2>/dev/null; then
    pass "SECR-05 (Medium): severity tier Medium present in security skill"
  else
    fail "SECR-05 (Medium): Medium severity tier missing" \
      "Expected 'Medium' in $SECURITY_SKILL"
  fi
fi

# ===========================================================================
# SECR-06: Review files, directories, or recent changes
# ===========================================================================

if [ ! -f "$SECURITY_SKILL" ]; then
  fail "SECR-06: security skill file exists" \
    "File not found: $SECURITY_SKILL (expected from Plan 02)"
else
  # 04-02-06 (SECR-06): file and directory/git diff scope
  if git grep -q "file" "$SECURITY_SKILL" 2>/dev/null; then
    HAS_DIR=$(git grep -q "director" "$SECURITY_SKILL" 2>/dev/null && echo "yes" || echo "no")
    HAS_DIFF=$(git grep -q -e "git diff" -e "recent changes" "$SECURITY_SKILL" 2>/dev/null && echo "yes" || echo "no")
    if [ "$HAS_DIR" = "yes" ] || [ "$HAS_DIFF" = "yes" ]; then
      pass "SECR-06 (scope): security skill supports files and directories/changes"
    else
      fail "SECR-06 (scope): incomplete scope support" \
        "Expected 'director' or 'git diff'/'recent changes' in $SECURITY_SKILL"
    fi
  else
    fail "SECR-06 (scope): file scope missing" \
      "Expected 'file' in $SECURITY_SKILL"
  fi
fi

# ===========================================================================
# SECR-07: Inherits session model (no model: in frontmatter)
# ===========================================================================

if [ ! -f "$SECURITY_SKILL" ]; then
  fail "SECR-07: security skill file exists" \
    "File not found: $SECURITY_SKILL (expected from Plan 02)"
else
  # 04-02-07 (SECR-07): no model override
  if git grep -q "^model:" "$SECURITY_SKILL" 2>/dev/null; then
    fail "SECR-07: session model inheritance" \
      "Found 'model:' in frontmatter of $SECURITY_SKILL -- skill must not override session model"
  else
    pass "SECR-07: no model override in security skill frontmatter"
  fi
fi

# ===========================================================================
# Summary
# ===========================================================================

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
