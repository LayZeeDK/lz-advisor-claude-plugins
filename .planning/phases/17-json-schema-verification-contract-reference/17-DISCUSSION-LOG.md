# Phase 17: JSON schema + verification contract reference - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-15
**Phase:** 17-json-schema-verification-contract-reference
**Mode:** `--auto --analyze --chain` for GA-2..GA-5 (autonomous; recommended-option selection; trade-off
tables retained). GA-1 was ESCALATED out of auto-mode after the user challenged the auto-resolved answer,
and was re-decided by a repo-blind three-round cross-model consensus consult.
**Areas discussed:** Confidence-enum reconciliation, Two-assurance field shape, Source-metadata record,
Vote-record envelope, Schema file location + anti-drift discipline

`[--auto] Selected all gray areas: Confidence-enum reconciliation, Two-assurance field shape, Source-metadata record, Vote-record envelope, Schema file location + anti-drift discipline.`

(Selected option marked `[X]` below.)

---

## Confidence-enum reconciliation (GA-1) -- re-decided by cross-model consensus

The aggregator's `confidence` field emits `High | Medium | Low/Contested | Rejected | Unsupported`
(Low and Contested COMBINED; `Rejected` present). PIPE-07 / ROADMAP SC-2 mandate
`High | Medium | Low | Contested | Unsupported` (Low and Contested SEPARATE; no `Rejected`).

### Auto-resolved answer (rejected by the user)

The `--auto` pass initially selected a two-field model: keep the aggregator `confidence` label verbatim
AND add a parallel `report_confidence` (PIPE-07 enum) with a frozen mapping table. The user rejected this:
"We can't have drift between Phase 16 and Phase 17 vocabulary in code" -- two vocabularies for one concept
IS the drift.

### Provenance investigation (why the code diverged)

- `Rejected` originated in the throwaway spike (`plans/_spike/aggregate-spike.mjs` `tally()`:
  `refuted >= 2 -> 'Rejected'`); the spike also omitted `Unsupported`.
- It entered the built aggregator ONLY via the Phase-16 plan instruction "PRESERVE the spike tally rubric
  arithmetic verbatim" -- which OVERRODE Phase 16's own research (`16-RESEARCH.md` recommended
  `High | Medium | Low/Contested | Unsupported`, no `Rejected`).
- `Rejected` was NEVER deliberated (absent from 16-CONTEXT / 16-DISCUSSION-LOG; Phase 16 discuss was `--auto`).
- The converged design (`SESSION-DESIGN.md:93`) has no `Rejected`; refuted = downgrade-not-delete.
- Conclusion: an accidental, un-reviewed spike artifact, not a reasoned design choice -- earns no deference.

### Cross-model consensus protocol (repo-blind; advisors decided, executor relayed/verified)

Three independent model families consulted ONLY on curated facts (no repo/web access; could ask the executor
to verify) -- the plugin's own advisor-strategy contract. The open sub-question: who assigns `Contested`?
- **Option I:** the deterministic tally emits `Contested` on a per-claim voter split (>=1 unrefuted AND
  >=1 refuted); synthesis may additionally promote cross-source contradictions to the same value.
- **Option II:** the tally emits only `{High, Medium, Low, Unsupported}`; `Contested` is synthesis-only.

| Round | Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|-------|----------|---------|----------------|
| 1 (neutral brief) | Option II (med) | Option I (high) | Option II (high) |
| 2 (after verified facts) | Option I (changed) | Option I (held) | Option I (changed) |
| 3 (Opus conditionals answered) | Option I (high) | -- | -- |

**Verified facts that drove convergence (executor checked the source):**
1. No synthesis / orchestrator / escalation / renderer code exists yet (all Phase 20); the deterministic
   aggregator + its test are the only built components.
2. The record carries NO raw vote counts today (only `confidence` et al.); Option II's "synthesis folds
   the raw split" would require NEW scope (a raw-count field) that is not planned anywhere.
3. `Contested` is NOT frozen as exclusively cross-source: `SESSION-DESIGN.md:93` assigns it at the
   per-claim tally, and the escalation architecture keys on "ANY contested claim" (`:167`).
4. The durable, human-readable `survivors.json` audit artifact is the ONLY place a reader sees the signal
   pre-synthesis; under Option II a genuine voter split would be mislabeled `Low` there, erasing dissent.

| Option | Description | Selected |
|--------|-------------|----------|
| Option I | Tally emits `Contested` on a voter split; synthesis may add cross-source `Contested`. | [X] |
| Option II | Tally emits 4 tiers; `Contested` assigned only at synthesis (needs a new raw-count field). | |

**Unanimous outcome:** Option I, all three families, no remaining blocker. Captured as CONTEXT D-01..D-03c:
one canonical enum `High | Medium | Low | Contested | Unsupported` identical in code and contract; the
Phase-16 aggregator + fixture corrected in lockstep (drop `Rejected`, un-fuse, emit `Contested` on split);
tally never deletes (only quote-recheck drops); `Low` absorbs actively-refuted; the raw-count field is
deferred/optional.

---

## Two-assurance field shape (GA-2 / VERIF-06)

| Option | Description | Selected |
|--------|-------------|----------|
| A. Second separate field `claim_support` | Distinct field (`supported \| partial \| unsupported \| unassessed`), voter/synthesis-owned, orthogonal to the mechanical `quote_fidelity`. | [X] |
| B. Overload `quote_fidelity` | Extend the existing field to also encode entailment. | |

`[auto] Two-assurance field shape -> Selected: "A" (recommended default)`

**Selected:** A. **Rationale:** B conflates the two assurances -- exactly what VERIF-06 prevents. A keeps them
orthogonal (a claim can be `quote_fidelity: verified` yet `claim_support: unsupported`), each with an explicit
owner. Field name + enum frozen now; value populated downstream (D-04/D-05).

---

## Record-stage model + source-metadata record (GA-2 cont. / GA-3 / SC-1)

| Option | Description | Selected |
|--------|-------------|----------|
| A. Dedicated `sources/<id>.json` record | `{ id, url, title, fetched_at, ... }` keyed by canonical source id; aggregator does not read it; synthesis joins it for citation. Report claim record = survivor record + claim_support + citation (confidence stays the single enum). | [X] |
| B. Inline source metadata into every claims file | Carry url/title on each claim. | |
| C. Treat excerpt file as source identity | No separate source record; reuse excerpt_id. | |

`[auto] Source-metadata record -> Selected: "A" (recommended default)`

**Selected:** A. **Rationale:** B duplicates metadata (drift, bloat) and makes the aggregator carry data it
never uses. C is wrong -- one source yields multiple excerpts, and SC-1 lists source AND excerpt separately. A
mirrors the immutable per-file run-dir convention, gives PIPE-06 a structured citation join, and gives VERIF-03
a stable canonical-URL key (D-07/D-08). Two record STAGES keep the corrected aggregator the single source of
truth while satisfying SC-3 + SC-4 (D-06). (No `report_confidence` -- superseded by the GA-1 single-enum outcome.)

---

## Vote-record envelope (GA-4 / SC-1 "vote" record)

| Option | Description | Selected |
|--------|-------------|----------|
| A. Frozen core + reserved additive envelope | Freeze `verdict` (+ seat/lookup/cap semantics) HARD; forward-declare `attack_mode` / `disconfirming_query` / source-independence as a reserved, additive-only envelope Phase 18 fills. | [X] |
| B. Freeze `{verdict}` only | Defer all companion fields to Phase 18. | |

`[auto] Vote-record envelope -> Selected: "A" (recommended default)`

**Selected:** A. **Rationale:** The phase goal is "every downstream component agrees on identical shapes BEFORE
any agent is authored." B re-opens the frozen schema in Phase 18 (churn). A freezes the load-bearing `verdict`
consumption contract hard while forward-declaring voter fields as additive-only (D-09/D-10).

---

## Schema file location + anti-drift discipline (GA-5)

| Option | Description | Selected |
|--------|-------------|----------|
| A. `references/lz-deep-research-schema.md` + freeze-verbatim-from-code, lockstep-update rule | Co-locate with the four existing references; aggregator source AUTHORITATIVE; copy shapes verbatim; lockstep code+doc updates. | [X] |
| B. Re-derive shapes in prose at the repo root | Author a fresh schema description independent of the code. | |

`[auto] Schema file location + anti-drift -> Selected: "A" (recommended default)`

**Selected:** A. **Rationale:** B risks immediate drift and re-derivation error. A places the file with the
existing references (house style, SC `references/` prefix), pins the aggregator source as ground truth, and
bakes in the lockstep-sync discipline (D-11/D-12).

---

## Claude's Discretion

- Section ordering / heading structure / prose phrasing of the reference doc.
- JSON rendering style (fenced blocks + field tables vs annotated examples).
- Forward-looking source-record fields beyond `{ id, url, title }`.
- The name of `claim_support`'s not-yet-judged state (`unassessed` vs `pending` vs `null`).
- Internal variable naming in the aggregator `tally()` rewrite (provided the rubric + labels match D-01/D-02).

## Deferred Ideas

- Raw vote-count field on the record -- optional Phase-20 addition (D-03c).
- Machine-enforced formal JSON Schema (`$schema` + ajv) -- OUT (zero-dep).
- Semantic / paraphrase dedup beyond number-word variance (AGGX-01) -- v2-deferred.
- Voter prompt-level field SEMANTICS (attack_mode / disconfirming_query / source-independence) -- Phase 18.
- The synthesis populator for `claim_support` + inline citations + cross-source `Contested` promotion -- Phase 20.
- **Reviewed todo, NOT folded:** Research RTK command suitability for skills and agents (score 0.6, keyword-only
  match; unrelated to a schema contract) -- stays in the backlog, same disposition as Phase 16.
