# Phase 5: Polish and Marketplace Readiness - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 05-polish-and-marketplace-readiness
**Mode:** discuss (--analyze)
**Areas discussed:** Trigger phrase optimization, GitHub install readiness, Scope of polish beyond INFRA-04, Validation strategy

---

## Trigger Phrase Optimization

| Option | Description | Selected |
|--------|-------------|----------|
| Full skill-creator pipeline (Recommended) | 20 queries per skill, user reviews via HTML template, automated run_loop.py optimization | |
| Full skill-creator pipeline with agent review | Same pipeline but agent reviews eval outcomes instead of user HTML template | X |
| Lightweight skill-creator pipeline | 10 queries per skill, skip HTML review | |
| Manual + spot-check | Heuristic rewrite, validate with claude -p runs | |

**User's choice:** Full skill-creator pipeline except spawn an Agent/Task to review eval outcomes instead of the user-reviewed HTML template.
**Notes:** User wanted empirical validation but without manual HTML template review. Agent can review objectively since triggering pass/fail is not subjective.

### Cross-Skill Disambiguation

| Option | Description | Selected |
|--------|-------------|----------|
| Cross-skill negatives (Recommended) | Include queries for sibling skills as should-not-trigger in each eval set | X |
| Optimize independently | Each skill's eval set ignores other skills | |
| Custom multi-skill scoring | Shared query set testing all 4 skills simultaneously | |

**User's choice:** Cross-skill negatives
**Notes:** Tests disambiguation within skill-creator's per-skill pipeline without requiring custom tooling.

### Agent Description Optimization Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Skills only (Recommended) | INFRA-04 targets skills. Agents are skill-orchestrated. | X |
| Skills + light agent review | Full pipeline on skills, manual agent review | |
| Full pipeline for all 7 | run_loop.py on all skills and agents | |

**User's choice:** Skills only (for description optimization; agents verified separately per D-12)

---

## GitHub Install Readiness

### Plugin Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Move + validate (Recommended) | Move to plugins/lz-advisor/, run plugin-validator | X |
| Move + validate + repo README | Same plus repo-level README | |
| Move only, validate later | Restructure, defer validation | |

**User's choice:** Move + validate
**Notes:** User clarified three key points: (1) must run plugin-dev:plugin-validator, (2) marketplace convention is plugins/<plugin-name>/ structure, (3) non-distributed files outside plugins/.

### Version

| Option | Description | Selected |
|--------|-------------|----------|
| 1.0.0 (Recommended) | Signal stable release | |
| Keep 0.1.0 | Pre-release until proven | X |
| 0.9.0 then 1.0.0 | Staged promotion | |

**User's choice:** Keep 0.1.0

### Repo README

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, brief explanation (Recommended) | Explain plugins/ vs dev artifacts | X |
| No, self-explanatory | Skip | |

**User's choice:** Yes, brief explanation

### Local Dev Path

| Option | Description | Selected |
|--------|-------------|----------|
| Update --plugin-dir path (Recommended) | Use plugins/lz-advisor, update CLAUDE.md | X |
| Claude's Discretion | Planner decides | |

**User's choice:** Update --plugin-dir path

---

## Scope of Polish Beyond INFRA-04

### Phase 5 Scope

| Option | Description | Selected |
|--------|-------------|----------|
| INFRA-04 + structural move (Recommended) | Descriptions + restructure. Deferred items become backlog. | |
| INFRA-04 + structural + deferred | Everything: descriptions, structure, conciseness, tokens, effort | X |
| INFRA-04 only | Just descriptions | |

**User's choice:** Full scope -- close all v1 loose ends

### Conciseness Calibration

| Option | Description | Selected |
|--------|-------------|----------|
| Measure then tune (Recommended) | Run skills, measure output, tune if >100 words | X |
| Skip -- trust scoped prompts | Phase 2 hypothesis: skills fix conciseness | |
| Preemptive strengthening | Strengthen system prompt regardless | |

**User's choice:** Measure then tune

### Token Overhead

| Option | Description | Selected |
|--------|-------------|----------|
| Piggyback on eval runs (Recommended) | Capture data during description optimization | X |
| Dedicated measurement pass | Separate test runs for token accounting | |

**User's choice:** Piggyback on eval runs

### README Costs

**User's choice:** Remove cost estimates entirely. Hard to measure precisely, goes stale with pricing changes.
**Notes:** User override of the recommended "update if data changes" option.

### Agent Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, verify + fix (Recommended) | Full verification against plugin-dev guidelines | X |
| Validator only | Structural checks only | |
| Claude's Discretion | Planner decides depth | |

**User's choice:** Yes, verify + fix

### Eval Workspace Location

**User's choice:** `evals/lz-advisor/` at repo root, following skill-creator sibling conventions from there. NOT inside `plugins/lz-advisor/`.
**Notes:** User specified this directly. Keeps distributable plugin clean while maintaining skill-creator naming conventions.

### Eval Version Control

| Option | Description | Selected |
|--------|-------------|----------|
| .gitignore outputs/ only (Recommended) | Commit all except raw skill-produced outputs | X |
| Commit everything | Full audit trail including outputs | |
| .gitignore everything | No eval artifacts in git | |

**User's choice:** .gitignore only `evals/**/outputs/`
**Notes:** User initially said commit everything (don't gitignore workspaces), then refined: commit all except truly ephemeral `outputs/` directories after reviewing artifact-by-artifact analysis.

### Model for Eval Runs

| Option | Description | Selected |
|--------|-------------|----------|
| Sonnet 4.6 (Recommended) | Target user model, explicit override | X |
| Session model (inherit) | Use current Opus session | |

**User's choice:** Sonnet 4.6 with explicit `--model` override
**Notes:** Session runs Opus 4.6 1M. Every eval command must explicitly pass `--model claude-sonnet-4-6`.

### Execution Ordering

**User's choice:** Confirmed 9-step execution order as presented.

### ROADMAP Update

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, update before planning (Recommended) | Expand Phase 5 description and success criteria | X |
| No, CONTEXT.md is sufficient | Keep roadmap as original intent | |

**User's choice:** Update ROADMAP.md before planning

### Agent Review Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Review queries only (Recommended) | Agent reviews queries, trust run_loop for results | |
| Agent reviews both points | Agent reviews queries AND before/after descriptions | X |
| Claude's Discretion | Planner decides | |

**User's choice:** Agent reviews at both points

### Measurement Thresholds

| Option | Description | Selected |
|--------|-------------|----------|
| Claude's Discretion (Recommended) | Executor judges based on measurements | X |
| Define thresholds now | Lock in specific numbers | |

**User's choice:** Claude's Discretion

---

## Validation Strategy

### Success Gate

| Option | Description | Selected |
|--------|-------------|----------|
| Validator + test scores (Recommended) | Plugin-validator passes + description scores improve | |
| Full end-to-end test | Above + install from GitHub | |
| Validator + test scores + install test | All three gates | X |

**User's choice:** All three: plugin-validator passes, description test scores improve, clean GitHub install test.

### GitHub Install Test

| Option | Description | Selected |
|--------|-------------|----------|
| Local first, push + remote as final gate (Recommended) | --plugin-dir throughout, push + install at the end | X |
| Local only | Skip remote install test | |
| Claude's Discretion | Executor decides | |

**User's choice:** Local first, push + remote install as final validation step.

---

## Claude's Discretion

- Measurement thresholds for conciseness tuning and effort level decisions
- Exact eval query content (must follow skill-creator guidelines)
- Agent review criteria details
- Plan breakdown within Phase 5
- Whether to run full skill improvement loop beyond description optimization

## Deferred Ideas

None -- Phase 5 closes all v1 loose ends.
