export const meta = {
  name: 'lz-review-gate',
  description: 'Enhanced code-review gate (Design B): resumable, multi-round advisor-strategy review run as a Workflow of sibling agents -- Sonnet executor packages verbatim excerpts, the real Opus lz-advisor:reviewer classifies + reports coverage, loop per group until no missed surfaces, then synthesize',
  phases: [
    { title: 'Review' },
    { title: 'Synthesize' },
  ],
}

// This is a dynamic Workflow script (run via the Workflow tool, NOT node:test -- agent()/log()/
// pipeline() are injected globals and the runtime has no filesystem/Node API). It lives in the
// repo-level eval/ dev tree and never ships.
//
// The function block between the LZ-REVIEW-GATE-SHARED markers is the SINGLE SOURCE of the review-gate
// control logic, inlined here because workflow scripts cannot load modules at all: BOTH static import
// (rejected as "import call expects one or two arguments" -- the body is parsed as a function, not a
// module) AND dynamic import() (rejected as "import() is not available in workflow scripts") are
// blocked by the runtime (verified empirically 2026-06-16). It is unit-tested DIRECTLY from this file
// by eval/lz-review-gate.workflow.harness.test.mjs, which mirrors the runtime's own execution model
// (de-export meta, wrap the body in an async function, inject MOCK globals) to run the real
// orchestration, and slices this marker-delimited block to exercise the real helper functions. No lib
// copy and no anti-drift proxy are needed -- the test runs the actual source. The markers are the
// slice point for the helper test.

// === LZ-REVIEW-GATE-SHARED-START (canonical source; the workflow is self-contained -- tested via the harness slice) ===

// parseReviewerSentinel(text): extract the reviewer's trailing coverage sentinel.
// Returns { verdict, missed, requests }:
//   verdict: 'CONVERGED' | 'MORE-NEEDED' | 'UNKNOWN' (UNKNOWN when no ROUND-VERDICT line is present)
//   missed:  the MISSED-SURFACES value (trimmed; '' if absent)
//   requests: the NEXT-ROUND-PACKAGING-REQUESTS value (single line, trimmed; '' if absent)
// Lenient by design: reviewer output is free text, so a malformed/absent sentinel yields UNKNOWN
// rather than throwing (the workflow treats UNKNOWN as not-converged, bounded by MAX_ROUNDS).
// All three captures are single-line so they are ORDER-INDEPENDENT: an out-of-order reviewer message
// (requests not last) cannot let the requests capture swallow the MISSED-SURFACES / ROUND-VERDICT
// lines that follow it (dogfood finding I-1).
function parseReviewerSentinel(text) {
  const s = typeof text === 'string' ? text : '';
  const vMatch = s.match(/ROUND-VERDICT:\s*(CONVERGED|MORE-NEEDED)/i);
  const verdict = vMatch ? vMatch[1].toUpperCase() : 'UNKNOWN';
  const mMatch = s.match(/MISSED-SURFACES:[ \t]*([^\n\r]*)/i);
  const missed = mMatch ? mMatch[1].trim() : '';
  const rMatch = s.match(/NEXT-ROUND-PACKAGING-REQUESTS:[ \t]*([^\n\r]*)/i);
  const requests = rMatch ? rMatch[1].trim() : '';
  return { verdict, missed, requests };
}

// missedIsNone(missed): true when the MISSED-SURFACES value means "nothing left" (starts with the
// word "none", tolerating trailing punctuation/notes like "none." or "none -- complete").
function missedIsNone(missed) {
  return /^none\b/i.test(String(missed == null ? '' : missed).trim());
}

// isConverged(parsed): the loop terminator for a group of changes -- keep consulting until NO missed
// surfaces remain. Two layered policies:
//   (C-1, dogfood) A RECOGNIZED verdict line must be present. A parse failure or truncated reviewer
//   output (verdict UNKNOWN -- e.g. maxTurns exhaustion) NEVER converges; it loops (bounded by
//   MAX_ROUNDS) rather than silently false-approving. Convergence requires CONVERGED or MORE-NEEDED.
//   (I-2) Within a recognized verdict, "no missed surfaces" is AUTHORITATIVE: when a MISSED-SURFACES
//   value is present it DECIDES -- converged iff it is "none", even if the verdict disagrees (a
//   CONVERGED verdict alongside a real missed list does NOT converge; MORE-NEEDED with missed=none
//   DOES). The verdict is only the fallback when the reviewer omitted the MISSED-SURFACES line.
function isConverged(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return false;
  }

  if (parsed.verdict !== 'CONVERGED' && parsed.verdict !== 'MORE-NEEDED') {
    return false;
  }

  const missed = typeof parsed.missed === 'string' ? parsed.missed.trim() : '';

  if (missed.length > 0) {
    return missedIsNone(missed);
  }

  return parsed.verdict === 'CONVERGED';
}

// nextRequests(parsed, fallback): what the executor must package next round. Prefer the reviewer's
// explicit NEXT-ROUND-PACKAGING-REQUESTS; else the listed missed surfaces; else the fallback.
function nextRequests(parsed, fallback) {
  const fb = typeof fallback === 'string' && fallback.length > 0 ? fallback : 'Cover any remaining surfaces of this group not yet examined.';

  if (!parsed || typeof parsed !== 'object') {
    return fb;
  }

  if (parsed.requests && parsed.requests.length > 0) {
    return parsed.requests;
  }

  if (parsed.missed && parsed.missed.length > 0 && !missedIsNone(parsed.missed)) {
    return parsed.missed;
  }

  return fb;
}

// groupSlug(name): deterministic filesystem-safe slug for per-group on-disk persistence (Layer-2
// cross-session resume). Lowercase; non-alphanumerics collapse to a single '-'; trimmed of leading/
// trailing '-'. Deterministic so the orchestrator's resume re-scan matches what the synth agent wrote.
function groupSlug(name) {
  return String(name == null ? '' : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// computeRemainingGroups(allGroups, doneSlugs): skip-already-done filter for Layer-2 resume. Groups
// may be strings or { name } objects; doneSlugs is an array or Set of slugs already persisted on disk.
function computeRemainingGroups(allGroups, doneSlugs) {
  const done = doneSlugs instanceof Set ? doneSlugs : new Set(Array.isArray(doneSlugs) ? doneSlugs : []);
  const groups = Array.isArray(allGroups) ? allGroups : [];

  return groups.filter((g) => {
    const name = typeof g === 'string' ? g : (g && g.name);
    return !done.has(groupSlug(name));
  });
}

// hasNullStage(stages): true if any workflow stage returned null/undefined/blank. A quota-killed or
// skipped agent() returns null; a group with any null stage is NOT done and must re-run on resume.
function hasNullStage(stages) {
  const arr = Array.isArray(stages) ? stages : [stages];

  return arr.some((s) => s == null || (typeof s === 'string' && s.trim().length === 0));
}

// dedupeFindingLines(lines): order-preserving exact-duplicate removal (deterministic) for merging
// per-group reports. Dedup key is the trimmed line; blank lines are preserved as-is (not deduped).
function dedupeFindingLines(lines) {
  const arr = Array.isArray(lines) ? lines : [];
  const seen = new Set();
  const out = [];

  for (const line of arr) {
    const key = typeof line === 'string' ? line.trim() : String(line);

    if (key.length === 0) {
      out.push(line);
      continue;
    }

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    out.push(line);
  }

  return out;
}

// === LZ-REVIEW-GATE-SHARED-END ===

// ---------------------------------------------------------------------------
// Workflow-specific prompt builders (not shared with the lib; prose, not control logic).
// ---------------------------------------------------------------------------

function groupName(group) {
  return typeof group === 'string' ? group : (group && group.name);
}

function executorPrompt(group, round, maxRounds, lastRequests, priorCoverage) {
  const name = groupName(group);
  const files = group && Array.isArray(group.files) && group.files.length > 0 ? group.files.join(', ') : name;
  const hint = group && group.hint ? `Group hint: ${group.hint}\n` : '';
  const scope = round === 1
    ? 'ROUND 1 -- AIM FOR CONVERGENCE IN ONE PASS: package COMPREHENSIVELY. Cover every significant finding AND name every notable function / branch / region / concern of this ENTIRE group, each with a verbatim file:line excerpt, so the reviewer can assess FULL coverage immediately. Do NOT hold back a partial "first batch" -- under-packaging just forces extra rounds.'
    : `Address the reviewer's specific missed-surface requests below and add depth; do NOT re-package already-covered surfaces. PRIOR ROUNDS already covered:\n${priorCoverage}\n`;
  return `You are the EXECUTOR stage (Sonnet) of the lz-advisor advisor-strategy code review, round ${round} of up to ${maxRounds}, for the GROUP OF CHANGES: ${name}.
Files in this group: ${files}.
${hint}Follow plugins/lz-advisor/skills/lz-review/SKILL.md scan/curate/package protocol, but STOP before the advisor-consultation phase -- the workflow runs the Opus reviewer as the NEXT stage (do not spawn a reviewer yourself).
For EACH finding include a COMPLETE verbatim code excerpt with file:line -- the reviewer has maxTurns 3 and will NOT re-read the files; it can only judge what you package.
${scope}REVIEWER REQUESTS TO ADDRESS THIS ROUND:
${lastRequests}
Write NO files. Return the packaged findings + verbatim excerpts as plain text.`;
}

function reviewerPrompt(group, round, packaged) {
  const name = groupName(group);
  return `You are the lz-advisor reviewer (Opus advisor stage), round ${round}, reviewing the GROUP OF CHANGES: ${name}.
TURN BUDGET is tiny (maxTurns 3): do NOT use Read or Glob. Everything you can judge is packaged below; emit your analysis as your FINAL message (do not end on a tool call -- if you spend turns reading you will be cut off before answering).
Packaged findings (with verbatim excerpts), round ${round}:
----
${packaged}
----
Validate or refute each packaged finding, add anything the executor missed that is judgable from the excerpts, and classify every finding as Critical / Important / Suggestion with a one-line rationale, grouped under the standard ### Critical / ### Important / ### Suggestions / ### Questions sections (the downstream severity-drop check parses these sections, so keep them well-formed).
Then assess COVERAGE OF THE GROUP: list any function, branch, region, or concern of this group that has NOT yet been packaged for you across all rounds so far (a "missed surface").
END your message with EXACTLY:
MISSED-SURFACES: none
ROUND-VERDICT: CONVERGED
   -- OR --
MISSED-SURFACES: <comma-separated specific surfaces still unexamined>
ROUND-VERDICT: MORE-NEEDED
NEXT-ROUND-PACKAGING-REQUESTS: <comma-separated specific functions/regions/excerpts the executor must package next round>`;
}

function synthPrompt(group, roundLogs, converged, progressDir) {
  const name = groupName(group);
  const slug = groupSlug(name);
  const allReviewed = roundLogs.map((r) => `=== ROUND ${r.round} (verdict=${r.verdict}) ===\n${r.reviewed}`).join('\n\n');
  const coverage = converged ? 'COMPLETE' : 'INCOMPLETE';
  return `You are the SYNTHESIS stage (Opus, high effort) of the advisor-strategy review for the GROUP: ${name}.
Consolidate the MULTI-ROUND reviewer analyses below into ONE report. Coverage for this group is ${coverage}.
FIDELITY CONTRACT (the reviewer's classification is AUTHORITATIVE -- you consolidate, you do NOT re-judge):
- Emit ALL FOUR severity sections in this fixed order, each as a "### " header: ### Critical, then ### Important, then ### Suggestions, then ### Questions. For any section with no findings, write the header followed by a single line: (none). Never omit a section.
- Place each finding under the SEVERITY THE REVIEWER ASSIGNED it (the ### section the reviewer listed it under). Never re-classify, re-bucket, downgrade, upgrade, or DROP a finding -- a Critical stays Critical, an Important stays Important. Preserve each finding's wording.
- Dedup ONLY findings that are verbatim-identical recurrences of the SAME finding across rounds; keep the union of all distinct findings. Never merge two findings that reference different file:line locations.
- After the four sections add a "### Cross-Cutting Patterns" section: copy the reviewer's own cross-cutting / systemic-pattern text through VERBATIM (concatenate across rounds, dedup identical lines); do NOT invent fresh patterns. If the reviewer named none, write: (none).
Multi-round reviewer output:
----
${allReviewed}
----
RESUMABILITY (REQUIRED): write the consolidated report to the file ${progressDir}/${slug}.md (create the ${progressDir} directory first if needed). This on-disk per-group report is the Layer-2 cross-session resume record -- the orchestrator re-scans ${progressDir} to skip already-reviewed groups after a 5-hour/weekly usage-limit interruption. Write strictly ASCII.
Also return the consolidated report as your plain-text message. End with: COVERAGE: ${coverage}.`;
}

// ---------------------------------------------------------------------------
// Orchestration: per-group multi-round executor<->reviewer loop, fanned out over remaining groups.
// args = { groups: [{name, files?, hint?}], doneSlugs?: [...], maxRounds?: 4, progressDir?: string }
//
// Layer-2 resume contract (dogfood C-3 / I-6 / Q-1): this workflow has NO filesystem access, so it
// can neither self-scan `progressDir` nor verify that the synth agent actually wrote a group's report.
// The ORCHESTRATOR owns that: on resume it MUST scan `progressDir` for the per-group `<slug>.md` files
// the synth wrote and pass their slugs as `doneSlugs`. Deriving doneSlugs from the ACTUAL on-disk
// files (not from a prior in-memory `completed` list) is also what verifies persistence -- a group
// whose synth silently skipped the write is simply absent from disk, so it is NOT in doneSlugs and is
// re-reviewed. `doneSlugs` here is caller-supplied only.
// ---------------------------------------------------------------------------

const A = typeof args === 'object' && args ? args : {};
const GROUPS = Array.isArray(A.groups) ? A.groups : [];
const DONE = Array.isArray(A.doneSlugs) ? A.doneSlugs : [];
const MAX_ROUNDS = typeof A.maxRounds === 'number' && A.maxRounds > 0 ? Math.min(Math.floor(A.maxRounds), 8) : 4;
const PROGRESS_DIR = typeof A.progressDir === 'string' && A.progressDir.length > 0 ? A.progressDir : 'eval/.cache/review-gate';

if (GROUPS.length === 0) {
  log('No groups passed (args.groups is empty) -- nothing to review.');
  return { groups: 0, remaining: 0, completed: [], reports: [] };
}

const remaining = computeRemainingGroups(GROUPS, DONE);
log(`Review gate: ${remaining.length}/${GROUPS.length} groups remaining (Layer-2 skip-already-done); progressDir=${PROGRESS_DIR}; maxRounds=${MAX_ROUNDS}`);

const results = await pipeline(
  remaining,
  async (group) => {
    const name = groupName(group);

    // I-1: an agent() that THROWS (vs returns null) drops THIS group to null + logs, instead of
    // relying solely on pipeline()'s implicit throw->null. A dropped group stays NOT done for resume.
    try {
      let lastRequests = 'INITIAL ROUND.';
      let priorCoverage = '';
      const roundLogs = [];
      let converged = false;

      for (let round = 1; round <= MAX_ROUNDS && !converged; round++) {
        const packaged = await agent(
          executorPrompt(group, round, MAX_ROUNDS, lastRequests, priorCoverage),
          { model: 'sonnet', effort: 'medium', phase: 'Review', label: `exec ${name} r${round}` },
        );

        // I-2: do not spend an Opus reviewer call on a null/blank executor output -- bail first.
        if (hasNullStage([packaged])) {
          log(`Group ${name}: null executor output at round ${round} (quota/abort) -- NOT done`);
          return null;
        }

        const reviewed = await agent(
          reviewerPrompt(group, round, packaged),
          { agentType: 'lz-advisor:reviewer', effort: 'high', phase: 'Review', label: `review ${name} r${round}` },
        );

        if (hasNullStage([reviewed])) {
          log(`Group ${name}: null reviewer output at round ${round} (quota/abort) -- NOT done`);
          return null;
        }

        const parsed = parseReviewerSentinel(reviewed);
        roundLogs.push({ round, verdict: parsed.verdict, missed: parsed.missed, reviewed });

        if (isConverged(parsed)) {
          converged = true;
        } else {
          lastRequests = nextRequests(parsed, 'Cover any remaining surfaces of this group not yet examined.');
          // I-5: keep the EARLIEST (broadest, round-1) coverage notes -- truncate the TAIL with a
          // marker rather than dropping round 1 (the old `.slice(-2000)` dropped the most valuable end).
          const note = `${priorCoverage}\nRound ${round} covered: ${String(packaged).slice(0, 250)}`;
          priorCoverage = note.length > 2000 ? `${note.slice(0, 2000)}\n[...prior-coverage truncated...]` : note;
        }
      }

      // I-8: surface MAX_ROUNDS exhaustion explicitly so operators can see which group burned budget.
      if (!converged) {
        log(`Group ${name}: exhausted MAX_ROUNDS=${MAX_ROUNDS} without convergence (coverage INCOMPLETE)`);
      }

      const synth = await agent(
        synthPrompt(group, roundLogs, converged, PROGRESS_DIR),
        { model: 'opus', effort: 'high', phase: 'Synthesize', label: `synth ${name}` },
      );

      if (hasNullStage([synth])) {
        log(`Group ${name}: null synth (quota/abort) -- leaving group NOT done for resume`);
        return null;
      }

      // Expose roundLogs (raw per-round reviewer outputs) so the ORCHESTRATOR can run the deterministic
      // severity-drop diff post-run (eval/lz-review-gate-check.mjs) -- the workflow is filesystem-blind
      // and the harness is prompt-text-only, so this return value is how the diff sees the reviewer's
      // high-severity findings to compare against the generative synth report (2026-06-17 consensus).
      return { group: name, slug: groupSlug(name), converged, rounds: roundLogs.length, report: synth, roundLogs };
    } catch (e) {
      log(`Group ${name}: error -- ${String((e && e.message) || e)}; leaving group NOT done for resume`);
      return null;
    }
  },
);

const done = results.filter(Boolean);
log(`Review gate done: ${done.length}/${remaining.length} groups completed this run (${done.filter((r) => r.converged).length} converged)`);

// Deterministic cross-group consolidation: concatenate the per-group reports under a group heading.
// Dedup is applied WITHIN each group's report ONLY -- never across groups (dogfood C-2): a global
// dedup would drop a later group's severity headers (### Critical etc.) because an earlier group
// already emitted them, collapsing/misattributing the later group's findings.
const mergedLines = done.flatMap((r) => [
  `## ${r.group} (coverage ${r.converged ? 'COMPLETE' : 'INCOMPLETE'}, ${r.rounds} round(s))`,
  ...dedupeFindingLines(String(r.report).split(/\r?\n/)),
  '',
]);

return {
  groups: GROUPS.length,
  remaining: remaining.length,
  completed: done.map((r) => ({ group: r.group, slug: r.slug, converged: r.converged, rounds: r.rounds })),
  reports: done,
  mergedReport: mergedLines.join('\n'),
};
