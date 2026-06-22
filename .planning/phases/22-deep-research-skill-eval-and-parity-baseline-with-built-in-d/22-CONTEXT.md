# Phase 22: Deep-research skill eval and parity baseline with built-in deep-research - Context

**Gathered:** 2026-06-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish -- via a holistic, system-level eval (NOT a per-component statistical certification) -- that the shipped `lz-deep-research` skill running on Sonnet produces research of quality EQUIVALENT to Claude Code's blessed built-in `/deep-research` workflow. Two complementary tracks: (1) ARCHITECTURAL parity (document lz-deep-research's verification design vs the built-in's) and (2) MEASURED parity (run both on a frozen question set, grade on a frozen holistic rubric, anchor the factual/citation dimension on expert-labeled benchmark gold). Outcome: a SCOPED, defensible "Sonnet works for lz-deep-research, at parity with the blessed reference" claim + an operating envelope -- or an honest, named gap. The Sonnet-default skill ships regardless; this is confidence / scientific-completeness work, NOT a ship gate.

**In scope:** eval methodology + harness reusing the existing `eval/` tree; built-in baseline capture; LLM-judge grading; gold anchoring; pre-registration; the architectural-parity write-up.
**Out of scope:** any change to the shipped skill's runtime design; re-opening the Phase 18-21 component certifications; the lz-deep-research workflow re-architecture (deferred to a later milestone); release/publication (handled at `/gsd-complete-milestone`).

</domain>

<decisions>
## Implementation Decisions

> Deliberation provenance: research wave (4 gsd-advisor-researcher agents, sources verified) -> 5-lens Opus panel (round 1: gold-anchoring, 4-1 Option 3; round 2: judge, 5-0 Opus) -> cross-family board on the identical briefing (Opus + GPT-5.5 + Gemini-3.1-pro; 2-1 feasibility-gated Option 3, Gemini contributed the claim-extraction bridge). Alternatives preserved in `22-DISCUSSION-LOG.md`. OOF board spend: 17.92 GitHub AI Credits (GPT-5.5 13.0 + Gemini 4.92).

### Eval framing & methodology
- **D-01:** Holistic system-level LLM-as-judge parity eval; NOT a per-component Clopper-Pearson certification. That statistical bar exceeds the blessed reference's own and structurally VOIDED across Phases 18-21 (closed-book gold vs an open-book live-web voter).
- **D-02:** Two complementary tracks: ARCHITECTURAL parity (documented) + MEASURED parity (graded). Both required.
- **D-03:** The Sonnet-default `lz-deep-research` skill ships regardless of the eval outcome. The eval produces confidence / an operating envelope, never a ship gate.

### Rubric & parity verdict
- **D-04:** Rubric = Anthropic's five dimensions verbatim (factual/groundedness accuracy; citation accuracy; completeness/coverage; source quality; tool/process efficiency). Score each 0.0-1.0 with partial credit on atomic sub-claims, plus a derived pass/fail at a pre-registered threshold (default >= 0.7), plus an "Unknown" escape hatch (Unknown is not a pass). Per-dimension isolated judging.
- **D-05:** Two-layer verdict = an absolute quality FLOOR (the Sonnet skill must pass factual AND citation on every frozen question) + a comparative PARITY verdict. Neither alone suffices (pairwise has no ground floor; absolute never establishes parity).
- **D-06:** Parity verdict = both-orderings pairwise win/tie/loss per (question x dimension x baseline); record a win/loss ONLY when both orderings agree, else TIE.
- **D-07:** Parity bar (pre-registered, holistic, NO statistics): PARITY iff (a) the absolute floor passes on all frozen questions AND (b) zero clear LOSS on factual or citation AND (c) no more than one clear LOSS total across the remaining dimensions. NO confidence intervals / Likert non-inferiority margins at n=2-3. Report raw per-cell verdicts, per-direction, never only the aggregate.

### Judge design (user-ratified)
- **D-08:** A single OPUS judge. NO panel -- the only in-family panel partner is Sonnet, and Sonnet-judging-Sonnet is the near-lineage self-preference worst case AND biases toward our own Sonnet-driven candidate. The eval judge tier is independent of the skill's runtime cost profile.
- **D-09:** The advisor strategy (Sonnet-mostly / Opus-minimal) is a property of the SHIPPED SKILL AT RUNTIME, NOT a constraint on the eval or dev tooling. The eval is a measurement instrument; an Opus judge does not weaken the "near-Opus at Sonnet cost" claim. Pre-register a disclosure that the eval instrument is deliberately stronger and independent of the product's cost profile.
- **D-10:** Pre-registered judge debiasing protocol: blinding (strip system identity) + mandatory position-swap (win only if preferred in both orders) + reference-gold-anchoring of the factual dimension + k=3-5 multi-sample per item for SEM reporting; verdict pass at temp 0. Budget fallback (only if the Claude pool binds): Opus on the bias-critical factual+citation dims + Sonnet on the cheaper dims; NEVER a Sonnet judge on the factual dims.

### Gold anchoring (the deliberated fork -> board-converged synthesis)
- **D-11:** Gold anchoring = a feasibility-gated TWO-SLICE design. Slice A (AVeriTeC, open-book) scores the report's key claim verdict-vs-gold DETERMINISTICALLY via the existing verify-voter path (NO judge), reported DESCRIPTIVELY (not a pass/fail cert); collapse the 4-way label to `unrefuted|refuted` (Supported->unrefuted, Refuted->refuted), EXCLUDE Conflicting/Cherry-picking (kappa noise), hold out NEI; honor `claim_date` cutoffs; report per-confusion-matrix-direction, never pooled. Slice A is included ONLY if it clears a pre-registered feasibility + ecological-representativeness gate. Slice B (natural research questions, BOTH systems, judge-graded) is the head-to-head measured parity.
- **D-12:** Claim-extraction bridge (adopted from the Gemini board member): for Slice B's factual/citation grading, the Opus judge FIRST extracts discrete claims + citations from each report, THEN scores each against the report's OWN cited evidence (citation-faithfulness; the VERIF-06 "claim supported by the quote" assurance). This closes the closed-book-calibration -> open-book-deployment transfer gap and is ecologically valid (it operates on the actual natural reports).
- **D-13:** Judge calibration: WiCE (MUST include `partially_supported` subtle-overreach items) + LLM-AggreFact (de-dup vs WiCE; verbatim-only), closed-book; gate the judge via the existing MCC machinery BEFORE it grades any report. An uncalibrated judge is a disqualifier, never a silent default.
- **D-14:** Fallback (pre-registered, frozen before grading): if AVeriTeC yield/representativeness is insufficient, degrade Slice A to a judge-calibration probe ("Slice B + Slice-A-as-calibration-probe"), NOT bare lean. The feasibility gate + downgrade rule are RESOLVED in `/gsd-plan-phase 22 --research` and FROZEN before any grading (a pre-registered conditional branch, resolved pre-grade, is valid pre-registration -- not result-shopping).

### Built-in baseline capture & architectural parity
- **D-15:** The built-in `/deep-research` is a CLOSED-SOURCE bundled dynamic workflow (Claude Code v2.1.154+; verified 2026-06-22 absent from all public Anthropic repos -- claude-code/claude-plugins-official/skills). Capture it headless: `claude -p "/deep-research <q>" --permission-mode auto --allowedTools "WebSearch,WebFetch" --output-format stream-json --verbose | tee`; set `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0`; no approval prompt, no mid-run input. Persist report.md + the workflow script + the `system/init` line (pin CC version + model) to a MANIFEST.
- **D-16:** Baseline protocol: n=2-3 frozen questions x k=2 runs each; grade BOTH runs, report per-run spread (never a hidden average); END-STATE grading (not process grading); capture per-run cost; pair lz vs built-in in the same reset window; never average across CC versions.
- **D-17:** The architectural-parity track is documented from the published docs + the dynamic-workflows blog (the built-in's source is closed -> flag the comparison as docs-grounded). The substantive contrast: the built-in votes on claims + adversarially cross-reviews but COLLAPSES uncertainty by deleting non-surviving claims; lz-deep-research PRESERVES uncertainty as first-class signal (Contested/Unsupported + non-unanimity human abstention + disconfirming search + source-independence weighting).

### Cost & validity constraints
- **D-18:** ZERO out-of-family (Copilot/GPT/Gemini) model spend INSIDE the eval; gold comes only from free expert-labeled public datasets and never from the maintainer (declines on expertise) or a metered OOF model. The eval tree never ships (lives in `eval/` with its own `package.json`; jstat pinned in `eval/` only).
- **D-19:** Self-preference symmetric-cancellation is DEFENSIBLE-BUT-NOT-PROVEN: record it as an explicit threat-to-validity. "Claude grading Claude at n=2-3" is conceded in the pre-registration as a defensible parity SCREEN, never a proof; the Opus judge + blind/swap/gold-anchor + the judge-free Slice A are the backstops.
- **D-20:** Pre-registration discipline: freeze the rubric + both question lists (Slice A seed list + Slice B natural set) + the verdict-collapse map + the judge-calibration MCC bar + the AVeriTeC feasibility-gate criteria + the fallback rule BEFORE any grading.

### Claude's Discretion
- The PAR-* requirement family is to be derived in `/gsd-plan-phase 22`.
- Exact Slice B question topics, the final k (within 3-5), and the pass threshold (default 0.7) are pre-registration knobs the planner finalizes within the locked ranges.
- Whether to optionally drive the comparison through the skill-creator skill-eval/optimization workflow: NOT adopted for the parity grading (the bespoke `eval/` harness + existing machinery is the path); skill-creator remains available for description/trigger tuning only.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` -- Phase 22 section (goal, constraints settled in the 2026-06-22 pre-phase Opus-panel + claude-code-guide discussion, success criteria).
- `.planning/REQUIREMENTS.md` -- existing v2.1.0 families; the PAR-* parity/eval family is TBD (derive in plan-phase).

### Anthropic eval methodology (rubric + judge + small-n)
- https://www.anthropic.com/engineering/multi-agent-research-system -- the 5-dimension rubric, 0.0-1.0 + pass/fail single-judge, ~20-query start, human calibration, end-state grading. (FETCHED + verified.)
- https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents -- dimension-isolated judges, grader types (incl. pairwise), partial credit, "Unknown" escape hatch. (FETCHED + verified.)
- https://www.anthropic.com/research/statistical-approach-to-model-evals -- SEM/CI, cluster-adjusted SE, paired-difference variance reduction, multi-sample-per-question. (FETCHED + verified.)
- https://www.anthropic.com/engineering/built-multi-agent-research-system -- the older orchestrator + CitationAgent + LLM-judge pattern (context for the architectural contrast).

### Built-in /deep-research (closed-source; docs-grounded)
- https://code.claude.com/docs/en/workflows -- `/deep-research` is a bundled dynamic workflow (v2.1.154+); votes on claims + adversarial cross-review + drops non-survivors; runs in `claude -p` ("run starts immediately", no mid-run input). (FETCHED twice + verified.)
- https://code.claude.com/docs/en/headless -- `-p` output formats, `tee` capture, background-wait ceiling. (FETCHED + verified.)
- Local repo grounding (verified 2026-06-22): `D:/projects/github/anthropics/{claude-code,claude-plugins-official,skills}` updated to latest main -- ZERO `/deep-research` implementation present (it ships inside the CLI binary). claude-code CHANGELOG reaches v2.1.185.

### Expert-label gold datasets + existing machinery
- `eval/lz-eval-dataset.mjs` -- the dataset loader (WiCE remap to `unrefuted|refuted`; AVeriTeC fetch-only; license split). REUSE.
- `eval/__fixtures__/wice-vendored/` -- vendored WiCE records (ODC-BY). REUSE.
- `eval/lz-eval-mcc.mjs`, `eval/lz-eval-baseline-guard.mjs`, `eval/lz-eval-difficulty-proxy.mjs` -- MCC + lexical-artifact-guard + difficulty modules for judge calibration. REUSE.
- `eval/lz-eval-aggregate.mjs` -- the eval aggregator (Pass@1/Pass^k/per-stratum). REUSE/extend.
- AVeriTeC: https://huggingface.co/chenxwh/AVeriTeC (open-book; 4-way; ~2020 Refuted-skewed; CC-BY-NC fetch-only). WiCE: https://huggingface.co/datasets/jon-tow/wice (closed-book; supported/partially_supported/not_supported; ODC-BY). LLM-AggreFact: https://arxiv.org/abs/2404.10774 (binary; embeds WiCE -> de-dup; CC-BY-ND verbatim-only).

### Shipped skill under test
- `plugins/lz-advisor/skills/lz-deep-research/SKILL.md` -- the orchestrator skill (the system under test).
- `plugins/lz-advisor/references/lz-deep-research-schema.md` -- frozen JSON shapes, tally rubric, two-assurance distinction (VERIF-06 grounds the claim-extraction bridge).
- `plugins/lz-advisor/references/lz-deep-research-orchestration.md` -- pipeline orchestration reference.
- `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` -- the runtime deterministic aggregator.

### Project conventions (load-bearing for this phase)
- `.planning/PROJECT.md` "Review before use or publication" -- every eval SCRIPT (+ its code-reviewed tests) and every PROMPT/REFERENCE that steers an LLM task is reviewed before driving an LLM task OR publishing.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `eval/` tree (own `package.json`, jstat pinned, never ships): dataset loader, MCC/baseline-guard/difficulty modules, the eval aggregator, the voter-dispatch workflow harness, Clopper-Pearson helpers -- the parity harness composes these rather than greenfield.
- The runtime verify-voter agents + `lz-deep-research-aggregate.mjs` provide the deterministic verdict-vs-gold path for Slice A (no judge).
- Vendored WiCE fixtures + the AVeriTeC fetch-cache are already wired for judge calibration.

### Established Patterns
- Open-book vs closed-book role separation is the project's ratified construct-validity principle (closed-book gold may calibrate the judge but must NOT directly grade an open-book report) -- it gates D-11/D-13.
- Pre-registration-before-scoring (freeze bar + scripts + question lists before any grade) is the anti-result-shopping discipline carried from Phases 18-21.
- The eval is the Claude session pool (bounded, no dollars); OOF spend is forbidden inside it.

### Integration Points
- Built-in baseline capture is a new `claude -p` wrapper writing into the gitignored eval run dir; the report.md feeds the same judge harness as the lz-deep-research reports.
- The judge harness (Opus, blind/swap/multi-sample) is new but reuses the dataset loader + MCC calibration gate.

</code_context>

<specifics>
## Specific Ideas

- The eval design is the product of a research wave + a 5-lens Opus panel + a 3-family (Opus/GPT-5.5/Gemini) cross-family board on an identical de-identified briefing. The board's distinctive contribution is the **claim-extraction bridge** (D-12) -- have the Opus judge extract claims+citations from each report and score them against the report's own cited evidence -- which closes the lean design's transfer gap and improves ecological validity over AVeriTeC-seeded prompts.
- "Hybrid-construct" questions (natural-sounding yet pinned to AVeriTeC gold) were assessed INFEASIBLE at n=2-3 (Refuted skew + 2020 dating + topical narrowness + answer-leak) -- do not pursue; use the two explicit slices instead.
- A round-2 board reconciliation was offered but not run (the positions composed cleanly; the user accepted the synthesis).

</specifics>

<deferred>
## Deferred Ideas

- The lz-deep-research workflow re-architecture (script + `Workflow scriptPath`) -- explicitly deferred to a later milestone (per Phase 20 records).
- Release/publication (version bump / CHANGELOG / README / tag / GitHub Release) -- handled at `/gsd-complete-milestone` after `/gsd-audit-milestone`, NOT in this phase.

### Reviewed Todos (not folded)
- `2026-06-17-relocate-non-distributable-lz-deep-research-test-fixtures-fr` (packaging, score 0.6) -- a packaging cleanup adjacent to the eval tree, NOT parity-eval work; keep as backlog. Touch only if the eval-tree work naturally surfaces it.
- `research-rtk-command-suitability-for-skills-and-agents` (plugin-tooling, score 0.6) -- keyword-matched only; unrelated to the parity eval; remains backlog.

</deferred>

---

*Phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d*
*Context gathered: 2026-06-22*
