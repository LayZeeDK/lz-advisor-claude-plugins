# Phase 17: JSON schema + verification contract reference - Research

**Researched:** 2026-06-15
**Domain:** Contract-writing (a single prose-contract reference doc) FROZEN from a proven zero-dep Node aggregator, PLUS one lockstep corrective code change (the GA-1/D-02 confidence-vocabulary fix) to that aggregator + its node:test fixture.
**Confidence:** HIGH (overwhelmingly codebase-internal freeze-from-code; every load-bearing fact below is read directly from committed source, not training data)

## Summary

This phase ships ONE reference file -- `plugins/lz-advisor/references/lz-deep-research-schema.md` -- that freezes the data contract (source / claim / vote / stored-excerpt records + the aggregator survivor record + the report claim record), the tally rubric (vote tally -> single confidence enum), the named-ceilings contract, the quote-recheck contract, and the two-assurance distinction. The plan ALSO carries one lockstep corrective code task: the Phase-16 aggregator's `tally()` is brought from its as-shipped 5-label spike vocabulary (`High | Medium | Low/Contested | Rejected | Unsupported`) to the GA-1-ratified single enum (`High | Medium | Low | Contested | Unsupported`), in lockstep with its node:test fixture and its stdout summary line. All decisions are LOCKED in 17-CONTEXT.md (D-01..D-12) -- the research surfaces copy-ready ground truth, not alternatives.

Every aggregator-consumed/emitted shape in this research was read verbatim from the committed source `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (553 lines, all functions present) and cross-checked against the pre-distilled "LOAD-BEARING Output Contract" in `16-01-SUMMARY.md`. The corrective `tally()` rewrite (Option I) is fully implementable against the CURRENT vote-counting code: the three inputs the rubric needs (`readableSeats`, `unrefuted`, `refuted`) all already exist in `tally()` today (verified at lines 434, 477, 478). The ONLY change is the 5-branch decision block at lines 480-496 plus two cosmetic touch points (the rubric comment at lines 427-428 and the stdout by-confidence line at lines 562-570). The existing fixture is GREEN at 13/13 today and exercises ONLY the `High` tier for confidence (verified: every committed votes/ dir has 3 `unrefuted` seats) -- so the lockstep fixture task must ADD per-label coverage for the four remaining tiers (`Medium`, `Low`, `Contested`, `Unsupported`), each via a vote-file combination the rubric maps to that label.

**Primary recommendation:** Write the reference doc to match the four existing `references/*.md` files' prose-contract house style (H1 title + intent paragraph + H2 sections + fenced code/tables + cross-references); freeze every shape by COPYING from the corrected aggregator (cite exact function names + line anchors); and structure the lockstep code task as (1) rewrite the `tally()` decision block to the Option I rubric, (2) update the stdout by-confidence line to 5 labels, (3) update the fixture's enum-documenting header comment, (4) add four new tier-coverage fixtures/assertions, all gated by the explicit FILE-form test command. Apply the corrective code change BEFORE writing the doc's frozen shapes, so the doc freezes the corrected code (D-12 anti-drift), not the as-shipped code.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Confidence enum reconciliation (GA-1) -- decided by unanimous cross-model consensus:**

- **D-01:** ONE canonical confidence enum, IDENTICAL in code and contract (no second `report_confidence` field, no mapping table): **`High | Medium | Low | Contested | Unsupported`**. The spike-inherited `Rejected` label and the fused `Low/Contested` token are DROPPED. `Rejected` is an accidental spike artifact (originated in `plans/_spike/aggregate-spike.mjs` `tally()`, preserved verbatim by Phase 16 OVER its own research recommendation, never deliberated, contradicts the converged design + PIPE-07/PIPE-08) -- it earns no deference.
- **D-02:** The Phase-16 aggregator is CORRECTED to emit this enum -- a lockstep CODE + FIXTURE change folded into the Phase-17 plan as an explicit task (breaking changes acceptable: milestone unreleased on a feature branch, no consumers). New `tally()` rubric (Option I):
  ```
  readableSeats === 0             -> 'Unsupported'
  unrefuted === 3                 -> 'High'
  unrefuted >= 1 && refuted >= 1  -> 'Contested'   // voter split: any explicit refutation alongside support
  unrefuted === 2                 -> 'Medium'      // (refuted === 0 here, since the split case is caught above)
  otherwise                       -> 'Low'         // thin support, OR refuted-without-support (downgrade-not-delete)
  ```
  Also: update the stdout summary's by-confidence line to the 5 labels; update the fixture's enum-documenting comment; add a per-label branch assertion so each tier is exercised (the current fixture only asserts `High`).
- **D-03:** `Contested` is produced by EITHER stage -- ONE value, one coherent meaning ("genuine disagreement"): deterministic tally emits it on a per-claim voter split (>=1 `unrefuted` AND >=1 `refuted`); synthesis (Phase 20) MAY ADDITIONALLY promote cross-source contradictions (PIPE-08) to the same `Contested` value. The enum value IS the VERIF-05 "contested split" escalation signal.
- **D-03b:** The tally NEVER deletes a claim; only the quote-recheck `dropped` path removes a claim. A unanimous refutation (3/3 refuted, no uphold) -> `Low` (downgraded + SURFACED), never deleted -- "downgrade-not-delete" is structural. `Low` covers BOTH "weak/thin support" AND "actively-refuted-without-support."
- **D-03c:** A raw vote-count field `{ unrefuted, refuted, insufficient }` on the record is NOT required (Option I surfaces the split as the `Contested` enum value). Deferred as an OPTIONAL Phase-20 addition; NOT introduced by this contract.

**Two-assurance field shape (GA-2 / VERIF-06):**

- **D-04:** TWO structurally separate, never-conflated fields:
  - **Assurance 1 -- "quote verified verbatim":** the aggregator's existing `quote_fidelity` (`verified | downgraded`), MECHANICAL, aggregator-owned. FROZEN verbatim from Phase 16.
  - **Assurance 2 -- "claim supported by the quote":** a NEW field `claim_support` (enum `supported | partial | unsupported`, plus `unassessed` for not-yet-voted), a JUDGMENT owned by the voter/synthesis (Phase 18/20), NOT the aggregator.
- **D-05:** `claim_support` is NEVER derived from or collapsed into `quote_fidelity`. A claim can be `quote_fidelity: verified` yet `claim_support: unsupported`. The reference states this orthogonality with a worked example.

**Record-stage model (GA-2 cont.):**

- **D-06:** Two record STAGES are frozen:
  - **Aggregator survivor record** (frozen verbatim AFTER the D-02 correction; written by `aggregate()` to `survivors.json`): `{ id, claim, sources[], corroboration_lower_bound, quote_fidelity, confidence }`, where `confidence` is the single 5-tier enum from D-01.
  - **Report claim record** (synthesis-assembled superset -- Phase 20): the survivor fields PLUS `claim_support` (D-04) and the inline `citation` (joined from the source record, PIPE-06). NO separate `report_confidence`; synthesis MAY upgrade `confidence` to `Contested` on a cross-source contradiction.

**Source-metadata record (GA-3 / PIPE-06):**

- **D-07:** Freeze a dedicated **source record** at `sources/<source-id>.json` -> `{ id, url, title, fetched_at, ... }`, keyed by the SAME canonical source id used in `claims[].source` and `survivors[].sources[]`. The aggregator does NOT read it; it is the citation join the synthesis step uses for PIPE-06.
- **D-08:** The `source-id` is a canonicalized source key (canonical URL) so VERIF-03 source-independence has a stable, deterministic key. The reference defines the canonicalization rule at the contract level (Phase-19 extract worker implements it).

**Vote record (GA-4):**

- **D-09:** The vote record's AGGREGATOR-CONSUMED core is FROZEN HARD: `votes/<id>-<seat>.json` -> `{ "verdict": "unrefuted" | "refuted" }`; a missing seat file -> `insufficient`; seats are 0-indexed and capped at `VOTES_PER_CLAIM` (3) by file naming (a 4th+ seat is ignored deterministically and counted into `caps.votes_ignored`); vote-file lookup is cluster-id first, then first-member claim-id. Exactly what `tally()` reads -- frozen verbatim.
- **D-10:** The voter-AUTHORED companion fields are FORWARD-DECLARED as a reserved, additive-only envelope: `attack_mode` (VERIF-01), `disconfirming_query` (VERIF-02), source-independence note (VERIF-03). Phase 18 MAY fill these fields' semantics and MAY add fields, but MUST NOT change `verdict`'s consumed shape.

**Schema file location + anti-drift (GA-5):**

- **D-11:** The reference lives at `plugins/lz-advisor/references/lz-deep-research-schema.md` (alongside the four existing references; match their prose-contract house style).
- **D-12:** Anti-drift rule, stated IN the reference: the aggregator SOURCE is AUTHORITATIVE for all aggregator-consumed/emitted shapes AFTER the D-02 correction; the reference freezes them VERBATIM (copy, don't paraphrase; cite the exact functions `aggregate`, `tally`, `mergeClusters`, `quoteOutcome`, `recheckClusters`, `enforceCeilings`, `CEILINGS`). Any future change to a frozen shape requires updating code + reference in lockstep. The doc also records the named-ceilings contract (copy `CEILINGS` verbatim) and the quote-recheck contract (three-way `verified|downgraded|dropped`, normalized-substring match, WR-04 lower-bound caveat).

### Claude's Discretion

- Exact section ordering, heading structure, and prose phrasing of the reference doc.
- JSON rendering style (fenced ```json + field tables vs annotated examples) -- as long as every field's name, type, allowed values, owner, and stage is unambiguous.
- Forward-looking source-record fields beyond `{ id, url, title }` (e.g. `fetched_at`, `publisher`).
- The name of `claim_support`'s not-yet-judged state (`unassessed` vs `pending` vs `null`) -- semantics fixed.
- Internal variable naming in the aggregator `tally()` rewrite (D-02), provided the rubric and emitted labels match D-01/D-02 exactly.

### Deferred Ideas (OUT OF SCOPE)

- Raw vote-count field `{unrefuted, refuted, insufficient}` on the record -- not introduced by this contract (Option I makes the `Contested` enum value the escalation signal); optional Phase-20 addition (D-03c).
- Machine-enforced formal JSON Schema (`$schema` + ajv) -- OUT (zero-dep; the aggregator's fail-closed `JSON.parse` + `ContractError` validation is the runtime enforcement).
- Semantic / paraphrase dedup beyond number-word variance (AGGX-01) -- v2-deferred.
- Voter prompt-level field SEMANTICS (`attack_mode`, `disconfirming_query`, source-independence) -- Phase 18.
- The synthesis populator for `claim_support` + inline citations + cross-source `Contested` promotion -- Phase 20 (this phase freezes the target shape; it does not implement the populator).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PIPE-07 | Every reported claim carries a confidence level (High / Medium / Low / Contested / Unsupported). | SC-2 + SC-3: the single 5-tier enum is frozen (D-01); the tally rubric (Option I, D-02) maps every vote tally to exactly one tier; the survivor record + report claim record both structurally carry a `confidence` field. The corrective code task makes the aggregator emit this exact enum (drop `Rejected`, un-fuse `Low/Contested`). |
| VERIF-06 | The report distinguishes "quote verified verbatim" from "claim supported by the quote" as two separate assurances. | SC-4: two structurally separate fields -- `quote_fidelity` (mechanical, aggregator-owned, frozen) and `claim_support` (judgment, voter/synthesis-owned, new), never conflated (D-04/D-05), with a worked example where `quote_fidelity: verified` coexists with `claim_support: unsupported`. |
</phase_requirements>

## Architectural Responsibility Map

This phase produces documentation + one corrective code change; the "tiers" here are the deep-research pipeline STAGES the contract spans. Mapping each contract element to its owning stage is the load-bearing sanity check the planner needs (it determines which fields are frozen-hard vs forward-declared).

| Capability | Primary Owner | Secondary Owner | Rationale |
|------------|---------------|-----------------|-----------|
| `quote_fidelity` (verbatim re-check) | Aggregator (`quoteOutcome`/`recheckClusters`) | -- | MECHANICAL, deterministic, off-model. Frozen verbatim (D-04 assurance 1). |
| `confidence` enum + tally rubric | Aggregator (`tally`) | Synthesis (Phase 20 may promote to `Contested`) | Deterministic per-claim tally is primary; synthesis adds cross-source `Contested` to the SAME value (D-03). |
| `corroboration_lower_bound` | Aggregator (`mergeClusters` Set size) | -- | Distinct-source count, a LOWER bound (D-08/D-09). |
| `claim_support` (entailment) | Voter / Synthesis (Phase 18/20) | -- | A JUDGMENT, never mechanical. New field, NOT aggregator-owned (D-04 assurance 2). |
| `verdict` (vote consumed core) | Voter (writes) / Aggregator (reads) | -- | Frozen-hard consumed shape (D-09); aggregator reads `{verdict}` only. |
| `attack_mode`/`disconfirming_query`/source-independence note | Voter (Phase 18) | -- | Forward-declared reserved envelope; additive-only; semantics Phase-18-owned (D-10). |
| Source record + canonical-URL key | Extract worker (Phase 19 writes) / Synthesis (Phase 20 joins) | -- | Aggregator does NOT read it; citation join for PIPE-06 (D-07/D-08). |
| `citation` (inline) | Synthesis (Phase 20) | -- | Joined from source record; report-stage only (D-06). |
| Named ceilings (`CEILINGS`) | Aggregator enforces `MAX_VERIFY_CLAIMS`/`VOTES_PER_CLAIM`/`SYNTH_CAP`; orchestrator (Phase 20) enforces `ANGLES`/`MAX_FETCH` | -- | Split enforcement; the contract records all five, notes which stage enforces which. |

[VERIFIED: codebase -- lz-deep-research-aggregate.mjs functions read directly]

## Standard Stack

This is a documentation + corrective-code phase. There is no library stack to select; the "stack" is the existing zero-dependency Node toolchain already in the repo.

### Core
| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Node.js stdlib (`node:fs`, `node:path`, `node:url`) | Node v24.13.0 on host | The aggregator's only imports | Zero-dependency constraint (AGG-02); no `package.json` anywhere in repo (enforced by the fixture). |
| `node:test` + `node:assert/strict` | bundled with Node | The validation fixture runner | Already the test runner for `lz-deep-research-aggregate.test.mjs` (Phase 16). |
| Markdown | -- | The reference doc format | Claude Code's native format for `references/*.md`; matches the four existing references. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Prose-contract markdown reference | Machine-enforced JSON Schema (`$schema` + ajv) | OUT per D-decisions / Deferred Ideas: violates zero-dep; the aggregator's fail-closed `JSON.parse` + `ContractError` IS the runtime enforcement. Do NOT introduce ajv. |

**Installation:** None. Zero new dependencies. No `npm install`. This is a constraint, not an option (AGG-02; enforced by the fixture's "no package.json anywhere from scripts dir up to repo root" assertion).

## Package Legitimacy Audit

Not applicable -- this phase installs ZERO external packages. The zero-dependency constraint (AGG-02) is load-bearing and is enforced by the existing fixture (the "zero-dependency contract" test walks from the scripts dir up to the repo root asserting no `package.json` exists, and asserts the aggregator imports only `node:`/relative specifiers). Any package introduction would be a constraint violation. [VERIFIED: codebase -- lz-deep-research-aggregate.test.mjs lines 226-268]

## Architecture Patterns

### Contract-document data flow (what the reference freezes)

```
                       PHASE 19 (writes)              PHASE 16 AGGREGATOR (reads/writes)        PHASE 18/20 (consumes/augments)
                       ----------------               ---------------------------------        ------------------------------
  web sources  ---->   claims/<worker>.json  ---+
                       {worker,source,             |
                        claims:[{id,text,          |    mergeClusters() --> clusters
                                quote,excerpt_id}]} |       (jaccard >= 0.6; sources=Set)
                                                   |              |
                       excerpts/<id>.txt  ---------+      loadExcerpts() + quoteOutcome()
                       (UTF-8; CRLF/BOM ok)        |       recheckClusters() --> kept/dropped
                                                   |       (verified|downgraded|dropped)
                       sources/<id>.json  --(NOT   |              |
                       {id,url,title,...}    read   |      rankClusters() --> enforceCeilings()
                        canonical-URL key)  by agg) |              |
                                                          tally(cl) --> confidence  <-- reads votes/<id>-<seat>.json
                                                              |                            {verdict:"unrefuted"|"refuted"}
                                                              v                            (+ reserved voter envelope)
                                          aggregate() --> survivors.json (array, <= SYNTH_CAP)
                                          { id, claim, sources[], corroboration_lower_bound,
                                            quote_fidelity, confidence }
                                                              |
                                                              v
                                          + stdout summary (counts-only, 4 lines, exit 0/2)
                                                              |
                                          ====================+==================== (Phase 20 synthesis AUGMENTS)
                                                              v
                                          Report claim record = survivor fields
                                            + claim_support (supported|partial|unsupported|unassessed)
                                            + citation (joined from sources/<id>.json)
                                            [synthesis may upgrade confidence -> Contested]
```

A reader can trace one claim from `claims/` + `excerpts/` (Phase-19 inputs) through the aggregator's merge -> recheck -> rank -> cap -> tally pipeline into `survivors.json`, then into the Phase-20 report claim record. The two assurances (`quote_fidelity`, `claim_support`) and the two confidence-assignment paths (per-claim tally split, cross-source synthesis promotion) are the load-bearing branches.

### Recommended doc structure (Claude's discretion -- this is a suggested ordering, not locked)

A natural ordering that matches the existing references' "intent -> contract -> caveats -> cross-refs" flow:

```
# Deep-Research Data-Contract Schema (H1)
[intent paragraph: what this freezes, anti-drift rule, who consumes it]

## Anti-drift discipline (D-12)            # state the freeze-from-code rule up front
## Run-dir layout                          # the immutable per-file blackboard
## The source record (sources/<id>.json)   # D-07/D-08 + canonical-URL rule
## The claim record (claims/<worker>.json) # PIPE-05 worker input shape
## The stored-excerpt (excerpts/<id>.txt)  # PIPE-04 evidence artifact
## The vote record (votes/<id>-<seat>.json)# D-09 frozen core + D-10 reserved envelope
## The quote-recheck contract              # three-way outcome + normalized-substring + WR-04
## The tally rubric                        # Option I; tally -> single enum; downgrade-not-delete
## The confidence enum                     # the one 5-tier vocabulary (PIPE-07/PIPE-08)
## The two assurances                      # quote_fidelity vs claim_support + worked example (VERIF-06)
## The aggregator survivor record          # frozen verbatim (D-06 stage 1)
## The report claim record                 # synthesis superset (D-06 stage 2)
## The named-ceilings contract             # copy CEILINGS verbatim + which stage enforces which
## Stage ownership summary                 # who writes/reads/owns each field
```

### Pattern: Off-Model Deterministic Reduction (the frozen mechanic)
**What:** All dedup / ranking / vote-tally / quote-re-check is performed off-model by a pure-function Node script over immutable on-disk files (zero model tokens, reproducible, auditable). The reference documents this as the source of truth.
**When to use:** Already established in Phase 16; the reference freezes its observable shapes.
**Source:** `lz-deep-research-aggregate.mjs` (the whole module); `16-01-SUMMARY.md` patterns block.

### Anti-Patterns to Avoid
- **Paraphrasing shapes instead of copying them.** D-12 mandates verbatim freeze-from-code. If the doc says `corroboration_lower_bound` but the code emits `corroborationLowerBound`, the contract is wrong. Copy field names byte-for-byte from `aggregate()`'s survivor-record map (lines 524-531).
- **Introducing `report_confidence` or a mapping table.** The load-bearing GA-1 outcome is ONE vocabulary byte-identical in code and contract. A second confidence field IS the drift the user rejected.
- **Freezing the AS-SHIPPED code.** The doc must freeze the CORRECTED aggregator (post-D-02). Apply the code change first, then freeze. Otherwise the doc immortalizes `Rejected`/`Low/Contested`.
- **Deriving `claim_support` from `quote_fidelity`.** D-05: they are orthogonal. A worked example must show `verified` + `unsupported` coexisting.
- **Adding the raw vote-count triple to the record.** D-03c defers it; Option I makes the `Contested` enum value the signal. Do NOT introduce `{unrefuted, refuted, insufficient}` on the survivor record.
- **Cross-skill body references.** Project convention (`feedback_no_cross_skill_body_references`, Pitfall 14): shared knowledge lives in `references/`; one skill must not reference another's named sections. This new reference IS the canonical home for the schema -- downstream SKILL.md files point AT it, never inline it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runtime schema validation | A formal JSON Schema (`$schema`) + ajv validator | The aggregator's existing fail-closed `JSON.parse` + `ContractError` + the WR-01/02/03 field guards in `mergeClusters` | Zero-dep constraint (AGG-02); the runtime enforcement already exists and is fixture-covered. Documenting it as the enforcement mechanism is the contract; a second validator is scope creep that violates the constraint. |
| Re-deriving the shapes in fresh prose | A from-scratch schema description independent of the code | Copy verbatim from the corrected `aggregate()` + `16-01-SUMMARY.md` "LOAD-BEARING Output Contract" | GA-5 Option B (re-derive in prose) was rejected: it risks immediate drift + re-derivation error. The code is authoritative (D-12). |
| New per-tier fixtures from scratch | Hand-authoring entirely new fixture trees | Reuse the existing fixture pattern (committed `__fixtures__/<case>/{claims,excerpts,votes}/`) OR the existing `tmpRunDirWithWorker` temp-dir helper at lines 109-116 | The fixture already has both a committed-tree pattern and a temp-run-dir pattern; the four new tier cases (Medium/Low/Contested/Unsupported) only differ in their `votes/` seat verdicts. |

**Key insight:** The entire phase is a freeze-from-code exercise plus a 5-line decision-block rewrite. The complexity is not in building anything new -- it is in (a) copying shapes EXACTLY (provenance discipline) and (b) ensuring the corrective code change is applied BEFORE the freeze so the doc never immortalizes the spike artifact.

## Runtime State Inventory

> This is a corrective-refactor phase (rename a label vocabulary in code + doc). The grep audit found files; this inventory covers runtime/stored/registered state.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `survivors.json` is written FRESH per run (the aggregator regenerates it deterministically from `claims/`/`excerpts/`/`votes/`); it is NOT a persisted store with old-label records to migrate. The committed `__fixtures__/` and `plans/_spike/run/` contain INPUT files (`votes/*.json` with `{verdict}`, `claims`, `excerpts`) -- none store the `confidence` label string; `confidence` is only ever COMPUTED at runtime by `tally()`. | None -- no data migration. The label exists only as a computed output, never a stored key. Verified: `git grep "Rejected\|Low/Contested" -- plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__` returns nothing (the fixtures store inputs, not the confidence output). |
| Live service config | None. The aggregator is a skill-internal helper invoked as `node "..."`; there is no live service, daemon, DB, or external config holding the label. | None -- verified: no DB, no service, no `.lz-research/` runtime state committed (gitignore entry is Phase-20 scope per INTEG-02). |
| OS-registered state | None. No Task Scheduler / pm2 / launchd / systemd registration references the label. | None -- verified: no process-manager config in repo. |
| Secrets/env vars | None. The `LZ_DR_*` env override is intentionally NOT wired (D-12 in Phase 16); the label is not an env var name. | None. |
| Build artifacts / installed packages | None. Zero-dep, no `package.json`, no compiled/installed artifact carries the label. The `.mjs` is run directly. | None -- verified by the fixture's zero-dep assertion. |

**The canonical question -- after every file is updated, what runtime systems still have the old label cached/stored/registered?** Answer: NONE. The `confidence` label string exists ONLY as a value computed by `tally()` at runtime and emitted to `survivors.json` (regenerated each run) + stdout. The lockstep change is therefore purely (1) the `tally()` decision block, (2) the stdout by-confidence line, (3) the fixture's documenting comment + assertions, (4) the reference doc + the `16-01-SUMMARY.md` superseding note (already added). No persisted record, service, or registration holds the old vocabulary. [VERIFIED: codebase -- git grep across fixtures + full module read]

## The Corrective Code Change (D-02) -- copy-ready

### CURRENT `tally()` rubric, VERBATIM (the function being corrected)

Source: `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` lines 477-497:

```javascript
  const refuted = seats.filter((v) => v === 'refuted').length;
  const unrefuted = seats.filter((v) => v === 'unrefuted').length;

  if (refuted >= 2) {
    return 'Rejected';
  }

  if (unrefuted === 3) {
    return 'High';
  }

  if (unrefuted === 2) {
    return 'Medium';
  }

  if (readableSeats === 0) {
    return 'Unsupported';
  }

  return 'Low/Contested';
```

The doc-comment at lines 427-428 currently reads:
```
// Rubric (PRESERVED verbatim): refuted >= 2 -> Rejected; unrefuted === 3 -> High;
// unrefuted === 2 -> Medium; zero readable seats -> Unsupported; otherwise -> Low/Contested.
```

### Variables `tally()` already reads (confirms Option I is implementable AS-IS)

- `readableSeats` (declared line 434, incremented line 454): count of seats with a readable vote file. Drives the `Unsupported` branch.
- `unrefuted` (line 478): `seats.filter(v => v === 'unrefuted').length`.
- `refuted` (line 477): `seats.filter(v => v === 'refuted').length`.
- `seats` is a 3-element array (capped at `VOTES_PER_CLAIM`=3) of `'unrefuted' | 'refuted' | 'insufficient'`.

**All three inputs the Option I rubric needs already exist.** The rewrite touches ONLY the decision block (lines 480-496). No change to the seat-reading loop, the cap-counting loop, the vote-file lookup, or the `votes_ignored` accounting. [VERIFIED: codebase -- direct read of tally() lines 429-497]

### Target rubric (Option I, D-02) -- the minimal diff

Replace the decision block (lines 480-496) with the five Option I branches IN THIS ORDER (order matters -- the split case must precede the `unrefuted === 2` Medium case so a 2-unrefuted-1-refuted tally yields `Contested`, not `Medium`):

```javascript
  if (readableSeats === 0) {
    return 'Unsupported';
  }

  if (unrefuted === 3) {
    return 'High';
  }

  if (unrefuted >= 1 && refuted >= 1) {
    return 'Contested';            // voter split: any explicit refutation alongside support
  }

  if (unrefuted === 2) {
    return 'Medium';               // refuted === 0 here (the split case is caught above)
  }

  return 'Low';                    // thin support, OR refuted-without-support (downgrade-not-delete)
```

Net change: drop the `refuted >= 2 -> 'Rejected'` branch; move the `readableSeats === 0` guard to the top (so a 0-seat claim is `Unsupported` before any other test -- behaviorally identical to today since 0 seats means 0 unrefuted/refuted, but cleaner and matches the D-02 rubric order); add the `unrefuted >= 1 && refuted >= 1 -> 'Contested'` split branch; rename the final fall-through from `'Low/Contested'` to `'Low'`. Internal variable naming is Claude's discretion (D-02 / Claude's Discretion). Also update the doc-comment at 427-428 to describe the Option I rubric.

**Behavioral truth table (the rubric maps every readable tally to exactly one tier):**

| unrefuted | refuted | insufficient | readableSeats | -> confidence | tier exercised by |
|-----------|---------|--------------|---------------|---------------|-------------------|
| 0 | 0 | 0 | 0 | `Unsupported` | NEW fixture (all seats missing) |
| 3 | 0 | 0 | 3 | `High` | existing fixtures (e.g. near-duplicate-merged) |
| 2 | 0 | 0 | 2 | `Medium` | NEW fixture (2 unrefuted, 1 missing seat) |
| 1 | 0 | 0 | 1 | `Low` | NEW fixture (1 unrefuted, 2 missing) -- thin support |
| 0 | 3 | 0 | 3 | `Low` | NEW fixture (3/3 refuted, no uphold) -- downgrade-not-delete (D-03b) |
| 2 | 1 | 0 | 3 | `Contested` | NEW fixture (2 unrefuted + 1 refuted) -- voter split |
| 1 | 1 | 1 | 2 | `Contested` | (alternative split case) |
| 1 | 2 | 0 | 3 | `Contested` | (split: >=1 unrefuted AND >=1 refuted) |

Note the load-bearing D-03b case: `0 unrefuted / 3 refuted` -> `Low` (NOT a terminal `Rejected`; surfaced, never deleted). And the load-bearing D-03 case: any mixed `unrefuted>=1 AND refuted>=1` -> `Contested`. [VERIFIED: codebase -- rubric applied against the CURRENT seat-counting code]

### CURRENT stdout by-confidence line, VERBATIM (must be updated to 5 labels)

Source: lines 546 + 560-570. The `byConfidence` helper (line 546) and the `survivors:` line of the summary array (lines 560-570) currently emit FOUR labels including the fused `Low/Contested`:

```javascript
  const byConfidence = (label) => survivors.filter((s) => s.confidence === label).length;
  ...
    'survivors: ' +
      survivors.length +
      ' (High ' +
      byConfidence('High') +
      ', Medium ' +
      byConfidence('Medium') +
      ', Low/Contested ' +
      byConfidence('Low/Contested') +
      ', Unsupported ' +
      byConfidence('Unsupported') +
      ')',
```

Update to the five labels in enum order (`High / Medium / Low / Contested / Unsupported`). Note `byConfidence('Rejected')` was never in the summary (the as-shipped summary already omitted `Rejected` -- so `Rejected` survivors were invisible in the by-confidence line, another reason it's an accidental artifact). The corrected line should read (style is Claude's discretion):

```
survivors: <Z> (High <h>, Medium <m>, Low <l>, Contested <c>, Unsupported <u>)
```

### CURRENT fixture state (what it asserts today; what the lockstep update must add)

Source: `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs`.

- **Baseline:** 13/13 GREEN today (verified via `node --test <file>`). [VERIFIED: codebase -- test run]
- **Enum-documenting comment to update** (lines 11-12): the header comment hardcodes the OLD enum:
  ```
  // quote_fidelity in {verified, downgraded}, confidence in
  // {High, Medium, Low/Contested, Rejected, Unsupported}).
  ```
  Update to `{High, Medium, Low, Contested, Unsupported}`.
- **Confidence-tier coverage TODAY:** ONLY `High` is asserted (line 87: `assert.equal(r.survivors[0].confidence, 'High')` in SC5-4). Every committed `votes/` dir contains exactly three `{"verdict":"unrefuted"}` seats (verified: near-duplicate-merged/votes/* are all `unrefuted`), so every survivor with votes lands on `High`. The fixture NEVER exercises `Medium`, `Low`, `Contested`, or `Unsupported`. [VERIFIED: codebase -- vote-file inspection across all fixtures]
- **Lockstep task (D-02):** add a per-label branch assertion so each of the 5 tiers is exercised. Four new cases are needed (High is already covered):
  - `Medium`: a survivor with 2 readable `unrefuted` seats + 1 missing seat.
  - `Low` (thin): a survivor with 1 readable `unrefuted` seat + 2 missing.
  - `Low` (downgrade-not-delete, D-03b): a survivor with 3 `refuted` seats and 0 uphold -> must be `Low` AND must still appear in survivors (NOT deleted).
  - `Contested` (D-03): a survivor with >=1 `unrefuted` AND >=1 `refuted` seat -> `Contested`.
  - `Unsupported`: a survivor with 0 readable vote seats (no `votes/` files for that cluster) -> `Unsupported`.

  Each new case is constructible either as a committed `__fixtures__/<case>/{claims,excerpts,votes}/` tree (matching the existing pattern: a `claims/w1.json` worker, an `excerpts/e1.txt` whose text contains the quote verbatim so the claim survives quote-recheck, and a `votes/cluster0-<seat>.json` set with the verdicts that produce the target tier) OR via a temp-run-dir helper. NOTE the vote-file naming: `tally()` looks up `<clusterId>-<seat>.json` FIRST (the first cluster is always `cluster0`), then `<memberId>-<seat>.json`. The committed High-tier fixtures use `cluster0-0/1/2.json`, so the new fixtures should follow the same `cluster0-<seat>.json` convention. A missing seat file = `insufficient` (no file written for that seat). [VERIFIED: codebase -- tally() vote-lookup lines 436-455 + fixture vote naming]

## Common Pitfalls

### Pitfall 1: Freezing the as-shipped (uncorrected) code into the doc
**What goes wrong:** The reference doc copies `confidence: 'High' | 'Medium' | 'Low/Contested' | 'Rejected' | 'Unsupported'` from the current `aggregate()`/`tally()`, immortalizing the spike artifact GA-1 exists to remove.
**Why it happens:** D-12 says "copy verbatim from the code" -- but the code must be CORRECTED first.
**How to avoid:** Sequence the plan so the corrective code task (rewrite `tally()` + stdout + fixture) lands BEFORE the doc's frozen-shape sections are written. Freeze the CORRECTED code.
**Warning signs:** The doc contains `Rejected` or `Low/Contested` anywhere except a historical "superseded" note.

### Pitfall 2: Wrong branch order in the Option I rewrite (Medium shadows Contested)
**What goes wrong:** If the `unrefuted === 2` Medium branch is placed BEFORE the `unrefuted >= 1 && refuted >= 1` split branch, a 2-unrefuted/1-refuted tally returns `Medium` instead of `Contested`, erasing the dissent the Contested value exists to surface.
**Why it happens:** The current code tests `unrefuted === 2` before the (new) split test; a naive insertion preserves the wrong order.
**How to avoid:** Place the split branch (`unrefuted >= 1 && refuted >= 1 -> 'Contested'`) BEFORE the `unrefuted === 2 -> 'Medium'` branch, exactly as the D-02 rubric is ordered. The Medium-branch comment must note `refuted === 0 here`.
**Warning signs:** A `Contested` fixture (2 unrefuted + 1 refuted) asserts `Medium` and "passes."

### Pitfall 3: Conflating the two assurances (VERIF-06 failure)
**What goes wrong:** The doc derives `claim_support` from `quote_fidelity`, or describes them as one combined field.
**Why it happens:** Both look like "verification" fields; it's tempting to collapse them.
**How to avoid:** D-04/D-05: two separate field names, two separate owners (aggregator-mechanical vs voter/synthesis-judgment), one worked example showing `quote_fidelity: verified` + `claim_support: unsupported` coexisting. The exact orthogonality VERIF-06 requires.
**Warning signs:** The doc has only one assurance field, or says `claim_support` defaults from `quote_fidelity`.

### Pitfall 4: The node:test directory-form exit-1 host quirk
**What goes wrong:** The validation command uses `node --test <dir>` and spuriously exits 1 even when every test passes, producing a false failure that blocks the phase gate.
**Why it happens:** Documented host quirk (Node v24.13.0 / Windows arm64 / Git Bash); recurs for every `node:test` in this repo (memory `reference_node_test_dir_exit1_quirk`; flagged in the fixture header lines 14-18).
**How to avoid:** ALWAYS gate on the explicit FILE form: `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs`. Never the directory form.
**Warning signs:** A green-looking test list followed by exit code 1.

### Pitfall 5: CRLF / non-ASCII bytes in the new files
**What goes wrong:** The Write tool inserts a literal U+FEFF BOM (it did exactly this in Phase 16, per the SUMMARY "Issues Encountered") or CRLF leaks into the `.mjs`/`.md`, breaking the pure-ASCII / zero-non-ASCII invariant.
**Why it happens:** Windows host; the Write tool can emit BOM/CRLF; the source must remain pure ASCII (the BOM must appear ONLY as the 6-character JS escape backslash-u-F-E-F-F, never as a literal byte).
**How to avoid:** After editing the `.mjs`/`.test.mjs`/`.md`, scan for non-ASCII bytes (`rg -n "[^\x00-\x7F]"` returning nothing) before committing, as Phase 16 did. The reference doc + code must be pure ASCII per global CLAUDE.md.
**Warning signs:** `rg -n "[^\x00-\x7F]"` finds a byte; the zero-dep fixture or a downstream parse fails on a BOM.

### Pitfall 6: Introducing scope creep (the raw vote-count triple, a second confidence field, ajv)
**What goes wrong:** The doc adds `{unrefuted, refuted, insufficient}` to the record, or a `report_confidence`, or a formal JSON Schema validator.
**Why it happens:** They feel like natural completeness additions.
**How to avoid:** All three are explicitly OUT (D-03c / GA-1 / Deferred Ideas). The `Contested` enum value IS the split signal; one enum byte-identical in code+contract; the aggregator's fail-closed parse IS the enforcement.
**Warning signs:** A `report_confidence` field, a `$schema` key, or a `{unrefuted,...}` object on the survivor record.

## Code Examples

### The CURRENT survivor record (frozen by Phase 17 after the D-02 correction)

Source: `aggregate()` lines 524-531 (the per-cluster map) -- this is the EXACT field set, in this order:

```javascript
  const survivorRecords = capped.map((cl) => ({
    id: cl.id,
    claim: cl.text,
    sources: [...cl.sources].sort(),
    corroboration_lower_bound: cl.sources.size,
    quote_fidelity: cl.quote_fidelity,
    confidence: tally(cl, runDir, caps),
  }));
```

Rendered as JSON (post-correction the `confidence` value is one of the 5-tier enum):
```json
{
  "id": "cluster0",
  "claim": "X reduces Y by 30%",
  "sources": ["s1", "s2"],
  "corroboration_lower_bound": 2,
  "quote_fidelity": "verified",
  "confidence": "High"
}
```
[VERIFIED: codebase -- aggregate() lines 524-531]

### The CURRENT `dropped` record (frozen) -- the ONLY claim-removal path

Source: `recheckClusters()` line 360:
```javascript
dropped.push({ id: cl.id, claim: cl.text, reason: 'quote-not-in-any-excerpt' });
```
This is the only path that removes a claim (D-03b: the tally never deletes). Frozen shape: `{ id, claim, reason }` with `reason: 'quote-not-in-any-excerpt'`. [VERIFIED: codebase -- recheckClusters line 359-361]

### The frozen `CEILINGS` block (copy verbatim into the named-ceilings contract)

Source: lines 115-121:
```javascript
export const CEILINGS = Object.freeze({
  ANGLES: 5,
  MAX_FETCH: 15,
  MAX_VERIFY_CLAIMS: 24,
  VOTES_PER_CLAIM: 3,
  SYNTH_CAP: 20,
});
```
The contract must note (per the code comment at lines 104-121): the aggregator ACTIVELY ENFORCES `MAX_VERIFY_CLAIMS` (cap on ranked clusters into tally), `VOTES_PER_CLAIM` (max vote seats read per claim; extras counted into `caps.votes_ignored`), and `SYNTH_CAP` (cap on the survivors output array). It CARRIES `ANGLES` and `MAX_FETCH` as the shared contract, enforced by the Phase-20 orchestrator at wave dispatch, NOT by the aggregator. [VERIFIED: codebase -- CEILINGS + the comment block lines 100-121]

### The quote-recheck three-way outcome (copy verbatim into the quote-recheck contract)

Source: `quoteOutcome()` lines 303-331. The three outcomes:
- `verified`: quote verbatim-present in its CITED excerpt (`cited.includes(nq)` where `nq = normalize(member.quote)`).
- `downgraded`: quote absent from cited excerpt but present in SOME OTHER stored excerpt (`allExcerpts.some(ex => ex.includes(nq))`) -- real text, wrong attribution, KEPT, fidelity lowered, NOT dropped.
- `dropped`: quote absent from ALL stored excerpts (fabricated/drifted), OR empty normalized quote.

The WR-04 normalized-SUBSTRING caveat (lines 314-321), copy-ready -- this is the accepted lower-bound fidelity property:
```
// WR-04 (accepted, frozen): the re-check is a normalized-SUBSTRING test (.includes on the
// space-joined token string), NOT a token-sequence/boundary test. A short numeric quote can
// therefore match inside a longer token -- e.g. normalize('30') is "present" in
// normalize('the rate is 130 overall') ... This is the proven, frozen lexical contract ...
// an accepted LOWER-BOUND fidelity property, consistent with the "corroboration is a lower bound"
// framing (D-09): the re-check guards verbatim CONSISTENCY only and may over-verify on substrings.
```

Cluster-level `quote_fidelity` (from `recheckClusters` line 367): `'verified'` if >=1 kept member is `verified`, else `'downgraded'`; a cluster with zero kept members is `dropped`. Comparison runs through `normalize()` (lines 57-79: BOM strip + CRLF/CR->LF + lowercase + non-alnum->space + number-word fold + drop `percent`), so CRLF/BOM excerpts match LF quotes. [VERIFIED: codebase -- quoteOutcome + recheckClusters + normalize]

### The CURRENT stdout summary structure (4 lines; line 4 gets the 5-label update)

Source: lines 556-571. The four lines:
```
raw: <rawCount> -> clusters: <clusterCount> (merged: <K>)
quote-recheck: verified <A> | downgraded <B> | dropped <C>
capped: <none | claims X->24 [synth Y->20] [votes_ignored N]>
survivors: <Z> (High <h>, Medium <m>, Low/Contested <l>, Unsupported <u>)   <-- D-02 updates this to 5 labels
```
Exit codes (lines 584-602): `0` on success (writes `survivors.json`, prints summary); `2` on contract violation (missing/invalid run-dir, any `ContractError` -- stderr names the offending file). [VERIFIED: codebase -- summary array + CLI block]

### The run-dir input layout (frozen) + the new source record (forward-declared)

```
<run-dir>/claims/<worker-id>.json   -> {"worker","source","claims":[{"id","text","quote","excerpt_id"}]}
<run-dir>/excerpts/<excerpt-id>.txt -> plain UTF-8 (CRLF or LF; BOM tolerated)
<run-dir>/votes/<id>-<seat>.json    -> {"verdict":"unrefuted"|"refuted"}  (missing seat -> "insufficient")
<run-dir>/sources/<source-id>.json  -> {"id","url","title","fetched_at",...}  (NEW; D-07; aggregator does NOT read it)
<run-dir>/survivors.json            -> the output array (<= SYNTH_CAP)
```
The `claims[].source` value, the `survivors[].sources[]` entries, and the `sources/<source-id>.json` `id` MUST be the SAME canonical source key (D-08 canonical-URL rule). [VERIFIED: codebase -- mergeClusters reads claims/<f>.json with w.source + claims[]; tally reads votes/<id>-<seat>.json; 16-01-SUMMARY input-layout block]

## State of the Art

| Old Approach (Phase 16 as-shipped) | Current Approach (Phase 17 GA-1) | When Changed | Impact |
|------------------------------------|----------------------------------|--------------|--------|
| 5 spike labels: `High | Medium | Low/Contested | Rejected | Unsupported` | 5 ratified labels: `High | Medium | Low | Contested | Unsupported` | 2026-06-15 (GA-1 unanimous cross-model consensus) | `Rejected` dropped (downgrade-not-delete); `Low/Contested` un-fused; tally emits `Contested` on a per-claim voter split. |
| `refuted >= 2 -> Rejected` (terminal delete-like) | `0 unrefuted / N refuted -> Low` (surfaced, never deleted) | 2026-06-15 | D-03b structural downgrade-not-delete; ROADMAP SC-2. |
| `Contested` not a distinct enum value (fused into `Low/Contested`) | `Contested` first-class, emitted by the tally on a split | 2026-06-15 | PIPE-08; the VERIF-05 escalation signal (D-03). |

**Deprecated/outdated:**
- The `16-01-SUMMARY.md` "LOAD-BEARING Output Contract" confidence-vocab lines (`Rejected`, `Low/Contested`) -- already carry a "SUPERSEDED IN PART by Phase 17" banner (verified, lines 89). The reference doc + the corrected code are the new authority; the SUMMARY note points at 17-CONTEXT.md.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| -- | (none) | -- | Every factual claim in this research was read directly from committed source (the aggregator, its fixture, the Phase-16 SUMMARY, CONTEXT.md, the four references) and verified by running the test. No claim rests on training data or web sources. The table is empty by design. |

**All claims in this research were verified against the codebase -- no user confirmation needed.** The locked decisions (D-01..D-12) are the user's; this research does not assume any of them, it copies them.

## Open Questions

1. **Committed per-tier fixtures vs temp-run-dir helper for the four new tier cases.**
   - What we know: the fixture already supports BOTH patterns (committed `__fixtures__/<case>/` trees, and the `tmpRunDirWithWorker` / inline temp-run-dir helpers at lines 109-116 + 187-217).
   - What's unclear: which pattern the planner should mandate for the four new tier cases. Committed trees are more readable/inspectable and match the existing High/Medium/Low... convention; temp-run-dirs avoid committing more fixture files and dodge the BOM/CRLF commit risk.
   - Recommendation: prefer committed `__fixtures__/<case>/{claims,excerpts,votes}/` trees for the four new cases (matches the existing pattern, keeps the fixture self-documenting), EXCEPT use a temp-run-dir for the `Unsupported` case if a fixture-with-no-votes-dir reads oddly. This is Claude's discretion (fixture authoring style); either satisfies the per-label-branch requirement.

2. **`claim_support` not-yet-judged state name (`unassessed` vs `pending` vs `null`).**
   - What we know: D-04 fixes the SEMANTICS (a not-yet-voted state distinct from `supported|partial|unsupported`); the NAME is explicitly Claude's discretion.
   - Recommendation: `unassessed` (the CONTEXT.md example) -- it reads as "not yet judged" without colliding with `null` (which could mean "field absent") or `pending` (which implies an in-flight async state). Document the chosen name in the doc; the planner can let the doc-author pick.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | running the aggregator + node:test fixture | YES | v24.13.0 (host) | -- |
| `node:test` + `node:assert/strict` | the validation fixture | YES (bundled with Node) | bundled | -- |
| `rg` | non-ASCII byte scan before commit (Pitfall 5) | YES (host, allowed) | -- | `git grep` for tracked-file content (cannot scan untracked) |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None. The phase is code/doc-only with the existing zero-dep toolchain. No `npm install`, no external service, no network dependency (web research for this phase is minimal-to-none -- the JSON-Schema convention is explicitly OUT per Deferred Ideas).

## Validation Architecture

> nyquist_validation is `true` in `.planning/config.json` -- this section is required. The corrective aggregator code task IS testable via the existing node:test fixture.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` + `node:assert/strict` (Node stdlib; zero-dep) |
| Config file | none (no `package.json`; the only imports are `node:*` + the aggregator under test) |
| Quick run command | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` |
| Full suite command | same (the suite is a single file) |

**HOST QUIRK (load-bearing):** On this host (Node v24.13.0 / Windows arm64 / Git Bash) the validation command MUST target the explicit FILE form above. The directory form (`node --test <dir>`) spuriously exits 1 even when every real test passes (memory `reference_node_test_dir_exit1_quirk`; documented in the fixture header lines 14-18). NEVER gate on the directory form.

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PIPE-07 | Aggregator emits the 5-tier enum; tally maps every readable tally to exactly one tier | unit | `node --test .../lz-deep-research-aggregate.test.mjs` (per-label branch assertions: High existing; Medium/Low/Contested/Unsupported NEW) | partial -- High covered; Medium/Low/Contested/Unsupported are Wave 0 gaps |
| PIPE-07 | `Contested` emitted on a per-claim voter split (>=1 unrefuted AND >=1 refuted) | unit | same | NEW (Wave 0) |
| PIPE-07 | Downgrade-not-delete: 3/3 refuted -> `Low`, claim still present (NOT deleted) | unit | same | NEW (Wave 0) |
| PIPE-07 / D-02 | stdout by-confidence line reports the 5 labels | unit | same (assert summary substring `High .. Medium .. Low .. Contested .. Unsupported`) | NEW (Wave 0) |
| VERIF-06 | Two assurances documented as separate fields with a worked example | doc-review (manual) | reviewer reads `references/lz-deep-research-schema.md`; the field shapes (`quote_fidelity` frozen + `claim_support` new) are contract prose, not executable code in this phase | N/A (doc; Phase 18/20 populate/test `claim_support`) |

Note: VERIF-06 is satisfied by the REFERENCE DOC defining two separate fields. `claim_support` is voter/synthesis-owned (Phase 18/20) -- it is NOT emitted by the aggregator in this phase, so there is no aggregator test for it here. Its presence is a contract assertion (doc review), not a runtime test.

### Sampling Rate
- **Per task commit:** `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (file form).
- **Per wave merge:** same (single file).
- **Phase gate:** full suite green (now >=17 tests after the four new tier cases + the stdout-label assertion) before `/gsd:verify-work`; PLUS a pure-ASCII scan (`rg -n "[^\x00-\x7F]"` returns nothing on the edited `.mjs`/`.test.mjs`/`.md`).

### Wave 0 Gaps
- [ ] `Medium`-tier fixture/assertion (2 readable `unrefuted` seats + 1 missing) -- covers PIPE-07
- [ ] `Low`-tier (thin) fixture/assertion (1 readable `unrefuted` seat + 2 missing) -- covers PIPE-07
- [ ] `Low`-tier (downgrade-not-delete, D-03b) fixture/assertion (3/3 `refuted`, claim present + `Low`) -- covers PIPE-07 + D-03b
- [ ] `Contested`-tier fixture/assertion (>=1 `unrefuted` AND >=1 `refuted`) -- covers PIPE-07 + D-03
- [ ] `Unsupported`-tier fixture/assertion (0 readable vote seats) -- covers PIPE-07
- [ ] stdout by-confidence 5-label assertion (a survivors set spanning multiple tiers; assert the summary line names all 5 labels) -- covers D-02
- [ ] Update the fixture header enum-documenting comment (lines 11-12) to `{High, Medium, Low, Contested, Unsupported}`

*(The framework + the committed-fixture pattern + the temp-run-dir helper already exist; no framework install. The gaps are net-new fixture data + assertions, not new infrastructure.)*

## Security Domain

> `security_enforcement` is not explicitly `false` in config (the key is absent -> treat as enabled). This phase is documentation + a deterministic-label refactor with NO new attack surface, but the existing hardening the contract freezes is recorded for completeness.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth surface (skill-internal helper). |
| V3 Session Management | no | No sessions. |
| V4 Access Control | no | No access-control surface. |
| V5 Input Validation | yes | The aggregator FAIL-CLOSES on malformed input: `JSON.parse` via `readJson` + `ContractError`; WR-01/02/03 reject missing `text`/`quote`/`source`; `safeId` rejects path-traversal ids (basename-only guard, lines 144-154). The contract documents these as the runtime enforcement (the reason a formal JSON Schema is unnecessary). FROZEN -- the corrective change must not weaken them. |
| V6 Cryptography | no | No crypto. |
| V12 File Resources (path traversal) | yes | `safeId()` rejects ids containing path separators / `.` / `..` (V12 / T-16-01). Frozen; the new fixtures' ids must remain safe basenames. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via a crafted excerpt/worker id | Tampering / Elevation | `safeId()` basename-only guard (frozen, lines 144-154). |
| Malformed/corrupt run-dir JSON silently producing a corrupt frozen artifact | Tampering | Fail-closed `ContractError` + WR-01/02/03 field guards (frozen); exit code 2 names the offending file. |
| Prompt injection via fetched web content (downstream, Phase 19/20) | Tampering | OUT OF SCOPE for this phase (no fetch here); the existing `<fetched source trust="untrusted">` wrapper (context-packaging.md Rule 5a) handles it downstream. |
| Number-substring over-verification (WR-04) | -- (accepted lower-bound, not a vuln) | Documented as an accepted lower-bound fidelity property; the contract must NOT "fix" it without re-freezing match semantics. |

The corrective `tally()` change touches ONLY the confidence-decision branches -- it does not touch any validation, path-safety, or fail-closed code path. No security regression risk if the change is confined as specified.

## Sources

### Primary (HIGH confidence -- read directly this session)
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (full, 553 lines) -- every aggregator-consumed/emitted shape, `tally()` lines 429-497, `aggregate()` survivor map 524-531, stdout summary 556-571, `CEILINGS` 115-121, `quoteOutcome` 303-331, `recheckClusters` 337-373, `mergeClusters` 201-257, CLI/exit 584-602.
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (full, 268 lines) -- baseline 13/13 GREEN; enum comment 11-12; only-`High` coverage 87; temp-run-dir helpers 109-116 + 187-217; zero-dep + host-quirk header.
- Test run output: `node --test <file>` -> 13 pass / 0 fail (this session).
- Fixture tree + vote-file inspection: every `votes/` dir = three `unrefuted` seats (confirms only-`High` coverage); `cluster0-<seat>.json` naming convention.
- `.planning/phases/17-json-schema-verification-contract-reference/17-CONTEXT.md` (D-01..D-12, scope fences) and `17-DISCUSSION-LOG.md` (GA-1 consensus protocol + GA-2..GA-5 trade-off tables).
- `.planning/phases/16-.../16-01-SUMMARY.md` "LOAD-BEARING Output Contract" (the superseded-in-part banner; the input-layout + summary + exit-code transcription).
- `.planning/REQUIREMENTS.md` (PIPE-07, VERIF-06 + the downstream consumers + Out of Scope table).
- `.planning/research/SESSION-DESIGN.md` lines 93/95/139 (Contested at the per-claim tally; downgrade-not-delete; first-class Contested).
- `.planning/research/PITFALLS.md` Pitfalls 8/9/10/11/13/14 (corroboration lower bound; two assurances; zero-dep + CRLF; refuted-as-deletion; cross-skill references).
- `plugins/lz-advisor/references/{advisor-timing,context-packaging,verify-target-selection,orient-exploration}.md` -- the house-style model (see Metadata).
- `.planning/config.json` (nyquist_validation true; commit_docs true).

### Secondary (MEDIUM confidence)
- (none -- no web sources needed; the phase is codebase-internal freeze-from-code.)

### Tertiary (LOW confidence)
- (none.)

## House-Style Model (for the doc-authoring task)

The new reference is the FIFTH file in `plugins/lz-advisor/references/`. Observed shared house style across the four existing files (advisor-timing, context-packaging, verify-target-selection, orient-exploration):

- **Title:** a single `#` H1 naming the contract (e.g. "Verify Target Selection by Change Surface", "Context Packaging for Advisor Consultations"). Suggested: "Deep-Research Data-Contract Schema" or similar.
- **Intent paragraph:** the first prose block states what the file is the single source of truth FOR and who consumes it (e.g. "This is the single source of truth for choosing the verification command... Both `plan` and `execute` consume this contract"). Mirror this: state the anti-drift rule (aggregator source authoritative) and the consumers (Phase 18 eval/voter, Phase 19 workers, Phase 20 orchestrator/synthesis).
- **Section depth:** `##` for major sections; `###` for sub-sections (e.g. context-packaging's "### Source Material vs Your Own Findings", "### Structure", "### Worked Example"). Prose-heavy, not bullet-only.
- **Contracts rendered as:** fenced code blocks for shapes/templates/commands (context-packaging uses fenced ``` blocks for the Proposal/Verification templates; verify-target-selection uses prose + bullet mappings). Tables for enumerated mappings (context-packaging's "When to Use Each Template" table; this research's truth tables are a fit). The doc may use fenced ```json + field tables OR annotated examples (Claude's discretion per D-decisions), provided every field's name/type/allowed-values/owner/stage is unambiguous.
- **Worked examples:** the existing files lead with a principle then show a worked example (verify-target-selection "## Worked examples"; context-packaging "### Worked Example"). The VERIF-06 two-assurance orthogonality MUST have a worked example (`verified` + `unsupported` coexisting) -- this matches the house pattern.
- **Cross-references:** existing files cross-link via `references/<name>.md` and `${CLAUDE_PLUGIN_ROOT}` (context-packaging references orient-exploration.md). The new doc should cite the aggregator source path + the exact function names (D-12), and may reference the other references for shared concepts -- but must NOT reference another SKILL's named sections (Pitfall 14).
- **Tone:** declarative, contract-style, no emoji, ASCII-only (global CLAUDE.md). Caveats stated explicitly (verify-target-selection's "## Tooling freshness (stale-daemon caveat)" models the "state the limit" pattern -- mirror it for the WR-04 lower-bound caveat and the corroboration-lower-bound caveat).

[VERIFIED: codebase -- all four reference files read in full this session]

## Metadata

**Confidence breakdown:**
- Frozen aggregator shapes (survivor/dropped/CEILINGS/quote-recheck/stdout/run-dir/vote): HIGH -- read verbatim from committed source + cross-checked against 16-01-SUMMARY; test run confirms behavior.
- The Option I corrective rubric implementability: HIGH -- the three required inputs (`readableSeats`, `unrefuted`, `refuted`) all exist in the current `tally()`; the change is a confined decision-block rewrite.
- Current fixture coverage (only `High`): HIGH -- inspected every committed `votes/` dir; all `unrefuted`x3.
- House style: HIGH -- all four reference files read in full.
- Locked decisions: copied verbatim from CONTEXT.md (not assessed -- they are the user's).

**Research date:** 2026-06-15
**Valid until:** stable -- the inputs are committed source files in this repo, not fast-moving external facts. Re-verify only if the aggregator or its fixture is edited before the plan executes (re-read the changed function + re-run the file-form test).
