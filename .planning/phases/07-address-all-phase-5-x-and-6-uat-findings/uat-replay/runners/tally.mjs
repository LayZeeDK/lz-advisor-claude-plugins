import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

// Phase 7 verify-chain-integrity tally.
// Extends Phase 6 tally.mjs (uat-pattern-d-replay/tally.mjs) with two new columns:
//   - verified_trailer_count: count of `Verified:` trailers in commit messages
//     emitted via tool_use Bash commands during the session (FIND-E.1/E.2 closure)
//   - wip_commit_count: count of `wip:` prefixed commit subjects emitted via
//     tool_use Bash commands during the session (FIND-E.2 cost-cliff allowance)
// Per CONTEXT.md D-01 + 07-VALIDATION.md Wave 0 lines 67-68.

const base =
  'D:/projects/github/LayZeeDK/lz-advisor-claude-plugins/.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/traces';
const sessions = [1, 2, 3, 4, 5, 6];
const rows = [];
let totalAdvisor = 0;
let totalTools = 0;
let firstTrySuccess = 0;

function countVerifiedTrailers(jsonlPath) {
  // Parse the JSONL stream for tool_use events of `git commit -m "<message>"`.
  // Count occurrences of `^Verified:` in the message text.
  if (!existsSync(jsonlPath)) {
    return 0;
  }

  let count = 0;
  const lines = readFileSync(jsonlPath, 'utf8').split('\n').filter(Boolean);

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);

      if (obj?.message?.content) {
        for (const part of obj.message.content) {
          if (
            part?.type === 'tool_use' &&
            part?.name === 'Bash' &&
            typeof part?.input?.command === 'string'
          ) {
            const cmd = part.input.command;

            if (/^git commit\b.*-m\s/.test(cmd)) {
              const trailerMatches = cmd.match(/^Verified:/gm);

              if (trailerMatches) {
                count += trailerMatches.length;
              }
            }
          }
        }
      }
    } catch {
      // Skip malformed JSON lines
    }
  }

  return count;
}

function countWipCommits(jsonlPath) {
  // Parse the JSONL stream for tool_use events of `git commit -m "wip: ..."`.
  if (!existsSync(jsonlPath)) {
    return 0;
  }

  let count = 0;
  const lines = readFileSync(jsonlPath, 'utf8').split('\n').filter(Boolean);

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);

      if (obj?.message?.content) {
        for (const part of obj.message.content) {
          if (
            part?.type === 'tool_use' &&
            part?.name === 'Bash' &&
            typeof part?.input?.command === 'string'
          ) {
            const cmd = part.input.command;
            // git commit -m "wip: ..." (case-insensitive prefix on subject)

            if (/^git commit\b.*-m\s+["'`]wip:/i.test(cmd)) {
              count += 1;
            }
          }
        }
      }
    } catch {
      // Skip malformed JSON lines
    }
  }

  return count;
}

for (const n of sessions) {
  const f = path.join(base, `session-${n}.jsonl`);

  if (!existsSync(f)) {
    console.log(`missing: ${f}`);
    continue;
  }

  const lines = readFileSync(f, 'utf8').trim().split('\n');
  let advisor = 0;
  let tools = 0;
  let webUses = 0;
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

            if (c.name === 'WebFetch' || c.name === 'WebSearch') {
              webUses++;
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
    } catch {
      // skip malformed lines
    }
  }

  const text = texts.join('\n');
  const sdBlock = /--- Strategic Direction ---/.test(text);
  const critical = /\*\*Critical:\*\*/.test(text);
  const assuming = /Assuming [^\n]*\(unverified\)/.test(text);
  const findingsHdr = /### Findings/.test(text);
  const ccpHdr = /### Cross-Cutting Patterns/.test(text);
  const tpHdr = /### Threat Patterns/.test(text);

  // Phase 7 NEW columns: verify-before-commit signal counts
  const verified_trailer_count = countVerifiedTrailers(f);
  const wip_commit_count = countWipCommits(f);

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
    webUses,
    tools,
    toolBreakdown,
    sdBlock,
    critical,
    assuming,
    findingsHdr,
    ccpHdr,
    tpHdr,
    verified_trailer_count,
    wip_commit_count,
    isError,
  });
}

// Column header includes Phase 7 NEW columns at the end (preserves Phase 6 column order)
console.log(
  'Session\tTurns\tSec\tCost\tAdv\tWeb\tTools\tSD\tCrit\tAssum\tFind\tCCP\tTP\tVerifTrail\tWipCommit\tErr',
);

for (const r of rows) {
  const row = [
    r.session,
    r.turns,
    r.durSec,
    '$' + r.cost.toFixed(4),
    r.advisor,
    r.webUses,
    r.tools,
    r.sdBlock ? 'Y' : '-',
    r.critical ? 'Y' : '-',
    r.assuming ? 'Y' : '-',
    r.findingsHdr ? 'Y' : '-',
    r.ccpHdr ? 'Y' : '-',
    r.tpHdr ? 'Y' : '-',
    r.verified_trailer_count,
    r.wip_commit_count,
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
  rows.length > 0 ? Math.round((100 * firstTrySuccess) / rows.length) + '%' : 'N/A',
);
console.log(
  'total cost: $' + rows.reduce((s, r) => s + r.cost, 0).toFixed(4),
);
console.log(
  'total duration:',
  rows.reduce((s, r) => s + r.durSec, 0),
  's =',
  Math.round(rows.reduce((s, r) => s + r.durSec, 0) / 60),
  'min',
);

// Phase 7 NEW aggregate metrics
const totalVerifiedTrailers = rows.reduce((s, r) => s + r.verified_trailer_count, 0);
const totalWipCommits = rows.reduce((s, r) => s + r.wip_commit_count, 0);
console.log(
  'total Verified: trailers (FIND-E.1/E.2 path b signal):',
  totalVerifiedTrailers,
);
console.log(
  'total wip: commits (FIND-E.2 cost-cliff allowance signal):',
  totalWipCommits,
);

console.log('---tool breakdown per session---');

for (const r of rows) {
  console.log(`S${r.session}:`, JSON.stringify(r.toolBreakdown));
}
