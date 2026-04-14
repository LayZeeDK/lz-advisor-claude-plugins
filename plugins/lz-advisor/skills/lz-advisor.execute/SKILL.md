---
name: lz-advisor.execute
description: >
  This skill should be used when the user wants to implement,
  build, or execute a coding task with strategic advisor guidance.
  Trigger phrases include "implement this task", "execute this
  plan", "build this feature", "code this up",
  "lz-advisor.execute", "start building", "implement with guidance", "build
  this with advisor help", "execute the plan", and "code this
  feature". This skill pairs Sonnet execution with Opus strategic
  consultation for near-Opus intelligence at Sonnet cost. It
  follows a six-phase workflow: orient, consult, execute, make
  durable, final review, and complete. Optionally accepts a plan
  file from lz-advisor.plan via @ file mention. This skill should
  NOT be used when the user wants to plan before coding, review
  completed code, or run security audits -- those are handled by
  sibling skills lz-advisor.plan, lz-advisor.review, and
  lz-advisor.security-review respectively.
version: 0.3.0
allowed-tools: Agent(lz-advisor:advisor)
---

The lz-advisor:advisor agent is backed by a stronger model (Opus). Invoke it
via the Agent tool at the strategic moments described below. For detailed
guidance on timing, advice weight, and context packaging, see:

@${CLAUDE_PLUGIN_ROOT}/references/advisor-timing.md

This skill follows a six-phase workflow: orient, consult before work, execute
with conditional advisor calls, make deliverable durable, consult before done,
then complete.

<orient>
## Phase 1: Orient

Understand the task scope and current codebase state before doing any work.

If the user mentioned a plan file (via @ file reference), read it first. Use
the plan's Strategic Direction and Steps as the foundation for the task. Orient
by verifying the plan's assumptions against the current codebase -- check that
referenced files exist, patterns match, and dependencies hold. Skip redundant
exploration the plan already covers.

If no plan file was mentioned, orient from scratch:

- Read files relevant to the user's request
- Examine directory structure and dependencies
- Identify constraints, existing patterns, and integration points
- Note what exists and what needs to change

Do not write code or make changes during orientation. Do not consult the
advisor yet -- orientation is preparation, not substantive work.
</orient>

<consult>
## Phase 2: Consult the Advisor

Before starting substantive work, invoke the lz-advisor:advisor agent via the
Agent tool. Package a focused prompt containing:

1. The user's original task (quote their request)
2. Key findings from orientation (files examined, patterns found, constraints
   discovered, plan context if a plan file was provided)
3. A specific question: "Given these findings, what approach and sequence of
   steps would you recommend? What should I watch out for?"

Keep the prompt summarized -- do not paste entire files. The advisor starts
with a fresh context and cannot see the conversation. All relevant context
goes in the prompt.

### What to Include Verbatim

When packaging the advisor prompt, distinguish between source material and
your own findings:

- Preserve verbatim: user-pasted documentation excerpts, API specs, error
  messages, configuration blobs, code snippets from third-party sources,
  and tool output the user surfaced as evidence
- Summarize: your own orientation findings (files read, patterns observed,
  architectural relationships)

If user-pasted material exceeds roughly 2,000 words, quote the sections
relevant to the decision verbatim rather than paraphrasing the whole
document. The advisor has no network access and cannot retrieve content
you omit.
</consult>

<execute>
## Phase 3: Execute

Carry out the task following the advisor's strategic direction. Read files,
write code, run tests, iterate on errors. This is the substantive work phase.

Give the advisor's guidance serious weight. If a step fails empirically, or
primary-source evidence contradicts a specific claim, adapt. A passing self-test
is not evidence the advice is wrong -- it is evidence the test may not check
what the advice checks.

### When to Consult Again

During execution, consult the advisor again when:

- **Empirical contradiction**: Evidence contradicts the plan or pre-execute
  guidance -- a type error, failing test, or tool output that invalidates
  an assumption the approach depends on
- **Non-trivial approach change**: The planned step does not work and the
  substitute requires strategic judgment, not just a surface fix
- **Silent failure**: A tool exits successfully but the expected artifact is
  missing, empty, or wrong -- the cause is unclear
- **Strategic shape change**: A deviation from the plan changes its overall
  structure -- moving configuration between files, swapping integration
  patterns, or adding a workaround with ongoing maintenance cost

Do not re-consult for:
- Trivial fixes: typos, import paths, obvious refactors -- proceed solo
- Format or style corrections -- proceed solo

Keep re-consultation prompts brief (2-3 sentences): what changed, what
options are being considered, what decision is needed. These calls reuse
the pre-execute consultation context implicitly; a full orient repackage
is unnecessary.

### Reconciliation

If findings point one way and the advisor points another, do not silently
switch. Surface the conflict in one more advisor call: "I found X, you
suggested Y -- which constraint breaks the tie?" The advisor saw the evidence
provided but may have underweighted it; a reconciliation call is cheaper than
committing to the wrong branch.

### Context Packaging for Mid-Execution Consultations

Each advisor call must be self-contained. Include:

1. The original task (quote the user's request)
2. What has been done so far (files changed, approach taken)
3. The current problem or decision (error details, approach tradeoffs)
4. A specific question requesting guidance
</execute>

<durable>
## Phase 4: Make Durable

Before the final advisor consultation, make the deliverable durable.

1. Write all files -- ensure nothing remains only in memory or tool output
2. Run tests if applicable and fix failures
3. Commit the changes: stage specific files by name (never use `git add .` or
   `git add -A`) and create a commit with a clear message

The commit ensures work survives if the session ends during the final advisor
call. An unwritten or uncommitted result does not persist.
</durable>

<final>
## Phase 5: Final Advisor Consultation

After committing, invoke the lz-advisor:advisor agent one more time. Package:

1. The user's original task
2. Summary of changes made (files created or modified, key decisions)
3. Test results if applicable
4. Commit reference (hash or message)
5. A specific question: "Review the approach taken. Are there concerns, missed
   edge cases, or improvements to flag before declaring done?"

This is a final check, not a request for approval. The advisor verifies the
approach is sound and flags concerns the executor may have missed.
</final>

<complete>
## Phase 6: Complete

If the advisor flagged concerns in the final consultation:

- Address actionable concerns (fix bugs, handle edge cases, update tests)
- Commit any corrections (stage specific files by name)
- If a concern requires a fundamental rethink, surface it to the user rather
  than silently rebuilding

If the advisor confirmed the approach is sound, present the completed work to
the user: summarize what was built, what files were created or changed, and
what tests pass.
</complete>

After completing the task, present a summary to the user. If the work was
informed by a plan file, note any deviations from the original plan.
