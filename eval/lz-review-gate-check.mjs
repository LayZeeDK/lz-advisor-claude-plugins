// lz-review-gate-check.mjs
//
// ORCHESTRATOR-SIDE deterministic safeguards for the lz-review-gate workflow (Design-B), resolved by
// the 2026-06-17 cross-family consensus (Opus Agent + GPT-5.5 + gemini-3.1-pro-preview, 2 rounds) and
// hardened by the 2026-06-17 dogfood self-review:
//
//  - severityDropDiff(): the high-severity "diff" guard. The workflow's synth stage is GENERATIVE
//    (now Opus-high); under the agreed prompt fidelity-contract it should preserve every reviewer
//    finding, but it CAN still drop/soften a Critical/Important one, and the workflow harness is
//    prompt-text-only so it cannot witness live synth behavior. This is the ONLY runtime detector: it
//    compares the reviewer's high-severity findings (from the workflow's exposed `roundLogs`) against
//    the synthesized report and flags any that are absent, so the orchestrator can re-run synth-only.
//
//  - assertManifestCoverage(): the grouping guard. A bug whose cause spans two caller-supplied groups
//    is seen by NO single per-group reviewer; this asserts each known data-flow coupling chain is
//    co-located in ONE group BEFORE dispatch.
//
// These are ORCHESTRATOR-side (the workflow is filesystem-blind and its groups are caller-supplied),
// so they live in this importable, unit-tested module -- NOT inside the workflow script.
//
// EXTRACTION (dogfood fix 2026-06-17): the real lz-advisor:reviewer agent emits its native severity
// grammar -- "### Critical" / "### Important" / "### Suggestions" / "### Questions" sections with
// finding blocks -- NOT inline tags (its system prompt governs the format). So we parse those SECTIONS
// from both the reviewer roundLogs and the synth report. Non-finding sections (Cross-Cutting Patterns,
// Per-finding validation, Missed surfaces, ...) are ignored. "(none)" sections contribute no findings.
//
// HEURISTIC NOTES (booked honestly per the consensus + dogfood): finding-presence is token-overlap
// based and biased toward SENSITIVITY -- a false "dropped" only triggers a cheap synth-only re-run,
// whereas a missed drop is the real risk. Findings with NO distinctive tokens fall back to raw
// normalized-substring presence (fail toward detection). KNOWN ACCEPTED GAPS: (a) a Critical reworded
// enough that its distinctive tokens fall below the threshold can evade detection; (b) `synthTokens`
// is one flat bag for the whole report, so a finding can read as "present" via tokens scattered across
// unrelated sections, and a negating mention ("not related to X") counts as present -- both bias toward
// NOT flagging (the documented sensitivity limit). These are accepted, not engineered away.

const HIGH = new Set(['CRITICAL', 'IMPORTANT']);

// normalizeText: lowercase, non-alphanumerics -> single spaces, trimmed. Deterministic. (The single
// `[^a-z0-9]+` replace already collapses runs to one space, so no second whitespace-collapse is needed
// -- dogfood Suggestion.)
export function normalizeText(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// distinctiveTokens: the alphanumeric tokens of length >= 5 (skips common short/function words),
// deduped. These are the fingerprint used to decide whether a finding survived into the synth report.
export function distinctiveTokens(s) {
  const out = new Set();

  for (const t of normalizeText(s).split(' ')) {
    if (t.length >= 5) {
      out.add(t);
    }
  }

  return out;
}

// headerSeverity(headingText): map a "### <heading>" to a finding severity, or null for non-finding
// sections (Cross-Cutting Patterns, Per-finding validation, Missed surfaces, ...).
function headerSeverity(headingText) {
  const key = String(headingText).toLowerCase().replace(/[^a-z]/g, '');

  if (key.startsWith('critical')) {
    return 'CRITICAL';
  }

  if (key.startsWith('important')) {
    return 'IMPORTANT';
  }

  if (key.startsWith('suggestion')) {
    return 'SUGGESTION';
  }

  if (key.startsWith('question')) {
    return 'QUESTION';
  }

  return null;
}

// extractSectionFindings(text): parse the reviewer/synth "### <severity>" sections into finding blocks.
// Returns [{ severity, text }] in document order. Within a finding section, blank lines separate
// finding blocks; a "(none)" block contributes nothing. Non-finding sections are skipped.
export function extractSectionFindings(text) {
  const lines = String(text == null ? '' : text).split(/\r?\n/);
  const findings = [];
  let current = null;
  let buf = [];

  const flush = () => {
    const block = buf.join('\n').trim();
    buf = [];

    if (current && block.length > 0 && !/^\(none\)\.?$/i.test(block)) {
      findings.push({ severity: current, text: block });
    }
  };

  for (const line of lines) {
    const header = line.match(/^#{2,4}\s+(.+?)\s*$/);

    if (header) {
      flush();
      current = headerSeverity(header[1]);
      continue;
    }

    // The trailing coverage sentinel terminates the findings region: a MISSED-SURFACES / ROUND-VERDICT /
    // NEXT-ROUND-PACKAGING-REQUESTS line (at line start) flushes the current block and stops capture, so
    // it is never mis-counted as a finding even when it directly follows a finding section.
    if (/^\s*(MISSED-SURFACES|ROUND-VERDICT|NEXT-ROUND-PACKAGING-REQUESTS)\s*:/i.test(line)) {
      flush();
      current = null;
      continue;
    }

    if (current === null) {
      continue;
    }

    if (line.trim() === '') {
      flush();
      continue;
    }

    buf.push(line);
  }

  flush();

  return findings;
}

// findingPresent(findingText, synthNorm, synthTokens, threshold): is this reviewer finding represented
// in the synth report? With distinctive tokens: at least `threshold` fraction must appear in the synth
// token set. With NO distinctive tokens (short-worded finding): fall back to raw normalized-substring
// presence -- so an all-short-word Critical that was dropped is still flagged (fail toward detection,
// dogfood Critical fix). An empty finding is treated as present (nothing to check).
export function findingPresent(findingText, synthNorm, synthTokens, threshold = 0.6) {
  const toks = [...distinctiveTokens(findingText)];

  if (toks.length === 0) {
    const norm = normalizeText(findingText);

    return norm.length === 0 ? true : String(synthNorm).includes(norm);
  }

  const hit = toks.filter((t) => synthTokens.has(t)).length;

  return hit / toks.length >= threshold;
}

// severityDropDiff(roundLogs, synthReport, threshold): the consensus "diff" guard.
//   roundLogs   = the workflow's exposed per-round reviewer outputs ([{ reviewed }, ...]).
//   synthReport = the synth stage's consolidated report text for the group.
// High-severity reviewer findings (### Critical / ### Important) are deduped across rounds by their
// signature (distinctive-token set; or, for a zero-distinctive-token finding, its raw normalized text
// so two distinct short findings do NOT collide -- dogfood Critical fix), then each is checked for
// presence in the synth report.
// Returns { reviewerHighCount, droppedCount, dropped: [{severity, text}], dropDetected }.
// dropDetected === true means the orchestrator should re-run synth-only for this group.
export function severityDropDiff(roundLogs, synthReport, threshold = 0.6) {
  const logs = Array.isArray(roundLogs) ? roundLogs : [];
  const synthNorm = normalizeText(synthReport);
  const synthTokens = distinctiveTokens(synthReport);
  const seen = new Set();
  const highFindings = [];

  for (const r of logs) {
    const text = r && typeof r.reviewed === 'string' ? r.reviewed : '';

    for (const f of extractSectionFindings(text)) {
      if (!HIGH.has(f.severity)) {
        continue;
      }

      const dt = [...distinctiveTokens(f.text)].sort();
      const sig = dt.length > 0 ? dt.join(' ') : `raw:${normalizeText(f.text)}`;

      if (seen.has(sig)) {
        continue;
      }

      seen.add(sig);
      highFindings.push(f);
    }
  }

  const dropped = highFindings.filter((f) => !findingPresent(f.text, synthNorm, synthTokens, threshold));

  return {
    reviewerHighCount: highFindings.length,
    droppedCount: dropped.length,
    dropped,
    dropDetected: dropped.length > 0,
  };
}

// normPath: normalize a file path for set comparison (Windows backslash -> forward slash; trim).
// dogfood Suggestion: pure string equality false-violates on backslash/forward-slash form differences.
function normPath(f) {
  return String(f).replace(/\\/g, '/').trim();
}

// assertManifestCoverage(groups, manifest): the grouping guard. Every coupling chain's files must be
// co-located in ONE group so a cross-file bug is seen by a single reviewer.
//   groups   = [{ name, files: [...] }, ...]  (the workflow's caller-supplied args.groups)
//   manifest = { chains: [{ name, files: [...] }, ...] }
// A chain is satisfied iff SOME single group contains ALL its files. Returns { ok, violations }.
// A chain with EMPTY files is a malformed-manifest violation (dogfood fix: do NOT vacuously pass).
export function assertManifestCoverage(groups, manifest) {
  const grps = Array.isArray(groups) ? groups : [];
  const chains = manifest && Array.isArray(manifest.chains) ? manifest.chains : [];
  const groupFileSets = grps.map(
    (g) => new Set((g && Array.isArray(g.files) ? g.files : []).map(normPath)),
  );
  const violations = [];

  for (const chain of chains) {
    const files = chain && Array.isArray(chain.files) ? chain.files.map(normPath) : [];

    if (files.length === 0) {
      violations.push({ chain: chain && chain.name, reason: 'chain has no files (malformed manifest)', files: [] });
      continue;
    }

    const satisfied = groupFileSets.some((set) => files.every((f) => set.has(f)));

    if (!satisfied) {
      const present = files.filter((f) => groupFileSets.some((set) => set.has(f)));
      const reason = present.length === 0
        ? 'no group contains any file of this chain (not dispatched)'
        : 'chain files are split across groups (cross-group coupling blind spot)';
      violations.push({ chain: chain && chain.name, reason, files });
    }
  }

  return { ok: violations.length === 0, violations };
}
