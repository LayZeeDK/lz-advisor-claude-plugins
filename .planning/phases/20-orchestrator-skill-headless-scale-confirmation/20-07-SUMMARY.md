---
phase: 20-orchestrator-skill-headless-scale-confirmation
plan: 07
subsystem: lz-deep-research SKILL (cross-session resumability)
tags: [resume, blackboard, idempotent-aggregator, anti-drift-lockstep, degenerate-aggregate-trap, headless, D-21]
requires:
  - "the immutable per-phase blackboard run-dir (Phase 20 schema: scope.md / candidates / claims+excerpts+sources / survivors.json / votes / report.md)"
  - "the off-model idempotent aggregator (scripts/lz-deep-research-aggregate.mjs) -- CONSUMED byte-identical, ZERO changes"
  - "the reproducible stage-1 cluster ids (mergeClusters deterministic) that are already the vote-file keys"
provides:
  - "cross-session resumability as a SHIPPED, user-facing lz-deep-research SKILL feature (a run that dies at HTTP 429 resumes from disk and reuses all prior search/fetch/extract)"
  - "two additive blackboard records: decompose.json (Phase-1 done-signal + Gate-1-spend skip) and run_state.json { stage2_complete: true } (the authoritative stage-2 sentinel)"
  - "the degenerate-aggregate trap mitigation (report.md absent -> always re-run idempotent stage 2; never infer completion from survivors.json)"
  - "an anti-drift lockstep integration fixture (eval/lz-eval-resume-fixture.test.mjs) asserting the SKILL/schema field-name identity + the trap + cluster-keyed missing-vote detection"
affects:
  - "the staged live-cert RUN (re-authored 20-05): its long interruptible spend can now resume from disk after an org-limit (HTTP 429) interruption"
tech-stack:
  added: []
  patterns:
    - "per-phase done-signal check + conditional skip (resume = phase-granularity skip-already-done, mirroring persistDualRunVote at phase granularity)"
    - "slug-match auto-detect resume (headless-safe; no AskUserQuestion) + explicit --resume <run-id> fallback"
    - "sentinel-over-inference: completion is signalled by run_state.json + report.md, never inferred from survivors.json confidence values"
    - "anti-drift lockstep: an additive record added to SKILL + schema + orchestration in ONE change + a dev-time fixture asserting field-name identity"
key-files:
  created:
    - "eval/lz-eval-resume-fixture.test.mjs (anti-drift lockstep integration fixture; tracked eval source; builds its run-dir in a temp dir)"
  modified:
    - "plugins/lz-advisor/skills/lz-deep-research/SKILL.md (<resume> section + per-phase skip guards + decompose.json/run_state.json writes + the degenerate-aggregate mitigation)"
    - "plugins/lz-advisor/references/lz-deep-research-schema.md (additive decompose.json + run_state.json records + the per-phase done-signal layout + the degenerate-aggregate caveat)"
    - "plugins/lz-advisor/references/lz-deep-research-orchestration.md (section 5: the slug-match resume UX + the --resume fallback + the stage-2 degenerate-aggregate guard)"
decisions:
  - "D-21 fold-in: cross-session resumability ships as a user-facing SKILL feature (promotes v2 SCALE-03 to in-scope); the WORKFLOW re-architecture stays DEFERRED to a later milestone."
  - "ZERO aggregator changes: the SKILL counts votes itself, pre-validates vote JSON, re-dispatches damaged seats, and re-drives the UNCHANGED idempotent aggregator; run_state.json is SKILL-written, deliberately kept OUT of the aggregator."
  - "Completion is decided by the run_state.json { stage2_complete: true } sentinel + report.md, NEVER by survivors.json confidence values (the degenerate-aggregate trap)."
metrics:
  duration_minutes: 38
  completed: 2026-06-20
  tasks: 3
  files_changed: 4
---

# Phase 20 Plan 07: Cross-Session Resumability (lz-deep-research SKILL) Summary

Folded cross-session resumability into the lz-deep-research SKILL as a shipped, user-facing feature: a run that dies mid-pipeline at the org usage / spend limit (HTTP 429) now resumes from its on-disk blackboard, reuses every prior search / fetch / extract artifact, casts only the missing cluster-keyed vote seats, and recovers via a headless-safe slug-match `<resume>` UX -- with ZERO changes to the off-model idempotent aggregator and the SKILL/schema/orchestration surfaces held in anti-drift lockstep, proven by a new integration fixture (the Montreal partial recovery as the canonical case).

## What was built

- **Task 1 (`00f4991`)** -- The additive schema + orchestration records.
  - `lz-deep-research-schema.md`: the run-dir layout block now shows the full per-phase done-signal set (scope.md / decompose.json / candidates / claims+excerpts+sources / survivors.json [stage-1, with the degenerate caveat] / votes/<clusterN>-<seat>.json / run_state.json [stage-2 sentinel] / report.md [terminal]); two new additive record sections -- `decompose.json { angles:[{id,text,priority}], gate1_note, selected_urls }` and `run_state.json { stage2_complete: true }` -- each stating explicitly the aggregator does NOT read it; a stage-ownership row for each; and the degenerate-aggregate caveat.
  - `lz-deep-research-orchestration.md`: a new section 5 documenting the slug-match resume auto-detect heuristic, the `--resume <run-id>` fallback, and the stage-2 degenerate-aggregate guard.

- **Task 2 (`cb0c34f`)** -- The SKILL.md resume path.
  - A `<resume>` section BEFORE Phase 0: normalize the question to a slug, scan `.lz-research/` for a partial run dir (no report.md) whose slug/scope matches, pick the most recent, surface `Resuming <run-id>`, jump to the first incomplete phase; `--resume <run-id>` fallback; works headless under `-p`.
  - Per-phase skip guards (Phase 0 scope.md; Phase 1 decompose.json; Phase 2 per-sub-angle candidates/; Phase 3 per-source claims+excerpts+sources; Phase 5 missing-vote-seats-only; Phase 6 report.md).
  - Phase 1 writes `decompose.json` right after Gate 1, BEFORE any search worker (so resume skips decompose AND the Opus Gate-1 spend).
  - Phase 5 writes `run_state.json { stage2_complete: true }` only after a clean stage-2 exit.
  - The degenerate-aggregate mitigation: when report.md is absent, ALWAYS re-run the idempotent stage-2 tally after filling missing votes; NEVER infer completion from survivors.json; a non-zero aggregator exit stays a RUN FAILURE.

- **Task 3 (`6eeb626`)** -- The anti-drift lockstep integration fixture (`eval/lz-eval-resume-fixture.test.mjs`).
  - Builds a partial Montreal run-dir in a temp dir: claims/ + excerpts/ + sources/ + candidates/ complete; a DEGENERATE all-Unsupported stage-1 survivors.json; cluster0's three seats cast + cluster1's three missing (cluster-keyed); NO report.md / run_state.json.
  - Proves the degenerate-aggregate trap is caught: re-running the UNCHANGED idempotent aggregator after filling the missing seats OVERWRITES the premature all-Unsupported with the true post-vote tally (cluster0/1 -> High).
  - Proves cluster-keyed missing-vote detection (resume casts only the gap; no re-keying) + aggregator idempotency over the filled dir.
  - The LOCKSTEP identity: the decompose.json / run_state.json field names + the per-phase done-signals are documented in BOTH SKILL.md AND the schema reference -- a drift fails the test.
  - 8 tests, FILE form, ASCII-only, zero spend, one-directional eval -> runtime import.

## Verification

- `node --test eval/lz-eval-resume-fixture.test.mjs` -> EXIT 0 (8/8 pass, FILE form, on-disk fixture + idempotent aggregator, zero spend).
- All 4 plan files ASCII-only (the node `-e` ASCII verify exits 0 for each).
- ZERO aggregator changes: `git status --short plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` is clean.
- No cross-skill body references introduced (the only `lz-plan`/`lz-execute`/etc. mentions are the pre-existing SKILL frontmatter `description` disambiguation, not body references; my additions introduce none).
- Discrimination sanity check (independent of the suite): with no votes the aggregator tally is `Unsupported`; with 3 unrefuted seats it is `High` -- confirming the trap test's overwrite assertion genuinely depends on the filled votes, not luck.
- My three commits (`00f4991`, `cb0c34f`, `6eeb626`) touched EXACTLY the 4 intended files -- no scope leak.

## Deviations from Plan

None - plan executed exactly as written. No deviation rules (1-4) fired; no auth gates; no architectural decisions.

## Concurrency note (not a deviation)

This plan ran on the shared `feat/deep-research` branch (the main checkout, NOT a git worktree -- `.git` is a directory and HEAD was already at the target base `6c03a8c`). The worktree branch-namespace check in the spawn prompt was therefore N/A (it is `if [ -f .git ]` worktree-only in the commit protocol). A concurrent agent's plan-20-06 commit (`db89374 feat(20-06): arm-A contrastive minimal-pair authoring`) interleaved between my Task 2 and Task 3 commits; it is not part of this plan and does not affect this plan's files or correctness. A pre-existing unstaged `.planning/STATE.md` modification was present in the working tree at start; it is the orchestrator-owned shared file and was left untouched and uncommitted (per the orchestrator's instruction).

## Known Stubs

None. The resume feature is fully wired directive prose in the SKILL body (it names the files, the skip conditions, the sentinel, and the re-run rule); the fixture exercises the real on-disk state machine + the real idempotent aggregator. No hardcoded empty values, placeholder text, or unwired data sources.
