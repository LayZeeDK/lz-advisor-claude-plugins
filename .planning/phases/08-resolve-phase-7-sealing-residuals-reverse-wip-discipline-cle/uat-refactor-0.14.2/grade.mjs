import { readFileSync } from 'node:fs';

const path = process.argv[2];
const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);

const toolUses = {};
let skillActivation = null;
let advisorCalled = false;
let result = null;
const readPaths = [];
const webQueries = [];

for (const line of lines) {
  let ev;
  try { ev = JSON.parse(line); } catch { continue; }

  if (ev.type === 'result') { result = ev; }

  const msg = ev.message;
  if (msg && Array.isArray(msg.content)) {
    for (const block of msg.content) {
      if (block.type === 'tool_use') {
        const name = block.name || '(unknown)';
        toolUses[name] = (toolUses[name] || 0) + 1;

        if (name === 'Read' && block.input && block.input.file_path) {
          readPaths.push(block.input.file_path);
        }
        if ((name === 'WebSearch' || name === 'WebFetch')) {
          webQueries.push(name + ': ' + JSON.stringify(block.input).slice(0, 120));
        }
        if (name === 'Agent' || name === 'Task') {
          const t = block.input && (block.input.subagent_type || block.input.subagentType || '');
          if (/advisor/i.test(JSON.stringify(block.input || {}))) { advisorCalled = true; }
        }
        if (name === 'Skill' && block.input && block.input.skill) {
          skillActivation = block.input.skill;
        }
      }
    }
  }
}

console.log('=== TOOL USE COUNTS (parent session) ===');
for (const [k, v] of Object.entries(toolUses).sort((a, b) => b[1] - a[1])) {
  console.log('  ' + String(v).padStart(3) + '  ' + k);
}
console.log('\n=== SKILL ACTIVATION (Skill tool) ===');
console.log('  ' + (skillActivation || '(not via Skill tool - slash command auto-trigger)'));
console.log('\n=== ADVISOR CONSULT (Agent->advisor) ===');
console.log('  advisorCalled = ' + advisorCalled);
console.log('\n=== ORIENTATION READS (' + readPaths.length + ') ===');
for (const p of readPaths.slice(0, 30)) { console.log('  ' + p); }
console.log('\n=== WEB-FIRST (organic Class 2/3/4) ===');
if (webQueries.length === 0) { console.log('  (none)'); }
for (const q of webQueries) { console.log('  ' + q); }
console.log('\n=== RESULT ===');
if (result) {
  console.log('  subtype       : ' + result.subtype);
  console.log('  is_error      : ' + result.is_error);
  console.log('  num_turns     : ' + result.num_turns);
  console.log('  duration_ms   : ' + result.duration_ms);
  console.log('  total_cost_usd: ' + result.total_cost_usd);
} else {
  console.log('  (no result event found)');
}
