# Phase 19: Search + extract worker agents - Research

**Researched:** 2026-06-16
**Domain:** Claude Code subagent authoring (least-privilege workers) + an autonomous-search-and-stop loop hosting an OFFLINE known-gold Haiku-vs-Sonnet false-uphold gating read over a curated claim-verification trap set
**Confidence:** HIGH on the frozen contracts + worker shapes; HIGH on the trap-set methodology (grounded in AVeriTeC/WiCE primary sources + saturation/CI literature); MEDIUM on exact realized N and the AVeriTeC-revised-KS dev-split availability (flagged in Assumptions Log)

## Summary

Phase 19 is a brownfield phase implementing PRODUCERS against a fully-frozen consumer. The schema (`lz-deep-research-schema.md`), the off-model aggregator (`lz-deep-research-aggregate.mjs`), the eval gate engine (`eval/lz-eval-aggregate.mjs`), the dataset loader (`eval/lz-eval-dataset.mjs`), the pre-registered lock rule, the 70-row manifest, the vendored WiCE corpus, and both voter agents ALL exist and are unit-green. Nothing in those contracts is re-opened. The two workers (search = `[WebSearch, Write]`, extract = Sonnet `[WebFetch, Write]`) write the frozen `claims/` / `excerpts/` / `sources/` shapes and return a one-line receipt; the extract worker additionally owns the URL-canonicalization + SHA-256 filename rule the schema forward-declares.

The genuinely-open surface is **trap-set construction for the offline known-gold harness**, delegated to research-backed judgment under the standing Phase-18 owner directive (existing corpora, no hand-authoring, license-comply). The Phase-18 feasibility pilots proved the *reasoning-over-supplied-evidence* axis is SATURATED (Haiku 0/30 == Sonnet 0/30): subtle overreach on clean OR noisy supplied evidence does not discriminate. The ONLY untested axis is **retrieval orchestration** -- the voter deciding WHAT to search and WHEN to stop over a raw knowledge store, with a per-claim date cutoff enforced. The trap set must therefore stress *retrieval difficulty* (buried / evidence-absent / date-sensitive), not *claim subtlety*, or it re-saturates and the read VOIDs again (D-06). All strata draw from AVeriTeC dev (122 Supported / 305 Refuted claims, each with `claim_date` and a `top_100` KS), license-handled per the user-ratified gitignored-dev-only posture.

**Primary recommendation:** Build the autonomous search-and-stop loop ONCE behind a single pluggable retrieval-backend interface (D-09). Bind it to live WebSearch for the production search worker and to a static AVeriTeC-KS adapter (with the per-claim date filter) for the offline read. Construct three retrieval-difficulty strata over AVeriTeC dev seeds -- buried, evidence-absent, date-sensitive -- sized to N=60-100 pooled trials, calibrated so Sonnet sits demonstrably below ceiling (else VOID/raise). MC/DC-test every deterministic driver function (search-and-stop core, both retrieval adapters, date filter, URL canonicalizer) via the explicit `.test.mjs` FILE form before any model run. Eval tooling stays in `eval/`; the plugin tree stays zero-dep.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions (D-01..D-08 AUTHORITATIVE; carry forward unchanged)

- **D-01:** Phase 19 delivers the two workers AND the autonomous-search loop AND the offline known-gold gating read (relocated EVAL-01/02/04). Operational shadow/canary is Phase 20.
- **D-02:** Extract worker tier = **Sonnet** (`[WebFetch, Write]`). Search worker = `[WebSearch, Write]`, cheap-tier model per the Phase-18 outcome (Sonnet ships; Haiku is the variant the offline read tests). Each worker is least-privilege.
- **D-03:** Workers write the immutable per-file run-dir blackboard: `claims/<worker-id>.json`, `excerpts/<excerpt-id>.txt`, `sources/<source-id>.json`. Claim record = `{worker, source, claims:[{id, text, quote, excerpt_id}]}`; each claim binds a verbatim quote + a stored-excerpt id + the canonical source key. The aggregator's fail-closed field guards (non-empty `id`/`text`/`quote`/`source`) and `safeId` path-safety are the enforcement surface.
- **D-04:** The excerpt is stored **immutably at fetch time** (plain UTF-8; CRLF/LF/BOM tolerated) as the verbatim basis for the Phase-16 quote-recheck.
- **D-05:** The sole hard gate is the SUBTLE open-book **Haiku-MINUS-Sonnet false-uphold DELTA**; binomial `n` is **POOLED** claim-trials; PASS ceiling = `clopperPearsonUpper(1, N_pooled, ALPHA)` as a FORMULA at the realized pooled n (~0.05 at N=60-100); the legacy 0.25 scalar is RETIRED; `reliability >= 15` trials/claim is a SEPARATE gate. CI math via the pinned `jstat` (never hand-rolled, never Wald/bootstrap).
- **D-06:** **SATURATION pre-condition (load-bearing).** Before reading any Haiku-vs-Sonnet delta, confirm the curated traps DISCRIMINATE: Sonnet must be demonstrably **below ceiling**. If no hardened stratum puts Sonnet below ceiling, the read is **VOID/INCONCLUSIVE -> defer to Phase-20 shadow**; a both-models-ace tie is NEVER read as Haiku-safe. FAIL/INCONCLUSIVE -> RAISE TO USER; Sonnet-default ships in the interim.
- **D-07:** Open-book retrieval uses the **AVeriTeC revised-2.0 KS as the sole source** + per-claim publication-date cutoff (voter sees only KS docs dated before the claim's annotated date); **never live web** for the eval (D-05 leakage rule). License: AVeriTeC mutations are dev-only/gitignored in `eval/.cache`; the committed manifest carries only uids + remapped labels + the mutation recipe/seed (method, not NonCommercial text).
- **D-08:** Harness mechanism (locked) = a **dynamic Workflow over nested voter subagents** (NOT `claude -p`), resumable via filesystem vote persistence under gitignored `eval/.cache/` (skip-already-done on re-run); the deterministic driver functions are MC/DC-tested + agent-reviewed before any full run. Eval tooling lives in the repo-level `eval/` tree and **never ships**; the plugin tree stays zero-dep.

### Advisor-Consensus Resolutions (D-09..D-11 settled)

- **D-09 (pluggable retrieval backend):** Build the autonomous search-and-stop loop ONCE behind a single retrieval-backend interface (issue-query / fetch-results / date-filter / stop-decision). Production search worker binds it to live WebSearch (SC-1); the offline gold harness binds it to a static AVeriTeC-revised-2.0-KS adapter enforcing the per-claim date cutoff (D-07). Query formulation, disconfirming-query issuance, source-independence weighting, mechanical search-minimums, stop decision, and the per-vote search trace are IDENTICAL across both backends; only the retrieval adapter + date filter differ.
- **D-10 (voter-direct / worker-derivative tier mapping):** The offline-gold read settles the VOTER tier directly (the only instrument that observes the correlated unanimous-false-uphold quadrant and yields absolute false-uphold rates) and the search-WORKER tier DERIVATIVELY. To make the mapping valid Phase 19 must (a) factor query-formulation + disconfirming-search + stop-decision + mechanical search-minimums into ONE shared module the voter and the search worker both consume, (b) pin that the cheap-tier model the gate clears for the voter == the tier dispatched for the search worker, and (c) log a per-vote search trace (queries / depth / stop reason) so a null delta is diagnosable as genuine-parity vs both-stopped-early.
- **D-11 (loop is the shared spine; no throwaway):** the same loop built here serves the offline read AND the Phase-20 live shadow/canary -- "build once, no throwaway."

### Decide-Now Contract Anchors (D-12..D-15 -- executor-pinned defaults; PLANNER FINALIZES the value, the RULE is frozen)

- **D-12 (loader fix -- per-source parameterization, NOT a blanket flip):** `eval/lz-eval-dataset.mjs` hardcodes `--repo-type dataset` for ALL repos and assumes gated. Fix: parameterize `--repo-type` per source -- WiCE stays `dataset`; `chenxwh/AVeriTeC` becomes `model` (an UNGATED `model` repo) -- AND pass the correct per-repo `gated` flag.
- **D-13 (URL canonicalization -- commit the concrete recipe against the frozen schema rule):** lowercase scheme + host, strip default ports (80/443), strip a tracking-param denylist (`utm_*`, `fbclid`, `gclid`, `gclsrc`, `dclid`, `msclkid`, `mc_eid`, `igshid`, `ref`, `ref_src`, `_hsenc`, `_hsmi`), strip a trailing slash + URL fragment. Raw canonical key lives in the JSON `id`; the FILENAME uses a stable SHA-256 hex of the canonical key. Denylist is planner-finalizable; the RULE is frozen by the schema.
- **D-14 (receipt contract):** one line, `<= ~200` chars; fields = worker-id + canonical-source-key (or count) + excerpt count + claim count + status; no raw source text or quotes. Exact cap planner-finalizable; the "one line under a char cap" contract is frozen by SC-4 / AGG-03.
- **D-15 (excerpt scope/size):** store the WebFetch-returned content verbatim as the immutable excerpt, capped at a reproducible size bound (recommend ~50 KB/source). Exact bound planner-finalizable.

### Claude's Discretion (the standing Phase-18 delegation)

- **Trap-set construction** for the offline known-gold harness: curated **buried / evidence-absent / date-sensitive** strata, sizing to the power target (dozens/stratum; N=60-100), the **Sonnet-below-ceiling difficulty calibration**, **generator-outside-the-voter-families** hygiene, and the **deliberately-weak-verifier** difficulty anchor. Owner directive: research-backed best judgment, no hand-authoring, existing corpora, license-comply. #1 RISK: re-saturation.

### Deferred Ideas (OUT OF SCOPE -- Phase 20 / v2)

- OPERATIONAL stages -> Phase 20: shadow -> canary -> Tier-1 rollout; elevated/targeted audit of Haiku-unanimous upholds; mixed-tier Sonnet seat; pre-committed rollback; trend alarms.
- The owner escaped-error budget -> Phase 20: the "<= X escaped false-upholds / 1000 claims" number (cannot bind at the Phase-19 offline N; CP 0/N upper bound ~3-6% at N=60-100, far above any candidate budget).
- Larger-N / ecosystem-representative trap set (>100) -- v2.
- Native AVeriTeC Conflicting cross-check arm -- optional, non-blocking; pulled in only if a feasibility gate sizes it (>= ~10 at super-majority agreement); qualitative concordance signal, never PASS/FAIL.
- The orchestrator skill wiring the full pipeline; inline citation/synthesis (Phase 20).
- RTK command suitability for skills/agents (backlog; orthogonal).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PIPE-03 | Skill fans out parallel web-search workers (~1 per sub-angle) returning source candidates | `agents/research-search-worker.md` (`[WebSearch, Write]`); the search-and-stop core (D-09); a dispatchable-per-angle receipt (D-14). Pattern mirrors the existing voter agents' frontmatter + least-privilege grant. |
| PIPE-04 | For each fetched source, store the fetched excerpt immutably at fetch time as the evidence artifact | `agents/research-extract-worker.md` (Sonnet `[WebFetch, Write]`) writes `excerpts/<excerpt-id>.txt` verbatim, ~50 KB cap (D-15), plain UTF-8 (D-04). The aggregator's `loadExcerpts` + `quoteOutcome` are the downstream consumer (already frozen). |
| PIPE-05 | Extract falsifiable claims, each bound to a verbatim quote + stored-excerpt id + source metadata | Extract worker writes `claims/<worker-id>.json` to the frozen claim record + `sources/<source-id>.json` (D-03). The aggregator's `mergeClusters` fail-closed guards define the acceptance surface. URL canonicalization recipe (D-13). |
| AGG-03 | Workers write evidence to the run dir and return only a one-line receipt under a char cap | Receipt contract (D-14): ~200-char single line, counts-only, no raw source text. The main session never holds raw text. Both workers obey it. |
| EVAL-01 | Pre-registered dataset of >=60-100 labeled claims, stratified, covering closed- AND open-book | Trap-set construction (this research's primary surface): AVeriTeC-dev seeds across buried/absent/date-sensitive strata; pooled N=60-100; the existing WiCE closed-book arm is the calibration/control. |
| EVAL-02 | Eval runs each claim k>=5; reports Pass@1, Pass^k, per-stratum false-uphold | `eval/lz-eval-aggregate.mjs` already exports `passAtK`/`passHatK`/`countFalseUpholds` (MIN_K=5, RELIABLE_TRIALS=15). The harness (D-08) drives k>=5 (escalate to 15 on a provisional PASS). |
| EVAL-04 | The lock rule (pass/kill thresholds + false-uphold-as-sole-hard-gate) written down BEFORE the eval runs | `eval/lz-eval-lock-rule.md` is pre-registered; Phase 19 RE-REGISTERS it to the pooled-n CP(1,N) formula ceiling (the 18-GATE-RECONCILIATION verbatim rule) in the legitimate zero-votes window, BEFORE any vote. The trap-set construction rules must be locked here too. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Web search for source candidates (PIPE-03) | Subagent (search worker, `[WebSearch, Write]`) | -- | Least-privilege agent; never enters main session context; returns a receipt. The model tier is the gate outcome (D-02/D-10). |
| Web fetch + immutable excerpt store (PIPE-04) | Subagent (extract worker, Sonnet `[WebFetch, Write]`) | Off-model script (aggregator reads the excerpt at quote-recheck) | Fetch is a model-tool action; persistence is at fetch time. Tier is fixed Sonnet (the trust-critical extract step is not gated). |
| Falsifiable-claim extraction + source-record write (PIPE-05) | Subagent (extract worker) | Off-model script (`mergeClusters` validates shapes) | Claim extraction is a judgment task; shape validation + dedup is deterministic off-model. |
| URL canonicalization + SHA-256 filename (D-13) | Off-model deterministic function (extract worker invokes / shares it) | -- | A pure string transform; belongs in a deterministic, MC/DC-testable function, not model discretion. Schema forward-declares the rule. |
| Autonomous search-and-stop orchestration (the gated mechanism) | Shared deterministic driver module + the voter subagent's tool calls | Retrieval adapter (live WebSearch OR static KS) | The DECISION logic (query formulation cue, search minimums, stop rule, trace) is deterministic/shared; the RETRIEVAL is pluggable per backend (D-09). |
| Per-claim date-cutoff filter (D-07) | Off-model deterministic function in the static-KS adapter | -- | A pure date comparison over KS doc dates; deterministic, MC/DC-testable; the leakage guard. |
| False-uphold tally + Clopper-Pearson gate (EVAL-02/04) | Off-model script (`eval/lz-eval-aggregate.mjs`, already built) | -- | Deterministic verdict-vs-gold; library-computed CI. Zero model tokens in the verdict. |
| Dataset fetch + stratify + manifest (EVAL-01) | Off-model script (`eval/lz-eval-dataset.mjs`, extend per D-12) | -- | Deterministic loader; network only at eval time; license-compliant. |
| Eval-run orchestration (vote dispatch + resumable persistence) | Dynamic Workflow over nested voter subagents (D-08) | Filesystem (vote persistence under gitignored `eval/.cache/`) | Not `claude -p`; resumable; skip-already-done. Dev-only, never ships. |

## Standard Stack

This is a Claude Code plugin (Markdown agents + zero-dep Node ESM helpers) plus a repo-level dev-only eval tree. There are NO new runtime libraries -- the plugin tree is contractually zero-dependency, and the only install surface (`eval/`) already pins its sole dependency.

### Core
| Library / Component | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js stdlib (`node:fs`, `node:path`, `node:url`, `node:crypto`, `node:child_process`, `node:test`) | Node 24.13.0 (repo pins `lts/krypton` in CI) | All deterministic helpers (search-and-stop core, retrieval adapters, date filter, URL canonicalizer, eval loader/aggregator) + their MC/DC tests | The zero-dependency constraint is a hard CLAUDE.md + AGG-02 rule. `node:crypto.createHash('sha256')` is already in use in `eval/lz-eval-dataset.mjs` for SHA-256. [VERIFIED: codebase grep -- `createHash` imported at eval/lz-eval-dataset.mjs:36] |
| `jstat` | 1.9.6 (exact pin, lockfiled, `eval/` only) | Clopper-Pearson upper bound (`jStat.beta.inv`), Wilson (`jStat.normal.inv`), Pass@k combinatorics (`jStat.combination`) -- all CI math for the gate | Already pinned + supply-chain-verified at a blocking-human checkpoint (Phase 18-02). Hand-rolling stats is FORBIDDEN by the 2026-06-16 owner directive (D-07). [VERIFIED: codebase -- eval/package.json devDependencies] |
| Claude Code Agent components (`agents/*.md`, YAML frontmatter) | Claude Code v2.1.177+ | The search + extract worker subagents (`model`, `tools`, `effort`, `maxTurns`, `description` with `<example>` blocks) | The native, only mechanism (CLAUDE.md project constraint: zero external deps, Agent tool is the sole mechanism). Both existing voter agents are the template. [VERIFIED: codebase -- agents/research-verify-voter-{sonnet,haiku}.md] |

### Supporting
| Component | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `hf` CLI (HuggingFace) | globally installed; eval-time only | Fetch AVeriTeC KS at a pinned revision into gitignored `eval/.cache/` (D-12 fixes the `--repo-type`/`gated` params) | Only at eval time (Plan equivalent of 18-05); never in the unit suite, never shipped. [VERIFIED: codebase -- eval/lz-eval-dataset.mjs `fetchDataset` shells `hf download`] |
| Dynamic Workflow (`.claude/workflows/`, user/project scope) | Claude Code v2.1.177+ | Drives nested voter subagents for the eval run, resumable via filesystem persistence (D-08) | The eval RUN orchestration only. A plugin CANNOT ship `workflows/` (REQUIREMENTS Out-of-Scope) -- this lives in the dev/eval tree, never in the marketplace package. [CITED: REQUIREMENTS.md Out of Scope; SESSION-DESIGN.md S2] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static AVeriTeC-KS adapter for the offline read | Live WebSearch for the eval voter | REJECTED by D-05/D-07: live web leaks the published fact-check verdict and defeats the date cutoff. The static KS is the leakage-safe surface; live WebSearch is the production binding only. |
| Pooled-n binomial CI over claim-trials | Per-claim CI then aggregate | The pooled-n is LOCKED (D-05) and is what makes N=60-100 reach a ~5% ceiling. BUT see Pitfall 3: pooled trials within one claim are NOT independent -- the realized CI is anti-conservative; the gate's "zero pooled excess = PASS" framing sidesteps this by gating on an exact-zero count, not a rate estimate. |
| SHA-256 hex filename for `sources/<id>` | Percent-encoding the canonical URL | Schema offers BOTH (D-13). SHA-256 is collision-safe, fixed-length, no path-separator risk, and `node:crypto` is already imported. Percent-encoding is reversible but variable-length and re-introduces `%2F` edge cases on Windows. Recommend SHA-256. |
| `dynamic Workflow` eval harness | `claude -p` per vote | REJECTED by D-08: `claude -p` has the documented `@file` / slash-command fragility, no built-in concurrency, and no resumable persistence. The Workflow nests `agent({model, schema})` per vote and skips-already-done. |

**Installation:** No new installs in the plugin tree. The eval tree's only dependency is already installed and lockfiled:
```bash
cd eval && npm ci   # restores jstat@1.9.6 (gitignored node_modules); never touches the plugin tree
```

**Version verification:** No new packages introduced. `jstat@1.9.6` is exact-pinned and lockfiled; AVeriTeC/WiCE are corpora (not npm packages), pinned by HF revision SHA in the manifest. [VERIFIED: codebase -- eval/package.json + eval/package-lock.json present; WICE_REVISION pinned at lz-eval-dataset.mjs:63]

## Package Legitimacy Audit

> Phase 19 installs NO new external packages. The plugin tree is contractually zero-dependency; the only install surface (`eval/`) was stood up and supply-chain-verified at a blocking-human checkpoint in Phase 18-02 and adds nothing here.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `jstat` | npm | ~12 yrs (2013) | established | github.com/jstat/jstat | n/a (already vetted Phase 18-02) | Pre-approved; no change this phase |

**Packages removed due to slopcheck [SLOP] verdict:** none (no new packages).
**Packages flagged as suspicious [SUS]:** none.

*slopcheck was not re-run because no new package is introduced. `jstat@1.9.6` was verified at a blocking-human supply-chain checkpoint in Phase 18-02 (exact pin, verbatim MIT LICENSE, no install/native scripts, zero runtime deps, numeric anchors confirmed). The AVeriTeC and WiCE corpora are HuggingFace datasets/models pinned by revision SHA + per-file SHA-256, not npm packages; their integrity is enforced fail-closed by `verifySha256` in the loader.*

## Architecture Patterns

### System Architecture Diagram

Two distinct data flows share ONE search-and-stop core. Flow A is the production worker pipeline (PIPE-03/04/05/AGG-03). Flow B is the offline gating read (EVAL-01/02/04). The shared module (center) is what makes D-10's tier-mapping valid.

```
                         FLOW A: PRODUCTION WORKER PIPELINE (PIPE-03/04/05, AGG-03)
                         ----------------------------------------------------------
  sub-angle  -->  [search worker: WebSearch, Write]  --writes-->  sources/<sha>.json   --receipt(<=200ch)-->  main session
  (~1/angle)          (model tier = gate outcome)                 (candidate URLs)
                                                                        |
                                                                   (dispatch per source)
                                                                        v
  source URL  -->  [extract worker: Sonnet, WebFetch, Write]  --writes-->  excerpts/<id>.txt   (verbatim, <=50KB, D-15)
                       |                                                   claims/<worker>.json (claim+quote+excerpt_id)
                       |                                                   sources/<sha>.json   (canonical URL key, D-13)
                       '--canonicalize URL (D-13)--> SHA-256 hex --> filename                   --receipt-->  main session
                                                                        |
                                                                        v
                                                  [off-model aggregator (FROZEN, Phase 16/17)]
                                                  mergeClusters -> quote-recheck -> tally -> survivors.json

         +======================  SHARED SEARCH-AND-STOP CORE (D-09/D-10)  ======================+
         |  issueQuery(formulation cue)  ->  fetchResults(adapter)  ->  dateFilter  ->  stopDecision  |
         |  + mechanical search minimums (>= N queries / >= M docs before an uphold)                    |
         |  + per-vote search trace {queries[], depth, stop_reason}                                     |
         |  RETRIEVAL ADAPTER is the ONLY swappable seam:                                               |
         |     live-WebSearch binding (Flow A production)  |  static-AVeriTeC-KS binding (Flow B eval)  |
         +================================================================================================+
                                                                        ^
                         FLOW B: OFFLINE KNOWN-GOLD GATING READ (EVAL-01/02/04)         |  (same core, KS adapter)
                         ----------------------------------------------------------     |
  trap claim  -->  [voter subagent: Haiku|Sonnet, WebSearch->KS adapter, Write]  -------+
  (buried/absent/    (the search-and-stop core issues disconfirming queries over the
   date-sensitive     static AVeriTeC KS, honoring the per-claim date cutoff -- never live web)
   strata)                |
                          v
                     votes/<id>-<seat>.json {verdict, attack_mode, disconfirming_query, ...}
                          |
                          v
       [eval/lz-eval-aggregate.mjs (FROZEN engine, Phase 18)]
       countFalseUpholds(verdict vs gold) -> delta(Haiku - Sonnet) -> clopperPearsonUpper(1, N_pooled)
                          |
                          v
       lockRuleVerdict: PASS (-> Phase-20 shadow/canary)  |  FAIL-RAISE  |  VOID (saturation, D-06) -> RAISE
```

File-to-implementation mapping is in the Component Responsibilities table (Architectural Responsibility Map above), not in the diagram.

### Recommended Project Structure
```
plugins/lz-advisor/
|-- agents/
|   |-- research-search-worker.md     # NEW: [WebSearch, Write], tier=gate outcome, PIPE-03
|   '-- research-extract-worker.md    # NEW: Sonnet [WebFetch, Write], PIPE-04/05, owns URL-canon + SHA filename
|-- skills/lz-deep-research/scripts/
|   |-- lz-deep-research-aggregate.mjs        # FROZEN (Phase 16/17) -- consumed, not touched
|   '-- (NO new runtime script -- URL canon lives where the extract worker can invoke it;
|        if a shared deterministic helper is needed, it is a zero-dep scripts/ helper with a .test.mjs)
|-- references/
|   '-- lz-deep-research-schema.md    # FROZEN -- the workers WRITE to these shapes
eval/                                  # dev-only, NEVER ships
|-- lz-eval-aggregate.mjs             # FROZEN gate engine (Phase 18) -- consumed
|-- lz-eval-dataset.mjs               # EXTEND per D-12 (per-source --repo-type + gated)
|-- lz-eval-lock-rule.md              # RE-REGISTER to pooled-n CP(1,N) formula (zero-votes window)
|-- lz-eval-search-loop.mjs           # NEW: the search-and-stop core + retrieval adapters + date filter (MC/DC-tested)
|-- lz-eval-search-loop.test.mjs      # NEW: explicit FILE-form node:test
|-- lz-eval-traps.mjs                 # NEW: trap construction (mutation recipe over AVeriTeC seeds) + validity gates
|-- lz-eval-traps.test.mjs            # NEW
|-- __fixtures__/
|   |-- lz-eval-manifest.json         # EXTEND: + the retrieval-difficulty open-book strata rows (uids + recipe, no NC text)
|   '-- wice-vendored/                # FROZEN vendored corpus
'-- .cache/                           # gitignored: AVeriTeC KS + mutated trap text (dev-only, license-safe)
```

### Pattern 1: Least-privilege worker subagent (frozen template)
**What:** A worker agent declares the minimum tool set in frontmatter, casts one bounded action, writes to the run dir, returns a one-line receipt, and is never user-invoked.
**When to use:** Both new workers; mirrors the existing voter agents exactly.
**Example:**
```yaml
# Source: pattern from plugins/lz-advisor/agents/research-verify-voter-sonnet.md (frozen template)
---
name: research-extract-worker
description: |
  Use this agent when the deep-research fetch/extract stage needs one source
  fetched, its excerpt stored immutably, and its falsifiable claims extracted.
  Requires the source URL, the run-dir paths, and the worker id packaged by the
  harness; not intended for direct user invocation.
  <example>
  Context: The fetch stage dispatches one source for sub-angle 2.
  user: "Fetch https://example.org/a/study; store the excerpt at excerpts/e1.txt; write claims to claims/w1.json and the source record to sources/<sha>.json; return the receipt."
  assistant: "I will WebFetch the URL, store the returned content verbatim (capped) as the excerpt, extract falsifiable claims each bound to a verbatim quote + excerpt_id, canonicalize the URL to the source key, and write the three files."
  <commentary>The extract worker stores evidence at fetch time and returns only a one-line receipt; the main session never sees raw source text.</commentary>
  </example>
model: sonnet
color: green
effort: medium
tools: ["WebFetch", "Write"]
maxTurns: 4
---
```
The body then specifies: the verbatim-excerpt store (D-04/D-15), the falsifiable-claim contract (D-03), the URL canonicalization recipe (D-13), the SHA-256 filename rule, and the one-line receipt (D-14). It references the schema via `${CLAUDE_PLUGIN_ROOT}/references/lz-deep-research-schema.md` and NEVER inlines it (no cross-skill body references).

### Pattern 2: Pluggable retrieval backend (D-09) -- the one swappable seam
**What:** A single deterministic search-and-stop driver function takes a `retrievalAdapter` parameter. The adapter exposes `fetchResults(query, opts)`; everything else (query formulation cue, mechanical minimums, stop decision, trace assembly) is adapter-agnostic.
**When to use:** The shared core consumed by BOTH the production search worker (live binding) and the offline eval voter (static-KS binding).
**Example:**
```javascript
// Source: design derived from D-09/D-10 + the existing eval/ injectable-seam pattern
// (listJson's `readdir = fs.readdirSync` injectable default at lz-deep-research-aggregate.mjs:192).

// Adapter interface (two implementations; identical signature):
//   liveWebSearchAdapter: { fetchResults(query) -> [{url, snippet, date|null}] }   // production
//   staticKsAdapter(ksByClaim, claimDate): { fetchResults(query) -> [{url, snippet, date}] dated < claimDate }

export function searchAndStop({ claim, attackMode, adapter, minQueries, minDocs, maxQueries }) {
  const trace = { queries: [], depth: 0, stop_reason: null };
  let docsSeen = 0;

  // disconfirming query formulation (search the NEGATION, not the claim's terms) -- shared cue
  for (let q = 0; q < maxQueries; q += 1) {
    const query = formulateDisconfirmingQuery(claim, attackMode, q);  // deterministic cue, model executes
    const results = adapter.fetchResults(query);  // ONLY swappable line: live vs static-KS+date-filter
    trace.queries.push(query);
    docsSeen += results.length;
    trace.depth = docsSeen;

    if (q + 1 >= minQueries && docsSeen >= minDocs && hasDecisiveEvidence(results)) {
      trace.stop_reason = 'decisive-evidence';
      return { verdict: judge(results), trace };
    }
  }

  // mechanical search minimum guard: cannot UPHOLD before minQueries/minDocs met (forces past lazy-stop)
  trace.stop_reason = docsSeen >= minDocs ? 'exhausted' : 'min-not-met';
  return { verdict: trace.stop_reason === 'min-not-met' ? 'insufficient' : 'refuted-default', trace };
}
```
Note: in the *agent* implementation the model executes the searches (the adapter is realized as the WebSearch tool restricted to the KS, or live web); the deterministic core specifies the PROTOCOL (minimums, stop rule, trace fields). In the *eval driver* the static-KS adapter is a pure function over the cached KS with the date filter applied -- this is the MC/DC-tested deterministic seam.

### Pattern 3: Per-claim date-cutoff filter (D-07) -- the leakage guard
**What:** The static-KS adapter filters KS docs to those dated strictly before the claim's annotated `claim_date`. A doc with no parseable date is EXCLUDED (fail-closed: never show a possibly-post-cutoff doc).
**When to use:** The offline read only. The production live binding has no cutoff (it searches current web).
**Example:**
```javascript
// Source: design grounded in the AVeriTeC temporal-leakage discipline
// [CITED: arxiv.org/abs/2410.23850 + huggingface.co/chenxwh/AVeriTeC -- "on 15.11.2024 ... updated
//  the knowledge store ... solving the potential data leaking problem"]. claim_date is DD-MM-YYYY in dev.json.

export function parseAvtDate(ddmmyyyy) {  // "31-10-2020" -> Date; fail-closed on malformed
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(ddmmyyyy));
  if (m == null) { throw new ContractError('unparseable claim_date: ' + JSON.stringify(ddmmyyyy), 'date'); }
  return new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
}

export function dateFilter(docs, claimDate) {
  // Exclude any doc without a parseable date OR dated >= the claim's annotated date (leakage rule, D-05/D-07).
  return docs.filter((d) => {
    const dd = d.date == null ? null : safeParse(d.date);
    return dd != null && dd < claimDate;  // fail-closed: undated doc is dropped
  });
}
```

### Anti-Patterns to Avoid
- **Re-saturating the trap set with supplied evidence.** The Phase-18 pilots PROVED that handing the voter the disconfirming evidence saturates (Haiku 0/30 == Sonnet 0/30). The trap difficulty MUST live in retrieval orchestration (search + stop), never in reading a supplied answer. A "cheaper supplied-evidence variant" is the documented re-saturation trap.
- **Reading a both-models-ace tie as Haiku-safe.** This is the saturation fallacy that voided Phase 18 (D-06). A VOID is a legitimate completion that RAISES to the user; it never licenses the flip.
- **Using live web for the eval.** Defeats the date cutoff and leaks the published fact-check verdict (D-05/D-07). Static KS only.
- **Hand-authoring trap claims.** Owner directive forbids it. Mutate existing AVeriTeC-Supported seeds via a recipe; the generator must be OUTSIDE the voter families.
- **Committing mutated AVeriTeC text.** CC-BY-NC NonCommercial: mutated derivatives stay gitignored in `eval/.cache`; the manifest carries only uids + remapped labels + the mutation recipe/seed.
- **A blanket `--repo-type model` flip in the loader.** D-12: WiCE is a real `dataset` repo; only `chenxwh/AVeriTeC` is `model`+ungated. Parameterize per-source.
- **Running `node --test <dir>`.** Host quirk: the dir form spuriously exits 1. Every gate uses the explicit `.test.mjs` FILE form.
- **A package.json/node_modules anywhere under `plugins/lz-advisor/`.** The packaging-boundary test fails closed; eval tooling lives in `eval/` only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Off-model claim dedup / quote-recheck / vote-tally | A new aggregator | The FROZEN `lz-deep-research-aggregate.mjs` | It is the contract everything feeds; Phase 19 implements producers against it. Touching it re-opens a frozen consumer. |
| Clopper-Pearson / Wilson / Pass@k | Any `logGamma`/`incbeta`/`betaInv`/`comb` | The FROZEN `eval/lz-eval-aggregate.mjs` (pinned jstat) | Hand-rolling stats is forbidden (D-07); the engine is built + anchor-tested. |
| False-uphold counting + lock-rule verdict | A new tally | `countFalseUpholds` + `lockRuleVerdict` (exported, frozen) | Deterministic verdict-vs-gold; already mutation-verified discriminating. |
| HF dataset fetch + sha256 verify + stratify | A new loader | `eval/lz-eval-dataset.mjs` (extend per D-12 only) | Built, with fail-closed sha256, token pre-flight, EVAL-01 stratify. D-12 is a surgical 2-field fix, not a rewrite. |
| Path safety / BOM strip / JSON read | New helpers | The cross-tree imports `ContractError`/`stripBom`/`safeId`/`listJson` | One-directional eval->runtime import is the established pattern; never duplicate. |
| Trap claim authorship | Hand-written claims | A mutation recipe over AVeriTeC-Supported seeds, generator outside the voter families | Owner directive; clean gold-by-construction; family-neutral difficulty anchor. |
| SHA-256 of the canonical URL | A custom hash | `node:crypto.createHash('sha256')` | Already imported in the eval loader; stdlib; collision-safe filename. |
| Vote-dispatch orchestration + resumability | `claude -p` loop | A dynamic Workflow over nested voter subagents (D-08), filesystem-persisted, skip-already-done | `claude -p` has documented fragility + no resumable persistence; the Workflow is the locked mechanism. |

**Key insight:** Phase 19 is ~80% consumption of frozen contracts. The genuinely-NEW deterministic code is narrow: the search-and-stop core, the two retrieval adapters, the date filter, the URL canonicalizer, and the trap-construction recipe + validity gates. Everything else is authoring two Markdown agents + extending the loader by two fields + re-registering the lock rule. The risk is concentrated in the trap-set NOT discriminating (re-saturation), not in the plumbing.

## The Trap-Set Construction Methodology (primary research surface)

> This is the standing-discretion deliverable. Every load-bearing methodology claim is cited. The trap set's construction rules MUST be locked in the re-registered lock rule (EVAL-04) BEFORE any vote, in the legitimate zero-votes window.

### Why retrieval difficulty, not claim subtlety (the #1 risk: re-saturation)

The Phase-18 feasibility pilots empirically FALSIFIED the assumption that subtle overreach fools a cheap voter when the evidence is supplied: Haiku 0/30 false-upholds == Sonnet 0/30 even under noisy top-30 retrieval; query-formulation was also parity (Haiku 1.70 vs Sonnet 1.70). [VERIFIED: codebase -- 18-GATE-RECONCILIATION-CONSULTS.md "FEASIBILITY PILOT RESULTS"]. The benchmark-saturation literature names this exactly: a benchmark is saturated when "top models all score near the ceiling, making the benchmark unable to discriminate," and "saturation can occur even below 100% accuracy." [CITED: arxiv.org/html/2602.16763v1 "When AI Benchmarks Plateau"]. The cure is **difficulty calibration to a range that separates models** -- "avoiding settings where all models achieve 100% (too easy) or 0% (too hard)." [CITED: arxiv.org/pdf/2511.14366 ATLAS; arxiv.org/html/2602.16763v1]. The untested, cost-driving axis is **retrieval orchestration**: the voter deciding what to search and when to stop. The agentic-search literature confirms this is exactly where cheap models fail -- "premature stopping (under-retrieval)" and "the model becomes impatient ... mistakes partial evidence for a complete review." [CITED: arxiv.org/html/2601.20975v1 DeepSearchQA; arxiv.org/html/2602.07962v1 LOCA-bench]. So the strata stress where evidence sits and whether the voter keeps looking, NOT how subtle the claim reads.

### The three retrieval-difficulty strata

All seeds are AVeriTeC dev claims (500 claims; 122 Supported, 305 Refuted, 38 Conflicting, 35 Not-Enough-Evidence). [VERIFIED: codebase -- node read of eval/.cache/chenxwh__AVeriTeC/data/dev.json label distribution]. Each claim carries a `claim_date` (DD-MM-YYYY) and a `top_100` KS array of `{sentence, url}` pairs in `data_store/dev_top_k_sentences.json` (JSONL, keyed by `claim_id`). [VERIFIED: codebase -- node read of the KS file].

| Stratum | Construction (from existing corpora -- no hand-authoring) | Gold | Failure mode it targets | Source grounding |
|---------|-----------------------------------------------------------|------|-------------------------|------------------|
| **Buried** | Take a dense-evidence AVeriTeC-Refuted (or one-step-mutated Supported->overreach) claim whose refuting/decisive evidence exists in the KS but sits DEEP below many topically-similar distractor hits. Construct by ranking the `top_100` so the gold sentence is at rank >= K (e.g. >= 20) behind syndicated/near-duplicate distractors. | refuted | The voter stops at the obvious top hits and never reaches the buried disconfirmer -> default uphold. | "buried gold sentence" + distractor-noise filtering [CITED: arxiv.org/pdf/2501.10642; arxiv.org/html/2505.03135v2]. AVeriTeC `top_100` already contains heavy syndication + off-topic distractors [VERIFIED: KS read shows ~80 distractor sentences around the gold]. |
| **Evidence-absent** | A one-step-overreach mutation of a Supported claim (scope/causation/magnitude/certainty) whose refutation is NOT in the KS -- there is no in-corpus disconfirmer. | refuted (the overreach is unsupported) | The "no counter-evidence found -> default uphold" / premature-stop failure: the cheap voter must return refuted/insufficient on ABSENCE, not uphold. | premature-stopping / under-retrieval as a named failure mode [CITED: arxiv.org/html/2601.20975v1; arxiv.org/pdf/2603.12180 "premature search abandonment"]. The mutation recipe = the Phase-18 Path B (one-step overreach), generator outside the voter families. |
| **Date-sensitive** | A claim whose decisive refuting evidence in the KS is dated AFTER the claim's annotated `claim_date` (must be EXCLUDED by the cutoff), OR a pre-cutoff disconfirmer that is easy to miss. | refuted (using only pre-cutoff docs) | The voter ignores the date cutoff (leakage) OR misses the in-window disconfirmer. This is the axis the prior pilots NEVER tested (the cutoff was not enforced). | AVeriTeC temporal-leakage discipline + the 2024-11-15 revised-KS fix [CITED: arxiv.org/abs/2410.23850; huggingface.co/chenxwh/AVeriTeC]. The `claim_date` field is present per claim [VERIFIED: dev.json]. |

The existing WiCE closed-book SUBTLE arm (17 rows in the manifest) is RETAINED as the **calibration/control arm**, NOT the hard gate -- it is the reasoning-overreach detector that the consensus demoted from the gate (it saturated). [CITED: 18-GATE-RECONCILIATION-CONSULTS.md unanimous-consensus item 3].

### Generator hygiene + the deliberately-weak-verifier anchor (D-03 pattern)

- **Generator outside the voter families.** Synthesize the trap mutations with a model OUTSIDE the Haiku/Sonnet voter families (at minimum a different model than the Haiku voter) to avoid an asymmetric shared-blind-spot artifact biasing the Haiku-MINUS-Sonnet DELTA. [CITED: 18-GATE-RECONCILIATION-CONSULTS.md GENERATOR HYGIENE; 18-LEARNINGS.md "Neutral re-consult ... generator hygiene"]. The Phase-18 pilots used Gemini as the generator -- precedent.
- **Deliberately-weak-verifier difficulty anchor.** Accept a trap into the set ONLY if it flips a deliberately-weak reference verifier (a family-neutral difficulty anchor). A trap a weak verifier already catches is too easy to discriminate the tiers. [CITED: 18-GATE-RECONCILIATION-CONSULTS.md feasibility gate 1: ">=7/10 ... flips a deliberately-weak reference verifier"].
- **Validity probe before any reliable=15 spend.** A competent judge (Opus, outside the gate) must call each trap genuinely `refuted` (>=7/10 in the 10-claim probe). [CITED: 18-GATE-RECONCILIATION-CONSULTS.md feasibility gates].

### The saturation pre-condition / Sonnet-as-calibrator procedure (D-06, load-bearing)

This is the gate ON the gate. Before reading ANY Haiku-vs-Sonnet delta:

1. Run **Sonnet** (the difficulty calibrator) on each candidate stratum at k>=5 over the autonomous-search loop (not supplied evidence).
2. If Sonnet scores near-ceiling (near-zero false-upholds, i.e. catches ~all traps) on a stratum, that stratum is NON-DISCRIMINATING -> HARDEN it (deeper burial, stronger distractors, tighter date windows) and re-calibrate.
3. If NO hardened stratum can put Sonnet below ceiling, the offline read is VOID/INCONCLUSIVE -> defer to Phase-20 shadow; RAISE to the user. A both-models-ace tie is NEVER read as Haiku-safe.
4. Only on a stratum where Sonnet is demonstrably below ceiling may the Haiku-MINUS-Sonnet DELTA be read.

[CITED: arxiv.org/html/2602.16763v1 "difficulty stratification to sustain discriminative evaluation"; arxiv.org/pdf/2511.14366 "range validation ... not circular reasoning: using LLM performance ... to validate that chosen parameter ranges enable effective differentiation"; 18-HAIKU-PILOT.md sec 2 "treat Sonnet as the difficulty calibrator"]. The literature explicitly endorses using model performance to validate (not define) difficulty ranges -- so Sonnet-as-calibrator is methodologically sound, not circular.

### Sizing to the power target (N=60-100), and the pooled-n caveat

- **The math.** With zero observed pooled excess false-upholds, the Clopper-Pearson upper bound is the gate. The "rule of three" gives a one-sided 95% upper bound of ~3/n for zero events; the locked two-sided formula `clopperPearsonUpper(1, N_pooled, ALPHA)` evaluates to ~0.05 at N=60-100 (and CP(0,15) ~= 0.218 anchors the per-claim reliability gate). [CITED: statisticshowto.com/clopper-pearson-exact-method; lexjansen.com/pharmasug/2009/sp/SP10.pdf "rule of three"; VERIFIED: codebase -- EVAL_THRESHOLDS anchors in lz-eval-aggregate.mjs]. At n=17 the CP upper is ~19.5% -- far too coarse; this is WHY N must reach 60-100. [CITED: 18-GATE-RECONCILIATION-CONSULTS.md "CP(0,17) upper ~= 19.5%"].
- **Stratum sizing.** Dozens per stratum: target ~20-35 distinct claims per discriminating stratum, x k>=5 trials, pooled across strata to N_pooled = subtle_claims x trials in the 60-100+ band. The reliability gate (>=15 trials/claim on a provisional PASS) is SEPARATE. [CITED: 18-HAIKU-PILOT.md "size n for dozens per stratum (10 is far too few)"].
- **The pooled-n independence caveat (see Pitfall 3).** Pooling claim-trials assumes the trials are exchangeable; trials WITHIN one claim are correlated (clustered), so a naive pooled CI is anti-conservative. [CITED: onlinelibrary.wiley.com/doi/abs/10.1002/bimj.201700089 "interval procedures that do not account for this intraclass correlation are likely inappropriate"]. The locked gate sidesteps this by gating on an EXACT-ZERO pooled excess count (any single excess fails), not on a rate-estimate CI whose width depends on the independence assumption -- so the clustering inflates neither the PASS nor the FAIL decision, it only means the realized "~0.05" is a label, not a coverage guarantee. Document this honestly in the lock-rule artifact; do NOT recompute it as a clustered CI (that would re-open the frozen formula).

## Runtime State Inventory

> Phase 19 authors new agents + extends the loader; the D-12 loader fix is the one runtime-config change. The trap set introduces fetched/mutated corpus state (license-gated).

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | AVeriTeC dev KS already cached at `eval/.cache/chenxwh__AVeriTeC/` (data/dev.json + data_store/*.json). Mutated trap text (Path B) will be WRITTEN to `eval/.cache/` at construction time. | Code: the trap generator writes mutated claims to gitignored `eval/.cache/`; the committed manifest carries only uids + recipe (D-07 license). Verify `.cache/` stays gitignored (it is). |
| Live service config | None for the workers. The eval RUN needs an `HF_TOKEN` only if a fetched source is gated; `chenxwh/AVeriTeC` is UNGATED (D-12) so the core read runs token-free. | None for the offline core read. Document the token requirement for any optional gated arm. |
| OS-registered state | None -- no Task Scheduler / pm2 / launchd registrations. | None -- verified by the absence of any such config in the repo. |
| Secrets/env vars | `HF_TOKEN` / `HF_TOKEN_PATH` / `HF_HOME/token` are READ by `resolveHfToken` (loader). No new secret introduced; `chenxwh/AVeriTeC` ungated. | None (code rename only if any; the D-12 fix does not change env var names). |
| Build artifacts | `eval/node_modules/` (jstat) restored via `cd eval && npm ci`; gitignored. The plugin tree gains NO build artifacts. | None beyond `npm ci` to restore eval deps; the packaging-boundary test guards the plugin tree. |

## Common Pitfalls

### Pitfall 1: Re-saturation -- the trap set fails to discriminate
**What goes wrong:** The trap set saturates again (both Haiku and Sonnet ace it), the DELTA is 0, and the read VOIDs -- a repeat of Phase 18 with sunk cost on the heavy harness.
**Why it happens:** Difficulty placed in claim subtlety (already proven saturated) instead of retrieval orchestration; or the burial/absence/date strata are too easy.
**How to avoid:** Stress retrieval (buried/absent/date-sensitive), run the Sonnet-as-calibrator pre-condition on EACH stratum FIRST, harden any near-ceiling stratum before reading the delta, and accept a trap only if it flips a deliberately-weak verifier. [CITED: 18-HAIKU-PILOT.md; arxiv.org/html/2602.16763v1].
**Warning signs:** Sonnet false-uphold count is 0 on a stratum at the calibration step; per-vote traces show both tiers stopping at the same shallow depth (the "both-stopped-early" artifact the search trace exists to detect, D-10).

### Pitfall 2: Date-cutoff leakage (the axis the pilots never tested)
**What goes wrong:** The voter retrieves a KS doc dated after the claim, reads the published verdict, and "verifies" with leaked future evidence -- a false PASS for Haiku that would not survive production.
**Why it happens:** The static-KS adapter doesn't enforce the cutoff, or undated docs slip through.
**How to avoid:** The `dateFilter` excludes any doc without a parseable date AND any doc dated >= the claim's `claim_date` (fail-closed). Never bind the eval voter to live web (D-05/D-07). Test the filter with a discriminating fixture (a pre-cutoff doc kept, a post-cutoff doc dropped, an undated doc dropped). [CITED: arxiv.org/abs/2410.23850 temporal-leakage discipline].
**Warning signs:** A voter `disconfirming_query` trace references a source dated after the claim; the AVeriTeC `fact_checking_article` URL appears in a retrieved set (the original fact-check is post-claim by construction and must never be in-window).

### Pitfall 3: Treating pooled claim-trials as independent
**What goes wrong:** A pooled-n CI reported as if it were a clean binomial under-states the true uncertainty (intraclass correlation within a claim's repeated trials).
**Why it happens:** The locked D-05 pooled-n is convenient but the trials within one claim are clustered, not independent. [CITED: onlinelibrary.wiley.com/doi/abs/10.1002/bimj.201700089; wikipedia Two-proportion Z-test independence assumption].
**How to avoid:** Gate on the EXACT-ZERO pooled excess count (the locked framing) -- any single Haiku-only excess false-uphold fails, independent of CI width. Record the realized pooled n + the CP(1,N) value in the run artifact as a LABEL, and state the clustering caveat in the lock-rule prose. Do NOT silently recompute a clustered/design-effect CI (that re-opens the frozen formula); do NOT present "~0.05" as a coverage guarantee.
**Warning signs:** A reviewer asks "is the CI valid given repeated measures per claim?" -- the honest answer is in the caveat, not a re-derivation.

### Pitfall 4: The `node --test <dir>` false red
**What goes wrong:** A directory-form test invocation exits 1 even when every test passes, producing a false phase-gate failure.
**Why it happens:** A documented host quirk (Node 24 / Windows arm64 / Git Bash) that recurred in Phases 16/18. [VERIFIED: codebase -- MEMORY.md "node --test dir exits 1 quirk"; 18-VALIDATION.md].
**How to avoid:** Every test gate names the `.test.mjs` file explicitly: `node --test eval/lz-eval-search-loop.test.mjs`. CI already follows this.
**Warning signs:** Exit code 1 with zero failing tests reported.

### Pitfall 5: Mutated NonCommercial text leaks into git
**What goes wrong:** AVeriTeC (CC-BY-NC) mutated claim text gets committed, violating the NonCommercial term in an open-source repo.
**Why it happens:** Writing trap output to a tracked path instead of `eval/.cache/`.
**How to avoid:** Trap text -> `eval/.cache/` (gitignored, verified). The committed manifest carries only uids + remapped labels + the mutation recipe/seed (method, not NC text). [CITED: 18-GATE-RECONCILIATION-CONSULTS.md LICENSE user-ratified; 18-LEARNINGS.md license posture].
**Warning signs:** `git status` shows a new file under `eval/__fixtures__/` containing claim prose; a manifest row carries a `text` field for an AVeriTeC source.

### Pitfall 6: A blanket loader `--repo-type` flip (D-12)
**What goes wrong:** Flipping ALL repos to `--repo-type model` breaks WiCE (a real `dataset` repo).
**Why it happens:** Over-generalizing the AVeriTeC-is-a-model-repo finding.
**How to avoid:** Parameterize per-source: WiCE stays `dataset` (gated:false), `chenxwh/AVeriTeC` becomes `model` (gated:false). [CITED: 18-LEARNINGS.md "Loader assumptions ... wrong (Phase-19 fix-inputs)"; CONTEXT.md D-12].
**Warning signs:** A WiCE fetch 404s with a repo-type error after the fix.

## Code Examples

### URL canonicalization + SHA-256 filename (D-13)
```javascript
// Source: design against lz-deep-research-schema.md "Canonical-URL key rule (D-08)" + "Phase 19 filename-safety rule".
// node:crypto already imported in eval/lz-eval-dataset.mjs:36.
import { createHash } from 'node:crypto';

const TRACKING = new Set([
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'msclkid', 'mc_eid', 'igshid',
  'ref', 'ref_src', '_hsenc', '_hsmi',
]);

export function canonicalizeUrl(raw) {
  const u = new URL(raw);                       // throws on malformed -> fail-closed upstream
  u.protocol = u.protocol.toLowerCase();
  u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === 'http:' && u.port === '80') ||
      (u.protocol === 'https:' && u.port === '443')) { u.port = ''; }
  for (const k of [...u.searchParams.keys()]) {
    if (TRACKING.has(k) || k.toLowerCase().startsWith('utm_')) { u.searchParams.delete(k); }
  }
  u.hash = '';                                  // strip fragment
  let s = u.toString();
  s = s.replace(/\/$/, '');                      // strip a single trailing slash
  return s;                                      // the raw canonical key -> goes in the JSON `id`
}

export function sourceFilename(canonicalKey) {
  // The FILENAME uses SHA-256 hex (collision-safe, no path separators). The `id` field keeps the raw key.
  return createHash('sha256').update(canonicalKey, 'utf8').digest('hex') + '.json';
}
```

### The one-line receipt (D-14 / AGG-03)
```text
# Source: receipt contract D-14; the main session never holds raw source text.
# <= ~200 chars, single line, counts-only.
ok worker=w1 source=https://example.org/a/study excerpts=1 claims=3 status=stored
```

### Extending the loader for D-12 (per-source repo-type + gated)
```javascript
// Source: surgical fix to eval/lz-eval-dataset.mjs fetchDataset (currently hardcodes '--repo-type','dataset').
// CHANGE: thread repoType + gated through from the per-source manifest entry; do NOT flip blanket.
export function fetchDataset(repo, { revision, include, gated, repoType = 'dataset', cacheDir, runner = spawnSync } = {}) {
  preflightToken(repo, { gated });               // chenxwh/AVeriTeC: gated=false -> token-free
  // ... revision guard unchanged ...
  const args = ['download', repo, '--repo-type', repoType, '--revision', revision, '--local-dir', localDir];
  // chenxwh/AVeriTeC -> repoType:'model', gated:false ;  jon-tow/wice -> repoType:'dataset', gated:false
  // ...
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Standalone supplied-evidence gating eval (Phase 18) | Autonomous search-and-stop loop with offline known-gold traps, retrieval-difficulty strata | 2026-06-16 (ROADMAP amendment) | The decisive test moved here; the supplied-evidence design is proven saturated. |
| Frozen `DELTA_UPPER_MAX = 0.25` scalar | `clopperPearsonUpper(1, N_pooled, ALPHA)` formula at realized pooled n (~0.05 at N=60-100) | 18-GATE-RECONCILIATION (re-registered, zero votes) | The 0.25 scalar is mathematically wrong for n>19; the formula is the correct derived ceiling. |
| AVeriTeC original KS (temporal leakage) | AVeriTeC revised KS (2024-11-15 update removes the post-claim fact-check article) | 2024-11-15 (upstream) | The eval voter sees only pre-cutoff docs; the date filter enforces it. [CITED: huggingface.co/chenxwh/AVeriTeC]. |
| `claude -p` per-vote eval harness | Dynamic Workflow over nested voter subagents, resumable | Phase-18 session decision (D-08) | Resumable across account/credit switches; built-in concurrency; no `@file`/slash fragility. |

**Deprecated/outdated:**
- Closed-book amendment to the gate: rejected by 3-family consensus (tests reading comprehension, not the open-book silent false-uphold). The WiCE closed-book arm survives only as a control.
- The legacy `DELTA_UPPER_MAX = 0.25` scalar: retired (replaced by the pooled-n formula). The frozen `EVAL_THRESHOLDS` still names 0.25 but the re-registered lock rule overrides it with the formula -- this divergence MUST be reconciled in the lock-rule re-registration (the code's `DELTA_UPPER_MAX` becomes the FORMULA result at the realized n, recorded in the run artifact; update `EVAL_THRESHOLDS` + lock-rule prose in lockstep, anti-drift D-07).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The AVeriTeC **dev** split's KS is adequate for the offline read; the "revised-2.0 KS" (D-07) is the 2024-11-15 TEST-set update -- the dev split uses the original KS and its `fact_checking_article` is a post-claim leakage vector that the date filter + URL-exclusion must screen. | Trap strata; Pitfall 2 | If the dev KS still leaks the fact-check verdict despite the date filter, traps over dev seeds are easier than production. Mitigation: exclude `fact_checking_article` / `cached_original_claim_url` URLs from the KS adapter AND enforce the date cutoff. Verify the revised KS is fetchable for the seeds used; if only the test-set revised KS is leakage-clean, prefer test-set seeds or the original-KS-plus-screening. PLANNER MUST confirm which KS the seeds draw from before locking the manifest. |
| A2 | The exact realized pooled N lands in 60-100 with discriminating strata; ~20-35 claims/stratum survive the validity + saturation gates. | Sizing | If too few AVeriTeC-Refuted/buried seeds survive the deliberately-weak-verifier + Sonnet-below-ceiling gates, N falls short and the CP ceiling stays coarse -> VOID/raise. The eval is honestly settle-OR-raise; a short N is a legitimate VOID, not a failure. |
| A3 | A model OUTSIDE the Haiku/Sonnet families is available to generate the trap mutations (Phase 18 used Gemini via Copilot, which spends AI Credits and is human-gated). | Generator hygiene | If no out-of-family generator is available headlessly, the mutation must be human-gated (per CLAUDE.md "Cross-model consults"); a same-family generator risks a shared-blind-spot artifact. PLANNER should flag the generator as a human-gated step or use a deterministic recipe applied by a non-voter Claude model. |
| A4 | The search-and-stop PROTOCOL (mechanical minimums, stop rule, trace) can be enforced on the AGENT side via prompt + tool restriction, while the deterministic CORE (date filter, KS adapter, query-formulation cue) is MC/DC-testable as pure functions. | Pattern 2/3 | The model executes searches; the deterministic core specifies the protocol. If the agent ignores the minimums, the per-vote trace surfaces it (both-stopped-early diagnosis). The eval driver's static-KS adapter is the testable seam; the live agent's compliance is observed via the trace, not unit-tested. |
| A5 | Claude Code dynamic Workflows (`.claude/workflows/`) remain available + can nest `agent({model, schema})` per vote with filesystem persistence at the v2.1.177+ runtime. | Harness (D-08) | If the Workflow mechanism changed, the harness needs re-confirmation. D-08 locked it; the existing pilot harnesses prove the pattern. Verify at build time before the full run. |

**Note:** A1 is the highest-leverage open question -- it determines whether the dev-split seeds are leakage-clean enough for a fair offline read. It is flagged for planner/discuss-phase confirmation, not silently assumed.

## Open Questions

1. **Which AVeriTeC KS do the trap seeds draw from -- dev (original KS, present in cache) or the revised test-set KS (2024-11-15, leakage-clean)?**
   - What we know: D-07 names the "revised-2.0 KS"; the 2024-11-15 upstream fix was applied to the TEST set; the cache holds the dev split (original KS).
   - What's unclear: whether the dev KS is leakage-clean enough (after date-filter + fact-check-article exclusion) or whether the manifest must seed from the revised test set.
   - Recommendation: PLANNER confirms during planning; default to dev seeds WITH the date filter + explicit exclusion of `fact_checking_article`/`cached_original_claim_url` URLs, and verify on a 10-claim probe that no post-cutoff verdict leaks. Escalate to discuss-phase if the dev KS proves leaky.

2. **What is the exact mechanical search-minimum (N queries / M docs) before an uphold is permitted?**
   - What we know: the minimums force past lazy-stopping (18-HAIKU-PILOT.md); the per-vote trace records depth + stop reason.
   - What's unclear: the concrete N/M values that are demanding enough to discriminate without being unsatisfiable on the static KS.
   - Recommendation: calibrate N/M during the Sonnet-as-calibrator step (the same step that hardens difficulty); lock them in the re-registered lock rule before any vote. Treat as a contract anchor (planner-finalizable, like D-13/14/15).

3. **Does the AVeriTeC `top_100` KS for a given claim contain a genuine in-corpus disconfirmer for the buried/date-sensitive strata, or only the gold sentence + distractors?**
   - What we know: the dev KS `top_100` is heavily syndicated with many off-topic distractors (verified by direct read).
   - What's unclear: per-claim, whether a buried-but-present disconfirmer exists to make the buried stratum solvable-by-Sonnet (discriminating) vs absent (which would make it an evidence-absent trap instead).
   - Recommendation: the trap-construction script classifies each candidate seed by whether the KS contains a decisive disconfirmer (-> buried) or not (-> evidence-absent); the Sonnet-calibrator step validates the classification empirically.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All deterministic helpers + tests | Yes | v24.13.0 | -- |
| `jstat@1.9.6` | The frozen gate engine's CI math | Yes (lockfiled, gitignored node_modules) | 1.9.6 | `cd eval && npm ci` restores it |
| AVeriTeC dev KS | Trap seeds + offline read | Yes (cached) | revision in `eval/.cache/chenxwh__AVeriTeC` | re-fetch via `hf download` (D-12-fixed loader); UNGATED, token-free |
| `hf` CLI | Re-fetching corpora at eval time | Globally installed | -- | corpora already cached; only needed to re-fetch or fetch more KS |
| Out-of-family generator (Gemini/GPT via Copilot) | Trap mutation (generator hygiene) | Conditionally (AI Credits, human-gated) | -- | A non-voter Claude model applying a deterministic recipe; human-gated per CLAUDE.md |
| Claude Code dynamic Workflow runtime | The eval-run harness (D-08) | Yes (v2.1.177+) | -- | the existing pilot harness pattern |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** the out-of-family trap generator (human-gated; spends AI Credits) -- fall back to a deterministic recipe applied by a non-voter Claude model, human-confirmed.

## Validation Architecture

> Nyquist sampling strategy. The deterministic driver functions are unit-sampled per commit; the offline read is the phase-gate behavioral sample; the trap-set discrimination is the saturation pre-condition gate.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` (Node stdlib), `node:assert/strict` |
| Config file | none (CI runs explicit file paths; coverage via `--test-coverage-*` in `ci.yml` for the plugin tree only) |
| Quick run command | `node --test eval/lz-eval-search-loop.test.mjs` (per-file; NEVER the dir form -- host quirk) |
| Full suite command | `node --test eval/lz-eval-aggregate.test.mjs eval/lz-eval-dataset.test.mjs eval/lz-eval-packaging-boundary.test.mjs eval/lz-eval-search-loop.test.mjs eval/lz-eval-traps.test.mjs` then `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PIPE-03 | Search worker frontmatter is `[WebSearch, Write]`, dispatchable per angle, returns a receipt | agent-author + manual UAT | headless `claude -p "/lz-advisor:..."` dispatch (Phase 20 confirms at scale); structural lint of frontmatter | ENG Wave 0 (new agent) |
| PIPE-04 | Excerpt stored verbatim at fetch time, <=50KB, plain UTF-8; aggregator's `loadExcerpts`/`quoteOutcome` accept it | integration (against frozen aggregator) | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (existing) + a new producer-output fixture round-trip | partial (aggregator test exists; add round-trip) |
| PIPE-05 | Claim record + source record conform to the frozen schema; canonical URL key identical across `claims[].source`/`sources/<id>.json` | unit (canonicalizeUrl) + integration | `node --test eval/lz-eval-search-loop.test.mjs` (canonicalizeUrl + sourceFilename) | Wave 0 |
| AGG-03 | Receipt is one line, <=~200 chars, counts-only, no raw text | unit | a receipt-format assertion in the worker-output round-trip test | Wave 0 |
| EVAL-01 | Manifest gains discriminating open-book strata; >=60-100 pooled; license-clean (no NC text) | unit (manifest drift gate) + offline | extend `eval/lz-eval-dataset.test.mjs` drift gate to the new strata; `node --test eval/lz-eval-traps.test.mjs` | Wave 0 (extend) |
| EVAL-02 | k>=5; Pass@1/Pass^k/per-stratum false-uphold reported | unit (engine, exists) + offline run | `node --test eval/lz-eval-aggregate.test.mjs` (existing) + the eval RUN | exists (engine); RUN is the offline read |
| EVAL-04 | Lock rule re-registered to the pooled-n CP(1,N) formula BEFORE any vote; thresholds match `EVAL_THRESHOLDS` byte-for-byte | unit (anti-drift) + doc | `node --test eval/lz-eval-aggregate.test.mjs` (threshold-match assertion) + lock-rule prose review | exists (extend for the formula ceiling) |

### Deterministic driver function coverage (MC/DC, D-08)
| Function | Test points (sampling) |
|----------|------------------------|
| `searchAndStop` (core) | min-not-met -> insufficient; minimums met + decisive -> verdict; exhausted -> refuted-default; trace fields populated; mechanical-minimum guard blocks early uphold |
| `staticKsAdapter` | returns only docs for the claim; respects `fetchResults` signature; empty KS -> empty |
| `dateFilter` | pre-cutoff doc kept; post-cutoff doc dropped; undated doc dropped (fail-closed); boundary (== claim_date) excluded |
| `parseAvtDate` | valid DD-MM-YYYY parsed; malformed throws ContractError |
| `canonicalizeUrl` | lowercases scheme+host; strips :80/:443; strips utm_*/denylist params; strips fragment + trailing slash; preserves path |
| `sourceFilename` | deterministic SHA-256 hex; same key -> same name; different key -> different name; no path separators in output |
| trap mutation recipe | one-step overreach applied; gold flips to refuted; validity-gate (weak-verifier flip) discriminates |

### Sampling Rate
- **Per task commit:** the affected `.test.mjs` FILE form (e.g. `node --test eval/lz-eval-search-loop.test.mjs`).
- **Per wave merge:** the full eval-tree suite (all `.test.mjs` by explicit path) + the plugin-tree aggregator test.
- **Phase gate:** full suite green; then the offline read produces PASS | FAIL-RAISE | VOID; a VOID/FAIL-RAISE is escalated to the user (settle-OR-raise) before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `eval/lz-eval-search-loop.test.mjs` -- covers the search-and-stop core, both adapters, the date filter, parseAvtDate, canonicalizeUrl, sourceFilename (PIPE-05, EVAL-01/02)
- [ ] `eval/lz-eval-traps.test.mjs` -- covers the mutation recipe + validity/saturation gates (EVAL-01)
- [ ] Extend `eval/lz-eval-dataset.test.mjs` drift gate to the new open-book strata rows (EVAL-01)
- [ ] A worker-output round-trip fixture: producer output -> the frozen aggregator accepts it (PIPE-04/05, AGG-03)
- [ ] Extend `eval/lz-eval-aggregate.test.mjs` for the re-registered CP(1,N) formula ceiling (EVAL-04)
- [ ] Framework install: none new -- `cd eval && npm ci` restores jstat

## Security Domain

> `security_enforcement` is not `false` in config (absent = enabled). The attack surface is narrow: workers are least-privilege, write only the run dir; the eval handles untrusted corpus + worker-authored ids.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth surface; `HF_TOKEN` is read-only, never logged (existing `resolveHfToken` discipline). |
| V3 Session Management | no | Stateless workers; no sessions. |
| V4 Access Control | yes | Least-privilege agent `tools` grant (search=`[WebSearch,Write]`, extract=`[WebFetch,Write]`); no `Bash`, no `Read` beyond the run dir. Workers never user-invoked. |
| V5 Input Validation | yes | The aggregator's fail-closed field guards + `safeId` (path-traversal/Windows-device-name rejection) validate worker output; `verifySha256` fail-closed on corpus integrity; `readJson` never bare `JSON.parse`. |
| V6 Cryptography | yes | `node:crypto.createHash('sha256')` for the source filename + corpus integrity -- stdlib, never hand-rolled. |
| V12 File handling | yes | `safeId` basename-only guard on every content-derived id (excerpt_id, source filename, vote id); `path.join` only; no shell globbing; mutated NC text confined to gitignored `eval/.cache/`. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via worker-authored id (`../evil` as excerpt_id / source filename) | Tampering | `safeId` rejects path separators, `.`, `..`, Windows device names -- already enforced read-time in `mergeClusters`/`quoteOutcome`; the SHA-256 filename eliminates the path-separator vector entirely. |
| Date-cutoff leakage (post-claim fact-check verdict reaches the voter) | Information Disclosure (eval integrity) | `dateFilter` fail-closed (undated + post-cutoff dropped); exclude `fact_checking_article`/`cached_original_claim_url` URLs; never live web for the eval. |
| Corpus tampering / HTML-error body silently "verifying" | Tampering | `verifySha256` fail-closed naming the file; manifest pins revision SHA + per-file SHA-256. |
| NonCommercial license violation (mutated AVeriTeC text committed) | (Compliance) | Mutated text -> gitignored `eval/.cache/`; manifest carries recipe-not-text; the offline drift gate asserts no NC text in committed rows. |
| Receipt / excerpt exfiltration into main context | Information Disclosure | The one-line receipt (D-14) carries counts only; raw source text stays on disk; the main session never holds it. |
| Result-shopping the gate post-hoc | (Integrity) | Lock rule re-registered BEFORE any vote (zero-votes window); thresholds match `EVAL_THRESHOLDS` byte-for-byte (anti-drift assertion); trap-construction rules locked in the same pre-registration. |

## Sources

### Primary (HIGH confidence)
- Codebase (frozen contracts): `plugins/lz-advisor/references/lz-deep-research-schema.md`, `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`, `eval/lz-eval-aggregate.mjs`, `eval/lz-eval-dataset.mjs`, `eval/lz-eval-lock-rule.md`, `eval/__fixtures__/lz-eval-manifest.json`, `agents/research-verify-voter-{sonnet,haiku}.md`, `references/lz-haiku-prompt-engineering.md` -- read in full.
- Codebase (decision provenance): `18-HAIKU-PILOT.md`, `18-GATE-RECONCILIATION-CONSULTS.md`, `18-LEARNINGS.md`, `19-CONTEXT.md`, `ROADMAP.md` (Phase 19 AMENDED block), `REQUIREMENTS.md`, `STATE.md`, `SESSION-DESIGN.md`.
- Codebase (empirical): `eval/.cache/chenxwh__AVeriTeC/data/dev.json` + `data_store/dev_top_k_sentences.json` -- direct node reads (label distribution, claim_date format, KS structure).
- AVeriTeC dataset paper: https://arxiv.org/abs/2305.13117 (NeurIPS 2023; 4,568 claims, 4 verdicts, KS ~1000 articles/claim, kappa=0.619, temporal-leakage avoidance).
- AVeriTeC shared-task report: https://arxiv.org/abs/2410.23850 + https://huggingface.co/chenxwh/AVeriTeC (the 2024-11-15 revised KS removing temporal leakage).
- WiCE paper: https://arxiv.org/abs/2303.01432 + https://github.com/ryokamoi/wice (subclaim decomposition; partially-supported = subtle).

### Secondary (MEDIUM confidence -- verified with primary sources)
- Benchmark saturation / difficulty calibration: https://arxiv.org/html/2602.16763v1 "When AI Benchmarks Plateau"; https://arxiv.org/pdf/2511.14366 ATLAS (range validation, not circular).
- Agentic-search premature stopping: https://arxiv.org/html/2601.20975v1 DeepSearchQA; https://arxiv.org/html/2602.07962v1 LOCA-bench; https://arxiv.org/pdf/2603.12180 "premature search abandonment".
- Buried-gold / distractor filtering: https://arxiv.org/pdf/2501.10642 Iterative Tree Analysis; https://arxiv.org/html/2505.03135v2 evidence quality.
- Clopper-Pearson / rule of three: https://www.statisticshowto.com/clopper-pearson-exact-method/; https://www.lexjansen.com/pharmasug/2009/sp/SP10.pdf (zero-events upper bound).
- Two-proportion / clustered-binomial CI (the pooled-n caveat): https://en.wikipedia.org/wiki/Two-proportion_Z-test; https://onlinelibrary.wiley.com/doi/abs/10.1002/bimj.201700089 (intraclass correlation invalidates naive CIs).

### Tertiary (LOW confidence -- not load-bearing)
- General LLM-eval overviews (saturation framing corroboration only): emergentmind.com benchmark-saturation topic; lxt.ai/blog/llm-benchmarks.

## Metadata

**Confidence breakdown:**
- Frozen contracts / worker shapes: HIGH -- read the full source; the schema + aggregator are byte-authoritative.
- Trap-set methodology: HIGH -- grounded in AVeriTeC/WiCE primary sources + saturation + CI literature + the empirical Phase-18 falsification.
- Realized N / dev-vs-revised-KS leakage cleanliness: MEDIUM -- flagged as A1/A2 open questions for planner confirmation.
- Harness mechanics (D-08 Workflow): MEDIUM -- locked by D-08 + the existing pilot pattern; verify at build time.

**Research date:** 2026-06-16
**Valid until:** ~2026-07-16 (30 days; the frozen contracts are stable; AVeriTeC/WiCE corpora are pinned; revisit if the Claude Code Workflow runtime or the AVeriTeC KS revision changes).

## RESEARCH COMPLETE

**Phase:** 19 - search-extract-worker-agents
**Confidence:** HIGH (contracts + workers + trap methodology); MEDIUM (realized N + dev-KS leakage cleanliness -- A1/A2 flagged)

### Key Findings
- Phase 19 is ~80% consumption of FROZEN contracts (schema, aggregator, eval engine, loader, lock rule, manifest, both voter agents all exist + unit-green). The new code is narrow: two Markdown worker agents, the shared search-and-stop core + two retrieval adapters + date filter + URL canonicalizer, a trap-construction recipe, and a surgical D-12 loader fix.
- The ONE open surface -- trap-set construction -- must stress RETRIEVAL ORCHESTRATION (buried / evidence-absent / date-sensitive), NOT claim subtlety, because the subtlety axis is empirically PROVEN saturated (Haiku 0/30 == Sonnet 0/30). Re-saturation is the #1 risk; the Sonnet-as-calibrator pre-condition (D-06) is the gate-on-the-gate.
- All trap seeds come from AVeriTeC dev (500 claims; 122 Supported / 305 Refuted; each with `claim_date` DD-MM-YYYY + a `top_100` KS of heavily-syndicated distractors -- verified by direct read), mutated by a recipe with a generator OUTSIDE the voter families, license-confined to gitignored `eval/.cache`.
- The pooled-n CP(1,N) formula ceiling (~0.05 at N=60-100) is the LOCKED gate; the pooled trials are clustered (not independent), so the gate framing (exact-zero pooled excess) sidesteps the CI-coverage problem -- documented as a caveat, never re-derived.
- The date-cutoff axis (the one the prior pilots never tested) is enforced fail-closed by a `dateFilter` over the static-KS adapter; live web is forbidden for the eval (leakage).

### File Created
`.planning/phases/19-search-extract-worker-agents/19-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | Zero new packages; everything is frozen + read-in-full or stdlib. |
| Architecture | HIGH | Two flows, one shared core (D-09/D-10); grounded in the existing injectable-seam pattern. |
| Trap methodology | HIGH | AVeriTeC/WiCE primary sources + saturation/CI literature + the empirical Phase-18 falsification. |
| Pitfalls | HIGH | The re-saturation + leakage + pooled-n + host-quirk + license pitfalls are all evidenced. |

### Open Questions (for planner / discuss-phase)
- A1/OQ-1: dev (cached, original KS) vs revised test-set KS for the seeds -- determines leakage cleanliness; PLANNER MUST confirm before locking the manifest.
- OQ-2: the concrete mechanical search-minimum (N queries / M docs) -- calibrate during the Sonnet-as-calibrator step, lock in the re-registered rule.
- OQ-3: per-seed, whether the KS holds an in-corpus disconfirmer (buried) or not (evidence-absent) -- the construction script classifies, the calibrator validates.

### Ready for Planning
Research complete. The planner can finalize D-12/13/14/15 values, lock the trap-construction rules + mechanical minimums into the re-registered EVAL-04 lock rule (zero-votes window), and structure waves around: (Wave 0) deterministic driver functions + tests; (Wave 1) the two worker agents + the D-12 loader fix; (Wave 2) trap construction + saturation calibration; (Wave 3) the offline read settle-OR-raise.
