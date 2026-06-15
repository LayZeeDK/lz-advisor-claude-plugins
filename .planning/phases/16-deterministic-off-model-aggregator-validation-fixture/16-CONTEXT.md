# Phase 16: Deterministic off-model aggregator + validation fixture - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning
**Mode:** `--auto --analyze --chain` (autonomous discuss; trade-off tables logged in DISCUSSION-LOG.md; auto-advances to plan-phase)

<domain>
## Phase Boundary

This phase delivers ONE thing: a reproducible, auditable, zero-dependency Node ESM script --
`plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- that performs
every dedup / ranking / vote-tally / quote-vs-stored-excerpt re-check OFF-MODEL (zero model tokens),
enforces the named ceilings in code, runs CRLF- and path-safe on Windows arm64 / Git Bash, and is
locked down by a COMMITTED validation fixture asserting its load-bearing correctness behaviors.

It HARDENS the already-proven spike A1 prototype (`plans/_spike/aggregate-spike.mjs`, PASS) into a
production CLI + test. It is the foundation contract that everything downstream (Phase 17 schema,
Phase 18 eval tally, Phase 19 worker file layout, Phase 20 orchestrator invocation) feeds.

**Requirements covered (from REQUIREMENTS.md / ROADMAP.md):** AGG-01, AGG-02, AGG-04, AGG-06, VERIF-04.

**In scope:** the aggregator script (dedup, corroboration, rank/cap, quote re-check, vote tally,
bounded outputs); in-code ceiling enforcement; the committed `node:test` validation fixture + fixture data.

**Out of scope (other phases):** the frozen JSON schema + tally rubric reference (Phase 17); the
verify-voter agents + gating eval (Phase 18); the search/extract workers that WRITE the files this
reads (Phase 19); the orchestrator skill, `.lz-research/` gitignore, concurrency/wave-batching, and
the audit-trail retention (Phase 20). Semantic/embedding dedup (v2, AGGX-01) is explicitly excluded.

</domain>

<decisions>
## Implementation Decisions

### CLI / IO contract (GA-1)
- **D-01:** Invocation is a single positional argument: `node "<...>/scripts/lz-deep-research-aggregate.mjs" <run-dir>` where `<run-dir>` is the `.lz-research/<run-id>/` directory. No flags on the core path (keeps it to the A2-proven single named non-git `Bash(node:*)` call). Reference via `${CLAUDE_PLUGIN_ROOT}` at the skill layer; the script itself takes a plain path arg.
- **D-02:** The run dir uses three conventional IMMUTABLE subdirectories the script enumerates with `fs.readdirSync` + `path.join` (NO shell globbing): `claims/<worker-id>.json` (per-worker extract files), `excerpts/<excerpt-id>.txt` (immutable stored excerpts), `votes/<claim-or-cluster-id>-<seat>.json` (one file per claim x seat). This is exactly the spike A1 layout (`plans/_spike/run/{claims,excerpts,votes}`); the Phase 19 workers MUST write to it.
- **D-03:** Outputs are (a) `survivors.json` written into the run dir -- bounded, top <= SYNTH_CAP, verbatim evidence only; and (b) a bounded DETERMINISTIC stdout summary (counts: raw->clusters, merged, dropped-by-recheck, downgraded, capped-by-ceiling, survivors-by-confidence) that is the orchestrator's receipt -- raw source text NEVER returns through stdout. Exit NON-ZERO on contract violation (missing run dir, malformed worker file). Phase 17 FREEZES these exact shapes against this proven behavior (it does not invent them).

### Quote re-check outcome taxonomy + match strictness (GA-2)
- **D-04:** Match strictness = the spike-proven normalized-substring test ONLY: lowercase, strip non-alphanumeric to spaces, number-word fold (`thirty`->`30`), drop the token `percent`, then `normalize(excerpt).includes(normalize(quote))`. Deterministic, zero-dep, explicit LF normalization. NO fuzzy / NO embedding matching.
- **D-05:** THREE-way outcome (extends the prototype's binary keep/drop so SC-5's two distinct cases are both expressible):
  - quote verbatim-present in its CITED excerpt (`excerpt_id`) -> **VERIFIED** (kept, full quote-fidelity assurance);
  - quote absent from its cited excerpt BUT verbatim-present in SOME OTHER stored excerpt -> **DOWNGRADED/FLAGGED** (real text, wrong attribution -- kept but quote-fidelity assurance lowered, NOT dropped);
  - quote absent from ALL stored excerpts -> **DROPPED** (fabricated/drifted).
- **D-06:** The re-check runs UPSTREAM of all vote-tally (VERIF-04, SC-3). Every drop/downgrade is OBSERVABLE in the stdout summary and the `survivors.json` / `dropped` record BEFORE any vote is considered. The aggregator guards verbatim CONSISTENCY only; claim-vs-quote ENTAILMENT (does the quote support the claim?) is the voter's job (Phase 18) and is reported as a SEPARATE assurance (frozen in Phase 17). See Pitfall 9.

### Dedup + corroboration / source independence (GA-3)
- **D-07:** Dedup = number-word-normalized token-Jaccard at the spike-proven merge threshold (>= 0.6), BIASED toward UNDER-merging (keep separate when in doubt) so dissent is preserved and surfaced. Lexical-only; NO embedding/semantic dependency (zero-dep constraint; Pitfall 8; AGGX-01 deferred).
- **D-08:** Corroboration is counted by DISTINCT SOURCE (source id / canonical URL) via a Set -- NOT by raw claim count. A paraphrase pair tracing to ONE source counts as ONE corroboration; near-duplicate claims from DIFFERENT sources merge into one cluster with corroboration = distinct-source count. (Satisfies SC-5 "paraphrase pair NOT double-counted as independent" AND "near-duplicate pair merged"; this is where VERIF-03's source-independence principle is COMPUTED -- it is formalized as a contract in Phase 17 and the voter weighting lands in Phase 18.)
- **D-09:** The corroboration count is treated and labeled as a LOWER bound ("at least N near-duplicate sources"), never an exact independence count. The semantic-paraphrase under-merge residual is DOCUMENTED as a known limit (in code comments + the eventual report's phrasing), not solved with a new dependency. (Pitfall 8 residual; STATE.md Phase-16 watch item.)

### Ceiling enforcement semantics (GA-4)
- **D-10:** The five named ceilings live in a SINGLE in-code constants block (single source of truth) and are ENFORCED by the script, not left to model discretion: `ANGLES ~5`, `MAX_FETCH = 15`, `MAX_VERIFY_CLAIMS ~24` (cap applied AFTER ranking), `VOTES_PER_CLAIM = 3` (seats beyond 3 ignored deterministically), `SYNTH_CAP ~20` (survivors output cap). (AGG-06, SC-4.)
- **D-11:** Over-ceiling input is CAPPED deterministically (keep top-N after ranking for the claim caps; ignore extra vote seats) and the cap action is RECORDED OBSERVABLY in the stdout summary (e.g. `capped: claims 31->24`). NO silent truncation (CLAUDE.md "no silent caps" / observability-as-contract).
- **D-12:** Ceilings are HARDCODED constants for this phase -- that is the enforced contract. An optional env/flag override (ARCHITECTURE.md "raise ceilings via config" for medium runs) is NOT required here; if a trivial override is wired it must override the SAME constants with defaults unchanged, otherwise it is deferred to the Phase 20 orchestrator. (See Claude's Discretion.)

### Validation fixture harness (GA-5)
- **D-13:** Fixture runner = Node stdlib `node:test` + `node:assert`, run via `node --test`. Chosen over a bash `tests/*.sh` smoke script (avoids the Windows / Git-Bash heredoc/quoting/CRLF hazards documented in CLAUDE.md) and over the prototype's inline `process.exit` assertions (keeps the aggregator a pure importable lib + thin CLI). Zero-dep, cross-platform.
- **D-14:** Co-locate everything under the skill (skill-internal helper -> bundled `scripts/`; memory `reference_plugin_script_location`): aggregator at `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`; test at `.../scripts/lz-deep-research-aggregate.test.mjs`; committed fixture data under `.../scripts/__fixtures__/<case>/{claims,excerpts,votes}/`.
- **D-15:** The fixture asserts ALL FIVE load-bearing behaviors from SC-5, each a distinct committed case that PASSES: (1) fabricated quote dropped; (2) real-quote / wrong-passage DOWNGRADED (not dropped, not upheld); (3) paraphrase pair NOT double-counted as 2 independent sources; (4) near-duplicate pair merged; (5) named ceilings enforced (over-ceiling input capped, cap observable). These are REAL committed files authored fresh -- do NOT "reuse" or reference uncommitted fixtures (memory `project_phantom_smoke_fixtures`).
- **D-16:** Refactor the prototype into testable PURE functions (`normalize`, `jaccard`, `quoteOutcome`, `mergeClusters`/corroboration, `tally`, `enforceCeilings`) importable by the test, behind a thin CLI wrapper (parse arg -> read run dir -> run pipeline -> write `survivors.json` + print summary). This enables D-13 without the prototype's inline self-seeding.

### Claude's Discretion
- Exact stdout summary wording / formatting -- only constraint is "bounded + deterministic + counts observable".
- Whether to wire the optional ceiling env-override now vs defer to Phase 20 (D-12) -- planner/executor may add a trivial `LZ_DR_*` env override if it costs nothing; otherwise omit.
- Internal function names, file-split granularity, and whether `survivors.json` is pretty-printed (prototype used 2-space).
- Whether to keep a `dropped.json` / `ranked.json` intermediate on disk vs surfacing those only in the stdout summary (either satisfies observability).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The proven prototype this phase hardens (load-bearing -- preserve its proven behavior)
- `plans/_spike/aggregate-spike.mjs` -- spike A1, PASS. The exact proven core to harden + extend: `norm`/`jaccard`/`quoteInExcerpt`/`mergeClaims`/`recheck`/`tally`. Do NOT rewrite the proven logic; refactor it into pure functions and ADD the three-way quote outcome, distinct-source corroboration, ceiling enforcement, and the `node:test` fixture.
- `plans/_spike/run/` (`claims/`, `excerpts/`, `votes/`) -- the proven immutable run-dir layout + a seed for fixture cases.
- `plans/_spike/a2/` (`w1.json`, `w2.json`) + `plans/_spike/merge.mjs` -- A2 headless-permission proof (single named non-git `node` Bash call is permitted under `--permission-mode auto`).

### The converged design + landmines (read before planning)
- `.planning/research/SESSION-DESIGN.md` SS3 (spine) / SS6 (context-boundedness + named ceilings) / SS7 (deterministic off-model immutable-files aggregation) / SS8 (evidence-artifact-centric verification, tally rubric) / SS13-A1 (the proof). NOTE the top-of-file CORRECTION: read every `bin/` as `skills/lz-deep-research/scripts/`.
- `.planning/research/PITFALLS.md` Pitfall 8 (lexical-dedup over-claim -> fixture: paraphrase pair NOT 2 independent + near-dup merges; corroboration is a lower bound; NO embeddings) / Pitfall 9 (quote-passage fidelity -> fixture: fabricated dropped + real-quote/wrong-passage downgraded; re-check upstream of voting; two distinct assurances) / Pitfall 10 (zero-dep + CRLF + `fs.readdirSync` + explicit UTF-8/LF, no shell globbing) + the Acceptance-gate checklist (the exact fixture assertions).
- `.planning/research/ARCHITECTURE.md` "Pattern 2: Off-Model Deterministic Reduction" + data-flow P4 + the component table (the aggregator's integration contract; the "raise ceilings via config" note for medium runs; the self-anchor-rejection anti-pattern -- the script verifies a quote is CITED/PRESENT, it cannot prove a tool was CALLED).

### Phase definition + requirements
- `.planning/ROADMAP.md` -> "Phase 16: Deterministic off-model aggregator + validation fixture" (goal + the 5 success criteria; these are the acceptance bar).
- `.planning/REQUIREMENTS.md` -> AGG-01 / AGG-02 / AGG-04 / AGG-06 / VERIF-04 (the mapped requirements) + the Out-of-Scope table (no top-level `bin/`; no embedding dep; no shared appendable JSONL ledger).
- `.planning/PROJECT.md` Key Decisions (aggregator lives in `skills/lz-deep-research/scripts/` NOT `bin/`, verified 2026-06-15; zero external dependencies) -- and memory `reference_plugin_script_location` (invoke `node "..."`, not bare; `${CLAUDE_PLUGIN_ROOT}`/`${CLAUDE_SKILL_DIR}`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `plans/_spike/aggregate-spike.mjs`: the proven deterministic core. Harden + extend, do NOT rewrite. The `NUMWORDS` map, `norm`, `jaccard`, `quoteInExcerpt`, the immutable-file merge loop, and the tally rubric all transfer directly.
- `plans/_spike/run/{claims,excerpts,votes}`: a working set of fixture inputs (the c1+c2 near-dup merge, the c3 fabricated-quote drop) to seed the committed fixture cases.

### Established Patterns
- Plugin convention: zero external dependencies, Node stdlib only, CRLF/path-safe, invoked via `node "${CLAUDE_PLUGIN_ROOT}/..."`. The aggregator is the plugin's FIRST bundled executable script and FIRST Node test -- there is NO prior `scripts/`-dir or `node --test` precedent in this repo to match.
- The existing `tests/*.sh` self-extracting smoke fixtures (e.g. `D-reviewer-budget.sh`) are TEXT-parsing word-budget gates for the REVIEW skills -- a different problem domain. They are NOT the model for this Node aggregator's fixture; `node:test` is the right new pattern (D-13).
- CLAUDE.md shell rules forbid bash heredocs / inline multi-line content / risky quoting -> reinforces choosing `node:test` over a bash harness for a JSON-heavy aggregator.

### Integration Points
- Phase 17 freezes the source/claim/vote/excerpt JSON shapes + tally rubric + quote-recheck contract + named-ceilings contract + two-assurance distinction AGAINST this aggregator's proven IO (D-01..D-11). Build the aggregator first so the schema is grounded, not guessed.
- Phase 18 eval harness drives the voter over THIS aggregator's tally output + the Phase-17 vote schema.
- Phase 19 search/extract workers WRITE the `claims/`/`excerpts/`/`votes/` files in the D-02 layout and the D-04..D-05 quote/excerpt-id binding.
- Phase 20 orchestrator invokes the aggregator via ONE `Bash(node:*)` call per wave-boundary, holds only the stdout receipt, and retains the gitignored run dir as the audit trail.

</code_context>

<specifics>
## Specific Ideas

- Preserve the spike's exact proven assertions as a baseline regression case (near-dup merge to 1 cluster; fabricated quote dropped; corroborated survivor = High over 2 sources), then ADD the new cases (real-quote/wrong-passage downgrade; paraphrase-from-one-source not double-counted; ceiling cap observable).
- "Observable" is a hard contract, not a nicety: every drop, downgrade, and cap must show up as a count in deterministic stdout (mirrors the project's `web_tool_usage_must_be_observable` discipline) so the fixture and the Phase 20 orchestrator can both see it without parsing raw evidence.

</specifics>

<deferred>
## Deferred Ideas

- **Semantic / paraphrase dedup beyond number-word variance (AGGX-01)** -- v2-deferred. Lexical-only here; corroboration is phrased as a lower bound. Do NOT add an embedding dependency (zero-dep violation).
- **Config-driven ceiling raising for medium runs** -- belongs to the Phase 20 orchestrator (ARCHITECTURE.md). Phase 16 hardcodes the named defaults.
- **In-flight concurrency / wave-batching ceiling (<=5 in-flight)** -- a skill/orchestrator concern (COST-03, Phase 20), NOT the aggregator. The aggregator only enforces the data-volume ceilings.
- **Claim-vs-quote ENTAILMENT (does the quote support the claim)** -- the voter's job (Phase 18); the two-assurance distinction is frozen in Phase 17. The aggregator guards verbatim consistency only.
- **Crash-resumability beyond rerun-from-immutable-inputs (SCALE-03)** -- v2-deferred.

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (`research-rtk-command-suitability-for-skills-and-agents.md`, match score 0.6) -- REVIEWED, NOT folded. Despite the keyword overlap (research/skills/verify/phase/git), it concerns `rtk git diff` / `rtk gh pr diff` token-savings for the REVIEW + SECURITY-REVIEW skills/agents, which is unrelated to a deterministic Node aggregator. Folding it would violate the scope guardrail. Stays in the backlog (STATE.md Deferred Items / Pending Todos).

</deferred>

---

*Phase: 16-deterministic-off-model-aggregator-validation-fixture*
*Context gathered: 2026-06-15*
