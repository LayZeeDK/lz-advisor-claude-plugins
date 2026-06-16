---
phase: 18
slug: haiku-prompt-engineering-deep-research-verify-voter-early-ga
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-16
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
| TBD (planner fills) | TBD | TBD | EVAL-* / VERIF-* / COST-02 / D-11 | TBD | TBD | unit / harness | `node --test <file>.test.mjs` | TBD | pending |

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

- [ ] `eval/package.json` + `eval/package-lock.json` (pinned `jstat@1.9.6`) + `.gitignore` entries for `eval/node_modules/` + the eval cache -- the eval-tree install surface
- [ ] `eval/lz-eval-aggregate.test.mjs` -- Pass@1/Pass^k, false-uphold, Haiku-minus-Sonnet DELTA, library-wired Clopper-Pearson/Wilson anchors, mechanical lock-rule check (EVAL-02/04, D-06/D-07)
- [ ] `eval/lz-eval-dataset.test.mjs` -- label remap, checksum fail-closed, gated-401 actionable error path (EVAL-01, D-04)
- [ ] `eval/lz-eval-packaging-boundary.test.mjs` -- D-11 boundary (no deps under the plugin tree; no eval import from shipped runtime)
- [ ] EDIT `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` -- RE-SCOPE the SC-2 test from a repo-root walk to a plugin-tree assertion (in-scope Phase-16-test edit)
- [ ] `eval/__fixtures__/` eval fixtures (offline JSONL samples + vote dirs + the known-answer CI anchors)
- [ ] Framework install: `cd eval && npm install` (restores `jstat` from the committed lockfile); plugin tree needs none (`node:test` bundled)

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (incl. the `eval/` install surface + the re-scoped SC-2 edit)
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter (flips post-execution via /gsd:validate-phase)

**Approval:** pending
