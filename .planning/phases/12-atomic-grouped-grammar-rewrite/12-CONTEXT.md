# Phase 12: Atomic grouped-grammar rewrite - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

> Captured autonomously via `/gsd-discuss-phase 12 --auto --analyze --chain`.
> Every implementation decision below was auto-resolved to the recommended
> option; the full trade-off tables are in `12-DISCUSSION-LOG.md`. The
> WHAT/WHY is already locked in REQUIREMENTS.md (4 milestone decisions, 10
> requirements) and is NOT re-litigated here per the locked-decisions rule.

<domain>
## Phase Boundary

Rewrite both review agents, both review-skill render-verbatim contracts, the
context-packaging severity surfaces, and both budget fixtures so that findings
are emitted grouped under **fully spelled-out severity headlines** (`### Critical`
/ `### Important` / `### Suggestions` / `### Questions`) instead of the
`crit:`/`imp:`/`sug:`/`q:` fragment-grammar shorthands -- all in ONE atomic
unit, with the fixtures retargeting in lockstep and the 5-surface
`1.0.0 -> 1.0.1` version bump landing in the same change.

**In scope:** the grouped-header grammar (legend + every worked example), the
skill output-shape rules (invert the "do not reformat into severity groups"
prohibition), `(none)` empty-section markers, continuous finding numbers, OWASP
`[Axx]` preservation, word-budget sub-cap re-scoping, fixture parser retarget,
and the version bump.

**Out of scope (defined boundary, not gray area):** Route B skill-layer label
expansion; reverting security-review to Critical/High/Medium; numeric scores;
emoji markers; expanding the vocabulary; severity-column tables; paraphrasing
finding bodies; per-severity roll-up counts (RPT-F01); severity/kind axis split
(RPT-F02); severity-prefixed finding IDs like `CRIT-009` (RPT-F03). The
empirical UAT + residue sweep is Phase 13, not this phase.

</domain>

<decisions>
## Implementation Decisions

These are the HOW-level choices this discussion resolved. The WHAT/WHY (Route A
agent-emit, section-per-severity layout, unified Critical/Important/Suggestion/
Question vocabulary, `1.0.0 -> 1.0.1`) are locked upstream in REQUIREMENTS.md
and PROJECT.md -- do not re-open them.

### Section structure and headers
- **D-01:** The single `### Findings` header is **replaced** by four top-level
  `###` severity sections at the same heading level -- NOT nested as `####`
  under a `### Findings` umbrella. Success criterion 1 specifies top-level
  `### Critical` ... `### Questions` headlines; nesting would contradict it and
  complicate the fixture parser. The skills' render-verbatim contract updates
  its expected literal headers from `### Findings` to the four severity headers
  (this IS what SKILL-01 mandates).
- **D-02:** Fixed section order: `### Critical` -> `### Important` ->
  `### Suggestions` -> `### Questions`. Plural "Suggestions"/"Questions" per
  the success-criterion-1 wording. Order is invariant so continuous numbering
  and ordinal cross-references are deterministic.
- **D-03:** The trailing analytical sections are preserved AFTER the four
  severity sections: `### Cross-Cutting Patterns` (reviewer), and
  `Threat Patterns` + `Per-finding validation` (security-reviewer). They
  reference findings by the continuous number (D-06), not by re-stating
  severity.

### Empty sections
- **D-04:** All four section headers are **always emitted**, in fixed order,
  even when a severity has zero findings. An empty section contains a single
  literal `(none)` line (RPT-04). This keeps the report shape constant and the
  fixture parser deterministic.

### Finding line shape (the linchpin -- locks the fixture retarget target)
- **D-05:** The inline severity token is **dropped** from each finding line --
  the section header is the single source of severity. No redundant inline
  `Critical:` label (would double the signal, hurt scannability, and waste
  budget). This is the change the fixture FRAGMENT_RE must be rebuilt around.
- **D-06:** Findings carry **continuous integer numbers** (`1.`, `2.`, `3.` ...),
  continuous and unique across the whole response. Per-section restart is
  rejected -- it makes "Findings 1, 2, 4" ambiguous (RPT-03). Severity-prefixed
  IDs (`CRIT-1`) are the deferred RPT-F03 and out of scope.
  **(Reconciled 2026-06-07 during Phase 12 code review, WR-03):** numbering is
  assigned in **curation order** (the order findings were discovered), and the
  number travels WITH the finding into whichever severity section it belongs --
  so a section's rendered numbers need not be contiguous or ascending (e.g.
  Critical may hold findings 1, 2, 5). The original "document order, Critical
  first" wording was dropped because it fought the model's natural curation-order
  numbering (a few-shot-drift risk) and the worked examples already demonstrated
  curation order; RPT-03's unambiguous-cross-reference requirement holds either
  way since every number is unique.
- **D-07:** Review finding line: `N. <path>:<line[-range]>: <problem>. <fix>.`
  Security finding line: `N. <path>:<line>: [Axx] <problem>. <fix>.` -- the
  OWASP `[Axx]` tag stays immediately after the location, before the body,
  preserved verbatim (RPT-02). The `<problem>. <fix>.` body grammar is
  unchanged from the fragment grammar (no paraphrase).

### Machine lexicon vs display labels (per-surface disposition)
- **D-08:** Only **display** surfaces become Title-Case grouped headers. The
  `<verify_request severity="...">` XML attribute in `context-packaging.md`
  stays **lowercase machine-lexicon** (`critical|important|suggestion`) --
  unchanged (AGNT-03). SYNC-01's per-surface disposition table must classify
  every `git grep` hit as: (a) display label -> rename to grouped header;
  (b) machine attribute -> leave lowercase canonical; (c) frozen `.planning/`
  history -> leave untouched (Phase 9 precedent).

### Word budget
- **D-09:** Re-scope the existing per-fragment sub-caps to **per-section
  sub-caps**, mapped 1:1 (old `crit` cap -> Critical section cap, etc.); the
  aggregate cap is unchanged (AGNT-02). Header tokens + `(none)` markers are
  budget-noise. Do NOT reason about neutrality -- Phase 13 measures it
  empirically (n>=3); the project has been burned 3x assuming budget-neutrality.

### Fixture retarget (lockstep, same unit)
- **D-10:** Replace the `FRAGMENT_RE` inline-severity regex in both fixtures
  with a **header-tracking + numbered-line parser**: track the current
  `### Severity` header, count `N.`-prefixed finding lines beneath it (security
  also asserts the `[Axx]` bracket). The retarget must be RED on the old
  shorthand sample and GREEN on a new grouped sample, committed in the SAME
  atomic unit (SYNC-01). The anti-vacuous `matched_count >= min` guard is
  preserved.

### Atomicity (the WR-05 few-shot-drift scar)
- **D-11:** Everything lands in ONE atomic unit: both agent legends + every
  worked example (8+ examples incl. holistic, Hedge Marker, verify_request
  tokens), both skills' output-shape rules, `context-packaging.md` display
  surfaces, both fixtures, and the 5-surface version bump. LLMs follow worked
  examples over stated rules -- a partial rewrite yields mixed output (the
  documented Phase 7 WR-05 failure). Also strip the `(formerly High)` /
  `(formerly Medium)` residue annotations in `security-reviewer.md:66-67` (no
  third generation of "formerly X" residue) (AGNT-01).

### Claude's Discretion
- Exact per-section word-budget numbers (planner derives from the existing
  per-fragment caps; aggregate must stay identical).
- Exact phrasing/placement of the `(none)` line within an empty section
  (a bare `(none)` on its own line is the recommended default).
- Whether the new grouped sample for the fixtures is hand-authored or
  self-extracted from the rewritten agent worked examples (Phase 11 fixtures
  self-extracted; same approach is the safe default).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked requirements and decisions
- `.planning/ROADMAP.md` -- Phase 12 entry: goal, 5 success criteria, requirement IDs (RPT-01..04, AGNT-01..03, SKILL-01, SYNC-01..02).
- `.planning/REQUIREMENTS.md` -- the 10 Phase 12 requirements (verbatim), the 4 locked milestone decisions table, the Out-of-Scope table, and the Future (deferred) RPT-F01/F02/F03.
- `.planning/PROJECT.md` -- "Current Milestone" context + Key Decisions (incl. the Phase 7 lexicon-unification history WR-01..WR-05).

### Agent grammar surfaces (rewrite targets)
- `plugins/lz-advisor/agents/reviewer.md` -- shorthand legend at lines 64-67; worked examples at lines 96-134; emits `### Findings` + `### Cross-Cutting Patterns`.
- `plugins/lz-advisor/agents/security-reviewer.md` -- shorthand legend at lines 65-68 (incl. `(formerly High)`/`(formerly Medium)` residue at 66-67); OWASP `[Axx]` worked examples at lines 100-141; the self-contained `## Class-2 Escalation Hook` section (must survive).

### Skill render-verbatim contracts (rewrite targets)
- `plugins/lz-advisor/skills/review/SKILL.md` -- `:165` literal-headers verbatim clause (`### Findings` + `### Cross-Cutting Patterns`); `:175` required-output-shape block; `:178` the "Reformat ... into severity groups" prohibition to INVERT; `:192-208` `<verify_request>` escalation flow (must survive).
- `plugins/lz-advisor/skills/security-review/SKILL.md` -- `:164` the same "Reformat ... into severity groups" prohibition to invert; its render-verbatim + verify_request flow.

### Consistency surface
- `plugins/lz-advisor/references/context-packaging.md` -- severity schema at `:290-291`; `<verify_request ... severity="<critical|important|suggestion>">` BNF at `:378`, the `severity` attribute doc at `:390`, worked example at `:402` (these XML attrs stay lowercase machine-lexicon per D-08).

### Regression gates (retarget in lockstep)
- `tests/D-reviewer-budget.sh` -- 3-slot `SEV='(crit|imp|sug|q)'` + `FRAGMENT_RE` at `:131-132`; anti-vacuous guard at `:185`.
- `tests/D-security-reviewer-budget.sh` -- 4-slot `FRAGMENT_RE` with OWASP bracket at `:107-108`; anti-vacuous guard at `:160`.

### Version-bump surfaces (5-surface atomic bump, SYNC-02)
- `plugins/lz-advisor/.claude-plugin/plugin.json` `version` field (`:3`).
- `plugins/lz-advisor/skills/{plan,execute,review,security-review}/SKILL.md` `version:` frontmatter (`:18`/`:19`).
- `plugins/lz-advisor/README.md` "What's New" changelog (`:79`) -- add the `1.0.1` entry (planner confirms whether this counts toward the "5-surface" tally or is a separate changelog edit; historically the 5 surfaces = plugin.json + 4 SKILL.md `version:` fields).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Phase 11 fixtures** (`tests/D-reviewer-budget.sh`, `tests/D-security-reviewer-budget.sh`): already carry `--self-test`, `--from-trace` replay, and anti-vacuous `matched_count >= 5` guards. The retarget reuses this scaffolding -- only the `FRAGMENT_RE` parser and the embedded sample change.
- **The fragment-grammar body shape** (`<path>:<line>: <problem>. <fix>.`): the body after the severity token is unchanged; only the severity carrier (inline token -> section header) and the leading number are new. Minimizes paraphrase risk.

### Established Patterns
- **Render-verbatim contract** (review/SKILL.md:165, security-review): the skill emits the agent response unchanged and only enumerates the literal headers that must reach the user. Inverting the "do not reformat into severity groups" clause means the NEW headers become the contracted literal headers -- the contract mechanism is preserved, only its expected header set changes.
- **Atomic 5-surface version bump**: established convention across 16 phases (plugin.json + 4 SKILL.md `version:` fields; README "What's New" updated alongside).
- **Per-surface disposition sweep** (Phase 9 precedent): operational surfaces change; ~362 frozen `.planning/` history artifacts are excluded from every sweep.

### Integration Points
- The reviewer/security-reviewer **Output Constraint sections** are where legend + format line live; the skills' **render-verbatim step** is where the user-facing shape is contracted; `context-packaging.md` is where the cross-agent severity schema + machine `severity=` attribute live. All three must agree (the "few-shot drift" risk -- WR-05 scar).
- Fixtures consume the agent worked examples (self-extracting parser); changing the examples without retargeting the parser breaks the gate -- hence the lockstep requirement.

</code_context>

<specifics>
## Specific Ideas

- Headers are exactly: `### Critical`, `### Important`, `### Suggestions`,
  `### Questions` (note the plural on Suggestions/Questions, per success
  criterion 1's literal wording).
- Empty-section marker is exactly the literal `(none)`.
- OWASP tag form is the existing `[Axx]` bracket (e.g. `[A02]`), preserved
  byte-for-byte after the location.
- ASCII-only throughout (no emoji/icon severity markers -- hard constraint;
  explicitly out of scope).

</specifics>

<deferred>
## Deferred Ideas

- **RPT-F01** -- per-severity roll-up count line ("Critical: 2, Important: 3").
  Cheap once grouping ships, but section length already carries the signal.
  Future milestone.
- **RPT-F02** -- severity/kind axis separation (reclassify `Question` as a
  kind, not a severity tier). Re-architects the vocabulary; future milestone.
- **RPT-F03** -- stable severity-prefixed finding IDs (`CRIT-009`) for durable
  cross-referencing across persisted reports. Future milestone (this phase uses
  continuous integers per D-06).

### Reviewed Todos (not folded)
- **research-rtk-command-suitability-for-skills-and-agents** (matched at score
  0.6 on superficial keyword overlap: skills/agents/verify/phase/git).
  **Reviewed and NOT folded** -- it is orthogonal RTK-tooling research (token
  savings of `rtk git diff` / `rtk gh pr diff` vs detail-loss in the review
  skills), unrelated to the severity-headline grammar. Folding it into this
  deliberately atomic, grammar-only phase would be scope creep against the
  phase's defining "one atomic unit" identity. (Deliberate deviation from the
  blanket `--auto` >=0.4 auto-fold heuristic, flagged here for the audit trail.)
  Remains a pending todo for a future tooling phase.

</deferred>

---

*Phase: 12-atomic-grouped-grammar-rewrite*
*Context gathered: 2026-06-07*
