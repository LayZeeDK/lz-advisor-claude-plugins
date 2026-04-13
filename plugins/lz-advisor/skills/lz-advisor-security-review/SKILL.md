---
name: lz-advisor-security-review
description: >
  This skill should be used when the user wants a security-focused
  review of code, looking for vulnerabilities, attack surfaces, and
  threat patterns. Trigger phrases include "security review this
  code", "check for vulnerabilities", "audit security",
  "lz-advisor security-review", "check for security issues",
  "threat model this code", "review for injection risks", "find
  vulnerabilities in", "security scan", "check for SQL injection",
  and "audit for security". This skill provides Opus-level security
  review at Sonnet cost by consulting the security-reviewer agent
  for OWASP Top 10-informed threat analysis. Findings are
  classified as Critical, High, or Medium with OWASP category
  tags. This skill should NOT be used for general code quality
  reviews, bug finding, or style issues -- use lz-advisor-review
  instead. It should also NOT be used for planning or implementing
  tasks -- use lz-advisor-plan or lz-advisor-execute instead.
version: 0.1.0
allowed-tools: Agent(lz-advisor:security-reviewer)
---

The lz-advisor:security-reviewer agent is backed by a stronger model (Opus)
with OWASP Top 10 expertise and threat modeling methodology. Invoke it via the
Agent tool at the strategic moment described below. For guidance on context
packaging, see:

@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md

This skill follows a three-phase workflow: scan, consult, then output.

<scan>
## Phase 1: Scan

Determine the review scope from the user's request:

- If the user specified files or directories, read those
- If the user asked to review "recent changes" or "my changes", use
  `git diff` or `git log` to identify changed files, then read them
- If the user's request is in conversation context (for example, they
  just finished coding), review the files they were working on

Read any CLAUDE.md files in the reviewed directories -- project guidelines
inform what counts as a security concern and may include security-specific
constraints.

Scan the code with a security-specific lens. Focus on:

- **Input handling**: Where does external input enter the code? How is it
  validated, sanitized, escaped?
- **Authentication and authorization**: Are access controls present and
  correctly applied? Are there paths that bypass auth checks?
- **Data exposure**: Is sensitive data logged, leaked in error messages,
  or stored insecurely?
- **Attack surfaces**: What endpoints, interfaces, or entry points could
  an attacker target?
- **Cryptographic usage**: Are algorithms, key sizes, and modes
  appropriate? Are secrets hardcoded?
- **Dependency risks**: Are there known-vulnerable dependencies or unsafe
  deserialization?

Skip (do not flag):

- Code quality issues that have no security implication (style,
  readability, dead code)
- Theoretical vulnerabilities in code paths that are never exposed to
  external input
- Issues a SAST tool would flag without context (pure pattern matching)

Curate the top 3-5 highest-severity security findings with file:line
references and relevant code context. For each finding, include an initial
severity assessment (Critical / High / Medium).

Do not consult the security-reviewer agent during scanning. Scanning is
preparation.
</scan>

<consult>
## Phase 2: Consult the Security Reviewer

Package the scan results and invoke the lz-advisor:security-reviewer agent
via the Agent tool with a self-contained prompt containing:

1. Review scope description (what files, directories, or changes were
   reviewed and what the code does)
2. Top 3-5 security findings, each with:
   - Description of the vulnerability or risk
   - File path and line number
   - Relevant code snippet (keep concise -- do not paste entire files)
   - Initial severity assessment (Critical / High / Medium)
   - Suspected OWASP Top 10 category (if identifiable)
3. Brief description of the application's threat model context (what the
   code protects, who might attack it)
4. Request: "Validate these findings against OWASP Top 10, assess
   exploitability and impact, and identify any attack chains across
   findings."

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
