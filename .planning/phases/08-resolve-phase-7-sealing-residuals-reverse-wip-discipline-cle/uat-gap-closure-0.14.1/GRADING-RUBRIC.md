# UAT Gap-Closure 0.14.1 - Grading Rubric

Behavioral proof of GAP-S9 + GAP-S10 closure on plugin 0.14.1. Structural proof already exists
(08-VERIFICATION.md gap-closure amendment, grep-confirmed). This UAT proves the rules FIRE in a
real session against ngx-smart-components.

## GAP-S9 - verify target by change surface

### S9-plan (Session 1, /lz-advisor.plan)
- [ ] S9-P1: Plan file contains a final Validate / verification step.
- [ ] S9-P2: That step's `Run:` command targets the Storybook surface
      (`nx storybook` | `build-storybook` | `nx run ...:build-storybook`), NOT `nx test` (unit).
      Rationale: the change surface is Storybook/Compodoc config, so the plan-skill
      "Emit a change-surface-matched Validate step" rule should pick the storybook target.

### S9-exec (Session 2, /lz-advisor.execute)
- [ ] S9-E1: At pre-commit verification (Phase 3.5), the executor SELECTS/attempts the Storybook
      target (build-storybook or storybook), NOT `nx test`, for the config change. (E.3 fired.)
- [ ] S9-E2 (bonus): Executor shows stale-daemon/cache awareness (nx daemon reset / NX_DAEMON
      / "fresh tooling state") per the E.3 tooling-freshness clause.

## GAP-S10 - final-advisor pack-then-trust

### S10 (Session 2, Phase 5 final consult)
- [ ] S10-1: Executor packs post-change file contents (a `## Relevant File Contents` block, or the
      commit diff) into the Phase 5 final-review consult prompt - not just a prose summary.
- [ ] S10-2: Advisor returns a NUMBERED synthesis (actionable review), not empty / not
      "let me locate the file".
- [ ] S10-3: Advisor does NOT exhaust maxTurns=3 disk-hunting. No globbing for `*.component.ts`
      (the real file is `ngx-smart-components.ts` - the original trap). Tool_uses on the final
      consult should be low (synthesis, not search). maxTurns stays 3, effort high (regression).

## Evidence sources
- Plan file: ngx-smart-components/plans/*.plan.md (S9-plan)
- S1/S2 stream-json: this dir s1-plan.stream.jsonl / s2-exec.stream.jsonl
- Advisor subagent trace: ~/.claude/projects/<target-cwd-hash>/<session>.jsonl
  (advisor tool_uses under toolUseResult.usage.tool_uses per project_test_5_tool_budget memory)
- Independent smoke: `npm exec nx -- build-storybook ngx-smart-components` (orchestrator-run end-state proof)

## Verdict mapping
- All S9-P*, S9-E1, S10-1/2/3 pass -> gap closure behaviorally PROVEN on 0.14.1.
- S9-E1 or S10-* fails -> regression; capture trace, reopen.
