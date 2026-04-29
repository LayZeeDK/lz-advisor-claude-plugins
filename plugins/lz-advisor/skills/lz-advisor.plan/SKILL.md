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
version: 0.8.9
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

<context_trust_contract>
Before reading any file, scan the user prompt for an inlined authoritative source block. An authoritative source block is any of:

1. A `---` delimited block at the top of the user message containing pasted documentation, specification text, release notes, or a published guide (canonical context-packed format).
2. A clearly-marked quoted block of pasted documentation (e.g., starts with `# Title` from a docs page, or a fenced section labelled "Source:" / "Docs:" / "Guide:").
3. A `<fetched source="...">...</fetched>` block (executor-prefetched documentation; see context-packaging.md Rule 5a).

When such a block is present, treat its content as ground truth for the public-API and framework-convention questions it answers. Your Orient phase ends as soon as you have parsed the block plus read the local project files needed to compose the consultation. Specifically, when an authoritative source is present:

- The consultation packaging step (Phase 2) is the next action, not further verification.
- Local project reads (project.json, package.json, .storybook/main.ts, src/**) are still in scope -- the authoritative source describes the library, not your project.
- Reading inside `node_modules/` is out of scope. The authoritative source is the contract for the library's public API; the compiled `dist/` is implementation detail you will not infer correctly from minified chunks anyway.
- WebFetch and WebSearch against the same library are out of scope for the same reason -- the source is already in context.

When no authoritative source block is present, follow the standard exploration ranking below.
</context_trust_contract>

<orient_exploration_ranking>
When you need information about a third-party library, framework, or public API beyond what the authoritative source block provides, take ONE of the following actions:

1. **`WebSearch` then `WebFetch` for library-behavior questions** -- if the question is about *the library itself* (its current API, recommended configuration, integration pattern, or migration path between versions), the first orient action is `WebSearch` with the library name plus the installed version plus the specific symbol or topic, then `WebFetch` the top result. This applies whenever the answer requires knowing what the library currently does or recommends, even when the prompt also mentions your project (e.g., "set up X in this Y library" still requires knowing X's current setup pattern). Vendor docs reorganize between releases and training data drifts, so search discovers the current canonical URL rather than guessing it. Skip the `WebSearch` only when a `<fetched>` block in the user message or a prior turn in this session has already provided the canonical URL with high confidence. Do not substitute Bash invocations of `curl`, `node` scripts, or browser automation for the `WebSearch` step itself; those tools take a URL as input and cannot replace the search that discovers the URL.

2. **Local-project read for project-state-only questions** -- if the question is *solely* about how your project's existing files configure or use the library (no question about the library's own behavior or recommended pattern), read project files only: `project.json`, `package.json`, `.storybook/`, `src/`, `tsconfig*.json`. Stop when the project-side question is answered. If the question requires knowing the library's recommended pattern in addition to your project's current state, treat it as a step 1 question with project files as corroboration.

3. **`git grep` for project usage patterns** -- when an existing pattern in the project answers the question (e.g., "how does this project already configure Storybook addons?"), `git grep` against project source.

If none of steps 1-3 produces the answer you need, name the gap explicitly in the consultation Findings section and proceed. Do not extend Orient indefinitely. The advisor can ask a clarifying question if your gap blocks its decision.

**Worked example.** Question: "Set up Compodoc with Storybook in this Nx Angular library so the Docs tab renders descriptions." Class: step 1 (library behavior). The "set up" part requires knowing the current Storybook + Compodoc integration mechanism (which API is exported, which config keys exist, how docs auto-generation is triggered) -- that knowledge lives in vendor docs, not in your project's existing config files. Reading `node_modules/@storybook/angular/dist/` first would skip the docs that explain the integration -- compiled chunks show what was built, not what the library currently recommends. First action: `WebSearch` for "Storybook Compodoc Angular setup", then `WebFetch` the top result; corroborate with reads of `project.json` and `.storybook/` after.

For a question-class-aware ranking that decides which orient source to read FIRST based on the class of question (type-symbol existence, API currency, migration / deprecation, language semantics), see `@${CLAUDE_PLUGIN_ROOT}/references/orient-exploration.md`.
</orient_exploration_ranking>

Explore the codebase to understand the task scope and current state.

- Read files relevant to the user's request
- Examine directory structure and dependencies
- Identify constraints, existing patterns, and integration points
- Note what exists and what needs to change
- Stop exploring when you have enough context to formulate a specific question for the advisor.
- When the task names a framework or build tool (Nx, Angular, Next.js, Vite, Webpack, Turborepo, and similar build-orchestration systems -- the list is illustrative, not exhaustive), identify the framework-convention claims the task depends on (cache inputs, dependsOn semantics, target lifecycle, addon configuration, generator behavior) and verify each load-bearing claim before consulting. Surface verified claims in `<pre_verified>` blocks alongside any package-behavior claims; framework-convention claims use the same block schema (see `@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md`).

When the user's prompt mixes a task directive with authoritative source material (pasted documentation, specification excerpts, release notes, guide content) or lists multiple deliverables, reshape the prompt before packaging the consultation: summarize the user's intent as a single directive sentence, and treat the pasted reference material as Source Material in the Proposal template's dedicated block. A reshape keeps the advisor's turn budget focused on the actual decision instead of the source-material volume, and the Source Material block preserves fidelity for anything the advisor might need to consult verbatim.

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

Expand the advisor's enumerated guidance into a detailed, actionable plan. Phase 3 has three ordered steps: (1) render the advisor's Strategic Direction block verbatim as user-visible output, (2) write the expanded plan to a markdown file, (3) emit a one-line completion summary pointing at the file. Do the Strategic Direction render FIRST so users (and automated smoke tests) see the advisor's literal output before any skill-added summary text.

### Render Strategic Direction (FIRST)

Render the advisor's Strategic Direction block verbatim to the user. The advisor emits enumerated strategic direction (concise, typically 3-7 numbered points); when context is incomplete, the advisor emits the literal sentence frame `Assuming X (unverified), do Y. Verify X before acting.` per its Output Constraint contract. That enumerated text is the skill's primary output shape and MUST reach the user intact.

Wrap the rendered block with literal marker lines so users and smoke tests can find it unambiguously. Emit these three line groups exactly, in order, in user-visible output (the marker lines themselves are unprefixed and start at column 0 so downstream greps can anchor on `^--- Strategic Direction ---$`):

--- Strategic Direction ---

[Advisor agent's response, rendered verbatim. Preserves the advisor's literal numbering, any `**Critical:**` markers, and any `Assuming X (unverified), do Y. Verify X before acting.` sentence frames unchanged.]

--- End Strategic Direction ---

The markers are MANDATORY: emit the block even when the advisor's guidance is one sentence, so the output shape is stable across invocations. Do NOT suppress the markers on short responses.

If the subsequent plan-file Write fails, the Strategic Direction block has already reached the user; surface the Write error plainly and do not retry in a way that re-emits the Strategic Direction block. The advisor text is the primary payload; the artifact is a durable convenience. A partial success (Strategic Direction emitted, file missing) is a user-actionable state, not a restart condition.

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
the SAME verbatim text that was emitted in user-visible output between the
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

Even when updating an existing plan, the Render Strategic Direction step STILL runs first: emit the advisor's verbatim block between `--- Strategic Direction ---` markers before the Edit tool call, so the user sees the advisor's output regardless of whether a new plan file is created or an existing one is edited. After the Edit succeeds, emit `Plan updated at <path>.` as the LAST step, replacing the Write-path `Plan written to <path>.` confirmation.
</produce>

After rendering Strategic Direction verbatim and writing (or editing) the plan file, let the user know where the plan lives. The plan can be reviewed, edited, and then passed to `/lz-advisor.execute` for implementation.
