# Phase 9: Rename Skills - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 09-rename-skills
**Mode:** discuss (--analyze)
**Areas discussed:** Blast radius, Invocation contract, Version bump, RTK todo folding

---

## Blast Radius

| Option | Description | Selected |
|--------|-------------|----------|
| Operational sweep | Plugin + CLAUDE.md + evals + live smoke-fixture `-p` strings; leave frozen historical artifacts | yes |
| Plugin + CLAUDE.md only | Minimal; evals + smoke fixtures left stale and break on next run | |
| Full sweep (all 371) | Rewrite every `.planning/` artifact incl. CONTEXT/PLAN/SUMMARY/VERIFICATION | |

**User's choice:** Operational sweep
**Notes:** Live regression fixtures (`05.4/smoke-tests/*.sh`) invoke skills via `claude -p "/lz-advisor.plan ..."`, so they are load-bearing and in-scope. Version-pinned `uat-replay-*/runners/` reproductions are frozen and left as-is. Rewriting historical phase docs would make true statements ("Phase 5.2 renamed to lz-advisor.plan") inaccurate.

---

## Invocation Contract

| Option | Description | Selected |
|--------|-------------|----------|
| Context-dependent | Bare `/<skill>` in interactive docs (picker disambiguates); qualified `/lz-advisor:<skill>` in headless `claude -p` fixtures (no picker); execution verifies resolution | yes |
| Bare `/<skill>` everywhere | Uniform, matches user confidence; risk: headless `/review` resolves to built-in PR-review command | |
| Qualified `/lz-advisor:<skill>` everywhere | Uniform, collision-proof; more verbose interactively | |

**User's choice:** Context-dependent
**Notes:** User clarified that bare shorthand resolves interactively and the skill picker shows the plugin name in each item's description, disambiguating the built-in `/review` / `/security-review` collision. The headless-vs-interactive distinction (no picker headless) drove the split: headless smoke fixtures + skill-verification convention use the qualified form; an empirical `claude -p` resolution probe (D-08) gates the documented strings, closing the unverified Phase 5.2 D-07 bet.

---

## Version Bump

| Option | Description | Selected |
|--------|-------------|----------|
| MINOR 0.14.2 -> 0.15.0 | Signals skill-name contract change; mirrors Phase 5.2's minor bump | yes |
| PATCH 0.14.2 -> 0.14.3 | Non-breaking cleanup (no external consumers yet) | |
| Planner's discretion | Version not load-bearing in pre-release | |

**User's choice:** MINOR 0.14.2 -> 0.15.0 ("You can use 0.15.0.")
**Notes:** Applied atomically across the 5 version surfaces. Pre-publication, so the bump is for signal clarity rather than compatibility.

---

## RTK Todo Folding

| Option | Description | Selected |
|--------|-------------|----------|
| Don't fold | Off-topic for a mechanical rename; matched on generic keywords only | yes |
| Fold into Phase 9 | Add RTK-command-suitability research to this phase's scope | |

**User's choice:** Don't fold ("Not in scope.")
**Notes:** `research-rtk-command-suitability-for-skills-and-agents` remains a standalone pending todo. Recorded in CONTEXT.md `<deferred>` Reviewed Todos so future phases know it was considered.

---

## Claude's Discretion

- Plan breakdown/ordering within Phase 9.
- Exact find/replace mechanics (given `git mv` + atomic 5-surface version sync).
- Whether to additionally smoke-test bare interactive forms beyond the mandatory qualified-form headless probe.

## Deferred Ideas

- RTK command suitability research (see Reviewed Todos above).
