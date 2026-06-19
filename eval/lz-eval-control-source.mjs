// lz-eval-control-source.mjs
//
// NET-NEW (RE-PLAN-9, NO-SPEND): the ENTAILMENT-NATIVE positive-control SOURCE loader. The authority is
// 19-04-REPLAN-DECISION-9.md (a de-identified, fact-only cross-family advisor board, UNANIMOUS on a
// probe-gated build-OR-descope of the control arm). It REPLACES the now-VOIDED AVeriTeC-native-control
// source (T-spend-1: AVeriTeC "Supported" is an aggregate human judgment over the full evidence base, NOT
// strict excerpt-entailment, so native controls drop under the strict OOF screen; ~7 << N_CTRL_FLOOR 24)
// with a FAMILY-INDEPENDENT, license-clean, date-filterable source: it tries BOTH FEVER (fever/fever,
// CC-BY-SA-3.0) and VitaminC (tals/vitaminc, CC-BY-SA-3.0). SUPPORTS rows remap to the positive-control
// gold (the inverse of the trap remap); NEI/REFUTES rows are NOT controls.
//
// THE ONLY SUBSTANTIVE RE-PLAN-9 CHANGE is the positive-control source/construction; everything else is
// CARRIED BYTE-IDENTICAL. This module imports NEITHER the frozen jstat engine (eval/lz-eval-aggregate.mjs)
// NOR the OOF gold-decider identity (gpt-5.5 + gemini-3.1-pro-preview): it follows the Phase-18
// dataset-loader PATTERN (eval/lz-eval-dataset.mjs -- loadManifest/verifySha256/preflightToken/fetchDataset
// + a frozen remap discipline; fail-closed ContractError). The committed manifest carries ONLY ids +
// remapped labels + a pinned revision + sha256 for these fetch-only sources; no raw CC-BY-SA text is
// committed (D-04 discipline). Both sources are tried; the pre-registered survival + covariate + substring
// + hard-positive criteria (Tasks 7/8) decide which (or the pooled set) is used.
//
// DATE-FILTER (the per-source date FACT the board requires confirmed IN the probe): each control's
// evidence must be STRICTLY pre-claim-date (mirrors the FROZEN URL_DATE_RULE / strict-`<` cutoff
// discipline -- leak-safe + closed-book-mirroring). FEVER derives the cutoff from the Wikipedia dump
// revision date; VitaminC from the per-example wiki_revision_id. A source/row with NO defensible
// pre-claim-date cutoff returns null -> that source/row is DROPPED (the build does NOT silently proceed
// on an undated source).
//
// LICENSE: verifyControlSourceLicense RECORDS the license + FAILS CLOSED on an unrecognized string
// (CC-BY-SA is redistributable -- but a silent default is forbidden). This run-time fail-closed-drop is
// DEFENSE-IN-DEPTH on top of the authoring-time confirmation against the HuggingFace dataset cards (W2):
// both sources confirmed CC-BY-SA-3.0 at manifest-authoring time, NO SPEND.
//
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in the
// distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError ACROSS trees by
// relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval) -- so no eval dependency can
// leak into the marketplace package. zero npm deps.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); JSON reads go
// through the shared lz-eval-readjson.mjs helper (which strips a BOM at read time).

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's ContractError (D-10; eval -> runtime,
// one-directional, never the reverse).
import {
  ContractError,
} from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// Shared fail-closed JSON read (the eval-tree helper; strips a BOM, never a bare JSON.parse).
import { readJson } from './lz-eval-readjson.mjs';

// ---------------------------------------------------------------------------
// FROZEN source registry (RE-PLAN-9): the two entailment-native sources, their repo, their
// redistribution license (CONFIRMED against the HuggingFace dataset cards at manifest-authoring time, W2,
// NO SPEND), and the per-source date-derivation FIELD. A source NOT in this registry is unrecognized and
// fails closed (verifyControlSourceLicense). CC-BY-SA-3.0 is the ONLY recognized (redistributable) license.
// ---------------------------------------------------------------------------
const RECOGNIZED_LICENSES = Object.freeze({ 'CC-BY-SA-3.0': true });

export const CONTROL_SOURCES = Object.freeze({
  fever: Object.freeze({
    id: 'fever',
    repo: 'fever/fever',
    license: 'CC-BY-SA-3.0',
    // FEVER: the defensible per-claim PRE-DATE cutoff is the Wikipedia DUMP REVISION date the evidence
    // sentences were drawn from. A row must carry it (row.wiki_dump_date or row.dump_date) or it is dropped.
    dateField: 'wiki_dump_date',
  }),
  vitaminc: Object.freeze({
    id: 'vitaminc',
    repo: 'tals/vitaminc',
    license: 'CC-BY-SA-3.0',
    // VitaminC: the defensible per-claim PRE-DATE cutoff is the per-example wiki_revision_id (a Wikipedia
    // revision id carrying a revision timestamp). A row must carry it or it is dropped.
    dateField: 'wiki_revision_id',
  }),
});

// ---------------------------------------------------------------------------
// remapControlLabel(label): SUPPORTS -> the positive-control gold (the INVERSE of the trap remap). A
// control is a gold=unrefuted positive control whose date-filtered evidence GENUINELY ENTAILS the claim
// (the screen, Task 8, requires entails=true). NEI/REFUTES are NOT controls -> not remapped. An unknown
// label throws ContractError (fail closed -- mirrors the Phase-18 remapLabel discipline; a silent default
// is forbidden).
// ---------------------------------------------------------------------------
const CONTROL_LABEL_MAP = Object.freeze({
  SUPPORTS: Object.freeze({ expected_verdict: 'unrefuted', stratum: 'positive-control' }),
});

export function remapControlLabel(label) {
  const mapped = CONTROL_LABEL_MAP[label];

  if (mapped == null) {
    // SUPPORTS is the ONLY label that becomes a control. REFUTES / NOT ENOUGH INFO / NEI are NOT controls
    // -- they are explicitly not remapped (a control must be a genuine positive). An UNKNOWN label (schema
    // drift) is a fail-closed ContractError, never a silent default.
    throw new ContractError(
      'control label is not SUPPORTS (only SUPPORTS becomes a positive control; REFUTES/NEI are not controls): ' +
        JSON.stringify(label),
      'control-label-remap',
    );
  }

  return mapped;
}

// isControlLabel(label): true ONLY for SUPPORTS. Used to FILTER the source rows to controls (NEI/REFUTES
// are filtered out BEFORE remapControlLabel, so loadControlSource does not throw on a legitimate
// non-SUPPORTS row -- it simply drops it).
function isControlLabel(label) {
  return label === 'SUPPORTS';
}

// ---------------------------------------------------------------------------
// verifyControlSourceLicense(source): return the RECORDED license for a recognized CC-BY-SA-3.0 source;
// throw ContractError on an unrecognized source OR an unrecognized license string (fail closed -- a
// silent default is forbidden; CC-BY-SA is redistributable). This run-time check is defense-in-depth on
// top of the authoring-time confirmation against the HuggingFace dataset cards (W2).
// ---------------------------------------------------------------------------
export function verifyControlSourceLicense(source) {
  const entry = CONTROL_SOURCES[source];

  if (entry == null) {
    throw new ContractError(
      'unrecognized control source (expected fever|vitaminc): ' + JSON.stringify(source),
      'control-source-license',
    );
  }

  if (RECOGNIZED_LICENSES[entry.license] !== true) {
    throw new ContractError(
      'control source ' +
        source +
        ' carries an unrecognized/non-redistributable license (expected CC-BY-SA-3.0): ' +
        JSON.stringify(entry.license),
      'control-source-license',
    );
  }

  return entry.license;
}

// ---------------------------------------------------------------------------
// parseRevisionDate(value): parse a defensible PRE-DATE cutoff from a row's date-derivation field.
//   - FEVER: a Wikipedia DUMP REVISION date string (e.g. '2017-06-01' or an ISO timestamp).
//   - VitaminC: a per-example wiki_revision_id. A bare numeric revision id has NO embedded date, so a
//     row that carries ONLY a numeric id (no timestamp) yields NO defensible cutoff -> null. A revision
//     object/string that carries a timestamp (wiki_revision_id.timestamp or an ISO string) yields the date.
// Returns a Date or null (no defensible cutoff -> the source/row is DROPPED). NEVER throws on a missing
// date -- a missing date is a DROP, not a fail-closed error (the board: drop-the-source-on-no-date).
// ---------------------------------------------------------------------------
function parseRevisionDate(value) {
  if (value == null) {
    return null;
  }

  // A revision object carrying an explicit timestamp (VitaminC wiki_revision_id with a timestamp).
  if (typeof value === 'object') {
    const ts = value.timestamp != null ? value.timestamp : value.date;

    return parseRevisionDate(ts);
  }

  // A bare integer (a Wikipedia revision id with NO embedded date) is NOT a defensible cutoff -> null.
  if (typeof value === 'number') {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  // A bare numeric STRING (a stringified revision id, no date) is NOT a defensible cutoff -> null.
  if (/^\d+$/.test(trimmed)) {
    return null;
  }

  // A YYYY-MM-DD or ISO-8601 timestamp. Require an explicit Y-M-D so a garbage string fails to null.
  if (!/^\d{4}-\d{2}-\d{2}([T ]|$)/.test(trimmed)) {
    return null;
  }

  const d = new Date(trimmed);

  if (Number.isNaN(d.getTime())) {
    return null;
  }

  return d;
}

// parseClaimDate(value): parse a row's claim date (the cutoff is compared STRICTLY `<` against this).
// Returns a Date or null (an undated claim cannot be date-filtered -> the row is dropped).
function parseClaimDate(value) {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const s = String(value).trim();

  if (!/^\d{4}-\d{2}-\d{2}([T ]|$)/.test(s)) {
    return null;
  }

  const d = new Date(s);

  return Number.isNaN(d.getTime()) ? null : d;
}

// ---------------------------------------------------------------------------
// verifyControlSourceDate({ source, row }): derive the defensible per-claim PRE-DATE cutoff for a row.
//   - FEVER: from the Wikipedia DUMP REVISION date (row.wiki_dump_date / row.dump_date).
//   - VitaminC: from the per-example wiki_revision_id (row.wiki_revision_id -- a timestamp-bearing
//     revision; a bare numeric id has no date -> null).
// Returns the cutoff Date or null. A row/source with NO defensible cutoff -> null -> the row/source is
// DROPPED (the board: a source with no usable date is dropped; the build does NOT proceed on an undated
// source). This is the per-source date FACT the board requires confirmed IN the probe.
// ---------------------------------------------------------------------------
export function verifyControlSourceDate({ source, row } = {}) {
  const entry = CONTROL_SOURCES[source];

  if (entry == null) {
    throw new ContractError(
      'unrecognized control source (expected fever|vitaminc): ' + JSON.stringify(source),
      'control-source-date',
    );
  }

  if (row == null || typeof row !== 'object') {
    return null;
  }

  if (source === 'fever') {
    // FEVER: the Wikipedia DUMP REVISION date (the dump the evidence sentences were drawn from).
    const raw = row.wiki_dump_date != null ? row.wiki_dump_date : row.dump_date;

    return parseRevisionDate(raw);
  }

  // VitaminC: the per-example wiki_revision_id (a timestamp-bearing revision).
  return parseRevisionDate(row.wiki_revision_id);
}

// ---------------------------------------------------------------------------
// loadControlSource({ source, manifestPath, cacheDir, fetch }): load ONE entailment-native source's rows
// (fetch-only at eval time via the injected `fetch`; in the unit suite a STUB `fetch` returns fixture
// rows), VERIFY the license (verifyControlSourceLicense -- fail closed on an unrecognized license),
// derive each row's defensible PRE-DATE cutoff (verifyControlSourceDate -> null DROPS the row), filter to
// SUPPORTS rows, remap each via remapControlLabel, and date-filter each row's evidence to STRICTLY
// pre-claim-date (mirrors the FROZEN strict-`<` cutoff). A source whose rows ALL lack a defensible cutoff
// contributes ZERO controls (drop-the-source-on-no-date).
//
// Returns an array of control candidate rows:
//   { uid, source, claim, evidence, expected_verdict:'unrefuted', stratum:'positive-control', cutoff }
// where `evidence` is the strictly-pre-cutoff surviving evidence (the closed-book-mirroring packet) and
// `cutoff` is the ISO date string of the defensible cutoff.
//
// The injected `fetch` is the eval-time transport (fetch-only; in the unit suite a deterministic STUB).
// It receives { source, repo, revision, cacheDir } and returns the source's raw rows
// [{ id, claim, label, evidence:[{ text, date }], wiki_dump_date|wiki_revision_id, claim_date }].
// loadControlSource consumes ONLY ids + remapped labels + the date-filtered evidence (no raw text is
// committed -- the manifest carries only ids + remapped labels + pinned revision + sha256).
// ---------------------------------------------------------------------------
export async function loadControlSource({ source, manifestPath, cacheDir, fetch } = {}) {
  const entry = CONTROL_SOURCES[source];

  if (entry == null) {
    throw new ContractError(
      'loadControlSource: unrecognized source (expected fever|vitaminc): ' + JSON.stringify(source),
      'load-control-source',
    );
  }

  // (1) VERIFY the license (fail closed on an unrecognized string -- defense-in-depth on the W2 confirm).
  verifyControlSourceLicense(source);

  // (2) Resolve the pinned revision from the committed manifest (fetch-only; ids + revision + sha256
  // only, no raw CC-BY-SA text). The manifest source entry carries revision:'PENDING_ENUMERATE_AT_EVAL_TIME'
  // at build time (the real revision is enumerated at the Task-10 paid probe).
  let revision = 'PENDING_ENUMERATE_AT_EVAL_TIME';

  if (typeof manifestPath === 'string' && manifestPath.length > 0) {
    const m = readJson(manifestPath);
    const srcEntry = Array.isArray(m && m.sources)
      ? m.sources.find((s) => s != null && s.id === entry.id)
      : null;

    if (srcEntry != null && typeof srcEntry.revision === 'string' && srcEntry.revision.length > 0) {
      revision = srcEntry.revision;
    }
  }

  if (typeof fetch !== 'function') {
    throw new ContractError(
      'loadControlSource requires an injected fetch (the eval-time transport; a STUB in the unit suite)',
      'load-control-source',
    );
  }

  const rawRows = await fetch({ source, repo: entry.repo, revision, cacheDir });

  if (!Array.isArray(rawRows)) {
    throw new ContractError('loadControlSource: fetch must return an array of rows for ' + source, 'load-control-source');
  }

  const controls = [];

  for (const row of rawRows) {
    if (row == null || typeof row !== 'object') {
      continue;
    }

    // (3) FILTER to SUPPORTS rows. NEI/REFUTES are NOT controls -- dropped (not remapped, not an error).
    if (!isControlLabel(row.label)) {
      continue;
    }

    // (4) DERIVE the defensible PRE-DATE cutoff. NO cutoff -> DROP the row (drop-the-source-on-no-date).
    const cutoff = verifyControlSourceDate({ source, row });

    if (cutoff == null) {
      continue;
    }

    // (5) The claim must itself be dated so the strict-`<` filter has a reference. An undated claim
    // cannot be date-filtered -> drop.
    const claimDate = parseClaimDate(row.claim_date);

    if (claimDate == null) {
      continue;
    }

    // (6) DATE-FILTER the evidence to STRICTLY pre-claim-date (mirrors the FROZEN URL_DATE_RULE /
    // dateFilter strict-`<` discipline). Each evidence item is { text, date } (a DD-MM-YYYY/ISO string or
    // Date). An undated or same-day/post-claim-date evidence item is DROPPED (leak-safe + closed-book-
    // mirroring). The cutoff used for the filter is the EARLIER of the claim date and the source cutoff
    // (the evidence must precede BOTH -- it cannot be drawn from a dump postdating the claim).
    const filterCutoff = cutoff.getTime() < claimDate.getTime() ? cutoff : claimDate;
    const evidenceItems = Array.isArray(row.evidence) ? row.evidence : [];
    const survivors = [];

    for (const ev of evidenceItems) {
      if (ev == null || typeof ev !== 'object') {
        continue;
      }

      const evDate = parseClaimDate(ev.date);

      // STRICT `<`: an undated (null) OR same-day/post-cutoff evidence item is DROPPED.
      if (evDate == null) {
        continue;
      }

      if (evDate.getTime() < filterCutoff.getTime()) {
        survivors.push({ text: typeof ev.text === 'string' ? ev.text : '', date: ev.date });
      }
    }

    // A control with NO strictly-pre-cutoff surviving evidence is NOT a usable positive control (it cannot
    // genuinely entail the claim from pre-cutoff evidence) -> drop.
    if (survivors.length === 0) {
      continue;
    }

    const mapped = remapControlLabel(row.label);
    const uid = String(row.id == null ? '' : row.id);

    if (uid.length === 0) {
      continue;
    }

    controls.push({
      uid: source + '-' + uid,
      source,
      claim: typeof row.claim === 'string' ? row.claim : '',
      evidence: survivors,
      expected_verdict: mapped.expected_verdict,
      stratum: mapped.stratum,
      cutoff: cutoff.toISOString(),
    });
  }

  return controls;
}

// ---------------------------------------------------------------------------
// Thin CLI (guarded so importing the module does NOT run it). With `--sources` it prints the recognized
// entailment-native control sources + their licenses (the values the manifest pre-registration records).
// The real load (Task 10, human-gated) drives loadControlSource with the eval-time fetch transport; this
// CLI is a convenience only.
// ---------------------------------------------------------------------------
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const mode = process.argv[2];

  if (mode === '--sources') {
    for (const k of Object.keys(CONTROL_SOURCES)) {
      const s = CONTROL_SOURCES[k];
      console.log(s.id + ' ' + s.repo + ' ' + s.license + ' (date: ' + s.dateField + ')');
    }

    process.exit(0);
  }

  console.error('lz-eval-control-source: usage: node lz-eval-control-source.mjs --sources');
  process.exit(2);
}
/* node:coverage enable */
