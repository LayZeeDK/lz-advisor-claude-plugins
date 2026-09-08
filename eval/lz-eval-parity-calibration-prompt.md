# lz-deep-research parity-eval -- the closed-book judge-calibration prompt (Phase 22, Stage 2; PAR-02 / PAR-08 / D-13)

This is the EXACT, frozen system+task prompt the Opus judge sub-agent is given for EACH closed-book
WiCE calibration item in Stage 2 of the parity eval (`eval/lz-eval-parity-driver.md` Stage 2). It is an
LLM-STEERING prompt, so it is content-reviewed BEFORE it drives the ~60-call calibration (the project
"Review before use or publication" MUST; PAR-08). It is materialized into each per-item dispatch by
`eval/lz-eval-parity-calibration-harness.mjs` (`buildJudgePayload`), which supplies the `{claim, evidence}`
payload and NEVER the gold label / supporting_sentences (anti-leak).

## Why this prompt exists (the construct)

The Stage-2 gate calibrates the Opus parity JUDGE before it may grade any report (an uncalibrated judge
is a DISQUALIFIER, PAR-02). The calibration task is the JUDGE'S CORE ENTAILMENT OPERATION in miniature:
given a CLAIM and a body of EVIDENCE, decide whether the evidence supports the claim. This is exactly the
atomic decision the Stage-3 factual + citation grading makes via the claim-extraction bridge (D-12 -- each
extracted claim is scored against the report's OWN cited evidence). Calibrating on WiCE -- which includes
17 `partially_supported` SUBTLE-overreach items -- measures whether the judge's support threshold matches
expert human judgment, especially its sensitivity to subtle overreach (a claim that is only PARTIALLY
supported). The closed-book WiCE gold calibrates the JUDGE only; it NEVER directly grades an open-book
report (the role separation that resolves the Phase 18-21 construct VOID; D-13).

## The verdict enum and its gold mapping (LOAD-BEARING -- read before the prompt)

The judge returns one of exactly two verdicts, matching the frozen `mccFromPairs` enum
(`eval/lz-eval-mcc.mjs`) and the WiCE remap (`remapLabel` in `eval/lz-eval-dataset.mjs`):

| Verdict | When | WiCE gold label it must match |
|---------|------|-------------------------------|
| `unrefuted` | the evidence FULLY supports the claim -- every part of the claim is established by the evidence | `supported` |
| `refuted` | the evidence does NOT fully support the claim -- it contradicts the claim, OR part of the claim is unsupported / overreaches beyond what the evidence establishes, OR the evidence is insufficient to establish the full claim | `not_supported` AND `partially_supported` |

THE SUBTLE CASE (the whole point of the WiCE inclusion, D-13): a claim that is only PARTIALLY supported --
where SOME portion is supported but ANOTHER portion is NOT established by the evidence -- is `refuted`, NOT
`unrefuted`. FULL support is required for `unrefuted`. A judge that treats partial support as `unrefuted`
fails the 17 subtle items (false-upholds -> depressed MCC -> the gate correctly does not clear). The prompt
below states this explicitly so the judge's threshold aligns with WiCE's "supported = fully supported".

## Presentation contract (what the harness supplies per item)

- `CLAIM`: the WiCE `claim` text, verbatim.
- `CONTEXT`: the WiCE `meta.claim_context` (background to interpret what the claim refers to; e.g. which
  film "the film" denotes). It is an INTERPRETATION AID ONLY -- the support judgment is made solely against
  the EVIDENCE, never the context. Omitted when the record has no `claim_context`.
- `EVIDENCE`: the WiCE `evidence` sentences joined with newlines, verbatim (including any `(meta data)`
  title/author lines). This is the source document the claim is judged against.
- The harness NEVER supplies the gold `label`, the `supporting_sentences`, or any derived gold -- those are
  the held-back answer (anti-leak; asserted by the harness test).

## The frozen prompt (verbatim -- this is what each judge sub-agent is given)

```
You are a careful fact-checking judge. You are given a CLAIM and a body of EVIDENCE (excerpts from a
single source document). Decide, using ONLY the provided EVIDENCE, whether the evidence supports the
claim. This is a CLOSED-BOOK task: do NOT use any outside knowledge, and do NOT search. Base your
verdict solely on what the EVIDENCE states or directly entails. If a CONTEXT is given, use it ONLY to
understand what the claim refers to (for example, which person or film a pronoun or "the film" denotes);
never treat the CONTEXT itself as evidence.

Return exactly ONE of two verdicts:

- "unrefuted" -- the EVIDENCE FULLY supports the claim. Every part of the claim is established by the
  evidence. There is no portion of the claim that the evidence leaves unsupported.

- "refuted" -- the EVIDENCE does NOT fully support the claim. Use this verdict if ANY of the following
  hold:
    * the evidence contradicts the claim; OR
    * the evidence supports only PART of the claim and leaves another part unestablished (partial
      support / overreach -- the claim says more than the evidence establishes); OR
    * the evidence is insufficient to establish the full claim.

Decisive rule: FULL support is required for "unrefuted". A claim that is only PARTIALLY supported -- where
some portion is supported but another portion is not established by the evidence -- is "refuted". When in
doubt about whether every part of the claim is established, prefer "refuted".

Judge deterministically. Do not reward fluent or plausible-sounding claims that the evidence does not
actually establish.

Output STRICT JSON on a single line and nothing else:
{"verdict": "unrefuted" | "refuted", "reasoning": "<= 40 words, citing the deciding part of the evidence>"}

CLAIM:
<the claim text>

CONTEXT (interpretation aid only; not evidence):
<the claim_context, or "(none)">

EVIDENCE:
<the evidence document>
```

## Transport + fidelity notes (recorded; not silent)

- TRANSPORT: the judge is an Opus Agent sub-agent on the Claude SESSION pool (`callJudge`,
  `eval/lz-eval-parity-driver.md`), spawned per item; it RETURNS the strict-JSON verdict and the
  orchestrating session persists it to `eval/.cache/p22-baseline/calibration/<uid>.verdict.json`. The
  judge has no file tools (read-only persona); the session writes the verdict file. NO `claude -p`, NO
  out-of-family, NO Anthropic API (D-18).
- TEMPERATURE FIDELITY CAVEAT (flagged, not hidden): the driver specifies temp 0. The Agent sub-agent
  transport does not expose an explicit temperature knob, so the judge runs at the sub-agent default, not a
  forced 0. The prompt requests deterministic, evidence-only judgment to approximate temp-0 behavior. This
  is a known property of the chosen Agent-sub-agent transport (the same transport the driver selected for
  `callJudge`/`callVoter`); it is recorded here as a fidelity limit on the calibration, not a silent
  assumption. It applies identically to the Stage-3 grading judge, so it does not bias the parity read
  between systems.
- ONE ITEM PER CALL: one calibration item per sub-agent call (no batching of items into one prompt), so a
  per-item verdict file is the unit of resumability (skip-on-resume).

## Review record (PAR-08 / project Review-before-use MUST)

This prompt MUST be independently content-reviewed against the construct (the verdict/gold mapping above,
the subtle-overreach requirement, the anti-leak presentation contract, the closed-book instruction) BEFORE
it drives the metered calibration. The review verdict + reviewer + date are recorded in the Plan 22-05
execution record / SUMMARY when the review completes.

## Cross-reference

- `eval/lz-eval-parity-prereg.md` -- Section (iv) the MCC bar + AMENDMENT RECORD 2 (WiCE-only N=60).
- `eval/lz-eval-parity-driver.md` -- Stage 2 (the `callJudge` calibration transport; node scores from disk).
- `eval/lz-eval-judge-calibration.mjs` -- `judgeCalibrationGate` + `goldFromWiceLabel` + `JUDGE_MCC_BAR`.
- `eval/lz-eval-parity-calibration-harness.mjs` -- materializes the per-item payload (anti-leak) + scores
  the landed verdicts via the frozen gate, with uid-ordered positional alignment.
- `eval/lz-eval-dataset.mjs` -- `remapLabel` (the canonical WiCE label -> verdict/subtle remap).
