# Phase 18: Haiku prompt-engineering deep research + verify-voter + early gating eval - Research

**Researched:** 2026-06-16
**Domain:** LLM-eval methodology (binomial CIs, stratified labeled datasets) + Claude prompt engineering (Haiku 4.5) + zero-dep Node harness/aggregator on Windows arm64
**Confidence:** HIGH (datasets, licenses, CI math, Haiku techniques all verified against primary sources this session; LOW only on live open-book voter behavior, which is what the eval itself measures)

## Summary

This phase has exactly one genuine open research deliverable -- the EVAL-05 Haiku prompt-engineering reference artifact -- plus four well-bounded HOW-to-implement-the-locked-decisions deliverables (dataset loading, the deterministic eval aggregator, the two voter agents, the headless harness). Every dataset/license/CI/leakage decision is already LOCKED in `18-CONTEXT.md` (D-01..D-10) and re-verified this session against primary sources; this research does NOT re-litigate them. It confirms each is implementable as written and supplies the verified mechanics.

Three findings materially shape the plan and were NOT obvious from the locked context. (1) **Both AVeriTeC repos (`chenxwh/AVeriTeC`, `MichSchli/AVeriTeC`) AND `lytang/LLM-AggreFact` are GATED on HuggingFace** -- a zero-dep `https`/`fetch` download needs an `HF_TOKEN` Authorization header for those three; only `jon-tow/wice` and `cmalaviya/expertqa` are ungated. LLM-AggreFact's gate prompt even states the data is "permitted for use as an evaluation benchmark... should not be used in pretraining or fine-tuning," which reinforces the eval-only/gitignored-cache posture. (2) **There is no release branded "AVeriTeC 2.0"** -- the artifact CONTEXT.md calls the "REVISED 2.0 knowledge store" is the FEVER-2024 revised knowledge store released **2024-11-15** that fixed the test-set leakage; the planner should reference it by that date, not a "2.0" tag. (3) The HF resolve-URL pattern (`/datasets/<id>/resolve/<revision>/<path>`) returns a **307 redirect to a CDN cache** whose query string carries an `etag` equal to the git blob OID -- so the zero-dep downloader MUST follow redirects, and the integrity primitive is a post-download sha256 the harness computes itself (LFS files expose their sha256 directly in the tree API; small non-LFS JSONL files carry only a git-SHA-1 blob oid, so sha256 is computed locally and pinned in the manifest).

**Primary recommendation:** Build EVAL-05 first as a `references/` artifact grounded in the authoritative Anthropic prompting doc + Haiku 4.5 facts (verified below); then author the two voter agents against the FROZEN vote schema; then build the zero-dep dataset-loader + eval-aggregator (mirroring `lz-deep-research-aggregate.mjs` and its `.test.mjs`) with a self-contained Clopper-Pearson upper-bound implementation (logGamma + Lentz incbeta + bisection inverse -- verified sketch below); write the pre-registered lock rule BEFORE any model call; run the staged, credit-aware eval headlessly via `claude -p --permission-mode auto`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

> Verbatim from `18-CONTEXT.md` `<decisions>`. These are AUTHORITATIVE. Research HOW to implement them, never alternatives.

- **D-01 (eval harness architecture):** Mirror executor -> grader -> deterministic off-model aggregator in a COMMITTED, ZERO-DEP harness. The false-uphold GATE is a deterministic verdict-vs-gold-label check. A Node aggregator in `scripts/` computes Pass@1, Pass^k, per-stratum false-uphold + its interval from a single shared sample pool. An LLM-rubric grader is used ONLY for qualitative VERIF checks (attack-mode diversity, `disconfirming_query` recorded, source-independence applied), one ISOLATED judge per dimension with an "Unknown" out. skillgrade is NOT a dependency; its PATTERNS are mirrored.
- **D-02 (subtle stratum spine):** SUBTLE-OVERREACH stratum uses **WiCE** (`jon-tow/wice`) as its SPINE. VitaminC is REJECTED for this stratum (may appear only as an explicitly-labeled EASY-FLIP control).
- **D-02b:** **LLM-AggreFact** (`lytang/LLM-AggreFact`) = HELD-OUT realistic stress set, used VERBATIM only, de-duplicating its embedded WiCE subset.
- **D-02c:** **AVeriTeC** (`MichSchli/AVeriTeC` authoritative; `chenxwh/AVeriTeC` = FEVER-2024 mirror w/ knowledge store) = the OPEN-BOOK arm + leakage test only. EXCLUDE the Conflicting/Cherry-picking class from the hard-gate stratum. **ExpertQA** (`cmalaviya/expertqa`, MIT) = SECONDARY seed only. SciFact / Climate-FEVER / HoVer / FEVEROUS REJECTED.
- **D-02d:** Sample + stratify PROGRAMMATICALLY to EVAL-01 (~40% supported / ~60% bad, ~half the bad SUBTLE; closed-book + open-book). Map source labels to frozen `unrefuted | refuted`: supported -> voter SHOULD return `unrefuted`; partially-supported / not-supported -> voter SHOULD return `refuted`; `partially-supported` IS the SUBTLE substratum (false-uphold trap = a voter calling a partially-supported claim `unrefuted`).
- **D-03 (no hand-authoring; conditional trap-augmentation):** Primary path uses WiCE's EXISTING human gold labels DIRECTLY. Add a SATURATION CHECK -- if natural WiCE `partially_supported` items do not discriminate (both Haiku and Sonnet near-perfect), augment with a PROGRAMMATICALLY generated, MECHANICALLY validated trap set (each trap = a WiCE partially-supported SEED overreached by exactly one hedge/quantifier/scope step, accepted ONLY if it flips a deliberately-weak reference verifier; cross-family panel adjudicates contested traps). Model-assisted + script-validated, NEVER hand-written, authored ONLY from permissive seeds (WiCE / ExpertQA), NEVER from LLM-AggreFact or AVeriTeC.
- **D-04 (license + data handling):** Vendor ONLY WiCE (annotations ODC-BY / code MIT) with an attribution NOTICE; do NOT trust the `tasksource/wice` mirror's license field. AVeriTeC = FETCH-ONLY, never vendored (CC-BY-NC-4.0; KS = hard no-vendor). LLM-AggreFact = CC-BY-ND-4.0 = verbatim-only. For every non-vendored source, COMMIT ONLY a DERIVED MANIFEST -- example IDs + remapped strata labels + a PINNED HF revision + sha256 checksums -- and FETCH the text at eval time into a GITIGNORED local cache, failing loud on checksum mismatch.
- **D-05 (open-book leakage mitigation):** Open-book arm uses AVeriTeC's REVISED knowledge store (post-2024-11-15) as the SOLE retrieval source -- NOT the original 2024 KS. Enforce a per-claim publication-date cutoff. REJECT live web search and fact-check-domain exclusion. Add a CLOSED-BOOK CONTROL ARM on the same claims. Prefer claims dated after both models' training cutoffs where feasible.
- **D-06 (execution staging + DELTA gate):** The gate is the Haiku-MINUS-Sonnet false-uphold DELTA per stratum, with Sonnet run on the IDENTICAL sampled strata as the calibration baseline -- NEVER Haiku's absolute rate. Sequence: pre-register the lock rule FIRST -> `--validate` oracle pre-flight (trusted Sonnet ~100% on a known-answer seed) -> run the SUBTLE stratum FIRST -> remaining strata + closed-book control. Shared-pool pass@k estimator. Temperature 0. Abort-early ONLY on FAIL; for any PASS, escalate the SUBTLE subset to reliable=15 trials before declaring PASS. Staged across credit-reset windows. k>=5 per EVAL-02.
- **D-07 (lock rule -- pre-registered, exact-binomial interval):** Written BEFORE running. Report an INTERVAL, not a point estimate -- NOT a Wald/normal-approx CI and NOT bootstrap. Use Clopper-Pearson (exact binomial) or Wilson score, or a Beta-Bernoulli Bayesian credible interval, and judge on the UPPER bound. Hard gate = the SUBTLE open-book false-uphold DELTA's upper CI bound ~0, with reliable=15 on SUBTLE required for PASS. Cost gate = kill Haiku if escalation fraction > 40-50%. Fail either gate -> RAISE TO USER; Sonnet-default ships in the interim. Committed artifact, mechanically enforced.
- **D-08 (EVAL-05 fairness separation):** The Haiku voter prompt comes from the dedicated Haiku-prompt research artifact, NOT a Sonnet prompt on `model: haiku`. Haiku and Sonnet run on the IDENTICAL dataset + grader. The research precedes authoring any Haiku agent.
- **D-09 (voter agents vs FROZEN Phase-17 schema):** Two variants vs the frozen vote schema: Sonnet baseline (ship default) + research-grounded Haiku. Each casts ONE isolated skeptic vote, NO shared context, diversified by the 3 attack modes (factual contradiction / scope-causality overclaim / source-provenance). Fills the reserved envelope: `attack_mode` (VERIF-01); `disconfirming_query` (VERIF-02); source-independence note (VERIF-03). Grade outcomes, not steps: the deterministic gate scores `verdict` vs gold label, never the path.
- **D-10 (harness location + test discipline):** Harness + manifest are skill-internal under `skills/lz-deep-research/` (aggregator in `scripts/`; committed dataset manifest + vendored-WiCE in `scripts/__fixtures__/` or an `eval/` sibling -- planner picks). Fetched non-vendored corpora land in a GITIGNORED cache. Zero-dep. node:test gating MUST use the explicit `.test.mjs` FILE form, never `node --test <dir>` (host quirk).

### Claude's Discretion

- Exact WiCE sampling/stratification recipe and the supported:partially:not ratios within the SUBTLE stratum.
- The interval estimator among Clopper-Pearson / Wilson / Beta-Bernoulli (all valid; pick per implementation).
- Whether the saturation check triggers trap-augmentation, and the trap-generation templates.
- The cross-family adjudication agreement statistic; the `--validate` seed-claim count.
- Fixture/manifest directory (`scripts/__fixtures__/` vs `eval/`); the gitignored cache path name.
- Section ordering of the Haiku-prompt reference artifact; aggregator internal naming.

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
| COST-02 | Voters default to Sonnet; Haiku-first Tier-1 flag exists OFF until the eval clears | Two voter agents authored (Sonnet baseline = ship default; Haiku = behind flag). The eval's verdict (D-06/D-07) is what flips the flag. |
| EVAL-01 | Pre-registered dataset >=60-100 labeled claims, stratified (~40% supported / ~60% bad, ~half bad SUBTLE), closed- + open-book | Dataset loading mechanics (WiCE spine + AVeriTeC open-book arm); programmatic stratification recipe; derived manifest format. |
| EVAL-02 | Run each claim k>=5; report Pass@1, Pass^k, false-uphold per stratum | Deterministic aggregator (Pass@1 / Pass^k formulas + shared-pool estimator); per-stratum false-uphold counting. |
| EVAL-03 | Flip Haiku-first ON only if ~0 open-book false-upholds on SUBTLE AND escalation materially below all-Sonnet; else RAISE TO USER | The DELTA gate + cost gate (D-06/D-07); structured "raise to user" output path. |
| EVAL-04 | Lock rule written BEFORE the eval runs | Pre-registered lock-rule artifact; mechanically enforced threshold check. |
| EVAL-05 | Haiku voter prompt engineered from a dedicated deep-research pass (reference artifact), grounded in CURRENT authoritative sources | THE open research deliverable; verified Haiku techniques below + the corrections vs the non-authoritative starting list. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| EVAL-05 Haiku-prompt reference artifact | Documentation (`references/`) | -- | Pure prose research output consumed by the planner + the Haiku agent author; no runtime tier. |
| Voter verdict (judgment: does evidence support the claim) | Model (Sonnet / Haiku agent) | -- | Inherently non-mechanizable; the whole eval measures whether Haiku can do this safely. |
| Disconfirming web search (open-book arm) | Model (voter agent, `WebSearch`/`WebFetch`) | -- | Agentic tool-use; the cost-driving fork. |
| Vote tally -> confidence; false-uphold count; Pass@1/Pass^k; CI | Deterministic Node aggregator (`scripts/`) | -- | Reproducible, zero-token, off-model -- the product's core promise and the SOLE hard gate must be deterministic (D-01). |
| Dataset fetch + sha256 verify + label remap | Deterministic Node loader (`scripts/`) | Network (HF resolve CDN) | Integrity + license-compliant local cache; no model tokens. |
| Eval orchestration (fan-out voters, stage strata) | Harness driver (`claude -p` headless) | Deterministic aggregator | Headless executor pattern proven (SESSION-DESIGN A2); aggregation off-model. |
| Qualitative VERIF checks (attack-mode diversity, disconfirming_query present) | LLM-rubric grader (isolated judge per dimension, "Unknown" out) | -- | Only "where necessary" (D-01); never the hard gate. |

## Standard Stack

This phase has **zero external runtime dependencies** by hard constraint (AGG-02 / CLAUDE.md). The "stack" is Node stdlib + the existing harness + HuggingFace as a data source over plain HTTPS.

### Core

| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Node.js stdlib (`node:fs`, `node:path`, `node:url`, `node:crypto`, global `fetch`) | v24.13.0 (host) `[VERIFIED: node --version]` | Dataset fetch + sha256 + aggregator + tests | Zero-dep contract; `fetch` and `node:crypto.createHash('sha256')` are stable in Node 24. `[CITED: existing aggregator imports only node:*]` |
| `node:test` + `node:assert/strict` | bundled with Node 24 | Validation fixtures for the loader + aggregator | The frozen test pattern in `lz-deep-research-aggregate.test.mjs`; MUST use explicit `.test.mjs` FILE form (host quirk). `[VERIFIED: existing .test.mjs header + memory note]` |
| `claude -p --permission-mode auto` | Claude Code v2.1.x | Headless voter execution + `--validate` oracle | The project's verified skill-verification path (CLAUDE.md "Skill Verification with claude -p"); A2 spike proved headless fan-out + non-git Bash under `auto`. `[CITED: SESSION-DESIGN.md S13 A2]` |

### Supporting (data sources, fetched at eval time -- never bundled)

| Source | HF id | License | Gated? | Role |
|--------|-------|---------|--------|------|
| WiCE | `jon-tow/wice` | annotations ODC-BY / code MIT (Wikipedia content CC-BY-SA upstream) | NO (ungated) `[VERIFIED: HF API]` | PRIMARY subtle-overreach spine; the ONLY source safe to VENDOR (with NOTICE). |
| LLM-AggreFact | `lytang/LLM-AggreFact` | CC-BY-ND-4.0 `[VERIFIED: HF API cardData.license]` | **YES, gated ("gated":"auto")** `[VERIFIED: HF API]` | Held-out stress set, VERBATIM only. Needs `HF_TOKEN`. |
| AVeriTeC (KS mirror) | `chenxwh/AVeriTeC` | CC-BY-NC-4.0 | **YES, gated (API 401)** `[VERIFIED: HF API]` | Open-book arm + leakage test; FETCH-ONLY, never vendored. Needs `HF_TOKEN`. |
| AVeriTeC (authoritative) | `MichSchli/AVeriTeC` | CC-BY-NC-4.0 | **YES, gated (API 401)** `[VERIFIED: HF API]` | Authoritative claims; FETCH-ONLY. Needs `HF_TOKEN`. |
| ExpertQA | `cmalaviya/expertqa` | MIT | NO (ungated) `[VERIFIED: datasets-server info]` | SECONDARY trap seed only (D-02c/D-03 conditional). |

**Installation:** None. There is no `npm install` step in this phase -- adding a `package.json` would FAIL the existing zero-dep test (`SC-2 zero-dependency contract` walks up to the repo root asserting no `package.json`). Data is fetched at eval time into a gitignored cache.

**Version verification (datasets/revisions, this session):**
- `jon-tow/wice` main commit: `54f7976b8ce4fe0a9bfd35a4dd30af9d5b45d8a6` `[VERIFIED: HF refs API]` -- pin THIS sha in the manifest.
- WiCE raw data files on main: `data/claim_dev.jsonl`, `data/claim_test.jsonl`, `data/claim_train.jsonl` (LFS, sha256 `3ef74c72...`), `data/subclaim_dev.jsonl`, `data/subclaim_test.jsonl`, `data/subclaim_train.jsonl` (LFS, sha256 `e8ba1ed5...`). Split names in the raw JSONL are `dev`/`test`/`train`; the parquet-converted config uses `validation` for `dev`. `[VERIFIED: HF tree API]`
- WiCE label enum: `"supported"` | `"partially_supported"` | `"not_supported"` `[VERIFIED: github.com/ryokamoi/wice README]`. Record fields: `label`, `claim`, `evidence` (list of source sentences), `supporting_sentences` (index pairs), `meta` (`id`/`claim_title`/`claim_section`/`claim_context`).
- LLM-AggreFact schema: `dataset`(str)/`doc`(str)/`claim`(str)/`label`(int64)/`contamination_identifier`(str); splits `dev`(30420)/`test`(29320); the `dataset` column identifies the originating sub-corpus (de-dup the embedded WiCE subset on it). `[VERIFIED: HF API cardData.dataset_info]`
- ExpertQA configs `lfqa_domain` / `lfqa_random`; fields `example_id`/`context`/`question`/`answer` (no discrete overreach label -- hence "secondary seed only," confirming D-02c). `[VERIFIED: datasets-server info]`

## Package Legitimacy Audit

> Not applicable in the usual sense: this phase installs ZERO npm/PyPI/crates packages (zero-dep constraint). The only external artifacts are HuggingFace DATASETS fetched at eval time, audited below for license + gating instead of for slopsquatting.

| Artifact | Registry | Age | License | Gated | Disposition |
|----------|----------|-----|---------|-------|-------------|
| `jon-tow/wice` | HF datasets | created 2024-01 | ODC-BY / MIT | no | Approved -- VENDOR with NOTICE |
| `lytang/LLM-AggreFact` | HF datasets | created 2024-04 | CC-BY-ND-4.0 | yes | FETCH-ONLY verbatim (HF_TOKEN); manifest = IDs+labels+sha256 |
| `chenxwh/AVeriTeC` | HF datasets | -- | CC-BY-NC-4.0 | yes | FETCH-ONLY (HF_TOKEN); KS NEVER vendored |
| `MichSchli/AVeriTeC` | HF datasets | -- | CC-BY-NC-4.0 | yes | FETCH-ONLY (HF_TOKEN) |
| `cmalaviya/expertqa` | HF datasets | -- | MIT | no | Secondary seed only (conditional) |

**Packages removed due to slopcheck [SLOP] verdict:** none (no packages installed).
**Packages flagged as suspicious [SUS]:** none.

**npm-package note:** No npm dependency is recommended or permitted. A future maintainer must NOT reach for `@huggingface/hub`, `datasets`, `csv-parse`, a stats library (`jstat`, `simple-statistics`), or a beta-function package -- all are forbidden by the zero-dep contract. The CI math is hand-rolled from verified formulas (below). This is a deliberate "don't hand-roll EXCEPT here" inversion driven by the project constraint.

## Architecture Patterns

### System Architecture Diagram

```
                      [Pre-registered LOCK RULE]  (written FIRST, EVAL-04, committed)
                                 |
                                 v
 HuggingFace (resolve CDN, 307) ---fetch+sha256 verify--->  GITIGNORED cache  (.lz-eval-cache/ or similar)
   jon-tow/wice (ungated)                                        |
   lytang/LLM-AggreFact (HF_TOKEN)                               |  loader reads committed DERIVED MANIFEST
   chenxwh/MichSchli/AVeriTeC (HF_TOKEN)                         |  (example IDs + remapped labels + revision + sha256)
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
              |                          claude -p --permission-mode auto  ->  ISOLATED skeptic voter
              |                                                  |     (open-book: disconfirming WebSearch over AVeriTeC KS,
              |                                                  |      per-claim date cutoff; closed-book: provided excerpt only)
              |                                                  v
              |                                    vote files: { verdict: unrefuted|refuted,
              |                                                   attack_mode, disconfirming_query, source_independence_note }
              +-----------------------+--------------------------+
                                      v
                  DETERMINISTIC OFF-MODEL AGGREGATOR  (zero-dep Node, scripts/)
                    - tally verdict vs GOLD label (false-uphold = bad claim called unrefuted)
                    - Pass@1, Pass^k (shared-pool estimator), per-stratum false-uphold
                    - Haiku-MINUS-Sonnet DELTA per stratum
                    - Clopper-Pearson UPPER bound on the SUBTLE open-book false-uphold DELTA
                                      |
                                      v
                  MECHANICAL LOCK-RULE CHECK (compare to pre-registered thresholds)
                                      |
                   +------------------+------------------+
                   v                                     v
        PASS (upper bound ~0 AND escalation<40-50%)   FAIL either gate
        -> reliable=15 on SUBTLE -> flip Haiku-first   -> RAISE TO USER (EVAL-03);
                                                          Sonnet-default ships regardless
```

File-to-component mapping is in the Component Responsibilities below, not in the diagram.

### Recommended Project Structure

```
plugins/lz-advisor/
  references/
    lz-haiku-prompt-engineering.md      # EVAL-05 artifact (NEW); progressive-disclosure ref
  agents/
    research-verify-voter-sonnet.md     # Sonnet baseline voter (NEW; ship default)
    research-verify-voter-haiku.md       # research-grounded Haiku voter (NEW; behind flag)
  skills/lz-deep-research/
    scripts/
      lz-deep-research-aggregate.mjs     # EXISTING -- consumed, not modified
      lz-eval-dataset.mjs                # NEW -- zero-dep HF fetch + sha256 + label remap
      lz-eval-dataset.test.mjs           # NEW -- loader fixture (offline: checksum/remap/fail-closed)
      lz-eval-aggregate.mjs              # NEW -- Pass@1/Pass^k/false-uphold/DELTA/Clopper-Pearson
      lz-eval-aggregate.test.mjs         # NEW -- aggregator fixture (interval math, tally, delta)
      __fixtures__/                       # EXISTING committed fixtures + NEW eval fixtures
        lz-eval-manifest.json            # NEW -- committed DERIVED MANIFEST (IDs+labels+revision+sha256)
        wice-vendored/ + NOTICE          # NEW -- the ONLY vendored corpus (D-04)
    eval/                                 # (alternative manifest home -- planner picks, D-10)
  references/lz-eval-lock-rule.md         # NEW -- pre-registered lock rule (EVAL-04), committed BEFORE running
```

### Pattern 1: Zero-dep HuggingFace fetch by pinned revision with sha256 verify

**What:** Download a dataset file at a PINNED commit over plain HTTPS, follow the 307 to the CDN, then verify a locally-computed sha256 against the committed manifest; fail loud on mismatch.
**When to use:** The dataset loader (`lz-eval-dataset.mjs`) for every non-vendored corpus.
**Resolve-URL mechanics (verified this session):**
- Pinned file URL: `https://huggingface.co/datasets/<id>/resolve/<revision-sha>/<path>`
- Returns `HTTP/1.1 307 Temporary Redirect` to `/api/resolve-cache/datasets/<id>/<sha>/<path>?...&etag="<git-blob-oid>"`. `[VERIFIED: curl -I on WiCE README]`
- Gated datasets (LLM-AggreFact, both AVeriTeC) require `Authorization: Bearer $HF_TOKEN`; ungated (WiCE, ExpertQA) do not.

```javascript
// Source: VERIFIED resolve-URL behavior (curl -I) + Node 24 fetch/crypto
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

async function fetchPinned({ id, revision, file, sha256, token, cacheDir }) {
  const url = `https://huggingface.co/datasets/${id}/resolve/${revision}/${file}`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  // global fetch follows the 307 to the CDN automatically (redirect: 'follow' is the default).
  const res = await fetch(url, { headers });

  if (!res.ok) {
    // 401 here = a gated dataset with no/invalid HF_TOKEN (LLM-AggreFact / AVeriTeC). Fail loud.
    throw new Error(`HF fetch failed ${res.status} for ${id}@${revision}/${file} (gated? set HF_TOKEN)`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const got = createHash('sha256').update(buf).digest('hex');

  if (got !== sha256) {
    throw new Error(`checksum mismatch for ${id}/${file}: expected ${sha256} got ${got}`);
  }

  const dest = path.join(cacheDir, id.replace('/', '__'), file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf); // cache is GITIGNORED; never committed

  return buf;
}
```

**Pinning a revision:** `curl -s https://huggingface.co/api/datasets/<id>/refs` returns `branches[].targetCommit` -- pin that sha. `curl -s -X POST https://huggingface.co/api/datasets/<id>/paths-info/<sha> -d '{"paths":[...],"expand":true}'` returns each file's `oid` (and `lfs.oid` = sha256 for LFS files). For small non-LFS JSONL files, the tree `oid` is a git SHA-1 blob hash, NOT sha256 -- so the manifest's sha256 is computed locally on first download and pinned thereafter.

### Pattern 2: The committed DERIVED MANIFEST (license-compliant; no redistributed text)

**What:** The only thing committed for fetch-only corpora -- a JSON file of example IDs + our remapped strata labels + the pinned HF revision + sha256 of the source file(s). The claim/evidence TEXT is fetched at eval time into the gitignored cache. This is what makes CC-BY-ND (LLM-AggreFact) and CC-BY-NC (AVeriTeC) compliant: no derivative, no redistribution.
**Shape:**

```json
{
  "schema_version": 1,
  "generated_at": "2026-06-16",
  "strata": { "supported_frac": 0.4, "bad_frac": 0.6, "subtle_frac_of_bad": 0.5 },
  "sources": {
    "wice": { "id": "jon-tow/wice", "revision": "54f7976b8ce4fe0a9bfd35a4dd30af9d5b45d8a6",
              "files": { "data/subclaim_dev.jsonl": { "sha256": "<computed-locally>" } },
              "vendored": true },
    "averitec": { "id": "chenxwh/AVeriTeC", "revision": "<pinned-sha>",
                  "files": { "<ks-file>": { "sha256": "<...>" } },
                  "vendored": false, "gated": true }
  },
  "examples": [
    { "uid": "wice/subclaim/dev/0007", "source": "wice", "source_label": "partially_supported",
      "stratum": "subtle", "book": "closed", "expected_verdict": "refuted" },
    { "uid": "averitec/test/0142", "source": "averitec", "source_label": "Refuted",
      "stratum": "blatant", "book": "open", "claim_date": "2022-08-01", "expected_verdict": "refuted" }
  ]
}
```

**Label remap (D-02d, VERIFIED WiCE enum):** `supported` -> `expected_verdict: unrefuted`; `partially_supported` -> `refuted` (this is the SUBTLE substratum); `not_supported` -> `refuted`. The false-uphold trap on the SUBTLE substratum = a voter returning `unrefuted` on a `partially_supported` claim.

### Pattern 3: Mirror the existing aggregator's hardening discipline

**What:** The new `lz-eval-*.mjs` scripts MUST inherit the proven patterns from `lz-deep-research-aggregate.mjs`: explicit UTF-8 read; BOM/CRLF normalization where text is compared; `ContractError` with `.file` on every fail-closed path; `safeId` on any content-derived basename; sorted directory listings for determinism; the guarded CLI (`import.meta.url === resolve(process.argv[1])`) so importing for tests does not run the CLI; pure exported functions for the test fixture.
**When to use:** All new scripts. This is a hard project convention, not a suggestion.

### Anti-Patterns to Avoid

- **Adding any npm dependency** (stats lib, HF client, parquet reader, beta-function package). Breaks AGG-02 and the `SC-2 zero-dependency contract` test. Read the parquet-converted config only if you can do it zero-dep; otherwise read the **raw JSONL** files on `main` (verified present) -- they need no parquet reader.
- **Wald/normal-approx CI or bootstrap** for the false-uphold interval. Explicitly REJECTED by D-07 and by arXiv 2503.01747 (CLT "dramatically underestimates uncertainty" at small n; degenerate at rate~0 -- exactly where false-uphold sits).
- **Judging on Haiku's ABSOLUTE false-uphold rate.** The gate is the Haiku-MINUS-Sonnet DELTA (D-06); an absolute number conflates dataset difficulty + parametric leakage with model capability.
- **Live web search in the open-book arm.** Retrieves the published verdict; non-reproducible (D-05). Use the AVeriTeC revised KS + per-claim date cutoff only.
- **Aggressive `CRITICAL: You MUST` prompt language in the Haiku voter.** Per the CURRENT Anthropic doc, 4.6-era models OVERTRIGGER on such language; the guidance is now "use more normal prompting like 'Use this tool when...'". (This is a live correction vs the stale non-authoritative reference -- see EVAL-05 below.)
- **`node --test <dir>`** to gate. Spuriously exits 1 on this host; use the explicit `.test.mjs` FILE form.
- **Committing the fetched corpus text** for LLM-AggreFact / AVeriTeC. License violation. Commit only the manifest; fetch text to the gitignored cache.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Vote tally -> confidence; ceilings; quote-recheck | A second tally engine | The EXISTING `lz-deep-research-aggregate.mjs` (consume it) | Frozen contract; already covered by 30+ fixtures; re-implementing risks drift. |
| Labeled subtle-overreach claims | Hand-authored claims | WiCE `partially_supported` gold labels | D-03 "I will not hand-write these"; human gold labels are the spine. |
| HTTP redirect following | A manual 307 chase | Node global `fetch` (follows redirects by default) | The HF resolve URL 307s to a CDN; `fetch` handles it. |
| File integrity | A custom hash | `node:crypto.createHash('sha256')` | Stdlib, zero-dep, exactly what the manifest pins. |
| Pass@k math | A novel estimator | The standard shared-pool combinatorial formulas (below) | Anthropic *Demystifying Evals* defines pass@k / pass^k; the formulas are closed-form. |
| Test runner | Anything beyond `node:test` | `node:test` + `node:assert/strict` (explicit `.test.mjs` form) | Zero-dep; the proven host-safe gate. |

**Key insight (and the ONE exception):** The binomial confidence interval (Clopper-Pearson upper bound) is the one place you MUST hand-roll, because every off-the-shelf implementation is an npm dependency the zero-dep contract forbids. The verified self-contained implementation (logGamma via Lanczos + regularized incomplete beta via Lentz + inverse via bisection) is supplied in Code Examples; treat it as a frozen numerical primitive with its own fixture against known reference values.

## Common Pitfalls

### Pitfall 1: Gated datasets silently fail without HF_TOKEN
**What goes wrong:** A zero-dep `fetch` of `lytang/LLM-AggreFact` or either AVeriTeC repo returns HTTP 401 with no token; a naive loader treats it as a transient error and retries forever, or silently produces an empty stratum.
**Why it happens:** Both AVeriTeC repos and LLM-AggreFact are `gated:auto` on HF (verified: API returns 401 / "restricted, must be authenticated").
**How to avoid:** Detect 401 explicitly, message "set HF_TOKEN (this dataset is gated; you must accept its terms on the HF dataset page first)", and exit non-zero. Pre-flight check `HF_TOKEN` presence before the open-book stage. The WiCE spine is ungated, so the closed-book SUBTLE gate can run even without a token.
**Warning signs:** Empty open-book stratum; 401 in logs; "checksum mismatch" because an HTML error page was hashed instead of the data file.

### Pitfall 2: Saturated, non-discriminating SUBTLE stratum (the prior-phase failure pattern)
**What goes wrong:** Naive ingest of WiCE `partially_supported` yields Pass@1 = 1.0 for BOTH Haiku and Sonnet -> the gate measures nothing (the exact discriminating-fixture lesson from Phase 17 CR-01 and the `fixture-must-discriminate-ordering` memory).
**Why it happens:** No off-the-shelf corpus ships a balanced, calibrated false-uphold trap set; many `partially_supported` items are still easy.
**How to avoid:** Implement the D-03 SATURATION CHECK explicitly -- after the first SUBTLE run, if both tiers are near-perfect, trigger the programmatic-trap augmentation (overreach a WiCE seed by exactly one hedge/quantifier/scope step; accept only if it flips a deliberately-weak reference verifier; cross-family panel adjudicates). Never hand-write; seed only from WiCE/ExpertQA.
**Warning signs:** SUBTLE false-uphold DELTA upper bound trivially ~0 because NEITHER model ever false-upholds AND neither ever errs -- a too-easy set, not a safe model.

### Pitfall 3: Open-book temporal leakage contaminates the open-book number
**What goes wrong:** The voter retrieves the published fact-check verdict (or post-claim coverage) and "verifies" by reading the answer, so the open-book false-uphold rate looks great but is meaningless.
**Why it happens:** The original AVeriTeC 2024 KS leaks fact-check articles + post-claim documents; live web search and fact-check-domain exclusion both leak the verdict.
**How to avoid:** Use the AVeriTeC **revised KS (released 2024-11-15)** as the SOLE retrieval source; enforce a per-claim publication-date cutoff (voter sees only docs dated before the claim's annotated date -- the ClaimCheck approach). Run the CLOSED-BOOK CONTROL ARM on the same claims: if closed-book false-uphold approaches open-book, parametric pretraining memorization dominates and the open-book number is contaminated regardless of corpus cleanliness -- gate trust on this. `[CITED: arXiv 2510.01226 ClaimCheck; FEVER 2024 KS update 2024-11-15]`
**Warning signs:** Closed-book ~ open-book false-uphold (memorization); a voter "verdict" that quotes a fact-checker.

### Pitfall 4: Silent false-uphold is structurally uncatchable by the contested trigger
**What goes wrong:** A Haiku false-uphold is by definition a UNANIMOUS uphold, so the contested-split escalation cannot catch it -- it is silent.
**Why it happens:** Escalation triggers on a vote SPLIT; a unanimous wrong "unrefuted" never splits.
**How to avoid:** This is precisely why the eval gates on the SUBTLE false-uphold DELTA upper bound ~0 with reliable=15 (D-06/D-07), and why production (Phase 20) adds load-bearing-claim + random-audit escalation. In THIS phase, the eval is the guard; do not weaken the gate to "majority correct."
**Warning signs:** High aggregate accuracy masking a nonzero unanimous-false-uphold count on SUBTLE.

### Pitfall 5: Hashing the wrong bytes / unpinned revision drift
**What goes wrong:** Manifest sha256 was computed against `main`, then `main` moved, so a re-fetch fails checksum (or worse, an unpinned fetch silently grabs new data).
**Why it happens:** Fetching `resolve/main/...` instead of `resolve/<sha>/...`.
**How to avoid:** Always pin the commit sha in the manifest and fetch `resolve/<sha>/...`. WiCE main is currently `54f7976b...`; pin it. The fail-closed checksum is the backstop.

## Code Examples

### Pass@1 and Pass^k from a shared sample pool (deterministic, zero-dep)

```javascript
// Source: Anthropic "Demystifying evals" pass@k / pass^k definitions [CITED]
// n = total trials for a claim (shared pool); c = number of those trials that PASS.
// pass@k (optimistic): P(at least 1 of k sampled trials passes) = 1 - C(n-c, k)/C(n, k)
// pass^k (conservative): P(all k sampled trials pass)          = C(c, k)/C(n, k)
function comb(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let num = 1, den = 1;
  for (let i = 0; i < k; i += 1) { num *= n - i; den *= i + 1; }
  return num / den;
}
function passAtK(n, c, k) { return n < k ? NaN : 1 - comb(n - c, k) / comb(n, k); }
function passHatK(n, c, k) { return n < k ? NaN : comb(c, k) / comb(n, k); }
// "PASS" for a verdict trial = (voter verdict === expected_verdict). For the false-uphold
// rate specifically, a "false-uphold event" = (expected_verdict === 'refuted' && verdict === 'unrefuted').
```

### Clopper-Pearson UPPER bound (the SOLE-gate interval), self-contained

```javascript
// Source: SYNTHESIZED from verified formula (Beta-quantile form) + verified zero-dep
//   logGamma (Lanczos) + regularized incomplete beta (Lentz) + bisection inverse.
// Clopper-Pearson upper bound for x false-upholds in n trials at confidence 1-alpha:
//   U = Beta^{-1}(1 - alpha/2 ; x + 1, n - x);  U = 1 when x === n; (lower = 0 when x === 0)
// This is the worst-case (upper) false-uphold rate -- the quantity D-07 judges on.

function logGamma(x) {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i += 1) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
function incbeta(a, b, x) { // regularized I_x(a,b) via Lentz's algorithm
  const TINY = 1e-30;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  if (x > (a + 1) / (a + b + 2)) return 1 - incbeta(b, a, 1 - x);
  const lbeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;
  let f = 1, ci = 1, d = 0;
  for (let i = 0; i <= 250; i += 1) {
    const m = Math.floor(i / 2);
    let num;
    if (i === 0) num = 1;
    else if (i % 2 === 0) num = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    else num = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + num * d; if (Math.abs(d) < TINY) d = TINY; d = 1 / d;
    ci = 1 + num / ci; if (Math.abs(ci) < TINY) ci = TINY;
    const cd = ci * d; f *= cd;
    if (Math.abs(1 - cd) < 1e-15) return front * (f - 1);
  }
  return front * (f - 1);
}
function betaInv(p, a, b) { // inverse regularized incomplete beta via bisection
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  let lo = 0, hi = 1;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    if (incbeta(a, b, mid) < p) lo = mid; else hi = mid;
    if (hi - lo < 1e-12) break;
  }
  return (lo + hi) / 2;
}
function clopperPearsonUpper(x, n, alpha = 0.05) { // worst-case rate
  if (n === 0) return 1;
  if (x === n) return 1;
  return betaInv(1 - alpha / 2, x + 1, n - x);
}
// Fixture anchors (verified): betaInv(0.2,3,3) ~= 0.327; betaInv(0.4,1,6) ~= 0.082.
// CI sanity: clopperPearsonUpper(0, 15, 0.05) ~= 0.218 (0 false-upholds in 15 trials still
// only bounds the rate at ~22% upper -- WHY reliable=15 is "thin" and a DELTA + closed-book
// cross-check are required, not an absolute-zero claim).
```

> Note on the SUBTLE gate quantity: the gate is the Haiku-MINUS-Sonnet DELTA. Compute the false-uphold count for each tier on the shared SUBTLE pool, then report Clopper-Pearson on each and the DELTA's worst-case (a conservative combination, e.g. Haiku upper minus Sonnet lower, or a paired/Bayesian Beta-Bernoulli on the difference -- the estimator choice is Claude's Discretion per D-07). The point math is the same primitive above.

### Wilson upper bound (alternative per D-07; cheaper, no beta function)

```javascript
// Source: VERIFIED Wilson score formula. Good general-purpose; for rate~0 the exact
// (Clopper-Pearson) method is preferred (verified: "exact method should be strongly
// considered for extremely rare events"). Provided so the planner can pick per D-07.
function wilsonUpper(x, n, z = 1.959963985) { // z = 1.96 for 95%
  if (n === 0) return 1;
  const p = x / n, z2 = z * z, denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  return Math.min(1, center + half);
}
```

### Headless voter execution (the harness driver)

```bash
# Source: CLAUDE.md "Skill Verification with claude -p" + SESSION-DESIGN A2 (verified headless)
# One isolated skeptic vote per (claim x seat x tier). Temperature 0, k>=5 seats.
# Reference the claim/excerpt by PROSE PATH, never an @file mention (breaks slash routing).
claude --model haiku --permission-mode auto \
  --plugin-dir plugins/lz-advisor \
  -p "/lz-advisor:<voter-skill-or-direct-prompt> Cast one isolated skeptic vote on the claim in <cache-path>; write the vote JSON to <run-dir>/votes/<id>-<seat>.json" \
  --verbose --output-format stream-json
# --validate oracle pre-flight: same harness, --model sonnet, on a known-answer seed; expect ~100%.
# Grade the advisor/voter sub-agent tool-use from the JSONL session log under
#   ~/.claude/projects/<cwd-hash>/<session>/subagents/agent-<id>.jsonl  (toolUseResult.usage.tool_uses).
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Wald / normal-approx CI; bootstrap | Clopper-Pearson / Wilson / Beta-Bernoulli, judge on UPPER bound | arXiv 2503.01747 (ICML 2025) | The decisive D-07 correction; Wald is degenerate at rate~0. |
| VitaminC for "subtle" entailment | WiCE `partially_supported` for genuine overreach | this session's adversarial verification | VitaminC is easy numeric/date flips, off-phenomenon. |
| LLM-as-judge for the pass/fail gate | Deterministic verdict-vs-gold-label; LLM-judge only for qualitative dims with an "Unknown" out | SkillsBench + Anthropic *Demystifying Evals* | Removes judge variance from the SOLE hard gate. |
| `CRITICAL: You MUST <tool>` prompt language | "Use <tool> when..." (normal phrasing) | Anthropic doc, Opus 4.5/4.6 era | 4.6-era models OVERTRIGGER on aggressive language; matters for the Haiku voter prompt. `[CITED: docs.anthropic.com claude-4-best-practices]` |
| Manual extended-thinking `budget_tokens` | Adaptive thinking (`thinking:{type:'adaptive'}`) + `effort`; `budget_tokens` deprecated | Claude 4.6 | The non-authoritative Haiku reference's `budget_tokens` API examples are STALE for the current API surface. |
| Prefilled assistant responses to force format | Structured outputs / direct instruction | Claude 4.6 (prefill returns 400) | The non-authoritative reference's prefill patterns are no longer supported on current models. |

**Deprecated/outdated (in the NON-authoritative `MODEL-OPTIMIZATION-HAIKU.md` starting list -- corrected for EVAL-05):**
- `budget_tokens` thinking config: deprecated in favor of adaptive thinking + `effort`.
- Prefilled responses: unsupported on 4.6 (400 error).
- Aggressive `NEVER`/`MUST`/`CRITICAL` framing: now an overtriggering risk; prefer plain phrasing + context/motivation.
- Structured-outputs "BETA - DO NOT USE IN PRODUCTION" caveat: the current Anthropic doc treats Structured Outputs as the recommended replacement for prefill -- the beta caveat in the stale doc should be re-verified, not cited.

## EVAL-05: Haiku prompt-engineering reference artifact (the open research deliverable)

> This section is the substance the planner turns into the `references/lz-haiku-prompt-engineering.md` artifact. Each technique: WHAT it is, WHY it helps a cheap model on a skeptic-voter task, and a VERIFIED source. The `lz-nx-ai-plugins` `MODEL-OPTIMIZATION-HAIKU.md` was used ONLY as a starting list to verify -- every item below is confirmed against the current Anthropic prompting doc (`docs.anthropic.com/.../claude-4-best-practices`, fetched 2026-06-16, which explicitly covers Claude Haiku 4.5) or flagged stale.

| # | Technique | Why it helps a CHEAP model on a fair skeptic-voter prompt | Source |
|---|-----------|-----------------------------------------------------------|--------|
| H1 | **Be clear and direct; specify exact output format + constraints** | Removes ambiguity a weaker model would otherwise fill with drift; pins the `verdict` enum + the envelope fields. "Think of Claude as a brilliant but new employee... be specific about the desired output format and constraints." | `[CITED: claude-4-best-practices "Be clear and direct"]` |
| H2 | **Few-shot / multishot examples, wrapped in `<example>`/`<examples>`, 3-5, relevant + diverse + structured** | "One of the most reliable ways to steer output format." For a skeptic voter, include DISCONFIRMING examples (a partially-supported claim correctly returned `refuted`, with the negation search shown) so Haiku learns the trap, not just the format. | `[CITED: claude-4-best-practices "Use examples effectively"]` |
| H3 | **XML-tagged structure (`<instructions>`,`<claim>`,`<evidence>`,`<output_format>`)** | "XML tags help Claude parse complex prompts unambiguously... reduces misinterpretation." Helps a cheap model keep claim vs evidence vs instruction separate. | `[CITED: claude-4-best-practices "Structure prompts with XML tags"]` |
| H4 | **Role framing in one sentence** ("You are an adversarial fact-checker...") | "Setting a role focuses Claude's behavior and tone... even a single sentence makes a difference." The adversarial frame is what biases toward skepticism (the safe direction for a gate). Matches the proven pilot prompt. | `[CITED: claude-4-best-practices "Give Claude a role"]` + `[VERIFIED: pilot VOTE_PROMPT]` |
| H5 | **Tell it what to DO, not what NOT to do** | "Instead of 'Do not use markdown' try 'compose flowing prose.'" For the voter: "Return `refuted` when the evidence does not fully support the claim as stated" beats "don't be lenient." | `[CITED: claude-4-best-practices "Control the format of responses"]` |
| H6 | **Add context/motivation for each constraint** | "Explaining WHY a constraint exists helps Claude adhere strictly." E.g. "Return `unrefuted` ONLY if the evidence supports the claim AS STATED, because a false uphold silently corrupts a cited research report." | `[CITED: claude-4-best-practices "Add context to improve performance"]` |
| H7 | **Explicit "return Unknown/abstain when unsure" out** (maps to the schema's `insufficient`) | A cheap model under uncertainty otherwise defaults to a confident wrong answer. The frozen schema treats a missing/`null` verdict as `insufficient`; instruct the voter to abstain rather than guess. This is the fairness analog of the advisor's `Assuming X (unverified)` discipline. | `[CITED: lz-deep-research-schema.md vote record]` + `[ASSUMED]` that abstain-when-unsure reduces Haiku false-upholds (the eval measures it) |
| H8 | **Ground the verdict in quoted evidence first** (open-book: quote relevant docs, THEN judge) | "For long-document tasks, ask Claude to quote relevant parts first... cuts through the noise." Forces the open-book voter to actually read retrieved docs before voting, raising tool-use fidelity. | `[CITED: claude-4-best-practices "Long context prompting / Ground responses in quotes"]` |
| H9 | **Disconfirming-search instruction = search the NEGATION, record the query** (VERIF-02) | "Encourage source verification across multiple sources." The pilot's "ACTIVELY look for evidence that contradicts... try hard to REFUTE it" achieved 100% tool-use on Haiku open-book at n=18. Record the query into `disconfirming_query`. | `[CITED: claude-4-best-practices "Research and information gathering"]` + `[VERIFIED: pilot 100% Haiku tool-use]` |
| H10 | **Bounded reasoning + commit-to-one-approach** (avoid open-ended exploration) | Haiku "excels at focused, bounded tasks"; the current doc warns against over-exploration. "Choose an approach and commit to it." Keeps a single-call voter cheap and on-task. | `[CITED: claude-4-best-practices "Overthinking"]` + `[ASSUMED: non-authoritative starting list "step-bounded reasoning 3-5 steps"]` |
| H11 | **Plain phrasing, NOT `CRITICAL/MUST/NEVER`** | Current 4.6-era models OVERTRIGGER on aggressive language; "use more normal prompting." A live correction vs the stale starting list. | `[CITED: claude-4-best-practices "Tool usage" / "Tune anti-laziness prompting"]` |
| H12 | **Structured output via direct instruction (or Structured Outputs feature), NOT prefill** | Prefill returns 400 on 4.6; ask the model to conform to the schema directly. The voter writes a small JSON ( `verdict` + envelope ) -- direct instruction is enough. | `[CITED: claude-4-best-practices "Migrating away from prefilled responses"]` |

**Haiku 4.5 facts to record in the artifact (verify before citing as load-bearing):** the non-authoritative reference states 200K context, $1/$5 per-MTok, ~73% SWE-bench, "90% of Sonnet's agentic performance at 1/3 cost," 2-5x faster. These are `[ASSUMED]` (single non-authoritative source); the Anthropic Haiku 4.5 announcement (`anthropic.com/news/claude-haiku-4-5`) is the place to confirm any number the artifact treats as load-bearing. For the eval's PURPOSE, the only load-bearing fact is that Haiku is the cheaper tier whose verification SAFETY is unknown -- the exact pricing is not gate-relevant.

**Fairness framing (D-08) for the artifact's intro:** state explicitly that the Haiku voter prompt is engineered to the SAME task contract as the Sonnet baseline (identical schema, identical dataset, identical grader), so the eval measures MODEL capability, not prompt quality. The artifact is the provenance record that the Haiku prompt was a genuine best-effort, not a Sonnet prompt with the model swapped.

## Voter agent structure (deliverable 4)

Two agent files mirroring the existing `agents/*.md` frontmatter shape (`name`, `description` with `<example>` blocks, `model`, `color`, `tools`, optionally `maxTurns`/`effort`):

- `research-verify-voter-sonnet.md` -- `model: sonnet`, tools `[WebSearch, WebFetch, Write]` (open-book) or `[Write]` (closed-book control); ship default.
- `research-verify-voter-haiku.md` -- `model: haiku`, same tools; prompt engineered from the EVAL-05 artifact (D-08); behind the OFF flag.

**Each voter casts ONE isolated skeptic vote** (no shared context) and writes a vote file to the frozen shape:

```json
{ "verdict": "unrefuted",
  "attack_mode": "scope-causality-overclaim",
  "disconfirming_query": "evidence that X does NOT reduce Y",
  "source_independence_note": "3 hits, 1 canonical source (syndicated) -> counts as 1" }
```

- `verdict` is the FROZEN consumed core (`unrefuted` | `refuted`); the aggregator reads ONLY this. The envelope fields are additive-only (D-09/D-10), invisible to the off-model tally. `[CITED: lz-deep-research-schema.md vote record]`
- **3 attack modes (SESSION-DESIGN Section 6):** factual contradiction / scope-causality overclaim / source-provenance. The three seats per claim are diversified across these modes.
- **Disconfirming search (VERIF-02):** the open-book voter searches the NEGATION (not the claim's terms) and records the query.
- **Open-book restriction (D-05):** retrieve ONLY from AVeriTeC's revised KS (2024-11-15) with a per-claim publication-date cutoff; never live web. The closed-book control arm sees only the provided excerpt (no tools).
- **Grade outcomes, not steps (D-09):** the deterministic gate scores `verdict` vs gold label; the path is graded only qualitatively by the isolated LLM-rubric judge.

## Eval execution harness (deliverable 5)

1. **Pre-register the lock rule FIRST** (`references/lz-eval-lock-rule.md`, committed before any model call): exact thresholds (SUBTLE open-book false-uphold DELTA upper-CI ~0; cost gate escalation > 40-50% kills Haiku), false-uphold-as-sole-hard-gate, reliable=15 on PASS, raise-to-user on FAIL.
2. **`--validate` oracle pre-flight:** run the trusted Sonnet baseline on a small known-answer seed; require ~100% (SkillsBench oracle-100% + skillgrade `--validate` analog; doubles as a label cross-check). Seed-claim count is Claude's Discretion.
3. **Stage SUBTLE FIRST** (the sole hard gate; spend credits where the decision lives): k>=5 temp-0 votes per (claim x seat x tier), via `claude -p --permission-mode auto`.
4. **Shared-pool pass@k estimator:** one pool of n trials per claim; compute Pass@1/Pass^k for all k from the same pool (don't re-sample).
5. **Remaining strata + closed-book control arm** after SUBTLE.
6. **Saturation check + conditional trap augmentation** (D-03) from WiCE seeds if SUBTLE doesn't discriminate.
7. **Abort-early ONLY on FAIL.** For any PASS, escalate the SUBTLE subset to reliable=15 before declaring PASS (k=5 is too thin for a near-zero-tolerance gate -- see the CI sanity anchor: 0/15 still bounds the rate at ~22% upper).
8. **Credit-aware staging:** nested `claude -p` draws on the same 5-hour usage pool; stage across reset windows; `out_of_credits` (429) mid-run is a known risk the staging bounds.

## Runtime State Inventory

> Not a rename/refactor/migration phase -- this section is N/A. No stored data, live-service config, OS-registered state, secrets, or build artifacts carry a string being renamed. The only NEW runtime state is the gitignored eval cache (handled by `.gitignore`, below) and the `HF_TOKEN` env var (read at eval time; not committed). None require migration.

## Validation Architecture

> nyquist_validation is enabled (config has `nyquist_validation: true`). This section is REQUIRED.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` + `node:assert/strict` (Node v24.13.0, bundled) |
| Config file | none (zero-dep; no package.json) |
| Quick run command | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-eval-aggregate.test.mjs` |
| Full suite command | run EACH `.test.mjs` by explicit file path (NEVER `node --test <dir>` -- host quirk): the aggregator test, the new eval-aggregator test, and the new dataset-loader test |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EVAL-02 | Pass@1 / Pass^k computed correctly from a shared pool | unit | `node --test .../lz-eval-aggregate.test.mjs` (assert passAtK/passHatK on known n,c,k) | NO -- Wave 0 |
| EVAL-02 | Per-stratum false-uphold counted correctly (bad claim + unrefuted verdict) | unit | same file (fixture vote dir -> expected counts) | NO -- Wave 0 |
| EVAL-04/D-07 | Clopper-Pearson UPPER bound matches reference values; degenerate-at-0 handled | unit | same file (assert betaInv anchors: ~0.327, ~0.082; CP upper(0,15)~0.218) | NO -- Wave 0 |
| D-06 | Haiku-minus-Sonnet DELTA computed per stratum from the shared pool | unit | same file (two-tier fixture -> expected delta) | NO -- Wave 0 |
| EVAL-01/D-02d | WiCE label remap (supported->unrefuted; partially/not->refuted; partially=subtle) | unit | `node --test .../lz-eval-dataset.test.mjs` (offline fixture JSONL -> manifest rows) | NO -- Wave 0 |
| D-04 | Checksum mismatch fails CLOSED (loud throw, non-zero) | unit | dataset test (write wrong-sha fixture -> assert throws) | NO -- Wave 0 |
| Pitfall 1 | Gated 401 surfaces an actionable HF_TOKEN error (not infinite retry) | unit | dataset test (mock 401 response -> assert specific error) | NO -- Wave 0 |
| EVAL-04 | Lock-rule threshold check is mechanical (PASS/FAIL deterministic given counts) | unit | eval-aggregate test (feed counts above/below threshold -> assert verdict) | NO -- Wave 0 |
| VERIF-01/02/03, EVAL-03, EVAL-05 | Voter behavior (attack-mode diversity, disconfirming_query present, Haiku-vs-Sonnet gate) | model-call (NOT deterministic) | `claude -p` harness run; graded by aggregator + isolated LLM-rubric judge | manual / live -- NOT unit-testable |

**Deterministic (unit-testable offline, NO model calls):** interval math (Clopper-Pearson/Wilson upper bound), `comb`/Pass@1/Pass^k, per-stratum false-uphold counting, Haiku-minus-Sonnet DELTA, WiCE label remap, manifest parsing, sha256 checksum + fail-closed, gated-401 error path, the mechanical lock-rule threshold check. These are the Wave-0 fixtures and mirror the existing aggregator test's rigor (precondition guards, mutation-killing assertions, try/finally temp-dir cleanup, explicit-file-form gate).

**Requires live model calls (NOT unit-testable; the eval IS the test):** the actual voter verdicts, attack-mode diversity, disconfirming-search behavior, the Haiku-vs-Sonnet false-uphold gate. These run via the headless harness and are graded by the deterministic aggregator + the isolated LLM-rubric judge.

### Sampling Rate
- **Per task commit:** the relevant new `.test.mjs` by explicit file path.
- **Per wave merge:** all three `.test.mjs` files (existing aggregator + new eval-aggregator + new dataset-loader) by explicit file path.
- **Phase gate:** all deterministic suites green before the live eval run; the live eval run itself is gated by the pre-registered lock rule.

### Wave 0 Gaps
- [ ] `scripts/lz-eval-aggregate.test.mjs` -- Pass@1/Pass^k, false-uphold, DELTA, Clopper-Pearson, lock-rule check (EVAL-02/04, D-06/D-07)
- [ ] `scripts/lz-eval-dataset.test.mjs` -- label remap, checksum fail-closed, gated-401 error path (EVAL-01, D-04)
- [ ] `scripts/__fixtures__/` eval fixtures (offline JSONL samples + vote dirs + known-answer CI anchors)
- [ ] Framework install: none (`node:test` is bundled)

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (`fetch`, `crypto`, `test`) | loader + aggregator + tests | YES | v24.13.0 | none needed |
| Network access to `huggingface.co` | dataset fetch at eval time | assumed (build host) | -- | offline fixtures cover all deterministic tests; live fetch only for the eval run |
| `HF_TOKEN` env var (HF account + accepted dataset terms) | LLM-AggreFact + both AVeriTeC (GATED) | UNKNOWN -- user must provide | -- | WiCE-only closed-book SUBTLE gate runs WITHOUT a token; open-book/stress arms BLOCK without it |
| `claude -p --permission-mode auto` | headless voter execution | YES (project-verified path) | Claude Code v2.1.x | none |
| Claude usage budget (5-hour pool) | k>=5 + reliable=15 voter calls | shared with parent session | -- | stage across reset windows (D-06) |

**Missing dependencies with no fallback for the FULL eval:** `HF_TOKEN` for the open-book (AVeriTeC) and stress (LLM-AggreFact) arms. The planner MUST add a pre-flight check + an actionable message, and SHOULD sequence the WiCE-only closed-book SUBTLE gate so a partial eval is possible without a token.
**Missing dependencies with fallback:** network -- all deterministic Wave-0 tests run offline against committed fixtures; only the live eval needs the network.

## .gitignore addition (required)

The gitignored eval cache MUST be added (mirrors INTEG-02's `.lz-research/` pattern). Recommend a distinct path (Claude's Discretion on the name), e.g.:

```
# Eval dataset cache (fetched at eval time; license-compliant local-only; never committed)
/.lz-eval-cache/
```

This keeps the fetched LLM-AggreFact / AVeriTeC text local-only (D-04 license compliance). The committed manifest + vendored WiCE live IN the repo; the fetched text does NOT.

## Security Domain

> `security_enforcement` is not explicitly `false` in config (absent) -- treat as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | partial | `HF_TOKEN` read from env, never logged, never committed (it is a secret bearer token). |
| V5 Input Validation | yes | The loader parses UNTRUSTED downloaded JSONL: fail-closed `JSON.parse` (mirror `readJson`/`ContractError`), `safeId` on any content-derived basename, reject oversized inputs (the existing aggregator ceilings precedent). |
| V6 Cryptography | yes | sha256 via `node:crypto` for integrity ONLY (not secrecy); never hand-roll a hash. |
| V12 File/Resource | yes | Cache writes confined to the gitignored cache dir; `path.join`, basename-only ids, no path traversal (the `safeId` precedent). |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Tampered/swapped dataset file (supply-chain) | Tampering | Pinned revision + sha256 fail-closed (verified mechanics). |
| HF_TOKEN leak in logs/commits | Info Disclosure | Read from env at eval time; never echo; cache + manifest carry no token; `.gitignore` the cache. |
| Path traversal via a crafted example id / filename | Tampering | `safeId` basename-only guard (reuse the aggregator's). |
| Malformed downloaded JSON crashes the loader | DoS | `ContractError` fail-closed parse; do not coerce. |
| Open-book voter reads the leaked verdict (eval integrity) | (eval validity, not classic STRIDE) | Revised KS + per-claim date cutoff + closed-book control (D-05). |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | "Return Unknown/abstain when unsure" reduces Haiku false-upholds (fairness technique H7) | EVAL-05 | If wrong, the Haiku prompt is slightly less optimal -- but the eval MEASURES the outcome, so a bad technique surfaces as a worse gate result, not a silent error. Low risk. |
| A2 | Haiku 4.5 pricing/benchmark numbers (200K ctx, $1/$5, 73% SWE-bench, "90% agentic at 1/3 cost") | EVAL-05 facts | From a single non-authoritative source; NOT gate-relevant. Confirm against `anthropic.com/news/claude-haiku-4-5` only if the artifact treats any as load-bearing. |
| A3 | "step-bounded 3-5 steps" as a Haiku-specific technique (H10) | EVAL-05 | From the non-authoritative list; the authoritative doc supports "commit to one approach / avoid over-exploration" but not the exact 3-5 number. Treat the number as a heuristic, not a rule. |
| A4 | The AVeriTeC revised KS is fetchable with an HF_TOKEN at the chenxwh mirror | Dataset loading | Repo is gated (verified 401); could not enumerate the KS file paths without a token this session. The planner must enumerate KS files at eval time once authenticated and pin their sha256 then. |
| A5 | Network access to huggingface.co is available on the eval host | Environment | If absent, only the live eval blocks; deterministic tests are unaffected. |
| A6 | Structured Outputs is production-ready for the voter (vs the stale "BETA - DO NOT USE" caveat) | State of the Art | The current Anthropic doc recommends it over prefill; the voter writes tiny JSON, so plain direct instruction suffices regardless -- low risk. |

**Note:** No `[ASSUMED]` claim is load-bearing for the GATE itself. The gate is deterministic (verdict-vs-gold-label + Clopper-Pearson), and the gold labels are human-annotated WiCE (verified enum). The assumptions above affect prompt QUALITY and operational mechanics, which the eval surfaces empirically rather than relying on.

## Open Questions

1. **Exact AVeriTeC revised-KS file layout + per-claim date field name.**
   - What we know: the revised KS was released 2024-11-15 for FEVER-2024; per-claim date cutoff is the documented mechanic (ClaimCheck).
   - What's unclear: the precise file paths and the claim-date field name inside the gated repo (could not enumerate without HF_TOKEN this session).
   - Recommendation: enumerate at eval time once authenticated (`paths-info` API with the token), pin sha256 into the manifest then; treat the open-book arm as the part that requires the token.

2. **DELTA interval combination method (Clopper-Pearson per-tier vs paired Beta-Bernoulli on the difference).**
   - What we know: D-07 leaves the estimator to Claude's Discretion; the per-tier primitive is verified.
   - What's unclear: whether to report (Haiku-upper minus Sonnet-lower) as the conservative DELTA bound or a Bayesian Beta-Bernoulli on the paired difference.
   - Recommendation: implement the per-tier Clopper-Pearson primitive first (verified, simplest), add a Beta-Bernoulli option behind the same interface if the planner wants the paired treatment; both are valid per D-07.

3. **Whether to read WiCE via raw JSONL on `main` or the parquet-converted config.**
   - What we know: raw JSONL files exist on `main` (verified) and need no parquet reader (zero-dep friendly); the parquet config exists at `refs/convert/parquet`.
   - Recommendation: read the raw JSONL (`data/subclaim_dev.jsonl` etc.) -- zero-dep, no parquet decoder needed. Pin the `main` sha `54f7976b...`.

## Sources

### Primary (HIGH confidence)
- `docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices` (fetched via markdown.new 2026-06-16) -- authoritative Anthropic prompting doc covering Claude Haiku 4.5; the EVAL-05 grounding source.
- HuggingFace dataset/refs/tree/paths-info APIs (curl, 2026-06-16) -- WiCE schema/revision/file shas + license; LLM-AggreFact + AVeriTeC gating + license verification.
- `huggingface.co/api/datasets/jon-tow/wice/refs` -- WiCE main sha `54f7976b8ce4fe0a9bfd35a4dd30af9d5b45d8a6`.
- `github.com/ryokamoi/wice` README -- WiCE label enum (`supported`/`partially_supported`/`not_supported`) + record fields.
- `datasets-server.huggingface.co/info?dataset=jon-tow/wice` and `?dataset=cmalaviya/expertqa` -- confirmed schemas/splits.
- `plugins/lz-advisor/references/lz-deep-research-schema.md` -- FROZEN vote/claim/source shapes + tally rubric + reserved envelope (the contract this phase fills).
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` + `.test.mjs` -- the aggregator spine + node:test pattern to mirror.
- `.planning/research/SESSION-DESIGN.md` Sections 6, 10, 13, 15 -- 3 attack-mode voters; verifier tier; A2 headless proof; the PROVISIONAL Sonnet-default decision this eval settles.

### Secondary (MEDIUM confidence)
- arXiv 2503.01747 abstract (ICML 2025) -- CLT/Wald dramatically underestimates at small n; recommends frequentist + Bayesian methods; provides a Bayesian Python library. (Full text not parseable this session; the decision it drives is already LOCKED in D-07.)
- WebSearch (cross-verified) -- Clopper-Pearson upper = Beta^{-1}(1-alpha/2; x+1, n-x); Wilson score formula; Clopper-Pearson preferred for rate~0; zero-dep ibetainv via logGamma+Lentz+bisection.
- arXiv 2510.01226 (ClaimCheck) + FEVER-2024 KS update 2024-11-15 -- per-claim publication-date cutoff; revised KS as the leakage fix.

### Tertiary (LOW confidence -- flagged for verification, NOT cited as fact)
- `lz-nx-ai-plugins/research/prompt-engineering/MODEL-OPTIMIZATION-HAIKU.md` -- NON-AUTHORITATIVE starting list; every used item re-verified against the Anthropic doc above; stale items (budget_tokens, prefill, CRITICAL/MUST framing, structured-outputs beta caveat) flagged in State of the Art.

## Metadata

**Confidence breakdown:**
- Standard stack / datasets / licenses / gating: HIGH -- verified via HF API this session (gating + license + revision + schema + label enum all confirmed).
- CI math (Clopper-Pearson / Wilson, zero-dep impl): HIGH -- formula verified against multiple sources; impl sketch verified against stdlib reference values.
- Haiku prompt techniques (EVAL-05): HIGH for the technique set (authoritative Anthropic doc); MEDIUM on Haiku-specific NUMBERS (single non-authoritative source, not gate-relevant).
- Architecture / harness / test discipline: HIGH -- mirrors the existing, proven aggregator + the project's verified `claude -p` path.
- Live open-book voter behavior + the gate VERDICT: LOW -- this is exactly what the eval measures; cannot be known pre-eval (by design).

**Research date:** 2026-06-16
**Valid until:** ~2026-07-16 for datasets/CI math (stable); ~2026-06-23 for the Anthropic prompting doc + Haiku facts (fast-moving model docs).

## RESEARCH COMPLETE
