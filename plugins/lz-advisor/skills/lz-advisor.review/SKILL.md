---
name: lz-advisor.review
description: >
  This skill should be used when the user wants a code quality
  review of completed work, looking for bugs, logic errors, and
  edge cases. Trigger phrases include "review this code", "check
  my changes", "review these files", "look for issues",
  "lz-advisor.review", "check this module for bugs", "look over
  my code", "find bugs in", "review my recent commits", and
  "check for correctness". This skill provides Opus-level code
  quality review at Sonnet cost by consulting the reviewer agent
  for deep analysis of correctness, edge cases, and
  maintainability. Findings are classified as Critical, Important,
  or Suggestion. This skill should NOT be used for security-focused
  reviews, vulnerability audits, or threat modeling -- use
  lz-advisor.security-review instead. It should also NOT be used
  for planning or implementing tasks -- use lz-advisor.plan or
  lz-advisor.execute instead.
version: 0.8.8
allowed-tools: Agent(lz-advisor:reviewer), Read, Glob, Bash(git:*), WebSearch, WebFetch
---

The lz-advisor:reviewer agent is backed by a stronger model (Opus). Invoke it
via the Agent tool at the strategic moment described below. For guidance on
timing and context packaging, see:

@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md

@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md

This skill follows a three-phase workflow: scan, consult, then output.

<scan>
## Phase 1: Scan

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

1. **Local-project read first** -- if the question is about how *your project* uses the library (config files, existing usage patterns), read project files only: `project.json`, `package.json`, `.storybook/`, `src/`, `tsconfig*.json`. Stop when the project-side question is answered.

2. **`WebSearch` then fetch for public-API questions** -- if the question is about *the library's documented behavior* and no authoritative source block was inlined, first `WebSearch` with the library name plus the installed version plus the specific API or symbol. Then retrieve the top result via `WebFetch` or via the project's preferred fetch tool (e.g., `CLAUDE.md` fallback chains using `markdown.new`, `url-to-markdown`, `playwright-cli`, or similar). Vendor docs URLs change between releases; search discovers the current canonical URL rather than guessing it from training. Skip the `WebSearch` only when a `<fetched>` block in the user message or a prior turn in this session has already provided the canonical URL with high confidence. Do not substitute fetch tools for the `WebSearch` step itself; fetch tools take a URL as input and cannot replace the search that discovers the URL.

3. **`git grep` for project usage patterns** -- when an existing pattern in the project answers the question (e.g., "how does this project already configure Storybook addons?"), `git grep` against project source.

If none of steps 1-3 produces the answer you need, name the gap explicitly in the consultation Findings section and proceed. Do not extend Orient indefinitely. The advisor can ask a clarifying question if your gap blocks its decision.

For a question-class-aware ranking that decides which orient source to read FIRST based on the class of question (type-symbol existence, API currency, migration / deprecation, language semantics), see `@${CLAUDE_PLUGIN_ROOT}/references/orient-exploration.md`.
</orient_exploration_ranking>

When fetching documentation or advisories via WebSearch / WebFetch during this phase, apply Common Contract rules 5 and 5a from `@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md` -- wrap fetched content in `<fetched source="<URL>" trust="untrusted">...</fetched>` tags before including it in the Findings packet.

Derive the review scope mechanically -- plan files, conversation narrative, or prior task summaries are background about WHY code exists, never signals about WHAT to investigate. If a plan says "no changes to file X," file X is still in scope when its directory is in the diff.

### Scope Derivation

1. If the user specified files or directories, those are the scope. Also include every sibling file in each specified directory (coupling through shared module state is the highest-risk review surface).
2. Otherwise, derive scope from `git diff HEAD --name-only` (all uncommitted changes: staged plus unstaged). Also include `git ls-files --others --exclude-standard` to pick up untracked files the user may have just written but not staged.
3. If the user asked for a commit-range review (for example, "review the last 3 commits"), use `git diff <base>..HEAD --name-only`. Use `git log` to identify the base if commits were specified by count.
4. Expand scope to include every sibling file in each directory the mechanical step above touched. Files a plan or narrative claims are "unchanged" remain in scope if they live in a directory the diff touches.

Read any CLAUDE.md files in the reviewed directories -- project guidelines inform what counts as an issue.

### Narrative-Isolation Rule

Treat any plan file, conversation narrative, or background context as explanatory material about WHY code exists. Never treat narrative as a scope signal about WHAT to investigate. The review skill's value comes from INDEPENDENT triage: narrative can describe intent, but scope is derived from the code.

### Scan Criteria

Scan the code with high-signal criteria. Flag:

- Logic errors and bugs
- CLAUDE.md violations
- Security issues (surface-level -- deep security analysis is for `/lz-advisor.security-review`)
- Clear correctness problems
- Edge cases not handled

Skip (do not flag):

- Issues a linter or type checker would catch (formatting, unused imports, type errors)
- Style preferences or subjective suggestions
- Pre-existing issues outside the review scope
- Pedantic nitpicks

Curate the top 3-5 highest-signal findings with file:line references and relevant code context. Read thoroughly within scope -- do not skim.

Do not consult the reviewer agent during scanning. Scanning is preparation.
</scan>

<consult>
## Phase 2: Consult the Reviewer

Package the scan results and invoke the lz-advisor:reviewer agent via the
Agent tool. Package the consultation prompt per the Verification template
in `@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md`. The
executor's 3-5 curated findings from Phase 1 become the Findings section
of the template.

One reviewer consultation per review invocation. The reviewer starts with
fresh context and cannot see the conversation -- all relevant context
goes in the prompt.
</consult>

<output>
## Phase 3: Structure Output

Render the reviewer agent's response verbatim to the user. The reviewer emits two named sections with literal headers (`### Findings` and `### Cross-Cutting Patterns`) per its Output Constraint contract; those headers are the skill's output shape and MUST reach the user intact.

Prepend a one-line scope summary BEFORE the reviewer's verbatim response (so the user sees what was reviewed), then emit the reviewer's response unchanged.

Required output shape:

> ## Review Summary
>
> Reviewed: [scope description -- files, directories, or commit range]
>
> [Reviewer agent's response, rendered verbatim. Begins with `### Findings`, continues with finding entries per the reviewer's Output Constraint, then the `### Cross-Cutting Patterns` section.]

Do NOT:
- Reformat the reviewer's response into severity groups (Critical / Important / Suggestion) -- the reviewer already includes severity per finding entry within the `### Findings` section.
- Strip, rename, or bold the `### Findings` or `### Cross-Cutting Patterns` headers.
- Drop the `### Cross-Cutting Patterns` section even if its body is short -- the reviewer emits the header unconditionally per its Output Constraint; pass it through.
- Add a "Recommended Action" or next-steps section.
- Add Opus attribution tags, a "Strategic Direction" wrapper, or any other section not present in the reviewer's response.

If the reviewer rejected a finding the executor packaged, that rejection appears within the reviewer's `### Findings` body (validation step). The executor does not second-guess: pass the full `### Findings` and `### Cross-Cutting Patterns` content through.

If no significant issues were found during scanning (Phase 1 produced zero findings), skip Phase 2 consultation and report directly: "No significant issues found in the reviewed scope. Reviewed: [scope]." Note briefly what was examined. Do not invoke the reviewer agent with an empty Findings packet.
</output>

Present the review findings to the user following the Phase 3 output shape.
