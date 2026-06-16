---
phase: 18
slug: haiku-prompt-engineering-deep-research-verify-voter-early-ga
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-16
validated: 2026-06-16
---

# Phase 18 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Regenerated 2026-06-16 for the zero-dep AMENDMENT: eval tooling moves to a repo-level `eval/`
> dir (own `package.json` + committed lockfile + gitignored `node_modules`, pinned `jstat`); the
> distributed plugin runtime stays strictly zero-dep. Test paths updated to the `eval/` layout.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` + `node:assert/strict` (Node v24.13.0, bundled). Eval-aggregator tests additionally import the pinned `jstat` from `eval/node_modules/`. |
| **Config file** | Plugin tree: none (zero-dep). Eval tree: `eval/package.json` (`"type":"module"`) + committed `eval/package-lock.json`. |
| **Quick run command** | `node --test eval/<name>.test.mjs` (explicit FILE form -- never `node --test <dir>`; host quirk exits 1 even on pass). Eval-tree tests require `cd eval && npm install` first to restore `eval/node_modules/`. |
| **Full suite command** | Run EACH `.test.mjs` by explicit file path: the EXISTING runtime aggregator test (`plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs`, incl. the re-scoped SC-2), `eval/lz-eval-aggregate.test.mjs`, `eval/lz-eval-dataset.test.mjs`, `eval/lz-eval-packaging-boundary.test.mjs`. |
| **Estimated runtime** | ~5-15 seconds (deterministic, no model calls) |

> The deterministic harness/aggregator/loader is unit-testable offline. The live gating-eval RUN
> (k>=5 voter calls over the dataset) is NOT a node:test -- it is a staged `claude -p` execution
> gated by the pre-registered lock rule; its outputs feed the deterministic aggregator, which IS
> unit-tested. The CI/interval statistics are computed by the pinned `jstat` library (D-07);
> hand-rolling is forbidden. Tests assert the verified anchors (0.218 / 0.327 / 0.082 / CP(n,n)=1
> / combination(15,3)=455) to prove the library is wired correctly -- they do not re-derive the math.

---

## Sampling Rate

- **After every task commit:** Run the relevant `*.test.mjs` file(s) by explicit file path (after `eval/node_modules/` is restored for eval-tree tests)
- **After every plan wave:** Run all `*.test.mjs` files -- the runtime aggregator test (plugin tree) + the three eval-tree tests (eval-aggregate, dataset, packaging-boundary)
- **Before `/gsd:verify-work`:** All deterministic tests green; the live eval run is gated separately by the pre-registered lock rule
- **Max feedback latency:** ~15 seconds (deterministic suite)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | EVAL-05 | T-18-01 | every technique carries a CITED source tag; no unsourced claim shipped | doc-assert | `node -e` ASCII + CITED + stale-pattern check on `lz-haiku-prompt-engineering.md` | doc (asserted inline: 14 CITED, ASCII, stale-only-in-doc) | green |
| 18-02-01 | 02 | 1 | EVAL-04, D-11 | T-18-DEPLEAK | no `package.json`/`node_modules` + no eval import under the plugin tree | unit | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs && node --test eval/lz-eval-packaging-boundary.test.mjs` | EXISTS (both: 39 + 2 green) | green |
| 18-02-02 | 02 | 1 | EVAL-04 | T-18-LOCKDRIFT | exact `jstat@1.9.6` pin; `node_modules` + cache gitignored | unit | `node -e` `eval/package.json` + `.gitignore` checks | inline (pin 1.9.6 + .cache/node_modules gitignored) | green |
| 18-02-03 | 02 | 1 | COST-02 | T-18-SC | first `npm install` human-verified (exact pin, MIT LICENSE, no install scripts, anchors) | manual (checkpoint:human-verify) | `cd eval && npm install --save-exact jstat@1.9.6` + anchor + LICENSE check | N/A (live) | manual (done -- node_modules/jstat restored; lockfile committed) |
| 18-03-01 | 03 | 2 | EVAL-02, EVAL-04, COST-02 | T-18-MATHTRUST / T-18-PARSE | CI library-wired (anchors pinned); false-uphold counter + DELTA discriminating | unit (tdd) | `node --test eval/lz-eval-aggregate.test.mjs` | EXISTS (15 green) | green |
| 18-04-01 | 04 | 2 | EVAL-01 | T-18-DATATAMPER / T-18-TOKENLEAK | sha256 fail-closed; gated-401 actionable; remap discriminating | unit (tdd) | `node --test eval/lz-eval-dataset.test.mjs` | EXISTS (15 green) | green |
| 18-04-02 | 04 | 2 | EVAL-01 | T-18-LICENSE | only WiCE vendored w/ NOTICE; no encumbered (AVeriTeC/LLM-AggreFact) text committed | unit | `node -e` NOTICE attribution + ASCII check | inline (NOTICE: ODC-BY/MIT; AVeriTeC/LLM-AggreFact not vendored; ASCII) | green |
| 18-05-01 | 05 | 3 | VERIF-01, VERIF-02, VERIF-03, COST-02, EVAL-05 | T-18-DEPLEAK3 | voters zero-dep (no eval/ import); Haiku plain phrasing (no CRITICAL/MUST/NEVER, no budget_tokens) | unit | `node -e` agent frontmatter + frozen-vote-contract + zero-dep checks | inline + boundary test (frozen contract present; no live budget_tokens/prefill; zero-dep) | green |
| 18-05-02 | 05 | 3 | EVAL-02, EVAL-03 | T-18-LEAK2 / T-18-POSTHOC | revised-KS-only retrieval + date cutoff; lock rule pre-committed, unedited | manual (checkpoint:human-action) | staged `claude -p --permission-mode auto` eval -> `node eval/lz-eval-aggregate.mjs` | N/A (live, credit-bound) | manual/live (EVAL-03 raise exercised; definitive k>=5 run relocated to Phase 19) |
| 18-05-03 | 05 | 3 | EVAL-03 | T-18-POSTHOC | flag flips ON only per the pre-registered lock-rule verdict; else raise-to-user | manual (checkpoint:decision) | mechanical lock-rule verdict from 18-05-02 | N/A (decision) | manual (owner settled: PURSUE Haiku-first via staged pilot) |

*Status: pending / green / red / flaky. The planner populates this map from the PLAN.md task list.
Deterministic-testable surface (per RESEARCH.md Validation Architecture):*
- *EVAL-02: Pass@1 / Pass^k via `jStat.combination` (shared-pool estimator); per-stratum false-uphold counting -> `eval/lz-eval-aggregate.test.mjs`*
- *EVAL-04 / D-07: Clopper-Pearson / Wilson UPPER bound via the pinned library, asserted against the verified anchors; degenerate-at-0/n handled -> `eval/lz-eval-aggregate.test.mjs`*
- *D-06: Haiku-minus-Sonnet DELTA per stratum from the shared pool; mechanical lock-rule threshold check -> `eval/lz-eval-aggregate.test.mjs`*
- *EVAL-01 / D-02d: WiCE label remap (supported->unrefuted; partially/not->refuted; partially=subtle) -> `eval/lz-eval-dataset.test.mjs`*
- *D-04: checksum mismatch fails CLOSED; gated-401 surfaces an actionable HF_TOKEN error (no infinite retry) -> `eval/lz-eval-dataset.test.mjs`*
- *D-11: no `package.json`/`node_modules` under `plugins/lz-advisor/`; no eval import from any shipped runtime artifact -> `eval/lz-eval-packaging-boundary.test.mjs` (NEW) + the re-scoped SC-2 in the EXISTING runtime aggregator test (in-scope edit)*

---

## Wave 0 Requirements

- [x] `eval/package.json` + `eval/package-lock.json` (pinned `jstat@1.9.6`) + `.gitignore` entries for `eval/node_modules/` + the eval cache -- the eval-tree install surface
- [x] `eval/lz-eval-aggregate.test.mjs` -- Pass@1/Pass^k, false-uphold, Haiku-minus-Sonnet DELTA, library-wired Clopper-Pearson/Wilson anchors, mechanical lock-rule check (EVAL-02/04, D-06/D-07) -- 15/15 green
- [x] `eval/lz-eval-dataset.test.mjs` -- label remap, checksum fail-closed, gated-401 actionable error path (EVAL-01, D-04) -- 15/15 green
- [x] `eval/lz-eval-packaging-boundary.test.mjs` -- D-11 boundary (no deps under the plugin tree; no eval import from shipped runtime) -- 2/2 green
- [x] EDIT `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` -- RE-SCOPE the SC-2 test from a repo-root walk to a plugin-tree assertion (in-scope Phase-16-test edit) -- 39/39 green (re-scoped SC-2 included)
- [x] `eval/__fixtures__/` eval fixtures (offline JSONL samples + vote dirs + the known-answer CI anchors)
- [x] Framework install: `cd eval && npm install` (restores `jstat` from the committed lockfile); plugin tree needs none (`node:test` bundled) -- `eval/node_modules/jstat` restored

*node:test is built in -- no framework install needed for the plugin-tree test; the eval-tree tests need `jstat` restored via `npm install` under `eval/`.*

---

## Manual-Only / Live-Model Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The gating-eval RUN (voter false-uphold rate; Haiku-vs-Sonnet gate) | EVAL-02/03 | Requires live k>=5 model calls; non-deterministic; credit-bound | Staged `claude -p --permission-mode auto` per RESEARCH.md harness; feeds the deterministic aggregator |
| Voter behavior (attack-mode diversity, `disconfirming_query` present, source-independence) | VERIF-01/02/03 | Surfaced empirically by the eval; graded by an isolated LLM-rubric judge with an "Unknown" out | The eval harness run + the isolated per-dimension rubric judge (D-01) |
| Haiku-prompt technique efficacy | EVAL-05 | Prompt quality is surfaced empirically by the eval | The eval's Haiku-minus-Sonnet DELTA measures it |

*The deterministic aggregator over the live outputs IS unit-tested; the live run itself is gated by the
pre-registered lock rule, not a node:test.*

---

## Environment Availability

| Dependency | Required By | Available | Fallback |
|------------|-------------|-----------|----------|
| Node.js (`fetch`, `crypto`, `test`) | loader + aggregator + tests | YES (v24.13.0) | none needed |
| `npm` (for `eval/` install) | restoring `jstat` under `eval/` | YES (bundled with Node 24) | none |
| `jstat@1.9.6` (pinned, `eval/` only) | CI/interval + Pass@k math (D-07) | YES (verified install + anchors) | `@stdlib/stats-base-dists-beta-quantile@0.2.3` (heavier alt) |
| `hf` CLI + `HF_TOKEN` | gated fetch (LLM-AggreFact + AVeriTeC) | host `hf`; token UNKNOWN (user-provided) | WiCE/ExpertQA ungated -> closed-book SUBTLE gate runs without a token |
| `claude -p --permission-mode auto` | headless voter execution | YES (project-verified path) | none |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (7 automated, 3 legitimately manual-only)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (max run of manual is 2: 18-05-02/18-05-03, preceded by automated 18-05-01)
- [x] Wave 0 covers all MISSING references (incl. the `eval/` install surface + the re-scoped SC-2 edit) -- all created and green
- [x] No watch-mode flags
- [x] Feedback latency < 15s (deterministic suite runs ~0.5s wall)
- [x] `nyquist_compliant: true` set in frontmatter (flipped post-execution via /gsd:validate-phase)

**Approval:** validated 2026-06-16 -- 71/71 deterministic tests green; 3 manual-only rows genuinely exercised and documented above

---

## Validation Audit 2026-06-16

State A audit (existing VALIDATION.md). All four committed `.test.mjs` files re-run by explicit
file path (host `node --test <dir>` exit-1 quirk avoided): runtime aggregator 39/39, eval-aggregate
15/15, eval-dataset 15/15, packaging-boundary 2/2 -- **71/71 green, 0 fail**. The four inline
`node -e`/doc-assert rows (18-01-01, 18-02-02, 18-04-02, 18-05-01) were re-confirmed against the
committed artifacts (14 CITED tags + ASCII + stale-only-in-doc; `jstat@1.9.6` exact pin +
`.cache`/`node_modules` gitignored; NOTICE ODC-BY/MIT with AVeriTeC/LLM-AggreFact not vendored;
frozen vote contract present with no live `budget_tokens`/prefill + zero-dep). No new tests were
generated -- the plan's "Deterministic-testable surface" designates exactly the four committed
tests; the doc-asserts are inline guards by design and all pass. The three manual rows are
inherently non-automatable and were genuinely exercised: 18-02-03 (first `npm install`
human-verified; lockfile committed), 18-05-02 (live gating eval -> EVAL-03 raise; definitive k>=5
run relocated to Phase 19), 18-05-03 (owner settled the flag: PURSUE Haiku-first via the staged
pilot).

| Metric | Count |
|--------|-------|
| Gaps found (MISSING automated coverage) | 0 |
| Resolved (tests generated) | 0 |
| Escalated to manual-only | 0 (the 3 manual rows were manual-only by plan design, not escalated) |
| Automated-covered rows | 7 |
| Manual-only / live rows | 3 |
| Deterministic tests green | 71 / 71 |
