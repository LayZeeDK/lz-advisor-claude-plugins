#!/usr/bin/env node
// Extract source-file scope from a phase's SUMMARY.md frontmatter for code-review tooling.
//
// Why this exists: gsd-tools' built-in SUMMARY.md frontmatter parser only treats
// INDENTED YAML keys as section transitions. Once it enters `key_files.modified:`,
// it never resets `inSection` when YAML de-indents back to a top-level sibling like
// `decisions:` or `notes:` (column 0). The result is that every `- ...` bullet under
// `decisions:`, `notes:`, etc. gets slurped as a "file path", producing a noisy list
// of full sentences and quoted strings. This helper applies the same parser logic but
// adds quote-stripping, file-path validation, and exclusion filtering so the output
// is a clean source-file scope.
//
// Usage:
//   node .planning/scripts/extract-summary-files.mjs <phase-dir>
//
// Output:
//   stdout: newline-separated absolute-from-repo-root file paths, sorted, unique
//   stderr: count=<n>
//
// Filters:
//   - .planning/* paths (orchestration artifacts)
//   - ROADMAP.md, STATE.md
//   - *-SUMMARY.md, *-VERIFICATION.md, *-PLAN.md
//   - Anything that doesn't look like a file path (whitespace, prose, unbalanced quotes)
//   - Anything that doesn't exist on disk
//
// When to retire this helper: once gsd-tools fixes the upstream parser to handle
// de-indentation back to column 0, the workflow's built-in extraction will produce
// the same output and this file can be deleted.

import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];

if (!dir) {
  console.error('Usage: node .planning/scripts/extract-summary-files.mjs <phase-dir>');
  console.error('Example: node .planning/scripts/extract-summary-files.mjs .planning/phases/07-address-all-phase-5-x-and-6-uat-findings');
  process.exit(2);
}

if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
  console.error(`Error: phase dir not found or not a directory: ${dir}`);
  process.exit(2);
}

const summaries = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('-SUMMARY.md'))
  .map((f) => path.join(dir, f));

if (summaries.length === 0) {
  console.error(`Warning: no *-SUMMARY.md files found in ${dir}`);
  process.exit(0);
}

const all = new Set();

for (const s of summaries) {
  const content = fs.readFileSync(s, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    continue;
  }

  const yaml = match[1];
  let inSection = null;

  for (const line of yaml.split('\n')) {
    if (/^\s+created:/.test(line)) {
      inSection = 'created';
      continue;
    }

    if (/^\s+modified:/.test(line)) {
      inSection = 'modified';
      continue;
    }

    // Section reset: any new YAML key (indented OR at column 0) ends the current
    // section. The leading whitespace is OPTIONAL here -- this is the difference
    // from the upstream gsd-tools parser, which requires \s+ before \w+ and so
    // misses de-indentation back to a top-level sibling like `decisions:`.
    if (/^\s*\w+:/.test(line) && !/^\s*-/.test(line)) {
      inSection = null;
      continue;
    }

    if (inSection && /^\s+-\s+(.+)/.test(line)) {
      let v = line.match(/^\s+-\s+(.+)/)[1].trim();

      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }

      all.add(v);
    }
  }
}

const isFilePath = (p) => {
  if (!p) {
    return false;
  }

  if (p.startsWith('"') || p.includes(' ')) {
    return false;
  }

  if (!/^[A-Za-z0-9_./@-]+$/.test(p)) {
    return false;
  }

  return p.includes('.') || p.includes('/');
};

const isExcluded = (p) => {
  return (
    p.startsWith('.planning/') ||
    p === 'ROADMAP.md' ||
    p === 'STATE.md' ||
    p.endsWith('-SUMMARY.md') ||
    p.endsWith('-VERIFICATION.md') ||
    p.endsWith('-PLAN.md')
  );
};

const filtered = [...all]
  .filter(isFilePath)
  .filter((p) => !isExcluded(p))
  .filter((p) => fs.existsSync(p))
  .sort();

console.log(filtered.join('\n'));
console.error(`count=${filtered.length}`);
