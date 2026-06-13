# Fable / model-override empirical probe

**Date:** 2026-06-13 (closed 2026-06-14)
**Purpose:** Prove (a) whether a per-invocation `model` override beats an agent's `model: opus` frontmatter at runtime, (b) a reliable method to observe the ACTUAL model a subagent ran on, and (c) whether the advisor SUBAGENT can run on Fable. Settles the researcher disagreement on the load-bearing mechanism for v2.0.0.

## Method (the reusable proof)

Self-report of a model's own identity is NOT trustworthy. Ground truth is the **subagent JSONL transcript** Claude Code writes per subagent invocation:

```
~/.claude/projects/<cwd-hash>/<session-id>/subagents/agent-<id>.jsonl
```

Each records a `"model":"<id>"` field = the model the API was actually called with (`<synthetic>` when the spawn errored before running). Extract:

```
rg -o '"model":"[^"]*"' <agent-id>.jsonl | sort | uniq -c
```

The `claude --debug` session log (`~/.claude/debug/<session-id>.txt`) records the raw API request/response, including the dispatched model and any API error.

## Results

### Finding 1 - Per-invocation override BEATS frontmatter `model: opus` (PROVEN)

`Task(subagent_type="model-echo", model="haiku")` against an agent whose frontmatter says `opus` -> subagent JSONL ground truth `"model":"claude-haiku-4-5-20251001"`. Confirms resolution priority **per-invocation (2) > frontmatter (3)**. The override MECHANISM works.

### Finding 2 - Observability method works (PROVEN)

The `subagents/agent-<id>.jsonl` `"model"` field is clean ground truth (and `claude --debug` gives the raw API error). Suitable harness for any "resolved-model echo" verification.

### Finding 3 - The `fable` ALIAS clears the tool schema; the full ID does not

The Agent/Task `model` parameter is an enum: `sonnet | opus | haiku | fable`. Passing the full ID `claude-fable-5` raises an `InputValidationError` (schema). Passing the alias `fable` clears the schema and resolves to `claude-fable-5`. So the alias is the correct name -- but clearing the schema does NOT grant access (see Finding 4).

### Finding 4 - Subagent-Fable is BLOCKED SERVER-SIDE (the decisive finding)

Fable is rejected as a SUBAGENT model via EVERY mechanism, in every context tested:

| Mechanism / context | Result |
|---|---|
| per-invocation override (headless `-p`) | rejected |
| per-invocation override (interactive, Agent tool, `fable` alias) | rejected (`tool_uses: 0`) |
| `CLAUDE_CODE_SUBAGENT_MODEL=claude-fable-5` (priority 1, no per-invocation override; fresh interactive session) | rejected -- subagent JSONL `"model":"<synthetic>"`, `"isApiErrorMessage":true` |
| control: per-invocation override to `haiku` (same agent) | WORKS -> `claude-haiku-4-5-20251001` |
| user's interactive MAIN session `/model fable` | WORKS (per user) |

**Root cause (from `claude --debug` session log, authoritative):** the env var correctly routed the subagent (`[API:timing] dispatching to firstParty model=claude-fable-5`), and the **Anthropic API returned `404 not_found`**:

```
"Claude Fable 5 is not available. Please use Opus 4.8.
 Learn more: https://www.anthropic.com/news/fable-mythos-access"
```

So the block is **server-side, by Anthropic policy** -- not a CLI bug, not a name/alias format issue, not this session's child/workflow context. Fable (a Mythos-class model) is available as an INTERACTIVE PRIMARY session model but is NOT available for SUBAGENT / programmatic (`firstParty`) dispatch on this account; the API explicitly redirects to Opus 4.8.

## Conclusions

- The override MECHANISM + observability METHOD are runtime-PROVEN (opus->haiku, JSONL).
- **The advisor is a subagent, and subagent-Fable is server-side blocked. The on-demand-Fable-advisor feature is NOT deliverable today, by any mechanism -- it is an Anthropic access restriction, not an engineering gap.**
- `model: opus` frontmatter guarantees safe degradation regardless: a rejected Fable override falls back to the Opus floor (the API even says "Please use Opus 4.8").

## Roadmap impact

- **Descope the Fable advisor from v2.0.0.** Ship the `lz-` skill rename (the critical built-in-shadowing fix) as v2.0.0.
- Keep the proven override mechanism + observability method + this evidence as a deferred backlog seed; revisit if/when Anthropic enables Fable (or another stronger-than-Opus model) for subagent dispatch. At that point the feature is a small change (the plumbing pattern is proven).
- Re-check trigger: when `https://www.anthropic.com/news/fable-mythos-access` indicates Mythos-class models are available for subagent/API dispatch on the relevant plan.
