# Phase 16: Deterministic off-model aggregator + validation fixture - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-15
**Phase:** 16-deterministic-off-model-aggregator-validation-fixture
**Mode:** `--auto --analyze --chain` (autonomous selection of recommended options; trade-off tables retained for audit; auto-advance to plan-phase)
**Areas discussed:** CLI/IO contract, Quote re-check taxonomy, Dedup/source-independence, Ceiling enforcement, Validation fixture harness

---

## CLI / IO contract (GA-1)

| Option | Description | Selected |
|--------|-------------|----------|
| Positional `<run-dir>` arg + stdout receipt | One positional run-dir; reads `claims/`/`excerpts/`/`votes/`; writes `survivors.json` + bounded deterministic stdout summary | True |
| Many CLI flags | `--claims-dir`, `--out`, etc. | |
| Env-var driven | Paths via `LZ_DR_*` env vars | |

**Auto-selected:** Positional `<run-dir>` arg + stdout receipt.
**Rationale:** Matches SC-1 ("against a directory of worker files") and the A2-proven single named non-git `Bash(node:*)` call (fewest moving parts under `--permission-mode auto`). Flags/env add surface the orchestrator does not need. Phase 17 freezes the resulting IO shapes against this proven behavior rather than inventing them.

---

## Quote re-check outcome taxonomy + match strictness (GA-2)

| Option | Description | Selected |
|--------|-------------|----------|
| Keep prototype binary keep/drop | Quote-in-cited-excerpt -> keep; else drop | |
| Three-way verified / downgraded / dropped | + a "real text, wrong excerpt" middle state | True |
| Fuzzy / embedding match | Tolerant similarity instead of verbatim substring | |

**Auto-selected:** Three-way taxonomy, normalized-substring match (the proven test), run UPSTREAM of tally.
**Rationale:** SC-5 demands BOTH "fabricated quote dropped" AND "real-quote/wrong-passage downgraded" -- a binary keep/drop cannot express the second. Fuzzy/embedding matching violates zero-dep and determinism. The aggregator guards verbatim CONSISTENCY only; ENTAILMENT (quote-supports-claim) is the voter's job (Phase 18), reported as a separate assurance (Phase 17). Sources: Pitfall 9, VERIF-04, SESSION-DESIGN SS8.

---

## Dedup + corroboration / source independence (GA-3)

| Option | Description | Selected |
|--------|-------------|----------|
| Raw claim count = corroboration | Each near-dup claim adds to confidence | |
| Distinct-source Jaccard (number-word normalized, bias under-merge) | Merge near-dups; corroboration = distinct sources; paraphrase-from-one-source counts once | True |
| Add embedding/semantic dedup | Solve paraphrase under-merge with vectors | |

**Auto-selected:** Distinct-source Jaccard (>= 0.6), number-word normalized, biased toward under-merging; corroboration = distinct-source count; count labeled a LOWER bound.
**Rationale:** Raw-count inflates confidence from syndicated/paraphrased copies (the exact Pitfall 8 failure). Embeddings violate the zero-dep constraint (Out-of-Scope table). The spike proved 0.6 + number-word normalization; the residual semantic under-merge is documented, not solved. SC-5 needs "paraphrase pair NOT double-counted" + "near-duplicate pair merged" -- both fall out of distinct-source counting. (AGGX-01 deferred; STATE.md Phase-16 watch item.)

---

## Ceiling enforcement semantics (GA-4)

| Option | Description | Selected |
|--------|-------------|----------|
| Documented only | Ceilings as comments/docs, not enforced | |
| In-code constants, cap after rank, observable | Single constants block; cap top-N; record the cap in the summary | True |
| Fully config-driven | All ceilings sourced from runtime config | |

**Auto-selected:** In-code constants (`ANGLES~5`, `MAX_FETCH=15`, `MAX_VERIFY_CLAIMS~24`, `VOTES_PER_CLAIM=3`, `SYNTH_CAP~20`); over-ceiling input capped deterministically after ranking; cap action recorded observably in stdout. Optional env override deferred.
**Rationale:** AGG-06 + SC-4 require code-enforcement ("not left to model discretion"); documented-only defeats boundedness (Pitfall: unbounded waves). Fully-config is a Phase 20 orchestrator concern. "No silent caps" (CLAUDE.md) -> the cap must be observable. ARCHITECTURE.md's "raise ceilings via config" for medium runs is noted as an optional, defaults-unchanged override -> Claude's discretion / Phase 20.

---

## Validation fixture harness (GA-5)

| Option | Description | Selected |
|--------|-------------|----------|
| Bash `tests/*.sh` smoke script | Matches the existing review-skill budget-gate convention | |
| `node:test` + `node:assert`, co-located | Stdlib test, zero-dep, committed fixture dirs under the skill | True |
| Inline `--self-test` mode | Prototype-style assertions inside the aggregator | |

**Auto-selected:** `node:test` + `node:assert`, run via `node --test`; aggregator + test + `__fixtures__/` co-located under `skills/lz-deep-research/scripts/`.
**Rationale:** A JSON-heavy aggregator under bash invites the exact heredoc/quoting/CRLF hazards CLAUDE.md forbids; `node:test` is stdlib (zero-dep) and cross-platform. The existing `tests/*.sh` fixtures are text-parsing gates for the REVIEW skills -- a different domain, not a precedent to match. Inline `--self-test` keeps test data inside the production script (the prototype's shortcut); separating them keeps the aggregator a pure lib + thin CLI. Fixtures are REAL committed files authored fresh (memory `project_phantom_smoke_fixtures` -- do not "reuse" uncommitted ones).

---

## Claude's Discretion

- Exact stdout summary wording/format (bounded + deterministic + counts observable is the only constraint).
- Whether to wire the optional `LZ_DR_*` ceiling env override now vs defer to Phase 20.
- Internal function names, file-split granularity, `survivors.json` pretty-print, and whether to keep `dropped.json` / `ranked.json` intermediates on disk.

## Deferred Ideas

- Semantic/paraphrase dedup beyond number-word variance (AGGX-01, v2; no embeddings).
- Config-driven ceiling raising for medium runs (Phase 20 orchestrator).
- In-flight concurrency / wave-batching ceiling (COST-03, Phase 20 -- not the aggregator).
- Claim-vs-quote entailment (voter, Phase 18; two-assurance distinction frozen in Phase 17).
- Crash-resumability beyond rerun-from-immutable-inputs (SCALE-03, v2).

## Reviewed Todos (not folded)

- **Research RTK command suitability for skills and agents** (match score 0.6) -- reviewed, NOT folded. It is about `rtk git diff` token-savings for the review/security-review skills, unrelated to a deterministic Node aggregator; folding it would breach the scope guardrail. Stays in the backlog.
