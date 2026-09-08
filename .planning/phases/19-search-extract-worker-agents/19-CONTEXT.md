# Phase 19: Search + extract worker agents - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning
**Mode:** `--auto --analyze` (ultracode), chain DISABLED by owner ("stop after discuss").

> **How this context was produced.** The Phase-19 scope was NOT re-opened: the ROADMAP was already
> AMENDED (2026-06-16, commit `70ba302`) for the staged Haiku pilot, so the scope, the pre-registered
> gate, and the carried Phase-18 decisions are AUTHORITATIVE ground truth. The executor supplied facts;
> a two-round Opus advisor panel reached UNANIMOUS CONSENSUS (3/3, high confidence) that (a) the locked
> decisions STAND given the surfaced facts (no re-opener) and (b) the three genuinely-open design points
> below resolve as captured. The escaped-error budget and operational shadow/canary are Phase-20 concerns
> (confirmed by an independent Clopper-Pearson power analysis: at the offline N of 60-100 the absolute
> false-uphold arm cannot bind; only the DELTA arm can -- so the budget binds operationally, not here).

<domain>
## Phase Boundary

Phase 19 authors the deep-research **search + extract worker agents** AND builds the **autonomous
search-and-stop loop** that hosts the **offline known-gold Haiku-vs-Sonnet gating read** (the relocated
EVAL-01/02/04). Scope is fixed by `ROADMAP.md` Phase 19 (AMENDED 2026-06-16) Success Criteria 1-5:

1. A **search worker** (`[WebSearch, Write]`, model tier per the Phase-18 outcome) returns source
   candidates for a sub-angle; one is dispatchable per sub-angle for the fan-out.
2. An **extract worker** (**Sonnet**, `[WebFetch, Write]`) stores each fetched source excerpt
   **immutably at fetch time** as the evidence artifact (the Phase-16 quote-recheck basis).
3. The extract worker extracts **falsifiable claims**, each bound to a verbatim quote, a stored-excerpt
   id, and source metadata, conforming to the **frozen Phase-17 schema**.
4. Each worker writes evidence to the run dir and returns only a **one-line receipt under a char cap**
   (the main session never holds raw source text).
5. The autonomous-search loop hosts the **OFFLINE known-gold gating read** (EVAL-01/02/04): the voter
   issues + executes its own disconfirming searches with the per-claim date cutoff enforced, over a
   curated trap set calibrated so Sonnet is **below ceiling**; the pre-registered Clopper-Pearson
   clear-rejection gate either clears Haiku (-> Phase-20 shadow/canary) or fires (-> Sonnet-default
   remains). A saturated tie is VOID/INCONCLUSIVE -> defer to Phase-20 shadow; never read as Haiku-safe.

**Out of scope (Phase 20):** the orchestrator skill that wires the full pipeline; the OPERATIONAL
shadow -> canary -> Tier-1 rollout + unanimity-blind-spot guardrails; the owner **escaped-error budget**
(operational); inline citation/synthesis. **Frozen and consumed, not re-opened:** the aggregator, the
vote/claim/excerpt/source schemas, the named ceilings, and the pre-registered lock rule.
</domain>

<decisions>
## Implementation Decisions

> Decisions D-01..D-08 are AUTHORITATIVE (ROADMAP + Phase-18 locked) and carried forward unchanged.
> D-09..D-11 are the advisor-consensus resolutions of the open design points. D-12..D-15 are decide-now
> contract anchors (constrained by a frozen schema/SC; executor-pinned defaults, planner finalizes).

### Scope & deliverables (locked, ROADMAP SC-1..5)
- **D-01:** Phase 19 delivers the two workers AND the autonomous-search loop AND the offline known-gold
  gating read (relocated EVAL-01/02/04). Operational shadow/canary is Phase 20.
- **D-02:** Extract worker tier = **Sonnet** (`[WebFetch, Write]`). Search worker = `[WebSearch, Write]`,
  cheap-tier model per the Phase-18 outcome (Sonnet ships; Haiku is the variant the offline read tests).
  Each worker is least-privilege.

### Worker output contract (locked by the frozen Phase-17 schema -- consumed, not re-opened)
- **D-03:** Workers write to the immutable per-file run-dir blackboard: `claims/<worker-id>.json`,
  `excerpts/<excerpt-id>.txt`, `sources/<source-id>.json`. Claim record =
  `{worker, source, claims:[{id, text, quote, excerpt_id}]}`; each claim binds a verbatim quote + a
  stored-excerpt id + the canonical source key. The aggregator's fail-closed field guards (non-empty
  `id`/`text`/`quote`/`source`) and `safeId` path-safety are the enforcement surface.
- **D-04:** The excerpt is stored **immutably at fetch time** (plain UTF-8; CRLF/LF/BOM tolerated) as the
  verbatim basis for the Phase-16 quote-recheck.

### The gating read (locked -- pre-registered lock rule carried verbatim from Phase 18)
- **D-05:** The sole hard gate is the SUBTLE open-book **Haiku-MINUS-Sonnet false-uphold DELTA**; binomial
  `n` is **POOLED** claim-trials; PASS ceiling = `clopperPearsonUpper(1, N_pooled, ALPHA)` as a FORMULA at
  the realized pooled n (~0.05 at N=60-100); the legacy 0.25 scalar is RETIRED; `reliability >= 15`
  trials/claim is a SEPARATE gate. CI math via the pinned `jstat` (never hand-rolled, never Wald/bootstrap).
- **D-06:** **SATURATION pre-condition (load-bearing).** Before reading any Haiku-vs-Sonnet delta, confirm
  the curated traps DISCRIMINATE: Sonnet must be demonstrably **below ceiling**. If no hardened stratum
  puts Sonnet below ceiling, the read is **VOID/INCONCLUSIVE -> defer to Phase-20 shadow**; a both-models-ace
  tie is NEVER read as Haiku-safe (the saturation fallacy that voided the Phase-18 supplied-evidence pilots).
  FAIL/INCONCLUSIVE -> RAISE TO USER; Sonnet-default ships in the interim.
- **D-07:** Open-book retrieval uses the **AVeriTeC revised-2.0 KS as the sole source** + per-claim
  publication-date cutoff (voter sees only KS docs dated before the claim's annotated date); **never live
  web** for the eval (D-05 leakage rule). License: AVeriTeC mutations are dev-only/gitignored in
  `eval/.cache`; the committed manifest carries only uids + remapped labels + the mutation recipe/seed
  (method, not NonCommercial text).
- **D-08:** Harness mechanism (locked) = a **dynamic Workflow over nested voter subagents** (NOT
  `claude -p`), resumable via filesystem vote persistence under gitignored `eval/.cache/` (skip-already-done
  on re-run); the deterministic driver functions are MC/DC-tested + agent-reviewed before any full run.
  Eval tooling lives in the repo-level `eval/` tree and **never ships**; the plugin tree stays zero-dep.

### Open design points -- ADVISOR CONSENSUS (3/3 unanimous, round 2)
- **D-09 (pluggable retrieval backend):** Build the autonomous search-and-stop loop **ONCE** behind a
  single retrieval-backend interface (issue-query / fetch-results / date-filter / stop-decision). The
  **production search worker** binds it to **live WebSearch** (SC-1); the **offline gold harness** binds it
  to a **static AVeriTeC-revised-2.0-KS adapter** that enforces the per-claim date cutoff (D-07). Query
  formulation, disconfirming-query issuance, source-independence weighting, mechanical search-minimums,
  stop decision, and the per-vote search trace are **IDENTICAL** across both backends; only the retrieval
  adapter + date filter differ -- so the offline read measures the same mechanics that ship, and the
  date-cutoff the prior pilots omitted is finally exercised.
- **D-10 (voter-direct / worker-derivative tier mapping):** The offline-gold read settles the **VOTER tier
  directly** (the only instrument that observes the correlated unanimous-false-uphold quadrant and yields
  the absolute false-uphold rates the gate needs) and the **search-WORKER tier DERIVATIVELY** (both
  cheap-tier agents share the one search-and-stop core; the ROADMAP ties the worker tier to the Phase-18
  outcome). To make the mapping valid, Phase 19 must (a) factor query-formulation + disconfirming-search +
  stop-decision + mechanical search-minimums into ONE shared module the voter and the search worker both
  consume, (b) pin that the cheap-tier model the gate clears for the voter == the tier dispatched for the
  search worker, and (c) log a per-vote search trace (queries / depth / stop reason) so a null delta is
  diagnosable as genuine-parity vs both-stopped-early.
- **D-11 (loop is the shared spine; no throwaway):** the same loop built here serves the offline read AND
  the Phase-20 live shadow/canary -- "build once, no throwaway" (HAIKU-PILOT).

### Decide-now contract anchors (constrained by a frozen schema/SC; executor-pinned, planner finalizes)
- **D-12 (loader fix -- per-source parameterization, NOT a blanket flip):** `eval/lz-eval-dataset.mjs`
  hardcodes `--repo-type dataset` for ALL repos and assumes gated. Fix: **parameterize `--repo-type`
  per source** -- WiCE stays `dataset`; `chenxwh/AVeriTeC` becomes `model` (it is an UNGATED `model` repo) --
  AND pass the correct per-repo `gated` flag. (Advisor 1 sharpened this from source inspection: it is NOT a
  blanket `--repo-type model` flip, because WiCE is a real dataset repo.)
- **D-13 (URL canonicalization -- commit the concrete recipe against the frozen schema rule):** lowercase
  scheme + host, strip default ports (80/443), strip a tracking-param denylist (`utm_*`, `fbclid`, `gclid`,
  `gclsrc`, `dclid`, `msclkid`, `mc_eid`, `igshid`, `ref`, `ref_src`, `_hsenc`, `_hsmi`), strip a trailing
  slash + URL fragment. The raw canonical key lives in the JSON `id`; the **filename** uses a stable
  **SHA-256 hex** of the canonical key (collision-safe, no path separators). Recommended denylist is
  planner-finalizable; the RULE is frozen by the schema (D-08 canonical-URL key + Phase-19 filename-safety).
- **D-14 (receipt contract):** one line, `<= ~200` chars; fields = worker-id + canonical-source-key (or
  count) + excerpt count + claim count + status; **no raw source text or quotes**. Exact cap is
  planner-finalizable; the "one line under a char cap" contract is frozen by SC-4 / AGG-03.
- **D-15 (excerpt scope/size):** store the WebFetch-returned content verbatim as the immutable excerpt
  (the quote-recheck basis), capped at a reproducible size bound (recommend `~50 KB`/source) so the
  re-check is deterministic and the main session stays bounded. Exact bound is planner-finalizable.

### Researcher-Delegated (Claude's Discretion under the standing Phase-18 delegation)
- **Trap-set construction** for the offline known-gold harness: the curated **buried / evidence-absent /
  date-sensitive** strata, their sizing to the power target (dozens/stratum; N=60-100), the
  **Sonnet-below-ceiling difficulty calibration**, **generator-outside-the-voter-families** hygiene, and
  the **deliberately-weak-verifier** difficulty anchor (D-03 pattern). Owner directive (Phase 18, standing):
  research-backed best judgment, **no hand-authoring**, existing corpora, license-comply. **#1 RISK:
  re-saturation** -- the only untested axis is retrieval orchestration (the model decides what to search +
  when to stop); the trap set MUST discriminate (Sonnet below ceiling) or the read VOIDs again (D-06).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition + acceptance bar (AUTHORITATIVE scope -- do NOT re-open)
- `.planning/ROADMAP.md` -> "Phase 19" entry (the **AMENDED 2026-06-16** block + Success Criteria 1-5) and
  "Phase 20" (SC-6, the operational stages this phase feeds).
- `.planning/REQUIREMENTS.md` -> PIPE-03, PIPE-04, PIPE-05, AGG-03 (workers); EVAL-01, EVAL-02, EVAL-04
  (the relocated offline gating read); the v2.1.0 scope decisions banner.

### Frozen contracts consumed by Phase 19 (do NOT re-open)
- `plugins/lz-advisor/references/lz-deep-research-schema.md` -> run-dir layout; claim / excerpt / source
  records; the **canonical-URL key rule** + **Phase-19 filename-safety rule** (D-13); named ceilings;
  the two assurances. The workers WRITE to these shapes.
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (+ `.test.mjs`) -- the
  off-model aggregator that reads the worker output; its fail-closed guards are the enforcement surface.

### The staged Haiku pilot + the pre-registered gate (the offline-read design)
- `.planning/phases/18-haiku-prompt-engineering-deep-research-verify-voter-early-ga/18-HAIKU-PILOT.md` -> the
  staged-pilot consensus: discriminating strata, the pre-registered clear-rejection gate, the unanimity
  blind spot + guardrails, the offline-gold-first sequencing, the owner escaped-error budget (Phase 20).
- `.planning/phases/18-.../18-GATE-RECONCILIATION-CONSULTS.md` -> the **verbatim re-registered lock rule**
  (D-05) + the neutral final consult + the saturation feasibility-pilot result.
- `.planning/phases/18-.../18-CONTEXT.md` -> Phase-18 locked decisions D-01..D-11 (dataset, license, CI
  method, eval packaging) + the owner standing delegation.
- `.planning/phases/18-.../18-LEARNINGS.md` -> the loader-bug fix-input (D-12), the saturation lesson, the
  pre-registration-amendment-window discipline, the jstat/CI patterns.

### Voter agents + Haiku-prompt reference (the cheap-tier agents under test)
- `plugins/lz-advisor/agents/research-verify-voter-sonnet.md`, `.../research-verify-voter-haiku.md` -- the
  two voter variants the offline read drives (built in Phase 18; consume the frozen vote schema).
- `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` -- the EVAL-05 research-grounded Haiku
  prompt reference (the fairness premise; any Haiku worker prompt derives from it).

### Built eval infrastructure reused by the offline read
- `eval/lz-eval-aggregate.mjs` (Pass@1/Pass^k/false-uphold/DELTA + Clopper-Pearson via jstat),
  `eval/lz-eval-dataset.mjs` (HF fetch + sha256; the D-12 loader fix lives here),
  `eval/lz-eval-lock-rule.md` (pre-registered prose), `eval/__fixtures__/lz-eval-manifest.json`,
  `eval/package.json` (+ committed lockfile, jstat@1.9.6 pinned), gitignored `eval/.cache/chenxwh__AVeriTeC`.

### Converged design (the WHY)
- `.planning/research/SESSION-DESIGN.md` -- file-blackboard orchestration, receipt-only workers, the
  search/extract worker design, the verifier tier.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The frozen schema + the runtime aggregator: the workers' entire output contract is already specified and
  enforced; Phase 19 implements producers against a settled consumer.
- The `eval/` harness (delta aggregator, dataset loader, lock-rule prose, manifest, vendored WiCE, cached
  AVeriTeC KS, jstat pin): the offline read REUSES this; it is not built from scratch.
- Both voter agents (Sonnet + research-grounded Haiku) already exist (Phase 18) -- the offline read drives
  them; Phase 19 adds the autonomous search-and-stop loop they run inside.

### Established Patterns
- Immutable per-file run-dir blackboard + receipt-only returns (bounded main context; spike A2).
- Deterministic off-model aggregation as the spine; workers never tally.
- The pluggable-retrieval-backend (D-09): one search-and-stop core, swappable live-WebSearch vs static-KS
  adapter -- the mechanism that lets "build once" serve both the offline read and Phase-20 live stages.
- Pre-registration discipline + the saturation pre-condition (calibrate difficulty with Sonnet).
- node:test via the explicit `.test.mjs` FILE form (host quirk; never the dir form).

### Integration Points
- Workers -> the aggregator run-dir (`claims/`, `excerpts/`, `sources/`); the aggregator -> `survivors.json`.
- The shared search-and-stop module -> consumed by BOTH the voter (offline harness) and the search worker.
- The offline read's OUTCOME -> sets the cheap-tier model for the Phase-20 orchestrator's voter default and
  the search worker; a CLEAR -> Phase-20 shadow/canary; a FIRE/VOID -> Sonnet-default remains.

</code_context>

<specifics>
## Specific Ideas

- "Build the loop ONCE, no throwaway" -- one autonomous search-and-stop core, pluggable retrieval backend,
  serving the offline read now and the Phase-20 shadow/canary later.
- Log a per-vote **search trace** (queries issued, depth, stop reason) so a null Haiku-vs-Sonnet delta is
  diagnosable as genuine parity vs both-stopped-early (the saturation artifact).
- Enforce **mechanical search minimums** (>= N distinct queries / >= M docs explored before an uphold) to
  force past lazy-stopping -- a load-bearing guardrail against the premature-stop / default-uphold failure.
- The offline read is honestly **settle-OR-raise** (mirrors Phase 18): a saturated/inconclusive outcome is a
  legitimate completion that defers the tier to Phase-20 shadow; Sonnet-default ships regardless.

</specifics>

<deferred>
## Deferred Ideas

- **OPERATIONAL stages -> Phase 20:** shadow -> canary -> Tier-1 rollout; elevated/targeted audit of
  Haiku-unanimous upholds; mixed-tier Sonnet seat; pre-committed rollback; trend alarms.
- **The owner escaped-error budget -> Phase 20:** the "<= X escaped false-upholds / 1000 claims" number that
  back-derives the operational absolute-rate ceiling. It cannot bind at the Phase-19 offline N (Clopper-Pearson
  0/N upper bound ~3-6% at N=60-100, far above any candidate budget), so it is ratified at the Phase-20 plan
  review where the audit N makes it bind.
- **Larger-N / ecosystem-representative trap set (>100)** -- v2 (SkillsBench "optimistic scenario" caveat).
- **Native AVeriTeC Conflicting cross-check arm** -- optional, non-blocking; pulled in only if a feasibility
  gate sizes it (>= ~10 at super-majority agreement); qualitative concordance signal, never PASS/FAIL.

### Reviewed Todos (not folded)
- **Research RTK command suitability for skills and agents** (match ~0.6) -- REVIEWED, NOT folded: it concerns
  `rtk` token-savings for the skills/agents tooling, orthogonal to building the search/extract workers + the
  gating read. Stays on the backlog (same disposition as Phases 16/17/18).

</deferred>

---

*Phase: 19-search-extract-worker-agents*
*Context gathered: 2026-06-16*
