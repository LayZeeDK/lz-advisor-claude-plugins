---
name: lz-advisor.plan
description: >
  This skill should be used when the user wants to plan a coding
  task before starting implementation. Trigger phrases include
  "plan a task", "create an implementation plan", "think through
  the approach", "plan before coding", "lz-advisor.plan", "help me
  think through", "what's the best approach for", "before I start
  coding", "plan out the architecture", and "how should I approach
  this". This skill provides Opus-level strategic direction at
  Sonnet cost by consulting the advisor agent for high-leverage
  planning guidance. It produces a written plan file the user can
  review and later pass to lz-advisor.execute. This skill should
  NOT be used when the user wants to implement, build, review code,
  fix bugs, or run security audits -- those are handled by sibling
  skills lz-advisor.execute, lz-advisor.review, and
  lz-advisor.security-review respectively.
version: 0.4.0
allowed-tools: Agent(lz-advisor:advisor)
---

The lz-advisor:advisor agent is backed by a stronger model (Opus). Invoke it
via the Agent tool at the strategic moment described below. For detailed
guidance on timing, advice weight, and context packaging, see:

@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md

@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md

This skill follows a three-phase workflow: orient, consult, then produce a plan.

<orient>
## Phase 1: Orient

Explore the codebase to understand the task scope and current state.

- Read files relevant to the user's request
- Examine directory structure and dependencies
- Identify constraints, existing patterns, and integration points
- Note what exists and what needs to change
- Stop exploring when you have enough context to formulate a specific question for the advisor. Do not read bundled, minified, or files under `node_modules/*/dist/`.

Do not write code or make changes during orientation. Do not consult
the advisor yet -- orientation is preparation, not substantive work.
</orient>

<consult>
## Phase 2: Consult the Advisor

Invoke the lz-advisor:advisor agent via the Agent tool. Package the
consultation prompt per the Proposal template in
`@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md`.

One advisor consultation per plan invocation. The advisor returns concise
strategic direction (enumerated steps). This becomes the foundation of the
plan.
</consult>

<produce>
## Phase 3: Produce the Plan

Expand the advisor's enumerated guidance into a detailed, actionable
plan. Write the plan to a markdown file.

### Plan File Location

Write to: `plans/<task-slug>.plan.md`
Use a short kebab-case slug derived from the task description.
Create the `plans/` directory if it does not exist.
Example: for "add user authentication", write `plans/add-user-auth.plan.md`.

### Plan File Format

The plan file contains these sections:

```markdown
# Plan: <Task Title>

## Strategic Direction

<The advisor's guidance, attributed and quoted. Present the advisor's
enumerated steps as the strategic foundation for this plan.>

## Steps

1. **<Step title>**
   - File: `<path/to/file>`
   - Change: <specific description of what to create or modify>
   - Rationale: <why this step, connecting to advisor guidance>

2. ...

(Continue for all steps. Each step includes file paths and specific
changes -- matching the granularity of a detailed implementation plan.)

## Key Decisions

- **<Decision>**: <rationale from advisor guidance and executor analysis>
- **<Risk>**: <what could go wrong and how to mitigate>

## Dependencies

<Order constraints between steps, if any. Note which steps can be
done in parallel and which are sequential.>
```

Present the plan file path to the user after writing it.
</produce>

After writing the plan file, let the user know where it is. The plan can be
reviewed, edited, and then passed to `/lz-advisor.execute` for implementation.
