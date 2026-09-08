# Phase 18: Haiku prompt-engineering deep research + verify-voter + early gating eval - Research

**Researched:** 2026-06-16 (refreshed 2026-06-16 for the zero-dep AMENDMENT)
**Domain:** LLM-eval methodology (binomial CIs, stratified labeled datasets) + Claude prompt engineering (Haiku 4.5) + a repo-level `eval/` Node harness/aggregator (pinned npm deps) over a strictly zero-dep distributed plugin runtime, on Windows arm64
**Confidence:** HIGH (datasets, licenses, CI math, Haiku techniques all verified against primary sources; the chosen statistics library verified against the registry + the numeric anchors this session; LOW only on live open-book voter behavior, which is what the eval itself measures)

## Summary

This phase has exactly one genuine open research deliverable -- the EVAL-05 Haiku prompt-engineering reference artifact -- plus four well-bounded HOW-to-implement-the-locked-decisions deliverables (dataset loading, the deterministic eval aggregator, the two voter agents, the headless harness). Every dataset/license/CI-estimator/leakage decision is already LOCKED in `18-CONTEXT.md` (D-01..D-11) and re-verified against primary sources; this research does NOT re-litigate them. It confirms each is implementable as written and supplies the verified mechanics.

This refresh aligns the research with the **2026-06-16 owner-directed AMENDMENT**: (a) the zero-dep constraint binds ONLY the DISTRIBUTED PLUGIN RUNTIME (the `lz-deep-research` skill + Phase-16 runtime aggregator + shipped voter agents); (b) the eval scripts move OUT of the plugin tree into a repo-level **`eval/`** directory with their OWN `package.json` + committed lockfile + gitignored `node_modules`; and (c) **hand-rolling the CI statistics is now FORBIDDEN** -- a pinned, vetted statistics library is REQUIRED for the Clopper-Pearson / Wilson / Beta-Bernoulli math and the Pass@1/Pass^k combinatorics. The prior research's "zero external dependency / the binomial CI is the ONE place you MUST hand-roll / no `npm install` step" framing is REPLACED accordingly. The estimator MATH is unchanged (D-07): Clopper-Pearson (exact binomial) / Wilson / Beta-Bernoulli, judged on the UPPER bound, never Wald, never bootstrap. Only HOW it is computed changes -- from a hand-rolled `logGamma`/`incbeta`/`betaInv` to a library call.

Three findings still materially shape the plan and were NOT obvious from the locked context. (1) **Both AVeriTeC repos (`chenxwh/AVeriTeC`, `MichSchli/AVeriTeC`) AND `lytang/LLM-AggreFact` are GATED on HuggingFace** -- the eval loader needs an `HF_TOKEN` for those three; only `jon-tow/wice` and `cmalaviya/expertqa` are ungated. The eval loader uses the globally-installed `hf` CLI (`hf download`, eval-time TOOL dep per D-01b) which resolves the token via env -> `HF_TOKEN_PATH` -> `HF_HOME/token` (same as `huggingface_hub`). (2) **There is no release branded "AVeriTeC 2.0"** -- the "REVISED knowledge store" CONTEXT.md references is the FEVER-2024 revised KS released **2024-11-15** that fixed test-set leakage; reference it by that date, not a "2.0" tag. (3) The library pick: **`jstat` 1.9.6 (MIT, zero runtime deps, single pure-JS package)** provides both `jStat.beta.inv` (the Clopper-Pearson upper-bound quantile) AND `jStat.combination` (the Pass@1/Pass^k combinatorics) and reproduces all four verified numeric anchors exactly; the actively-maintained heavier alternative is `@stdlib/stats-base-dists-beta-quantile` (Apache-2.0). Both verified against the registry + the anchors this session.

**Primary recommendation:** Build EVAL-05 first as a `references/` artifact grounded in the authoritative Anthropic prompting doc + Haiku 4.5 facts (verified below); then author the two voter agents against the FROZEN vote schema (these SHIP, so they stay in the plugin tree, zero-dep); then scaffold the repo-level **`eval/`** dir (`eval/package.json` + committed lockfile + gitignored `eval/node_modules/`, the pinned statistics library, and the eval scripts) and build the dataset-loader + eval-aggregator (mirroring `lz-deep-research-aggregate.mjs`'s hardening discipline, importing it ACROSS trees by relative path for its primitives), computing the Clopper-Pearson upper bound via the **library** (never hand-rolled) with the verified anchors pinned as the integration test that proves the wiring; RE-SCOPE the existing `SC-2 zero-dependency contract` test (a deliberate, in-scope edit to the Phase-16 runtime test) so it asserts no `package.json`/`node_modules` under the PLUGIN TREE rather than walking to the repo root (which would now false-fail on `eval/package.json`); write the pre-registered lock rule BEFORE any model call; run the staged, credit-aware eval headlessly via `claude -p --permission-mode auto`.

<user_constraints>
## User Constraints (from CONTEXT.md)

> **AMENDMENT 2026-06-16 (re-plan, owner-directed):** The zero-dep constraint binds ONLY the DISTRIBUTED PLUGIN RUNTIME. The non-distributed EVAL/DEV scripts (`lz-eval-*`) may now use pinned, integrity-verified npm devDependencies and MOVE OUT of the plugin tree into a repo-level `eval/` directory with their own `package.json` + gitignored `node_modules`. Hand-rolling statistical/numerical primitives is FORBIDDEN -- the hand-rolled Clopper-Pearson / Wilson / Beta-Bernoulli (and the underlying `logGamma`/`incbeta`/`betaInv`) math is REMOVED; a pinned, vetted statistics library is REQUIRED. The amended decisions are D-01, D-01b, D-04, D-07, D-10, plus new D-11. CONTEXT takes precedence over this RESEARCH.

### Locked Decisions

> Verbatim from `18-CONTEXT.md` `<decisions>` (as amended 2026-06-16). These are AUTHORITATIVE. Research HOW to implement them, never alternatives.

- **D-01 (eval harness architecture):** Mirror executor -> grader -> deterministic off-model aggregator in a COMMITTED harness. AMENDED: the harness is non-distributed DEV tooling and MAY use pinned, integrity-verified npm devDependencies (D-01b); it lives in the repo-level `eval/` dir (D-10/D-11); only the distributed plugin runtime stays strictly zero-dep. The false-uphold GATE is a deterministic verdict-vs-gold-label check. A Node aggregator computes Pass@1, Pass^k, per-stratum false-uphold + its interval from a single shared sample pool. An LLM-rubric grader is used ONLY for qualitative VERIF checks, one ISOLATED judge per dimension with an "Unknown" out. skillgrade is NOT a dependency; its PATTERNS are mirrored.
- **D-01b (owner clarification + AMENDMENT):** "zero external dependencies" governs the DISTRIBUTED PLUGIN RUNTIME -- the research skill + Phase 19/20 workers + the Phase-16 runtime aggregator + the shipped voter agents -- which use no npm packages and no external CLIs. The EVAL scripts (`lz-eval-*`) are dev/design infrastructure and MAY use the globally-installed `hf` CLI (dataset fetch via `hf download`) and the `claude` CLI (the headless run driver), AND, per the AMENDMENT, **pinned, integrity-verified npm devDependencies** -- in particular a vetted statistics library is now REQUIRED for the CI/interval math (D-07); hand-rolling it is forbidden. Eval deps live in the repo-level `eval/` tree's own `package.json` + gitignored `node_modules`, pinned with a committed lockfile, and never shipped. Re-verify sha256 after download for integrity.
- **D-02 (subtle stratum spine):** SUBTLE-OVERREACH stratum uses **WiCE** (`jon-tow/wice`) as its SPINE. VitaminC is REJECTED for this stratum (may appear only as an explicitly-labeled EASY-FLIP control).
- **D-02b:** **LLM-AggreFact** (`lytang/LLM-AggreFact`) = HELD-OUT realistic stress set, used VERBATIM only, de-duplicating its embedded WiCE subset.
- **D-02c:** **AVeriTeC** (`MichSchli/AVeriTeC` authoritative; `chenxwh/AVeriTeC` = FEVER-2024 mirror w/ knowledge store) = the OPEN-BOOK arm + leakage test only. EXCLUDE the Conflicting/Cherry-picking class from the hard-gate stratum. **ExpertQA** (`cmalaviya/expertqa`, MIT) = SECONDARY seed only. SciFact / Climate-FEVER / HoVer / FEVEROUS REJECTED.
- **D-02d:** Sample + stratify PROGRAMMATICALLY to EVAL-01 (~40% supported / ~60% bad, ~half the bad SUBTLE; closed-book + open-book). Map source labels to frozen `unrefuted | refuted`: supported -> `unrefuted`; partially-supported / not-supported -> `refuted`; `partially-supported` IS the SUBTLE substratum (false-uphold trap = a voter calling a partially-supported claim `unrefuted`).
- **D-03 (no hand-authoring; conditional trap-augmentation):** Primary path uses WiCE's EXISTING human gold labels DIRECTLY. Add a SATURATION CHECK -- if natural WiCE `partially_supported` items do not discriminate, augment with a PROGRAMMATICALLY generated, MECHANICALLY validated trap set (each trap = a WiCE partially-supported SEED overreached by exactly one hedge/quantifier/scope step, accepted ONLY if it flips a deliberately-weak reference verifier; cross-family panel adjudicates). Model-assisted + script-validated, NEVER hand-written, authored ONLY from permissive seeds (WiCE / ExpertQA), NEVER from LLM-AggreFact or AVeriTeC.
- **D-04 (license + data handling):** Vendor ONLY WiCE (annotations ODC-BY / code MIT) with an attribution NOTICE; do NOT trust the `tasksource/wice` mirror's license field. AVeriTeC = FETCH-ONLY, never vendored (CC-BY-NC-4.0; KS = hard no-vendor). LLM-AggreFact = CC-BY-ND-4.0 = verbatim-only. For every non-vendored source, COMMIT ONLY a DERIVED MANIFEST -- example IDs + remapped strata labels + a PINNED HF revision + sha256 checksums -- and FETCH the text at eval time into a GITIGNORED local cache, failing loud on checksum mismatch. AMENDED: cache + manifest handling unchanged; the eval cache now lives under the repo-level `eval/` tree (D-10/D-11). Eval tooling may use pinned npm deps (D-01b); the DISTRIBUTED plugin package stays clean.
- **D-05 (open-book leakage mitigation):** Open-book arm uses AVeriTeC's REVISED knowledge store (post-2024-11-15) as the SOLE retrieval source -- NOT the original 2024 KS. Enforce a per-claim publication-date cutoff. REJECT live web search and fact-check-domain exclusion. Add a CLOSED-BOOK CONTROL ARM on the same claims. Prefer claims dated after both models' training cutoffs where feasible.
- **D-06 (execution staging + DELTA gate):** The gate is the Haiku-MINUS-Sonnet false-uphold DELTA per stratum, with Sonnet run on the IDENTICAL sampled strata as the calibration baseline -- NEVER Haiku's absolute rate. Sequence: pre-register the lock rule FIRST -> `--validate` oracle pre-flight (trusted Sonnet ~100% on a known-answer seed) -> run the SUBTLE stratum FIRST -> remaining strata + closed-book control. Shared-pool pass@k estimator. Temperature 0. Abort-early ONLY on FAIL; for any PASS, escalate the SUBTLE subset to reliable=15 trials before declaring PASS. Staged across credit-reset windows. k>=5 per EVAL-02.
- **D-07 (lock rule -- pre-registered, library-computed exact-binomial interval):** Written BEFORE running. Report an INTERVAL, not a point estimate -- NOT a Wald/normal-approx CI and NOT bootstrap. Use Clopper-Pearson (exact binomial) or Wilson score, or a Beta-Bernoulli Bayesian credible interval, and judge on the UPPER bound. Hard gate = the SUBTLE open-book false-uphold DELTA's upper CI bound ~0, with reliable=15 on SUBTLE required for PASS. Cost gate = kill Haiku if escalation fraction > 40-50%. Fail either gate -> RAISE TO USER; Sonnet-default ships in the interim. Committed artifact, mechanically enforced. AMENDED (owner directive "no hand-rolling"): the CI interval MUST be computed by a **pinned, vetted statistics library**; hand-rolling the statistics is FORBIDDEN (no in-repo `logGamma`/`incbeta`/`betaInv`, no hand-coded Clopper-Pearson / Wilson / Beta-Bernoulli). The estimator choice is unchanged; the verified numeric anchors remain the integration test pinning the library. Prefer the same library's `comb`/`binomial` for the Pass@1/Pass^k combinatorics rather than a hand-rolled `comb`.
- **D-08 (EVAL-05 fairness separation):** The Haiku voter prompt comes from the dedicated Haiku-prompt research artifact, NOT a Sonnet prompt on `model: haiku`. Haiku and Sonnet run on the IDENTICAL dataset + grader. The research precedes authoring any Haiku agent.
- **D-09 (voter agents vs FROZEN Phase-17 schema):** Two variants vs the frozen vote schema: Sonnet baseline (ship default) + research-grounded Haiku. Each casts ONE isolated skeptic vote, NO shared context, diversified by the 3 attack modes (factual contradiction / scope-causality overclaim / source-provenance). Fills the reserved envelope: `attack_mode` (VERIF-01); `disconfirming_query` (VERIF-02); source-independence note (VERIF-03). Grade outcomes, not steps.
- **D-10 (harness location + test discipline -- AMENDED):** The EVAL harness + the committed dataset manifest + vendored-WiCE + all `__fixtures__` move to a **REPO-LEVEL `eval/` directory OUTSIDE `plugins/`** (Claude's Discretion on the exact name, recommended `eval/`), with its own `package.json` + committed lockfile + gitignored `node_modules`. The fetched non-vendored corpora land in a GITIGNORED cache under that `eval/` tree. The Phase-16 RUNTIME aggregator (`lz-deep-research-aggregate.mjs`) + its fixtures + the shipped voter agents STAY in the plugin tree. The eval aggregator/loader/run-driver import the runtime aggregator across trees by relative path when they need its hardening primitives. node:test gating MUST still use the explicit `.test.mjs` FILE form, never `node --test <dir>` (host quirk).
- **D-11 (packaging boundary -- new 2026-06-16):** The marketplace plugin package (everything under `plugins/lz-advisor/`) MUST contain NO eval scripts and NO eval dev dependencies. The repo-level `eval/` dir is dev-only: its `node_modules` is gitignored and the tree is outside the distributed plugin tree, so a dependency added to the eval harness can never leak to plugin users. The re-plan VERIFIES this boundary (no `package.json`/`node_modules` anywhere under `plugins/lz-advisor/`, and no eval-script import from any shipped runtime artifact). The Phase-16 runtime aggregator + the shipped voter agents remain strictly zero-dep.

### Claude's Discretion

- Exact WiCE sampling/stratification recipe and the supported:partially:not ratios within the SUBTLE stratum.
- The interval estimator among Clopper-Pearson / Wilson / Beta-Bernoulli (all valid; pick per implementation), AND the specific vetted statistics library that computes it (D-07, as amended -- the math MUST come from a pinned library; hand-rolling is forbidden).
- Whether the saturation check triggers trap-augmentation, and the trap-generation templates.
- The cross-family adjudication agreement statistic; the `--validate` seed-claim count.
- The exact `eval/` dir name + internal layout; the gitignored cache path name (now under `eval/`).
- The specific eval npm devDependencies (must be pinned + lockfiled + vetted); aggregator internal naming.
- Section ordering of the Haiku-prompt reference artifact.

### Deferred Ideas (OUT OF SCOPE)

- Ecosystem-representative / larger-N (>100) dataset -- v2.
- The Phase-19 Haiku search-worker tier -- follows this eval's outcome (the Haiku-prompt research serves it too).
- Production false-uphold monitoring + ~15-20% random audit of Haiku-unanimous upholds -- Phase 20.
- ExpertQA / AVeriTeC-Cherry-picking as additional trap-seed corpora -- pulled in ONLY if the WiCE-based SUBTLE stratum saturates (D-03 conditional).
- Research RTK command suitability for skills/agents -- backlog, NOT folded.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VERIF-01 | Each verified claim judged by 3 ISOLATED skeptic voters, diversified by attack mode | Voter agent structure (3 attack modes); reserved envelope `attack_mode` field (frozen schema D-10); each voter casts ONE isolated vote with no shared context (verified `[CITED: lz-deep-research-schema.md]`). In THIS phase the eval runs the voter as a single isolated skeptic per (claim x seat x tier); the 3-isolated-voters-per-claim wiring is exercised by the aggregator tally (3 seats) it already consumes. |
| VERIF-02 | Each open-book voter runs an explicit DISCONFIRMING search and records the query | `disconfirming_query` envelope field; the voter prompt instructs "search the NEGATION" (mirrors the proven pilot's "ACTIVELY look for evidence that contradicts"); the harness asserts `disconfirming_query` non-empty on open-book votes (LLM-rubric grader dimension, D-01). |
| VERIF-03 | Corroboration weighted by SOURCE INDEPENDENCE, not raw count | Source-independence note in envelope; canonical-URL key rule already frozen in the schema; the voter records which canonical sources it relied on (N syndicated copies count as one). |
| COST-02 | Voters default to Sonnet; Haiku-first Tier-1 flag exists OFF until the eval clears | Two voter agents authored (Sonnet baseline = ship default; Haiku = behind flag). Both SHIP -> stay in the plugin tree, strictly zero-dep. The eval's verdict (D-06/D-07) is what flips the flag. |
| EVAL-01 | Pre-registered dataset >=60-100 labeled claims, stratified (~40% supported / ~60% bad, ~half bad SUBTLE), closed- + open-book | Dataset loading mechanics (WiCE spine + AVeriTeC open-book arm) in the `eval/` loader; programmatic stratification recipe; derived manifest format (committed under `eval/`). |
| EVAL-02 | Run each claim k>=5; report Pass@1, Pass^k, false-uphold per stratum | Deterministic eval aggregator (Pass@1 / Pass^k via the library's `combination`; shared-pool estimator); per-stratum false-uphold counting. |
| EVAL-03 | Flip Haiku-first ON only if ~0 open-book false-upholds on SUBTLE AND escalation materially below all-Sonnet; else RAISE TO USER | The DELTA gate + cost gate (D-06/D-07); structured "raise to user" output path. |
| EVAL-04 | Lock rule written BEFORE the eval runs | Pre-registered lock-rule artifact (committed under `eval/` or `references/` -- planner picks); mechanically enforced threshold check using the library-computed interval. |
| EVAL-05 | Haiku voter prompt engineered from a dedicated deep-research pass (reference artifact), grounded in CURRENT authoritative sources | THE open research deliverable; verified Haiku techniques below + the corrections vs the non-authoritative starting list. Unaffected by the packaging amendment. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| EVAL-05 Haiku-prompt reference artifact | Documentation (`plugins/lz-advisor/references/`) | -- | Pure prose research output; ships with the plugin; consumed by the planner + the Haiku agent author; no runtime tier, no deps. |
| Voter verdict (judgment: does evidence support the claim) | Model (Sonnet / Haiku agent, plugin tree) | -- | Inherently non-mechanizable; the whole eval measures whether Haiku can do this safely. Agents SHIP -> zero-dep. |
| Disconfirming web search (open-book arm) | Model (voter agent, `WebSearch`/`WebFetch`) | -- | Agentic tool-use; the cost-driving fork. |
| Vote tally -> confidence; false-uphold count; Pass@1/Pass^k; CI | Deterministic Node eval aggregator (`eval/`, pinned stats lib) | Runtime aggregator (imported across trees for its primitives) | Reproducible, zero-token, off-model -- the SOLE hard gate must be deterministic (D-01). The CI math comes from the pinned library, NEVER hand-rolled (D-07). |
| Dataset fetch + sha256 verify + label remap | Deterministic Node loader (`eval/`) + `hf` CLI | Network (HF resolve CDN) | Integrity + license-compliant local cache under `eval/`; no model tokens. |
| Eval orchestration (fan-out voters, stage strata) | Harness driver (`claude -p` headless, `eval/`) | Deterministic eval aggregator | Headless executor pattern proven (SESSION-DESIGN A2); aggregation off-model. |
| Qualitative VERIF checks (attack-mode diversity, disconfirming_query present) | LLM-rubric grader (isolated judge per dimension, "Unknown" out) | -- | Only "where necessary" (D-01); never the hard gate. |
| Packaging-boundary enforcement (no deps leak to the plugin) | Deterministic check (D-11) | Re-scoped runtime SC-2 test | The plugin tree stays import-clean; the `eval/` deps are structurally excluded from the package. |

## Standard Stack

The DISTRIBUTED PLUGIN RUNTIME (the `lz-deep-research` skill + Phase-16 runtime aggregator + the shipped voter agents) has **zero external runtime dependencies** by hard constraint (AGG-02 / D-01b / D-11) -- unchanged. The NON-DISTRIBUTED `eval/` tooling is a separate package with its OWN pinned npm devDependencies (D-01b amendment); it never ships (D-11).

### Core (distributed plugin runtime -- strictly zero-dep, plugin tree)

| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Node.js stdlib (`node:fs`, `node:path`, `node:url`, `node:crypto`, global `fetch`) | v24.13.0 (host) `[VERIFIED: node --version]` | The shipped runtime aggregator + the two voter agents carry no deps | Zero-dep contract for everything under `plugins/lz-advisor/`. `[CITED: existing aggregator imports only node:*]` |
| `node:test` + `node:assert/strict` | bundled with Node 24 | Runtime aggregator validation fixture (the existing `lz-deep-research-aggregate.test.mjs`) | The frozen test pattern; MUST use explicit `.test.mjs` FILE form (host quirk). `[VERIFIED: existing .test.mjs header + memory note]` |

### Core (eval/ dev tooling -- pinned npm deps, repo-level eval/ dir, NEVER ships)

| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Node.js stdlib + `node:test` | v24.13.0 | Eval loader + eval aggregator + their `.test.mjs` | Same stdlib spine; the `eval/` package adds ONLY the stats lib on top. |
| **`jstat`** (RECOMMENDED) | **1.9.6** `[VERIFIED: registry.npmjs.org]` | Beta quantile (`jStat.beta.inv`) = the Clopper-Pearson UPPER bound; `jStat.combination` = Pass@1/Pass^k combinatorics; Wilson computed from `jStat` primitives | MIT, **zero runtime deps, single pure-JS package** (no native build), ~914K weekly downloads, created 2015. Provides BOTH the beta quantile AND the combinatorics in one dep -- exactly what D-07 needs. Reproduces all four verified anchors exactly (below). |
| `hf` CLI (HuggingFace, global) | host-installed | Dataset fetch (`hf download`: auth, LFS, `--include`, `--revision`, repo-type) | Eval-time TOOL dep (D-01b); resolves `HF_TOKEN` env -> `HF_TOKEN_PATH` -> `HF_HOME/token`. |
| `claude` CLI | Claude Code v2.1.x | Headless voter execution + `--validate` oracle | The project's verified skill-verification path; A2 spike proved headless fan-out under `auto`. `[CITED: SESSION-DESIGN.md S13 A2]` |

### Alternatives Considered (the statistics library)

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `jstat` (primary) | `@stdlib/stats-base-dists-beta-quantile` 0.2.3 (Apache-2.0) `[VERIFIED: registry.npmjs.org]` | More actively maintained (last publish 2026-02-08, core stdlib team `kgryte`/`planeshifter`/`rreusser`) and rigorously tested -- BUT pulls **233 transitive `@stdlib/*` micro-packages** and exposes only the beta quantile (would also need `@stdlib/math-base-special-binomcoef` 0.3.1 for `comb`). Pure-JS, no native build, no install scripts. Reproduces the anchors exactly. Choose this if maintenance recency outweighs the heavy dep tree. |
| `jstat` (primary) | `simple-statistics` 7.9.0 (ISC) `[VERIFIED: registry.npmjs.org]` | Actively maintained, zero deps, ~1.05M wk downloads -- BUT does NOT expose an inverse incomplete beta / beta quantile (no Clopper-Pearson upper bound). Insufficient for D-07. REJECTED. |
| `jstat` (primary) | `distributions` 2.2.0 (MIT) | Depends on `cephes` (a port of the C cephes library); adds an avoidable transitive surface and is less widely used. Not preferred. |

Note: `jstat`'s registry manifest has no `license` field, but the package ships an **MIT LICENSE file** (`Copyright (c) 2013 jStat`, verbatim MIT text) `[VERIFIED: node_modules/jstat/LICENSE]`. Pin the exact version (`1.9.6`) and commit the lockfile so the resolved tree is reproducible.

**Installation (scoped to `eval/`, NEVER the plugin tree):**
```bash
# Run from the repo-level eval/ dir (its own package.json + committed lockfile):
cd eval
npm install            # restores from the committed lockfile (eval/package-lock.json)
# Initial pin (one-time, when first adding the dep):
npm install --save-exact jstat@1.9.6
```
There IS an `npm install` step now -- but ONLY under `eval/`. The plugin tree (`plugins/lz-advisor/`) has no `package.json` and no `node_modules` (D-11). The `eval/node_modules/` directory is gitignored; `eval/package.json` + `eval/package-lock.json` are committed so the pin is reproducible.

**Version verification (this session):**
- `jstat@1.9.6` -- license MIT (LICENSE file), zero runtime deps, no `gypfile`/native build, no install/preinstall/postinstall scripts, latest publish 2022-11-21, ~914K wk downloads, repo `github.com/jstat/jstat`. `[VERIFIED: registry.npmjs.org + npm install + node_modules/jstat/package.json]`
- Numeric-anchor verification (installed `jstat@1.9.6`, Node 24): `jStat.beta.inv(0.2,3,3) = 0.3265979...` (~0.327 OK); `jStat.beta.inv(0.4,1,6) = 0.0816141...` (~0.082 OK); `cpUpper(0,15,0.05) = jStat.beta.inv(0.975,1,15) = 0.2180194...` (~0.218 OK); `jStat.combination(15,3) = 455` OK. `[VERIFIED: local install + run]`
- `@stdlib/stats-base-dists-beta-quantile@0.2.3` (alt) -- same anchors verified: `betaQuantile(0.2,3,3) = 0.3265979`, `betaQuantile(0.4,1,6) = 0.0816141`, `clopperPearsonUpper(0,15,0.05) = 0.2180194`, `CP(15,15)=1`. Apache-2.0, 0 native binaries, 0 `binding.gyp`. `[VERIFIED: local install + run]`

**Dataset/revision verification (unchanged from prior research):**
- `jon-tow/wice` main commit: `54f7976b8ce4fe0a9bfd35a4dd30af9d5b45d8a6` `[VERIFIED: HF refs API]` -- pin THIS sha in the manifest.
- WiCE raw data files on main: `data/claim_dev.jsonl`/`_test`/`_train`, `data/subclaim_dev.jsonl`/`_test`/`_train` (LFS). Split names in raw JSONL are `dev`/`test`/`train`. `[VERIFIED: HF tree API]`
- WiCE label enum: `"supported"` | `"partially_supported"` | `"not_supported"` `[VERIFIED: github.com/ryokamoi/wice README]`.
- LLM-AggreFact schema: `dataset`/`doc`/`claim`/`label`(int64)/`contamination_identifier`; splits `dev`(30420)/`test`(29320). `[VERIFIED: HF API cardData.dataset_info]`
- ExpertQA configs `lfqa_domain` / `lfqa_random`; fields `example_id`/`context`/`question`/`answer` (no discrete overreach label). `[VERIFIED: datasets-server info]`

## Package Legitimacy Audit

> Now applicable: the `eval/` tooling installs ONE pinned npm dependency (the statistics library). The DISTRIBUTED plugin runtime installs ZERO packages (D-11). HuggingFace DATASETS fetched at eval time are audited for license + gating separately.

**slopcheck note:** slopcheck could not be auto-installed/run this session (the sandbox classifier denied installing an agent-chosen package -- the correct safe default). Per the graceful-degradation protocol, the recommended npm dependency below is verified against the npm registry directly (age, downloads, license, native-build status, install scripts, transitive deps) AND empirically against the verified numeric anchors. The planner SHOULD still gate the first `npm install jstat@1.9.6` behind a `checkpoint:human-verify` task (confirm the pin + lockfile + that the LICENSE is MIT) before committing the lockfile.

| Package | Registry | Age | Downloads | Source Repo | Native build / install scripts | Disposition |
|---------|----------|-----|-----------|-------------|-------------------------------|-------------|
| `jstat` 1.9.6 (PRIMARY) | npm | created 2015-04 (~11 yrs) | ~914K/wk | github.com/jstat/jstat | none (`gypfile` unset; no install/pre/postinstall) | Approved -- pin exact, commit lockfile, MIT LICENSE file present; human-verify checkpoint before first install |
| `@stdlib/stats-base-dists-beta-quantile` 0.2.3 (ALT) | npm | created 2021-06 | ~35K/wk | github.com/stdlib-js/stats-base-dists-beta-quantile | none (pure-JS; 233 transitive `@stdlib/*`, all no-native) | Acceptable alternative if maintenance recency preferred over dep-tree size |
| `simple-statistics` 7.9.0 | npm | active | ~1.05M/wk | github.com/simple-statistics/simple-statistics | none | REJECTED -- no inverse incomplete beta / beta quantile |

**Packages removed due to slopcheck [SLOP] verdict:** none (slopcheck unavailable; registry-verified instead).
**Packages flagged as suspicious [SUS]:** none. (`jstat`'s missing manifest `license` field is a known packaging gap, NOT a licensing concern -- the MIT LICENSE file is present and verified.)

| Dataset | Registry | Age | License | Gated | Disposition |
|---------|----------|-----|---------|-------|-------------|
| `jon-tow/wice` | HF datasets | created 2024-01 | ODC-BY / MIT | no | Approved -- VENDOR under `eval/` with NOTICE |
| `lytang/LLM-AggreFact` | HF datasets | created 2024-04 | CC-BY-ND-4.0 | yes | FETCH-ONLY verbatim (HF_TOKEN); manifest = IDs+labels+sha256 |
| `chenxwh/AVeriTeC` | HF datasets | -- | CC-BY-NC-4.0 | yes | FETCH-ONLY (HF_TOKEN); KS NEVER vendored |
| `MichSchli/AVeriTeC` | HF datasets | -- | CC-BY-NC-4.0 | yes | FETCH-ONLY (HF_TOKEN) |
| `cmalaviya/expertqa` | HF datasets | -- | MIT | no | Secondary seed only (conditional) |

**Runtime/plugin-tree npm-package note (D-11):** No npm dependency is recommended or permitted in the RUNTIME / plugin tree. A future maintainer must NOT add a `package.json` or `node_modules` anywhere under `plugins/lz-advisor/`. The shipped voter agents and the Phase-16 runtime aggregator stay import-clean (`node:`/`./`/`../` only). The stats library is permitted ONLY under `eval/`, pinned + lockfiled + gitignored-`node_modules`, and is structurally excluded from the marketplace package.

## Architecture Patterns

### System Architecture Diagram

```
                      [Pre-registered LOCK RULE]  (written FIRST, EVAL-04, committed)
                                 |
                                 v
 HuggingFace (resolve CDN, 307) --hf download + sha256 verify-->  GITIGNORED cache (eval/.cache/ or similar, UNDER eval/)
   jon-tow/wice (ungated)                                              |
   lytang/LLM-AggreFact (HF_TOKEN)                                     |  eval/ loader reads committed DERIVED MANIFEST
   chenxwh/MichSchli/AVeriTeC (HF_TOKEN)                               |  (eval/<manifest>.json: IDs + remapped labels + revision + sha256)
                                                                       v
                                                   [STRATIFIED EVAL DATASET in memory]
                                                   ~40% supported / ~60% bad (~half SUBTLE)
                                                   closed-book claims + open-book (AVeriTeC+KS) claims
                                                                 |
              +--------------------------------------------------+--------------------------------------------------+
              |                                                  |                                                  |
              v                                                  v                                                  v
  --validate ORACLE PRE-FLIGHT                          STAGE 1: SUBTLE stratum FIRST                  STAGE 2: remaining strata
  (trusted Sonnet ~100% on seed)                        (the sole hard gate)                           + CLOSED-BOOK control arm
              |                                                  |
              |                          per claim x seat x tier (Sonnet baseline, Haiku variant):
              |                          claude -p --permission-mode auto  ->  ISOLATED skeptic voter (PLUGIN-TREE agent)
              |                                                  |     (open-book: disconfirming WebSearch over AVeriTeC KS,
              |                                                  |      per-claim date cutoff; closed-book: provided excerpt only)
              |                                                  v
              |                                    vote files: { verdict: unrefuted|refuted,
              |                                                   attack_mode, disconfirming_query, source_independence_note }
              +-----------------------+--------------------------+
                                      v
       eval/ DETERMINISTIC OFF-MODEL EVAL AGGREGATOR  (Node + pinned stats lib)
         - imports the PLUGIN-TREE runtime aggregator across trees (../../plugins/.../lz-deep-research-aggregate.mjs)
           by relative path for its hardening primitives (ContractError, safeId, listJson, readJson)
         - tally verdict vs GOLD label (false-uphold = bad claim called unrefuted)
         - Pass@1, Pass^k via jStat.combination (shared-pool estimator), per-stratum false-uphold
         - Haiku-MINUS-Sonnet DELTA per stratum
         - Clopper-Pearson UPPER bound via jStat.beta.inv  (LIBRARY, never hand-rolled -- D-07)
                                      |
                                      v
                  MECHANICAL LOCK-RULE CHECK (compare library-computed interval to pre-registered thresholds)
                                      |
                   +------------------+------------------+
                   v                                     v
        PASS (upper bound ~0 AND escalation<40-50%)   FAIL either gate
        -> reliable=15 on SUBTLE -> flip Haiku-first   -> RAISE TO USER (EVAL-03);
                                                          Sonnet-default ships regardless
```

File-to-component mapping is in the Recommended Project Structure below, not in the diagram.

### Recommended Project Structure

```
plugins/lz-advisor/                       # THE DISTRIBUTED PACKAGE -- strictly zero-dep (D-11)
  references/
    lz-haiku-prompt-engineering.md         # EVAL-05 artifact (NEW); ships; progressive-disclosure ref
  agents/
    research-verify-voter-sonnet.md        # Sonnet baseline voter (NEW; ship default; zero-dep)
    research-verify-voter-haiku.md          # research-grounded Haiku voter (NEW; behind flag; zero-dep)
  skills/lz-deep-research/scripts/
    lz-deep-research-aggregate.mjs          # EXISTING runtime aggregator -- imported by eval/ across trees; NOT moved
    lz-deep-research-aggregate.test.mjs     # EXISTING -- its SC-2 test gets RE-SCOPED this phase (in-scope edit; see below)

eval/                                       # NEW repo-level dir, OUTSIDE plugins/ -- dev-only, NEVER ships (D-10/D-11)
  package.json                              # NEW -- name "lz-eval" (private), the jstat pin, "type":"module"
  package-lock.json                         # NEW -- COMMITTED lockfile (reproducible pin)
  node_modules/                             # GITIGNORED (never committed, never shipped)
  lz-eval-dataset.mjs                       # NEW -- HF fetch (hf CLI) + sha256 + label remap
  lz-eval-dataset.test.mjs                  # NEW -- loader fixture (offline: checksum/remap/fail-closed)
  lz-eval-aggregate.mjs                     # NEW -- Pass@1/Pass^k/false-uphold/DELTA/Clopper-Pearson (via jstat)
  lz-eval-aggregate.test.mjs                # NEW -- aggregator fixture (interval math anchors, tally, delta)
  lz-eval-packaging-boundary.test.mjs       # NEW (D-11) -- asserts no package.json/node_modules under plugins/lz-advisor/
  lz-eval-lock-rule.md                      # NEW -- pre-registered lock rule (EVAL-04), committed BEFORE running
  __fixtures__/
    lz-eval-manifest.json                   # NEW -- committed DERIVED MANIFEST (IDs+labels+revision+sha256)
    wice-vendored/ + NOTICE                 # NEW -- the ONLY vendored corpus (D-04), now under eval/
  .cache/                                   # GITIGNORED fetched non-vendored corpora (license-compliant local-only)
```

Notes:
- The eval scripts keep the `lz-eval-*` basenames but live under `eval/`, not `plugins/.../scripts/` (D-10).
- The lock rule may live at `eval/lz-eval-lock-rule.md` (co-located with the harness) OR `plugins/lz-advisor/references/` if the planner prefers a shipped artifact -- D-04/EVAL-04 only require it be committed BEFORE the run. Recommended: `eval/` (it is eval infrastructure, not a user-facing reference).
- The `eval/` cache path name is Claude's Discretion; `eval/.cache/` shown for concreteness.

### Pattern 1: Cross-tree import of the runtime aggregator's hardening primitives

**What:** The `eval/` aggregator/loader import the SHIPPED runtime aggregator by relative path to reuse its proven `ContractError`, `safeId`, `listJson`, `readJson`, and normalization, rather than re-implementing them (which risks drift).
**When to use:** Whenever the eval scripts need fail-closed parsing, basename safety, or deterministic listing.

```javascript
// eval/lz-eval-aggregate.mjs -- cross-tree import (D-10)
// From eval/ to the plugin tree: up one level, then into plugins/.
import {
  // re-exported primitives from the runtime aggregator
  safeId, listJson,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';
```

The runtime aggregator stays zero-dep; the eval script that imports it is the one carrying `jstat`. Because the import is one-directional (eval -> runtime, never runtime -> eval), no dependency leaks into the shipped artifact (D-11).

### Pattern 2: Library-computed Clopper-Pearson upper bound (NO hand-rolling -- D-07)

**What:** Compute the worst-case false-uphold rate via the pinned statistics library's beta quantile. The hand-rolled `logGamma`/`incbeta`/`betaInv` from the prior research is REMOVED.
**When to use:** The eval aggregator's interval computation and the mechanical lock-rule check.

```javascript
// Source: jstat 1.9.6 jStat.beta.inv (verified anchors this session). D-07.
import jStatPkg from 'jstat';
const { jStat } = jStatPkg;

// Clopper-Pearson UPPER bound = Beta^{-1}(1 - alpha/2 ; x + 1, n - x).
// x = false-uphold count, n = trials, alpha default 0.05.
function clopperPearsonUpper(x, n, alpha = 0.05) {
  if (n === 0) return 1;
  if (x === n) return 1;                 // CP(n,n) = 1
  return jStat.beta.inv(1 - alpha / 2, x + 1, n - x);
}

// Wilson upper bound (alternative per D-07) from jStat primitives (no separate formula table needed):
function wilsonUpper(x, n, conf = 0.95) {
  if (n === 0) return 1;
  const z = jStat.normal.inv(1 - (1 - conf) / 2, 0, 1); // ~1.95996 for 95%
  const p = x / n, z2 = z * z, denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  return Math.min(1, center + half);
}

// Pass@k / pass^k via the library's combinatorics (prefer over a hand-rolled comb -- D-07):
function passAtK(n, c, k)  { return n < k ? NaN : 1 - jStat.combination(n - c, k) / jStat.combination(n, k); }
function passHatK(n, c, k) { return n < k ? NaN : jStat.combination(c, k) / jStat.combination(n, k); }

// INTEGRATION-TEST ANCHORS (these PIN that the library is wired correctly -- the only thing the
// fixture must assert; the math itself is the library's responsibility, not ours):
//   clopperPearsonUpper(0, 15, 0.05) ~= 0.218   (verified 0.2180194)
//   jStat.beta.inv(0.2, 3, 3)        ~= 0.327   (verified 0.3265979)
//   jStat.beta.inv(0.4, 1, 6)        ~= 0.082   (verified 0.0816141)
//   clopperPearsonUpper(15, 15)       = 1
//   jStat.combination(15, 3)          = 455
```

> The SUBTLE gate quantity is the Haiku-MINUS-Sonnet DELTA. Compute the false-uphold count per tier on the shared SUBTLE pool, then report Clopper-Pearson on each and the DELTA's worst-case (e.g. Haiku-upper minus Sonnet-lower, or a paired Beta-Bernoulli on the difference -- the estimator choice is Claude's Discretion per D-07). All of it routes through `jStat.beta.inv` -- no in-repo special-function code.

### Pattern 3: HuggingFace fetch via the `hf` CLI with sha256 verify (D-01b / D-04)

**What:** Download a dataset file at a PINNED revision via `hf download` (handles auth, LFS, `--include`, `--revision`, repo-type), then verify a locally-computed sha256 against the committed manifest; fail loud on mismatch.
**When to use:** The eval loader (`eval/lz-eval-dataset.mjs`) for every non-vendored corpus.
**Token resolution:** `hf` resolves `HF_TOKEN` like `huggingface_hub`: env `HF_TOKEN` -> `HF_TOKEN_PATH` -> `HF_HOME/token` (so `hf auth login` works). Gated repos (LLM-AggreFact, both AVeriTeC) require the token + accepted terms; ungated (WiCE, ExpertQA) do not.

```bash
# Pinned, selective, integrity-checked fetch into the gitignored eval cache:
hf download chenxwh/AVeriTeC --repo-type dataset \
  --revision <pinned-sha> --include "<ks-glob>" \
  --local-dir eval/.cache/chenxwh__AVeriTeC
# then sha256-verify each downloaded file against eval/__fixtures__/lz-eval-manifest.json (fail-closed on mismatch).
```

The integrity primitive is a post-download sha256 the loader computes itself (`node:crypto.createHash('sha256')`). For LFS files the tree API exposes sha256 directly; small non-LFS JSONL carries only a git SHA-1 blob oid, so sha256 is computed locally on first download and pinned in the manifest.

### Pattern 4: The committed DERIVED MANIFEST (license-compliant; no redistributed text)

**What:** The only thing committed for fetch-only corpora -- a JSON file (under `eval/__fixtures__/`) of example IDs + remapped strata labels + the pinned HF revision + sha256 of the source file(s). The claim/evidence TEXT is fetched at eval time into the gitignored cache. This makes CC-BY-ND (LLM-AggreFact) and CC-BY-NC (AVeriTeC) compliant: no derivative, no redistribution.
**Label remap (D-02d, VERIFIED WiCE enum):** `supported` -> `expected_verdict: unrefuted`; `partially_supported` -> `refuted` (the SUBTLE substratum); `not_supported` -> `refuted`. The false-uphold trap on SUBTLE = a voter returning `unrefuted` on a `partially_supported` claim.

### Pattern 5: Mirror the runtime aggregator's hardening discipline

**What:** The new `eval/lz-eval-*.mjs` scripts MUST inherit the proven patterns from `lz-deep-research-aggregate.mjs`: explicit UTF-8 read; BOM/CRLF normalization where text is compared; `ContractError` with `.file` on every fail-closed path; `safeId` on any content-derived basename; sorted directory listings for determinism; the guarded CLI (`import.meta.url === resolve(process.argv[1])`); pure exported functions for tests. Reuse via the cross-tree import (Pattern 1) where possible.
**When to use:** All new eval scripts. Hard project convention, not a suggestion.

### Anti-Patterns to Avoid

- **Adding a `package.json` or `node_modules` anywhere under `plugins/lz-advisor/`.** Breaks D-11 and the (re-scoped) packaging-boundary check. The plugin tree stays zero-dep; deps live ONLY under `eval/`.
- **Hand-rolling the CI statistics** (`logGamma`/`incbeta`/`betaInv`, hand-coded Clopper-Pearson/Wilson/Beta-Bernoulli, or a hand-rolled `comb`). FORBIDDEN by the 2026-06-16 owner directive (D-07). Call the pinned library.
- **An unpinned / un-lockfiled eval dependency.** D-01b requires the eval deps be pinned (exact version) with a committed lockfile. Use `npm install --save-exact` and commit `eval/package-lock.json`.
- **Importing an `eval/` script from any shipped runtime artifact.** The import is one-directional (eval -> runtime only); a runtime -> eval import would leak the dep into the package (D-11).
- **Wald/normal-approx CI or bootstrap** for the false-uphold interval. Explicitly REJECTED by D-07 and arXiv 2503.01747.
- **Judging on Haiku's ABSOLUTE false-uphold rate.** The gate is the Haiku-MINUS-Sonnet DELTA (D-06).
- **Live web search in the open-book arm.** Retrieves the published verdict; non-reproducible (D-05). Use the AVeriTeC revised KS (2024-11-15) + per-claim date cutoff only.
- **Aggressive `CRITICAL: You MUST` prompt language in the Haiku voter.** 4.6-era models OVERTRIGGER on such language; the current guidance is plain phrasing (see EVAL-05).
- **`node --test <dir>`** to gate. Spuriously exits 1 on this host; use the explicit `.test.mjs` FILE form.
- **Committing the fetched corpus text** for LLM-AggreFact / AVeriTeC. License violation. Commit only the manifest; fetch text to the gitignored `eval/` cache.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Binomial CI / beta quantile (Clopper-Pearson upper, Wilson) | A hand-rolled `logGamma`/`incbeta`/`betaInv` | **`jstat`** `jStat.beta.inv` / `jStat.normal.inv` (pinned in `eval/`) | Owner directive 2026-06-16: hand-rolling the statistics is FORBIDDEN (D-07). The library is vetted, pinned, lockfiled, dev-only. |
| Pass@k combinatorics | A hand-rolled `comb` | `jStat.combination` | D-07 prefers the library's `comb`/`binomial`; verified `combination(15,3)=455`. |
| Vote tally -> confidence; ceilings; quote-recheck | A second tally engine | The EXISTING `lz-deep-research-aggregate.mjs` (import across trees) | Frozen contract; 30+ fixtures; re-implementing risks drift. |
| Fail-closed parse / basename safety / deterministic listing | New guards in the eval scripts | The runtime aggregator's `ContractError`/`safeId`/`listJson`/`readJson` (cross-tree import, Pattern 1) | Reuse the proven, security-reviewed primitives; do not fork them. |
| Labeled subtle-overreach claims | Hand-authored claims | WiCE `partially_supported` gold labels | D-03 "I will not hand-write these"; human gold labels are the spine. |
| HuggingFace download (auth, LFS, selective, pinned) | A manual `fetch` + 307 chase | The `hf` CLI (`hf download`, eval-time TOOL dep) | Handles gated auth, LFS pointers, `--include`, `--revision`, repo-type. |
| File integrity | A custom hash | `node:crypto.createHash('sha256')` | Stdlib, exactly what the manifest pins. |
| Test runner | Anything beyond `node:test` | `node:test` + `node:assert/strict` (explicit `.test.mjs` form) | Bundled; the proven host-safe gate. |

**Key insight (the inversion is REVERSED by the amendment):** The prior research declared the binomial CI "the ONE place you MUST hand-roll" because the zero-dep contract forbade any npm dependency. That exception is GONE. The eval tooling is non-distributed dev infrastructure that MAY (and now MUST) use a pinned, vetted statistics library for ALL CI/interval/special-function math. The only thing the eval fixture asserts about the math is that the LIBRARY IS WIRED CORRECTLY -- via the verified anchors -- not that a hand-rolled implementation is numerically correct. The distributed runtime stays strictly zero-dep, so the product's "Sonnet cost, zero deps" promise is unaffected: no dependency reaches a plugin user.

## Common Pitfalls

### Pitfall 1: SC-2 zero-dep test false-fails once `eval/package.json` exists (LOAD-BEARING -- in-scope runtime-test edit)
**What goes wrong:** The existing `SC-2 zero-dependency contract` test in `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (lines ~677-719) walks UP from the scripts dir to the repo root, asserting NO `package.json` at any level. Once the repo-level `eval/package.json` exists, this walk STILL passes for the runtime aggregator's own ancestor chain (the walk goes `scripts/ -> lz-deep-research/ -> skills/ -> lz-advisor/ -> plugins/ -> <repo-root>`, none of which is `eval/`). BUT the test's INTENT -- "the repo has no install surface" -- is now factually false, and any future tightening (e.g. checking siblings, or moving the test) would false-fail. More importantly, the contract it encodes is now WRONG: the repo DOES have an install surface (under `eval/`).
**Why it happens:** The repo-root walk conflated "the runtime is zero-dep" with "the whole repo is zero-dep." The amendment splits those: the PLUGIN TREE is zero-dep; the repo is not.
**How to avoid:** RE-SCOPE the SC-2 test to the PLUGIN TREE (this is a deliberate, in-scope edit to a Phase-16 runtime test -- the planner MUST plan it):
- Keep the import-spec assertion (runtime aggregator imports only `node:`/`./`/`../`).
- REPLACE the repo-root `package.json` walk with: assert NO `package.json` and NO `node_modules` anywhere UNDER `plugins/lz-advisor/` (the distributed tree), instead of walking to the repo root.
- This is a runtime-test edit (it lives in the plugin tree's test file), so it stays zero-dep and runs under the existing CI glob (`plugins/lz-advisor/skills/**/*.test.mjs`).
**Additionally (D-11), add a NEW eval-only packaging-boundary check** (`eval/lz-eval-packaging-boundary.test.mjs`): assert (1) no `package.json`/`node_modules` anywhere under `plugins/lz-advisor/`, and (2) no shipped runtime artifact imports any `eval/` script (grep the plugin tree for an `eval/` import; expect zero). This is a NEW eval-tree test (it may use `jstat`-free stdlib only; it asserts the boundary the SC-2 edit also guards, from the other side). State clearly: the SC-2 RE-SCOPE is a CHANGE to the EXISTING Phase-16 test (in-scope this phase); the packaging-boundary test is a NEW eval-only check.
**Warning signs:** A green SC-2 test whose comment still says "no package.json anywhere ... up to the repo root" after `eval/package.json` lands -- a silently stale contract.

### Pitfall 2: Gated datasets silently fail without HF_TOKEN
**What goes wrong:** Fetching `lytang/LLM-AggreFact` or either AVeriTeC repo without a token fails (401 / "restricted"); a naive loader treats it as transient and retries, or produces an empty stratum.
**Why it happens:** Both AVeriTeC repos and LLM-AggreFact are `gated:auto` on HF.
**How to avoid:** Use `hf download` (it surfaces the 401 clearly); pre-flight check token presence before the open-book stage; message "set HF_TOKEN / run `hf auth login` (this dataset is gated; accept its terms on the HF page first)" and exit non-zero. The WiCE spine is ungated, so the closed-book SUBTLE gate runs without a token.
**Warning signs:** Empty open-book stratum; 401 in logs; "checksum mismatch" because an HTML error page was hashed.

### Pitfall 3: Saturated, non-discriminating SUBTLE stratum (the prior-phase failure pattern)
**What goes wrong:** Naive ingest of WiCE `partially_supported` yields Pass@1 = 1.0 for BOTH Haiku and Sonnet -> the gate measures nothing (the discriminating-fixture lesson from Phase 17 CR-01).
**Why it happens:** No off-the-shelf corpus ships a balanced false-uphold trap set; many `partially_supported` items are still easy.
**How to avoid:** Implement the D-03 SATURATION CHECK -- after the first SUBTLE run, if both tiers are near-perfect, trigger the programmatic-trap augmentation (overreach a WiCE seed by exactly one hedge/quantifier/scope step; accept only if it flips a deliberately-weak reference verifier; cross-family panel adjudicates). Never hand-write; seed only from WiCE/ExpertQA.
**Warning signs:** SUBTLE false-uphold DELTA upper bound trivially ~0 because NEITHER model ever false-upholds AND neither ever errs -- a too-easy set, not a safe model.

### Pitfall 4: Open-book temporal leakage contaminates the open-book number
**What goes wrong:** The voter retrieves the published fact-check verdict and "verifies" by reading the answer, so the open-book false-uphold rate looks great but is meaningless.
**Why it happens:** The original AVeriTeC 2024 KS leaks fact-check articles + post-claim documents; live web search and fact-check-domain exclusion both leak the verdict.
**How to avoid:** Use the AVeriTeC **revised KS (released 2024-11-15)** as the SOLE retrieval source; enforce a per-claim publication-date cutoff. Run the CLOSED-BOOK CONTROL ARM: if closed-book false-uphold approaches open-book, parametric memorization dominates and the open-book number is contaminated -- gate trust on this. `[CITED: arXiv 2510.01226 ClaimCheck; FEVER 2024 KS update 2024-11-15]`
**Warning signs:** Closed-book ~ open-book false-uphold (memorization); a voter "verdict" that quotes a fact-checker.

### Pitfall 5: Silent false-uphold is structurally uncatchable by the contested trigger
**What goes wrong:** A Haiku false-uphold is by definition a UNANIMOUS uphold, so the contested-split escalation cannot catch it -- it is silent.
**Why it happens:** Escalation triggers on a vote SPLIT; a unanimous wrong "unrefuted" never splits.
**How to avoid:** This is precisely why the eval gates on the SUBTLE false-uphold DELTA upper bound ~0 with reliable=15 (D-06/D-07), and why production (Phase 20) adds load-bearing-claim + random-audit escalation. In THIS phase the eval is the guard; do not weaken the gate to "majority correct."
**Warning signs:** High aggregate accuracy masking a nonzero unanimous-false-uphold count on SUBTLE.

### Pitfall 6: Hashing the wrong bytes / unpinned revision drift
**What goes wrong:** Manifest sha256 was computed against `main`, then `main` moved, so a re-fetch fails checksum (or an unpinned fetch silently grabs new data).
**Why it happens:** Fetching `--revision main` instead of `--revision <sha>`.
**How to avoid:** Always pin the commit sha in the manifest and fetch `--revision <sha>`. WiCE main is currently `54f7976b...`; pin it. The fail-closed checksum is the backstop.

## Code Examples

### Pass@1 / Pass^k and the Clopper-Pearson upper bound (library-computed, eval/ only)

See Pattern 2 above for the full snippet. The eval aggregator imports `jstat` (pinned under `eval/`) and exposes `passAtK`, `passHatK`, `clopperPearsonUpper`, `wilsonUpper`. The accompanying `eval/lz-eval-aggregate.test.mjs` asserts ONLY the verified anchors (0.218 / 0.327 / 0.082 / CP(n,n)=1 / combination(15,3)=455) to prove the library is wired correctly -- it does NOT re-derive the math.

### Per-stratum false-uphold counting (deterministic, off-model)

```javascript
// "PASS" for a verdict trial = (voter verdict === expected_verdict).
// A "false-uphold event" = (expected_verdict === 'refuted' && verdict === 'unrefuted').
// Count false-uphold events per (stratum x tier) over the shared trial pool; the SUBTLE-stratum
// open-book Haiku-MINUS-Sonnet DELTA upper bound (via clopperPearsonUpper) is the SOLE hard gate.
```

### Headless voter execution (the harness driver, eval/)

```bash
# Source: CLAUDE.md "Skill Verification with claude -p" + SESSION-DESIGN A2 (verified headless).
# One isolated skeptic vote per (claim x seat x tier). Temperature 0, k>=5 seats.
# Reference the claim/excerpt by PROSE PATH, never an @file mention (breaks slash routing).
# The voter AGENTS live in the plugin tree (--plugin-dir); the run DRIVER lives in eval/.
claude --model haiku --permission-mode auto \
  --plugin-dir plugins/lz-advisor \
  -p "Cast one isolated skeptic vote on the claim in <cache-path>; write the vote JSON to <run-dir>/votes/<id>-<seat>.json" \
  --verbose --output-format stream-json
# --validate oracle pre-flight: same harness, --model sonnet, on a known-answer seed; expect ~100%.
# Grade the voter sub-agent tool-use from the JSONL session log under
#   ~/.claude/projects/<cwd-hash>/<session>/subagents/agent-<id>.jsonl  (toolUseResult.usage.tool_uses).
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hand-rolled `logGamma`/`incbeta`/`betaInv` for the CI (zero-dep "must hand-roll" exception) | Pinned, vetted statistics library (`jstat`) under `eval/`; no in-repo special-function math | Owner directive 2026-06-16 (AMENDMENT) | The decisive packaging correction this refresh encodes; hand-rolling is now FORBIDDEN (D-07). |
| Whole-repo zero-dep ("no package.json anywhere") | Plugin-tree zero-dep; repo-level `eval/` has its own pinned deps | AMENDMENT 2026-06-16 (D-01b/D-10/D-11) | The SC-2 runtime test is re-scoped to the plugin tree; an `eval/` package is added. |
| Wald / normal-approx CI; bootstrap | Clopper-Pearson / Wilson / Beta-Bernoulli, judge on UPPER bound | arXiv 2503.01747 (ICML 2025) | The D-07 estimator correction; Wald is degenerate at rate~0. UNCHANGED by the amendment (only the computation moves to a library). |
| VitaminC for "subtle" entailment | WiCE `partially_supported` for genuine overreach | adversarial verification | VitaminC is easy numeric/date flips, off-phenomenon. |
| LLM-as-judge for the pass/fail gate | Deterministic verdict-vs-gold-label; LLM-judge only for qualitative dims with an "Unknown" out | SkillsBench + Anthropic *Demystifying Evals* | Removes judge variance from the SOLE hard gate. |
| `CRITICAL: You MUST <tool>` prompt language | "Use <tool> when..." (normal phrasing) | Anthropic doc, Opus 4.5/4.6 era | 4.6-era models OVERTRIGGER; matters for the Haiku voter prompt. `[CITED: docs.anthropic.com claude-4-best-practices]` |
| Manual extended-thinking `budget_tokens` | Adaptive thinking (`thinking:{type:'adaptive'}`) + `effort`; `budget_tokens` deprecated | Claude 4.6 | The non-authoritative Haiku reference's `budget_tokens` examples are STALE. |
| Prefilled assistant responses to force format | Structured outputs / direct instruction | Claude 4.6 (prefill returns 400) | The non-authoritative reference's prefill patterns are no longer supported. |

**Deprecated/outdated (in the NON-authoritative `MODEL-OPTIMIZATION-HAIKU.md` starting list -- corrected for EVAL-05):**
- `budget_tokens` thinking config: deprecated in favor of adaptive thinking + `effort`.
- Prefilled responses: unsupported on 4.6 (400 error).
- Aggressive `NEVER`/`MUST`/`CRITICAL` framing: now an overtriggering risk; prefer plain phrasing + context/motivation.
- Structured-outputs "BETA - DO NOT USE IN PRODUCTION" caveat: the current Anthropic doc treats Structured Outputs as the recommended replacement for prefill -- re-verify, do not cite the stale caveat.

## EVAL-05: Haiku prompt-engineering reference artifact (the open research deliverable)

> Unaffected by the packaging amendment. This section is the substance the planner turns into the `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` artifact (it SHIPS -- plugin tree, zero-dep, pure prose). Each technique: WHAT it is, WHY it helps a cheap model on a skeptic-voter task, and a VERIFIED source. The `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` was used ONLY as a starting list to verify -- every item below is confirmed against the current Anthropic prompting doc (`docs.anthropic.com/.../claude-4-best-practices`, fetched 2026-06-16, which explicitly covers Claude Haiku 4.5) or flagged stale.

| # | Technique | Why it helps a CHEAP model on a fair skeptic-voter prompt | Source |
|---|-----------|-----------------------------------------------------------|--------|
| H1 | **Be clear and direct; specify exact output format + constraints** | Removes ambiguity a weaker model would otherwise fill with drift; pins the `verdict` enum + envelope fields. | `[CITED: claude-4-best-practices "Be clear and direct"]` |
| H2 | **Few-shot / multishot examples, wrapped in `<example>`/`<examples>`, 3-5, relevant + diverse + structured** | "One of the most reliable ways to steer output format." Include DISCONFIRMING examples (a partially-supported claim correctly returned `refuted`, with the negation search shown) so Haiku learns the trap. | `[CITED: claude-4-best-practices "Use examples effectively"]` |
| H3 | **XML-tagged structure (`<instructions>`,`<claim>`,`<evidence>`,`<output_format>`)** | "XML tags help Claude parse complex prompts unambiguously." Keeps claim vs evidence vs instruction separate for a cheap model. | `[CITED: claude-4-best-practices "Structure prompts with XML tags"]` |
| H4 | **Role framing in one sentence** ("You are an adversarial fact-checker...") | "Setting a role focuses Claude's behavior... even a single sentence makes a difference." The adversarial frame biases toward skepticism (the safe direction for a gate). | `[CITED: claude-4-best-practices "Give Claude a role"]` + `[VERIFIED: pilot VOTE_PROMPT]` |
| H5 | **Tell it what to DO, not what NOT to do** | "Instead of 'Do not use markdown' try 'compose flowing prose.'" For the voter: "Return `refuted` when the evidence does not fully support the claim as stated." | `[CITED: claude-4-best-practices "Control the format of responses"]` |
| H6 | **Add context/motivation for each constraint** | "Explaining WHY a constraint exists helps Claude adhere strictly." E.g. "a false uphold silently corrupts a cited research report." | `[CITED: claude-4-best-practices "Add context to improve performance"]` |
| H7 | **Explicit "return Unknown/abstain when unsure" out** (maps to the schema's `insufficient`) | A cheap model under uncertainty otherwise defaults to a confident wrong answer; instruct it to abstain rather than guess. | `[CITED: lz-deep-research-schema.md vote record]` + `[ASSUMED]` abstain-when-unsure reduces Haiku false-upholds (the eval measures it) |
| H8 | **Ground the verdict in quoted evidence first** (open-book: quote relevant docs, THEN judge) | "For long-document tasks, ask Claude to quote relevant parts first... cuts through the noise." Forces the open-book voter to actually read retrieved docs. | `[CITED: claude-4-best-practices "Long context prompting / Ground responses in quotes"]` |
| H9 | **Disconfirming-search instruction = search the NEGATION, record the query** (VERIF-02) | The pilot's "ACTIVELY look for evidence that contradicts" achieved 100% tool-use on Haiku open-book at n=18. Record the query into `disconfirming_query`. | `[CITED: claude-4-best-practices "Research and information gathering"]` + `[VERIFIED: pilot 100% Haiku tool-use]` |
| H10 | **Bounded reasoning + commit-to-one-approach** (avoid open-ended exploration) | Haiku "excels at focused, bounded tasks"; the current doc warns against over-exploration. Keeps a single-call voter cheap and on-task. | `[CITED: claude-4-best-practices "Overthinking"]` + `[ASSUMED: non-authoritative "step-bounded reasoning 3-5 steps"]` |
| H11 | **Plain phrasing, NOT `CRITICAL/MUST/NEVER`** | Current 4.6-era models OVERTRIGGER on aggressive language; "use more normal prompting." A live correction vs the stale starting list. | `[CITED: claude-4-best-practices "Tool usage" / "Tune anti-laziness prompting"]` |
| H12 | **Structured output via direct instruction (or Structured Outputs feature), NOT prefill** | Prefill returns 400 on 4.6; ask the model to conform to the schema directly. The voter writes a small JSON -- direct instruction is enough. | `[CITED: claude-4-best-practices "Migrating away from prefilled responses"]` |

**Haiku 4.5 facts to record in the artifact (verify before citing as load-bearing):** the non-authoritative reference states 200K context, $1/$5 per-MTok, ~73% SWE-bench, "90% of Sonnet's agentic performance at 1/3 cost," 2-5x faster. These are `[ASSUMED]` (single non-authoritative source); confirm any load-bearing number against `anthropic.com/news/claude-haiku-4-5`. For the eval's PURPOSE, the only load-bearing fact is that Haiku is the cheaper tier whose verification SAFETY is unknown -- exact pricing is not gate-relevant.

**Fairness framing (D-08) for the artifact's intro:** state explicitly that the Haiku voter prompt is engineered to the SAME task contract as the Sonnet baseline (identical schema, identical dataset, identical grader), so the eval measures MODEL capability, not prompt quality.

## Voter agent structure (deliverable 4)

Two agent files mirroring the existing `agents/*.md` frontmatter shape (`name`, `description` with `<example>` blocks, `model`, `color`, `tools`, optionally `maxTurns`/`effort`). **Both SHIP -> they live in `plugins/lz-advisor/agents/`, strictly zero-dep (no `eval/` import).**

- `research-verify-voter-sonnet.md` -- `model: sonnet`, tools `[WebSearch, WebFetch, Write]` (open-book) or `[Write]` (closed-book control); ship default.
- `research-verify-voter-haiku.md` -- `model: haiku`, same tools; prompt engineered from the EVAL-05 artifact (D-08); behind the OFF flag.

**Each voter casts ONE isolated skeptic vote** (no shared context) and writes a vote file to the frozen shape:

```json
{ "verdict": "unrefuted",
  "attack_mode": "scope-causality-overclaim",
  "disconfirming_query": "evidence that X does NOT reduce Y",
  "source_independence_note": "3 hits, 1 canonical source (syndicated) -> counts as 1" }
```

- `verdict` is the FROZEN consumed core (`unrefuted` | `refuted`); the aggregator reads ONLY this. The envelope fields are additive-only (D-09/D-10). `[CITED: lz-deep-research-schema.md vote record]`
- **3 attack modes (SESSION-DESIGN Section 6):** factual contradiction / scope-causality overclaim / source-provenance. The three seats per claim are diversified across these modes.
- **Disconfirming search (VERIF-02):** the open-book voter searches the NEGATION and records the query.
- **Open-book restriction (D-05):** retrieve ONLY from AVeriTeC's revised KS (2024-11-15) with a per-claim publication-date cutoff; never live web. The closed-book control arm sees only the provided excerpt (no tools).
- **Grade outcomes, not steps (D-09):** the deterministic gate scores `verdict` vs gold label; the path is graded only qualitatively by the isolated LLM-rubric judge.

## Eval execution harness (deliverable 5)

1. **Scaffold the `eval/` package** (`eval/package.json` + `npm install --save-exact jstat@1.9.6` + commit `eval/package-lock.json`; gitignore `eval/node_modules/` and the cache). One-time, before the aggregator/loader land.
2. **Pre-register the lock rule FIRST** (`eval/lz-eval-lock-rule.md`, committed before any model call): exact thresholds (SUBTLE open-book false-uphold DELTA upper-CI ~0; cost gate escalation > 40-50% kills Haiku), false-uphold-as-sole-hard-gate, reliable=15 on PASS, raise-to-user on FAIL.
3. **`--validate` oracle pre-flight:** run the trusted Sonnet baseline on a small known-answer seed; require ~100%. Seed-claim count is Claude's Discretion.
4. **Stage SUBTLE FIRST** (the sole hard gate): k>=5 temp-0 votes per (claim x seat x tier), via `claude -p --permission-mode auto`.
5. **Shared-pool pass@k estimator:** one pool of n trials per claim; compute Pass@1/Pass^k for all k from the same pool (via `jStat.combination`).
6. **Remaining strata + closed-book control arm** after SUBTLE.
7. **Saturation check + conditional trap augmentation** (D-03) from WiCE seeds if SUBTLE doesn't discriminate.
8. **Abort-early ONLY on FAIL.** For any PASS, escalate the SUBTLE subset to reliable=15 before declaring PASS (the CI anchor: 0/15 still bounds the rate at ~0.218 upper).
9. **Credit-aware staging:** nested `claude -p` draws on the same 5-hour usage pool; stage across reset windows; `out_of_credits` (429) mid-run is a known risk the staging bounds.

## Runtime State Inventory

> Not a rename/refactor/migration phase. No stored data, live-service config, OS-registered state, secrets, or build artifacts carry a string being renamed.
> - **Stored data:** None -- verified by the phase scope (no datastore keys/collections renamed).
> - **Live service config:** None -- no external-service config touched.
> - **OS-registered state:** None.
> - **Secrets/env vars:** `HF_TOKEN` is READ at eval time (env / `HF_TOKEN_PATH` / `HF_HOME/token`); not committed, not renamed -- no migration.
> - **Build artifacts / installed packages:** NEW -- `eval/node_modules/` is created by `npm install` under `eval/` (gitignored, dev-only, never shipped); `eval/package-lock.json` is committed. No EXISTING artifact carries a renamed string. The gitignored eval cache under `eval/` is new runtime scratch (handled by `.gitignore`).

## Validation Architecture

> nyquist_validation is enabled. This section is REQUIRED.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` + `node:assert/strict` (Node v24.13.0, bundled). Eval-aggregator tests additionally import the pinned `jstat` from `eval/node_modules/`. |
| Config file | Plugin tree: none (zero-dep). Eval tree: `eval/package.json` (`"type":"module"`) + committed `eval/package-lock.json`. |
| Quick run command | `node --test eval/lz-eval-aggregate.test.mjs` (run from the repo root AFTER `cd eval && npm install` has restored `eval/node_modules/`) |
| Full suite command | Run EACH `.test.mjs` by explicit file path (NEVER `node --test <dir>` -- host quirk): the EXISTING runtime aggregator test (`plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs`, incl. the re-scoped SC-2), the new `eval/lz-eval-aggregate.test.mjs`, the new `eval/lz-eval-dataset.test.mjs`, and the new `eval/lz-eval-packaging-boundary.test.mjs`. |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EVAL-02 | Pass@1 / Pass^k computed correctly from a shared pool (via `jStat.combination`) | unit | `node --test eval/lz-eval-aggregate.test.mjs` (assert passAtK/passHatK on known n,c,k; `combination(15,3)=455`) | NO -- Wave 0 |
| EVAL-02 | Per-stratum false-uphold counted correctly (bad claim + unrefuted verdict) | unit | same file (fixture vote dir -> expected counts) | NO -- Wave 0 |
| EVAL-04/D-07 | Clopper-Pearson UPPER bound (library-wired) matches anchors; degenerate-at-0/n handled | unit | same file (assert `jStat.beta.inv` anchors: ~0.327, ~0.082; CP upper(0,15)~0.218; CP(15,15)=1) | NO -- Wave 0 |
| D-06 | Haiku-minus-Sonnet DELTA computed per stratum from the shared pool | unit | same file (two-tier fixture -> expected delta) | NO -- Wave 0 |
| EVAL-01/D-02d | WiCE label remap (supported->unrefuted; partially/not->refuted; partially=subtle) | unit | `node --test eval/lz-eval-dataset.test.mjs` (offline fixture JSONL -> manifest rows) | NO -- Wave 0 |
| D-04 | Checksum mismatch fails CLOSED (loud throw, non-zero) | unit | dataset test (write wrong-sha fixture -> assert throws) | NO -- Wave 0 |
| Pitfall 2 | Gated 401 surfaces an actionable HF_TOKEN error (not infinite retry) | unit | dataset test (mock 401 / `hf` failure -> assert specific error) | NO -- Wave 0 |
| EVAL-04 | Lock-rule threshold check is mechanical (PASS/FAIL deterministic given counts) | unit | eval-aggregate test (feed counts above/below threshold -> assert verdict) | NO -- Wave 0 |
| D-11 / Pitfall 1 | No `package.json`/`node_modules` under `plugins/lz-advisor/`; no eval import from shipped runtime | unit | `node --test eval/lz-eval-packaging-boundary.test.mjs` | NO -- Wave 0 |
| D-11 (runtime side) | Re-scoped SC-2: runtime aggregator imports only node:/relative; no install surface UNDER the plugin tree | unit | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (EDIT the existing SC-2 test) | EXISTS -- in-scope EDIT |
| VERIF-01/02/03, EVAL-03, EVAL-05 | Voter behavior (attack-mode diversity, disconfirming_query present, Haiku-vs-Sonnet gate) | model-call (NOT deterministic) | `claude -p` harness run; graded by aggregator + isolated LLM-rubric judge | manual / live -- NOT unit-testable |

**Deterministic (unit-testable offline):** interval math (Clopper-Pearson/Wilson upper bound via the pinned library), Pass@1/Pass^k via `jStat.combination`, per-stratum false-uphold counting, Haiku-minus-Sonnet DELTA, WiCE label remap, manifest parsing, sha256 checksum + fail-closed, gated-401 error path, the mechanical lock-rule threshold check, AND the two packaging-boundary checks (the re-scoped runtime SC-2 + the new eval-only D-11 test). These are the Wave-0 fixtures and mirror the existing aggregator test's rigor.

**Requires live model calls (NOT unit-testable; the eval IS the test):** the actual voter verdicts, attack-mode diversity, disconfirming-search behavior, the Haiku-vs-Sonnet false-uphold gate. These run via the headless harness and are graded by the deterministic aggregator + the isolated LLM-rubric judge.

### Sampling Rate
- **Per task commit:** the relevant new `.test.mjs` by explicit file path (after `eval/node_modules/` is restored for the eval-tree tests).
- **Per wave merge:** all `.test.mjs` files by explicit file path -- the runtime aggregator test (plugin tree) + the three eval-tree tests (eval-aggregate, dataset, packaging-boundary).
- **Phase gate:** all deterministic suites green before the live eval run; the live eval run itself is gated by the pre-registered lock rule.

### Wave 0 Gaps
- [ ] `eval/package.json` + `eval/package-lock.json` (pinned `jstat@1.9.6`) + `.gitignore` entries for `eval/node_modules/` + the eval cache -- the eval-tree install surface
- [ ] `eval/lz-eval-aggregate.test.mjs` -- Pass@1/Pass^k, false-uphold, DELTA, library-wired Clopper-Pearson anchors, lock-rule check (EVAL-02/04, D-06/D-07)
- [ ] `eval/lz-eval-dataset.test.mjs` -- label remap, checksum fail-closed, gated-401 error path (EVAL-01, D-04)
- [ ] `eval/lz-eval-packaging-boundary.test.mjs` -- D-11 boundary (no deps under the plugin tree; no eval import from shipped runtime)
- [ ] EDIT `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` -- RE-SCOPE the SC-2 test from a repo-root walk to a plugin-tree assertion (in-scope Phase-16-test edit)
- [ ] `eval/__fixtures__/` eval fixtures (offline JSONL samples + vote dirs + the known-answer CI anchors)
- [ ] Framework install: `cd eval && npm install` (restores `jstat` from the committed lockfile); plugin tree needs none (`node:test` bundled)

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (`fetch`, `crypto`, `test`) | loader + aggregator + tests | YES | v24.13.0 | none needed |
| `npm` (for `eval/` install) | restoring `jstat` under `eval/` | YES | bundled with Node 24 | none |
| `jstat` 1.9.6 (pinned, `eval/` only) | the CI/interval + Pass@k math (D-07) | YES (verified install + anchors this session) | 1.9.6 | `@stdlib/stats-base-dists-beta-quantile` 0.2.3 (heavier alt) |
| `hf` CLI (HuggingFace) | gated dataset fetch (LLM-AggreFact + AVeriTeC) | host-installed (per D-01b) | -- | WiCE/ExpertQA are ungated; closed-book SUBTLE gate runs without it |
| Network access to `huggingface.co` | dataset fetch at eval time | assumed (build host) | -- | offline fixtures cover all deterministic tests; live fetch only for the eval run |
| `HF_TOKEN` (HF account + accepted dataset terms) | LLM-AggreFact + both AVeriTeC (GATED) | UNKNOWN -- user must provide | -- | WiCE-only closed-book SUBTLE gate runs WITHOUT a token; open-book/stress arms BLOCK without it |
| `claude -p --permission-mode auto` | headless voter execution | YES (project-verified path) | Claude Code v2.1.x | none |
| Claude usage budget (5-hour pool) | k>=5 + reliable=15 voter calls | shared with parent session | -- | stage across reset windows (D-06) |

**Missing dependencies with no fallback for the FULL eval:** `HF_TOKEN` for the open-book (AVeriTeC) and stress (LLM-AggreFact) arms. The planner MUST add a pre-flight check + an actionable message, and SHOULD sequence the WiCE-only closed-book SUBTLE gate so a partial eval is possible without a token.
**Missing dependencies with fallback:** network -- all deterministic Wave-0 tests run offline against committed fixtures + the locally-restored `jstat`; only the live eval needs the network. The stats library -- `jstat` primary, `@stdlib` alt.

## .gitignore additions (required)

```
# Eval dataset cache (fetched at eval time; license-compliant local-only; never committed)
/eval/.cache/
# Eval dev dependencies (pinned in eval/package-lock.json; restored via `cd eval && npm install`; never shipped)
/eval/node_modules/
```

The committed manifest + vendored WiCE live IN the repo (under `eval/`); the fetched non-vendored text and the installed `node_modules` do NOT. This keeps the fetched LLM-AggreFact / AVeriTeC text local-only (D-04 license compliance) and the eval dep tree out of git (D-11). (The runtime `.lz-research/` ignore is a separate Phase-20 concern, INTEG-02.)

## Security Domain

> `security_enforcement` is not explicitly `false` in config (absent) -- treat as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | partial | `HF_TOKEN` read from env / `HF_TOKEN_PATH` / `HF_HOME/token` (via `hf`); never logged, never committed. |
| V5 Input Validation | yes | The loader parses UNTRUSTED downloaded JSONL: fail-closed `JSON.parse` (mirror `readJson`/`ContractError`), `safeId` on any content-derived basename, reject oversized inputs. |
| V6 Cryptography | yes | sha256 via `node:crypto` for integrity ONLY; never hand-roll a hash. |
| V12 File/Resource | yes | Cache writes confined to the gitignored `eval/` cache dir; `path.join`, basename-only ids, no path traversal. |
| V14 Configuration / Supply Chain | yes (NEW) | The single eval dep is pinned exact + lockfiled (`eval/package-lock.json`), pure-JS, no install scripts, registry-verified; D-11 keeps it structurally out of the shipped package. The first install is human-verify-gated. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Tampered/swapped dataset file (supply-chain) | Tampering | Pinned revision + sha256 fail-closed. |
| Malicious / typosquatted eval dependency | Tampering / Elevation | Exact pin + committed lockfile + registry-verified provenance (age/downloads/license/no install scripts); human-verify checkpoint before first install; dev-only, never shipped (D-11). |
| Dep leak into the marketplace package | Elevation of Privilege (user-side) | D-11 boundary: `eval/` outside the plugin tree; the packaging-boundary test + the re-scoped SC-2 test both assert no deps under `plugins/lz-advisor/`. |
| HF_TOKEN leak in logs/commits | Info Disclosure | Read from env at eval time; never echo; cache + manifest carry no token; `.gitignore` the cache. |
| Path traversal via a crafted example id / filename | Tampering | `safeId` basename-only guard (reuse the runtime aggregator's via cross-tree import). |
| Malformed downloaded JSON crashes the loader | DoS | `ContractError` fail-closed parse; do not coerce. |
| Open-book voter reads the leaked verdict (eval integrity) | (eval validity) | Revised KS + per-claim date cutoff + closed-book control (D-05). |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | "Return Unknown/abstain when unsure" reduces Haiku false-upholds (H7) | EVAL-05 | If wrong, the Haiku prompt is slightly less optimal -- the eval MEASURES the outcome, so it surfaces as a worse gate result, not a silent error. Low risk. |
| A2 | Haiku 4.5 pricing/benchmark numbers (200K ctx, $1/$5, 73% SWE-bench, "90% agentic at 1/3 cost") | EVAL-05 facts | Single non-authoritative source; NOT gate-relevant. Confirm against `anthropic.com/news/claude-haiku-4-5` only if load-bearing. |
| A3 | "step-bounded 3-5 steps" as a Haiku technique (H10) | EVAL-05 | From the non-authoritative list; the authoritative doc supports "commit to one approach" but not the exact 3-5 number. Treat the number as a heuristic. |
| A4 | The AVeriTeC revised KS is fetchable with an HF_TOKEN at the chenxwh mirror | Dataset loading | Repo is gated (verified 401); KS file paths not enumerable without a token this session. Enumerate at eval time once authenticated and pin sha256 then. |
| A5 | Network access to huggingface.co is available on the eval host | Environment | If absent, only the live eval blocks; deterministic tests are unaffected. |
| A6 | Structured Outputs is production-ready for the voter (vs the stale "BETA - DO NOT USE" caveat) | State of the Art | The current Anthropic doc recommends it over prefill; the voter writes tiny JSON, so plain direct instruction suffices -- low risk. |
| A7 | `jstat@1.9.6`'s missing manifest `license` field is benign (the MIT LICENSE file is authoritative) | Standard Stack | Verified the LICENSE file is verbatim MIT this session. If a downstream tool keys off the manifest field, set `license` in `eval/package.json` notes or prefer the `@stdlib` alt (explicit Apache-2.0). Low risk; dev-only dep. |
| A8 | `jstat`'s last publish (2022) is "maintained enough" for a pinned, lockfiled, dev-only dep | Standard Stack | If a future Node breaks it, repin to the actively-maintained `@stdlib` alt (anchors verified for both). Low risk given the exact pin + the math is stable special-functions. |

**Note:** No `[ASSUMED]` claim is load-bearing for the GATE itself. The gate is deterministic (verdict-vs-gold-label + library-computed Clopper-Pearson), and the gold labels are human-annotated WiCE (verified enum). The chosen library's correctness is pinned by the verified anchors (an integration test, not an assumption).

## Open Questions (RESOLVED)

> All four are Claude's-Discretion / eval-time-enumeration items; each carries an adopted recommendation.

1. **Exact AVeriTeC revised-KS file layout + per-claim date field name.**
   - Known: the revised KS was released 2024-11-15 for FEVER-2024; per-claim date cutoff is the documented mechanic (ClaimCheck). Unclear: precise file paths + the claim-date field name inside the gated repo (not enumerable without HF_TOKEN this session).
   - **RESOLVED:** enumerate at eval time once authenticated (`hf` with the token), pin sha256 into the manifest then; the WiCE closed-book SUBTLE gate is unaffected.

2. **DELTA interval combination method (per-tier Clopper-Pearson vs paired Beta-Bernoulli on the difference).**
   - D-07 leaves the estimator to Claude's Discretion; both compute via `jStat.beta.inv`.
   - **RESOLVED:** implement the per-tier Clopper-Pearson upper bound first (simplest); add a Beta-Bernoulli option behind the same interface if the planner wants the paired treatment.

3. **WiCE via raw JSONL on `main` vs the parquet-converted config.**
   - Raw JSONL exists on `main` and needs no parquet reader (`hf download --include "data/subclaim_*.jsonl"`).
   - **RESOLVED:** read the raw JSONL; pin the `main` sha `54f7976b...`.

4. **Which statistics library, and where the lock rule lives.**
   - **RESOLVED:** `jstat@1.9.6` (primary; MIT, zero-dep, single package, has both beta.inv + combination; anchors verified) with `@stdlib/stats-base-dists-beta-quantile@0.2.3` as the actively-maintained alt. Lock rule at `eval/lz-eval-lock-rule.md` (co-located with the harness). The CI workflow's glob (`plugins/lz-advisor/skills/**/*.test.mjs`) currently misses `eval/**` -- the planner SHOULD extend CI to run the `eval/` tests too (after an `eval/` install step), or note the eval tests as a local-only gate. Flag for the planner.

## Sources

### Primary (HIGH confidence)
- `registry.npmjs.org` (curl, 2026-06-16) -- `jstat@1.9.6` (MIT LICENSE file, zero deps, no native build, no install scripts, ~914K wk dl, created 2015); `@stdlib/stats-base-dists-beta-quantile@0.2.3` (Apache-2.0, pure-JS, 233 transitive `@stdlib/*`); `simple-statistics@7.9.0` (no beta quantile -> rejected).
- Local `npm install` + Node 24 run (2026-06-16) -- numeric-anchor verification for BOTH `jstat` and `@stdlib` beta quantile: `0.218 / 0.327 / 0.082 / CP(n,n)=1 / combination(15,3)=455` all reproduced exactly; 0 native binaries, 0 `binding.gyp`.
- `docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices` (fetched via markdown.new 2026-06-16) -- authoritative Anthropic prompting doc covering Claude Haiku 4.5; the EVAL-05 grounding source.
- HuggingFace dataset/refs/tree/paths-info APIs (curl, 2026-06-16) -- WiCE schema/revision/file shas + license; LLM-AggreFact + AVeriTeC gating + license verification.
- `github.com/ryokamoi/wice` README -- WiCE label enum + record fields.
- `plugins/lz-advisor/references/lz-deep-research-schema.md` -- FROZEN vote/claim/source shapes + tally rubric + reserved envelope.
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` + `.test.mjs` -- the runtime aggregator spine + node:test pattern to mirror; the SC-2 test (lines ~677-719) this phase RE-SCOPES.
- `.planning/research/SESSION-DESIGN.md` Sections 6, 10, 13, 15 -- 3 attack-mode voters; verifier tier; A2 headless proof; the PROVISIONAL Sonnet-default decision this eval settles.
- `.github/workflows/ci.yml` -- the current test glob `plugins/lz-advisor/skills/**/*.test.mjs` (must be extended for `eval/` tests).

### Secondary (MEDIUM confidence)
- arXiv 2503.01747 abstract (ICML 2025) -- CLT/Wald dramatically underestimates at small n; recommends frequentist + Bayesian methods. (Decision already LOCKED in D-07.)
- arXiv 2510.01226 (ClaimCheck) + FEVER-2024 KS update 2024-11-15 -- per-claim publication-date cutoff; revised KS as the leakage fix.
- WebSearch / general references -- Clopper-Pearson upper = Beta^{-1}(1-alpha/2; x+1, n-x); Wilson score formula (both now LIBRARY-computed, not hand-rolled).

### Tertiary (LOW confidence -- flagged, NOT cited as fact)
- `lz-nx-ai-plugins/research/prompt-engineering/MODEL-OPTIMIZATION-HAIKU.md` -- NON-AUTHORITATIVE starting list; every used item re-verified against the Anthropic doc; stale items flagged in State of the Art.

## Metadata

**Confidence breakdown:**
- Standard stack / datasets / licenses / gating: HIGH -- verified via HF API + npm registry this session.
- Statistics library pick: HIGH -- `jstat@1.9.6` verified on the npm registry (license/age/downloads/no-native-build/no-install-scripts) AND empirically against all four numeric anchors via a local install + run; the `@stdlib` alt likewise verified. (slopcheck itself was unavailable -- sandbox-denied -- so the planner should add a human-verify checkpoint before the first install, but the registry + empirical verification is strong.)
- CI math (Clopper-Pearson / Wilson via the library): HIGH -- anchors reproduced exactly; the estimator choice is the locked D-07.
- Haiku prompt techniques (EVAL-05): HIGH for the technique set (authoritative Anthropic doc); MEDIUM on Haiku-specific NUMBERS (single non-authoritative source, not gate-relevant).
- Architecture / harness / test discipline / packaging boundary: HIGH -- mirrors the proven runtime aggregator; the SC-2 re-scope + the D-11 boundary test are concrete and verified against the existing test source.
- Live open-book voter behavior + the gate VERDICT: LOW -- this is exactly what the eval measures; cannot be known pre-eval (by design).

**Research date:** 2026-06-16 (refreshed for the zero-dep AMENDMENT same day)
**Valid until:** ~2026-07-16 for datasets/CI math/library pin (stable); ~2026-06-23 for the Anthropic prompting doc + Haiku facts (fast-moving model docs).

## RESEARCH COMPLETE
