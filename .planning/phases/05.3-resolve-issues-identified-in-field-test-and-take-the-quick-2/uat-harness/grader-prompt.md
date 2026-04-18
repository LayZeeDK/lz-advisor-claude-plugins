# UAT Grader Prompt (Phase 5.3)

This is the prompt passed to the grader subagent spawned by the
Phase 5.3 UAT orchestrator AFTER the 8 UAT runners complete.

## Your assignment

You receive 8 metrics JSON payloads (4 skills x 2 passes) returned by
the UAT runners. Write `.planning/phases/05.3-resolve-issues-identified-in-field-test-and-take-the-quick-2/05.3-UAT-RESULTS.md`.

The results file has these sections:

1. ## Run Metadata -- 9 subagent IDs, Claude Code versions, plugin
   commits (baseline SHA, post-fix SHA), run timestamps.
2. ## Summary Table -- one row per {skill, pass} cell, columns: success,
   tool_calls, turns, word_count, failure_mode, model_id.
3. ## A/B Comparison -- for each of the 4 skills, pre-fix vs post-fix
   on all numeric metrics. Expected direction per 05.2-FIELD-TEST.md
   and 05.3-RESEARCH.md A/B Measurement Methodology.
4. ## Acceptance Gate Verdict per D-04
     (a) First-try success rate >= 80% across 7 equivalent consultations
         across all 4 skills in the post-fix pass
     (b) Advisor averages <= 4 tool calls per consultation across the
         post-fix pass
     BOTH (a) AND (b) must pass for the phase to close green. Label
     the verdict PASS or FAIL explicitly.
5. ## UAT 4 Tone Drift Analysis -- see rubric below.
6. ## Per-UAT-Item Verdicts (UAT 1, 2, 3, 4, 6) -- with evidence
   citations (which subagent, which metric).
7. ## Regression Flags -- any metric that got WORSE between baseline
   and post-fix on any skill, even if overall gate passes. Cross-skill
   regression guard per VALIDATION.md.
8. ## Recommendation -- if gate fails, reference D-05 (Phase 5.4
   insertion trigger). If gate passes, recommend closing 5.3 as
   verified.

## UAT 4 tone-drift rubric (3-dimension Likert 1-5)

For each of the 4 reviewer/security-reviewer transcript pairs (review
baseline, review post-fix, security-review baseline, security-review
post-fix), score the advisor's final response on three dimensions:

- Directness (1 = validation-forward / hedged phrasing like "It's
  important to note..." / 5 = direct and committing, opens with
  substantive content).
- Severity-classification consistency (1 = inconsistent with executor's
  initial ratings with no explanation / 5 = consistently confirms or
  revises with reasoning; uniform application across similar findings).
- Remediation specificity (1 = generic such as "validate inputs" /
  5 = actionable and concrete such as "use parameterized queries on
  line 42"; points to specific lines/functions/fixes).

Compare baseline vs post-fix scores per dimension per skill. Flag:
- Any dimension dropping by > 1 point: regression.
- Any dimension increasing by > 1 point: improvement.
- Stable: no change.

4.7 release notes warn that "more direct tone" may blunt tact. A
directness increase is expected; a severity-consistency or remediation-
specificity DROP is a concern to raise explicitly.

## Per-UAT-item verdict rules

- UAT 1 (tool-call count): pass if post-fix advisor avg <= 4 tool calls.
- UAT 2 (advisor 100-word cap): pass if >= 75% of post-fix advisor
  responses <= 110 words (10% tolerance) AND baseline-vs-post-fix trend
  is stable or improving.
- UAT 3 (reviewer/security-reviewer 300-word cap): same shape at 330w.
- UAT 4 (tone drift): pass if no dimension drops > 1 point.
- UAT 6 (maxTurns: 3 at xhigh): pass if no post-fix run has
  maxturns_exhausted == true.

## Model version integrity check

Reject the pass as invalid (ABORT verdict) if any run's
advisor_model_id is NOT claude-opus-4-7 (with or without [1m] suffix).
Per RESEARCH.md Risk 2, mixed Opus versions invalidate A/B comparison.
