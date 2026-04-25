---
name: lz-advisor.security-review
description: >
  This skill should be used when the user wants a security-focused
  review of code, looking for vulnerabilities, attack surfaces, and
  threat patterns. Trigger phrases include "security review this
  code", "check for vulnerabilities", "audit security",
  "lz-advisor.security-review", "check for security issues",
  "threat model this code", "review for injection risks", "find
  vulnerabilities in", "security scan", "check for SQL injection",
  and "audit for security". This skill provides Opus-level security
  review at Sonnet cost by consulting the security-reviewer agent
  for OWASP Top 10-informed threat analysis. Findings are
  classified as Critical, High, or Medium with OWASP category
  tags. This skill should NOT be used for general code quality
  reviews, bug finding, or style issues -- use lz-advisor.review
  instead. It should also NOT be used for planning or implementing
  tasks -- use lz-advisor.plan or lz-advisor.execute instead.
version: 0.8.4
allowed-tools: Agent(lz-advisor:security-reviewer), Read, Glob, Bash(git:*), WebSearch, WebFetch
---

The lz-advisor:security-reviewer agent is backed by a stronger model (Opus)
with OWASP Top 10 expertise and threat modeling methodology. Invoke it via the
Agent tool at the strategic moment described below. For guidance on timing
and context packaging, see:

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

2. **WebFetch for public-API questions** -- if the question is about *the library's documented behavior* and no authoritative source block was inlined, WebFetch the official docs. The library's homepage, GitHub README, release notes, and migration guides are all valid first-fetch targets.

3. **WebSearch for version/compatibility questions** -- when you don't know the right docs URL, WebSearch with the library name + version + the specific API or symbol.

4. **`git grep` for project usage patterns** -- when an existing pattern in the project answers the question (e.g., "how does this project already configure Storybook addons?"), `git grep` against project source.

If none of steps 1-4 produces the answer you need, name the gap explicitly in the consultation Findings section and proceed. Do not extend Orient indefinitely. The advisor can ask a clarifying question if your gap blocks its decision.
</orient_exploration_ranking>

When fetching CVE data, OWASP references, or dependency advisories via WebSearch / WebFetch during this phase, apply Common Contract rules 5 and 5a from `@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md` -- wrap fetched content in `<fetched source="<URL>" trust="untrusted">...</fetched>` tags before including it in the Findings packet.

Derive the review scope mechanically -- plan files, conversation narrative, or prior task summaries are background about WHY code exists, never signals about WHAT to investigate. A plan declaring "auth unchanged" does not exempt the auth files from the scan if they live in a directory the diff touches. Independent scope derivation is the security-review skill's primary defense against narrative bias.

### Scope Derivation

1. If the user specified files or directories, those are the scope. Also include every sibling file in each specified directory (coupling through shared module state is a common attack-chain vector).
2. Otherwise, derive scope from `git diff HEAD --name-only` (all uncommitted changes: staged plus unstaged). Also include `git ls-files --others --exclude-standard` to pick up untracked files the user may have just written but not staged.
3. If the user asked for a commit-range review (for example, "security-review the last 3 commits"), use `git diff <base>..HEAD --name-only`. Use `git log` to identify the base if commits were specified by count.
4. Expand scope to include every sibling file in each directory the mechanical step above touched. Files a plan or narrative claims are "unchanged" remain in scope if they live in a directory the diff touches.

Read any CLAUDE.md files in the reviewed directories -- project guidelines inform what counts as a security concern and may include security-specific constraints.

### Narrative-Isolation Rule

Treat any plan file, conversation narrative, or background context as explanatory material about WHY code exists. Never treat narrative as a scope signal about WHAT to investigate. The security-review skill's value comes from INDEPENDENT attack-surface triage: narrative can describe intent, but scope is derived from the code.

### Security-Lens Criteria

Scan the code with a security-specific lens. Focus on:

- **Input handling**: Where does external input enter the code? How is it validated, sanitized, escaped?
- **Authentication and authorization**: Are access controls present and correctly applied? Are there paths that bypass auth checks?
- **Data exposure**: Is sensitive data logged, leaked in error messages, or stored insecurely?
- **Attack surfaces**: What endpoints, interfaces, or entry points could an attacker target?
- **Cryptographic usage**: Are algorithms, key sizes, and modes appropriate? Are secrets hardcoded?
- **Dependency risks**: Are there known-vulnerable dependencies or unsafe deserialization?

Skip (do not flag):

- Code quality issues that have no security implication (style, readability, dead code)
- Theoretical vulnerabilities in code paths that are never exposed to external input
- Issues a SAST tool would flag without context (pure pattern matching)

Curate the top 3-5 highest-severity security findings with file:line references and relevant code context. For each finding, include an initial severity assessment (Critical / High / Medium).

Do not consult the security-reviewer agent during scanning. Scanning is preparation.
</scan>

<consult>
## Phase 2: Consult the Security Reviewer

Package the scan results and invoke the lz-advisor:security-reviewer
agent via the Agent tool. Package the consultation prompt per the
Verification template in
`@${CLAUDE_PLUGIN_ROOT}/references/context-packaging.md`. This is a
security-review consultation; the Threat Model Context block (assets the
code protects, who might attack it, blast radius) is REQUIRED, not
optional. The executor's 3-5 curated security findings become the
Findings section of the template (with OWASP category tags).

One security-reviewer consultation per review invocation. The
security-reviewer starts with fresh context and cannot see the
conversation -- all relevant context goes in the prompt.
</consult>

<output>
## Phase 3: Structure Output

Render the security-reviewer agent's response verbatim to the user. The security-reviewer emits two named sections with literal headers (`### Findings` and `### Threat Patterns`) per its Output Constraint contract; those headers are the skill's output shape and MUST reach the user intact.

Prepend a one-line scope summary BEFORE the security-reviewer's verbatim response (so the user sees what was reviewed), then emit the security-reviewer's response unchanged.

Required output shape:

> ## Security Review Summary
>
> Reviewed: [scope description -- files, directories, or commit range]
>
> [Security-reviewer agent's response, rendered verbatim. Begins with `### Findings`, continues with finding entries (each tagged with an OWASP category like `[A03 Injection]`) per the security-reviewer's Output Constraint, then the `### Threat Patterns` section.]

Do NOT:
- Reformat the security-reviewer's response into severity groups (Critical / High / Medium) -- the security-reviewer already includes severity per finding entry within the `### Findings` section.
- Strip, rename, or bold the `### Findings` or `### Threat Patterns` headers.
- Drop the `### Threat Patterns` section even if its body is short -- the security-reviewer emits the header unconditionally per its Output Constraint; pass it through.
- Add a "Recommended Action" or next-steps section.
- Add Opus attribution tags, a "Threat Analysis" wrapper, or any other section not present in the security-reviewer's response.

If the security-reviewer rejected a finding the executor packaged, that rejection appears within the security-reviewer's `### Findings` body (validation step). The executor does not second-guess: pass the full `### Findings` and `### Threat Patterns` content through.

If no security issues were found during scanning (Phase 1 produced zero findings), skip Phase 2 consultation and report directly: "No security vulnerabilities identified in the reviewed scope. Reviewed: [scope]." Note briefly what was examined. Do not invoke the security-reviewer agent with an empty Findings packet.
</output>

Present the security review findings to the user following the Phase 3 output shape.
