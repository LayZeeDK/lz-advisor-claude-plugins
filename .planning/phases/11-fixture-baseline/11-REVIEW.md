---
phase: 11-fixture-baseline
reviewed: 2026-06-07T00:00:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - tests/D-reviewer-budget.sh
  - tests/D-security-reviewer-budget.sh
findings:
  critical: 2
  warning: 5
  info: 3
  total: 10
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-06-07
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Two new standalone bash smoke fixtures parse the fragment-grammar holistic worked
examples self-extracted from `reviewer.md` (3-slot) and `security-reviewer.md`
(4-slot + OWASP `[Axx]` + 75w CVE/GHSA/CWE auto-clarity carve-out). Both are green
on HEAD in default mode and exit non-zero in `--self-test`, the anti-vacuous
`matched_count >= 5` guard runs before the budget loop, the `--from-trace` path
quotes `"$TRACE_FILE"` (no eval/source -- T-11-01 verified against a
`$(whoami)`-laced filename), and output is ASCII-only.

The contract surface is satisfied, but adversarial probing surfaced two
correctness defects that make the gate **vacuous or spurious precisely in the two
scenarios this phase exists to guard against**: (1) the security fixture's
`get_report` over-reads when the OPTIONAL `### Missed surfaces` section is absent
from the example -- a near-certainty when Phase 12 rewrites the grammar -- and
(2) neither fixture normalizes CRLF in `--from-trace` mode, which on this Windows
host either corrupts finding-body word spans or (with a non-Cygwin awk) silently
zeroes the section-budget checks into a vacuous pass. Phase 13 will feed live
traces into exactly that mode. Five further warnings concern silent-pass surfaces
(unbounded section ranges, surviving blockquote markers inflating counts, a
non-anchored severity alternation, exact-match heading extraction).

The fixtures are well-commented, follow the `validate-phase-03.sh` house style,
and the self-test inversion is correctly modelled. Findings below are ordered to
front-load the two ways the gate fails to do its job.

## Critical Issues

### CR-01: Security `get_report` swallows all trailing prose when `### Missed surfaces` is absent (vacuous/spurious gate)

**File:** `tests/D-security-reviewer-budget.sh:75-82`
**Issue:** The self-extract range terminates only when BOTH `f` (Findings seen)
AND `m` (Missed-surfaces seen) are set:
```awk
/^> ### Findings$/        { f = 1 }
f && /^> ### Missed surfaces/ { m = 1 }
f && m && !/^>/           { exit }
f                         { print }
```
`### Missed surfaces` is documented OPTIONAL (`security-reviewer.md:159`,
`<section ... optional="true">` at line 182). When the holistic example omits it,
`m` never sets, the `exit` never fires, and the awk reads to EOF -- swallowing the
"Word count breakdown:" paragraph and every subsequent line of the agent file into
the extracted report. The block comment at lines 67-71 ("stops at the first
non-blockquote line AFTER the Missed-surfaces heading") describes behavior that
only holds because the *current* example happens to end with Missed-surfaces.

Verified consequence: with Missed-surfaces removed from a synthetic agent file, the
trailing prose lands inside the `### Threat Patterns` body (it follows the last
`### ` heading), inflating `threat_patterns` word count without bound. A
sufficiently long trailing paragraph produces a **spurious FAIL**; trailing lines
shaped like fragment grammar would inflate `matched_count` (**vacuous pass / wrong
count**). The reviewer fixture is NOT affected -- its exit is `f && !/^>/`
(`tests/D-reviewer-budget.sh:98`), firing on the first non-blockquote line
regardless of section. This asymmetry is the bug: the security fixture should use
the same section-agnostic terminator.

**Fix:** Terminate on the first non-blockquote line after Findings, exactly like
the reviewer fixture -- do not gate the exit on the optional Missed-surfaces
heading:
```awk
/^> ### Findings$/ { f = 1 }
f && !/^>/         { exit }
f                  { print }
```

### CR-02: `--from-trace` does not normalize CRLF -- vacuous section budgets or corrupted finding spans on Windows traces

**File:** `tests/D-reviewer-budget.sh:101-103`, `tests/D-security-reviewer-budget.sh:83-84`
**Issue:** `--from-trace` does `cat "$TRACE_FILE"` with no CRLF stripping. Phase 13
supplies live traces and the host is Windows 11 / Git Bash, so CRLF-terminated
trace files are the expected case, not an edge case. Two failure modes were
verified:

1. The bash `while IFS= read -r line` finding loop does NOT strip `\r`. A CRLF
   trace leaves a trailing `\r` in every finding body: `s/\`$//`
   (`:137` / `:118`) fails to remove a backtick that sits before the `\r`, and the
   `\r` becomes part of the counted `wc -w` span -- corrupting the per-finding
   budget body and the auto-clarity `[[ =~ \[(CVE|GHSA|CWE) ]]` token match if the
   token is line-terminal.

2. Section extraction is split between two engines with opposite CR behavior. The
   security fixture's `extract_section` uses awk exact-match `$0 == h`
   (`:177`); on this Cygwin gawk build CR is auto-stripped from `$0` (verified:
   `length("### Threat Patterns\r\n") == 19`), so headings happen to match HERE --
   but on mawk / BusyBox awk / a non-text-mode awk the `\r` survives, `$0 == h`
   fails, `in_sec` never sets, and the section budget is computed over an EMPTY
   body: a **silent vacuous pass** on `threat_patterns` and `missed_surfaces` for
   every CRLF trace. The portability of the whole gate rests on an undocumented
   awk-build quirk.

The net result is an engine-dependent gate: bash sees the `\r`, awk (on this host)
does not. That inconsistency is the defect regardless of which awk ships.

**Fix:** Strip CR once, at the source, so every downstream consumer sees LF-only
text. In `get_report` (or immediately after `REPORT="$(get_report)"`):
```bash
from-trace)
  # Normalize CRLF -> LF; never eval/source the trace (T-11-01).
  tr -d '\r' < "$TRACE_FILE"
  ;;
```
Apply the same `tr -d '\r'` to the self-extract and self-test branches (or to
`REPORT` after assignment) so all three modes are CR-safe.

## Warnings

### WR-01: Anti-vacuous guard failure does not short-circuit the budget loop

**File:** `tests/D-reviewer-budget.sh:167-172`, `tests/D-security-reviewer-budget.sh:144-149`
**Issue:** When `matched_count < MIN_FINDINGS` the guard records a `fail` but
execution continues into the per-finding loop and the section budget checks. On a
0-finding parse those downstream checks emit `[PASS]` lines ("Cross-Cutting
Patterns budget: 2 <= 160", "Missed surfaces section absent ... no budget check"),
producing a mixed `2/3 passed` report that reads as mostly-green even though the
gate is fundamentally broken (parser matched nothing). The overall exit is
correctly non-zero, so this is not a missed failure -- but the green PASS lines on
a vacuous parse are exactly the "silent-pass" signal the D-06 echo is meant to make
loud, and they muddy the diagnostic. A reviewer skimming the tail sees passes.

**Fix:** After the guard fails on too-few findings, exit non-zero before running
budget checks that cannot be meaningful:
```bash
if [ "$matched_count" -lt "$MIN_FINDINGS" ]; then
  fail "anti-vacuous: only $matched_count findings parsed (need >= $MIN_FINDINGS)" \
    "FRAGMENT_RE matched too few findings -- gate would be vacuous"
  echo "Status: [FAIL] -- anti-vacuous guard fired; skipping budget checks"
  exit 1
fi
pass "anti-vacuous: matched_count $matched_count >= $MIN_FINDINGS"
```

### WR-02: Surviving bare `>` blockquote markers are counted as words, inflating every section budget

**File:** `tests/D-reviewer-budget.sh:194,209`, `tests/D-security-reviewer-budget.sh:81`
**Issue:** The blockquote strip is `sed -e 's/^> //'` -- it only removes `> `
(angle-bracket + space). The agent files use bare `>` (no trailing space) for
blank blockquote separator lines (verified: `reviewer.md` and
`security-reviewer.md` blockquote blanks are `>` not `> `). Those bare `>` lines
survive normalization and `wc -w` counts each surviving `>` as a word. The
Cross-Cutting / Threat-Patterns bodies each pick up 2 stray `>` words, and
per-finding bodies are unaffected only because findings are not blank lines.
Current margins (65/160, 62/160) absorb it, but the counted span is wrong by a
fixed offset, which silently erodes the real budget headroom and will mis-report
once Phase 12 changes section lengths.

**Fix:** Strip the bare-`>` form too, e.g. `sed -E 's/^> ?//'` (optional space) in
all three strip sites, or filter blank-blockquote lines before counting.

### WR-03: `extract_section` exact-match `$0 == h` is brittle to any heading drift

**File:** `tests/D-security-reviewer-budget.sh:174-181`
**Issue:** Section bodies are located by `$0 == "### Threat Patterns"` /
`$0 == "### Missed surfaces (optional)"` -- byte-exact equality. Any Phase 12
heading tweak (trailing space, a different parenthetical, a casing change, or the
CR case in CR-02) makes the match silently fail, `in_sec` never sets, and the
budget is computed over an empty body = vacuous pass. Exact-match section
extraction is the single most fragile primitive in either fixture for a phase whose
explicit job is to survive a grammar rewrite. The reviewer fixture's regex-prefix
approach (`/^### Cross-Cutting Patterns$/`, `/^### Missed surfaces/`) is more
tolerant but still anchored.

**Fix:** Match the heading by a tolerant anchored regex and assert presence of the
required headings explicitly so a missing/renamed heading FAILS loudly rather than
zeroing the body:
```awk
$0 ~ /^### Threat Patterns/ { in_sec = 1; next }
```
plus a pre-check that the required `### Threat Patterns` heading exists at all
(mirror the reviewer fixture's `awk ... END{exit !found}` pattern at `:212`).

### WR-04: Reviewer Missed-surfaces range is unbounded to EOF -- swallows any later section in `--from-trace`

**File:** `tests/D-reviewer-budget.sh:206-210`
**Issue:** `awk '/^### Missed surfaces/{m=1;next} m'` prints from the heading to the
END of the report with no terminating heading. In self-extract this is safe
(Missed-surfaces is the last section emitted). In `--from-trace`, any content after
Missed-surfaces -- a future `### Per-finding validation` block, an appended section,
or trailing trace metadata -- is swallowed into the Missed-surfaces word count
(verified: a trailing `### Some Future Section` was pulled into the body). With a
30w cap this readily produces a spurious FAIL on otherwise-valid traces.

**Fix:** Bound the range at the next `### ` heading, mirroring the security
fixture's `extract_section`:
```awk
/^### Missed surfaces/ { m = 1; next }
m && /^### /           { m = 0 }
m                      { print }
```

### WR-05: Severity alternation lacks a word boundary -- can over-match malformed input

**File:** `tests/D-reviewer-budget.sh:121,137`, `tests/D-security-reviewer-budget.sh:99,118`
**Issue:** `FRAGMENT_RE` uses `(crit|imp|sug|q): ` with no boundary before the
alternation, and the body-strip sed repeats the same alternation. The colon+space
anchor mostly contains it, but the grammar slot is positional, not lexical -- a
future severity token that is a prefix/superset (e.g. a hypothetical `q` vs
`question`, or `imp` vs `important`) would match the shorter form first and
mis-slice the body. More immediately, because the count regex and the strip sed
duplicate the full pattern in two places (`:121` vs `:137`, `:99` vs `:118`), any
Phase 12 severity-set change must be edited in both spots or the count and the
body-span silently diverge (count matches, strip leaves the severity token in the
body, inflating `wc -w`). This is a maintainability/correctness coupling, not a
live bug on HEAD.

**Fix:** Define the severity alternation once as a variable
(`SEV='(crit|imp|sug|q)'`) and interpolate it into both the match and the strip, so
they cannot drift. Consider anchoring the body terminus on `: ` only after the
severity token to make the slot lexical.

## Info

### IN-01: Duplicated parser logic across two near-identical files (no shared lib by design)

**File:** `tests/D-reviewer-budget.sh` / `tests/D-security-reviewer-budget.sh` (whole-file)
**Issue:** The two fixtures share ~80% of their structure (mode dispatch, guard,
pass/fail helpers, summary). D-10 mandates standalone zero-dependency scripts (no
shared helper lib), so duplication is an accepted constraint -- but it means every
fix above (CR-01, CR-02, WR-02, WR-03, WR-05) must be applied to both files and
kept in sync manually. Flagging so the fixer applies changes symmetrically.
**Fix:** When applying fixes, diff the two files afterward to confirm the shared
logic stayed identical except for the intended 3-slot vs 4-slot differences.

### IN-02: Self-test synthetic inputs differ in shape between the two fixtures

**File:** `tests/D-reviewer-budget.sh:106`, `tests/D-security-reviewer-budget.sh:87`
**Issue:** The reviewer self-test emits a fuller zero-finding doc (`### Findings` +
`No findings.` + `### Cross-Cutting Patterns` + a sentence); the security self-test
emits a terser `### Findings\n\n### Threat Patterns\nNo findings.\n`. Both correctly
trip the guard, but the divergence is gratuitous and the security one omits the
blank line the agent contract requires after `### Findings`. Harmless to the assert
(0 findings either way) but inconsistent.
**Fix:** Align the two self-test fixtures to the same minimal shape for parity.

### IN-03: `[CVE-...]` token remains in the auto-clarity body and is word-counted

**File:** `tests/D-security-reviewer-budget.sh:113-119,158`
**Issue:** The body-strip removes only the FIRST `[<tag>] ` (the OWASP `[A06] `),
intentionally leaving `[CVE-2025-1234]` in the body so the `[[ =~ \[(CVE|GHSA|CWE) ]]`
carve-out can detect it (verified correct -- 36w body lands under the 75w cap). The
identifier token is then counted toward the 75w span. This is by design and within
budget; noting only that the 75w cap silently includes the identifier length, so an
unusually long GHSA/advisory string eats into the carve-out budget.
**Fix:** None required; documented for awareness. If Phase 12 lengthens advisory
strings materially, re-validate the 75w headroom.

---

_Reviewed: 2026-06-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
