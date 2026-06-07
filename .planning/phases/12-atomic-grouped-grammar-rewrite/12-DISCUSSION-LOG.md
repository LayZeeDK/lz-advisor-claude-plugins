# Phase 12: Atomic grouped-grammar rewrite - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 12-atomic-grouped-grammar-rewrite
**Mode:** `--auto --analyze --chain` (fully autonomous; every option auto-selected to the recommended default; trade-off tables logged for the audit trail; auto-advancing to plan-phase)
**Areas discussed:** Section structure and headers, Empty sections, Finding line shape and numbering, Machine lexicon vs display labels, Word-budget re-scoping, Fixture retarget, Atomicity

---

## Section structure and headers (D-01, D-02, D-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Replace `### Findings` with four top-level `###` severity sections | The four `### Critical`..`### Questions` headers sit at `###`, replacing the single `### Findings` header | [X] |
| Nest severities as `####` under a `### Findings` umbrella | Keeps the `### Findings` header; severities become sub-headers | |
| Inline labels in place (no sections) | Rejected upstream -- the milestone locked section-per-severity | |

**Auto-selected:** Replace `### Findings` with four top-level `###` severity sections.
**Notes:** Success criterion 1 specifies top-level `### Critical`...`### Questions` headlines; nesting contradicts it and complicates the fixture parser. Fixed order Critical -> Important -> Suggestions -> Questions (plural per criterion-1 wording). `### Cross-Cutting Patterns` (reviewer) and `Threat Patterns` + `Per-finding validation` (security) preserved after the severity sections, referencing findings by continuous number.

---

## Empty sections (D-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Always emit all four headers; `(none)` under empty ones | Constant report shape; deterministic parser | [X] |
| Omit headers for empty severities | Shorter report, but variable shape; ordinal refs and parser get harder | |

**Auto-selected:** Always emit all four headers; literal `(none)` line under empty ones.
**Notes:** Directly satisfies RPT-04. Constant shape keeps the fixture parser deterministic.

---

## Finding line shape and numbering (D-05, D-06, D-07)

| Option | Description | Selected |
|--------|-------------|----------|
| Drop inline severity token; leading continuous integer `N.`; header carries severity | `N. <path>:<line>: <body>` (review); `N. <path>:<line>: [Axx] <body>` (security) | [X] |
| Keep a redundant spelled-out inline `Critical:` label too | Doubles the severity signal; hurts scannability and budget | |
| Per-section numbering restart | Makes "Findings 1, 2, 4" ambiguous (violates RPT-03) | |
| Severity-prefixed IDs (`CRIT-1`) | This is the deferred RPT-F03; out of scope | |

**Auto-selected:** Drop inline severity; continuous integer numbering in document order across all sections; OWASP `[Axx]` preserved immediately after location for security.
**Notes:** This is the linchpin decision -- it defines the target the fixture FRAGMENT_RE must be rebuilt around. The `<problem>. <fix>.` body grammar is unchanged (no paraphrase, render-verbatim preserved).

---

## Machine lexicon vs display labels (D-08)

| Option | Description | Selected |
|--------|-------------|----------|
| Title-Case only display headers; `severity=` XML attr stays lowercase | Per-surface disposition table classifies each `git grep` hit | [X] |
| Title-Case everywhere incl. `severity=` attribute | Breaks the machine lexicon; AGNT-03 forbids it | |

**Auto-selected:** Display surfaces -> Title-Case grouped headers; `<verify_request severity="...">` stays lowercase `critical|important|suggestion`; frozen `.planning/` history untouched.
**Notes:** SYNC-01's per-surface disposition table must distinguish (a) display label, (b) machine attribute, (c) leave-as-history. Phase 9 precedent for the history exclusion.

---

## Word-budget re-scoping (D-09)

| Option | Description | Selected |
|--------|-------------|----------|
| Map per-fragment sub-caps 1:1 to per-section sub-caps; aggregate unchanged | Old `crit` cap -> Critical section cap, etc. | [X] |
| Drop sub-caps, keep only the aggregate cap | Loosens per-severity discipline | |

**Auto-selected:** 1:1 per-section sub-caps; aggregate cap identical.
**Notes:** AGNT-02 requires aggregate budget intent unchanged. Header tokens + `(none)` are budget-noise. Do NOT reason about neutrality -- Phase 13 measures it empirically (n>=3); the project has been burned 3x assuming budget-neutrality.

---

## Fixture retarget (D-10)

| Option | Description | Selected |
|--------|-------------|----------|
| Header-tracking + numbered-line parser; RED on old / GREEN on new; same atomic unit | Track current `### Severity`, count `N.` lines beneath; security asserts `[Axx]` | [X] |
| Leave fixtures on the old FRAGMENT_RE | Gate would fail to parse the new grammar -- breaks the regression contract | |
| Retarget fixtures in a later phase | Violates SYNC-01 lockstep requirement | |

**Auto-selected:** Header-tracking parser, RED-then-GREEN, committed in the same atomic unit, anti-vacuous `matched_count >= min` guard preserved.
**Notes:** Reuses the Phase 11 `--self-test` / `--from-trace` scaffolding; only the parser and embedded sample change.

---

## Atomicity (D-11)

| Option | Description | Selected |
|--------|-------------|----------|
| One atomic unit: both agents + both skills + context-packaging + both fixtures + 5-surface version bump | Every legend, all 8+ worked examples, all contracts change together | [X] |
| Incremental rollout across multiple commits/phases | LLMs follow examples over rules -> mixed output (the Phase 7 WR-05 scar) | |

**Auto-selected:** One atomic unit; also strip `(formerly High)`/`(formerly Medium)` residue in `security-reviewer.md:66-67`.
**Notes:** Few-shot drift risk is the documented WR-05 failure mode -- a partial rewrite yields mixed shorthand/spelled-out output. AGNT-01 forbids a third generation of "formerly X" residue.

---

## Claude's Discretion

- Exact per-section word-budget numbers (planner derives from existing per-fragment caps; aggregate must stay identical).
- Exact phrasing/placement of the `(none)` line (bare `(none)` on its own line is the recommended default).
- Whether the new fixture sample is hand-authored or self-extracted from the rewritten agent worked examples (self-extraction is the Phase 11 default).
- Whether the README "What's New" changelog edit counts toward the "5-surface" tally or is a separate edit (historically: 5 surfaces = plugin.json + 4 SKILL.md `version:` fields).

## Deferred Ideas

- **RPT-F01** -- per-severity roll-up count line. Future milestone.
- **RPT-F02** -- severity/kind axis separation (Question as a kind). Future milestone.
- **RPT-F03** -- stable severity-prefixed finding IDs (`CRIT-009`). Future milestone.
- **research-rtk-command-suitability-for-skills-and-agents** (todo, matched score 0.6) -- reviewed and NOT folded: orthogonal RTK-tooling research, scope creep against this atomic grammar-only phase. Deliberate deviation from the `--auto` >=0.4 auto-fold heuristic. Remains pending for a future tooling phase.
