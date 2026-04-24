#!/usr/bin/env node
// extract-advisor-sd.mjs -- Extract the advisor agent's Strategic Direction text
// from a Claude Code stream-json JSONL trace.
//
// Usage:
//   node extract-advisor-sd.mjs <path-to-jsonl-trace>
//
// Output (stdout):
//   The advisor's verbatim tool_result text (content[0].text for each matched
//   Agent tool_use of subagent_type `lz-advisor:advisor`). Multiple advisor
//   invocations are separated by `\n--- CALL BOUNDARY ---\n` sentinels.
//
// Exit codes:
//   0 -- one or more advisor tool_results found and emitted
//   1 -- no advisor tool_results found
//   2 -- usage error (missing path / unreadable file)
//
// Identification rules (all must match for a tool_use to be classified as the
// advisor):
//   1. event.type === "assistant" with message.content[] containing an entry where
//      - type === "tool_use"
//      - name === "Agent"
//      - input.subagent_type === "lz-advisor:advisor"
//   2. The matching tool_result is the next `user` event whose content[] holds
//      a `tool_result` with the same `tool_use_id`.
//   3. Advisor text is tool_result.content[0].text when content is an array, or
//      content itself when content is a string.
//
// Design notes:
//   * Written to replace extract-sd.mjs's `"1."`-substring heuristic, which
//     false-positives on Glob listings and file-read results that happen to
//     start with a numbered line. The tool_use_id binding is unambiguous.
//   * Tolerates partial/truncated trailing JSONL (silently skips unparseable
//     lines) so that capture-in-progress traces can still be extracted.

import fs from 'node:fs';
import process from 'node:process';

const path = process.argv[2];

if (!path) {
  console.error('Usage: node extract-advisor-sd.mjs <path-to-jsonl-trace>');
  process.exit(2);
}

if (!fs.existsSync(path)) {
  console.error(`File not found: ${path}`);
  process.exit(2);
}

const lines = fs.readFileSync(path, 'utf8').split('\n').filter(Boolean);

// First pass: collect the tool_use ids of every advisor Agent invocation.
const advisorIds = new Set();

for (const line of lines) {
  let event;

  try {
    event = JSON.parse(line);
  } catch (_error) {
    continue;
  }

  if (event.type !== 'assistant') {
    continue;
  }

  const content = event.message && event.message.content;

  if (!Array.isArray(content)) {
    continue;
  }

  for (const block of content) {
    if (
      block.type === 'tool_use' &&
      block.name === 'Agent' &&
      block.input &&
      block.input.subagent_type === 'lz-advisor:advisor' &&
      typeof block.id === 'string'
    ) {
      advisorIds.add(block.id);
    }
  }
}

// Second pass: find tool_result events that match one of the advisor ids and
// extract their text content.
const advisorTexts = [];

for (const line of lines) {
  let event;

  try {
    event = JSON.parse(line);
  } catch (_error) {
    continue;
  }

  if (event.type !== 'user') {
    continue;
  }

  const content = event.message && event.message.content;

  if (!Array.isArray(content)) {
    continue;
  }

  for (const block of content) {
    if (block.type !== 'tool_result') {
      continue;
    }

    if (!advisorIds.has(block.tool_use_id)) {
      continue;
    }

    let text = '';

    if (typeof block.content === 'string') {
      text = block.content;
    } else if (Array.isArray(block.content) && block.content.length > 0) {
      const first = block.content[0];
      text = typeof first === 'object' && typeof first.text === 'string'
        ? first.text
        : '';
    }

    if (text) {
      advisorTexts.push(text);
    }
  }
}

if (advisorTexts.length === 0) {
  process.exit(1);
}

process.stdout.write(advisorTexts.join('\n--- CALL BOUNDARY ---\n'));
process.stdout.write('\n');
