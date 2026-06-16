// lz-review-gate-lib.mjs
//
// Pure control logic for the lz-advisor ENHANCED CODE-REVIEW GATE (Design B): a resumable,
// multi-round advisor-strategy review run as a dynamic Workflow of sibling agents -- a Sonnet
// executor that packages verbatim code excerpts and a real Opus `lz-advisor:reviewer` agent that
// classifies and reports coverage. This module holds ONLY the deterministic, side-effect-free
// control logic the workflow depends on, so it can be unit-tested with node:test (the workflow
// script itself cannot be node-tested: agent()/phase()/log() are injected globals, and the runtime
// has no filesystem/Node API access).
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER
// in the distributed plugin tree, and never ships. It is zero-dependency (node stdlib only) and
// imports NOTHING from the plugin tree -- it is pure control logic. NEVER add an eval/ import to any
// plugin-tree file.
//
// ANTI-DRIFT CONTRACT: the function block between the LZ-REVIEW-GATE-SHARED markers below is the
// CANONICAL source. The workflow script (eval/lz-review-gate.workflow.mjs) INLINES a byte-for-byte
// copy of that exact block (it cannot import this module at workflow runtime). lz-review-gate.workflow.test.mjs
// extracts the marker-delimited block from BOTH files and asserts they are identical, so the inlined
// copy can never silently drift from the tested canonical source. Keep the block strictly ASCII and
// dependency-free so the inlined copy is valid inside the sandboxed workflow runtime.

// === LZ-REVIEW-GATE-SHARED-START (canonical; byte-for-byte inlined into the workflow script) ===

// parseReviewerSentinel(text): extract the reviewer's trailing coverage sentinel.
// Returns { verdict, missed, requests }:
//   verdict: 'CONVERGED' | 'MORE-NEEDED' | 'UNKNOWN' (UNKNOWN when no ROUND-VERDICT line is present)
//   missed:  the MISSED-SURFACES value (trimmed; '' if absent)
//   requests: the NEXT-ROUND-PACKAGING-REQUESTS value to end-of-text (trimmed; '' if absent)
// Lenient by design: reviewer output is free text, so a malformed/absent sentinel yields UNKNOWN
// rather than throwing (the workflow treats UNKNOWN as not-converged, bounded by MAX_ROUNDS).
function parseReviewerSentinel(text) {
  const s = typeof text === 'string' ? text : '';
  const vMatch = s.match(/ROUND-VERDICT:\s*(CONVERGED|MORE-NEEDED)/i);
  const verdict = vMatch ? vMatch[1].toUpperCase() : 'UNKNOWN';
  const mMatch = s.match(/MISSED-SURFACES:\s*([^\n\r]*)/i);
  const missed = mMatch ? mMatch[1].trim() : '';
  const rMatch = s.match(/NEXT-ROUND-PACKAGING-REQUESTS:\s*([\s\S]*)$/i);
  const requests = rMatch ? rMatch[1].trim() : '';
  return { verdict, missed, requests };
}

// missedIsNone(missed): true when the MISSED-SURFACES value means "nothing left" (starts with the
// word "none", tolerating trailing punctuation/notes like "none." or "none -- complete").
function missedIsNone(missed) {
  return /^none\b/i.test(String(missed == null ? '' : missed).trim());
}

// isConverged(parsed): the loop terminator for a group of changes -- keep consulting until NO missed
// surfaces remain. Converged iff the reviewer declared CONVERGED OR the MISSED-SURFACES value is
// "none". "No missed surfaces" wins even if the verdict line is mislabeled/missing (faithful to the
// requirement); UNKNOWN with a non-none missed value is NOT converged.
function isConverged(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return false;
  }

  if (parsed.verdict === 'CONVERGED') {
    return true;
  }

  return missedIsNone(parsed.missed);
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

export {
  parseReviewerSentinel,
  missedIsNone,
  isConverged,
  nextRequests,
  groupSlug,
  computeRemainingGroups,
  hasNullStage,
  dedupeFindingLines,
};
