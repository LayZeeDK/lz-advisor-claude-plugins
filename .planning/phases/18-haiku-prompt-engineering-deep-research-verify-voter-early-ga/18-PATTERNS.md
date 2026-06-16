# Phase 18: Haiku prompt-engineering deep research + verify-voter + early gating eval - Pattern Map

**Mapped:** 2026-06-16
**Files analyzed:** 9 new + 1 modified (.gitignore)
**Analogs found:** 9 / 9 (every new file has a strong in-repo analog)

This is a green-field-WITHIN-an-established-codebase phase: every new artifact is a NEW
instance of an EXISTING shape in this exact plugin. There is no "no analog" tier -- the
zero-dep aggregator, its `.test.mjs`, the committed `__fixtures__/` layout, the three Opus
agent files, the `references/*.md` house-style, and the `.gitignore` all already exist and are
the binding patterns. The planner should treat the analogs as the literal templates to copy.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` (EVAL-05) | reference doc | transform (research -> prose contract) | `references/lz-deep-research-schema.md` (+ `verify-target-selection.md`) | role-match (house-style) |
| `plugins/lz-advisor/references/lz-eval-lock-rule.md` (EVAL-04) | reference doc | transform (pre-registered thresholds) | `references/lz-deep-research-schema.md` | role-match (house-style) |
| `plugins/lz-advisor/agents/research-verify-voter-sonnet.md` (D-09, ship default) | agent | request-response (one isolated vote) | `agents/advisor.md` (+ structure of `reviewer.md`/`security-reviewer.md`) | exact (agent frontmatter + output contract) |
| `plugins/lz-advisor/agents/research-verify-voter-haiku.md` (D-08/D-09, behind flag) | agent | request-response (one isolated vote) | `agents/research-verify-voter-sonnet.md` (its own sibling) + `agents/advisor.md` | exact |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-eval-aggregate.mjs` (EVAL-02/04, D-06/D-07) | utility (script) | batch / transform (off-model reduce) | `scripts/lz-deep-research-aggregate.mjs` | exact (same dir, same spine) |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-eval-aggregate.test.mjs` | test | unit | `scripts/lz-deep-research-aggregate.test.mjs` | exact |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-eval-dataset.mjs` (EVAL-01, D-04) | utility (loader) | file-I/O + network (HF fetch + sha256) | `scripts/lz-deep-research-aggregate.mjs` (IO/hardening half only) | role-match (no network analog exists) |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-eval-dataset.test.mjs` | test | unit | `scripts/lz-deep-research-aggregate.test.mjs` | exact |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/lz-eval-manifest.json` + `wice-vendored/` + `NOTICE` | config / fixture (committed data) | file-I/O | `scripts/__fixtures__/*/` per-file fixture tree | exact (layout) |
| `.gitignore` (MODIFIED -- add eval cache entry) | config | file-I/O | `.gitignore` (existing "Eval pipeline outputs" block) | exact |

**Directory choice (D-10, Claude's Discretion):** RESEARCH proposes `scripts/__fixtures__/` vs an
`eval/` sibling. The existing committed-fixture convention lives at
`scripts/__fixtures__/<case>/{claims,excerpts,votes}/`, so `scripts/__fixtures__/` is the
established analog. The planner picks; this map documents the existing precedent.

## Pattern Assignments

### `scripts/lz-eval-aggregate.mjs` (utility, batch/transform) -- THE primary analog match

**Analog:** `scripts/lz-deep-research-aggregate.mjs` (same directory, frozen, 30+ fixtures).
RESEARCH Pattern 3 makes this a HARD convention, not a suggestion: "The new `lz-eval-*.mjs`
scripts MUST inherit the proven patterns."

**Imports pattern -- zero-dep, node:* only** (`lz-deep-research-aggregate.mjs:22-24`):
```javascript
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
```
Add for the eval aggregator/loader: `import { createHash } from 'node:crypto';` (sha256) and
the global `fetch` (no import). NEVER a third-party import -- the `SC-2 zero-dependency contract`
test (`lz-deep-research-aggregate.test.mjs:677-719`) walks to the repo root asserting NO
`package.json` AND that every `from '...'` is `node:` / `./` / `../`.

**Frozen named-constants block** (copy the `CEILINGS` shape, `lz-deep-research-aggregate.mjs:115-121`):
```javascript
export const CEILINGS = Object.freeze({
  ANGLES: 5,
  MAX_FETCH: 15,
  MAX_VERIFY_CLAIMS: 24,
  VOTES_PER_CLAIM: 3,
  SYNTH_CAP: 20,
});
```
The eval aggregator's analog is a frozen `Object.freeze({ ... })` of eval thresholds/constants
(e.g. `ALPHA: 0.05`, `RELIABLE_TRIALS: 15`, `MIN_K: 5`, `ESCALATION_KILL_FRAC` band, the
strata fractions). "enforced in code requires a concrete number" -- the prose `~` in decisions
becomes concrete integers here. The test asserts `Object.isFrozen(...)` (analog test
`lz-deep-research-aggregate.test.mjs:568`).

**Fail-closed IO + ContractError** (copy verbatim, `lz-deep-research-aggregate.mjs:128-181`):
```javascript
export class ContractError extends Error {
  constructor(message, file) {
    super(message);
    this.name = 'ContractError';
    this.file = file;
  }
}
export function stripBom(s) {
  return typeof s === 'string' && s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}
function readJson(p) {
  let text;
  try { text = stripBom(readText(p)); }
  catch (err) { throw new ContractError('cannot read file: ' + err.message, p); }
  try { return JSON.parse(text); }
  catch (err) { throw new ContractError('malformed JSON: ' + err.message, p); }
}
```
The loader parses UNTRUSTED downloaded JSONL (RESEARCH Security Domain V5) -- it MUST route every
parse through this `ContractError`-on-failure pattern, never a bare `JSON.parse`. Per RESEARCH the
manifest fields/strata are computed off-model and the gate is deterministic, so the same
`.file`-carrying discipline applies.

**`safeId` path-traversal guard** (copy verbatim, `lz-deep-research-aggregate.mjs:149-163`): reuse
for any content-derived basename (example `uid`, cache filename). The fixture-derived id rule and
the Windows reserved-device-name guard are already covered by tests
`lz-deep-research-aggregate.test.mjs:827-854` (L-1) -- mirror them.

**Sorted-listing determinism + injectable `readdir` seam** (`lz-deep-research-aggregate.mjs:192-209`):
the `listJson(dir, readdir = fs.readdirSync)` injectable seam exists SO the `.sort()`
determinism can be proven host-independently (the manifest example order, the per-stratum
counting must be reproducible). Copy the seam if the eval aggregator lists files.

**Guarded thin CLI -- import does NOT run the CLI** (copy verbatim, `lz-deep-research-aggregate.mjs:721-741`):
```javascript
/* node:coverage disable */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  // ... single positional arg; exit 0 on success, 2 on ContractError ...
}
/* node:coverage enable */
```
Pure exported functions ABOVE the guard so the `.test.mjs` imports them without invoking the CLI.

**The ONE hand-roll exception (RESEARCH "Don't Hand-Roll"):** the Clopper-Pearson upper bound
(`logGamma` Lanczos + `incbeta` Lentz + `betaInv` bisection) is supplied verbatim in
RESEARCH lines 365-417 and MUST be pasted as a frozen numerical primitive with its own fixture
anchors (`betaInv(0.2,3,3)~=0.327`; `clopperPearsonUpper(0,15)~=0.218`). The Pass@1/Pass^k
`comb`/`passAtK`/`passHatK` closed forms are in RESEARCH lines 343-353. These are the only new
math the aggregator adds on top of the analog's structure.

---

### `scripts/lz-eval-aggregate.test.mjs` and `scripts/lz-eval-dataset.test.mjs` (test, unit)

**Analog:** `scripts/lz-deep-research-aggregate.test.mjs` (exact).

**Imports + host-quirk header** (`lz-deep-research-aggregate.test.mjs:14-35`):
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { /* exports under test */ } from './lz-eval-aggregate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const fx = (name) => path.join(HERE, '__fixtures__', name);
```
COPY the load-bearing comment that the phase gate MUST use the explicit `.test.mjs` FILE form
(lines 14-18) -- the `node --test <dir>` form spuriously exits 1 on this host (D-10, memory
`node-test-dir-exit1-quirk`). RESEARCH Validation Architecture pins the quick-run command to the
explicit file path.

**Fixture resolution** (`lz-deep-research-aggregate.test.mjs:32-35`): resolve `__fixtures__`
test-file-relative via `fileURLToPath(import.meta.url)`, NEVER `process.cwd()` (cwd drifts under
GSD worktrees / headless `claude -p`).

**Discriminating-fixture discipline (memory `fixture-must-discriminate-ordering`, Phase 17 CR-01):**
the analog's `contested-split` test (`lz-deep-research-aggregate.test.mjs:156-165`) and its
PRECONDITION GUARD pattern (lines 74-87) are the template. For the eval, mirror this for the
SUBTLE-stratum saturation risk (RESEARCH Pitfall 2): a fixture must DISCRIMINATE -- a
`partially_supported` -> `refuted` remap test must prove the remap actually flips, not pass
tautologically. Build a vote-dir fixture where a bad claim called `unrefuted` is COUNTED as a
false-uphold and a different fixture where it is not, so the counter is genuinely exercised.

**Throwaway temp-dir + try/finally cleanup** (copy `tmpRunDirWithWorker`,
`lz-deep-research-aggregate.test.mjs:261-268`, and the `try { ... } finally { fs.rmSync(runDir,
{ recursive: true, force: true }); }` pattern used throughout): runtime/bad inputs are written to
`os.tmpdir()`, NEVER into the committed `__fixtures__` tree (WR-05, lines 259-260, 630-631). The
dataset-loader test writes a wrong-sha fixture and a mock-401 response this way.

**Fail-closed assertion shape** (`assert.throws(() => ..., /regex/)`, e.g. lines 282, 349, 906):
the dataset test asserts `assert.throws(() => load(...), /checksum mismatch/)` and the gated-401
path asserts a specific HF_TOKEN error (RESEARCH Pitfall 1 + Test Map rows D-04, Pitfall 1).
The `.file`-carrying ContractError assertion (lines 458-460: `caught.name === 'ContractError'`,
`caught.file.endsWith(...)`) is the template for naming the offending source/cache file.

**Numeric-anchor tests for the CI math:** mirror the value-pinning style (e.g. line 569
`assert.equal(CEILINGS.MAX_VERIFY_CLAIMS, 24)`) against the RESEARCH-supplied anchors:
`betaInv(0.2,3,3)~=0.327`, `betaInv(0.4,1,6)~=0.082`, `clopperPearsonUpper(0,15,0.05)~=0.218`,
plus known `passAtK`/`passHatK`/`comb` values from a shared `(n,c,k)` pool. Use
`assert.ok(Math.abs(got - expected) < 1e-3)` for the float anchors.

**Zero-dep contract test (copy verbatim, `lz-deep-research-aggregate.test.mjs:677-719`):** add the
SAME test to each new `.test.mjs` so the new scripts are also guarded against a stray import or a
`package.json` appearing. This is the structural enforcer of AGG-02 / CLAUDE.md zero-dep.

---

### `scripts/lz-eval-dataset.mjs` (utility/loader, file-I/O + network)

**Analog:** `scripts/lz-deep-research-aggregate.mjs` for the IO/hardening HALF (ContractError,
readJson, stripBom, safeId, guarded CLI, frozen constants). There is NO existing network-fetch
analog in the repo, so the FETCH half comes from RESEARCH Pattern 1 (verbatim, lines 212-242):
```javascript
import { createHash } from 'node:crypto';
async function fetchPinned({ id, revision, file, sha256, token, cacheDir }) {
  const url = `https://huggingface.co/datasets/${id}/resolve/${revision}/${file}`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(url, { headers });            // follows the 307 to the CDN by default
  if (!res.ok) {
    throw new Error(`HF fetch failed ${res.status} for ${id}@${revision}/${file} (gated? set HF_TOKEN)`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const got = createHash('sha256').update(buf).digest('hex');
  if (got !== sha256) {
    throw new Error(`checksum mismatch for ${id}/${file}: expected ${sha256} got ${got}`);
  }
  const dest = path.join(cacheDir, id.replace('/', '__'), file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);                           // cache is GITIGNORED; never committed
  return buf;
}
```
Adapt the loud `Error` to a `ContractError` carrying `.file` (the analog's discipline). The
401-gated path must surface an actionable HF_TOKEN message and exit non-zero (RESEARCH Pitfall 1),
NOT retry. Label remap (RESEARCH Pattern 2, lines 246-273): `supported -> unrefuted`,
`partially_supported -> refuted` (the SUBTLE substratum), `not_supported -> refuted` -- frozen by
the schema's `verdict` enum (see Shared Patterns below).

---

### `agents/research-verify-voter-sonnet.md` and `agents/research-verify-voter-haiku.md` (agent, request-response)

**Analog:** `agents/advisor.md` for frontmatter + visibility/trust + output-contract discipline;
the two new files are siblings (the Haiku one engineered from the EVAL-05 reference per D-08, NOT
a copy of the Sonnet prompt with the model swapped).

**Frontmatter pattern** (`agents/advisor.md:1-46`; all three existing agents share the shape):
```yaml
---
name: <kebab-case>
description: |
  Use this agent when ...   # third person; <example> blocks with <commentary>
  <example>
  Context: ...
  user: "..."
  assistant: "..."
  <commentary>...</commentary>
  </example>
model: opus
color: magenta
effort: high
tools: ["Read", "Glob"]
maxTurns: 3
---
```
Voter-specific deltas (RESEARCH "Voter agent structure", lines 491-511):
- `model: sonnet` (sonnet file) / `model: haiku` (haiku file) -- the ONLY load-bearing capability
  difference; same dataset + grader so the eval measures MODEL, not prompt (D-08).
- `tools`: `["WebSearch", "WebFetch", "Write"]` for the open-book arm, `["Write"]` for the
  closed-book control (the existing agents use `["Read", "Glob"]` and never Write -- voters DO
  write the vote file, so the tool grant differs by design / least-privilege per arm).
- `color`: pick two unused colors (existing: magenta/cyan/yellow).
- Keep `maxTurns` bounded and an `effort` value (RESEARCH H10 bounded-reasoning; Haiku "excels at
  focused, bounded tasks").

**Output-contract discipline** (advisor `## Output Constraint`, `agents/advisor.md:51-101`): the
existing agents pin an EXACT machine-parsed output shape ("Begin your response with ...", "Emit
them exactly as shown", `(none)` empty markers). The voter's analog is the FROZEN vote JSON --
emit EXACTLY:
```json
{ "verdict": "unrefuted",
  "attack_mode": "scope-causality-overclaim",
  "disconfirming_query": "evidence that X does NOT reduce Y",
  "source_independence_note": "3 hits, 1 canonical source (syndicated) -> counts as 1" }
```
`verdict` is the frozen consumed core (`unrefuted` | `refuted`); the envelope is additive-only
(schema D-09/D-10, see Shared Patterns). Use the advisor's `<example>` / `### Density example`
pattern (lines 86-100) to give the voter 3-5 few-shot examples INCLUDING disconfirming examples
(RESEARCH H2): a `partially_supported` claim correctly returned `refuted` with the negation search
shown.

**Haiku-prompt corrections to APPLY (vs the existing Opus agents' style)** -- RESEARCH State of the
Art + Anti-Patterns: the existing agents use some aggressive `MUST` / `NEVER` framing that is fine
at Opus but OVERTRIGGERS at Haiku 4.6-era. The Haiku voter MUST use plain phrasing ("Use ... when
...", "Return `refuted` when ...") not `CRITICAL/MUST/NEVER` (RESEARCH H5/H6/H11). NO `budget_tokens`,
NO prefill (both stale -- RESEARCH State of the Art table). These corrections come from the EVAL-05
reference doc (deliverable 1), authored BEFORE the Haiku agent (D-08).

---

### `references/lz-haiku-prompt-engineering.md` (EVAL-05) and `references/lz-eval-lock-rule.md` (EVAL-04)

**Analog:** `references/lz-deep-research-schema.md` (the canonical-home, copy-from-code,
anti-drift house style) and `references/verify-target-selection.md` (the "single source of truth
for X; both consumers reference this file" framing).

**House-style opener** (`references/lz-deep-research-schema.md:1-10`,
`references/verify-target-selection.md:1-12`):
- Lead sentence: "This is the single source of truth for ..." naming what it freezes and WHO
  consumes it.
- Name downstream consumers explicitly (the schema names Phase 18/19/20 with WHAT each reads).
- For `lz-eval-lock-rule.md`: state it is written BEFORE any model call (EVAL-04), enumerate the
  exact thresholds (SUBTLE open-book false-uphold DELTA upper-CI ~0; cost gate escalation
  > 40-50%; reliable=15 on PASS; raise-to-user on FAIL), and that it is mechanically enforced by
  `lz-eval-aggregate.mjs`. Mirror the schema's "the code is authoritative; the doc copies
  byte-for-byte" anti-drift discipline (lines 29-53) -- the lock rule's numbers MUST match the
  aggregator's frozen constants.
- For `lz-haiku-prompt-engineering.md`: each technique = WHAT / WHY-it-helps-a-cheap-model /
  VERIFIED-source, exactly the table shape RESEARCH already drafted (H1-H12, lines 472-485). Open
  with the D-08 fairness framing (RESEARCH line 489): the Haiku prompt is engineered to the SAME
  task contract as the Sonnet baseline.

**ASCII-only + plugin-root refs** (CLAUDE.md; schema uses `${CLAUDE_PLUGIN_ROOT}/...` at line 8):
no emojis / em-dashes / curly quotes; reference scripts via `${CLAUDE_PLUGIN_ROOT}`.

---

### `scripts/__fixtures__/lz-eval-manifest.json` + `wice-vendored/` + `NOTICE` (config/fixture)

**Analog:** the committed per-file fixture tree at
`scripts/__fixtures__/<case>/{claims,excerpts,votes}/` (e.g. `near-duplicate-merged/claims/w1.json`
is a single-line JSON record). The eval fixtures follow the SAME immutable, per-file, committed
layout. The manifest shape is RESEARCH Pattern 2 (lines 251-271): `schema_version`, `strata`,
`sources` (id / revision / files+sha256 / vendored / gated), `examples[]` (uid / source /
source_label / stratum / book / expected_verdict). Vendored WiCE lands under
`__fixtures__/wice-vendored/` with a `NOTICE` (D-04 ODC-BY/MIT attribution). NON-vendored corpora
(LLM-AggreFact, AVeriTeC) are NEVER committed -- only the manifest's IDs + remapped labels + pinned
revision + sha256 (D-04 license compliance).

---

### `.gitignore` (MODIFIED)

**Analog:** the existing `.gitignore` "Eval pipeline outputs" block:
```
# Eval pipeline outputs (regenerated on re-run)
evals/**/outputs/
```
Add the eval cache entry in the same comment-then-glob style (RESEARCH lines 581-590; name is
Claude's Discretion):
```
# Eval dataset cache (fetched at eval time; license-compliant local-only; never committed)
/.lz-eval-cache/
```
The `SC-2 zero-dependency contract` test's repo-root walk is unaffected (the cache holds data,
not a `package.json`). The committed manifest + vendored WiCE stay IN the repo; the fetched
LLM-AggreFact / AVeriTeC text goes ONLY to this gitignored cache.

## Shared Patterns

### Zero-dependency contract (applies to BOTH new scripts + BOTH new test files)
**Source:** `scripts/lz-deep-research-aggregate.test.mjs:677-719` (the `SC-2` test) + AGG-02 / CLAUDE.md.
Every new `.mjs` imports ONLY `node:*` / `./` / `../`; no `package.json` anywhere up to the repo
root. The hand-rolled CI math + the `node:crypto` sha256 + the global `fetch` are the deliberate
"don't hand-roll EXCEPT here" inversion (RESEARCH "Don't Hand-Roll" key insight). Copy this test
into each new `.test.mjs`.

### Fail-closed ContractError with `.file` (applies to aggregator + loader)
**Source:** `scripts/lz-deep-research-aggregate.mjs:128-181` (`ContractError`, `stripBom`,
`readJson`, `safeId`). Every parse / read / content-derived-basename path fails CLOSED and carries
the offending file; the CLI maps it to exit 2. The loader's untrusted downloaded JSONL and the
checksum-mismatch / gated-401 paths all route through this (RESEARCH Security Domain V5).

### Explicit `.test.mjs` FILE-form gate (applies to BOTH new test files)
**Source:** `scripts/lz-deep-research-aggregate.test.mjs:14-18` + memory `node-test-dir-exit1-quirk`
+ CONTEXT D-10. NEVER `node --test <dir>`; gate on `node --test <explicit-file.test.mjs>` per file.
RESEARCH Validation Architecture pins the per-task and per-wave commands to explicit file paths.

### Frozen vote-record contract (applies to BOTH voter agents + the eval aggregator)
**Source:** `references/lz-deep-research-schema.md:184-223` ("The vote record"). `verdict` is
`"unrefuted" | "refuted"`, read by `tally` via `readJson(f).verdict`; missing/`null` -> `insufficient`.
The voters fill the reserved ADDITIVE envelope (`attack_mode`, `disconfirming_query`,
source-independence note, lines 210-222) WITHOUT changing `verdict`. The eval aggregator scores
`verdict` vs gold label only (grade outcomes, not steps -- D-09). The label remap target enum
(`unrefuted`/`refuted`) is THIS frozen enum, not a new one.

### Discriminating-fixture discipline (applies to BOTH new test files)
**Source:** memory `fixture-must-discriminate-ordering` + `scripts/lz-deep-research-aggregate.test.mjs:74-87`
(precondition guard) and `:156-165` (the contested-split ordering guard). Every fixture must
genuinely exercise the behavior it claims (no tautology). For the SUBTLE stratum this is
load-bearing: RESEARCH Pitfall 2 (saturated/non-discriminating gate = the exact prior-phase
failure). The aggregator's false-uphold counter, the label remap, and the DELTA must each have a
fixture that FAILS if the logic is removed/swapped.

### ASCII-only output + `${CLAUDE_PLUGIN_ROOT}` references (applies to ALL new files)
**Source:** CLAUDE.md shell rules + `references/lz-deep-research-schema.md:8`. No emojis,
em-dashes, en-dashes, curly quotes, ellipsis, or box-drawing in any file (Windows cp1252). The
aggregator even writes the BOM only as the JS escape `\uFEFF` (source) / `String.fromCharCode(0xFEFF)` (test), never as a literal
byte (`lz-deep-research-aggregate.mjs:16-17`, test `:20-21`) -- mirror this if the loader/test
must emit a BOM/CRLF byte sequence (generate at runtime under `os.tmpdir()`, never commit it).

## No Analog Found

None. Every new file is a new instance of an established in-repo shape. The single capability with
no prior in-repo example is the HuggingFace HTTPS fetch + sha256 verify inside
`lz-eval-dataset.mjs`; its pattern is supplied verbatim by RESEARCH Pattern 1 (lines 212-244) and
its hardening half still copies the aggregator's ContractError/safeId discipline, so it is a
role-match rather than a true no-analog. The Clopper-Pearson / Pass@k math is new code but is a
frozen numerical primitive supplied verbatim by RESEARCH (lines 343-433), not a pattern to mine
from the codebase.

## Metadata

**Analog search scope:** `plugins/lz-advisor/agents/`, `plugins/lz-advisor/references/`,
`plugins/lz-advisor/skills/lz-deep-research/scripts/` (+ `__fixtures__/`), repo-root `.gitignore`.
**Files scanned:** 3 agent files, 5 reference docs, the aggregator + its `.test.mjs`, the
schema reference, the committed `__fixtures__/` tree (one record sampled), `.gitignore`.
**Pattern extraction date:** 2026-06-16
