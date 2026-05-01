// Extract a faithful but readable transcript from a Claude Code JSONL session log.
// Preserves: tool_use args, tool_result content, assistant text, advisor sub-agent transcripts.
// Drops: cache markers, request IDs, UUIDs, usage metadata, redundant per-message version metadata.

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('usage: extract-uat-transcript.mjs <input.jsonl> <output.txt>');
  process.exit(1);
}

const [inputPath, outputPath] = args;
const lines = readFileSync(inputPath, 'utf8').split('\n').filter(Boolean);

const out = [];

for (let i = 0; i < lines.length; i++) {
  const lineNum = i + 1;
  let obj;

  try {
    obj = JSON.parse(lines[i]);
  } catch (e) {
    out.push(`L${lineNum} [PARSE-ERROR] ${lines[i].slice(0, 200)}`);
    continue;
  }

  const type = obj.type;
  const subtype = obj.subtype || '';
  const skill = obj.attributionSkill || '';
  const sidechain = obj.isSidechain ? ' [SIDECHAIN]' : '';

  if (type === 'system' && subtype === 'init') {
    const cwd = obj.cwd || '';
    const sid = (obj.session_id || '').slice(0, 8);
    out.push(`L${lineNum} SYSTEM init session=${sid} cwd=${cwd}`);
    continue;
  }

  if (type === 'system' && subtype === 'hook_started') {
    out.push(`L${lineNum} SYSTEM hook_started ${obj.hook_name || ''}`);
    continue;
  }

  if (type === 'system' && subtype === 'hook_response') {
    out.push(`L${lineNum} SYSTEM hook_response ${obj.hook_name || ''} exit=${obj.exit_code}`);
    continue;
  }

  if (type === 'system') {
    out.push(`L${lineNum} SYSTEM ${subtype}`);
    continue;
  }

  if (type === 'rate_limit_event') {
    const info = obj.rate_limit_info || {};
    out.push(`L${lineNum} RATE_LIMIT status=${info.status} type=${info.rateLimitType} util=${info.utilization}`);
    continue;
  }

  if (type === 'assistant' || type === 'user') {
    const content = obj.message?.content;

    if (!Array.isArray(content)) {
      const txt = typeof content === 'string' ? content : JSON.stringify(content || '').slice(0, 300);
      out.push(`L${lineNum} ${type.toUpperCase()}${sidechain} skill=${skill} ${txt}`);
      continue;
    }

    for (const part of content) {
      if (part.type === 'thinking') {
        out.push(`L${lineNum} ${type.toUpperCase()} THINKING${sidechain}: ${part.thinking}`);
      } else if (part.type === 'text') {
        out.push(`L${lineNum} ${type.toUpperCase()} TEXT${sidechain} skill=${skill}: ${part.text}`);
      } else if (part.type === 'tool_use') {
        const inputStr = JSON.stringify(part.input || {});
        out.push(`L${lineNum} ${type.toUpperCase()} TOOL_USE${sidechain} skill=${skill} name=${part.name} id=${part.id} input=${inputStr}`);
      } else if (part.type === 'tool_result') {
        const inner = part.content;
        let txt;

        if (typeof inner === 'string') {
          txt = inner;
        } else if (Array.isArray(inner)) {
          txt = inner.map((c) => (typeof c === 'string' ? c : (c.text || JSON.stringify(c)))).join('\n');
        } else {
          txt = JSON.stringify(inner || '');
        }

        const isError = part.is_error ? ' [ERROR]' : '';
        out.push(`L${lineNum} ${type.toUpperCase()} TOOL_RESULT${isError}${sidechain} id=${part.tool_use_id}: ${txt}`);
      } else {
        out.push(`L${lineNum} ${type.toUpperCase()} ${part.type || 'unknown'}${sidechain}: ${JSON.stringify(part).slice(0, 300)}`);
      }
    }

    continue;
  }

  if (type === 'result') {
    const result = obj.result || '';
    const cost = obj.total_cost_usd;
    const turns = obj.num_turns;
    out.push(`L${lineNum} RESULT turns=${turns} cost=$${cost} text=${result}`);
    continue;
  }

  out.push(`L${lineNum} ${type} ${JSON.stringify(obj).slice(0, 300)}`);
}

writeFileSync(outputPath, out.join('\n\n') + '\n');
console.log(`Wrote ${out.length} entries from ${lines.length} lines to ${outputPath}`);
