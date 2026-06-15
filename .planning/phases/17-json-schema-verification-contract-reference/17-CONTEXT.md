# Phase 17: JSON schema + verification contract reference - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning
**Mode:** `--auto --analyze --chain` (autonomous discuss; trade-off tables logged in DISCUSSION-LOG.md; auto-advances to plan-phase)

<domain>
## Phase Boundary

This phase delivers ONE thing: a single reference document --
`plugins/lz-advisor/references/lz-deep-research-schema.md` -- that FREEZES the data contract every
downstream component (Phase-18 eval harness + voter, Phase-19 search/extract workers, Phase-20
orchestrator + synthesis) must agree on BEFORE any agent is authored:

1. the JSON shapes for the four records -- **source**, **claim**, **vote**, and **stored-excerpt** --
   each consistent with what the Phase-16 aggregator (`lz-deep-research-aggregate.mjs`) already reads and writes;
2. the **tally rubric** mapping every possible vote tally to exactly one confidence level;
3. the **named-ceilings contract** (copied verbatim from the frozen `CEILINGS` block);
4. the **quote-recheck contract** (three-way outcome, normalized-substring match, lower-bound caveat);
5. the **two-assurance distinction** -- "quote verified verbatim" vs "claim supported by the quote" -- as
   two structurally SEPARATE fields.

It is a CONTRACT-WRITING (documentation) phase. It writes NO executable code and changes NO aggregator
behavior: the Phase-16 aggregator is the proven, FROZEN ground truth; this reference documents its shapes
verbatim and ADDS the report/synthesis-stage superset (the second assurance + the PIPE-07 report enum)
that the aggregator deliberately scope-fenced out.

**Requirements covered (from REQUIREMENTS.md / ROADMAP.md):** PIPE-07 (every reported claim carries a
confidence level: High / Medium / Low / Contested / Unsupported) and VERIF-06 (the report distinguishes
"quote verified verbatim" from "claim supported by the quote" as two separate assurances).

**In scope:** the frozen JSON shapes for source/claim/vote/excerpt + the aggregator's survivor and dropped
records; the tally rubric (tally -> confidence enum, downgrade-not-delete); the named-ceilings contract; the
quote-recheck contract; the two-assurance distinction; the aggregator-stage vs report/synthesis-stage record
relationship; the anti-drift discipline tying the doc to the executable aggregator.

**Out of scope (other phases):** the verify-voter agents + the pre-registered gating eval + the voter's
internal prompt fields' SEMANTICS (Phase 18 -- this phase only forward-declares their field names/types as a
reserved envelope); the search/extract workers that WRITE these files (Phase 19); the orchestrator skill,
the synthesis step that POPULATES the second assurance + report enum, `.lz-research/` gitignore, wave-batching,
and audit-trail retention (Phase 20). A machine-enforced formal JSON Schema (`$schema` + ajv) is OUT (zero-dep;
the aggregator's fail-closed `JSON.parse` + `ContractError` validation is the runtime enforcement; this doc is
the human/agent contract). Semantic/embedding dedup (v2, AGGX-01) remains excluded.

</domain>

<decisions>
## Implementation Decisions

> All five gray areas were auto-selected and auto-resolved under `--auto`; per `--analyze`, the trade-off
> table behind each decision is recorded in `17-DISCUSSION-LOG.md`. Every decision is grounded against the
> FROZEN Phase-16 aggregator (`lz-deep-research-aggregate.mjs`) + its `16-01-SUMMARY.md` output contract --
> not guessed.

### Confidence enum reconciliation (GA-1)
- **D-01:** The contract carries TWO stage-bound confidence vocabularies with a FROZEN mapping between them,
  because the aggregator's emitted labels and PIPE-07's report enum genuinely differ:
  - **Aggregator-stage `confidence`** (FROZEN VERBATIM from Phase 16; field is literally named `confidence` on
    `survivors.json`): one of `High | Medium | Low/Contested | Rejected | Unsupported`. This is the mechanical
    tally-rubric output and is documented exactly as the code emits it (including the COMBINED `Low/Contested`
    token and `Rejected`). The schema MUST NOT change this -- the aggregator is frozen and proven.
  - **Report-stage `report_confidence`** (NEW, PIPE-07-conformant): one of `High | Medium | Low | Contested |
    Unsupported` (Low and Contested SPLIT; no `Rejected`). Assigned at synthesis (Phase 20), not by the aggregator.
- **D-02:** The FROZEN tally-label -> report-level mapping:
  - `High` -> `High`; `Medium` -> `Medium`; `Unsupported` -> `Unsupported`.
  - `Low/Contested` -> `Contested` when a genuine cross-source contradiction / two-sided dissent exists
    (PIPE-08: Contested is first-class, never averaged away), otherwise `Low` (thin/weak corroboration, no
    contradiction).
  - `Rejected` (aggregator's `refuted >= 2`) -> **downgrade-not-delete** (ROADMAP SC-2): the claim is RETAINED
    in the report at `Unsupported` (or `Contested` if dissent is genuinely two-sided), and is dropped from the
    reported claim list / flagged-refuted ONLY on explicit, decisive refutation. "Refuted" is a downgrade signal,
    not an automatic delete.
- **D-03:** Keep BOTH fields on the report claim record (do not overwrite `confidence` in place): `confidence`
  preserves the raw mechanical tally label for the audit trail; `report_confidence` is the reader-facing level.
  This honors the project's observability-as-contract / audit-trail discipline.

### Two-assurance field shape (GA-2 / VERIF-06)
- **D-04:** The two assurances are TWO structurally separate, never-conflated fields:
  - **Assurance 1 -- "quote verified verbatim":** the aggregator's existing `quote_fidelity` field
    (`verified | downgraded`), MECHANICAL, aggregator-owned. Answers "is the quote a verbatim match against its
    cited stored excerpt?" (`verified` = present in cited excerpt; `downgraded` = present in some OTHER excerpt,
    real text / wrong attribution). FROZEN verbatim from Phase 16.
  - **Assurance 2 -- "claim supported by the quote":** a NEW field `claim_support` (enum
    `supported | partial | unsupported`, plus `unassessed` for not-yet-voted), a JUDGMENT owned by the
    voter/synthesis (Phase 18/20), NOT the aggregator. Answers "does the quoted text actually entail the claim?"
- **D-05:** `claim_support` is NEVER derived from or collapsed into `quote_fidelity`. A claim can be
  `quote_fidelity: verified` yet `claim_support: unsupported` (the quote is real and correctly attributed but
  does not support the claim) -- this is precisely the conflation VERIF-06 exists to prevent. The reference
  states this orthogonality with a worked example.

### Record-stage model -- aggregator record vs report claim record (GA-2 cont.)
- **D-06:** Two record STAGES are frozen so the frozen aggregator stays untouched:
  - **Aggregator survivor record** (frozen verbatim, written by `aggregate()` to `survivors.json`):
    `{ id, claim, sources[], corroboration_lower_bound, quote_fidelity, confidence }`.
  - **Report claim record** (NEW superset, assembled at synthesis -- Phase 20 -- by augmenting the survivor
    record): the survivor fields PLUS `claim_support` (assurance 2), `report_confidence` (PIPE-07 enum), and the
    inline `citation` (joined from the source record, PIPE-06). Every report claim record structurally carries a
    confidence-level field (SC-3) and both assurances (SC-4).

### Source-metadata record (GA-3 / SC-1 "source" record + PIPE-06)
- **D-07:** Freeze a dedicated **source record** at `sources/<source-id>.json` ->
  `{ id, url, title, fetched_at, ... }`, keyed by the SAME canonical source id used in `claims[].source` and
  `survivors[].sources[]`. The aggregator does NOT read it (corroboration counts the id only via a Set, D-08);
  it is the citation join the synthesis step uses for PIPE-06 (cite every claim inline to its source).
- **D-08:** The `source-id` is a canonicalized source key (canonical URL) so VERIF-03 source-independence
  ("N syndicated copies of one source count as one") has a stable, deterministic key. The reference defines the
  canonicalization rule at the contract level (the Phase-19 extract worker implements it).

### Vote record -- frozen aggregator subset + reserved voter envelope (GA-4 / SC-1 "vote" record)
- **D-09:** The vote record's AGGREGATOR-CONSUMED core is FROZEN HARD: `votes/<id>-<seat>.json` ->
  `{ "verdict": "unrefuted" | "refuted" }`; a missing seat file -> `insufficient`; seats are 0-indexed and capped
  at `VOTES_PER_CLAIM` (3) by file naming (a 4th+ seat is ignored deterministically and counted into
  `caps.votes_ignored`); vote-file lookup is cluster-id first, then first-member claim-id. This is exactly what
  `tally()` reads -- frozen verbatim.
- **D-10:** The voter-AUTHORED companion fields are FORWARD-DECLARED as a reserved, additive-only envelope so
  Phase 18 does not re-open the frozen file: `attack_mode` (VERIF-01 diversification), `disconfirming_query`
  (VERIF-02, the negation query the open-book voter actually ran), and a source-independence note (VERIF-03).
  Rule: Phase 18 MAY fill these fields' semantics and MAY add fields, but MUST NOT change `verdict`'s
  consumed shape. Their exact prompt-level semantics are Phase-18-owned.

### Schema file location + anti-drift discipline (GA-5)
- **D-11:** The reference lives at `plugins/lz-advisor/references/lz-deep-research-schema.md` (alongside the four
  existing references: `advisor-timing.md`, `context-packaging.md`, `orient-exploration.md`,
  `verify-target-selection.md` -- match their prose-contract house style; satisfies the SC `references/` prefix).
- **D-12:** Anti-drift rule, stated IN the reference: the aggregator SOURCE
  (`plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`) is AUTHORITATIVE for all
  aggregator-consumed/emitted shapes; the reference freezes them VERBATIM (do NOT re-derive or paraphrase the
  shapes -- copy them, citing the exact functions: `aggregate`, `tally`, `mergeClusters`, `quoteOutcome`,
  `recheckClusters`, `enforceCeilings`, `CEILINGS`). Any future change to a frozen shape requires updating BOTH
  the code and this reference in lockstep (the project's lockstep-sync discipline). The doc additionally records
  the named-ceilings contract (copy `CEILINGS` verbatim: `ANGLES 5`, `MAX_FETCH 15`, `MAX_VERIFY_CLAIMS 24`,
  `VOTES_PER_CLAIM 3`, `SYNTH_CAP 20`) and the quote-recheck contract (three-way `verified|downgraded|dropped`,
  normalized-substring match, and the WR-04 lower-bound/over-verify caveat).

### Claude's Discretion
- Exact section ordering, heading structure, and prose phrasing of the reference doc (only constraint: it freezes
  the shapes verbatim from code and matches the existing references' house style).
- Whether to render the JSON shapes as fenced ```json blocks with inline field tables vs annotated examples
  (either is fine as long as every field's name, type, allowed values, owner, and stage is unambiguous).
- The exact field name list inside the source record beyond the load-bearing `{ id, url, title }` (e.g. whether
  to include `fetched_at`, `publisher`, `accessed_via_query`) -- the planner may add forward-looking metadata
  fields as long as `id` is the canonical-URL key.
- Whether `claim_support`'s fourth state is named `unassessed` vs `pending` vs `null` (semantics fixed: "not yet
  judged by a voter"; the name is the executor's call).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The FROZEN ground truth this reference documents verbatim (load-bearing -- do NOT re-derive)
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- the proven, frozen
  aggregator. AUTHORITATIVE for every aggregator-consumed/emitted shape. Freeze from these functions:
  `aggregate()` (survivor record + summary), `tally()` (the vote rubric + confidence labels, lines ~429-497),
  `quoteOutcome()`/`recheckClusters()` (three-way quote outcome + `quote_fidelity`), `mergeClusters()` (claims
  file shape + distinct-source corroboration), `CEILINGS` (the named-ceilings block, lines ~115-121).
- `.planning/phases/16-deterministic-off-model-aggregator-validation-fixture/16-01-SUMMARY.md` -> the
  "LOAD-BEARING Output Contract" section (the survivor record, run-dir input layout, tally rubric, stdout summary,
  exit-code semantics -- all explicitly written "for Phase 17 to freeze verbatim").
- `.planning/phases/16-deterministic-off-model-aggregator-validation-fixture/16-CONTEXT.md` -> decisions
  D-01..D-16 (the IO contract, three-way quote outcome D-04/D-05, distinct-source corroboration as a lower bound
  D-08/D-09, named-ceiling enforcement D-10/D-11, the two-assurance scope fence in D-06).

### Phase definition + requirements (the acceptance bar)
- `.planning/ROADMAP.md` -> "Phase 17: JSON schema + verification contract reference" (goal + the 4 success
  criteria) and the Phase 18/19/20 sections (the downstream consumers this contract serves).
- `.planning/REQUIREMENTS.md` -> PIPE-07 (confidence enum) + VERIF-06 (two assurances), plus the related
  consumers this contract pre-commits for: PIPE-05/06/08, VERIF-01/02/03/05, EVAL-*, and the Out-of-Scope table
  (no formal JSON-Schema/embedding dependency; no shared JSONL ledger).

### The converged design + landmines (the WHY behind the shapes)
- `.planning/research/SESSION-DESIGN.md` SS7 (deterministic off-model immutable-files aggregation) / SS8
  (evidence-artifact-centric verification, the tally rubric, the two distinct assurances). NOTE the top-of-file
  CORRECTION: read every `bin/` as `skills/lz-deep-research/scripts/`.
- `.planning/research/PITFALLS.md` Pitfall 8 (lexical-dedup over-claim -> corroboration is a LOWER bound) /
  Pitfall 9 (quote-passage fidelity -> the two distinct assurances; re-check upstream of voting) / Pitfall 10
  (zero-dep + CRLF + explicit UTF-8/LF).
- `.planning/research/ARCHITECTURE.md` "Pattern 2: Off-Model Deterministic Reduction" + the component table
  (the self-anchor-rejection anti-pattern: the script verifies a quote is CITED/PRESENT, it cannot prove a tool
  was CALLED).

### House-style model for the reference doc
- `plugins/lz-advisor/references/advisor-timing.md`, `context-packaging.md`, `orient-exploration.md`,
  `verify-target-selection.md` -- the existing prose-contract references; match their structure, tone, and
  progressive-disclosure framing. The new schema reference is the fifth file here.
- Memory `reference_plugin_script_location` -- the aggregator is a skill-internal helper in
  `skills/lz-deep-research/scripts/` (NOT a top-level `bin/`), referenced via `${CLAUDE_PLUGIN_ROOT}` /
  `${CLAUDE_SKILL_DIR}` and invoked as `node "..."` (not bare).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lz-deep-research-aggregate.mjs` (Phase 16, FROZEN): supplies every aggregator-stage shape verbatim --
  survivor record `{ id, claim, sources[], corroboration_lower_bound, quote_fidelity, confidence }`; dropped
  record `{ id, claim, reason: 'quote-not-in-any-excerpt' }`; claims-input `{ worker, source, claims:[{ id, text,
  quote, excerpt_id }] }`; excerpt input `excerpts/<id>.txt`; vote input `{ verdict: 'unrefuted'|'refuted' }`;
  the 4-line counts-only stdout summary; `CEILINGS`; the tally rubric. The schema COPIES these; it does not invent.
- `16-01-SUMMARY.md` "LOAD-BEARING Output Contract": a pre-distilled, copy-ready transcription of the above,
  authored specifically for this phase to freeze.
- The four existing `plugins/lz-advisor/references/*.md`: the format/house-style template for the new doc.

### Established Patterns
- **Freeze-from-code, never re-derive:** the contract is grounded against proven, committed behavior (the
  aggregator) -- the same discipline used to freeze the Phase-16 survivor shape against the spike.
- **Observability-as-contract / audit-trail:** keep raw mechanical signals (the aggregator `confidence` label,
  `quote_fidelity`) alongside the derived reader-facing values (`report_confidence`, `claim_support`) rather than
  overwriting them -- mirrors the aggregator's "every drop/downgrade/cap is a visible count" discipline.
- **Immutable per-file run-dir layout:** `claims/`, `excerpts/`, `votes/` (D-02), extended here by the
  forward-declared `sources/` record (D-07) and the existing `survivors.json` output. No shared appendable
  ledger (Windows/Git-Bash race hazard, explicitly Out-of-Scope).
- **Stable core + extensible envelope:** freeze the aggregator-consumed shapes HARD; forward-declare
  voter-authored / synthesis-authored fields as additive-only reserved envelopes so Phases 18/20 do not re-open
  the frozen file.

### Integration Points
- **Phase 18** drives the voter over the frozen vote record (D-09) + the tally rubric (D-01/D-02); the eval
  consumes this contract directly via the pilot harness. The voter's reserved envelope (D-10) is filled here.
- **Phase 19** search/extract workers WRITE `claims/`, `excerpts/`, and the new `sources/` files to exactly these
  frozen shapes (D-06/D-07), each claim bound to a verbatim quote + stored-excerpt id + source id (PIPE-05).
- **Phase 20** orchestrator/synthesis READS `survivors.json` and AUGMENTS it into the report claim record
  (D-06): assigning `report_confidence` via the D-02 mapping, populating `claim_support` (assurance 2), and
  joining the source record for inline citations (PIPE-06); it also enforces the carried `ANGLES`/`MAX_FETCH`
  ceilings at wave dispatch.

</code_context>

<specifics>
## Specific Ideas

- The reference MUST freeze shapes VERBATIM from the aggregator and `16-01-SUMMARY.md` -- copy, don't paraphrase;
  cite the exact functions/line-anchors so a reader can verify the doc against the code.
- The two assurances must be IMPOSSIBLE to conflate: separate field names (`quote_fidelity` vs `claim_support`),
  an explicit per-field owner (aggregator/mechanical vs voter/judgment), and a worked example where
  `quote_fidelity: verified` coexists with `claim_support: unsupported`.
- The confidence reconciliation must preserve the frozen aggregator field byte-intact while delivering PIPE-07's
  exact 5-tier reader-facing enum -- the mapping table is the load-bearing artifact, not a fresh enum.
- `Contested` is a FIRST-CLASS report level (PIPE-08), never averaged away; `Rejected`/refuted is
  downgrade-not-delete unless explicitly refuted (ROADMAP SC-2).

</specifics>

<deferred>
## Deferred Ideas

- **Machine-enforced formal JSON Schema (`$schema` + ajv/validator)** -- OUT this phase (zero-dep constraint; the
  aggregator's fail-closed `JSON.parse` + `ContractError` is the runtime enforcement). The reference is the
  human/agent prose contract. Revisit only if a validation dependency is ever justified (it is not today).
- **Semantic / paraphrase dedup beyond number-word variance (AGGX-01)** -- v2-deferred; corroboration stays a
  lower bound; no embedding dependency.
- **Voter prompt-level field SEMANTICS (`attack_mode`, `disconfirming_query`, source-independence weighting)** --
  Phase 18 owns these; this phase only forward-declares the field names/types as a reserved envelope (D-10).
- **The synthesis step that POPULATES `report_confidence` + `claim_support` + inline citations** -- Phase 20
  (this phase freezes the target shape; it does not implement the populator).

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (`research-rtk-command-suitability-for-skills-and-agents.md`,
  match score 0.6) -- REVIEWED, NOT folded. The match is keyword-only ("research / agents / source / phase"); the
  todo concerns `rtk git diff` / `rtk gh pr diff` token-savings for the REVIEW + SECURITY-REVIEW skills/agents,
  which is unrelated to a JSON schema + verification contract reference. Folding it would violate the scope
  guardrail. Stays in the backlog (STATE.md Deferred Items / Pending Todos) -- same disposition as Phase 16.

</deferred>

---

*Phase: 17-json-schema-verification-contract-reference*
*Context gathered: 2026-06-15*
