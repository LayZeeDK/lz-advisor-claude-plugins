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
version: 0.5.0
allowed-tools: Agent(lz-advisor:security-reviewer)
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

Present findings to the user as console output.

Start with a summary header:

```
## Security Review Summary

Reviewed: [scope description -- files, directories, or change range]
Findings: [N] Critical, [N] High, [N] Medium
```

Then group findings by severity (Critical / High / Medium):

For each finding:
- Finding title with file:line reference and OWASP category tag
  (for example, `[A03 Injection]`)
- Description with the security reviewer's threat analysis woven in
  seamlessly (no attribution, no separate "Threat Analysis" section)
- Attack vector and exploitability context (from the reviewer's analysis)
- Concrete remediation suggestion (specific fix, not generic advice
  like "validate input")

Include only findings the security reviewer validated. Drop findings
the reviewer rejected.

Do not include:
- A strengths or positive observations section
- A "Recommended Action" or next-steps section
- Opus attribution tags or a separate reviewer analysis section

If the reviewer identified attack chains, present them as a connected
narrative across related findings -- for example, note how an input
validation gap in one finding enables escalation through a privilege
check bypass in another.
</output>

Present the security review findings to the user. If no security issues were
found during scanning, report that no vulnerabilities were identified in the
reviewed scope and note the security aspects that were examined.
