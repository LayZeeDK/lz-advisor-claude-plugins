---
phase: 04-review-skills
reviewed: 2026-04-12T23:58:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - agents/reviewer.md
  - agents/security-reviewer.md
  - skills/lz-advisor-review/SKILL.md
  - skills/lz-advisor-security-review/SKILL.md
  - tests/validate-phase-04.sh
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-04-12T23:58:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

The Phase 4 deliverables implement two review skills (code quality review and security review) and two corresponding Opus-backed agents (reviewer and security-reviewer), along with a structural validation test script. The overall design is sound and follows the established executor-advisor pattern from Phases 2-3. Skills correctly use the three-phase scan/consult/output workflow, agents are appropriately constrained with read-only tools and single-turn limits, and the test script provides thorough assertion coverage.

Two warnings and two informational items were identified. The warnings concern structural inconsistencies between the new agents and the established advisor agent pattern. The informational items note minor test robustness concerns.

## Warnings

### WR-01: Stray `</output>` Tag on Agent Files -- Inconsistent with Established Pattern

**File:** `agents/reviewer.md:75` and `agents/security-reviewer.md:102`
**Issue:** Both new agent files end with a closing `</output>` tag. The existing `agents/advisor.md` (the established agent from Phase 2) does not have this tag. The agent body text does not contain a matching `<output>` open tag, so this is an unmatched closing tag. While skill files in this codebase consistently end with `</output>` (a pattern shared across all four skills), agent files do not -- `advisor.md` ends at line 84 with no XML wrapper. This inconsistency means the new agents deviate from the established agent convention, which could cause unexpected behavior if Claude Code's agent parser interprets this tag as a structural delimiter.
**Fix:** Remove the trailing `</output>` line from both agent files to match the established `advisor.md` pattern:

In `agents/reviewer.md`, remove line 75:
```
</output>
```

In `agents/security-reviewer.md`, remove line 102:
```
</output>
```

### WR-02: Duplicate `</output>` Tags in Skill Files

**File:** `skills/lz-advisor-review/SKILL.md:117,122` and `skills/lz-advisor-security-review/SKILL.md:132,137`
**Issue:** Both review skill files contain two `</output>` closing tags. The first one (line 117 / 132) correctly closes the `<output>` section that opens at line 84 / 95. The second one (line 122 / 137) is the trailing wrapper tag that matches the convention used in the plan and execute skills. While the trailing `</output>` is an established convention in this codebase's skill files (all four skills have it), the review skills are the only ones that also have an `<output>` section name tag. This creates a doubled `</output>` that could confuse XML-aware parsing -- the first closes the section, the second is ambiguous. The plan and execute skills avoid this because their final section tags are `</produce>` and `</complete>` respectively, so there is no collision with the trailing `</output>`.
**Fix:** Rename the output phase section tag to avoid collision with the trailing wrapper tag. Use `<present>` / `</present>` to match the phase's purpose (presenting findings):

In `skills/lz-advisor-review/SKILL.md`:
```markdown
<present>
## Phase 3: Structure Output
...
</present>
```

In `skills/lz-advisor-security-review/SKILL.md`:
```markdown
<present>
## Phase 3: Structure Output
...
</present>
```

This preserves the trailing `</output>` convention while eliminating the ambiguous double-close.

## Info

### IN-01: Test Script Uses Loose Pattern Matching for Some Assertions

**File:** `tests/validate-phase-04.sh:57`
**Issue:** The REVW-01 content check (line 57-62) searches the entire file for `Read` or `read` case-sensitively to confirm the scan section references file reading. This matches anywhere in the file -- not just within the `<scan>` section. For example, it would pass even if "Read" only appeared in the `<consult>` section or YAML frontmatter. Similarly, REVW-05 (line 189-202) checks for `file` and `director` across the entire file rather than within the scan section. The tests still provide value as structural smoke tests, but they verify keyword presence rather than correct placement.
**Fix:** For higher-fidelity tests, extract the content between `<scan>` and `</scan>` tags and search within that range. This can be done with `sed -n '/<scan>/,/<\/scan>/p'` piped to `grep`. However, given this is a structural validation suite (not a full test framework), the current approach is acceptable -- this is an observation for future improvement, not a blocking concern.

### IN-02: SECR-06 Test Has Asymmetric Logic Compared to REVW-05

**File:** `tests/validate-phase-04.sh:348-361`
**Issue:** The REVW-05 test (line 189-202) checks for both "file + director" AND "git diff / recent changes" as two separate assertions that both must pass. The SECR-06 test (line 348-361) uses OR logic: it passes if the file mentions either "director" or "git diff / recent changes", meaning the security skill could pass without supporting directory-scoped reviews. This is a different bar for the same functional requirement. The security skill does in fact support both (it mentions files, directories, and git diff), so the test passes correctly today -- but the weaker assertion could allow a future regression.
**Fix:** Split SECR-06 into two assertions matching the REVW-05 pattern:
```bash
# files and directories
if git grep -q "file" "$SECURITY_SKILL" && git grep -q "director" "$SECURITY_SKILL"; then
  pass "SECR-06 (scope): security skill mentions files and directories"
fi

# recent changes mode
if git grep -q -e "git diff" -e "recent changes" -e "git log" "$SECURITY_SKILL"; then
  pass "SECR-06 (changes): security skill supports recent changes review"
fi
```

---

_Reviewed: 2026-04-12T23:58:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
