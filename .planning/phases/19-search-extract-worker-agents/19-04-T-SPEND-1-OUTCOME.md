# 19-04 T-spend-1 outcome: VOID (positive-control arm construct collapse)

**Date:** 2026-06-19 (autonomous overnight run, user pre-authorized T-spend-1 + T-spend-2 + OOF Copilot).
**Result:** the offline gold build VOIDs on the positive-control arm. T-spend-2 was NOT run (it is conditioned on a clean gold). The VOID blocks the ABSOLUTE PER-MODEL verdict for ALL THREE subjects equally (Haiku, Sonnet, and the Opus reference baseline) -- no per-model false-uphold/over-refusal metrics yet for the "near-Opus intelligence at Sonnet/Haiku cost" thesis (proving Haiku is co-equal with Sonnet is the eval's purpose, NOT sidelined). The production cheap-tier-worker deployment default is a SEPARATE downstream matter, unchanged -- not a judgment on Haiku. **This requires a user redesign decision (RAISE).**

## What ran (all authorized; checkpoints honored)

1. **Pre-registration pinned + committed** (`9b16c60`, additive, zero-votes window): `nControls=40`, `covariateOverlapTolerance=0.5`, `subjectDifficultyMaxCatchRate=0.5`. Frozen primitives + RE-PLAN-7/8 keys byte-identical (anti-drift test extended + green). `nControls=40` chosen via an Opus advisory (trap arm is the binding constraint; 40 demands the lowest trap retention while controls clear pre-screen; 60 risked the trap floor).
2. **Generate** (Opus, in-family): 42 single-sentence one-step overreach traps -> `pilot/gen-<id>.json`.
3. **Transport fix:** Node `spawn('copilot')` ENOENT on Windows -> fixed with `shell:true` (prompt via stdin, no arg-quoting exposure). Verified with a 1-call smoke (`OK`, 10.7 credits, 21.1k input tokens -- the documented per-call overhead).
4. **CP1 -- contamination gate** (12 hardest traps, single vs batched, both frozen-pair models): **12/12 agreement both models** (>=11/12 required) -> batching faithful. **Early r_t = 12/12 (1.0)** -> trap floor clears with large margin. PROCEED.
5. **Bulk OOF gold screen** (batched, both frozen-pair models the sole retain decider):
   - **AVeriTeC arm THREW**: only **2** native controls retained (build-floor 3) -> `assembleStage1Traps` errored.
   - **WiCE arm**: **18 traps / 7 controls** retained; `probeSplitDropped=14`, `probeDropped=5`.
   - **Combined: traps healthy, controls ~7 << N_CTRL_FLOOR 24.**

## The finding (diligence-confirmed; NOT a bug, NOT a batching artifact)

The OOF pair (gpt-5.5 + gemini-3.1-pro-preview) **drops the positive CONTROLS** -- it frequently judges that the date-filtered *supporting excerpts* do not **strictly entail** even the native (gold=unrefuted) claims.

- **Single-form (unbatched) control re-check** (rules out mixed-batch anchoring): AVeriTeC **0/8** retained, WiCE **3/4**, **split=0** (the two models agreed). The collapse reproduces unbatched -> it is **not** a batching artifact, so the pre-registered batch-5 remedy does not apply.
- **Reason inspection** (from the already-paid responses; rules out the "rubric-too-literal" alternative as the primary cause): the OOF judge is **sound and discriminating** -- 9/16 sampled controls correctly `entails=true` (e.g. "Ipsy valued over $500M"; "received a Primetime Emmy"). The `entails=false` controls are **mostly genuine**: real overclaims ("CBOT is *the largest* derivatives market *globally*" vs "Chicago is *a* major center"), actual contradictions / mislabeled controls ("*is* a subspecies" when evidence says *falsely assumed*, actually a distinct species; award "for **Guest** Actress" when evidence says **Lead** Actress), and evidence-gaps ("complete game" not stated; "professional debut" vs "big-league debut"). Only ~2/16 were borderline over-literal ("Perez *personally* announced"; "at a *ceremony*").

**Diagnosis (Opus-validated):** AVeriTeC's "Supported" is a human judgment over the *full* evidence base, not that sparse retrieved *excerpts* strictly *entail* the full real-world claim (often carrying specific magnitudes/intents). The strict-entailment criterion is **right for traps** (an overreach genuinely isn't entailed) but **too strict for controls** (support != strict entailment). WiCE is entailment-native so its controls partially survive -- but too few (~7-11) for the 24 floor, and the WiCE control set is partly impure (some subclaims are overclaims/contradictions). **The positive-control arm is essentially unbuildable offline at N>=24 under this screen.** Without it, `certifyModel`'s PASS_B (over-refusal arm) is unconstructible, so the absolute per-model offline read VOIDs.

## Decision (pre-committed; not auto-resolved)

**STOP + RAISE a VOID.** No pre-registered, non-result-shopping remedy survives (batch-5 ruled out by the single-form reproduction). Per the guardrails: do not relax a frozen floor, do not loosen the rubric and retry (result-shopping), do not re-open the converged design unilaterally, **do not spend T-spend-2 against an invalid gold.** The trap arm is healthy; the failure is specifically the control arm.

## Redesign OPTIONS for the user (from the Opus consult; NONE auto-applied; none is safely "parameter-like")

| # | Option | Family-indep + anti-confound | Main risk | Magnitude |
|---|--------|------------------------------|-----------|-----------|
| A | WiCE-only controls, relaxed floor | yes / yes | underpowered (~7-11), single-dataset genre confound | floor relaxation = pre-reg amendment (human/board) |
| B | "Support" (not strict-entailment) criterion for controls only | yes / **weakened** (asymmetric arms) | breaks the clean false-uphold vs over-refusal symmetry | full re-plan / board |
| C | Different/larger entailment-native control source (FEVER/VitaminC-style) | yes (if non-Claude-derived) / yes | new-source license/date/contamination + new construct-validity | full re-plan / board (mirrors Phase-18 dataset method) |
| D | Sample controls whose excerpts are known to entail | yes / yes | selection-induced easiness inflates the over-refusal pass; circularity | re-plan (new sampling frame) |
| E | Defer over-refusal arm to the Phase-20 live shadow; ship trap-only offline (explicitly incomplete) | yes / **partial** (confound relocated, not solved offline) | offline WORKS unconstructible by design | scope/deliverable change (human OK) |
| F | Trap-only read, knowingly accept the always-refute confound | yes / **NO** | an always-refuse model passes -> unsound | construct change (board) |
| G | Abandon the offline absolute per-model read; move to live/online methodology | replaces approach | largest scope loss | full re-plan / new approach |

A and E are the lightest touch *for a human*; B/C/D/F/G touch board-converged decisions. Given the project's pattern, a redesign warrants the same cross-family board treatment used for RE-PLAN-3/4/5/7/8.

## Spend this run

~76 Copilot calls (smoke 1 + gate ~28 + bulk screen ~18 + single/reason diligence ~30) ~= ~$8-11 of GitHub Copilot AI Credits; 42 Opus generations on the Claude plan. The checkpoint design worked: the invalid gold was caught at the *gold build* before the far larger T-spend-2 three-voter k=9 runs. No frozen primitive changed; `.claude/settings.json` untouched.
