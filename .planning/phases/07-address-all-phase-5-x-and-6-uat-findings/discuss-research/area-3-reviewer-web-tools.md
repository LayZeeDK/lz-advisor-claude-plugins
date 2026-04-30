# Area 3 Research: Reviewer web tools (Finding F)

## Research questions

1. How do production code-review agents handle Class-2 (vendor API / version-conditional) questions?
2. What's the principle-of-least-privilege guidance on extending sub-agent tool grants?
3. What's the canonical structured-output pattern for sub-agent escalation requests?
4. How effective is pre-flight scan (predict question classes upfront) vs reactive escalation?

## Findings

### Pre-flight deterministic scan is the production default

From Qwen Code's documentation:

> "Before the LLM agents run, /review automatically runs your project's existing linters and type checkers, with no user configuration needed. Deterministic findings are tagged with [linter] or [typecheck] and skip LLM verification — they are ground truth."

Plus: "Smart caching tied to model versions prevents stale reviews. When code changes modify exported functions, classes, or interfaces, the review agents automatically search for all callers and check compatibility."

This is the production analog of Finding F's Option 1 (pre-emptive Class-2 scan in executor) — deterministic checks first, LLM analysis on top.

Source: <https://qwenlm.github.io/qwen-code-docs/en/users/features/code-review/>

### Principle of Least Privilege for sub-agents (academic + OWASP)

OWASP's AI Agent Security Cheat Sheet:

> "Apply least privilege to all agent tools and permissions. Tool definitions must validate parameters against allow-lists or sandboxed directories. Permission Boundaries apply the principle of least privilege — the agent's permissions must never exceed those of the user it acts for and should be scoped down to only what is strictly necessary for the current task."

Source: <https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html>

The arXiv paper "Taming Various Privilege Escalation in LLM-Based Agent Systems" formally treats agent over-grant as a privilege escalation attack:

> "Following the principle of least privilege, a privilege escalation attack is defined as any agent actions beyond those minimally required to fulfill the user's intent."

Source: <https://arxiv.org/html/2601.11893v1>

The Claude Code GitHub issue #20264 explicitly identifies subagent privilege inheritance as a security concern:

> "When a parent agent uses bypassPermissions mode, all subagents unconditionally inherit this mode and it cannot be overridden. This creates significant security concerns including privilege escalation."

Source: <https://github.com/anthropics/claude-code/issues/20264>

**Implication for Finding F Option 3 (extend reviewer tool grant):** explicitly contradicts industry guidance. The reviewer was scoped to `[Read, Glob]` by intent, matching OWASP's recommended pattern. Extending the grant to include WebSearch/WebFetch/ToolSearch breaks the security stance.

### Structured-output escalation as a security control

From OWASP and the InfoQ Least-Privilege AI Agent Gateway:

> "Structured Output Enforcement (e.g., JSON with a strict schema) is a critical security control, not just a reliability measure. It prevents the agent from generating unexpected and potentially dangerous content like freeform HTML or Markdown with image tags."

InfoQ's gateway architecture:
> "AI agents are treated as untrusted requesters. They can discover capabilities and submit structured requests, but they never interact with infrastructure APIs directly. All execution happens behind a strict gateway that enforces validation, authorization, and isolation."

The flow uses MCP-style tool discovery + JSON-RPC structured calls. The gateway validates request schema, computes a plan hash, and authorizes via OPA.

Sources:
- <https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html>
- <https://www.infoq.com/articles/building-ai-agent-gateway-mcp/>

This directly supports Finding F's Option 2 (reviewer escalation hook with `<verify_request>` block): the reviewer emits a structured request, the executor (which DOES have web tools) validates and resolves, then re-invokes the reviewer with anchors. The reviewer never gains additional privilege; the executor stays the privileged surface.

### Question framing and class context

From Augment Code's coding-agent best practices:

> "Specify relevant keywords and file locations. Instead of just 'Enable JSON parser for chat backend,' say 'Enable JSON parser for chat backend. It should be used in LLMOutputParsing class, somewhere in services subfolder.'"

> "Always pair implementation requests with verification: Instead of 'Implement tests for class TextGenerator' followed by manually running tests, say 'Implement tests for class TextGenerator and run them to make sure they work.'"

> "Since Agents are action-oriented, they may interpret questions as commands. To prevent this, preface questions with 'Just a question:'"

Sources:
- <https://www.augmentcode.com/blog/best-practices-for-using-ai-coding-agents>

This informs Finding F's `<verify_request>` block shape: include question class, anchor target, file locations.

### Spotify's Honk: pass/fail-only feedback

From the outcome-based verification analysis:

> "Spotify's Honk system: 1,500+ PRs merged through verification loops, handling roughly 50% of all PRs automatically. Their key design choice: the agent doesn't know how verification works. It just gets pass/fail feedback. That separation keeps the agent focused on the task, not on gaming the verifier."

Source: <https://dev.to/moonrunnerkc/ai-coding-agents-lie-about-their-work-outcome-based-verification-catches-it-12b4>

**Implication:** the reviewer escalation hook should be one-shot (executor resolves the verify_request, re-invokes once). Not iterative — that risks the reviewer adapting to verifier feedback rather than producing fresh reviews.

## Synthesis

The research strongly supports Option 1 + Option 2 in tandem; explicitly contradicts Option 3:

- **Option 1 (pre-emptive Class-2 scan in executor)** matches Qwen Code's production default ("linters and type checkers run first; LLM on top"). Cheap, deterministic, reduces reviewer's reliance on hedge frames.
- **Option 2 (reviewer escalation hook with structured `<verify_request>` block)** matches OWASP's structured-output-as-security-control pattern + InfoQ's gateway architecture. The reviewer emits a structured request; the executor (already has web tools per D-11 Profile A) validates and resolves; re-invoke once. Spotify's Honk principle: one-shot pass/fail, not iterative.
- **Option 3 (extend reviewer tool grant)** contradicts OWASP, the academic literature on agent privilege escalation, and Claude Code's own design. **Defer indefinitely.**

The two-option pattern (catch predictable surfaces upfront via Option 1; handle long tail via Option 2) is the empirically-grounded design.

## Updated trade-off table for the user

| Approach | Empirical anchor | Pros | Cons |
|---|---|---|---|
| **Option 1: Pre-emptive Class-2 scan in executor** | Matches Qwen Code's production default | Catches predictable Class-2 surfaces upfront cheaply; reduces reviewer hedge frequency; deterministic | Doesn't catch surprises — reviewer can still surface unanticipated Class-2 questions |
| **Option 2: Reviewer escalation hook with `<verify_request>` block** | Matches OWASP structured-output security control + InfoQ gateway pattern + Spotify Honk one-shot principle | Handles long tail of reviewer surprises; preserves reviewer least-privilege; structured-output schema is auditable | Adds re-invoke complexity (one extra reviewer call per fired hook) |
| **Option 3: Extend reviewer tool grant** | Contradicts OWASP, arXiv 2601.11893, Claude Code Issue #20264 | Simplest mechanism (no re-invoke logic) | Breaks principle of least privilege; subagent tool inheritance is a documented escalation risk |
| **1+2 in tandem (pre-emptive scan + escalation hook)** | Two-layer pattern matching production code-review systems (deterministic-first + LLM-second) | Catches predictable upfront; long tail through structured escalation; both anchored in research | Most edits but each is small; smoke fixture exercises both layers |
