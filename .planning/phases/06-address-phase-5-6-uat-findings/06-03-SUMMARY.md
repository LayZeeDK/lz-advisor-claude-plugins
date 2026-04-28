---
phase: 06-address-phase-5-6-uat-findings
plan: 03
subsystem: testing
tags: [uat, pattern-d, web-tools, jsonl-trace, claude-cli, storybook, compodoc, nx, regression-baseline]

# Dependency graph
requires:
  - phase: 05.6-diagnose-e-runtime-regression-and-re-run-full-compodoc-uat-t
    provides: "Plan 07 runner shape (run-all.sh, run-session.sh, tally.mjs) reused verbatim with Phase 6 path constants"
  - phase: 05.4-address-uat-findings-a-k
    provides: "Original 6-session Compodoc/Storybook UAT prompt fixtures preserved as the regression baseline"
provides:
  - "uat-pattern-d-replay/ infrastructure under Phase 6 phase directory"
  - "6 reshaped Pattern D UAT prompts that classify unambiguously into D-04 class assignments"
  - "tally.mjs with web_uses metric column counting WebFetch + WebSearch tool_use events (Plan 04 Stage 2 gate signal)"
  - "Regression-baseline preservation: Phase 5.4 originals untouched (T-05.5-13 mitigation)"
affects: [06-04 verification gate, future Pattern D coverage assertions, KCB-economics smoke promotion]

# Tech tracking
tech-stack:
  added: []  # No new dependencies - reuses Node.js v24, ripgrep 14.1.0, Bash, claude CLI already installed
  patterns:
    - "Reshaped-prompts-not-edited-originals (T-05.5-13 regression-baseline preservation pattern)"
    - "Anti-Pattern-A reshape: prompts strip inlined documentation blocks so Pattern D's web-first ranking decides orient"
    - "Skill-suffixed prompt filenames mapped via case-statement in run-all.sh (session-N-<skill>.txt)"

key-files:
  created:
    - ".planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-all.sh"
    - ".planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-session.sh"
    - ".planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/tally.mjs"
    - ".planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-1-plan.txt"
    - ".planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-2-execute.txt"
    - ".planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-3-review.txt"
    - ".planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-4-plan.txt"
    - ".planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-5-execute.txt"
    - ".planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/prompts/session-6-security-review.txt"
  modified: []

key-decisions:
  - "Skill-suffixed prompt filenames (session-N-<skill>.txt) preserved in run-all.sh via case-statement mapping rather than rewriting the loop body; trace files retain unsuffixed naming (session-N.jsonl)"
  - "tally.mjs Web column inserted between Adv and Tools (positional choice) so the new metric reads naturally next to the existing tool-use count without disrupting the established Adv-first ordering"
  - "S2 prompt taken verbatim from RESEARCH Code Example 2 (canonical migration/deprecation reshape); other 5 prompts composed against D-04 example reference shapes"

patterns-established:
  - "Phase 6 Pattern D replay infrastructure mirrors Phase 5.6 Plan 07's runner shape one-for-one with only path/metric extensions"
  - "Reshaped UAT prompts open with /lz-advisor.<skill> slash prefix (T-05.5-15 invariant), name a version-aware question, never inline documentation blocks"

requirements-completed: [D-04]

# Metrics
duration: 5min
completed: 2026-04-28
---

# Phase 6 Plan 03: UAT Pattern D Replay Infrastructure Summary

**Phase 6 UAT replay scaffolding shipped: Phase 5.6 Plan 07 runners ported to uat-pattern-d-replay/, tally.mjs extended with web_uses metric column, and 6 reshaped Pattern D prompts composed per D-04 class assignments with zero inlined documentation blocks (anti-Pattern A).**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-28T11:53:51Z
- **Completed:** 2026-04-28T11:58:30Z
- **Tasks:** 3
- **Files modified:** 9 created (2 runners + 1 metrics aggregator + 6 reshaped prompts)

## Accomplishments

- Stood up `uat-pattern-d-replay/` directory under Phase 6 with `prompts/` and `traces/` subdirectories.
- Copied `run-all.sh` and `run-session.sh` from Phase 5.6 Plan 07 with three minimal edits: RUN_DIR pointing at Phase 6, top-of-file comment block updated to "Phase 6 Pattern D replay" wording, and a per-session prompt-name case statement mapping session-N to the new skill-suffixed filenames (session-N-<skill>.txt).
- Copied `tally.mjs` from Phase 5.6 Plan 07 with the base-path constant updated to Phase 6 traces directory and extended with a `webUses` per-session counter that increments on `tool_use` events where `c.name === 'WebFetch' || c.name === 'WebSearch'`. Added a Web column to the tab-separated header (positioned between Adv and Tools) and to the per-row console.log array. `node --check` passes.
- Composed six reshaped UAT prompts under `prompts/` matching D-04's Pattern D class assignments. Each prompt opens with `/lz-advisor.<skill>` (T-05.5-15 invariant), names a version-aware question, and includes a verification cue (e.g., "check the docs", "consult npm security advisories") explicitly inviting WebFetch / WebSearch. NONE inline a documentation block (no `---` separator, no `<fetched>` tag, no `title:` frontmatter, no fenced docs excerpt) -- Pitfall 1 from `06-RESEARCH.md` (Pattern A would override Pattern D otherwise).
- Phase 5.4 prompt originals at `.planning/phases/05.4-.../uat-5-compodoc-run/prompts/` are byte-identical (regression-baseline preservation, T-05.5-13 mitigation pattern).

## Pattern D Class Classification

Per R-02 mandate, manual classification of each reshaped prompt against the D-01 four-class taxonomy:

| Session | Skill | Reshape framing | Assigned class (D-04) | Manual classification | Match |
|---------|-------|-----------------|----------------------|----------------------|-------|
| S1 | plan | "current recommended approach for Storybook 10.x docs configuration in 2026" | Class 2: API currency | Class 2 (asks "current recommended approach", version-aware on a documented config pattern) | Yes |
| S2 | execute | "setCompodocJson may have been removed between Storybook 9 and 10 -- check the migration guide" | Class 3: migration / deprecation | Class 3 (existence claim across versions; explicit migration-guide cue) | Yes |
| S3 | review | "alignment with the current Storybook 10.x documentation" | Class 2: API currency | Class 2 (asks whether implementation matches current docs; version-aware on documented behavior) | Yes |
| S4 | plan | "Was the Nx Compodoc generator deprecated, replaced, or kept between recent Nx releases?" | Class 3: migration / deprecation | Class 3 (deprecated/replaced/kept question across Nx versions) | Yes |
| S5 | execute | "How does TypeScript handle dynamic-import type narrowing at compile time" | Class 4: language semantics | Class 4 (asks how the language behaves at compile time; suggests empirical compile or language-spec WebFetch) | Yes |
| S6 | security-review | "current advisory and maintenance status of @compodoc/compodoc as of 2026-Q1" | Class 2: API currency (supply-chain lens) | Class 2 (current advisories / maintenance is API-currency on the package metadata; npm advisories + GitHub Security tab are the authoritative web sources) | Yes |

All six prompts classify unambiguously into their assigned classes. No prompt simultaneously triggers multiple classes (per Pitfall 1 / R-02 disambiguation guidance, the web-first class would have been preferred had any been ambiguous).

## Task Commits

Each task was committed atomically:

1. **Task 1: Copy Phase 5.6 Plan 07 runners with Phase 6 paths** - `94cb3b6` (feat)
2. **Task 2: Copy tally.mjs and extend with web_uses metric column** - `c2b41a4` (feat)
3. **Task 3: Compose 6 reshaped Pattern D UAT prompts** - `b99117c` (feat)

**Plan metadata commit:** Pending (orchestrator owns SUMMARY.md commit per parallel-execution mode)

## Files Created/Modified

- `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-all.sh` - Sequential 6-session UAT runner. RUN_DIR points at Phase 6; session-prompt mapping uses case-statement for skill-suffixed filenames; preserves the canonical `claude --model sonnet --effort medium --plugin-dir ... --dangerously-skip-permissions -p ... --verbose --output-format stream-json` invocation block and the `/lz-advisor.` preflight assertion.
- `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-session.sh` - Single-session runner. Header comment updated to "Phase 6 Pattern D replay". All other lines byte-identical to the Phase 5.6 Plan 07 source (no RUN_DIR constant in this file by design; paths are passed as args).
- `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/tally.mjs` - JSONL trace metrics aggregator. base path -> Phase 6 traces. webUses counter (`let webUses = 0`) declared per-session; incremented inside the existing `tool_use` loop when `c.name === 'WebFetch' || c.name === 'WebSearch'`; added to rows.push object; Web column header inserted between Adv and Tools; `r.webUses` added to per-row console.log array. Node syntax check passes.
- `.../prompts/session-1-plan.txt` - S1 reshape: API-currency on Storybook 10.x docs config in an Nx Angular library.
- `.../prompts/session-2-execute.txt` - S2 reshape: migration/deprecation on setCompodocJson removal between Storybook 9 and 10. Verbatim from RESEARCH Code Example 2.
- `.../prompts/session-3-review.txt` - S3 reshape: API-currency review against current Storybook 10.x documentation.
- `.../prompts/session-4-plan.txt` - S4 reshape: migration/deprecation on Nx Compodoc generator currency in 2026-Q1.
- `.../prompts/session-5-execute.txt` - S5 reshape: language-semantics on TypeScript dynamic-import type narrowing at compile time.
- `.../prompts/session-6-security-review.txt` - S6 reshape: API-currency framing on @compodoc/compodoc supply-chain advisory + maintenance status.

## Decisions Made

- **Skill-suffixed prompt filenames preserved via case-statement mapping in run-all.sh.** Phase 5.6 Plan 07's source uses unsuffixed `session-$N.txt`; Phase 6 needed `session-N-<skill>.txt` per CONTEXT.md naming. Inserted a case statement immediately inside the `for N in 1 2 3 4 5 6` loop rather than reshaping the loop body or coupling skill-name choice to N. Trace files retain `session-$N.jsonl` (unsuffixed) so tally.mjs's existing `path.join(base, 'session-${n}.jsonl')` continues to work without changes.
- **Web column positional choice in tally.mjs (between Adv and Tools).** The new metric reads naturally next to the advisor count and the total tool count, gives the Plan 04 Stage 2 web-usage gate a single-glance visual signal, and does not break existing readers of the tally output (Adv first, Tools next, intermediate Web column inserted -- no existing column shifted out of recognizable order).
- **S2 verbatim from RESEARCH Code Example 2.** The plan explicitly directs S2 to use the RESEARCH-grade canonical migration/deprecation reshape verbatim. The other five prompts were composed against D-04 example reference shapes with version cues, deliverable verbs, and verification cues per Pattern 3 in 06-RESEARCH.md.

## Deviations from Plan

None - plan executed exactly as written. All three tasks committed atomically; all acceptance criteria pass.

## Issues Encountered

**Git Bash regex parsing quirk on slash-prefix verification.** The plan's acceptance criterion `head -1 ... | rg -q '^/lz-advisor\.'` failed under this Git Bash + ripgrep 14.1.0 environment (rg returned exit code 1 even though the file content begins literally with `/lz-advisor.plan`). The equivalent pattern `^[/]lz-advisor\.` (which the runner's preflight uses on line 30 of run-all.sh and line 15 of run-session.sh) works as expected. Verified the prefix correctness via two alternative methods: (a) the `^[/]lz-advisor\.` regex used by the preflight assertion; (b) Bash's `case "$FIRST" in /lz-advisor.*) ... esac` glob match. Both confirm all 6 prompts open with the canonical `/lz-advisor.<skill>` prefix. The runner scripts use the working pattern, so the UAT preflight will not falsely reject any of the 6 prompts at runtime. No prompt content fix needed -- the issue is in the verification regex, not the prompt files.

## Threat Surface Scan

No threat-model amendments needed. The threat register's four entries (T-06-03-01 through T-06-03-04) are addressed exactly as planned:

- **T-06-03-01 (Tampering -- shell-injection on prompt body):** Mitigation inherited verbatim from Phase 5.6 Plan 07. `PROMPT_BODY=$(cat "$PROMPT")` then double-quoted `-p "$PROMPT_BODY"` prevents word-splitting and glob expansion. Reshaped prompts are author-controlled fixtures and never include `<fetched>` tags or YAML frontmatter (verified, no `title:` line in any prompt).
- **T-06-03-02 (Information disclosure -- traces under uat-pattern-d-replay/traces/):** Accept. Same surface as Phase 5.6 Plan 07; explicit user opt-in via Phase 6 / 06-CONTEXT.md.
- **T-06-03-03 (Tampering -- tally.mjs metric extension):** Mitigated. `node --check tally.mjs` passes. The extension is purely additive (new counter, new column); no existing metric logic changes.
- **T-06-03-04 (Information disclosure -- reshaped prompt files):** Accept. Public-facing fixture content; ASCII-only confirmed; no PII or secrets.

## User Setup Required

None - no external service configuration required. The infrastructure is ready for Plan 04 to invoke `bash run-all.sh` against plugin 0.8.5 (which Plan 02 ships) once Plan 02 has shipped its Pattern D reference file and version bump.

## Next Phase Readiness

- The UAT replay infrastructure is complete and ready for Plan 04 to execute.
- Plan 04 will run `run-all.sh` against plugin 0.8.5, then `node tally.mjs > tally.txt`, and verify the new web_uses column shows non-zero web tool usage in at least 4 of 6 sessions (the gate signal codifying the user directive "We must see WebSearch+WebFetch usage").
- All six reshaped prompts are pre-classified per D-04 and verified anti-Pattern-A (no inlined source). Pattern D's first-orient-action ranking should win on every session that classifies into Class 2/3/4.
- Phase 5.4 originals at `.planning/phases/05.4-.../uat-5-compodoc-run/prompts/` remain the regression baseline. Future re-runs against Phase 6 vs Phase 5.4 prompt sets can quantify Pattern D's behavior delta directly.

## Self-Check: PASSED

Verification of all claimed artifacts and commits:

- `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-all.sh` -- FOUND
- `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/run-session.sh` -- FOUND
- `.planning/phases/06-address-phase-5-6-uat-findings/uat-pattern-d-replay/tally.mjs` -- FOUND
- `.../prompts/session-1-plan.txt` -- FOUND
- `.../prompts/session-2-execute.txt` -- FOUND
- `.../prompts/session-3-review.txt` -- FOUND
- `.../prompts/session-4-plan.txt` -- FOUND
- `.../prompts/session-5-execute.txt` -- FOUND
- `.../prompts/session-6-security-review.txt` -- FOUND
- Commit `94cb3b6` (Task 1) -- FOUND in git log
- Commit `c2b41a4` (Task 2) -- FOUND in git log
- Commit `b99117c` (Task 3) -- FOUND in git log

---
*Phase: 06-address-phase-5-6-uat-findings*
*Completed: 2026-04-28*
