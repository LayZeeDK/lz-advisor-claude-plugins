# Phase 17: JSON schema + verification contract reference - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning
**Mode:** `--auto --analyze --chain` (autonomous discuss), BUT GA-1 was escalated to interactive
human + cross-model review after the user challenged the auto-resolved decision. Auto-advance to
plan-phase is held pending user confirmation.

<domain>
## Phase Boundary

This phase delivers ONE thing: a single reference document --
`plugins/lz-advisor/references/lz-deep-research-schema.md` -- that FREEZES the data contract every
downstream component (Phase-18 eval harness + voter, Phase-19 search/extract workers, Phase-20
orchestrator + synthesis) must agree on BEFORE any agent is authored:

1. the JSON shapes for the four records -- **source**, **claim**, **vote**, and **stored-excerpt** --
   each consistent with what the Phase-16 aggregator (`lz-deep-research-aggregate.mjs`) reads and writes
   (AFTER the GA-1 confidence-vocabulary correction below);
2. the **tally rubric** mapping every possible vote tally to exactly one confidence level;
3. the **named-ceilings contract** (copied verbatim from the frozen `CEILINGS` block);
4. the **quote-recheck contract** (three-way outcome, normalized-substring match, lower-bound caveat);
5. the **two-assurance distinction** -- "quote verified verbatim" vs "claim supported by the quote" -- as
   two structurally SEPARATE fields.

It is a CONTRACT-WRITING (documentation) phase whose plan ALSO carries one corrective code task: the
Phase-16 aggregator's confidence vocabulary is brought into agreement with the frozen enum (GA-1 / D-02)
in lockstep with its fixture. Everything else about the aggregator's proven mechanics is unchanged.

**Requirements covered (from REQUIREMENTS.md / ROADMAP.md):** PIPE-07 (every reported claim carries a
confidence level: High / Medium / Low / Contested / Unsupported) and VERIF-06 (the report distinguishes
"quote verified verbatim" from "claim supported by the quote" as two separate assurances).

**In scope:** the frozen JSON shapes for source/claim/vote/excerpt + the aggregator's survivor and dropped
records; the tally rubric (tally -> single confidence enum); the named-ceilings contract; the quote-recheck
contract; the two-assurance distinction; the aggregator-stage vs report/synthesis-stage record
relationship; the anti-drift discipline tying the doc to the executable aggregator; AND the lockstep
aggregator + fixture correction that drops `Rejected` / un-fuses `Low/Contested` (GA-1).

**Out of scope (other phases):** the verify-voter agents + the pre-registered gating eval + the voter's
internal prompt fields' SEMANTICS (Phase 18 -- this phase only forward-declares their field names/types as a
reserved envelope); the search/extract workers that WRITE these files (Phase 19); the orchestrator skill,
the synthesis step that POPULATES the second assurance + inline citations + the cross-source `Contested`
promotion, `.lz-research/` gitignore, wave-batching, and audit-trail retention (Phase 20). A
machine-enforced formal JSON Schema (`$schema` + ajv) is OUT (zero-dep; the aggregator's fail-closed
`JSON.parse` + `ContractError` validation is the runtime enforcement). Semantic/embedding dedup (v2,
AGGX-01) remains excluded.

</domain>

<decisions>
## Implementation Decisions

> GA-2..GA-5 were auto-selected and auto-resolved under `--auto`; per `--analyze`, the trade-off tables
> are in `17-DISCUSSION-LOG.md`. GA-1 was NOT left to auto-resolution: the user rejected the initial
> auto-resolved answer (a two-field `confidence` + `report_confidence` mapping) as code/contract drift,
> and the decision was re-made via a repo-blind, three-round consensus consult across three model
> families (Opus 4.8 / GPT-5.5 / Gemini 3.1 Pro), each reasoning only from curated facts (the plugin's
> own advisor-strategy contract). Outcome: UNANIMOUS. All decisions are grounded against the FROZEN
> Phase-16 aggregator + its `16-01-SUMMARY.md` output contract -- not guessed.

### Confidence enum reconciliation (GA-1) -- DECIDED BY UNANIMOUS CROSS-MODEL CONSENSUS
- **D-01:** ONE canonical confidence enum, IDENTICAL in code and contract (no second `report_confidence`
  field, no mapping table): **`High | Medium | Low | Contested | Unsupported`**. The spike-inherited
  `Rejected` label and the fused `Low/Contested` token are DROPPED. Provenance: `Rejected` originated in
  the throwaway spike (`plans/_spike/aggregate-spike.mjs` `tally()`), was preserved verbatim by Phase 16
  over Phase 16's OWN research recommendation (`16-RESEARCH.md` recommended the 4-label set without
  `Rejected`), was never deliberated (Phase 16 discuss was `--auto`), and contradicts the converged design
  (`SESSION-DESIGN.md:93`) + PIPE-07/PIPE-08. It is an accidental artifact, not a reasoned choice, so it
  earns no deference.
- **D-02:** The Phase-16 aggregator is CORRECTED to emit this enum -- a lockstep CODE + FIXTURE change
  folded into the Phase-17 plan as an explicit task (breaking changes are acceptable: the milestone is
  unreleased on a feature branch with no consumers). New `tally()` rubric (Option I -- the deterministic
  tally emits `Contested` directly on a voter split):
  ```
  readableSeats === 0             -> 'Unsupported'
  unrefuted === 3                 -> 'High'
  unrefuted >= 1 && refuted >= 1  -> 'Contested'   // voter split: any explicit refutation alongside support
  unrefuted === 2                 -> 'Medium'      // (refuted === 0 here, since the split case is caught above)
  otherwise                       -> 'Low'         // thin support, OR refuted-without-support (downgrade-not-delete)
  ```
  Also: update the stdout summary's by-confidence line to the 5 labels (`High / Medium / Low / Contested /
  Unsupported`); update the fixture's enum-documenting comment; add a per-label branch assertion so each
  tier is exercised (the current fixture only asserts `High`).
- **D-03:** `Contested` is produced by EITHER stage -- ONE value, one coherent meaning ("genuine
  disagreement"): the deterministic tally emits it on a per-claim voter split (>=1 `unrefuted` AND >=1
  `refuted`); the synthesis stage (Phase 20) MAY ADDITIONALLY promote cross-source contradictions (PIPE-08)
  to the same `Contested` value. This matches the design's own usage -- it assigns Contested at the
  per-claim tally (`SESSION-DESIGN.md:93`) and keys escalation on "ANY contested claim" (`:167`), so the
  enum value IS the VERIF-05 "contested split" escalation signal.
- **D-03b:** The tally NEVER deletes a claim; only the quote-recheck `dropped` path (fabricated/absent
  quote) removes a claim. A unanimous refutation (3/3 refuted, no uphold) -> `Low` (downgraded + SURFACED),
  never deleted -- this makes "downgrade-not-delete" structural. `Low` is defined to cover BOTH "weak/thin
  support" AND "actively-refuted-without-support."
- **D-03c:** A raw vote-count field `{ unrefuted, refuted, insufficient }` on the record is NOT required
  (Option I surfaces the split as the `Contested` enum value itself). It is deferred as an OPTIONAL
  Phase-20 addition if the synthesis stage later needs the raw triple; it is not introduced by this contract.

### Two-assurance field shape (GA-2 / VERIF-06)
- **D-04:** The two assurances are TWO structurally separate, never-conflated fields:
  - **Assurance 1 -- "quote verified verbatim":** the aggregator's existing `quote_fidelity` field
    (`verified | downgraded`), MECHANICAL, aggregator-owned. Answers "is the quote a verbatim match against
    its cited stored excerpt?" FROZEN verbatim from Phase 16.
  - **Assurance 2 -- "claim supported by the quote":** a NEW field `claim_support` (enum
    `supported | partial | unsupported`, plus `unassessed` for not-yet-voted), a JUDGMENT owned by the
    voter/synthesis (Phase 18/20), NOT the aggregator. Answers "does the quoted text actually entail the claim?"
- **D-05:** `claim_support` is NEVER derived from or collapsed into `quote_fidelity`. A claim can be
  `quote_fidelity: verified` yet `claim_support: unsupported` (the quote is real and correctly attributed but
  does not support the claim) -- exactly the conflation VERIF-06 exists to prevent. The reference states this
  orthogonality with a worked example.

### Record-stage model -- aggregator record vs report claim record (GA-2 cont.)
- **D-06:** Two record STAGES are frozen so the corrected aggregator stays the single source of truth:
  - **Aggregator survivor record** (frozen verbatim AFTER the D-02 correction; written by `aggregate()` to
    `survivors.json`): `{ id, claim, sources[], corroboration_lower_bound, quote_fidelity, confidence }`,
    where `confidence` is the single 5-tier enum from D-01.
  - **Report claim record** (synthesis-assembled superset -- Phase 20 -- by augmenting the survivor record):
    the survivor fields PLUS `claim_support` (assurance 2, D-04) and the inline `citation` (joined from the
    source record, PIPE-06). There is NO separate `report_confidence`; `confidence` is the one enum across
    both stages, and synthesis MAY upgrade a claim's `confidence` to `Contested` on a cross-source
    contradiction. Every report claim record structurally carries a confidence-level field (SC-3) and both
    assurances (SC-4).

### Source-metadata record (GA-3 / SC-1 "source" record + PIPE-06)
- **D-07:** Freeze a dedicated **source record** at `sources/<source-id>.json` ->
  `{ id, url, title, fetched_at, ... }`, keyed by the SAME canonical source id used in `claims[].source` and
  `survivors[].sources[]`. The aggregator does NOT read it (corroboration counts the id only via a Set, D-08);
  it is the citation join the synthesis step uses for PIPE-06.
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
  Phase 18 does not re-open the frozen file: `attack_mode` (VERIF-01), `disconfirming_query` (VERIF-02), and a
  source-independence note (VERIF-03). Rule: Phase 18 MAY fill these fields' semantics and MAY add fields, but
  MUST NOT change `verdict`'s consumed shape. Their exact prompt-level semantics are Phase-18-owned.

### Schema file location + anti-drift discipline (GA-5)
- **D-11:** The reference lives at `plugins/lz-advisor/references/lz-deep-research-schema.md` (alongside the four
  existing references; match their prose-contract house style; satisfies the SC `references/` prefix).
- **D-12:** Anti-drift rule, stated IN the reference: the aggregator SOURCE
  (`.../scripts/lz-deep-research-aggregate.mjs`) is AUTHORITATIVE for all aggregator-consumed/emitted shapes
  AFTER the D-02 correction; the reference freezes them VERBATIM (copy, don't paraphrase; cite the exact
  functions `aggregate`, `tally`, `mergeClusters`, `quoteOutcome`, `recheckClusters`, `enforceCeilings`,
  `CEILINGS`). Any future change to a frozen shape requires updating code + reference in lockstep. The doc also
  records the named-ceilings contract (copy `CEILINGS` verbatim) and the quote-recheck contract (three-way
  `verified|downgraded|dropped`, normalized-substring match, WR-04 lower-bound caveat).

### Claude's Discretion
- Exact section ordering, heading structure, and prose phrasing of the reference doc.
- JSON rendering style (fenced ```json + field tables vs annotated examples) -- as long as every field's name,
  type, allowed values, owner, and stage is unambiguous.
- Forward-looking source-record fields beyond `{ id, url, title }` (e.g. `fetched_at`, `publisher`).
- The name of `claim_support`'s not-yet-judged state (`unassessed` vs `pending` vs `null`) -- semantics fixed.
- Internal variable naming in the aggregator `tally()` rewrite (D-02), provided the rubric and emitted labels
  match D-01/D-02 exactly.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The FROZEN ground truth this reference documents verbatim (load-bearing -- do NOT re-derive)
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- the aggregator.
  AUTHORITATIVE for every aggregator-consumed/emitted shape AFTER the GA-1/D-02 confidence correction. Freeze
  from: `aggregate()` (survivor record + summary), `tally()` (the vote rubric + confidence labels -- the
  function being corrected in D-02), `quoteOutcome()`/`recheckClusters()` (three-way outcome + `quote_fidelity`),
  `mergeClusters()` (claims file shape + distinct-source corroboration), `CEILINGS`.
- `.../scripts/lz-deep-research-aggregate.test.mjs` -- the validation fixture; updated in lockstep with D-02.
- `.planning/phases/16-.../16-01-SUMMARY.md` -> the "LOAD-BEARING Output Contract" section (survivor record,
  run-dir input layout, tally rubric, stdout summary, exit-code semantics).
- `.planning/phases/16-.../16-CONTEXT.md` -> decisions D-01..D-16; `16-RESEARCH.md` -> the 4-label confidence
  recommendation that the code overrode (provenance evidence for GA-1).

### Phase definition + requirements (the acceptance bar)
- `.planning/ROADMAP.md` -> "Phase 17" goal + 4 SCs (SC-2 already locks the enum + downgrade-not-delete);
  Phase 18/19/20 sections (the downstream consumers).
- `.planning/REQUIREMENTS.md` -> PIPE-07, VERIF-06 (mapped); plus the consumers this contract pre-commits for:
  PIPE-05/06/08, VERIF-01/02/03/05, EVAL-*, and the Out-of-Scope table.

### The converged design + landmines (the WHY behind the shapes)
- `.planning/research/SESSION-DESIGN.md` SS7 (off-model aggregation) / SS8 (evidence-artifact verification +
  tally rubric; line 93 assigns `Contested` at the per-claim tally; line 167 "escalate ANY contested claim").
  NOTE the top-of-file CORRECTION: read every `bin/` as `skills/lz-deep-research/scripts/`.
- `.planning/research/PITFALLS.md` Pitfall 8 (corroboration is a LOWER bound) / Pitfall 9 (two distinct
  assurances; re-check upstream of voting) / Pitfall 10 (zero-dep + CRLF) / Pitfall 11 (refuted-as-deletion --
  the anti-pattern D-03b structurally prevents).
- `.planning/research/ARCHITECTURE.md` "Pattern 2: Off-Model Deterministic Reduction" + the self-anchor-rejection
  anti-pattern.

### House-style model for the reference doc
- `plugins/lz-advisor/references/advisor-timing.md`, `context-packaging.md`, `orient-exploration.md`,
  `verify-target-selection.md` -- match their structure/tone. The new schema reference is the fifth file here.
- Memory `reference_plugin_script_location` -- the aggregator is a skill-internal helper in `scripts/` (NOT
  `bin/`), referenced via `${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_SKILL_DIR}`, invoked as `node "..."`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lz-deep-research-aggregate.mjs` (Phase 16): supplies every aggregator-stage shape. The schema COPIES these;
  the ONLY behavioral change this phase makes is the GA-1/D-02 `tally()` confidence-vocabulary correction
  (drop `Rejected`, un-fuse `Low/Contested`, emit `Contested` on a voter split) + the stdout summary line + the
  fixture, all in lockstep.
- `16-01-SUMMARY.md` "LOAD-BEARING Output Contract": pre-distilled, copy-ready transcription (update the
  confidence-vocab line to the corrected enum).
- The four existing `plugins/lz-advisor/references/*.md`: the format/house-style template.

### Established Patterns
- **Freeze-from-code, never re-derive** -- but reconcile incidental artifacts against the design: a spike proves
  MECHANICS (dedup / quote-recheck / determinism), it does not bless incidental label strings no assertion
  touches. The GA-1 correction draws exactly that line (preserve proven mechanics; fix the un-asserted labels).
- **Observability-as-contract / audit-trail:** the durable `survivors.json` is the only artifact a reader sees
  pre-synthesis, so the confidence enum must carry the real signal (incl. `Contested` on a split) rather than
  defer it -- this is the decisive reason for Option I (D-03).
- **Immutable per-file run-dir layout:** `claims/`, `excerpts/`, `votes/`, + the forward-declared `sources/`
  record (D-07), + `survivors.json`. No shared appendable ledger.
- **Stable core + extensible envelope:** freeze aggregator-consumed shapes HARD; forward-declare
  voter/synthesis-authored fields as additive-only reserved envelopes (D-10).

### Integration Points
- **Phase 18** drives the voter over the frozen vote record (D-09) + the corrected tally rubric (D-01/D-02).
- **Phase 19** workers WRITE `claims/`, `excerpts/`, and the new `sources/` files to these frozen shapes.
- **Phase 20** synthesis READS `survivors.json` and AUGMENTS it into the report claim record (D-06): populating
  `claim_support`, joining the source record for citations (PIPE-06), and promoting cross-source contradictions
  to `Contested`; it also keys VERIF-05 escalation off the per-claim `Contested` value (D-03).

</code_context>

<specifics>
## Specific Ideas

- The reference MUST freeze shapes VERBATIM from the (corrected) aggregator + `16-01-SUMMARY.md` -- copy, don't
  paraphrase; cite exact functions/line-anchors so a reader can verify the doc against the code.
- The two assurances must be IMPOSSIBLE to conflate: separate field names (`quote_fidelity` vs `claim_support`),
  explicit per-field owner, and a worked example where `quote_fidelity: verified` coexists with
  `claim_support: unsupported`.
- ONE confidence vocabulary, byte-identical in code and contract (the load-bearing GA-1 outcome): no
  `report_confidence`, no mapping table, no `Rejected`, no fused `Low/Contested`.
- `Contested` is FIRST-CLASS (PIPE-08), produced by a per-claim voter split at the tally OR a cross-source
  contradiction at synthesis; `refuted` is downgrade-not-delete (`Low`), never a terminal `Rejected`
  (ROADMAP SC-2); the tally never deletes -- only the quote-recheck does.

</specifics>

<deferred>
## Deferred Ideas

- **Raw vote-count field `{unrefuted, refuted, insufficient}` on the record** -- not introduced by this contract
  (Option I makes the `Contested` enum value the escalation signal); optional Phase-20 addition if synthesis
  needs the raw triple (D-03c).
- **Machine-enforced formal JSON Schema (`$schema` + ajv)** -- OUT (zero-dep; aggregator fail-closed parsing is
  the runtime enforcement).
- **Semantic / paraphrase dedup beyond number-word variance (AGGX-01)** -- v2-deferred.
- **Voter prompt-level field SEMANTICS (`attack_mode`, `disconfirming_query`, source-independence)** -- Phase 18.
- **The synthesis populator** for `claim_support` + inline citations + cross-source `Contested` promotion --
  Phase 20 (this phase freezes the target shape; it does not implement the populator).

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (`research-rtk-command-suitability-for-skills-and-agents.md`,
  match score 0.6) -- REVIEWED, NOT folded. Keyword-only match ("research / agents / source / phase"); the todo
  concerns `rtk git diff` token-savings for the REVIEW/SECURITY-REVIEW skills, unrelated to a schema contract.
  Stays in the backlog -- same disposition as Phase 16.

</deferred>

---

*Phase: 17-json-schema-verification-contract-reference*
*Context gathered: 2026-06-15*
