---
phase: 11-fixture-baseline
fixed_at: 2026-06-07T00:00:00Z
review_path: .planning/phases/11-fixture-baseline/11-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 11: Code Review Fix Report

**Fixed at:** 2026-06-07
**Source review:** .planning/phases/11-fixture-baseline/11-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (2 Critical + 5 Warning; 3 Info findings out of scope)
- Fixed: 7
- Skipped: 0

All fixes were applied in an isolated git worktree and each verified against the
phase contract before commit: both fixtures stay green in default self-extract
mode (reviewer "7 findings parsed", security "6 findings parsed"), exit non-zero
in `--self-test`, and replay green via `--from-trace`. CRLF round-trip and
adversarial traces (too-few-findings, renamed heading, trailing section) were
used to prove each behavioral fix, not just re-read it.

## Fixed Issues

### CR-01: Security `get_report` swallows all trailing prose when `### Missed surfaces` is absent

**Files modified:** `tests/D-security-reviewer-budget.sh`
**Commit:** a58db4f
**Applied fix:** Replaced the two-flag terminator (`f && m && !/^>/`) that gated
the exit on the OPTIONAL `### Missed surfaces` heading with the section-agnostic
terminator `f && !/^>/`, matching the reviewer fixture. The extraction now stops
at the first non-blockquote line regardless of which section ends the example.
Proven: with a synthetic agent file that omits Missed-surfaces, the new awk stops
at the blockquote end and does NOT swallow the trailing "Word count breakdown:"
prose or any trailing fragment-grammar-shaped line (which previously inflated the
count). Self-extract still parses 6 findings with missed_surfaces 11w (later 10w
after WR-02); `--self-test` still exits non-zero.

### CR-02: `--from-trace` does not normalize CRLF

**Files modified:** `tests/D-reviewer-budget.sh`, `tests/D-security-reviewer-budget.sh`
**Commit:** 2ecf8d5
**Applied fix:** Replaced `cat "$TRACE_FILE"` with `tr -d '\r' < "$TRACE_FILE"`
in the `from-trace` branch of both fixtures, normalizing CRLF -> LF once at the
source so every downstream consumer (the bash `read` loop AND the awk section
extractors) sees LF-only text. The trace path still never eval/sources the file
(T-11-01 preserved). Proven end-to-end: a CRLF-terminated trace (18 CRs reviewer,
17 CRs security) now parses identically to the LF self-extract -- 7/6 findings,
same word counts, exit 0.

### WR-01: Anti-vacuous guard failure does not short-circuit the budget loop

**Files modified:** `tests/D-reviewer-budget.sh`, `tests/D-security-reviewer-budget.sh`
**Commit:** f159ddf
**Applied fix:** Inverted the guard to exit non-zero immediately when
`matched_count < MIN_FINDINGS`, emitting a loud FAIL plus
`Status: [FAIL] -- anti-vacuous guard fired; skipping budget checks` BEFORE the
per-finding and section budget checks run. This removes the spurious green
`[PASS]` budget lines that a too-few-findings parse used to emit. Proven: a
2-finding `--from-trace` input now exits 1 with only the FAIL line and no budget
PASS lines, in both fixtures. Self-extract (7/6 findings) skips the short-circuit
and stays green; `--self-test` still exits non-zero.

### WR-02: Surviving bare `>` blockquote markers are counted as words

**Files modified:** `tests/D-reviewer-budget.sh`, `tests/D-security-reviewer-budget.sh`
**Commit:** 6eb30aa
**Applied fix:** Changed every blockquote-strip site from `sed -e 's/^> //'` to
`sed -E 's/^> ?//'` (optional space) -- the `get_report` strip in both fixtures
and the two section-body strips in the reviewer fixture. Bare `>` separator lines
now strip to empty and contribute 0 to `wc -w`. Proven by the expected word-count
drop: reviewer Cross-Cutting 65 -> 63 and Missed surfaces 18 -> 17; security
threat_patterns 62 -> 60 and missed_surfaces 11 -> 10. Both fixtures stay green;
`--self-test` still exits non-zero.

### WR-03: `extract_section` exact-match `$0 == h` is brittle to heading drift

**Files modified:** `tests/D-security-reviewer-budget.sh`
**Commit:** 880ee88
**Applied fix:** Reworked `extract_section` to match the heading by a tolerant
anchored regex (`$0 ~ pat`, callers pass `^### Threat Patterns` /
`^### Missed surfaces`) instead of byte-exact `$0 == h`, and added an explicit
presence pre-check for the REQUIRED `### Threat Patterns` heading
(`awk ... END{exit !found}`, mirroring the reviewer fixture). A missing/renamed
required heading now FAILs loudly instead of zeroing the body into a vacuous pass.
Proven both ways via `--from-trace`: a renamed `### Threat Analysis` heading
produces a loud non-zero FAIL; a `### Threat Patterns (cross-finding)` heading
with a trailing parenthetical is tolerantly matched and passes. The anchored
`^### Missed surfaces` also now matches the example's `(optional)` suffix without
requiring the literal parenthetical.

### WR-04: Reviewer Missed-surfaces range is unbounded to EOF

**Files modified:** `tests/D-reviewer-budget.sh`
**Commit:** 2924b5b
**Applied fix:** Bounded the Missed-surfaces awk range at the next `### ` heading
(`/^### Missed surfaces/{m=1;next} m && /^### /{m=0} m`) instead of running to
EOF, mirroring the security fixture's `extract_section`. Any later section in a
`--from-trace` input is no longer swallowed into the Missed-surfaces word count.
Proven: a trace with a long `### Some Future Section` after Missed-surfaces now
counts Missed-surfaces at 5w (bounded) rather than absorbing the ~35-word future
block and spuriously failing the 30w cap. Self-extract Missed-surfaces is
unchanged at 17w (it is the last section there).

### WR-05: Severity alternation duplicated across match regex and strip sed

**Files modified:** `tests/D-reviewer-budget.sh`, `tests/D-security-reviewer-budget.sh`
**Commit:** a607904
**Applied fix:** Defined the severity alternation once as `SEV='(crit|imp|sug|q)'`
in each fixture and interpolated it into both the `FRAGMENT_RE` match and the
body-strip sed, so a future severity-set change cannot make the count regex and
the strip diverge (which would silently leave the severity token in the body and
inflate `wc -w`). Switching the interpolated patterns to double-quoted form
required escaping the literal backtick as `` \` `` to prevent bash command
substitution (per the platform shell rules). Proven: identical finding counts and
per-entry word counts in both fixtures, including the security 36w auto-clarity
body (the CVE token is still retained and only prefix + OWASP tag stripped).
Both fixtures stay green; `--self-test` still exits non-zero.

## Skipped Issues

None. All 7 in-scope findings (2 Critical, 5 Warning) were fixed and committed.

The 3 Info findings (IN-01, IN-02, IN-03) were out of scope (`fix_scope:
critical_warning`). Note on IN-01 (cross-file symmetry): every multi-file fix
(CR-02, WR-01, WR-02, WR-05) was applied symmetrically to both fixtures, and a
post-fix `git diff --no-index` confirmed the shared logic (guard, `MIN_FINDINGS`,
`tr -d`, `SEV`, short-circuit) is identical apart from the intended 3-slot vs
4-slot differences and pre-existing comment wording.

---

_Fixed: 2026-06-07_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
