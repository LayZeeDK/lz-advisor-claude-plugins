# Advisor Timing and Context Packaging

## When to Consult the Advisor

The `lz-advisor` agent is backed by a stronger model. When invoked via the
Agent tool, pass a clear prompt summarizing the task, findings so far, and
what guidance is needed. The advisor cannot see the conversation -- all relevant
context must be included in the prompt.

Call the advisor before substantive work -- before writing, before committing to
an interpretation, before building on an assumption. If the task requires
orientation first (finding files, reading source, seeing what is there), do that
first, then call the advisor. Orientation is not substantive work. Writing,
editing, and declaring an answer are.

Also call the advisor:
- When the task is believed to be complete. Before this call, make the
  deliverable durable: write the file, save the result, commit the change.
  The advisor call takes time; if the session ends during it, a durable result
  persists and an unwritten one does not.
- When stuck -- errors recurring, approach not converging, results that do
  not fit.
- When considering a change of approach.

On tasks longer than a few steps, call the advisor at least once before
committing to an approach and once before declaring done. On short reactive
tasks where the next action is dictated by tool output just read, additional
calls are unnecessary -- the advisor adds most value on the first call, before
the approach crystallizes.

## How to Treat the Advice

Give the advice serious weight. If a step fails empirically, or there is
primary-source evidence that contradicts a specific claim (the file says X,
the documentation states Y), adapt. A passing self-test is not evidence the
advice is wrong -- it is evidence the test does not check what the advice is
checking.

If findings point one way and the advisor points another: do not silently
switch. Surface the conflict in one more advisor call -- "I found X, you
suggest Y, which constraint breaks the tie?" The advisor saw the provided
evidence but may have underweighted it; a reconcile call is cheaper than
committing to the wrong branch.

## What to Include in the Advisor Prompt

The advisor starts with a fresh context each time -- it cannot see the
conversation history. Every consultation must be self-contained.

Include in the advisor prompt:
1. The original task (quote the user's request or goal)
2. Key findings from orientation (files examined, patterns found, constraints
   discovered)
3. Current state of work (what has been done, what remains)
4. The specific decision or question that needs guidance

Keep the prompt focused and summarized. The advisor works best with clear,
organized context -- not raw file dumps or verbose tool output. Summarize
findings; do not paste entire files.
