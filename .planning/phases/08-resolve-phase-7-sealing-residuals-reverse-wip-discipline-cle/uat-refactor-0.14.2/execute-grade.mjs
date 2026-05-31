import { readFileSync } from 'node:fs';

const path = process.argv[2];
const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);

const toolUses = {};
const cmds = [];
const agentCalls = [];
let result = null;

for (const line of lines) {
  let ev;
  try { ev = JSON.parse(line); } catch { continue; }

  if (ev.type === 'result') { result = ev; }

  const msg = ev.message;
  if (msg && Array.isArray(msg.content)) {
    for (const block of msg.content) {
      if (block.type !== 'tool_use') { continue; }

      const name = block.name || '(unknown)';
      toolUses[name] = (toolUses[name] || 0) + 1;
      const input = block.input || {};

      if (name === 'Bash' || name === 'PowerShell') {
        cmds.push((input.command || '').replace(/\s+/g, ' ').slice(0, 160));
      }

      if (name === 'Agent' || name === 'Task') {
        const prompt = String(input.prompt || input.message || '');
        agentCalls.push({
          len: prompt.length,
          relevantFileContents: /Relevant File Contents/i.test(prompt),
          hasDiff: /diff --git|git show|```[a-z]*\n|@@ /.test(prompt),
          isAdvisor: /advisor/i.test(JSON.stringify(input)),
        });
      }
    }
  }
}

console.log('=== TOOL USE COUNTS ===');
for (const [k, v] of Object.entries(toolUses).sort((a, b) => b[1] - a[1])) {
  console.log('  ' + String(v).padStart(3) + '  ' + k);
}

console.log('\n=== SHELL COMMANDS (' + cmds.length + ') ===');
for (const c of cmds) { console.log('  $ ' + c); }

console.log('\n=== VERIFY-TARGET SIGNALS ===');
const hasBuildSb = cmds.some((c) => /build-storybook/.test(c));
const hasNxStorybook = cmds.some((c) => /nx (run \S+:)?storybook(\b|$)/.test(c) && !/build-storybook/.test(c));
const ranNxTestForVerify = cmds.some((c) => /\bnx (run \S+:)?test\b|\bjest\b/.test(c));
console.log('  ran build-storybook : ' + hasBuildSb);
console.log('  ran nx storybook    : ' + hasNxStorybook);
console.log('  ran nx test / jest  : ' + ranNxTestForVerify + '  (should be false as the config-surface verifier)');

console.log('\n=== ADVISOR CONSULTS (' + agentCalls.length + ') ===');
agentCalls.forEach((a, i) => {
  console.log('  call ' + (i + 1) + ': advisor=' + a.isAdvisor + ' promptLen=' + a.len
    + ' RelevantFileContents=' + a.relevantFileContents + ' hasDiffOrFenced=' + a.hasDiff);
});

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
