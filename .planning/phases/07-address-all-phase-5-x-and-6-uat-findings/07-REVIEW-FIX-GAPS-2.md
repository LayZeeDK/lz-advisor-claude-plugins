---
phase: 07-address-all-phase-5-x-and-6-uat-findings
fixed_at: 2026-05-05T00:00:00Z
review_path: .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-REVIEW-GAPS-2.md
iteration: 1
findings_in_scope: 4
fixed: 3
skipped: 0
documented_as_known_hazard: 1
status: all_fixed
---

# Phase 07 Gap-Closure Wave 2: Code Review Fix Report

**Fixed at:** 2026-05-05T00:00:00Z
**Source review:** .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-REVIEW-GAPS-2.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4 (2 warnings + 2 info; user requested `--all` to include info-level)
- Fixed: 3 (WR-04, WR-05, IN-01)
- Documented as known hazard (no code fix exists): 1 (IN-02)
- Skipped: 0

All four findings closed. WR-04 and WR-05 ship as `fix(07):` commits; IN-01 ships as
`style(07):` per the scope_note's wording-polish framing. IN-02 is architectural-maintenance
informational; verification confirmed its mitigation is now fully in place after WR-04.

## Fixed Issues

### WR-04: Schema declaration still permits legacy `high|medium` severity values

**Files modified:** `plugins/lz-advisor/references/context-packaging.md`
**Commit:** 7f28903
**Applied fix:** Tightened the `<verify_request>` schema BNF allow-list on line 376 from
`severity="<critical|important|suggestion|high|medium>"` to `severity="<critical|important|suggestion>"`.
The schema now matches the field definition four lines below (line 388: "Critical / Important /
Suggestion"), the worked example on line 400 (severity="important"), and both agent-side schemas
at `reviewer.md:230` and `security-reviewer.md:239`. Single-character drift that the Wave-9 ship
missed; the BNF is the canonical contract, so a future agent reading line 376 alone could have
emitted `severity="medium"` legitimately. Closed.

### WR-05: Worked-example `Severity: High` in Verification Template demo

**Files modified:** `plugins/lz-advisor/references/context-packaging.md`
**Commit:** 5ea449f
**Applied fix:** Replaced `Severity: High` -> `Severity: Important` on line 317 inside the
"Worked Example (adapted from the successful security-review pattern)" Findings block. The
example shows the executor packaging an INITIAL severity assessment of a finding it surfaced
itself (Compodoc transitive-dep supply-chain risk), and the Findings template four lines below
on line 288 mandates the executor use `Critical / Important / Suggestion` for that field after
WR-02's lexicon alignment. The pre-WR-02 worked example contradicted the very template it was
supposed to illustrate. `Important` is the closest mapping for an exploitable-supply-chain risk
where defense-in-depth applies. The scope_note's alternative reading (executor packages
upstream legacy severity, security-reviewer reclassifies) was inconsistent with the demo --
the example is the executor's own surfacing, not a reclassification.

### IN-01: WR-01 paraphrased `Medium` -> `Suggestion` but kept `high-severity` -> `important-severity` pattern

**Files modified:** `plugins/lz-advisor/agents/security-reviewer.md`
**Commit:** f5af779
**Applied fix:** Rephrased the Hedge Marker Discipline carve-out on
`agents/security-reviewer.md:312`: "premature important-severity classification" ->
"premature classification as Important". The compound-modifier form that WR-01's mechanical
rename produced read less naturally than `high-severity` did (which is well-established in
security literature) -- once Important replaced High as the severity name, the adjective form
became awkward. The chosen rewrite mirrors the canonical noun-form usage elsewhere in the
documentation (`Critical / Important / Suggestion`), preserves the rule's meaning, and is
more concise than the alternative ("at the Important level"). The scope_note offered both
variants; "as Important" was selected for parsimony and parallelism with surrounding text.

## Documented as Known Hazard

### IN-02: WR-03 self-contained section duplicates ~40% of context-packaging.md "Verify Request Schema" content

**Files referenced:** `plugins/lz-advisor/agents/security-reviewer.md:232-258`,
`plugins/lz-advisor/agents/reviewer.md:230`, `plugins/lz-advisor/references/context-packaging.md:376`
**Status:** documented_as_known_hazard (no code fix exists)
**Verification:** The Wave-9 reviewer flagged that the WR-03 self-contained `## Class-2
Escalation Hook` section in `agents/security-reviewer.md` duplicates schema content from
`references/context-packaging.md`, introducing a future maintenance hazard: if the BNF in the
canonical reference file shifted, the agent-side sections would drift. The scope_note for this
fix wave required explicit verification that, after the WR-04 fix, the three schema surfaces
(`reviewer.md:230`, `security-reviewer.md:239`, `context-packaging.md:376`) are all aligned to
`severity="<critical|important|suggestion>"`.

Verified post-WR-04 via `git grep -n 'severity="<' -- plugins/lz-advisor/`:

```
plugins/lz-advisor/agents/reviewer.md:230:    severity="<critical|important|suggestion>"
plugins/lz-advisor/agents/security-reviewer.md:239: severity="<critical|important|suggestion>"
plugins/lz-advisor/references/context-packaging.md:376: severity="<critical|important|suggestion>"
```

All three surfaces in schema parity. IN-02's mitigation (touch all three together when the BNF
changes) was already implicitly satisfied by Wave-9 wiring the agent-side schemas tight while
context-packaging.md lagged; today's WR-04 fix closes the lag. Future schema changes must
continue to honor the three-surface touch contract -- recorded here for downstream awareness.
No code change for IN-02 itself; the architectural duplication remains by design (agent prompts
cannot resolve `${CLAUDE_PLUGIN_ROOT}/references/...` includes at runtime, so in-place
duplication is the only sound option).

## Skipped Issues

None.

## Cross-cutting Notes

- All three commits ship as targeted single-file edits with no cascading changes; no version
  bump (plugin remains at 0.12.2 per the seal). Per SemVer, internal-doc reference cleanup is
  not a user-visible behavioral change.
- Commit prefixes follow scope_note guidance: `fix(07):` for the warning-level fixes (WR-04,
  WR-05) and `style(07):` for the wording polish (IN-01). No `wip:` prefixes used.
- All commits are atomic (one finding per commit) and stage specific files only.
- Tier-1 verification (re-read modified section, confirm fix present, surrounding code intact)
  passed for all three fixes. Tier-2 syntax checks: not applicable -- all changes are markdown
  prose / fenced-block content with no executable syntax.
- Cross-cutting verification post-IN-01: `git grep "high-severity\|medium-severity\|important-severity\|suggestion-severity" -- plugins/lz-advisor/` returns zero matches in the agents/skills/references surface area. The single remaining match in `references/context-packaging.md:348` is `low-severity` / `medium-severity` inside a quoted historical verdict string ("two low-severity and one medium-severity finding") that is illustrative narrative explaining the Finding C hop 8b confidence-laundering failure mode -- not a current vocabulary token. Out of scope for IN-01.

---

_Fixed: 2026-05-05T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
