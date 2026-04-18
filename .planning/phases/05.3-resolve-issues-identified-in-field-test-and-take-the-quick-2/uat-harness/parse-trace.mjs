#!/usr/bin/env node
/**
 * parse-trace.mjs -- Parses a `claude -p --verbose --output-format stream-json`
 * NDJSON trace file and emits the Phase 5.3 UAT metrics JSON shape.
 *
 * Usage: node parse-trace.mjs <trace.ndjson>
 *
 * Emits JSON to stdout. Non-zero exit on parse error.
 *
 * Assumptions (per 05.3-RESEARCH.md Assumption A1):
 * - stream-json emits one JSON object per line
 * - content_block_start events with type == "tool_use" and non-null
 *   parent_tool_use_id represent agent-internal tool calls
 * - agent_name field (if present) identifies the agent; otherwise
 *   we attribute by parent_tool_use_id chaining to Agent-tool spawns
 * - final advisor response is the last "text" content block in the
 *   agent's message stream before the containing Agent tool_use_result
 */

import { readFileSync } from 'node:fs';

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

  // Find Agent-tool spawns targeting lz-advisor agents.
  const agentSpawns = events.filter((evt) => {
    if (evt.type !== 'content_block_start') {
      return false;
    }

    const block = evt.content_block;

    if (!block || block.type !== 'tool_use') {
      return false;
    }

    const name = block.name || '';

    return name === 'Agent'
      || name.startsWith('lz-advisor:')
      || (block.input && typeof block.input.agent === 'string' && block.input.agent.startsWith('lz-advisor:'));
  });

  // Collect tool_use events attributed to an advisor/reviewer/security-reviewer spawn.
  const agentToolUses = events.filter((evt) => {
    if (evt.type !== 'content_block_start') {
      return false;
    }

    const block = evt.content_block;

    if (!block || block.type !== 'tool_use') {
      return false;
    }

    // Nested under an agent spawn: parent_tool_use_id matches a spawn's block id.
    if (evt.parent_tool_use_id) {
      return agentSpawns.some((spawn) => spawn.content_block && spawn.content_block.id === evt.parent_tool_use_id);
    }

    // Alternative attribution via agent_name (if the field exists).
    if (evt.agent_name && String(evt.agent_name).startsWith('lz-advisor:')) {
      return true;
    }

    return false;
  });

  // Collect message_start events nested under an agent spawn (turn count).
  const agentTurnStarts = events.filter((evt) => {
    if (evt.type !== 'message_start') {
      return false;
    }

    if (evt.parent_tool_use_id) {
      return agentSpawns.some((spawn) => spawn.content_block && spawn.content_block.id === evt.parent_tool_use_id);
    }

    return false;
  });

  // Detect maxturns exhaustion: agent stream ends with tool_use blocks rather than a text block,
  // or an explicit system event with max_turns_reached.
  const maxTurnsEvents = events.filter((evt) => {
    if (evt.type !== 'system') {
      return false;
    }

    return /max_turns|maxturns/i.test(JSON.stringify(evt));
  });

  // Extract advisor final text response.
  const agentTextBlocks = events.filter((evt) => {
    if (evt.type !== 'content_block_start' && evt.type !== 'content_block_delta') {
      return false;
    }

    const block = evt.content_block || evt.delta;

    if (!block || block.type !== 'text') {
      return false;
    }

    if (evt.parent_tool_use_id) {
      return agentSpawns.some((spawn) => spawn.content_block && spawn.content_block.id === evt.parent_tool_use_id);
    }

    return false;
  });

  // Concatenate agent final text.
  let advisorFinal = '';

  for (const blk of agentTextBlocks) {
    const text = (blk.content_block && blk.content_block.text) || (blk.delta && blk.delta.text) || '';
    advisorFinal += text;
  }

  const wordCount = advisorFinal.trim().split(/\s+/).filter(Boolean).length;

  // First-try success heuristic per 05.2 field test: final response starts with "1." AND has > 50 tokens.
  const firstTrySuccess = /^\s*1\./.test(advisorFinal) && wordCount > 50;

  // Detect preamble-only failure: text exists but is short (<= 50 words) or does not start with "1."
  let failureMode = 'none';

  if (maxTurnsEvents.length > 0 || (agentSpawns.length > 0 && advisorFinal.trim().length === 0)) {
    failureMode = 'maxturns';
  } else if (!firstTrySuccess && wordCount > 0 && wordCount <= 50) {
    failureMode = 'preamble_only';
  } else if (!firstTrySuccess) {
    failureMode = 'other';
  }

  // Extract model_id from agent message_start events (per Risk 2 mitigation).
  let modelId = '';

  for (const turn of agentTurnStarts) {
    if (turn.message && turn.message.model) {
      modelId = String(turn.message.model);
      break;
    }
  }

  // Count executor tool calls (everything NOT attributed to an agent spawn).
  const executorToolUses = events.filter((evt) => {
    if (evt.type !== 'content_block_start') {
      return false;
    }

    const block = evt.content_block;

    if (!block || block.type !== 'tool_use') {
      return false;
    }

    // Exclude anything attributed to an agent spawn.
    if (evt.parent_tool_use_id) {
      return false;
    }

    if (evt.agent_name && String(evt.agent_name).startsWith('lz-advisor:')) {
      return false;
    }

    return true;
  });

  const executorCompleted = events.some((evt) => {
    if (evt.type !== 'message_stop') {
      return false;
    }

    return !evt.parent_tool_use_id;
  });

  return {
    skill: process.env.UAT_SKILL || '',
    pass: process.env.UAT_PASS || '',
    commit: process.env.UAT_COMMIT || '',
    advisor_tool_calls: agentToolUses.length,
    advisor_turns_used: agentTurnStarts.length,
    maxturns_exhausted: failureMode === 'maxturns',
    first_try_success: firstTrySuccess,
    advisor_word_count: wordCount,
    advisor_final_response: advisorFinal.slice(0, 4000),
    advisor_model_id: modelId,
    executor_tool_calls: executorToolUses.length,
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
