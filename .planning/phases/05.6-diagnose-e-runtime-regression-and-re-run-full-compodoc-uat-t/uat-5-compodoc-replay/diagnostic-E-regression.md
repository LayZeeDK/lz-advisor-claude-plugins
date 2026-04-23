# Phase 5.6 Diagnostic: Finding E Regression

**Captured:** 2026-04-23
**Commit:** 82839e6 (plugin state; no plugin/smoke changes between 82839e6..HEAD, confirmed via `git log 82839e6..HEAD -- plugins/ .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/DEF-response-structure.sh`)
**Fixture:** `/lz-advisor.plan Add auth to this API. The frontend uses cookies.` (DEF-response-structure.sh line 40, verbatim)
**Regression signature:** `[ERROR] Finding E: no unverified-framing phrase in advisor response` (stage-diagnose-smoke.log run 2 of 2)

## Smoke Test Evidence

Two DEF smoke runs captured on current main. Results:

| Run | Finding D | Finding E | Word-budget | Finding F | Findings G+H |
|-----|-----------|-----------|-------------|-----------|--------------|
| 1   | [OK]      | [OK]      | [ERROR] 165w | [OK]      | [OK]         |
| 2 (canonical stage-diagnose-smoke.log) | [OK] | [ERROR] | [ERROR] 120w | [OK] | [OK] |

Non-determinism note: run 1 produced a green Finding E but over-budget response; run 2 reproduces the canonical Phase 5.5 Plan 06 regression signature (Finding E fail + over-budget). Both runs confirm the advisor CAN emit non-framed thin-context responses; the regression is a consistency failure, not a deterministic error. Both runs also show word-budget drift (165w/120w vs the 60w observed in Phase 5.5 stage-1-smoke.log) -- supporting evidence that advisor response shape for thin-context is drifting broadly, not just on the Assuming-frame dimension.

## Full $OUT_E Content

Extracted from E-raw.jsonl via extract-sd.mjs (stream-json JSONL capture of an independent `claude -p /lz-advisor.plan` re-issue with the literal DEF E fixture prompt). Size: 583 bytes (non-empty guard passes per T-05.5-16, threshold 100 bytes).

```
1. Ask the user to point to the actual API codebase -- do not produce a generic plan.
2. Frame it as a one-line blocker: "No API source found in this plugin repo; which repo/path hosts the API?"
3. Also request: language/runtime, framework, existing session store, and whether the frontend is same-site or cross-origin.
4. Do not scaffold auth speculatively; every load-bearing detail (framework, CSRF posture, cookie domain, session vs JWT) is unverified, so the output would be a checklist of Assuming-frames rather than actionable code.
5. Resume once the target repo is supplied.
```

Observed grep counts against the extracted output:
- `Assuming X (unverified), do Y. Verify X before acting.` (literal frame): 0 occurrences
- `Assuming`: 1 occurrence (inside item 4 prose, not as frame head)
- `unverified`: 1 occurrence (inside item 4 prose, not inside `(unverified)` parenthetical)
- `(unverified)`: 0 occurrences
- `Verify`: 0 occurrences
- `before acting.`: 0 occurrences
- Clarification-request language (`Ask the user`, `request:`, `Resume once`): 3 occurrences

## Drift Classification

**Category:** under-supply

**Evidence from $OUT_E:**
- Zero items use the literal `Assuming X (unverified), do Y. Verify X before acting.` frame. Thin-context fixture has at least 4 load-bearing unpackaged premises (framework, CSRF posture, cookie domain, session-vs-JWT) that genuinely depend on unverified context -- all four warrant inline frames per advisor.md line 169 ("state the two or three most load-bearing assumptions inline on their respective items and commit to the rest of the plan unconditionally").
- Item 4 actually NAMES the four unverified premises but refuses to frame them: "every load-bearing detail ... is unverified, so the output would be a checklist of Assuming-frames rather than actionable code." The advisor correctly identified the premises but defected to a clarification-request shape instead of emitting the frames.
- Items 1, 2, 3, 5 are clarification-request directives ("Ask the user", "request:", "Resume once"), which advisor.md line 147-148 EXPLICITLY forbids: "do not ask for clarification -- you have no follow-up turn. A clarification request is a dead-end that wastes the consultation."

**Secondary pattern:** clarification-request-defect. Not enumerated in the advisor.md Edge Cases forbidden-paraphrase list (lines 155-165), but equivalent contract violation to the forbidden-paraphrase list: both are "fails to emit the literal frame when context is thin." The forbidden-paraphrase list catches natural-language drift (`Given ...`, `If X then Y`, soft paraphrase); this is a shape-level drift (refuse-to-plan rather than frame-each-commitment).

**Comparison with Phase 5.4 baselines (RESEARCH.md R-07):**
- Post-plan07 GREEN state (E-runtime-trace-post-plan07.txt): "`[OK] Finding E: advisor used Assuming X (unverified) framing for thin-context task`" -- advisor emits inline framed items for the identical E fixture prompt.
- Pre-plan07 KNOWN-BAD state (E-runtime-trace-post-plan05.txt): advisor produced "Pre-Implementation Blockers table with 7 rows", used `Verify` 4 times, wrote `confirm before acting` (soft paraphrase form). The 2026-04-21 diagnostic footnotes this as "Opus recognized the unpackaged-context situation but paraphrased the literal frame into natural prose, losing the `Assuming` and `(unverified)` markers."
- Current (post-5.5, Phase 5.6 Plan 01 forward-capture) state: same defect mechanism as pre-Plan-07 but a cleaner variant -- the advisor defects into a 5-item clarification-request list rather than a Blockers table. Zero `Assuming ... (unverified), do ...` frames; zero `Verify`; zero `before acting.` The under-supply is total: 0 of 4 needed frames.

**Contrast with D fixture (D-sd.txt, same `claude -p` invocation pattern, cookie-auth-flavored full-context variant):**

```
1. Assuming npm + Node 20 LTS (unverified), do run `npm init -y` ... Verify npm + Node 20 LTS before acting.
2. Install devDeps: `npm i -D eslint vitest` ...
3. Create `.gitignore` with `node_modules/`, `coverage/`, `dist/`.
4. Write `.github/workflows/ci.yml`: ...
5. Commit `package.json`, `package-lock.json`, `.gitignore`, workflow; push to trigger run.
```

D fixture shows the textbook full-context density example shape exactly: 5 items, 1 Assuming-framed, 4 unconditional. The advisor's density calibration works perfectly when the fixture supplies enough context to match the single full-context example. On thin-context E, the same advisor has no anchor and defects.

## Identified Surface

**Fix surface:** Plan 05.5-03 density example (commit 84aaa5b) -- sole surface.

**Rationale link (how the observed drift maps to the surface):**
The current density example (advisor.md lines 60-68) is a SINGLE full-context calibration block: 5 items, 1 Assuming-framed (item 4: `Assuming Nx 19+ (unverified), do commit documentation.json...`), 4 unconditional. Opus 4.7 literal-following applies this single example as the target response shape for every consultation -- full or thin context. On the thin-context E fixture, the advisor correctly identifies 4 load-bearing unpackaged premises (item 4 of E-sd.txt enumerates them) but has no calibration anchor for "what does a 4-of-5 framed response look like?" It defects to the next nearest contract that advisor.md provides -- the general Response Structure guidance "lead with the recommendation" (line 134) combined with the Consultation Awareness framing for "conflicting evidence" (line 118) -- and produces a refuse-to-plan clarification list. This is a direct one-to-one reproduction of the Phase 5.4 pre-Plan-07 defect at a different prose surface: the Edge Cases forbidden-paraphrase list was the prior gap; the density-example calibration-deficit is the current gap.

**Evidence AGAINST D-02 cue / D-08 nudge as surface (Plan 05.5-02, commits 4c33b3c + 5941244 + 35f3ef1):**
- D-02 cue (framework-convention nudge to plan + execute SKILL.md orient phase) fires on EVERY plan-skill invocation. If D-02 cue were load-bearing for the E regression, the D fixture (D-sd.txt) would also show framework-enrichment drift. D fixture shows textbook 1-of-5 framing -- D-02 cue does not break the advisor's full-context shape.
- D-08 nudge (verbose-prompt reshape) applies only when the prompt-text heuristic in the skill fires. The E fixture prompt ("Add auth to this API. The frontend uses cookies.") is neither verbose nor directive-mixed, so D-08 nudge does not apply. Cannot be the regression surface on this fixture.
- R-05 two-worktree bisect would cost ~$6 to re-confirm what forward-capture already shows with HIGH confidence. Bisect is NOT triggered.

**Secondary pattern assertion:** The fix shape must teach BOTH a thin-context calibration point AND preserve the existing full-context calibration. Removing the full-context example would regress D fixture; adding a thin-context example without labels would dilute both. The CONTEXT.md D-03 prescription (two labeled density blocks, `### Density example (full-context, 95-100 words)` + `### Density example (thin-context, 95-100 words)`) is the shape that fits.

## Fix Rationale

**Recommended Plan 02 action:** Implement CONTEXT.md D-03 two-example density bifurcation.

- Replace single `### Density example (95-100 words)` block in `advisor.md` Output Constraint (lines 60-68) with two labeled blocks: `### Density example (full-context, 95-100 words)` (keep existing Nx/Compodoc 5-item content verbatim) + `### Density example (thin-context, 95-100 words)` (new, 4-of-5 items Assuming-framed, cookie-auth-flavored per R-02 draft).
- Plan 02 also implements CONTEXT.md D-05 in the same atomic commit: tighten DEF Finding E regex to literal-frame match per R-03 (`^\d+\. Assuming .+ \(unverified\), do .+\. Verify .+ before acting\.`) + add new Finding I count gate (`rg -c '^\d+\. Assuming '` >= 2). Shipping fix + tightened gate together follows the Phase 5.4 "prompt rule + smoke-test lock" pattern.
- No D-04 escalation required. Forward-capture evidence names density example as the sole surface.

**Recommended Plan 04 action (re-confirm fix):** Stage 0 DEF re-run after Plan 02 edits land. Expect all six assertions `[OK]` including the tightened Finding E and the new Finding I. If E still fails or I under-supplies, escalate to user -- but forward-capture confidence is HIGH that the fix will close the regression.

## Escalation Status

**Escalation triggered:** no
**Reason:** Forward-capture HIGH-confidence identifies Plan 05.5-03 density example (commit 84aaa5b) as the sole E regression surface. D-02 cue / D-08 nudge ruled out by D fixture textbook pass and by E fixture prompt not matching D-08 heuristic. CONTEXT.md D-04 escalation gate (D-02 cue named as SOLE surface) is NOT met; Plan 02 proceeds with D-03 two-example density fix per CONTEXT.md D-03.

## Sibling Captures (for completeness)

- `D-raw.jsonl` (74 KB, stream-json) + `D-sd.txt` (630 bytes): Captured per CONTEXT.md open question #7 to strengthen regression-locality evidence. Confirms full-context advisor behavior is correct (textbook 1-of-5 framing, matches existing density example exactly). Quoted in Identified Surface section above.
- `$OUT_F` / `$OUT_GH` (review / security-review): NOT captured. Diagnostic weight from E + D is sufficient and unambiguous; $OUT_F and $OUT_GH would require scratch git repo setup identical to DEF lines 11-17 to produce comparable traces (reviewer/security-reviewer both ran in the main stage-diagnose-smoke.log and both emitted [OK]). Skipping saves ~$2 without weakening the diagnostic.

## Supporting Artifacts

- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/uat-5-compodoc-replay/stage-diagnose-smoke.log` (run 2, canonical; contains the `[ERROR] Finding E` regression signature)
- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/uat-5-compodoc-replay/stage-diagnose-smoke-run1.log` (run 1, non-determinism evidence; Finding E passed spontaneously)
- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/uat-5-compodoc-replay/E-raw.jsonl` (70 KB, 41 lines, stream-json)
- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/uat-5-compodoc-replay/E-sd.txt` (583 bytes, advisor Strategic Direction extracted)
- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/uat-5-compodoc-replay/D-raw.jsonl` (72 KB, stream-json; full-context control)
- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/uat-5-compodoc-replay/D-sd.txt` (630 bytes; full-context advisor Strategic Direction)
- `.planning/phases/05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t/uat-5-compodoc-replay/extract-sd.mjs` (Node ESM extractor; non-empty-guard consumer)

**Confidence:** HIGH on classification (under-supply, clarification-request variant) and fix surface (Plan 05.5-03 density example); HIGH that Plan 02 D-03 two-example density will close the regression; MEDIUM on exact wording of new thin-context density example (Plan 02 owns the 95-100 word budget verification and Opus 4.7 literal-following calibration).
