# Phase 17: JSON schema + verification contract reference - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-15
**Phase:** 17-json-schema-verification-contract-reference
**Mode:** `--auto --analyze --chain` -- fully autonomous; no AskUserQuestion. Each gray area auto-resolved
to the recommended option; the `--analyze` trade-off table is logged below for the audit trail.
**Areas discussed:** Confidence-enum reconciliation, Two-assurance field shape, Source-metadata record,
Vote-record envelope, Schema file location + anti-drift discipline

`[--auto] Selected all gray areas: Confidence-enum reconciliation, Two-assurance field shape, Source-metadata record, Vote-record envelope, Schema file location + anti-drift discipline.`

---

## Confidence-enum reconciliation (GA-1)

The aggregator's frozen `confidence` field emits `High | Medium | Low/Contested | Rejected | Unsupported`
(Low and Contested COMBINED; `Rejected` present), but PIPE-07 / ROADMAP SC-2 mandate the report enum
`High | Medium | Low | Contested | Unsupported` (Low and Contested SPLIT; no `Rejected`).

| Option | Description | Selected |
|--------|-------------|----------|
| A. Two-stage vocab + frozen mapping | Keep the frozen aggregator `confidence` (mechanical tally label) verbatim; add `report_confidence` (PIPE-07 enum) assigned at synthesis; freeze the tally-label -> report-level mapping. Auditable, touches no frozen code. | ✓ |
| B. Re-split at schema level | Require the aggregator to emit the 5-tier enum directly (split Low/Contested, drop Rejected). | |
| C. Use PIPE-07 enum only | Drop Rejected / Low-Contested from the contract; document only the report enum. | |

`[auto] Confidence-enum reconciliation -- Q: "How does the frozen schema reconcile the aggregator's confidence labels with PIPE-07's report enum?" -> Selected: "A. Two-stage vocab + frozen mapping" (recommended default)`

**Selected:** A. **Rationale:** Option B would force a change to the FROZEN, proven Phase-16 aggregator --
violating "freeze the schema against proven behavior, not guess." Option C produces a contract that does not
match what the aggregator actually emits, defeating SC-1 (shapes "consistent with what the aggregator reads
and writes"). A honors both contracts, keeps the raw mechanical label for audit, and makes the two-stage
relationship explicit. Mapping frozen as D-02: High->High, Medium->Medium, Unsupported->Unsupported,
Low/Contested -> Contested (if cross-source contradiction) else Low, Rejected -> downgrade-not-delete
(retain at Unsupported/Contested; drop only on explicit refutation per SC-2).

---

## Two-assurance field shape (GA-2 / VERIF-06)

VERIF-06 requires "quote verified verbatim" and "claim supported by the quote" as TWO SEPARATE assurances.
The aggregator already emits `quote_fidelity` (assurance 1); the entailment assurance was deliberately
scope-fenced out of Phase 16 (16-CONTEXT D-06) for Phase 17 to add.

| Option | Description | Selected |
|--------|-------------|----------|
| A. Second separate field `claim_support` | Add a distinct field (`supported \| partial \| unsupported \| unassessed`), voter/synthesis-owned, orthogonal to the aggregator's mechanical `quote_fidelity`. | ✓ |
| B. Overload `quote_fidelity` | Extend the existing field's enum to also encode entailment. | |

`[auto] Two-assurance field shape -- Q: "How is the second assurance (entailment) structurally represented?" -> Selected: "A. Second separate field claim_support" (recommended default)`

**Selected:** A. **Rationale:** Option B conflates the two assurances -- exactly what VERIF-06 exists to
prevent. A keeps them orthogonal (a claim can be `quote_fidelity: verified` yet `claim_support: unsupported`)
with an explicit per-field owner: `quote_fidelity` is mechanical/aggregator-owned, `claim_support` is a
judgment owned by the voter/synthesis. Field name + enum are frozen now; the value is populated downstream.

---

## Record-stage model + source-metadata record (GA-2 cont. / GA-3 / SC-1)

SC-1 requires a "source" record among source/claim/vote/excerpt; PIPE-06 needs source metadata (URL/title)
to cite every claim inline. The aggregator only sees `source` as a string id and does not carry URL/title.

| Option | Description | Selected |
|--------|-------------|----------|
| A. Dedicated `sources/<id>.json` record | `{ id, url, title, fetched_at, ... }` keyed by the canonical source id used in claims/survivors; aggregator does not read it; synthesis joins it for citation. Report claim record = survivor record + claim_support + report_confidence + citation. | ✓ |
| B. Inline source metadata into every claims file | Carry url/title on each claim. | |
| C. Treat excerpt file as source identity | No separate source record; reuse excerpt_id. | |

`[auto] Source-metadata record -- Q: "Where does source metadata (url/title) live so PIPE-06 can cite inline?" -> Selected: "A. Dedicated sources/<id>.json record" (recommended default)`

**Selected:** A. **Rationale:** B duplicates metadata across workers (drift, bloat) and makes the aggregator
carry data it never uses. C is wrong -- one source yields multiple excerpts, and SC-1 lists source AND excerpt
as separate records. A mirrors the immutable per-file run-dir convention, gives PIPE-06 a structured citation
join, and gives VERIF-03 source-independence a stable canonical-URL key (D-08). The two record STAGES
(aggregator survivor record, frozen; report claim record, superset assembled at synthesis) keep the frozen
aggregator untouched while satisfying SC-3 + SC-4 (D-06).

---

## Vote-record envelope (GA-4 / SC-1 "vote" record)

The aggregator's `tally()` reads only `{ verdict: unrefuted | refuted }`. Phase 18 voters must ALSO record
the disconfirming query (VERIF-02) and attack mode (VERIF-01). Freeze just the consumed subset, or the full
voter-authored superset now?

| Option | Description | Selected |
|--------|-------------|----------|
| A. Frozen core + reserved additive envelope | Freeze `verdict` (+ seat/lookup/cap semantics) HARD as the aggregator-consumed contract; FORWARD-DECLARE `attack_mode` / `disconfirming_query` / source-independence as a reserved, additive-only envelope whose semantics Phase 18 fills. | ✓ |
| B. Freeze `{verdict}` only | Defer all companion fields to Phase 18. | |

`[auto] Vote-record envelope -- Q: "Does the frozen vote schema include the voter-authored companion fields or only the aggregator-consumed verdict?" -> Selected: "A. Frozen core + reserved additive envelope" (recommended default)`

**Selected:** A. **Rationale:** The phase goal is explicitly "every downstream component agrees on identical
shapes BEFORE any agent is authored." B re-opens the frozen schema in Phase 18 (churn). A freezes the
load-bearing `verdict` consumption contract hard (`unrefuted | refuted`; missing seat -> insufficient; 0-indexed
seats capped at VOTES_PER_CLAIM=3 by file naming; cluster-id-then-member-id lookup) while forward-declaring
the voter fields as additive-only -- so Phase 18 fills semantics without changing the consumed shape (D-09/D-10).

---

## Schema file location + anti-drift discipline (GA-5)

SC names `references/lz-deep-research-schema.md`; the repo's references live at `plugins/lz-advisor/references/`.
The doc must not drift from the executable aggregator over time.

| Option | Description | Selected |
|--------|-------------|----------|
| A. `plugins/lz-advisor/references/lz-deep-research-schema.md` + freeze-verbatim-from-code, lockstep-update rule | Co-locate with the four existing references; declare the aggregator source AUTHORITATIVE; copy shapes verbatim citing exact functions; require lockstep code+doc updates for any future shape change. | ✓ |
| B. Re-derive shapes in prose at the repo root | Author a fresh schema description independent of the code. | |

`[auto] Schema file location + anti-drift -- Q: "Where does the reference live and how does it stay consistent with the aggregator?" -> Selected: "A. references/ + freeze-verbatim + lockstep rule" (recommended default)`

**Selected:** A. **Rationale:** B risks immediate drift and re-derivation error (the exact hazard the
"freeze against proven behavior" principle guards against). A places the file with the existing references
(matching house style, satisfying the SC `references/` prefix), pins the aggregator source as ground truth,
and bakes in the project's lockstep-sync discipline. The doc also copies `CEILINGS` verbatim (named-ceilings
contract) and the three-way quote-recheck contract incl. the WR-04 lower-bound caveat (D-11/D-12).

---

## Claude's Discretion

- Exact section ordering, heading structure, and prose phrasing of the reference doc.
- JSON rendering style (fenced ```json blocks + field tables vs annotated examples) -- as long as every field's
  name, type, allowed values, owner, and stage is unambiguous.
- Forward-looking source-record fields beyond `{ id, url, title }` (e.g. `fetched_at`, `publisher`).
- The name of `claim_support`'s not-yet-judged state (`unassessed` vs `pending` vs `null`) -- semantics fixed.

## Deferred Ideas

- Machine-enforced formal JSON Schema (`$schema` + ajv) -- OUT (zero-dep; aggregator fail-closed parsing is the
  runtime enforcement).
- Semantic / paraphrase dedup beyond number-word variance (AGGX-01) -- v2-deferred.
- Voter prompt-level field SEMANTICS (attack_mode / disconfirming_query / source-independence) -- Phase 18.
- The synthesis populator for `report_confidence` / `claim_support` / inline citations -- Phase 20.
- **Reviewed todo, NOT folded:** Research RTK command suitability for skills and agents (score 0.6, keyword-only
  match; unrelated to a schema contract) -- stays in the backlog, same disposition as Phase 16.
