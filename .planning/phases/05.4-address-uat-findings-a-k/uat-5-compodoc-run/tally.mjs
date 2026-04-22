import fs from 'node:fs';
import path from 'node:path';

const base = 'D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/.planning/phases/05.4-address-uat-findings-a-k/uat-5-compodoc-run/traces';
const sessions = [1, 2, 3, 4, 5, 6];
const rows = [];
let totalAdvisor = 0;
let totalTools = 0;
let firstTrySuccess = 0;

for (const n of sessions) {
  const f = path.join(base, `session-${n}.jsonl`);

  if (!fs.existsSync(f)) {
    console.log(`missing: ${f}`);
    continue;
  }

  const lines = fs.readFileSync(f, 'utf8').trim().split('\n');
  let advisor = 0;
  let tools = 0;
  const toolBreakdown = {};
  const texts = [];
  let finalCost = 0;
  let turns = 0;
  let duration = 0;
  let isError = false;

  for (const l of lines) {
    try {
      const o = JSON.parse(l);

      if (o.type === 'assistant' && o.message?.content) {
        for (const c of o.message.content) {
          if (c.type === 'tool_use') {
            tools++;
            toolBreakdown[c.name] = (toolBreakdown[c.name] || 0) + 1;

            if (c.name === 'Agent' || c.name === 'Task') {
              advisor++;
            }
          }

          if (c.type === 'text') {
            texts.push(c.text);
          }
        }
      }

      if (o.type === 'result') {
        finalCost = o.total_cost_usd || 0;
        turns = o.num_turns || 0;
        duration = o.duration_ms || 0;
        isError = !!o.is_error;
      }
    } catch (e) {
      // skip
    }
  }

  const text = texts.join('\n');
  const sdBlock = /--- Strategic Direction ---/.test(text);
  const critical = /\*\*Critical:\*\*/.test(text);
  const assuming = /Assuming [^\n]*\(unverified\)/.test(text);
  const findingsHdr = /### Findings/.test(text);
  const ccpHdr = /### Cross-Cutting Patterns/.test(text);
  const tpHdr = /### Threat Patterns/.test(text);

  totalAdvisor += advisor;
  totalTools += tools;

  if (advisor === 1) {
    firstTrySuccess++;
  }

  rows.push({
    session: n,
    turns,
    durSec: Math.round(duration / 1000),
    cost: finalCost,
    advisor,
    tools,
    toolBreakdown,
    sdBlock,
    critical,
    assuming,
    findingsHdr,
    ccpHdr,
    tpHdr,
    isError,
  });
}

console.log('Session\tTurns\tSec\tCost\tAdv\tTools\tSD\tCrit\tAssum\tFind\tCCP\tTP\tErr');

for (const r of rows) {
  const row = [
    r.session,
    r.turns,
    r.durSec,
    '$' + r.cost.toFixed(4),
    r.advisor,
    r.tools,
    r.sdBlock ? 'Y' : '-',
    r.critical ? 'Y' : '-',
    r.assuming ? 'Y' : '-',
    r.findingsHdr ? 'Y' : '-',
    r.ccpHdr ? 'Y' : '-',
    r.tpHdr ? 'Y' : '-',
    r.isError ? 'ERR' : 'ok',
  ];
  console.log(row.join('\t'));
}

console.log('---');
console.log('total advisor consultations:', totalAdvisor);
console.log('total tool uses (parent-side):', totalTools);
console.log(
  'avg tools per consultation (parent-side):',
  totalAdvisor > 0 ? (totalTools / totalAdvisor).toFixed(1) : 'N/A',
);
console.log(
  'first-try-success sessions (advisor called exactly once):',
  firstTrySuccess,
  '/',
  rows.length,
  '=',
  Math.round((100 * firstTrySuccess) / rows.length) + '%',
);
console.log(
  'total cost: $' +
    rows.reduce((s, r) => s + r.cost, 0).toFixed(4),
);
console.log(
  'total duration:',
  rows.reduce((s, r) => s + r.durSec, 0),
  's =',
  Math.round(rows.reduce((s, r) => s + r.durSec, 0) / 60),
  'min',
);
console.log('---tool breakdown per session---');

for (const r of rows) {
  console.log(`S${r.session}:`, JSON.stringify(r.toolBreakdown));
}
