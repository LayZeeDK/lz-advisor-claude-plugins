# Phase 23: Judge-free confidence and operating envelope for lz-deep-research - Pattern Map

**Mapped:** 2026-09-07
**Files analyzed:** 14 (11 new, 2 modified, 1 new phase document)
**Analogs found:** 12 / 14 (1 partial, 1 with no analog)

Scope note: this phase adds modules alongside ~70 existing `eval/lz-eval-*.mjs` siblings. Every new
module has a sibling to copy from; the only genuinely new mechanism in the tree is outbound HTTP
(ENV-04's live half), which no existing eval module performs.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `eval/lz-eval-p23-prereg.md` (new) | config / frozen document | -- (document) | `eval/lz-eval-parity-prereg.md` | exact |
| `eval/lz-eval-p23-prereg.test.mjs` (new) | test (anti-drift) | file-I/O | `eval/lz-eval-parity-prereg.test.mjs` | exact |
| `eval/lz-eval-p23-citation-audit.mjs` (new) | service (pure transform + thin CLI) | transform / file-I/O | `eval/lz-eval-sliceA-gold.mjs` | exact |
| `eval/lz-eval-p23-citation-audit.test.mjs` (new) | test | file-I/O | `eval/lz-eval-sliceA-gold.test.mjs` | exact |
| `eval/lz-eval-p23-sliceA-draw.mjs` (new) | service (seeded selector) | transform | `eval/lz-eval-sliceA-gold.mjs` (`filterSliceA` + gate + CLI) | exact |
| `eval/lz-eval-p23-sliceA-draw.test.mjs` (new) | test | transform | `eval/lz-eval-sliceA-gold.test.mjs` | exact |
| `eval/lz-eval-p23-verify-complete.mjs` (new, ENV-05 checker) | utility (predicate) | file-I/O | `eval/lz-eval-sliceA-gold.mjs` `sliceAFeasibilityGate` + CLI | role-match |
| `eval/lz-eval-p23-verify-complete.test.mjs` (new) | test | file-I/O | `eval/lz-eval-sliceA-gold.test.mjs` (discrimination block) | exact |
| `eval/lz-eval-p23-resolvability.mjs` (new) | service (live check) | request-response (outbound HTTP) | **none** -- structural shell from `lz-eval-sliceA-gold.mjs`; no HTTP analog exists | partial |
| `eval/lz-eval-p23-resolvability.test.mjs` (new) | test | request-response (stubbed) | `eval/lz-eval-sliceA-gold.test.mjs` for idiom only | partial |
| `eval/lz-eval-p23-capture-driver.md` (new, D-17 retention) | prompt / protocol document | -- (document) | `eval/lz-eval-parity-driver.md` | exact |
| `eval/lz-eval-baseline-manifest.mjs` (MODIFY, line 91) | service | file-I/O | itself -- one-field edit, keep surrounding idiom | exact |
| `eval/lz-eval-baseline-manifest.test.mjs` (MODIFY, add cases) | test | file-I/O | `eval/lz-eval-parity-prereg.test.mjs` discrimination block | role-match |
| `.planning/phases/23-.../23-ENVELOPE.md` (new) | document | -- | no in-repo analog; skeleton from RESEARCH Pattern 6(i) | none |

Also modified per RESEARCH: an assertion added to `eval/lz-eval-sliceA-gold.test.mjs` (no pooled-rate
key in the ENV-03 driver output). That file is its own analog.

## Pattern Assignments

### `eval/lz-eval-p23-citation-audit.mjs` (service, transform)

**Analog:** `eval/lz-eval-sliceA-gold.mjs` -- study it as a whole; it is the shape template for any new
scoring/filter module in this tree: a header block that names the AUTHORITY, `Object.freeze` constants,
pure exported functions, fail-closed `ContractError`, and a guarded thin CLI at the bottom.

**Header block convention** (`lz-eval-sliceA-gold.mjs:1-38`) -- every new module opens with one. Copy
the shape and the last two paragraphs nearly verbatim:

```js
// lz-eval-sliceA-gold.mjs
//
// NET-NEW (Plan 22-02, Task 2; NO-SPEND): the OFF-MODEL Slice-A AVeriTeC filter + 4-way->binary
// collapse + per-confusion-matrix-direction DESCRIPTIVE tally + the frozen feasibility gate (PAR-06 /
// D-11 / D-14). THE AUTHORITY is 22-CONTEXT.md (D-11/D-14) + 22-RESEARCH.md "D-14 RESOLUTION" + the
// "Reusing the confusion-matrix cell logic for Slice A" code example.
// ...
// Tree / dependency boundary (D-10/D-11): this script lives in the repo-level eval/ dev tree, NEVER in
// the distributed plugin tree. It imports the SHIPPED runtime aggregator's ContractError + the MCC cell
// engine ACROSS trees by relative path -- ONE-DIRECTIONAL (eval -> runtime, NEVER runtime -> eval). It
// has NO out-of-family transport (D-18); the gold is the free AVeriTeC only.
//
// This source contains no literal byte-order mark and is strictly ASCII (per CLAUDE.md); LF line
// endings. The thin CLI is guarded so importing this module runs nothing.
```

For ENV-04 the authority line becomes `THE AUTHORITY is 23-CONTEXT.md (D-02/D-12/D-13/D-19) +
eval/lz-eval-p23-prereg.md`, and the module must state that the frozen normalization rules live in the
pre-registration and this file implements them.

**Imports pattern** (`lz-eval-sliceA-gold.mjs:40-55`) -- Node stdlib plus the two cross-tree/eval-tree
helpers, each with a comment explaining the one-directional boundary:

```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

// Fail-closed BOM-stripping JSON read (the established eval-tree convention) -- used by the CLI to read
// the on-disk AVeriTeC dev JSON.
import { readJson } from './lz-eval-readjson.mjs';
```

ENV-04 additionally needs no import beyond these -- `URL`, `String.prototype.normalize`, and
`node:crypto` are globals/built-ins. Do NOT add a package.

**Frozen-constants pattern** (`lz-eval-sliceA-gold.mjs:57-100`) -- the exported bar is `Object.freeze`d
and the co-test asserts `Object.isFrozen`; regexes are module-level frozen literals with a comment
naming the decision they implement:

```js
// ---------------------------------------------------------------------------
// SLICE_A_GATE: the RESOLVED D-14 feasibility-gate thresholds, FROZEN BEFORE any grading (D-20). The
// pre-registration (Plan 22-04) records these; a co-test asserts Object.isFrozen. They are NOT
// computed from the corpus -- they are the load-bearing pre-registered floor.
// ---------------------------------------------------------------------------
export const SLICE_A_GATE = Object.freeze({
  N_SUP_MIN: 8,
  N_REF_MIN: 8,
});

// The report-shaped + non-leaking filter knobs (D-11 / RESEARCH D-14 RESOLUTION (a)).
const FILTER = Object.freeze({
  MIN_CHARS: 45,
  MAX_CHARS: 220,
  MAX_SENTENCE_PUNCT: 1,
});

// Verdict-leaking tokens (the claim text must not itself reveal the verdict; D-14 RESOLUTION (a)).
const LEAKY_TOKEN_RE = /\b(false|fake|hoax|debunk|debunked|fact-check|fact-checked)\b/i;
```

ENV-04's `ARXIV_RE`, `DOI_RE`, and `KEEP_PARAMS` (RESEARCH *Code Examples*) go in exactly this position
and must be exported or mirrored so `lz-eval-p23-prereg.test.mjs` can pin them.

**Pure-mapper + fail-closed pattern** (`lz-eval-sliceA-gold.mjs:106-116`) -- an unmapped input is never
silently defaulted. `canonicalizeCitation`'s `unmatched` / `raw:` bucket is the ENV-04 equivalent
(reported, never dropped):

```js
export function collapseAvtLabel(avtLabel) {
  if (!Object.prototype.hasOwnProperty.call(AVT_COLLAPSE, avtLabel)) {
    throw new ContractError(
      'unknown AVeriTeC label (expected Supported|Refuted|Conflicting Evidence/Cherrypicking|Not Enough Evidence): ' +
        JSON.stringify(avtLabel),
      'collapseAvtLabel',
    );
  }

  return AVT_COLLAPSE[avtLabel];
}
```

**Predicate pattern** (`lz-eval-sliceA-gold.mjs:127-154`) -- early-return guard chain, one `if` per
frozen rule, blank line between each, non-string input returns `false` rather than throwing. Copy this
for the structural cited/uncited unit rule (Pattern 2E):

```js
function reportShapedAndNonLeaking(claim) {
  if (typeof claim !== 'string') {
    return false;
  }

  const len = claim.length;

  if (len < FILTER.MIN_CHARS || len > FILTER.MAX_CHARS) {
    return false;
  }

  const punctMatches = claim.match(SENTENCE_PUNCT_RE);
  const punctCount = punctMatches ? punctMatches.length : 0;

  if (punctCount > FILTER.MAX_SENTENCE_PUNCT) {
    return false;
  }

  return true;
}
```

**Thin guarded CLI pattern** (`lz-eval-sliceA-gold.mjs:265-301`) -- copy verbatim in structure,
including the `node:coverage` fences, the `fileURLToPath(import.meta.url) === path.resolve(...)` guard,
the one-line machine-readable stdout, and the 0 / 1 / 2 exit-code split:

```js
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const inputPath = process.argv[2];

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error('lz-eval-sliceA-gold: missing or invalid <averitec-dev.json>');
    process.exit(2);
  }

  try {
    const data = readJson(inputPath);
    const items = Array.isArray(data) ? data : data.claims;
    const { unrefuted, refuted } = filterSliceA({ items });
    const { cleared, provisionalLimits } = sliceAFeasibilityGate({
      supportedCount: unrefuted.length,
      refutedCount: refuted.length,
    });
    console.log('clean unrefuted=' + unrefuted.length + ' clean refuted=' + refuted.length + ' gate-cleared=' + cleared);

    for (const limit of provisionalLimits) {
      console.log('provisional: ' + limit);
    }

    process.exit(cleared ? 0 : 1);
  } catch (err) {
    const where = err && err.file ? ' (' + err.file + ')' : '';
    console.error('lz-eval-sliceA-gold: ' + (err && err.message ? err.message : String(err)) + where);
    process.exit(2);
  }
}
/* node:coverage enable */
```

ENV-04's CLI takes `<report.md>` and prints the identifier-set cardinality, the `unmatched` count, and
the `uncited_units` count on one line. Exit 2 on `ContractError`; exit 0 otherwise (it is DESCRIPTIVE,
so there is no pass/fail exit-1 branch -- unlike the gate above).

---

### `eval/lz-eval-p23-sliceA-draw.mjs` (service, transform)

**Analog:** `eval/lz-eval-sliceA-gold.mjs` -- and the module it must COMPOSE, not rebuild. Import
`filterSliceA` and sample its OUTPUT.

**The leak-control line that constrains the draw** (`lz-eval-sliceA-gold.mjs:199-201`):

```js
    // Emit ONLY claim + claim_date -- strip every leaky gold field (justification,
    // fact_checking_article, questions, label, speaker). The voter never sees the gold.
    const voterRecord = { claim: item.claim, claim_date: item.claim_date };
```

The seeded draw takes `{ unrefuted, refuted }` from `filterSliceA` and returns 20 + 20. Sampling raw
rows bypasses T-22-05; the co-test must assert every drawn record's key set is exactly
`['claim', 'claim_date']`.

**Input-validation pattern for numeric arguments** (`lz-eval-sliceA-gold.mjs:220-238`) -- reuse this
shape for the seed and the per-direction draw size:

```js
export function sliceAFeasibilityGate({ supportedCount, refutedCount } = {}) {
  for (const [name, v] of [['supportedCount', supportedCount], ['refutedCount', refutedCount]]) {
    if (!Number.isInteger(v) || v < 0) {
      throw new ContractError(
        'sliceAFeasibilityGate requires a non-negative integer ' + name + ': ' + JSON.stringify(v),
        'sliceAFeasibilityGate',
      );
    }
  }
  ...
  // provisionalLimits is a fresh copy so a caller cannot mutate the frozen source array.
  return { cleared, provisionalLimits: PROVISIONAL_LIMITS.slice() };
}
```

Note the `.slice()` defensive-copy idiom on every frozen array returned to a caller -- apply it to the
drawn item lists too.

**Never-pooled output shape** (`lz-eval-sliceA-gold.mjs:252-263`) -- the ENV-03 driver's output JSON
mirrors this and must contain no pooled key:

```js
export function tallyPerDirection({ verdicts, gold } = {}) {
  const { tp, tn, fp, fn } = mccFromPairs({ verdicts, gold });

  // Split the cells by gold DIRECTION -- never pooled. The unrefuted (Supported) axis owns TP+FN; the
  // refuted axis owns TN+FP.
  return {
    unrefuted: { tp, fn },
    refuted: { tn, fp },
  };
}
```

**Seeded PRNG:** no analog exists in the tree (`Math.random` appears nowhere in a scoring path). Write
~15 lines of mulberry32 inline per RESEARCH *Don't Hand-Roll*, and pin an expected sequence in the
co-test. Do NOT add a package.

**SEED-005 dispatch provenance:** no implemented analog. The nearest is
`eval/lz-eval-voter-dispatch.workflow.mjs`, which counts `dispatched` but does not persist the exact
dispatched string. This is net-new; write it as a per-item JSON record beside the verdicts.

---

### `eval/lz-eval-baseline-manifest.mjs` (MODIFY -- one field, line 91)

**Analog:** itself. This is a one-field edit inside an existing fail-closed block; keep every
surrounding line.

**The exact lines to replace** (`lz-eval-baseline-manifest.mjs:91-98`):

```js
      const ccVersion = typeof event.version === 'string' && event.version.length > 0 ? event.version : null;

      if (ccVersion == null) {
        throw new ContractError(
          'system/init event has no CC version -- the run cannot be pinned (D-15/D-16)',
          'extractSystemInit',
        );
      }
```

Replacement (RESEARCH Pattern 1 / *Code Examples*) -- prefer `claude_code_version`, keep `version` as a
fallback so older fixtures still parse. Leave the `ContractError` guard, the message, and the
`{ ccVersion, model, plugins }` return at `:100-102` untouched.

**Surrounding idiom to preserve** (`:83-89`) -- the model guard immediately above uses the same
`typeof x === 'string' && x.length === 0` shape and throws with a D-reference in the message:

```js
    if (event.type === 'system' && event.subtype === 'init') {
      if (typeof event.model !== 'string' || event.model.length === 0) {
        throw new ContractError(
          'system/init event has no model -- an unpinned CC-version+model run cannot be graded (D-15)',
          'extractSystemInit',
        );
      }
```

**The four fail-closed fields the MANIFEST task must satisfy** (`:149-156` doc comment, enforced at
`:165-198`) -- quote this block in the plan, because `costUsd` is the open item (D-22 / A1):

```js
// validateManifest(manifest) -- the fail-closed gate (D-15/D-16). Returns true iff the manifest is
// complete + the report exists; otherwise throws a DISTINCT ContractError per missing load-bearing
// field:
//   - a missing/empty model      -> 'model' in the message (the run is unpinned -- cannot be graded).
//   - a missing/empty ccVersion  -> 'CC version' in the message (cannot be pinned).
//   - a missing reportPath / a non-existent report file -> 'report' in the message.
//   - a missing costUsd          -> 'cost' in the message (D-16 per-run cost).
```

and the cost guard itself (`:193-198`):

```js
  if (typeof manifest.costUsd !== 'number' || !Number.isFinite(manifest.costUsd) || manifest.costUsd < 0) {
    throw new ContractError(
      'manifest is missing a valid per-run cost (costUsd, a non-negative finite number) (D-16)',
      'validateManifest',
    );
  }
```

---

### `eval/lz-eval-p23-prereg.md` (frozen document)

**Analog:** `eval/lz-eval-parity-prereg.md` -- copy its opening three paragraphs and its
"Frozen NUMBERS" table format exactly; the anti-drift co-test depends on the table's cell shape.

**Opening pattern** (`lz-eval-parity-prereg.md:1-13`):

```markdown
# lz-deep-research vs built-in /deep-research parity eval -- pre-registered lock rule (Phase 22, PAR-01 / D-20)

This is the single source of truth for the ... verdict ... It is
PRE-REGISTERED: it is written and committed (with a timestamp) BEFORE any report is captured or graded,
so the parity verdict and the calibration bar cannot be rationalized post-hoc (D-04 / D-05 / ...).

The authority is `22-CONTEXT.md` (D-01..D-20) + `22-RESEARCH.md` (...). It mirrors the
`eval/lz-eval-live-lock-rule.md` discipline (the Phase-20 pre-registered lock rule).
```

**Frozen-numbers table pattern** (`lz-eval-parity-prereg.md:15-38`) -- the anti-drift test matches
`| `Constant` | <value> |` byte-for-byte, so the pipe/backtick/space layout is a contract:

```markdown
## Frozen NUMBERS match the module constants byte-for-byte (anti-drift, D-20)

Every frozen NUMBER below is a module-level `Object.freeze`d LITERAL in the Plan 22-01 / 22-02 eval
modules, chosen and committed BEFORE any grading. ... The anti-drift co-test
`eval/lz-eval-parity-prereg.test.mjs` asserts the prose numbers below equal those constants
byte-for-byte ... The code is authoritative; if a number here ever disagrees, the code wins and this
document is wrong and must be corrected to match.

| Constant | Value | Source module |
|----------|-------|---------------|
| `SLICE_A_GATE.N_SUP_MIN` | 8 | `eval/lz-eval-sliceA-gold.mjs` |
| `SLICE_A_GATE.N_REF_MIN` | 8 | `eval/lz-eval-sliceA-gold.mjs` |
```

Phase 23's table adds the ENV-03 draw seed / sizes and the ENV-04 `KEEP_PARAMS` and canonicalization
constants. It must also carry the numbered `## Section (i)`, `(ii)`, ... layout the Phase-22 prereg uses
for prose rules, and the `## AMENDMENT RECORD n` convention for anything changed after the freeze.

---

### `eval/lz-eval-p23-prereg.test.mjs` (test, anti-drift)

**Analog:** `eval/lz-eval-parity-prereg.test.mjs` -- the exact analog. Copy the whole file's structure
and swap the imported constants.

**Header + imports + path resolution** (`:29-49`):

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SLICE_A_GATE } from './lz-eval-sliceA-gold.mjs';

// Resolve the prereg test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees and
// headless `claude -p`). HERE is the repo-level eval/ dir.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PREREG = path.join(HERE, 'lz-eval-parity-prereg.md');
```

**Frozen-ness assertion** (`:56-61`):

```js
test('the frozen constant sources are Object.frozen (anti-result-shopping, D-20)', () => {
  assert.ok(Object.isFrozen(SLICE_A_GATE), 'SLICE_A_GATE must be Object.frozen');
});
```

**The needle-built-FROM-the-constant idiom** (`:69-93`) -- the code is authoritative; the needle is
constructed, never hard-coded:

```js
function antiDriftChecks() {
  return [
    ['| `SLICE_A_GATE.N_SUP_MIN` | ' + SLICE_A_GATE.N_SUP_MIN + ' |', 'SLICE_A_GATE.N_SUP_MIN'],
  ];
}

test('PAR-01 anti-drift: the prereg prose NUMBERS match the frozen module constants byte-for-byte', () => {
  const prose = readPrereg();

  for (const [needle, name] of antiDriftChecks()) {
    assert.ok(
      prose.includes(needle),
      'prereg prose must carry the frozen ' + name + ' value verbatim: "' + needle + '"',
    );
  }
});
```

**The discrimination proof** (`:102-120`) -- mandatory per project convention; a `+ 1` wrong needle must
be ABSENT, proving the substring match is not a tautology:

```js
function wrongNeedleChecks() {
  return [
    ['| `SLICE_A_GATE.N_SUP_MIN` | ' + (SLICE_A_GATE.N_SUP_MIN + 1) + ' |', 'SLICE_A_GATE.N_SUP_MIN'],
  ];
}

test('PAR-01 anti-drift is DISCRIMINATING: a wrong (constant + 1) value is NOT present in the prose', () => {
```

---

### `eval/lz-eval-p23-verify-complete.mjs` (utility, predicate) + its test

**Analog:** `sliceAFeasibilityGate` (`lz-eval-sliceA-gold.mjs:220-238`) for the predicate-returning-an-
object shape, plus the guarded CLI. The ENV-05 checker reads a `report.md`, finds the
`## Complete verification ledger (N/N confirmed)` heading, and returns
`{ complete, declaredN, confirmedN, tableRows }`.

**Discrimination pattern to copy** (`lz-eval-sliceA-gold.test.mjs:21-24`):

```js
// DISCRIMINATION (the invert-the-fix proofs, required by the plan):
//   - the gate FAILS to clear on a falsehood-only corpus (N_SUP_MIN unmet) -- proves the both-
//     directions-populated rule is load-bearing.
//   - filterSliceA DROPS a verdict-leaking-token claim that an un-filtered pass would keep.
```

For ENV-05 the negative case already exists on disk:
`eval/.cache/p22-baseline/builtin/qB1-run1.report.partial-verify.md` must return `complete: false`, and
`qB1-run1.report.md` must return `complete: true`. Both live in gitignored `eval/.cache/`, so the test
needs a skip-if-absent guard (same treatment the ENV-02 real-capture case needs).

---

### `eval/lz-eval-p23-capture-driver.md` (prompt / protocol document)

**Analog:** `eval/lz-eval-parity-driver.md` -- the session-drives-spend / node-scores-from-disk protocol
document. Copy its opening, its transport table, and its absolute-prohibitions block.

**Opening pattern** (`lz-eval-parity-driver.md:1-16`):

```markdown
# lz-deep-research parity-eval session-driver protocol (Phase 22, PAR-03/PAR-04; capture + calibrate + grade)

This is the exact, step-by-step protocol a CLAUDE CODE SESSION follows AT SPEND TIME to drive the
measured parity eval ... It is the operational companion to the no-spend seams in
`eval/lz-eval-parity-judge.mjs` + ... and the pre-registered acceptance rule in
`eval/lz-eval-parity-prereg.md`.

Following the steps below incurs session-pool spend; this document does NOT itself spend. The spend is
the human-authorized BLOCKING checkpoint of Plan 22-05. Do NOT run any step below until the
pre-registration freeze commit has landed ... and the go is given.
```

**Transport-split table** (`:20-28`) -- reuse the four-column shape; Phase 23 has only `callVoter`
(Slice-A dispatch) and `capture` (headless `claude -p`), plus ENV-06's `callJudge` if the spike clears:

```markdown
| Transport | Mechanism | Pool | Node-wireable? |
|-----------|-----------|------|----------------|
| `callVoter` (the Slice-A verify-voter) | the Phase-18 verify-voter Agent sub-agent, spawned via the Agent tool | the Claude SESSION pool | NO -- SESSION-DRIVEN. |
| `capture` (the built-in `/deep-research` + lz-deep-research report capture) | a headless `claude -p` subprocess (capture ONLY, NOT a voter/judge transport) | the Claude SESSION pool (shared 5-hour pool) | NO model SCORING -- the captured report.md lands on disk; node scores from disk. |
```

**Prohibitions block** (`:41-52`) -- carry it forward verbatim in substance (no `callOof`, no Anthropic
API, no `claude -p` as a judge/voter transport).

**What this driver adds that the analog lacks (D-17, the reason the phase needs a new driver at all):**
the retention step. Per RESEARCH *Pitfall 1*, the step list must NOT end at "save report.md and
stream.jsonl"; it must copy the lz run dir (`claims/`, `excerpts/`, `votes/`, `survivors.json`,
`run_state.json`) into `eval/.cache/p23-baseline/lz/q2/` and
`~/.claude/projects/<cwd-hash>/<session-id>/subagents/agent-*.jsonl` into
`eval/.cache/p23-baseline/builtin/q2/subagents/`, immediately after the capture. No analog step exists
in the Phase-22 driver -- that omission is the documented cause of the lost q1 corpus.

---

### `eval/lz-eval-p23-resolvability.mjs` (service, request-response) -- PARTIAL analog

**Structural analog:** `eval/lz-eval-sliceA-gold.mjs` (header block, frozen constants, guarded CLI).

**No HTTP analog exists.** Verified: `rg 'fetch\(|node:https|node:http' eval/*.mjs` returns exactly one
hit, `eval/lz-eval-control-source.mjs:311`, and that `fetch` is an INJECTED function parameter, not a
network call. No eval module performs outbound HTTP. This makes ENV-04's live half the tree's first
network surface, which is why RESEARCH flags SSRF as new to this phase.

**Consequence for the planner:** the timeout / size-cap / scheme-allowlist / no-redirect-to-other-scheme
controls have no in-repo precedent to copy and must be written from the RESEARCH Security Domain (V12)
requirements. The dependency-injection idiom from `lz-eval-control-source.mjs` IS worth copying though --
take the fetcher as a parameter so the co-test can stub it:

```js
  const rawRows = await fetch({ source, repo: entry.repo, revision, cacheDir });
```

That injection is also what makes the ENV-04 no-network assertion testable (run the offline module's
test with `fetch` stubbed to throw and confirm it still passes).

---

### `.planning/phases/23-.../23-ENVELOPE.md` (document) -- NO analog

No operating-envelope or model-card-shaped document exists in this repo. Use the RESEARCH Pattern 6(i)
Model Facts skeleton (the recommended one) reproduced in `23-RESEARCH.md:734-762`. The nearest in-repo
prose conventions to carry over are the `.planning/notes/phase-22-diagnosis-two-root-causes.md`
"Unresolved / abstain ledger" house style and the PROVISIONAL-limits phrasing frozen in
`eval/lz-eval-sliceA-gold.mjs:70-75`.

## Shared Patterns

### Fail-closed error signalling
**Source:** `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`
(`ContractError`), imported across trees.
**Apply to:** every new `.mjs` module.
```js
// Cross-tree reuse of the SHIPPED runtime aggregator's fail-closed signal (D-10; eval -> runtime,
// one-directional, never the reverse).
import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';
```
Message convention: a plain-English cause, then the offending value via `JSON.stringify`, then the
governing decision id in parentheses; second argument is the function name.
```js
      throw new ContractError(
        'filterSliceA surviving item missing a non-empty claim_date (the as-of cutoff is load-bearing): ' +
          JSON.stringify(item.claim),
        'filterSliceA',
      );
```
[`eval/lz-eval-sliceA-gold.mjs:191-197`]

### JSON reads
**Source:** `eval/lz-eval-readjson.mjs`
**Apply to:** every on-disk JSON read in a new module.
```js
import { readJson } from './lz-eval-readjson.mjs';
```

### Test-file-relative path resolution (never `process.cwd()`)
**Source:** `eval/lz-eval-packaging-boundary.test.mjs:30-33`, identical in every test in the tree.
**Apply to:** every new test and every module that resolves a sibling artifact.
```js
// Resolve the plugin tree test-file-relative (NEVER process.cwd() -- cwd drifts under GSD worktrees
// and headless `claude -p`). HERE is the repo-level eval/ dir; the plugin root is one level up,
// then into plugins/lz-advisor.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(HERE, '..', 'plugins', 'lz-advisor');
```

### Test framework idiom + the host-quirk header
**Source:** every `eval/lz-eval-*.test.mjs`; header text from
`eval/lz-eval-packaging-boundary.test.mjs:16-21`.
**Apply to:** all five new/modified test files.
```js
// HOST QUIRK (load-bearing): on this host (Node v24.13.0 / Windows arm64 / Git Bash) the phase gate
// MUST target the explicit FILE form:
//   node --test eval/lz-eval-packaging-boundary.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every real
// test passes. The suite is one file, so the file form is the equivalent reliable gate.

import { test } from 'node:test';
import assert from 'node:assert/strict';
```
Every plan gate command names explicit `.test.mjs` FILE paths.

### One named test per behaviour, plus a named discrimination test
**Source:** `eval/lz-eval-sliceA-gold.test.mjs:9-24` (the doc block) and `:59-84` (the tests).
**Apply to:** all new tests.
```js
test('SLICE_A_GATE is Object.frozen and carries the resolved feasibility thresholds (N_SUP_MIN 8, N_REF_MIN 8)', () => {
  assert.ok(Object.isFrozen(SLICE_A_GATE), 'SLICE_A_GATE must be Object.frozen (anti-result-shopping)');
  assert.equal(SLICE_A_GATE.N_SUP_MIN, 8);
});

test('collapseAvtLabel: an unknown label is a ContractError (fail-closed)', () => {
  assert.throws(() => collapseAvtLabel('Mostly True'), ContractError);
});
```
The test-name string states the behaviour AND the governing decision id. The module's own header block
enumerates the asserted behaviours and the discrimination proofs before the imports.

### Guarded thin CLI
**Source:** `eval/lz-eval-sliceA-gold.mjs:271-301` and `eval/lz-eval-baseline-manifest.mjs:209-238`
(identical shape).
**Apply to:** every new module that is runnable. Quoted in full under the citation-audit section above.

### Eval-tree packaging boundary
**Source:** `eval/lz-eval-packaging-boundary.test.mjs`
**Apply to:** every new module -- it may import from `plugins/lz-advisor/.../scripts/` by relative
path, never the reverse, and nothing new goes under `plugins/lz-advisor/`. Already enforced; no new test
needed, just do not violate it.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `.planning/phases/23-.../23-ENVELOPE.md` | document | -- | No operating-envelope / model-card-shaped artifact exists in the repo. Use RESEARCH Pattern 6(i). |
| `eval/lz-eval-p23-resolvability.mjs` (its HTTP half only) | service | request-response | No eval module performs outbound HTTP. Verified: the one `fetch(` hit in `eval/*.mjs` is an injected parameter, not a network call. Timeout / size cap / scheme allowlist must be written from RESEARCH Security Domain V12. |
| SEED-005 dispatch-provenance persistence | utility | file-I/O | `eval/lz-eval-voter-dispatch.workflow.mjs` counts `dispatched` but never persists the exact dispatched string. Net-new. |
| Seeded PRNG for the 40-item draw | utility | transform | No seeded RNG exists in the tree. Write mulberry32 inline (~15 lines) with a pinned expected sequence; do not add a package. |

## Metadata

**Analog search scope:** `eval/` (all 43 `.mjs` modules, 36 `.test.mjs` co-tests, 8 `.md` protocol and
pre-registration documents), `plugins/lz-advisor/skills/lz-deep-research/scripts/`, `.planning/phases/`.
**Files read in full:** `eval/lz-eval-sliceA-gold.mjs`, `eval/lz-eval-baseline-manifest.mjs`;
partial (headers + the cited ranges): `eval/lz-eval-parity-prereg.test.mjs`,
`eval/lz-eval-sliceA-gold.test.mjs`, `eval/lz-eval-parity-prereg.md`,
`eval/lz-eval-parity-driver.md`, `eval/lz-eval-packaging-boundary.test.mjs`,
`eval/lz-eval-control-source.mjs`.
**Pattern extraction date:** 2026-09-07
