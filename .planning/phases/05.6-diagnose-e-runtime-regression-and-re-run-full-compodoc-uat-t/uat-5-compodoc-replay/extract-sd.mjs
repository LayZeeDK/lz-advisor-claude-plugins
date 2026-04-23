#!/usr/bin/env node
// extract-sd.mjs -- Extract advisor Strategic Direction from a stream-json JSONL trace.
//
// Usage: node extract-sd.mjs <path-to-jsonl-trace>
// Output: Writes the advisor Strategic Direction text(s) to stdout, separated by
//         "--- CALL BOUNDARY ---" when multiple advisor tool_result events are present.
//
// Reads stream-json format (per RESEARCH.md A4): the advisor agent's response arrives
// as a user-message tool_result event with content = the advisor's final text. When
// content is an array, take content[0].text. When content is a string, take it directly.
// Filter heuristic: keep tool_result texts that include "1." (the leading numbered-item
// marker from the advisor Output Constraint) to exclude non-advisor tool_results.

import fs from 'node:fs';
import process from 'node:process';

const path = process.argv[2];
if (!path) {
  console.error('Usage: node extract-sd.mjs <path-to-jsonl-trace>');
  process.exit(2);
}

if (!fs.existsSync(path)) {
  console.error(`File not found: ${path}`);
  process.exit(2);
}

const lines = fs.readFileSync(path, 'utf8').split('\n').filter(Boolean);
const advisorCalls = [];

for (const line of lines) {
  try {
    const event = JSON.parse(line);

    if (event.type === 'user' && event.message && event.message.content) {
      for (const c of event.message.content) {
        if (c.type === 'tool_result' && c.content) {
          const text = typeof c.content === 'string'
            ? c.content
            : (c.content[0] && c.content[0].text) || '';

          if (text.includes('1.')) {
            advisorCalls.push(text);
          }
        }
      }
    }
  } catch (e) {
    // Skip malformed lines silently; stream-json traces should be line-valid JSON
    // but we do not want extractor to abort on a partial tail.
  }
}

process.stdout.write(advisorCalls.join('\n--- CALL BOUNDARY ---\n'));
