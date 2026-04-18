#!/usr/bin/env node
/**
 * parse-trace.mjs -- Parses a `claude -p --verbose --output-format stream-json`
 * NDJSON trace file and emits the Phase 5.3 UAT metrics JSON shape.
 *
 * Usage: node parse-trace.mjs <trace.ndjson>
 *
 * Emits JSON to stdout. Non-zero exit on parse error.
 *
 * Stream-json schema (CLI session format, empirically confirmed in Plan 03
 * validation run on 2026-04-18 -- see VALIDATION-RUN.md):
 * - One JSON object per line.
 * - Top-level event shape: `{type: "assistant"|"user"|"system"|"result",
 *   message: {...}, parent_tool_use_id: string|null, session_id, uuid}`.
 * - Assistant events: `message.content[]` contains `{type: "text"|"thinking"
 *   |"tool_use", ...}` blocks. A `tool_use` with `name: "Agent"` is an
 *   advisor/reviewer/security-reviewer spawn; `input.subagent_type` is
 *   e.g. `"lz-advisor:advisor"`.
 * - The Agent tool's RESULT is delivered in a subsequent top-level `user`
 *   event whose `message.content[]` contains a `tool_result` block with
 *   `tool_use_id` matching the Agent spawn's id. That `tool_result.content`
 *   (usually a string or array-of-text-blocks) is the advisor's final
 *   response to the executor -- i.e., the trimmed output after
 *   maxTurns/Visibility Model discipline.
 * - Agent-internal tool calls and turns manifest as events whose
 *   `parent_tool_use_id` equals the Agent spawn id. In CLI session format,
 *   the CLI appears to summarize the agent's internal activity rather than
 *   emit every internal turn individually; the tool_result's trailing
 *   `<usage>tool_uses: N</usage>` block is the authoritative tool-call count.
 *
 * Metrics emitted (per 05.3-PLAN.md interfaces):
 * - advisor_tool_calls: count parsed from the tool_result's `<usage>` block
 *   if present, else fallback to events with matching parent_tool_use_id.
 * - advisor_turns_used: events with matching parent_tool_use_id, or 1 if
 *   the tool_result exists but no nested turns were emitted (single-turn
 *   synthesis).
 * - advisor_final_response: the tool_result content text.
 * - advisor_model_id: extracted from the assistant event containing the
 *   Agent spawn (the session's outer assistant model is the executor; we
 *   do not get a separate advisor model line in CLI session format, but
 *   the final `result` event's `modelUsage` object lists `claude-opus-4-7`
 *   when Opus was invoked). We use modelUsage to identify the advisor
 *   model.
 */

import { readFileSync } from 'node:fs';

function extractToolResultText(block) {
  if (!block) {
    return '';
  }

  if (typeof block.content === 'string') {
    return block.content;
  }

  if (Array.isArray(block.content)) {
    return block.content.map((c) => c.text || (typeof c === 'string' ? c : JSON.stringify(c))).join('\n');
  }

  return '';
}

function parseUsageFromToolResult(text) {
  // Parse the trailing `<usage>tool_uses: N\nduration_ms: M</usage>` block
  // that the Agent tool appends to its returned text.
  const match = text.match(/<usage>([\s\S]*?)<\/usage>/);

  if (!match) {
    return { tool_uses: null, duration_ms: null };
  }

  const body = match[1];
  const toolMatch = body.match(/tool_uses:\s*(\d+)/);
  const durMatch = body.match(/duration_ms:\s*(\d+)/);

  return {
    tool_uses: toolMatch ? Number(toolMatch[1]) : null,
    duration_ms: durMatch ? Number(durMatch[1]) : null,
  };
}

function stripUsageBlock(text) {
  return text.replace(/\n?<usage>[\s\S]*?<\/usage>\s*$/, '').trim();
}

function parseTrace(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/).filter(Boolean);
  const events = [];

  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch (err) {
      process.stderr.write(`[parse-trace] skipping malformed line: ${err.message}\n`);
    }
  }

  // Find Agent spawn tool_use events (spawned by executor, nested inside
  // a top-level assistant event's message.content[]).
  const agentSpawns = [];

  for (const evt of events) {
    if (evt.type !== 'assistant') {
      continue;
    }

    if (!evt.message || !Array.isArray(evt.message.content)) {
      continue;
    }

    for (const block of evt.message.content) {
      if (block.type !== 'tool_use') {
        continue;
      }

      if (block.name !== 'Agent' && block.name !== 'Task') {
        continue;
      }

      const subagent = (block.input && block.input.subagent_type) || '';

      if (!subagent.startsWith('lz-advisor:')) {
        continue;
      }

      agentSpawns.push({ id: block.id, subagent, prompt: block.input && block.input.prompt });
    }
  }

  // Find tool_result events that correspond to those Agent spawns.
  const agentResults = [];

  for (const evt of events) {
    if (evt.type !== 'user') {
      continue;
    }

    if (!evt.message || !Array.isArray(evt.message.content)) {
      continue;
    }

    for (const block of evt.message.content) {
      if (block.type !== 'tool_result') {
        continue;
      }

      const matchingSpawn = agentSpawns.find((s) => s.id === block.tool_use_id);

      if (!matchingSpawn) {
        continue;
      }

      const text = extractToolResultText(block);
      const usage = parseUsageFromToolResult(text);

      agentResults.push({
        spawn: matchingSpawn,
        rawText: text,
        cleanText: stripUsageBlock(text),
        usage,
      });
    }
  }

  // Advisor/reviewer/security-reviewer internal turns: assistant events with
  // parent_tool_use_id matching a spawn id (rare in CLI session format, but
  // captured if present).
  const agentInternalTurns = events.filter((evt) => {
    if (evt.type !== 'assistant') {
      return false;
    }

    if (!evt.parent_tool_use_id) {
      return false;
    }

    return agentSpawns.some((s) => s.id === evt.parent_tool_use_id);
  });

  // Detect maxturns exhaustion: any system event containing max_turns markers,
  // or agent spawn whose tool_result is empty/preamble-only.
  const maxTurnsEvents = events.filter((evt) => {
    if (evt.type !== 'system') {
      return false;
    }

    return /max_turns|maxturns/i.test(JSON.stringify(evt));
  });

  // Take the FIRST advisor result as the primary one (most plan/execute skills
  // issue one consultation). If there are multiple, concatenate for the
  // word-count heuristic but keep the first as the final-response text.
  const primary = agentResults[0] || null;
  const advisorFinal = primary ? primary.cleanText : '';
  const wordCount = advisorFinal.trim().split(/\s+/).filter(Boolean).length;

  // First-try success heuristic per 05.2 field test: final response starts
  // with "1." AND has > 50 words. Matches the Phase 5.2 success criterion.
  const firstTrySuccess = /^\s*1\./.test(advisorFinal) && wordCount > 50;

  // advisor_tool_calls: prefer the <usage> block tool_uses count (authoritative).
  let advisorToolCalls = 0;

  if (primary && primary.usage && primary.usage.tool_uses !== null) {
    advisorToolCalls = primary.usage.tool_uses;
  } else {
    advisorToolCalls = agentInternalTurns.reduce((sum, turn) => {
      const toolUses = (turn.message && Array.isArray(turn.message.content))
        ? turn.message.content.filter((c) => c.type === 'tool_use').length
        : 0;

      return sum + toolUses;
    }, 0);
  }

  // advisor_turns_used: nested assistant events, or 1 if we have a result but
  // no nested turns (single-turn synthesis, the best case).
  let advisorTurns = agentInternalTurns.length;

  if (advisorTurns === 0 && primary) {
    advisorTurns = 1;
  }

  // Determine failure mode.
  let failureMode = 'none';

  if (!primary) {
    failureMode = 'no_advisor_spawn';
  } else if (maxTurnsEvents.length > 0 || advisorFinal.trim().length === 0) {
    failureMode = 'maxturns';
  } else if (!firstTrySuccess && wordCount > 0 && wordCount <= 50) {
    failureMode = 'preamble_only';
  } else if (!firstTrySuccess) {
    failureMode = 'other';
  }

  // Extract model_id from the final `result` event's modelUsage object (per
  // CLI session format). This identifies whether Opus 4.7 was invoked.
  let modelId = '';

  for (const evt of events) {
    if (evt.type !== 'result') {
      continue;
    }

    if (!evt.modelUsage) {
      continue;
    }

    // modelUsage is keyed by model id, e.g. "claude-opus-4-7[1m]".
    const opusKey = Object.keys(evt.modelUsage).find((k) => k.startsWith('claude-opus'));

    if (opusKey) {
      modelId = opusKey;
      break;
    }
  }

  // Count executor tool calls: tool_use blocks in assistant events with
  // parent_tool_use_id == null, excluding Agent/Task spawns (those are
  // agent launches, not regular executor tool calls from a UAT perspective,
  // though some harnesses might want to count them -- we exclude here).
  let executorToolCalls = 0;

  for (const evt of events) {
    if (evt.type !== 'assistant') {
      continue;
    }

    if (evt.parent_tool_use_id) {
      continue;
    }

    if (!evt.message || !Array.isArray(evt.message.content)) {
      continue;
    }

    for (const block of evt.message.content) {
      if (block.type !== 'tool_use') {
        continue;
      }

      if (block.name === 'Agent' || block.name === 'Task') {
        continue;
      }

      executorToolCalls++;
    }
  }

  // Executor completion: presence of a final `result` event with subtype "success".
  const executorCompleted = events.some((evt) => {
    if (evt.type !== 'result') {
      return false;
    }

    return evt.subtype === 'success';
  });

  return {
    skill: process.env.UAT_SKILL || '',
    pass: process.env.UAT_PASS || '',
    commit: process.env.UAT_COMMIT || '',
    advisor_tool_calls: advisorToolCalls,
    advisor_turns_used: advisorTurns,
    maxturns_exhausted: failureMode === 'maxturns',
    first_try_success: firstTrySuccess,
    advisor_word_count: wordCount,
    advisor_final_response: advisorFinal.slice(0, 4000),
    advisor_model_id: modelId,
    executor_tool_calls: executorToolCalls,
    executor_completed: executorCompleted,
    failure_mode: failureMode,
  };
}

function main() {
  const path = process.argv[2];

  if (!path) {
    process.stderr.write('usage: node parse-trace.mjs <trace.ndjson>\n');
    process.exit(2);
  }

  const metrics = parseTrace(path);
  process.stdout.write(JSON.stringify(metrics, null, 2) + '\n');
}

main();
