# lz-deep-research SKILL resumability -- scoping + Sonnet/Opus classification

**Date:** 2026-06-20. **Status:** scoped (read-only architecture assessment by a Sonnet Plan agent +
main-session sanity-check). NOT yet planned/built. Candidate to become a NEW PHASE (promotes v2 backlog
SCALE-03 "full crash-resumability" to in-scope, now a SHIPPED user-facing requirement).

## Why (user directive)
Runs die mid-pipeline at the org usage/spend limit (HTTP 429) and lose partial work; a re-run re-pays for
search/fetch/extract. Resumability must be a SHIPPED, user-facing skill feature -- end users hit usage
limits too and must recover + resume their own runs. (The eval VOTING harness is already resumable via
persistDualRunVote; the gap is the SKILL.)

## HEADLINE: classification (what the user asked)
**Opus-level DESIGN, Sonnet-level component IMPLEMENTATION.** This is the advisor pattern: Opus designs the
subtle state-machine; Sonnet executes the bounded edits.
- **Opus (design):** the stage-1-vs-stage-2 discrimination / sentinel strategy (the degenerate-aggregate
  trap); the headless slug-match resume-detect heuristic spec (no AskUserQuestion under `-p`); partial-write
  detection prose that does not violate the aggregator ContractError discipline; the exact anti-drift
  lockstep update set.
- **Sonnet (impl):** writing `decompose.json`; the per-phase skip guards; the schema/orchestration entries;
  the new test fixtures; the `run_state.json` sentinel write.

## Feasibility: YES, additively
The blackboard architecture (immutable per-phase files) makes resume = a per-phase completion check + a
conditional skip. Done-signals: scope.md / decompose.json / candidates+claims+excerpts+sources / survivors.json
(stage-1) / votes/<clusterN>-<seat>.json / survivors.json (stage-2, sentinel) / report.md.

### One new artifact: `decompose.json`
`{ angles:[{id,text,priority}], gate1_note, selected_urls }` -- written right after Gate 1, BEFORE any
search worker. Lets resume skip decompose + the Opus Gate-1 spend and know the angle->worker mapping +
selected URLs for the skip checks. Additive to the schema + run-dir layout; aggregator does NOT read it.

### Resume UX (recommended: slug-match auto-detect)
A `<resume>` skill-body section BEFORE scope: normalize the question to a slug, scan `.lz-research/` for a
partial run dir (no report.md) whose slug/scope matches, pick the most recent, surface "Resuming <run-id>",
jump to the first incomplete phase. Works under `-p` (no interactive prompt). Fallback: explicit
`--resume <run-id>`.

## THE correctness trap (highest risk): the degenerate-aggregate problem
A crashed run can leave a survivors.json that is a PREMATURE stage-1 product (Montreal: 20/20 Unsupported,
written before stage-2 tally). A naive resume that sees survivors.json + jumps to report would emit a
silently-wrong all-Unsupported report. **Mitigation:** when `report.md` is absent, ALWAYS re-run aggregate
stage 2 (the aggregator is idempotent + cheap) after filling missing votes; back it with an explicit
`run_state.json { stage2_complete: true }` sentinel (additive; written by the skill, not the aggregator).
NEVER infer completion from survivors.json confidence values alone.

## Verified non-issues (resolved my earlier worry)
- **vote_context.json is NOT needed for resume.** Cluster IDs are already in survivors.json AND used as the
  vote-file keys; the aggregator reads `votes/<clusterId>-<seat>.json` directly. Confirmed on the Montreal
  partial: vote filenames (cluster11-1.json) match survivor ids (cluster11) exactly. No keying re-derivation.
- **Cluster IDs are reproducible** from the immutable claims/ (mergeClusters is deterministic), so existing
  votes stay valid even if aggregate stage-1 is re-run.

## Aggregator changes: ZERO recommended
It is already idempotent (pure function of run-dir contents) and overwrites survivors.json each call. Optional
future: a `--stage` flag or a votes-readable stdout signal -- NOT required for MVP (the skill counts votes
itself, pre-validates vote JSON before calling, re-dispatches damaged seats).

## Scope (rough)
- `SKILL.md` -- prose: new `<resume>` section + per-phase skip guards + decompose.json/run_state.json writes (+50-80 lines).
- `references/lz-deep-research-schema.md` -- additive: decompose.json + run_state.json records + run-dir layout (+20-30).
- `references/lz-deep-research-orchestration.md` -- additive: resume UX + slug-match heuristic (+20-30).
- `scripts/lz-deep-research-aggregate.mjs` -- 0 changes.
- NEW eval/integration fixture: a partial-verify run-dir + expected resume behavior (anti-drift lockstep test).

## Montreal partial recoverability (verified)
Cleanly recoverable: claims/14 + excerpts/14 + sources/14 + candidates/5 complete; survivors.json a valid
stage-1; votes 18 of 60 present (**42 missing**, corrected from the agent's inconsistent "24"; 13 clusters
zero-vote), correctly cluster-keyed. Resume = cast 42 missing seats (session pool, ~9 sub-waves of 5) -> re-run
aggregate stage 2 -> Gate 2 -> report. Reuses ALL search/fetch/extract. The degenerate stage-1 survivors.json
MUST be overwritten by stage-2 (the trap above), not consumed as-is.

## Next-step options (for the user)
1. **Plan resumability as a feature (GSD) -- Opus-designed, Sonnet-implemented.** It's now a shipped
   requirement; the design skeleton above seeds the plan. Montreal recovery becomes its first integration test.
2. **Quick one-off manual Montreal recovery** -- exercises most of the resume logic by hand first (42 voter
   seats + re-aggregate), salvages the data point, de-risks the design -- but spends session pool and needs
   the degenerate-aggregate handling done right even as a one-off.
3. Defer until the certification methodology (dense-trap arm construction) is also settled, then plan both.
