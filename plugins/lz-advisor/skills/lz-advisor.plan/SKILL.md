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
version: 0.6.0
allowed-tools: Agent(lz-advisor:advisor), Read, Glob, Bash(git:*), Write, WebSearch, WebFetch
---

The lz-advisor:advisor agent is backed by a stronger model (Opus). Invoke it
via the Agent tool at the strategic moment described below. For detailed
guidance on timing, advice weight, and context packaging, see:

@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md

@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md

This skill follows a three-phase workflow: orient, consult, then produce a plan.

<orient>
## Phase 1: Orient

If any tool call during this phase fails (permission denial, missing file, runtime error, timeout), apply the "Recover gracefully from tool-use failure" rule from `@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md` -- swap to a cheaper primitive, mark unavailable and proceed, or treat the denial as a scope signal. Do not halt.

Explore the codebase to understand the task scope and current state.

- Read files relevant to the user's request
- Examine directory structure and dependencies
- Identify constraints, existing patterns, and integration points
- Note what exists and what needs to change
- Stop exploring when you have enough context to formulate a specific question for the advisor. Inside `node_modules`, read with discipline: targeted reads only (a specific function, a config entry, or a few lines around a symbol), never full-file for bundled or minified content. When dependency behavior is load-bearing, verify and surface the result as a Pre-Verified Package Behavior Claim (see `@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md`).

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

Expand the advisor's enumerated guidance into a detailed, actionable plan. Phase 3 has three ordered steps: (1) render the advisor's Strategic Direction block verbatim to stdout, (2) write the expanded plan to a markdown file, (3) emit a one-line completion summary pointing at the file. Do the stdout render FIRST so users (and automated smoke tests) see the advisor's literal output before any skill-added summary text.

### Render Strategic Direction to Stdout (FIRST)

Render the advisor's Strategic Direction block verbatim to the user. The advisor emits enumerated strategic direction (concise, typically 3-7 numbered points); when context is incomplete, the advisor emits the literal sentence frame `Assuming X (unverified), do Y. Verify X before acting.` per its Output Constraint contract. That enumerated text is the skill's primary output shape and MUST reach the user intact.

Wrap the rendered block with literal marker lines so users and smoke tests can find it unambiguously. Emit these three line groups exactly, in order, on stdout (the marker lines themselves are unprefixed and start at column 0 so downstream greps can anchor on `^--- Strategic Direction ---$`):

--- Strategic Direction ---

[Advisor agent's response, rendered verbatim. Preserves the advisor's literal numbering, any `**Critical:**` markers, and any `Assuming X (unverified), do Y. Verify X before acting.` sentence frames unchanged.]

--- End Strategic Direction ---

The markers are MANDATORY: emit the block even when the advisor's guidance is one sentence, so the output shape is stable across invocations. Do NOT suppress the markers on short responses.

If the subsequent plan-file Write fails, the stdout emission has already reached the user; surface the Write error plainly and do not retry in a way that re-emits the Strategic Direction block. The advisor text is the primary payload; the artifact is a durable convenience. A partial success (stdout emitted, file missing) is a user-actionable state, not a restart condition.

Do NOT:
- Do NOT paraphrase the advisor's output. Preserve numbering, punctuation, and sentence frames exactly as the advisor wrote them.
- Do NOT strip, rename, or bold the `--- Strategic Direction ---` / `--- End Strategic Direction ---` marker lines.
- Do NOT strip the literal `Assuming X (unverified), do Y. Verify X before acting.` frame when the advisor uses it; the executor greps for this frame to route items to verification, and downstream skills (/lz-advisor.execute) rely on it to weight advice.
- Do NOT add a wrapper heading, an Opus attribution tag, a "From the advisor:" preamble, or any other text between the opening marker and the advisor's first enumerated point.
- Do NOT translate the advisor's output to a different language, reformat enumerated lists into prose, or collapse multi-line entries into single lines.
- Do NOT rephrase the `Assuming X (unverified), do Y. Verify X before acting.` frame even when the advisor's text is short; emit the block with the frame intact.

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
enumerated steps as the strategic foundation for this plan. This is
the SAME verbatim text that was emitted to stdout between the
--- Strategic Direction --- markers; the plan file preserves it as
a durable artifact.>

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

### Emit Plan-Written Confirmation (LAST)

After the plan file is written, emit the one-line confirmation `Plan written to <path>.` AFTER the `--- End Strategic Direction ---` marker. Order matters: the advisor's verbatim block comes first (so smoke tests and users see the literal frame before any skill-generated summary), the plan file is written second, and the confirmation line comes last.

A brief coverage summary (for example, `It covers N steps: ...`) MAY follow the confirmation line to orient the user, but MUST NOT precede the `--- Strategic Direction ---` block or replace it.

### Updating an Existing Plan

If the user supplied an existing plan file (via @ mention or path reference), update it using Edit rather than rewriting wholesale. Preserve unchanged sections verbatim. Each edit corresponds to a specific user request; do not refactor the plan beyond what was asked. The plan skill never modifies source code under any circumstance -- use /lz-advisor.execute for implementation.

The first Edit against an existing plan file produces a permission prompt (Edit is deliberately not in this skill's `allowed-tools` frontmatter). The prompt is the intended safety signal for plan-artifact mutations, not a friction bug -- approve once per session and proceed.

Even when updating an existing plan, the Render Strategic Direction to Stdout step STILL runs first: emit the advisor's verbatim block between `--- Strategic Direction ---` markers before the Edit tool call, so the user sees the advisor's output regardless of whether a new plan file is created or an existing one is edited.
</produce>

After rendering Strategic Direction verbatim and writing (or editing) the plan file, let the user know where the plan lives. The plan can be reviewed, edited, and then passed to `/lz-advisor.execute` for implementation.
