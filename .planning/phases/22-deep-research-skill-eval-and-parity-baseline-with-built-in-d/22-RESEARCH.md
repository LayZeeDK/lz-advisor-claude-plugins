# Phase 22: Deep-research skill eval + parity baseline with built-in /deep-research - Research

**Researched:** 2026-06-22
**Domain:** Holistic LLM-as-judge parity eval; AVeriTeC/WiCE/LLM-AggreFact gold; headless built-in baseline capture; the existing `eval/` harness reuse.
**Confidence:** HIGH (the methodology is settled in 22-CONTEXT.md; this research is implementation-readiness + the empirically-resolved D-14 feasibility gate, all from in-repo inspection of the cached AVeriTeC data + the existing eval modules + the verified headless docs.)

## Summary

The eval METHODOLOGY is already locked (22-CONTEXT.md D-01..D-20, converged via a research wave + a 5-lens Opus panel + an Opus/GPT-5.5/Gemini cross-family board). This research does two things: (1) RESOLVES the one deferred empirical unknown -- the D-14 AVeriTeC feasibility/representativeness gate -- by directly inspecting the cached `eval/.cache/chenxwh__AVeriTeC/data/dev.json` (500 items) + its evidence store; and (2) produces implementation-ready guidance (file layout, APIs to import, exact `claude -p` commands, pre-registration mechanics, the architectural-parity write-up source, and the PAR-* requirement family).

The headline finding: **Slice A is FEASIBLE as a deterministic, judge-free slice and clears a defensible pre-registered feasibility gate** -- the cached dev set yields 95 clean "Supported" (-> `unrefuted`) and 216 clean "Refuted" (-> `refuted`) items after a conservative report-shaped filter, so BOTH confusion-matrix directions are populatable (the prior closed-vs-open construct VOIDs from Phases 18-21 were a DIFFERENT failure: a closed-book gold directly grading an open-book live voter). The two unavoidable limits are honest, named PROVISIONAL caveats, not blockers: **every item is dated 2020** (a 2026 live-web voter is uniformly out-of-cutoff) and **the corpus is topically narrow** (34% US-2020-politics, 21% COVID). Therefore the recommended verdict is: **run Slice A as a small (n ~= 8-12, both directions) DESCRIPTIVE deterministic check via the verify-voter path, NOT a pass/fail cert, with the date-skew + topical-narrowness recorded as pre-registered PROVISIONAL limits** -- exactly the "report DESCRIPTIVELY, never pooled, per-confusion-matrix-direction" treatment D-11 already mandates. The D-14 fallback (downgrade Slice A to a calibration-probe) is NOT triggered.

**Primary recommendation:** Build the parity harness as ~5 new `eval/` modules that COMPOSE the existing dataset loader + MCC calibration gate + aggregate engine (never greenfield); capture the built-in `/deep-research` baseline headless via `claude -p "/deep-research <q>" --permission-mode auto --allowedTools "WebSearch,WebFetch" --output-format stream-json --verbose | tee` with `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0`; gate the Opus judge through `eval/lz-eval-mcc.mjs` over WiCE+LLM-AggreFact BEFORE it grades; pre-register the rubric + both question lists + the verdict-collapse map + the MCC bar + the resolved D-14 gate + the fallback in a frozen, timestamped lock-rule before any grading; run Slice A descriptively on the verify-voter path; and document the architectural-parity contrast from the published Anthropic docs/blog.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Eval framing & methodology**
- **D-01:** Holistic system-level LLM-as-judge parity eval; NOT a per-component Clopper-Pearson certification. (That bar exceeds the blessed reference's own and structurally VOIDED across Phases 18-21.)
- **D-02:** Two complementary tracks -- ARCHITECTURAL parity (documented) + MEASURED parity (graded). Both required.
- **D-03:** The Sonnet-default `lz-deep-research` skill ships regardless of the eval outcome. The eval produces confidence / an operating envelope, never a ship gate.

**Rubric & parity verdict**
- **D-04:** Rubric = Anthropic's five dimensions verbatim (factual/groundedness accuracy; citation accuracy; completeness/coverage; source quality; tool/process efficiency). Score each 0.0-1.0 with partial credit on atomic sub-claims, plus a derived pass/fail at a pre-registered threshold (default >= 0.7), plus an "Unknown" escape hatch (Unknown is not a pass). Per-dimension isolated judging.
- **D-05:** Two-layer verdict = an absolute quality FLOOR (the Sonnet skill must pass factual AND citation on every frozen question) + a comparative PARITY verdict. Neither alone suffices.
- **D-06:** Parity verdict = both-orderings pairwise win/tie/loss per (question x dimension x baseline); record a win/loss ONLY when both orderings agree, else TIE.
- **D-07:** Parity bar (pre-registered, holistic, NO statistics): PARITY iff (a) the absolute floor passes on all frozen questions AND (b) zero clear LOSS on factual or citation AND (c) no more than one clear LOSS total across the remaining dimensions. NO confidence intervals / Likert non-inferiority margins at n=2-3. Report raw per-cell verdicts, per-direction, never only the aggregate.

**Judge design (user-ratified)**
- **D-08:** A single OPUS judge. NO panel -- the only in-family panel partner is Sonnet, and Sonnet-judging-Sonnet is the near-lineage self-preference worst case AND biases toward our own Sonnet-driven candidate. The eval judge tier is independent of the skill's runtime cost profile.
- **D-09:** The advisor strategy (Sonnet-mostly / Opus-minimal) is a property of the SHIPPED SKILL AT RUNTIME, NOT a constraint on the eval or dev tooling. An Opus judge does not weaken the "near-Opus at Sonnet cost" claim. Pre-register a disclosure that the eval instrument is deliberately stronger and independent of the product's cost profile.
- **D-10:** Pre-registered judge debiasing protocol: blinding (strip system identity) + mandatory position-swap (win only if preferred in both orders) + reference-gold-anchoring of the factual dimension + k=3-5 multi-sample per item for SEM reporting; verdict pass at temp 0. Budget fallback (only if the Claude pool binds): Opus on the bias-critical factual+citation dims + Sonnet on the cheaper dims; NEVER a Sonnet judge on the factual dims.

**Gold anchoring (the deliberated fork -> board-converged synthesis)**
- **D-11:** Gold anchoring = a feasibility-gated TWO-SLICE design. Slice A (AVeriTeC, open-book) scores the report's key claim verdict-vs-gold DETERMINISTICALLY via the existing verify-voter path (NO judge), reported DESCRIPTIVELY (not a pass/fail cert); collapse the 4-way label to `unrefuted|refuted` (Supported->unrefuted, Refuted->refuted), EXCLUDE Conflicting/Cherry-picking (kappa noise), hold out NEI; honor `claim_date` cutoffs; report per-confusion-matrix-direction, never pooled. Slice A is included ONLY if it clears a pre-registered feasibility + ecological-representativeness gate. Slice B (natural research questions, BOTH systems, judge-graded) is the head-to-head measured parity.
- **D-12:** Claim-extraction bridge (adopted from the Gemini board member): for Slice B's factual/citation grading, the Opus judge FIRST extracts discrete claims + citations from each report, THEN scores each against the report's OWN cited evidence (citation-faithfulness; the VERIF-06 "claim supported by the quote" assurance). Closes the closed-book-calibration -> open-book-deployment transfer gap; ecologically valid (operates on the actual natural reports).
- **D-13:** Judge calibration: WiCE (MUST include `partially_supported` subtle-overreach items) + LLM-AggreFact (de-dup vs WiCE; verbatim-only), closed-book; gate the judge via the existing MCC machinery BEFORE it grades any report. An uncalibrated judge is a disqualifier, never a silent default.
- **D-14:** Fallback (pre-registered, frozen before grading): if AVeriTeC yield/representativeness is insufficient, degrade Slice A to a judge-calibration probe ("Slice B + Slice-A-as-calibration-probe"), NOT bare lean. The feasibility gate + downgrade rule are RESOLVED in `/gsd-plan-phase 22 --research` and FROZEN before any grading.

**Built-in baseline capture & architectural parity**
- **D-15:** The built-in `/deep-research` is a CLOSED-SOURCE bundled dynamic workflow (Claude Code v2.1.154+). Capture it headless: `claude -p "/deep-research <q>" --permission-mode auto --allowedTools "WebSearch,WebFetch" --output-format stream-json --verbose | tee`; set `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0`; no approval prompt, no mid-run input. Persist report.md + the workflow script + the `system/init` line (pin CC version + model) to a MANIFEST.
- **D-16:** Baseline protocol: n=2-3 frozen questions x k=2 runs each; grade BOTH runs, report per-run spread (never a hidden average); END-STATE grading (not process grading); capture per-run cost; pair lz vs built-in in the same reset window; never average across CC versions.
- **D-17:** The architectural-parity track is documented from the published docs + the dynamic-workflows blog (the built-in's source is closed -> flag the comparison as docs-grounded). The substantive contrast: the built-in votes on claims + adversarially cross-reviews but COLLAPSES uncertainty by deleting non-surviving claims; lz-deep-research PRESERVES uncertainty as first-class signal.

**Cost & validity constraints**
- **D-18:** ZERO out-of-family (Copilot/GPT/Gemini) model spend INSIDE the eval; gold comes only from free expert-labeled public datasets and never from the maintainer or a metered OOF model. The eval tree never ships (lives in `eval/` with its own `package.json`; jstat pinned in `eval/` only).
- **D-19:** Self-preference symmetric-cancellation is DEFENSIBLE-BUT-NOT-PROVEN: record it as an explicit threat-to-validity. "Claude grading Claude at n=2-3" is conceded as a defensible parity SCREEN, never a proof; the Opus judge + blind/swap/gold-anchor + the judge-free Slice A are the backstops.
- **D-20:** Pre-registration discipline: freeze the rubric + both question lists (Slice A seed list + Slice B natural set) + the verdict-collapse map + the judge-calibration MCC bar + the AVeriTeC feasibility-gate criteria + the fallback rule BEFORE any grading.

### Claude's Discretion
- The PAR-* requirement family is to be derived in `/gsd-plan-phase 22` (this research PROPOSES it below).
- Exact Slice B question topics, the final k (within 3-5), and the pass threshold (default 0.7) are pre-registration knobs the planner finalizes within the locked ranges.
- Whether to optionally drive the comparison through the skill-creator skill-eval/optimization workflow: NOT adopted for the parity grading (the bespoke `eval/` harness + existing machinery is the path); skill-creator remains available for description/trigger tuning only.

### Deferred Ideas (OUT OF SCOPE)
- The lz-deep-research workflow re-architecture (script + `Workflow scriptPath`) -- deferred to a later milestone.
- Release/publication (version bump / CHANGELOG / README / tag / GitHub Release) -- handled at `/gsd-complete-milestone` after `/gsd-audit-milestone`, NOT in this phase.
- Backlog (do NOT fold): `2026-06-17-relocate-non-distributable-lz-deep-research-test-fixtures` (packaging cleanup); `research-rtk-command-suitability-for-skills-and-agents` (keyword-matched only, unrelated).
</user_constraints>

<phase_requirements>
## Phase Requirements (PROPOSED PAR-* family -- planner ratifies in /gsd-plan-phase 22)

These map the 6 ROADMAP success criteria + the locked decisions onto a trackable requirement family. The planner finalizes IDs; this is the recommended set, one line each, with the research support that enables it.

| ID | Description | Research Support |
|----|-------------|------------------|
| **PAR-01** | A frozen, timestamped pre-registration (rubric + both question lists + verdict-collapse map + MCC bar + the RESOLVED D-14 gate + the fallback) is committed BEFORE any grading. | Mechanics in "Pre-registration mechanics" below; mirrors `eval/lz-eval-live-lock-rule.md` discipline. |
| **PAR-02** | The Opus judge is calibrated through the existing MCC machinery over WiCE (incl. `partially_supported`) + LLM-AggreFact (de-dup) and CLEARS the pre-registered MCC bar BEFORE grading any report; an uncalibrated judge is a disqualifier. | `eval/lz-eval-mcc.mjs` + `lz-eval-baseline-guard.mjs` + `lz-eval-dataset.mjs` (WiCE vendored, AVeriTeC fetch). |
| **PAR-03** | The built-in `/deep-research` baseline is captured headless (n=2-3 x k=2) into a gitignored run dir with a MANIFEST pinning the CC version + model from `system/init`, the workflow surface, and per-run cost; lz-deep-research is captured the same way in the same reset window. | "Headless built-in baseline capture" below; verified headless flags; `lz-eval-live-cert-driver.md` is the protocol model. |
| **PAR-04** | The Opus judge grades each report on the 5 Anthropic dimensions per-dimension-isolated, 0.0-1.0 + pass/fail (>=0.7 default) + "Unknown", using the claim-extraction bridge for factual/citation, with blinding + position-swap (win only if both orders agree) + k=3-5 multi-sample at temp 0. | D-04/D-10/D-12; the claim+citation extraction operates on the report's own cited evidence (VERIF-06 schema). |
| **PAR-05** | The two-layer verdict is emitted: the absolute quality FLOOR (Sonnet passes factual AND citation on every frozen question) + the comparative PARITY bar (D-07), reported as raw per-cell verdicts per-direction, never only the aggregate. | D-05/D-06/D-07; deterministic verdict assembler composing the judge outputs (off-model, like `lockRuleVerdict`). |
| **PAR-06** | Slice A (AVeriTeC, judge-free verify-voter verdict-vs-gold) runs DESCRIPTIVELY per-confusion-matrix-direction, honoring `claim_date` cutoffs and the collapse map, ONLY if it clears the PAR-01-frozen feasibility gate (RESOLVED FEASIBLE below); else the D-14 fallback (calibration-probe) applies. | The D-14 resolution below (95 clean Supported / 216 clean Refuted); the verify-voter path reuses the runtime aggregator's `verdict` enum. |
| **PAR-07** | The architectural-parity write-up documents the built-in's design (votes-on-claims + adversarial cross-review + drops non-survivors) vs lz-deep-research's preserve-uncertainty design, explicitly flagged docs-grounded (the built-in source is closed). | D-17; the published Anthropic multi-agent-research posts + dynamic-workflows docs; the lz schema's Contested/Unsupported + escalate + disconfirming-search design. |
| **PAR-08** | Every eval SCRIPT is code-reviewed AND covered by code-reviewed unit tests, and every PROMPT/REFERENCE that steers an LLM task (the judge rubric prompt, the claim-extraction prompt, the baseline-capture driver) is content-reviewed, BEFORE it drives an LLM task OR ships; the eval tree never ships (the one-directional eval -> runtime import boundary holds). | `.planning/PROJECT.md` "Review before use or publication"; mirrors OBG-09; the existing `*.test.mjs` co-file pattern. |

**Mapping to the 6 ROADMAP success criteria** (the planner should confirm against the ROADMAP Phase-22 section, which this research did not have direct line-item access to -- derive the SC list there and bind each SC to >=1 PAR-* in plan must_haves/truths): the canonical pairing is SC{architectural-parity}->PAR-07, SC{measured-parity}->PAR-03/04/05, SC{gold-anchoring}->PAR-02/06, SC{pre-registration}->PAR-01, SC{cost/validity}->PAR-08 + D-18 (no OOF spend), SC{honest-envelope-or-named-gap}->PAR-05 (the verdict can be "parity", "scoped parity", or an honest named gap; never a ship gate, D-03).
</phase_requirements>

## Architectural Responsibility Map

Pure reasoning step -- which "tier" owns each capability in this eval phase. (There is no web/app/db tier here; the tiers are the eval-pipeline layers, which is the load-bearing decomposition for plan task assignment.)

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Built-in `/deep-research` baseline capture | Claude Code session (`claude -p` subprocess) | gitignored run-dir on disk | The built-in is closed-source + runs as a background workflow; only a headless session can drive it. The session SPENDS (session pool); a `node` process cannot reach the workflow. |
| lz-deep-research capture (the candidate) | Claude Code session (`/lz-advisor:lz-deep-research`) | gitignored run-dir | Same: the skill orchestrates via the Agent tool, unavailable to bare `node`. |
| Opus judge grading (per-dimension, blind/swap/multi-sample, claim-extraction bridge) | Claude Code session (Agent tool, `model: opus`) | gitignored judge-output JSON | A JUDGMENT step -> must be a model. The SESSION drives the judge; the verdict is landed on disk for the deterministic assembler. NEVER `claude -p` for the judge (that is the dev/UAT harness only, per the live-cert driver). |
| Judge MCC calibration gate | `node` (off-model, deterministic) | the existing `eval/lz-eval-mcc.mjs` + dataset loader | The calibration METRIC is pure math over the judge's WiCE/LLM-AggreFact verdicts; the judge's verdicts are produced by the session, then SCORED off-model from disk (zero spend). |
| Slice A verdict-vs-gold (judge-free) | `node` (deterministic) + the verify-voter Agent path | the runtime `verdict` enum + the dataset loader's `unrefuted\|refuted` remap | D-11 mandates NO judge: the verify-voter casts votes (session), the verdict-vs-gold tally is off-model `node` math (the same `unrefuted\|refuted` cell logic in `lz-eval-mcc.mjs`/`lz-eval-aggregate.mjs`). |
| Two-layer verdict assembly (floor + parity bar) | `node` (deterministic, off-model) | the frozen pre-registration constants | Like `lockRuleVerdict`: the verdict is MECHANICAL so it cannot be rationalized post-hoc; reads the judge JSON + the frozen bar. |
| Pre-registration freeze | `node` (a frozen lock-rule `.md` + a constants module) + git | -- | Anti-result-shopping: freeze + timestamp + commit BEFORE grading. |
| Architectural-parity write-up | a `.md` reference (human/Claude-authored, content-reviewed) | the published Anthropic docs | Docs-grounded prose (the built-in source is closed); no model spend. |

## Standard Stack

This phase ships ZERO new runtime/distribution dependencies (the eval tree never ships -- SC-5 / D-18). The "stack" is the existing `eval/` toolchain + Claude Code's headless CLI + the cached gold datasets. There is NOTHING to `npm install` for the plugin; the only install surface is the already-pinned `eval/` dev dependency.

### Core (already present -- REUSE, do not re-add)
| Module / tool | Version | Purpose | Why standard |
|---------------|---------|---------|--------------|
| `eval/lz-eval-dataset.mjs` | in-repo | Dataset loader: WiCE remap to `unrefuted\|refuted`, AVeriTeC fetch-only, sha256 manifest verify, stratify | Already the canonical loader; exports `remapLabel`, `loadManifest`, `stratify`, `fetchDataset`, `WICE_LABEL_MAP`. |
| `eval/lz-eval-mcc.mjs` | in-repo | MCC + BCa lower-CI + label-permutation; the judge-calibration metric engine | D-13's "existing MCC machinery"; exports `matthewsCorrelation`, `mccFromPairs`, `bcaBootstrapLowerCI`, `labelPermutationTestMccPositive`, `MCC_BAR_POINT`/`MCC_CI_ALPHA`/`MCC_CI_LOWER_FLOOR`. |
| `eval/lz-eval-baseline-guard.mjs` | in-repo | Dual-baseline lexical/claim-only artifact guard; Mann-Whitney AUC | D-13 calibration backstop; exports `dualBaselineGuard`, `lexicalOverlapAuc`, `LEXICAL_AUC_CEILING`, `AT_CHANCE_MCC`. |
| `eval/lz-eval-aggregate.mjs` | in-repo | Clopper-Pearson / Wilson / Pass@k + `countFalseUpholds` + `lockRuleVerdict` + frozen `EVAL_THRESHOLDS` | The pattern for a deterministic, frozen-constant, mechanical verdict; reuse `countFalseUpholds` cell logic + the `lockRuleVerdict` shape for the two-layer parity verdict. |
| `eval/lz-eval-readjson.mjs` | in-repo | Fail-closed BOM-stripping JSON read | Every new module reads gold/judge JSON through it (the established convention). |
| `jstat` | 1.9.6 (pinned in `eval/package.json`) | All CI / quantile math | D-07: hand-rolling stats is FORBIDDEN; jstat is allowed ONLY under `eval/`. NO new math; the MCC module already wraps it. |
| Claude Code CLI (`claude -p`) | v2.1.154+ (built-in `/deep-research` present); the live host is on a later build | Headless baseline + candidate capture; headless judge is FORBIDDEN | Verified flags below. The MANIFEST pins the EXACT version from `system/init`. |
| `hf` CLI | globally installed | AVeriTeC fetch (already cached) + WiCE (vendored, no fetch) | `fetchDataset` shells `hf download ... --revision <sha>`; AVeriTeC is `repoType:'model'`, gated:false. Cache is ALREADY populated (verified below). |

### Supporting (new `eval/` modules to author -- COMPOSE the core)
| Module | Purpose | When to use |
|--------|---------|-------------|
| `eval/lz-eval-parity-judge.mjs` | The deterministic SCORING side of the Opus judge: parse the session-landed per-dimension judge JSON, apply the position-swap agreement rule, compute SEM over k samples, derive the per-cell win/tie/loss. NO model call (the session drives the judge; this scores from disk). | After each judge sample lands on disk. Co-test `lz-eval-parity-judge.test.mjs`. |
| `eval/lz-eval-parity-verdict.mjs` | The two-layer mechanical verdict (D-05/D-07): the absolute FLOOR + the PARITY bar, off-model, reading frozen constants. Mirrors `lockRuleVerdict`. | After all judge cells are scored. Co-test required. |
| `eval/lz-eval-judge-calibration.mjs` | Composes the dataset loader (WiCE + LLM-AggreFact, de-dup) + `mccFromPairs`/`bcaBootstrapLowerCI` to gate the judge's calibration verdicts vs gold against the pre-registered MCC bar. | Before any report grading (PAR-02). Co-test required. |
| `eval/lz-eval-sliceA-gold.mjs` | Loads + filters the AVeriTeC dev set to the clean Slice-A seed list (the resolved D-14 filter below), collapses 4-way -> `unrefuted\|refuted`, holds out NEI, excludes Conflicting/Cherry-picking, carries `claim_date`; emits the per-direction descriptive tally vs the verify-voter verdicts. | Slice A run (PAR-06). Co-test required. |
| `eval/lz-eval-baseline-manifest.mjs` | Writes/validates the MANIFEST (CC version + model from `system/init`, workflow surface, per-run cost, report.md path) for each captured run; fail-closed on a missing `system/init` model line. | After each `claude -p` capture (PAR-03). Co-test required. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Bespoke `eval/` harness | skill-creator skill-eval/optimization workflow | D-decision: NOT adopted for parity grading (the existing machinery is the path); skill-creator stays available for description/trigger tuning only. |
| Opus judge | Sonnet judge / a multi-model panel | D-08: forbidden -- Sonnet-judging-Sonnet is the self-preference worst case + biases toward our own candidate; no in-family panel partner but Sonnet. |
| `claude -p` for the judge | The Agent tool (`model: opus`) inside a session | The live-cert driver is explicit: `claude -p` is the dev/UAT harness, NOT a judge/voter transport. The judge is a SESSION-DRIVEN Agent dispatch landing JSON on disk. |
| Pooled cross-direction Slice A rate | Per-confusion-matrix-direction descriptive counts | D-11: never pooled; the Refuted-skew + date-cutoff make a pooled rate misleading. |

**Installation:** None for the plugin. The eval dev deps are already restored via `cd eval && npm install` (jstat 1.9.6 pinned; `eval/node_modules/` gitignored). The AVeriTeC + WiCE gold is already on disk (cache verified below). No new package to add.

**Version verification:** `eval/package.json` pins `jstat@1.9.6` (verified by reading the file). No new dependency is recommended, so no registry slopcheck is required (see Package Legitimacy Audit). The Claude Code CLI version is captured per-run from `system/init` into the MANIFEST -- it is data, not a dependency to pin in a manifest file.

## Package Legitimacy Audit

> This phase installs NO new external packages. The only eval dependency (`jstat@1.9.6`) is already pinned and in use across `lz-eval-mcc.mjs` / `lz-eval-aggregate.mjs` / `lz-eval-baseline-guard.mjs`.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `jstat` | npm | mature (1.9.6 long-stable) | high (established stats lib) | github.com/jstat/jstat | n/a (already vetted + in-tree, pinned) | Already approved (Phase 18-21); NOT re-installed |

**Packages removed due to slopcheck [SLOP] verdict:** none (no new packages).
**Packages flagged as suspicious [SUS]:** none.

*No slopcheck run was required: the phase adds zero new packages. If the planner later proposes any new `eval/` dependency, run the Package Legitimacy Gate at that point -- but the design here needs none (Node stdlib + the already-pinned jstat).*

## Architecture Patterns

### System Architecture Diagram

```
                                  PRE-REGISTRATION (PAR-01, frozen + timestamped + committed BEFORE grading)
                                  freeze: rubric | Slice-A seed list | Slice-B question set | collapse map
                                          | MCC bar | D-14 gate (RESOLVED) | fallback rule | judge protocol
                                                       |
                                                       v
   [gold datasets]                          [CALIBRATE THE JUDGE]  (PAR-02, MUST clear before any report grading)
   WiCE (vendored ODC-BY) ------+           session: Opus judge labels WiCE+LLM-AggreFact items (closed-book)
   LLM-AggreFact (fetch, dedup) +---------> -> verdicts land on disk -> node: lz-eval-judge-calibration.mjs
                                |             -> mccFromPairs + bcaBootstrapLowerCI vs the frozen MCC bar
                                |             -> CLEARS? yes -> judge is allowed to grade | no -> DISQUALIFIER (stop)
                                |
   AVeriTeC (cached, fetch-only)+--> [SLICE A: judge-free, descriptive] (PAR-06; runs iff D-14 gate cleared)
                                      lz-eval-sliceA-gold.mjs: filter -> collapse 4-way -> unrefuted|refuted
                                      -> per question: verify-voter Agent path casts votes -> node tally
                                      -> per-confusion-matrix-direction descriptive counts (NEVER pooled; honor claim_date)

   [CAPTURE BOTH SYSTEMS]  (PAR-03; same reset window; n=2-3 x k=2)
   Slice-B frozen questions
        |                                                       |
        v                                                       v
   claude -p "/deep-research <q>"  --allowedTools           claude -p "/lz-advisor:lz-deep-research <q>"
     "WebSearch,WebFetch" --output-format stream-json          --plugin-dir plugins/lz-advisor --permission-mode auto
     --verbose --permission-mode auto | tee                     ...| tee
        |  CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0                 |
        v                                                        v
   built-in report.md + system/init (CC ver+model) + cost    lz report.md (.lz-research/<run>/report.md) + cost
        \________________________  MANIFEST (lz-eval-baseline-manifest.mjs)  ________________________/
                                                       |
                                                       v
   [GRADE]  (PAR-04; session drives the Opus judge, per-dimension isolated, blind + position-swap + k=3-5 @ temp 0)
   For each (question x dimension x ordering): the Opus judge reads BOTH reports blinded.
   For factual/citation: the claim-extraction bridge (D-12) -- extract claims+citations from each report,
     score each vs the report's OWN cited evidence (VERIF-06 "claim supported by the quote").
   -> per-cell 0..1 + pass/fail + Unknown land on disk
                                                       |
                                                       v
   [SCORE + VERDICT]  (PAR-05; off-model node, mechanical)
   lz-eval-parity-judge.mjs: position-swap agreement (win iff both orders agree, else TIE) + SEM over k
   lz-eval-parity-verdict.mjs: (a) absolute FLOOR (Sonnet passes factual AND citation on EVERY question)
                               (b) PARITY bar D-07 (zero loss on factual/citation; <=1 loss elsewhere)
   -> verdict: PARITY | SCOPED-PARITY | NAMED-GAP  (never a ship gate -- D-03)
                                                       |
   [ARCHITECTURAL PARITY] (PAR-07, docs-grounded) -----+--> a reviewed .md: built-in (votes+adversarial+drops
                                                              non-survivors) vs lz (preserves uncertainty)
```
A reader traces the primary use case: freeze the pre-registration -> calibrate the judge (gate) -> capture both systems headless -> grade per-dimension with the claim-extraction bridge -> assemble the mechanical two-layer verdict; Slice A runs in parallel as the judge-free descriptive anchor.

### Recommended Project Structure
```
eval/
  lz-eval-dataset.mjs              # REUSE (WiCE/AVeriTeC loader)
  lz-eval-mcc.mjs                  # REUSE (MCC + BCa + permutation)
  lz-eval-baseline-guard.mjs       # REUSE (dual-baseline artifact guard)
  lz-eval-aggregate.mjs            # REUSE (CP/Wilson/Pass@k + lockRuleVerdict shape)
  lz-eval-readjson.mjs             # REUSE (fail-closed JSON read)
  lz-eval-parity-judge.mjs         # NEW: score session-landed judge JSON (position-swap, SEM)
  lz-eval-parity-verdict.mjs       # NEW: the two-layer mechanical verdict (floor + parity bar)
  lz-eval-judge-calibration.mjs    # NEW: gate the judge via MCC over WiCE+LLM-AggreFact
  lz-eval-sliceA-gold.mjs          # NEW: AVeriTeC filter + collapse + per-direction descriptive tally
  lz-eval-baseline-manifest.mjs    # NEW: MANIFEST writer/validator (CC ver+model, cost, report path)
  lz-eval-parity-prereg.md         # NEW: the frozen pre-registration (rubric + lists + bars + D-14 gate + fallback)
  lz-eval-parity-driver.md         # NEW: the session-driven capture+grade protocol (the lz-eval-live-cert-driver.md analog)
  <every NEW .mjs has a co-located *.test.mjs>            # PAR-08 (review + code-reviewed tests)
  __fixtures__/                    # REUSE (wice-vendored, lz-eval-manifest.json) + NEW slice-A seed fixture
  .cache/                          # gitignored: AVeriTeC (populated), LLM-AggreFact (fetch at eval time),
                                   #   p22-baseline/ (the captured built-in + lz reports + MANIFESTs)
plugins/lz-advisor/...             # UNCHANGED -- this phase touches NO shipped runtime (D-decision out-of-scope)
```

### Pattern 1: Session drives the model; node scores from disk (the load-bearing transport split)
**What:** The Opus judge, the verify-voter (Slice A), and the baseline/candidate capture are SESSION operations (Agent tool / `claude -p`), drawing the Claude session pool. The deterministic scoring/verdict/calibration is a bare `node` process reading the landed JSON -- ZERO spend.
**When to use:** Every spend boundary in this eval.
**Example:**
```
// Source: eval/lz-eval-live-cert-driver.md "Why the node engine NEVER spawns voters"
// A bare `node` process has NO access to the Agent tool. So callJudge / callVoter / capture
// are SESSION-DRIVEN; node SCORES FROM DISK (zero spend). Only an external CLI (Copilot) would be
// node-wireable -- and that is FORBIDDEN here (D-18, zero OOF spend).
```

### Pattern 2: Frozen-constant mechanical verdict (anti-result-shopping)
**What:** The parity bar + the MCC bar + the floor live as `Object.freeze`d module-level literals, chosen and committed BEFORE grading. The verdict function is pure and deterministic.
**When to use:** PAR-01/PAR-02/PAR-05.
**Example:**
```javascript
// Source: eval/lz-eval-aggregate.mjs (lockRuleVerdict) + lz-eval-mcc.mjs (MCC_BAR_POINT)
// The verdict is mechanical so the parity call cannot be rationalized post-hoc.
export const PARITY_BAR = Object.freeze({
  FLOOR_DIMS: Object.freeze(['factual', 'citation']),   // must pass on EVERY question (D-05)
  MAX_LOSS_FLOOR_DIMS: 0,                                 // zero clear loss on factual/citation (D-07b)
  MAX_LOSS_OTHER_DIMS: 1,                                 // <= 1 clear loss across the rest (D-07c)
  PASS_THRESHOLD: 0.7,                                    // D-04 default (a pre-registration knob)
});
```

### Pattern 3: Position-swap agreement (judge debiasing)
**What:** Each pairwise comparison is run in BOTH orderings (lz-first, built-in-first). A win/loss is recorded ONLY when both orderings agree; disagreement -> TIE (D-06).
**When to use:** Every Slice-B pairwise cell (PAR-04/PAR-05).
**Example:**
```javascript
// Source: D-06/D-10; scored in lz-eval-parity-judge.mjs (off-model)
function cellVerdict(orderAB, orderBA) {        // each is 'lz' | 'builtin' | 'tie'
  if (orderAB === 'lz' && orderBA === 'lz') return 'lz-win';
  if (orderAB === 'builtin' && orderBA === 'builtin') return 'builtin-win';
  return 'tie';                                  // disagreement = position bias = TIE
}
```

### Anti-Patterns to Avoid
- **Using `claude -p` to drive the judge or the verify-voter:** it is the dev/UAT harness ONLY (per `lz-eval-live-cert-driver.md`). The judge + voter are SESSION-DRIVEN Agent dispatches.
- **Pooling Slice A across confusion-matrix directions:** D-11 forbids it; the Refuted-skew + 2020 date make a pooled rate misleading.
- **A Sonnet judge on the factual/citation dimensions:** D-10 forbids it even under the budget fallback (Opus stays on the bias-critical dims).
- **Any out-of-family (Copilot/GPT/Gemini) model call inside the eval:** D-18 absolute prohibition; gold comes only from the free expert datasets.
- **Hand-rolling CI/quantile math:** D-07 forbids it; route through the pinned jstat via the existing MCC/aggregate modules.
- **Hidden averaging across runs or CC versions:** D-16 -- report per-run spread; never average across CC versions (the MANIFEST pins each run's version).
- **Treating the verdict as a ship gate:** D-03 -- the Sonnet skill ships regardless; the output is confidence / an operating envelope / an honest named gap.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MCC / confusion-matrix cell logic | A fresh confusion-matrix tally | `mccFromPairs` / `matthewsCorrelation` in `lz-eval-mcc.mjs` | Already handles the degenerate single-class -> 0 (not NaN) case + the frozen `unrefuted\|refuted` enum. |
| One-sided lower-CI on the calibration MCC | A bootstrap by hand | `bcaBootstrapLowerCI` in `lz-eval-mcc.mjs` | BCa bias-correction routes through jstat (D-07); seeded deterministic resampling already implemented. |
| WiCE label remap to `unrefuted\|refuted` | A new remap table | `remapLabel` / `WICE_LABEL_MAP` in `lz-eval-dataset.mjs` | `partially_supported -> refuted` (the SUBTLE substratum) is already the frozen, tested mapping. |
| Dataset fetch + sha256 integrity | A curl + manual hash | `fetchDataset` / `verifySha256` / `loadManifest` in `lz-eval-dataset.mjs` | Pinned-revision fetch, fail-closed checksum, per-source `--repo-type`, gated-token pre-flight all done. |
| Fail-closed JSON read | `JSON.parse` inline | `readJson` in `lz-eval-readjson.mjs` | BOM strip + ContractError discipline; the whole eval tree uses it. |
| Lexical-artifact guard for the calibration set | A new TF-IDF baseline | `dualBaselineGuard` / `lexicalOverlapAuc` in `lz-eval-baseline-guard.mjs` | The truth-value-not-lexically-readable check is already implemented + tested. |
| The mechanical verdict shape | A bespoke pass/fail | The `lockRuleVerdict` pattern in `lz-eval-aggregate.mjs` | Frozen-constant, pure, deterministic -- the anti-result-shopping idiom this project enforces. |
| Per-run cost extraction | Parsing stream-json by hand for cost | `claude -p ... --output-format json` carries `total_cost_usd` + a per-model breakdown | Verified in the headless docs; capture both stream-json (for the report + `system/init`) and the cost field. |

**Key insight:** This phase is ~80% composition of proven, frozen, tested machinery. The genuinely new code is small: parse the judge JSON, apply the position-swap rule, assemble the two-layer verdict, write/validate the MANIFEST, and filter the AVeriTeC set. Everything statistical or gold-loading already exists.

## D-14 RESOLUTION: AVeriTeC Slice-A Feasibility Gate (the #1 deliverable)

> Resolved by direct inspection of the on-disk cache (`eval/.cache/chenxwh__AVeriTeC/data/dev.json`, 500 items, + the JSONL evidence store `data_store/dev_top_3_rerank_qa.json`, 500 records). All counts below are reproducible from that cache. `[VERIFIED: in-repo cache inspection 2026-06-22]`.

### (a) Usable Slice-A "research-question" items (report-shaped, not answer-leaking)

The cached dev set has 500 items with fields: `claim`, `label` (4-way), `justification` (gold rationale), `claim_date`, `speaker`, `fact_checking_article`, `questions` (QA evidence), and `reporting_source`.

Collapsing per D-11 (Supported -> `unrefuted`, Refuted -> `refuted`, EXCLUDE Conflicting/Cherry-picking, HOLD OUT NEI) and applying a CONSERVATIVE "report-shaped + non-leaking" filter (no 1st/2nd-person pronoun -> drops debate soundbites; <= 1 sentence-ending punctuation -> single proposition; 45-220 chars; claim text contains no verdict-leaking token like false/fake/hoax/debunk/fact-check):

| Collapsed cell | Raw label | Raw count | Clean (report-shaped, non-leaking) |
|----------------|-----------|-----------|-------------------------------------|
| `unrefuted` | Supported | 122 | **95** |
| `refuted` | Refuted | 305 | **216** |
| EXCLUDED | Conflicting Evidence/Cherrypicking | 38 | -- (kappa noise; excluded per D-11) |
| HELD OUT | Not Enough Evidence (NEI) | 35 | -- (held out per D-11) |

Answer-leak control: the `claim` text itself rarely leaks the verdict (only 10/500 contain false/fake/hoax/debunk/myth/misleading), and the leaky fields (`justification`, `fact_checking_article`) are NEVER passed to the verify-voter -- Slice A passes the voter only the claim + the date cutoff, scoring its verdict vs the held-back gold label. So answer-leak is controllable by construction.

### (b) Supported-vs-Refuted skew -> can BOTH confusion-matrix directions be populated?

**YES.** With 95 clean Supported and 216 clean Refuted, both directions are populatable far above any small-n need:
- `unrefuted` direction (catch a true claim as unrefuted; the TP/FN axis): 95 available.
- `refuted` direction (catch a false claim as refuted; the TN/FP axis): 216 available.

The corpus is Refuted-skewed (61% Refuted overall), but the Supported cell is NOT scarce at the small n D-11 contemplates. This is the decisive difference from the Phase 18-21 VOIDs: those failed because a CLOSED-book gold was used to directly grade an OPEN-book live voter (a construct mismatch), AND because the positive-control cell collapsed under a strict OOF entailment screen. Slice A here is NOT that: it is a DESCRIPTIVE, judge-free verdict-vs-gold check reported per-direction, with no pass/fail cert and no OOF screen.

### (c) Date-cutoff exposure (a 2026 voter on a 2020 claim)

**Uniform 2020 exposure -- a real, named limit.** ALL 500 items carry a `claim_date` and EVERY ONE parses to year 2020 (verified: `distinct claim years: ['2020']`). A 2026 live-web verify-voter is therefore out-of-cutoff for the ENTIRE slice: the web has moved on, fact-check articles have been updated/archived, and some 2020-true claims may read differently in 2026. D-11 already mandates honoring `claim_date` cutoffs; in practice that means: (1) pass the `claim_date` into the voter prompt as the "as-of" frame so the voter judges the claim as-of 2020, and (2) record the date skew as a pre-registered PROVISIONAL limit on Slice A's descriptive read. This does NOT block Slice A -- it scopes it.

### (d) Concrete PRE-REGISTERED feasibility gate threshold

Freeze this gate in the pre-registration (PAR-01) BEFORE any grading:

```
SLICE_A_FEASIBILITY_GATE (pre-registered, frozen):
  Slice A RUNS as a deterministic descriptive slice IFF, from the cached AVeriTeC dev set,
  after the collapse map (Supported->unrefuted, Refuted->refuted; exclude Conflicting/Cherrypicking;
  hold out NEI) and the report-shaped+non-leaking filter:
    - clean unrefuted (Supported) items  >=  N_SUP_MIN  (set N_SUP_MIN = 8)
    - clean refuted   (Refuted)   items  >=  N_REF_MIN  (set N_REF_MIN = 8)
    - BOTH directions populated (so the confusion matrix is two-sided, not falsehood-only)
  Observed: clean Supported = 95 (>= 8 OK), clean Refuted = 216 (>= 8 OK), both populated -> GATE CLEARS.
  PROVISIONAL limits recorded with the slice (do NOT block; scope the read):
    - uniform 2020 claim_date (out-of-cutoff for a 2026 voter; voter judges "as-of 2020")
    - topical narrowness (34% US-2020-politics, 21% COVID) -> NOT a representative cross-section of
      general research questions; Slice A speaks to fact-check-style claims, not Slice B's natural breadth.
  Slice-A SIZE for the run: a small balanced descriptive sample (recommend ~8-12 PER DIRECTION, the
    planner finalizes within the pre-registration), DETERMINISTICALLY selected (sorted by claim_id),
    reported per-direction, NEVER pooled.
```

### Verdict

**Slice A is FEASIBLE as a deterministic, judge-free, DESCRIPTIVE slice and CLEARS the pre-registered gate** (95 clean Supported >> 8; 216 clean Refuted >> 8; both directions populatable). The D-14 fallback (downgrade Slice A to a calibration-probe) is NOT triggered. The two honest limits -- uniform 2020 dating and topical narrowness (US-politics/COVID-heavy) -- are recorded as PRE-REGISTERED PROVISIONAL caveats that SCOPE Slice A's descriptive read (it characterizes the verify-voter on fact-check-style 2020 claims, not on Slice B's general research breadth). This treatment is exactly what D-11 already specifies ("reported DESCRIPTIVELY, not a pass/fail cert; per-confusion-matrix-direction; honor claim_date; never pooled"). The hybrid-construct ("natural-sounding yet AVeriTeC-pinned") path stays INFEASIBLE (the 22-CONTEXT.md "Specific Ideas" already ruled it out) -- the two explicit slices are the design.

## Implementation Guidance

### 1. The eval harness layout (composition over greenfield)

- Author the 5 NEW `eval/*.mjs` modules listed in "Recommended Project Structure", each importing the existing core. The cross-tree import convention is ALREADY established: `import { ContractError, safeId, listJson } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs'` (one-directional eval -> runtime; NEVER add an eval import to any plugin-tree file). `jstat` is reached only via the MCC/aggregate modules.
- The eval tree NEVER ships (SC-5). It already lives outside `plugins/`, has its own `eval/package.json` (`private:true`, `license:UNLICENSED`), and `eval/.cache/` + `eval/node_modules/` are gitignored (verified). The packaging-boundary test `eval/lz-eval-packaging-boundary.test.mjs` already enforces this; extend it to cover the new modules if it enumerates files.
- ASCII-only sources (no BOM), explicit UTF-8 + LF, `path.join`, no shell globbing -- the in-tree convention (CLAUDE.md + every existing module's header).
- Every new module gets a co-located `*.test.mjs` (PAR-08). Run tests on the EXPLICIT file form, not a directory, because `node --test <dir>` spuriously exits 1 on this host (MEMORY: `node --test dir exits 1 quirk`): `node --test eval/lz-eval-parity-verdict.test.mjs`.

### 2. Headless built-in `/deep-research` baseline capture (D-15/D-16)

Verified headless facts (from `code.claude.com/docs/en/headless`, fetched 2026-06-22):
- Slash commands work in `-p` mode (`include /skill-name in the prompt string and Claude Code expands it`), v2.1.181+ for `/config` but skill/command expansion is general.
- `--output-format stream-json --verbose` streams events; the FIRST event is `system/init` carrying `model`, `tools`, and the loaded `plugins`/`plugin_errors` -- the source for the MANIFEST's CC-version+model pin.
- `--output-format json` carries `total_cost_usd` + a per-model cost breakdown -- the source for per-run cost (D-16).
- `--allowedTools "WebSearch,WebFetch"` auto-approves those tools (comma-separated, permission-rule syntax).
- `--permission-mode auto` is the classifier-gated mode (NOT `acceptEdits`, which denies the skill launch -- CLAUDE.md headless gotcha).
- The built-in `/deep-research` runs as a BACKGROUND workflow/subagent; `claude -p` waits for background subagents/workflows, capped by `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS` (default 10 min from v2.1.182). Set it to `0` to wait without a limit (a long deep-research run can exceed 10 min).
- NEVER put an `@file` mention in the `-p` prompt (CLAUDE.md headless gotcha: it breaks slash-command auto-trigger). Reference questions inline as prose.

Exact capture invocation (one per question x run; n=2-3 questions x k=2 runs, same reset window):
```bash
# Built-in baseline (closed-source workflow). Run from a scratch CWD; tee to the gitignored run dir.
CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0 \
  claude -p "/deep-research <frozen Slice-B question, inline prose>" \
  --permission-mode auto \
  --allowedTools "WebSearch,WebFetch" \
  --output-format stream-json --verbose \
  | tee "eval/.cache/p22-baseline/builtin/<qid>-run<k>.stream.jsonl"
```
- Extract `report.md` (the END-STATE deliverable) from the captured stream (the final assistant message / result), NOT the process trace -- END-STATE grading per D-16.
- Capture `system/init` (CC version + model) from the first stream line; capture cost via a parallel/secondary `--output-format json` field OR by parsing the result event's usage. Persist all three (report + system/init + cost) + the workflow surface note ("built-in `/deep-research`, closed-source, captured headless") into the MANIFEST via `lz-eval-baseline-manifest.mjs`.
- The lz candidate is captured the SAME way, in the SAME reset window, with `--plugin-dir plugins/lz-advisor` added and the prompt `/lz-advisor:lz-deep-research <question>` (its `report.md` lands in `.lz-research/<run-id>/report.md`; copy it into the baseline run dir or MANIFEST-reference it).
- The `lz-eval-live-cert-driver.md` is the PROTOCOL MODEL for this session-driven capture document (`lz-eval-parity-driver.md`): same "session drives spend, node scores from disk" discipline, same transport prohibitions, minus the OOF transport (forbidden here).

### 3. The Opus judge harness (D-08/D-10/D-12)

- The judge is a SESSION-DRIVEN Agent dispatch with `model: opus`, temp 0, per-dimension ISOLATED (one dimension per call -> avoids halo). It lands a per-(question x dimension x ordering x sample) JSON record on disk: `{ dimension, ordering, sample, score: 0..1, verdict: 'pass'|'fail'|'unknown', preferred: 'A'|'B'|'tie', notes }`.
- Blinding: strip system identity from both reports before the judge sees them (label them only "Report A" / "Report B"); randomize A/B assignment per ordering.
- Position-swap: run BOTH orderings; `lz-eval-parity-judge.mjs` records a win ONLY if both orderings agree (Pattern 3), else TIE.
- Multi-sample: k=3-5 per cell (the planner picks k within 3-5); `lz-eval-parity-judge.mjs` computes the SEM over samples for reporting (NOT a CI gate at n=2-3 -- D-07 forbids stats).
- The claim-extraction bridge (D-12) for the factual + citation dimensions: the judge FIRST extracts discrete claims + their inline citations from EACH report, THEN scores each claim against the report's OWN cited evidence (citation-faithfulness = VERIF-06's "claim supported by the quote" / `claim_support` assurance). This is ecologically valid (operates on the actual natural reports) and closes the closed-book-calibration -> open-book-deployment transfer gap. It does NOT need external gold for Slice B -- it scores each report against what that report itself cites.
- Budget fallback (only if the Claude pool binds): Opus on factual+citation; Sonnet on the cheaper dims (completeness, source quality, tool/process efficiency). NEVER a Sonnet judge on factual/citation (D-10).
- The judge RUBRIC PROMPT and the claim-extraction PROMPT are LLM-steering prompts -> content-reviewed before they drive any grading (PAR-08).

### 4. The MCC judge-calibration gate (D-13)

- `lz-eval-judge-calibration.mjs` composes: `loadManifest` + the WiCE vendored fixtures + an LLM-AggreFact fetch (de-dup vs WiCE -- LLM-AggreFact embeds WiCE; drop any uid already in the WiCE set), all CLOSED-BOOK, MUST include WiCE `partially_supported` (the SUBTLE substratum, mapped to `refuted` by `remapLabel`).
- The session has the Opus judge label each calibration item (closed-book entailment: does the evidence entail the claim -> `unrefuted`, else `refuted`); the verdicts land on disk.
- `node`: `mccFromPairs({ verdicts, gold })` -> `bcaBootstrapLowerCI({ verdicts, gold })` -> compare to the pre-registered MCC bar. Reuse `MCC_BAR_POINT` (0.5) / `MCC_CI_ALPHA` (0.05) / `MCC_CI_LOWER_FLOOR` (0) as the DEFAULT bar (already frozen in `lz-eval-mcc.mjs`), or pre-register a phase-specific bar in the lock-rule. Optionally run `dualBaselineGuard` over the calibration pairs to confirm the calibration set is not lexically separable (an artifact check).
- GATE: the judge may grade reports ONLY if it clears the MCC bar. An uncalibrated judge is a DISQUALIFIER (PAR-02) -- stop, do not silently grade.
- LLM-AggreFact license is CC-BY-ND (verbatim-only) -> fetch-only into the gitignored cache, never commit its text (the loader's fetch-only path already enforces this for the non-vendored corpora). De-dup is mandatory (WiCE is embedded in LLM-AggreFact).

### 5. Pre-registration mechanics (D-20)

- Author `eval/lz-eval-parity-prereg.md` (the `lz-eval-live-lock-rule.md` analog) freezing, with a TIMESTAMP, BEFORE any grading: (i) the 5-dimension rubric verbatim + the per-dimension scoring rule (0..1 + pass/fail @ >=0.7 default + Unknown); (ii) the Slice-A seed list (the deterministic claim_ids selected by the resolved filter) + the Slice-B natural question set (n=2-3, the planner finalizes topics within the locked range); (iii) the verdict-collapse map (Supported->unrefuted, Refuted->refuted, exclude Conflicting/Cherry-picking, hold out NEI); (iv) the judge-calibration MCC bar; (v) the SLICE_A_FEASIBILITY_GATE (RESOLVED FEASIBLE above) + the D-14 fallback rule; (vi) the two-layer parity bar (D-05/D-07) + k + the disclosure that the eval instrument (Opus judge) is deliberately stronger and independent of the product's cost profile (D-09) + the self-preference symmetric-cancellation threat-to-validity (D-19).
- Mirror the frozen NUMBERS as `Object.freeze`d module-level literals (in `lz-eval-parity-verdict.mjs` + the calibration module), and have a co-test assert the lock-rule prose matches the constants byte-for-byte (the anti-drift pattern from `lz-eval-aggregate.mjs` <-> `lz-eval-lock-rule.md`).
- Commit the pre-registration + the constants BEFORE the first grading spend (a separate commit, timestamped). A pre-registered CONDITIONAL branch resolved pre-grade (the D-14 gate, now RESOLVED) is valid pre-registration, not result-shopping (D-14 explicit).
- The decision-coverage gate (MEMORY: `gsd-decision-coverage-gate-format`): cite D-NN in plan must_haves/truths as bare `**D-NN:**` bullets so they are trackable.

### 6. The architectural-parity write-up (D-17)

- Author a reviewed `.md` (e.g. `eval/lz-eval-parity-architecture.md` or a `.planning/` artifact) documenting the contrast, EXPLICITLY flagged docs-grounded (the built-in source is closed -- verified absent from all public Anthropic repos per 22-CONTEXT.md). Sources: the published Anthropic posts (multi-agent-research-system, built-multi-agent-research-system, demystifying-evals) + the `code.claude.com/docs/en/workflows` dynamic-workflows page.
- The substantive contrast (from D-17 + the lz schema):
  - **Built-in `/deep-research`:** votes on claims + adversarial cross-review, but COLLAPSES uncertainty by DELETING non-surviving claims (the surviving set is presented as settled).
  - **lz-deep-research:** PRESERVES uncertainty as first-class signal -- `Contested` and `Unsupported` are first-class confidence tiers (the tally rubric NEVER deletes a claim, "downgrade-not-delete"); non-unanimity routes to human abstention; the verify-voter runs an explicit DISCONFIRMING search (VERIF-02); corroboration is weighted by SOURCE INDEPENDENCE not raw count (VERIF-03); the two assurances (`quote_fidelity` mechanical vs `claim_support` judgment) are never conflated (VERIF-06).
- This is prose, no model spend; content-reviewed before publication (PAR-08).

## Runtime State Inventory

> Not a rename/refactor/migration phase -- this section is N/A. This phase adds eval modules + captures eval data; it changes NO shipped runtime, no stored data keys, no OS-registered state, no secrets, and produces no shipped build artifacts. (The gitignored `eval/.cache/p22-baseline/` run dir + `.lz-research/` runs are eval scratch, not runtime state to migrate.)

## Common Pitfalls

### Pitfall 1: Re-litigating the closed-vs-open construct VOID
**What goes wrong:** Treating Slice A as another closed-book-gold-grades-open-book-voter cert (the Phase 18-21 VOID) and either over-engineering a CP cert or declaring it infeasible.
**Why it happens:** The Phase 18-21 history is dominated by that VOID, so the reflex is to apply the same suspicion.
**How to avoid:** Slice A is JUDGE-FREE and DESCRIPTIVE -- a verdict-vs-gold tally reported per-direction, NOT a pass/fail cert and NOT an OOF entailment screen. The construct-validity principle (closed-book gold may calibrate the judge but must not directly grade an open-book report) is honored: the closed-book gold (WiCE/LLM-AggreFact) calibrates the JUDGE (D-13); AVeriTeC's open-book gold scores the open-book verify-voter descriptively (D-11). Different roles, no mismatch.
**Warning signs:** Any plan task computing a Clopper-Pearson bound or a pass/fail certificate on Slice A.

### Pitfall 2: `acceptEdits` (or `dangerously-skip-permissions`) for the headless capture
**What goes wrong:** `--permission-mode acceptEdits` DENIES the skill launch (Skill tool returns is_error) and blocks non-git Bash; the capture silently fails or runs the wrong system.
**How to avoid:** Use `--permission-mode auto` (classifier-gated, sufficient). CLAUDE.md headless gotcha, validated in Phase 2 + Phase 8.
**Warning signs:** The captured stream shows a Skill-tool `is_error` or a missing report.

### Pitfall 3: Marketplace lz-advisor shadowing the working-tree build during capture
**What goes wrong:** The user-scope marketplace `lz-advisor` competes with the `--plugin-dir` working tree; you silently grade the published version instead of the source under test.
**How to avoid:** This repo's committed `.claude/settings.json` already disables the marketplace build here (`enabledPlugins: { "lz-advisor@lz-advisor-claude-plugins": false }`). Capture lz from THIS repo's CWD (or an explicit `--plugin-dir`), and verify via the `system/init` `plugins` array in the stream (NOT model self-report -- MEMORY: `per-project-plugin-disable`).
**Warning signs:** `system/init` shows a marketplace plugin path instead of the working-tree path.

### Pitfall 4: Background-wait timeout truncating the built-in capture
**What goes wrong:** The built-in `/deep-research` runs > 10 min; with the default `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS` (10 min, v2.1.182+), `claude -p` returns before the workflow finishes -> a truncated/empty report.
**How to avoid:** Set `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0` (wait without limit) for the capture (D-15).
**Warning signs:** A short/empty captured report; the stream ends mid-workflow.

### Pitfall 5: Nested `claude -p` exhausting the shared 5-hour session pool
**What goes wrong:** The capture runs (built-in x n x k + lz x n x k) + the judge grading all draw the SAME 5-hour session pool; a multi-run capture can hit `out_of_credits` (HTTP 429) mid-eval.
**How to avoid:** Budget across reset windows; pair lz-vs-built-in for the SAME question in the SAME reset window (D-16); checkpoint captured reports + MANIFESTs to disk so a 429 mid-eval is resumable (re-grade from disk, re-capture only the missing runs). CLAUDE.md headless gotcha.
**Warning signs:** A 429 / `out_of_credits` partway through.

### Pitfall 6: `node --test <dir>` spurious exit 1
**What goes wrong:** Running the new tests as a directory yields a false failure on this host.
**How to avoid:** Gate on the explicit `.test.mjs` file form (MEMORY: `node --test dir exits 1 quirk`). Recurs for every node:test in this repo.

## Code Examples

### Reusing the confusion-matrix cell logic for Slice A (off-model, judge-free)
```javascript
// Source: eval/lz-eval-mcc.mjs (mccFromPairs cell mapping) -- Slice A reuses the SAME unrefuted|refuted cells.
// SUPPORTED gold ('unrefuted') + unrefuted verdict -> TP ; REFUTED gold + refuted verdict -> TN
// REFUTED gold + unrefuted verdict -> FP (false-uphold) ; SUPPORTED gold + refuted verdict -> FN (over-refusal)
// Slice A reports these FOUR cells PER DIRECTION descriptively (never pooled, no CP cert).
import { mccFromPairs } from './lz-eval-mcc.mjs';
const { tp, tn, fp, fn } = mccFromPairs({ verdicts, gold });  // verdicts from the verify-voter; gold from AVeriTeC collapse
```

### The two-layer mechanical verdict shape
```javascript
// Source: eval/lz-eval-aggregate.mjs (lockRuleVerdict) -- the same pure, frozen-constant idiom.
// PARITY iff (a) floor passes on EVERY question AND (b) 0 loss on factual/citation AND (c) <=1 loss elsewhere.
export function parityVerdict({ floorPassByQuestion, lossByDimension }) {
  const floorPasses = Object.values(floorPassByQuestion).every(Boolean);          // D-05 absolute floor
  const floorDimLosses = PARITY_BAR.FLOOR_DIMS.reduce((s, d) => s + (lossByDimension[d] || 0), 0);
  const otherLosses = Object.entries(lossByDimension)
    .filter(([d]) => !PARITY_BAR.FLOOR_DIMS.includes(d))
    .reduce((s, [, n]) => s + n, 0);
  if (floorPasses && floorDimLosses === PARITY_BAR.MAX_LOSS_FLOOR_DIMS && otherLosses <= PARITY_BAR.MAX_LOSS_OTHER_DIMS) {
    return 'PARITY';
  }
  return floorPasses ? 'SCOPED-PARITY-OR-NAMED-GAP' : 'NAMED-GAP';   // never a ship gate (D-03)
}
```

### Calibrating the judge through the existing MCC machinery
```javascript
// Source: eval/lz-eval-mcc.mjs -- gate the judge BEFORE it grades (D-13 / PAR-02).
import { mccFromPairs, bcaBootstrapLowerCI, MCC_BAR_POINT, MCC_CI_LOWER_FLOOR } from './lz-eval-mcc.mjs';
const { mcc } = mccFromPairs({ verdicts: judgeCalibVerdicts, gold: calibGold });   // closed-book WiCE+LLM-AggreFact
const lowerCI = bcaBootstrapLowerCI({ verdicts: judgeCalibVerdicts, gold: calibGold });
const judgeCleared = mcc >= MCC_BAR_POINT && lowerCI > MCC_CI_LOWER_FLOOR;          // else DISQUALIFIER -> stop
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-component Clopper-Pearson certification of the verify-voter | Holistic system-level LLM-as-judge parity eval | Phase 22 (D-01) | The CP bar exceeded the blessed reference's own + structurally VOIDED (closed gold vs open voter). |
| AVeriTeC-seeded "hybrid-construct" natural questions pinned to gold | Two explicit slices (Slice A judge-free descriptive + Slice B natural judge-graded) | Phase 22 (22-CONTEXT "Specific Ideas") | Hybrid-construct ruled INFEASIBLE at n=2-3 (skew + 2020 dating + narrowness + answer-leak). |
| Closed-book gold directly grading an open-book report | Closed-book gold calibrates the JUDGE; open-book gold scores the open-book voter descriptively | Phase 22 (D-11/D-13) | The ratified construct-validity principle; resolves the Phase 18-21 mismatch. |
| Judge bias unaddressed | Blind + position-swap (win iff both orders agree) + gold-anchor + k=3-5 + claim-extraction bridge | Phase 22 (D-10/D-12) | Defensible parity SCREEN (still not a proof -- D-19 threat recorded). |

**Deprecated/outdated:**
- Hand-rolled statistics anywhere in `eval/`: forbidden (D-07); route through pinned jstat via the MCC/aggregate modules.
- Treating any eval verdict as a ship gate: the Sonnet-default skill ships regardless (D-03).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The built-in `/deep-research` headless capture completes within a single reset window for n=2-3 x k=2 without exhausting the session pool. | Headless capture / Pitfall 5 | Capture is partial; mitigated by checkpoint-to-disk + same-window pairing + re-capture only missing runs. The eval is descriptive at n=2-3, so a deferred run does not invalidate the design. |
| A2 | The built-in `/deep-research` still expands as a slash command in the live CC build (v2.1.154+; the host is on a later build) under `--permission-mode auto`. | Headless capture (D-15) | If the built-in changed invocation, capture fails; verify via a 1-question smoke capture + the `system/init` plugins/tools line BEFORE the full run. Docs confirm slash commands work in `-p`. |
| A3 | LLM-AggreFact is fetchable via the existing `fetchDataset` path at a pinnable revision (de-dup vs WiCE). | MCC calibration (D-13) | If unfetchable, calibrate on WiCE alone (incl. partially_supported) -- still a valid closed-book calibration set; record the reduced set as a limit. The CC-BY-ND verbatim-only constraint means fetch-only, never commit. |
| A4 | The verify-voter Agent path, fed only the claim + claim_date (no leaky gold fields), produces an `unrefuted\|refuted` verdict comparable to the AVeriTeC collapsed label for Slice A. | D-14 resolution | If the voter's verdict semantics differ materially from AVeriTeC's aggregate-human "Supported", the descriptive read is noisier -- but it is DESCRIPTIVE per-direction, not a cert, so noise is reported, not laundered. The 2020 date skew is the named PROVISIONAL limit. |
| A5 | The 6 ROADMAP Phase-22 success criteria map cleanly onto PAR-01..PAR-08 as proposed. | Phase Requirements | The planner must read the ROADMAP Phase-22 SC list directly and re-bind; this research did not have line-item ROADMAP access. Low risk -- the PAR-* set covers all D-01..D-20 decisions. |

## Open Questions

1. **Exact Slice-B natural question topics (n=2-3) + the final k (3-5) + the pass threshold (0.7 default).**
   - What we know: these are pre-registration KNOBS the planner finalizes within the locked ranges (D-04 / Claude's Discretion).
   - What's unclear: the specific topics (should be GENERAL research questions, NOT fact-check claims -- distinct from Slice A's narrow 2020 corpus, to give the parity comparison ecological breadth).
   - Recommendation: pick 2-3 questions in domains where BOTH systems can find live sources (e.g. a current technical/scientific question, a recent-events question, a comparative question), avoid anything date-locked to <=2020, and freeze them in the pre-registration before any capture.

2. **Whether LLM-AggreFact is pin-fetchable on this host now (vs WiCE-only calibration).**
   - What we know: WiCE is vendored (offline-ready); AVeriTeC is cached; LLM-AggreFact is fetch-only (CC-BY-ND verbatim).
   - What's unclear: the exact HF repo id + a pinnable revision for the planner's `loadManifest` entry.
   - Recommendation: the planner adds the LLM-AggreFact source to the manifest with a pinned revision + sha256 (the loader fails closed on mismatch); if the fetch is unavailable at eval time, fall back to WiCE-only calibration and record it as a named limit (A3).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| AVeriTeC dev gold | Slice A (PAR-06) | YES (cached) | `chenxwh/AVeriTeC` dev.json (500 items) + dev_top_3_rerank_qa (500 evidence records), on disk | -- (already fetched) |
| WiCE gold | Judge calibration (PAR-02) | YES (vendored) | `eval/__fixtures__/wice-vendored/` (ODC-BY) | -- |
| LLM-AggreFact gold | Judge calibration (PAR-02) | fetch-at-eval-time | pin in manifest | WiCE-only calibration (A3) |
| `jstat` | MCC / CI math | YES (pinned) | 1.9.6 in `eval/` | -- |
| `hf` CLI | dataset fetch | YES (global) | -- | -- (AVeriTeC already cached) |
| Claude Code CLI (`claude -p`) | baseline + candidate capture + judge | YES (host CLI) | v2.1.154+ built-in `/deep-research`; pin exact ver per-run from `system/init` | -- |
| Built-in `/deep-research` | baseline (D-15) | YES (bundled v2.1.154+) | closed-source workflow; pin CC ver in MANIFEST | smoke-capture 1 question first (A2) |
| Opus access | the judge (D-08) | required | the Claude session pool | budget fallback: Opus on factual+citation, Sonnet on cheaper dims (D-10) |

**Missing dependencies with no fallback:** none (the only blocking dep -- Opus access for the judge -- is required by the locked design; D-08).
**Missing dependencies with fallback:** LLM-AggreFact (-> WiCE-only calibration); the built-in capture if invocation changed (-> smoke-test first).

## Validation Architecture

> nyquist_validation is enabled (no `workflow.nyquist_validation:false` found). The VALIDATION.md derives from this.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` (node --test, the project standard for `eval/`) |
| Config file | none -- file-form invocation (the `node --test <dir>` exit-1 quirk forces the explicit `.test.mjs` form) |
| Quick run command | `node --test eval/lz-eval-parity-verdict.test.mjs` (one module) |
| Full suite command | per-file loop over the tracked `eval/*.test.mjs` (the established pattern; never `node --test eval/`) |

### Test layers (what each validates)
| Layer | Validates | Type |
|-------|-----------|------|
| Unit (off-model node) | `lz-eval-parity-verdict.mjs` floor+parity-bar logic; `lz-eval-parity-judge.mjs` position-swap + SEM; `lz-eval-judge-calibration.mjs` MCC gate; `lz-eval-sliceA-gold.mjs` collapse+filter+per-direction tally; `lz-eval-baseline-manifest.mjs` fail-closed on missing system/init | unit |
| Anti-drift | the frozen pre-registration constants == the `.md` lock-rule prose, byte-for-byte (mirrors aggregate <-> lock-rule) | unit |
| Discrimination | each verdict/gate test EMPIRICALLY fails on the inverted/old behavior (req-#6 anti-bent-test: disable-the-fix proves fail-on-old; MEMORY: prove-test-discrimination-empirically) | unit |
| Packaging boundary | the eval tree never ships (one-directional eval->runtime import; no eval import in any plugin-tree file) -- extend `lz-eval-packaging-boundary.test.mjs` | unit |
| Calibration gate (PAR-02) | the judge clears the MCC bar over WiCE+LLM-AggreFact before grading (a live-but-cheap session step; the SCORING is off-model + tested) | integration (session-driven) |
| Capture smoke (PAR-03) | a 1-question built-in capture yields a non-empty report.md + a valid system/init pin (A2 smoke) | manual/integration (session-driven) |
| End-to-end parity (PAR-04/05) | the full n=2-3 x k=2 capture + grade -> the two-layer verdict (descriptive, n too small for automation -> the verdict assembler is unit-tested; the run itself is session-driven) | manual-justified (n=2-3 holistic; D-07 forbids stats) |

### Phase Requirements -> Test Map
| Req | Behavior | Test Type | Automated Command | File |
|-----|----------|-----------|-------------------|------|
| PAR-01 | prereg constants frozen == lock-rule prose | unit (anti-drift) | `node --test eval/lz-eval-parity-verdict.test.mjs` | Wave 0 |
| PAR-02 | judge MCC gate clears/disqualifies | unit (scoring) | `node --test eval/lz-eval-judge-calibration.test.mjs` | Wave 0 |
| PAR-03 | MANIFEST fail-closed on missing system/init model | unit | `node --test eval/lz-eval-baseline-manifest.test.mjs` | Wave 0 |
| PAR-04 | position-swap agreement + SEM | unit | `node --test eval/lz-eval-parity-judge.test.mjs` | Wave 0 |
| PAR-05 | two-layer verdict (floor + parity bar) | unit | `node --test eval/lz-eval-parity-verdict.test.mjs` | Wave 0 |
| PAR-06 | AVeriTeC collapse+filter+per-direction tally | unit | `node --test eval/lz-eval-sliceA-gold.test.mjs` | Wave 0 |
| PAR-07 | architectural-parity write-up content review | manual (content review) | -- | Wave 0 (review gate) |
| PAR-08 | every script reviewed + tested; eval never ships | unit (packaging) + review | `node --test eval/lz-eval-packaging-boundary.test.mjs` | extend existing |

### Sampling Rate
- **Per task commit:** the touched module's `node --test eval/<module>.test.mjs`.
- **Per wave merge:** the full tracked `eval/*.test.mjs` per-file loop.
- **Phase gate:** full suite green + the pre-registration committed (timestamped) BEFORE any grading spend + the calibration gate cleared.

### Wave 0 Gaps
- [ ] `eval/lz-eval-parity-judge.test.mjs` -- PAR-04
- [ ] `eval/lz-eval-parity-verdict.test.mjs` -- PAR-01/PAR-05
- [ ] `eval/lz-eval-judge-calibration.test.mjs` -- PAR-02
- [ ] `eval/lz-eval-sliceA-gold.test.mjs` -- PAR-06
- [ ] `eval/lz-eval-baseline-manifest.test.mjs` -- PAR-03
- [ ] extend `eval/lz-eval-packaging-boundary.test.mjs` for the new modules -- PAR-08
- [ ] (framework already present: `node:test`; jstat already installed -- no install gap)

## Security Domain

> `security_enforcement` is enabled (no explicit `false`). This phase is an eval/dev-tooling phase touching no shipped runtime; the threat surface is the eval tree + the captured data + the dataset fetch.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth surface (local eval; `hf` token resolution already pre-flighted in `lz-eval-dataset.mjs`). |
| V3 Session Management | no | n/a |
| V4 Access Control | no | n/a |
| V5 Input Validation | yes | All gold/judge JSON read via fail-closed `readJson`; content-derived ids via `safeId` (path-traversal guard); manifest sha256 verify (`verifySha256`) fails closed on tamper. |
| V6 Cryptography | yes (integrity only) | sha256 dataset integrity via `verifySha256` (node:crypto stdlib); no secret material handled. |

### Known Threat Patterns for this eval phase
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| A tampered/HTML-error dataset body silently "verifying" | Tampering | `verifySha256` fail-closed against the pinned manifest sha256 (already implemented). |
| A crafted content-derived id traversing the filesystem | Tampering/Elevation | `safeId` basename-only guard (cross-tree import; already enforced). |
| An eval dependency leaking into the shipped plugin | Tampering (supply chain) | The one-directional eval->runtime import boundary + the packaging-boundary test (PAR-08); eval tree gitignored deps, never shipped. |
| An OOF (Copilot/GPT/Gemini) model call sneaking into the eval | Information disclosure / cost | D-18 absolute prohibition; no OOF transport in any new module (unlike the live-cert driver, which had `callOof` -- this phase has NONE). |
| The `hf` token logged/written | Information disclosure | `resolveHfToken` never logs/writes the token (already implemented); AVeriTeC is gated:false (token-free). |
| Result-shopping (post-hoc bar tuning) | Repudiation | Pre-registration freeze + timestamp + commit BEFORE grading (PAR-01); frozen `Object.freeze` constants + anti-drift test. |

## Sources

### Primary (HIGH confidence)
- In-repo cache inspection (2026-06-22): `eval/.cache/chenxwh__AVeriTeC/data/dev.json` (500 items) + `data_store/dev_top_3_rerank_qa.json` (500 JSONL evidence records) -- the D-14 counts (95 clean Supported / 216 clean Refuted; uniform 2020; 34% political / 21% COVID; 4-way label distribution Refuted 305 / Supported 122 / NEI 35 / Conflicting 38).
- In-repo source reads: `eval/lz-eval-dataset.mjs`, `eval/lz-eval-mcc.mjs`, `eval/lz-eval-baseline-guard.mjs`, `eval/lz-eval-aggregate.mjs`, `eval/package.json`, `eval/lz-eval-live-cert-driver.md` -- the exported APIs + the session/node transport split + the frozen-constant verdict idiom.
- `plugins/lz-advisor/skills/lz-deep-research/SKILL.md` + `plugins/lz-advisor/references/lz-deep-research-schema.md` -- the system under test + the VERIF-06 two-assurance distinction (grounds the D-12 claim-extraction bridge) + the Contested/Unsupported preserve-uncertainty design (grounds D-17).
- `code.claude.com/docs/en/headless` (WebFetch 2026-06-22) -- `--allowedTools` syntax, `--output-format stream-json/json`, `system/init` (model + plugins), `total_cost_usd`, `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS` (0 = no limit), slash commands in `-p`, `--permission-mode`.
- `.planning/phases/22-.../22-CONTEXT.md` (D-01..D-20, locked) + `.planning/REQUIREMENTS.md` + `.planning/STATE.md` (the Phase 18-21 VOID history + the construct-validity principle).

### Secondary (MEDIUM confidence -- verified by the discuss-phase, relied upon per the prompt)
- Anthropic engineering: multi-agent-research-system + built-multi-agent-research-system + demystifying-evals-for-ai-agents (the 5-dimension rubric, dimension-isolated judges, partial credit, "Unknown" escape hatch, pairwise grading) -- FETCHED + verified during discuss-phase.
- `code.claude.com/docs/en/workflows` -- `/deep-research` is a bundled dynamic workflow (v2.1.154+); votes on claims + adversarial cross-review + drops non-survivors; runs in `claude -p` (FETCHED twice in discuss-phase).

### Tertiary (LOW confidence -- flagged)
- The exact LLM-AggreFact HF repo id + pinnable revision (A3) -- the planner adds it to the manifest; WiCE-only calibration is the fallback.
- The live CC build's exact `/deep-research` invocation (A2) -- verify via a 1-question smoke capture before the full run.

## Metadata

**Confidence breakdown:**
- D-14 feasibility resolution: HIGH -- direct, reproducible inspection of the cached gold (counts, skew, dates, topical concentration, evidence store).
- Standard stack (reuse): HIGH -- read every module's exported API directly; zero new packages.
- Headless capture (D-15/D-16): HIGH for the flags (verified docs); MEDIUM for the exact live-build invocation (A2 smoke-test recommended).
- Judge harness + claim-extraction bridge (D-08/D-10/D-12): HIGH on design (locked in CONTEXT + grounded in the schema); the session-driven mechanics mirror the proven live-cert driver.
- PAR-* requirement family: MEDIUM -- proposed; the planner ratifies + binds to the ROADMAP SCs (A5).

**Research date:** 2026-06-22
**Valid until:** 2026-07-22 for the methodology + the AVeriTeC counts (the cached data is static); 7 days for the headless CLI flags (fast-moving CC builds -- re-verify `system/init` + the background-wait env var on the live build at capture time).
