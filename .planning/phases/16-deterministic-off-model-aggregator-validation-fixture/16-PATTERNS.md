# Phase 16: Deterministic off-model aggregator + validation fixture - Pattern Map

**Mapped:** 2026-06-15
**Files analyzed:** 3 file groups to CREATE (aggregator, test, fixture run-dirs)
**Analogs found:** 2 strong (aggregator, fixture data) / 3 -- the `node:test` file has NO in-repo analog (net-new pattern)

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` | utility (off-model reducer; pure functions + thin CLI) | file-I/O -> batch transform (read run-dir -> dedup/recheck/cap/tally -> write `survivors.json` + stdout receipt) | `plans/_spike/aggregate-spike.mjs` (the proven prototype this phase hardens) | exact (same role + data flow; harden + extend, do NOT rewrite) |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` | test (`node:test` fixture) | request-response (import pure fns, call `aggregate(fixtureDir)`, assert) | NONE in repo. `tests/*.sh` are a DIFFERENT domain (bash word-budget gates for review skills). Use RESEARCH.md guidance 1 + Code Examples skeleton instead. | no-analog (net-new pattern) |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/__fixtures__/<case>/{claims,excerpts,votes}/` | test data (committed immutable run-dir cases) | file-I/O (static input data the aggregator reads) | `plans/_spike/run/{claims,excerpts,votes}` (the proven seed layout + shapes) | exact for the baseline case; ADD new cases (downgrade, paraphrase-one-source, ceilings) |

**Critical classification note for the planner:** this is the plugin's FIRST `scripts/` directory and FIRST `node --test`. There is NO `package.json` anywhere in the repo (verified by glob -- zero-dep is the contract, AGG-02), NO existing `.test.mjs`, and the `lz-deep-research` skill directory does not yet exist (greenfield -- existing skills are `lz-execute`/`lz-plan`/`lz-review`/`lz-security-review`). The ONLY load-bearing analog is the spike prototype; everything else is net-new Node stdlib mechanics from RESEARCH.md.

---

## Pattern Assignments

### `lz-deep-research-aggregate.mjs` (utility, file-I/O -> batch transform)

**Analog:** `plans/_spike/aggregate-spike.mjs` (spike A1, PASS). The proven deterministic core to HARDEN + EXTEND + SPLIT into pure functions. Below are the EXACT prototype excerpts so each plan task can say "preserve this proven logic, change only X".

**Imports pattern** (spike lines 8-9):
```js
import fs from 'node:fs';
import path from 'node:path';
```
CHANGE for production (RESEARCH Standard Stack + Don't-Hand-Roll): ADD `import { fileURLToPath } from 'node:url';` and REPLACE the spike's fragile drive-letter regex self-location (spike line 11: `import.meta.url.pathname.replace(/^\/([A-Za-z]:)/, '$1')`) with `fileURLToPath(import.meta.url)`. Keep `node:fs` + `node:path`; add NOTHING else (zero-dep, AGG-02).

**Number-word fold + `norm` -- PRESERVE the map verbatim, RENAME `norm`->`normalize`, ADD BOM/CRLF strip** (spike lines 48-52):
```js
const NUMWORDS = { zero:'0',one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',twenty:'20',thirty:'30',forty:'40',fifty:'50',hundred:'100' };
const norm = s => s.toLowerCase()
  .replace(/[^a-z0-9 ]+/g, ' ')
  .split(/\s+/).map(w => NUMWORDS[w] ?? w).filter(w => w && w !== 'percent').join(' ')
  .trim();
```
HARDEN per D-04 + RESEARCH guidance 2: prepend `.replace(/^\uFEFF/, '').replace(/\r\n/g,'\n').replace(/\r/g,'\n')` BEFORE `.toLowerCase()` for explicit BOM-strip + LF normalization. Export it. This is the single comparison primitive used by both `jaccard` and `quoteOutcome` (do NOT normalize at read time only -- both quote and excerpt must flow through the SAME `normalize`).

**Jaccard + quote-in-excerpt -- PRESERVE verbatim, export, build on top** (spike lines 53-55):
```js
const toks = s => new Set(norm(s).split(' ').filter(Boolean));
const jaccard = (a, b) => { const A = toks(a), B = toks(b); let i = 0; for (const t of A) if (B.has(t)) i++; return i / (A.size + B.size - i); };
const quoteInExcerpt = (quote, excerpt) => norm(excerpt).includes(norm(quote));
```
`jaccard` transfers UNCHANGED (>= 0.6 merge threshold is D-07-locked). `quoteInExcerpt` is the binary primitive that `quoteOutcome` (D-05) wraps into three-way verified/downgraded/dropped -- see extension below.

**Immutable per-worker merge loop + corroboration Set -- PRESERVE the structure, this is the D-08 mechanism** (spike lines 58-72):
```js
function mergeClaims() {
  const files = fs.readdirSync(path.join(ROOT, 'claims')).filter(f => f.endsWith('.json'));
  const raw = [];
  for (const f of files) {
    const w = JSON.parse(fs.readFileSync(path.join(ROOT, 'claims', f), 'utf8'));
    for (const c of w.claims) raw.push({ ...c, source: w.source });
  }
  // dedup -> clusters with corroboration
  const clusters = [];
  for (const c of raw) {
    const hit = clusters.find(cl => jaccard(cl.text, c.text) >= 0.6);
    if (hit) { hit.members.push(c); hit.sources.add(c.source); }
    else { clusters.push({ id: 'cluster' + clusters.length, text: c.text, members: [c], sources: new Set([c.source]) }); }
  }
  return clusters;
}
```
HARDEN per RESEARCH guidance 4/6 + Pitfall 1: (a) `.sort()` the `readdirSync` file list for reproducibility (AGG-01); (b) the `sources` Set is ALREADY the distinct-source corroboration mechanism (D-08) -- `cluster.sources.size` is the corroboration count (a LOWER bound, D-09 -- two paraphrases from ONE source -> `sources.size === 1`, not 2); (c) take `runDir` as a parameter (not the module-level `ROOT`) so it is a pure function; (d) wrap `JSON.parse` in try/catch -> non-zero exit naming the bad file (D-03, V5 input validation). Keep the UNDER-merge bias (D-07).

**Quote re-check -- the binary baseline to EXTEND to three-way** (spike lines 76-88):
```js
function recheck(clusters) {
  const kept = [], dropped = [];
  for (const cl of clusters) {
    // a cluster survives re-check if AT LEAST ONE member quote is found in its stored excerpt
    const verified = cl.members.filter(m => {
      const ex = fs.readFileSync(path.join(ROOT, 'excerpts', m.excerpt_id + '.txt'), 'utf8');
      return quoteInExcerpt(m.quote, ex);
    });
    if (verified.length > 0) kept.push({ ...cl, verifiedSources: [...new Set(verified.map(m => m.source))] });
    else dropped.push({ id: cl.id, text: cl.text, reason: 'quote-not-in-stored-excerpt' });
  }
  return { kept, dropped };
}
```
EXTEND to three-way `quoteOutcome(member, excerptsById, allExcerpts)` per D-05 + RESEARCH guidance 3 -- replace the binary `quoteInExcerpt` filter with: in CITED excerpt -> `verified`; absent from cited but in SOME other excerpt -> `downgraded`; absent everywhere -> `dropped`. Pre-normalize each excerpt ONCE into a `Map<excerpt_id, normalize(text)>` + an array of all normalized values (O(members x excerpts) on already-normalized strings). Cluster survives if it has >= 1 `verified` OR `downgraded` member; all-`dropped` cluster is dropped. Runs UPSTREAM of tally (D-06) -- every outcome surfaced as a count BEFORE any vote. PATH-SAFETY (V12): treat `excerpt_id` as a basename only -- reject separators / `..` before `path.join`.

**Vote tally rubric -- PRESERVE the rubric, cap seats at VOTES_PER_CLAIM** (spike lines 91-104):
```js
function tally(cl) {
  const seats = ['0', '1', '2'].map(s => {
    const fByCluster = path.join(ROOT, 'votes', cl.id + '-' + s + '.json');
    const fByMember = path.join(ROOT, 'votes', cl.members[0].id + '-' + s + '.json');
    const f = fs.existsSync(fByCluster) ? fByCluster : (fs.existsSync(fByMember) ? fByMember : null);
    return f ? JSON.parse(fs.readFileSync(f, 'utf8')).verdict : 'insufficient';
  });
  const refuted = seats.filter(v => v === 'refuted').length;
  const unrefuted = seats.filter(v => v === 'unrefuted').length;
  if (refuted >= 2) return 'Rejected';
  if (unrefuted === 3) return 'High';
  if (unrefuted === 2) return 'Medium';
  return 'Low/Contested';
}
```
The cluster-id-then-member-id vote-file fallback transfers directly. The 3 seats ARE `VOTES_PER_CLAIM = 3` (D-10) -- read at most that many seats; seats `-3`, `-4`... ignored deterministically and counted as `votes_ignored: K` if present (D-11). Confidence labels (`High`/`Medium`/`Low/Contested`/`Rejected`) are load-bearing -- Phase 17 freezes them; RESEARCH guidance 6 recommends also expressing `Unsupported`. Preserve the rubric arithmetic.

**Run/output pattern -- the spike's INLINE driver is what D-16 SPLITS** (spike lines 107-129):
```js
seed();
const clusters = mergeClaims();
const { kept, dropped } = recheck(clusters);
const survivors = kept.map(cl => ({ claim: cl.text, sources: cl.verifiedSources, confidence: tally(cl) }));
fs.writeFileSync(path.join(ROOT, 'survivors.json'), JSON.stringify(survivors, null, 2));
console.log('raw worker files: 3 -> clusters: ' + clusters.length + ' (dup merged: ' + (3 - clusters.length) + ')');
// ...inline assertions...
process.exit(a1 && a2 && a3 ? 0 : 1);
```
REFACTOR per D-16: DELETE `seed()` (fixtures are committed files, NOT self-seeded -- memory `project_phantom_smoke_fixtures`); DELETE the inline `a1/a2/a3` assertions + the assertion-driven `process.exit` (the FIXTURE asserts correctness now, not the CLI). Wrap the pipeline in `export function aggregate(runDir)` returning `{ survivors, dropped, summary, caps, ... }`. Guard CLI side-effects behind the `import.meta`-vs-`process.argv` check (RESEARCH Pattern 1) so the test can import without running the CLI. The spike's 2-space `JSON.stringify(..., null, 2)` write style transfers (Claude's Discretion).

**Survivor record shape -- spike baseline, ADD frozen fields** (from `plans/_spike/run/survivors.json`):
```json
[ { "claim": "X reduces Y by 30%", "sources": ["s1","s2"], "confidence": "High" } ]
```
EXTEND per RESEARCH guidance 6 (A3 -- LOAD-BEARING, Phase 17 freezes, Phase 18/20 consume): `{ id, claim, sources: [...], corroboration_lower_bound: N, quote_fidelity: 'verified'|'downgraded', confidence: 'High'|'Medium'|'Low/Contested'|'Unsupported' }`. Do NOT add the entailment/second-assurance field (that is Phase 17). Output is bounded top <= `SYNTH_CAP` (D-03).

**Ceilings + observable caps -- NET-NEW (no spike equivalent), use RESEARCH guidance 5**:
```js
export const CEILINGS = Object.freeze({
  ANGLES: 5, MAX_FETCH: 15, MAX_VERIFY_CLAIMS: 24, VOTES_PER_CLAIM: 3, SYNTH_CAP: 20,
});
```
Single frozen constants block (D-10). `enforceCeilings` caps AFTER ranking, records every cap as a count (`claims 31->24`, `synth 22->20`) -- NO silent truncation (D-11). Aggregator ACTIVELY enforces `MAX_VERIFY_CLAIMS`/`VOTES_PER_CLAIM`/`SYNTH_CAP`; CARRIES `ANGLES`/`MAX_FETCH` as the shared contract (Phase-20 orchestrator enforces those at wave dispatch). Rank by corroboration desc with a deterministic tiebreak (normalized-text lexical order) for reproducibility.

**stdout receipt -- bounded deterministic COUNTS only, never raw text** (D-03, RESEARCH guidance 6):
```
raw: 31 -> clusters: 24 (merged: 7)
quote-recheck: verified 20 | downgraded 2 | dropped 2
capped: claims 31->24 | synth 22->20
survivors: 20 (High 12, Medium 5, Low/Contested 3)
```
Exact wording is Claude's Discretion; the contract is bounded + deterministic + every drop/downgrade/cap observable as a count. Exit `0` on success, non-zero (recommend `2`) on contract violation (missing run-dir, malformed worker JSON).

---

### `lz-deep-research-aggregate.test.mjs` (test, `node:test`)

**Analog:** NONE in this repo. **Do NOT point the planner at `tests/*.sh`.** Those (`D-reviewer-budget.sh`, `D-security-reviewer-budget.sh`, `validate-phase-03.sh`, `validate-phase-04.sh`) are bash + awk + sed WORD-BUDGET gates that self-extract grouped-severity markdown from the review/security-review AGENT files and assert per-section word caps. Different language (bash), different domain (text-parse budget gates for review skills), different input (agent markdown, not JSON run-dirs). They share ZERO structure with a Node JSON aggregator test. CLAUDE.md shell rules (no heredoc / risky quoting / CRLF hazards) are exactly WHY D-13 chose `node:test` over a bash harness.

**Use the RESEARCH.md net-new skeleton instead** (RESEARCH Code Examples, lines 423-453; guidance 1):
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aggregate, normalize, CEILINGS } from './lz-deep-research-aggregate.mjs';
const fx = (n) => path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__', n);

test('SC5-1 fabricated quote dropped upstream of voting', () => {
  const r = aggregate(fx('fabricated-quote-dropped'));
  assert.ok(r.summary.includes('dropped 1') || r.dropped.length === 1);
});
test('SC5-2 real-quote/wrong-passage downgraded (kept, lowered)', () => {
  const r = aggregate(fx('wrong-passage-downgraded'));
  assert.ok(r.survivors.some(s => s.quote_fidelity === 'downgraded'));
});
test('SC5-3 paraphrase pair from one source NOT counted as 2', () => {
  const r = aggregate(fx('paraphrase-one-source'));
  assert.equal(r.survivors[0].corroboration_lower_bound, 1);
});
test('SC5-4 near-duplicate pair from two sources merged', () => {
  const r = aggregate(fx('near-duplicate-merged'));
  assert.equal(r.survivors[0].corroboration_lower_bound, 2);
});
test('SC5-5 over-ceiling input capped observably', () => {
  const r = aggregate(fx('ceilings-enforced'));
  assert.ok(/claims \d+->24/.test(r.summary));
});
```
Key mechanics the planner must honor: (1) resolve `__fixtures__` via `fileURLToPath(import.meta.url)`, NEVER `process.cwd()` (Pitfall 3 -- cwd drifts under GSD worktrees/headless `claude -p`; reinforced by CLAUDE.md worktree-cwd-drift memory); (2) run via `node --test` (host is Node v24.13.0, `node:test` fully stable, NO `--experimental` flag); (3) exit-code-on-failure IS the gate -- `node --test` exits 0 iff all green; (4) cover all 5 SC-5 behaviors PLUS the RESEARCH-flagged hardening sub-assertions: `normalize('\uFEFFThirty percent\r\n') === '30'` (BOM/CRLF/number-word), a CRLF excerpt still matching an LF quote (Layer A+B proof), `aggregate(fx)` deep-equals a second call (reproducibility / AGG-01), and `Object.isFrozen(CEILINGS)`.

---

### `__fixtures__/<case>/{claims,excerpts,votes}/` (test data, file-I/O)

**Analog:** `plans/_spike/run/{claims,excerpts,votes}` -- the PROVEN immutable run-dir layout + the exact JSON/`.txt` shapes. Seed the baseline case from it, then ADD the new cases. These are REAL committed files authored fresh via the Write tool (NOT bash heredoc; NOT self-seeded; NOT phantom-referenced -- memory `project_phantom_smoke_fixtures`).

**`claims/<worker-id>.json` shape -- single-line JSON, transfers directly** (`plans/_spike/run/claims/w1.json`, `w2.json`, `w3.json`):
```json
{"worker":"w1","source":"s1","claims":[{"id":"c1","text":"X reduces Y by 30%","quote":"X reduces Y by 30%","excerpt_id":"e1"}]}
{"worker":"w2","source":"s2","claims":[{"id":"c2","text":"X reduces Y by thirty percent","quote":"30% reduction in Y","excerpt_id":"e2"}]}
{"worker":"w3","source":"s3","claims":[{"id":"c3","text":"X completely cures Z","quote":"X cures Z completely","excerpt_id":"e3"}]}
```
Per-claim fields are LOAD-BEARING (Phase 17 freezes): `id`, `text`, `quote`, `excerpt_id`; per-worker: `worker`, `source`. The c1+c2 pair (near-dup, DIFFERENT sources `s1`/`s2`) IS the `near-duplicate-merged` case (corroboration 2). c3's quote (`X cures Z completely`) is absent from e3 -> the `fabricated-quote-dropped` case.

**`excerpts/<excerpt-id>.txt` shape -- plain UTF-8 text** (`plans/_spike/run/excerpts/e1.txt`):
```
The randomized study found that X reduces Y by 30% across all trials.
```

**`votes/<id>-<seat>.json` shape** (`plans/_spike/run/votes/cluster0-0.json`):
```json
{"verdict":"unrefuted"}
```
One file per (claim-or-cluster id) x seat (`cluster0-0`, `cluster0-1`, `cluster0-2`, `c3-0`...). Verdict vocabulary: `unrefuted` / `refuted` / (missing -> `insufficient`).

**NEW cases to AUTHOR (no spike seed -- net-new fixture data, D-15):**
- `wrong-passage-downgraded/` -- a claim whose `quote` is ABSENT from its cited `excerpt_id` but verbatim-PRESENT in a DIFFERENT committed excerpt -> asserts `quote_fidelity === 'downgraded'` (kept, lowered; NOT dropped).
- `paraphrase-one-source/` -- TWO claim files (or two claims) with the SAME `source` id, paraphrased text (`"X reduces Y by 30%"` and `"X cuts Y thirty percent"`) -> asserts the cluster's `corroboration_lower_bound === 1` (NOT 2). Contrast with the near-dup case (different sources -> 2).
- `ceilings-enforced/` -- OVER-ceiling input (e.g. > 24 distinct clusters, or a 4th vote seat) -> asserts `/claims \d+->24/` appears in the summary AND the cap fired.
- A deliberate-CRLF excerpt (the ONLY legitimate place a `\r\n` / `U+FEFF` byte appears, and only inside a fixture `.txt` -- never in source or markdown) to prove the Layer A+B newline/BOM normalization on the actual host.

---

## Shared Patterns

### Zero external dependencies (Node stdlib only)
**Source:** `plans/_spike/aggregate-spike.mjs` (uses ONLY `node:fs` + `node:path`); confirmed NO `package.json` anywhere in repo (glob returned nothing).
**Apply to:** all three files. Allowed imports: `node:fs`, `node:path`, `node:url`, `node:test`, `node:assert/strict`. Any non-`node:` import or a new `package.json` is a constraint violation (AGG-02) -- reject it. The test may even assert no non-`node:` import exists in the aggregator source (RESEARCH SC-2 row).

### CRLF / BOM / UTF-8 / LF safety (Windows arm64 / Git Bash)
**Source:** hardened from the spike's `norm` (lines 49-52) + RESEARCH guidance 2.
**Apply to:** the aggregator's `normalize` (BOM-strip + CRLF->LF inside the function) AND every file read (`fs.readFileSync(p, 'utf8')`; `stripBom` BEFORE `JSON.parse` because `JSON.parse` throws on a leading BOM). The fixture `.txt`/`.json` files must be authored with the Write tool (predictable line endings) -- never bash heredoc (CLAUDE.md shell rules).

### `fs.readdirSync` + `path.join`, NO shell globbing
**Source:** spike `mergeClaims` (line 59) and `merge.mjs` (the A2 permission proof: `fs.readdirSync(dir).filter(f => f.endsWith('.json'))`).
**Apply to:** all directory enumeration in the aggregator. ADD `.sort()` for determinism (Pitfall 1 -- `readdirSync` order is OS-dependent; the spike did NOT sort, which the production hardens for AGG-01 reproducibility). Address files only via `path.join` under the supplied `<run-dir>`; treat `*_id` values as basenames (reject separators / `..` -- V12 path-traversal).

### ESM self-location via `fileURLToPath`
**Source:** RESEARCH State-of-the-Art + Don't-Hand-Roll -- REPLACES the spike's fragile drive-letter regex (`import.meta.url.pathname.replace(/^\/([A-Za-z]:)/, '$1')`, spike line 11).
**Apply to:** the aggregator's CLI direct-invocation guard (`fileURLToPath(import.meta.url) === path.resolve(process.argv[1])`) AND the test's `__fixtures__` resolution (`path.dirname(fileURLToPath(import.meta.url))`). Correct + portable on Windows/Git Bash; the regex is fragile and must go.

### Observability-as-contract (every drop/downgrade/cap is a count)
**Source:** spike stdout (lines 113-118: `raw worker files: 3 -> clusters: 2 (dup merged: 1)`) + project memory `web_tool_usage_must_be_observable`.
**Apply to:** the aggregator's stdout summary AND `survivors.json`/`dropped` records. Mirrors the project's hard observability discipline -- the fixture and the Phase-20 orchestrator both read these counts WITHOUT parsing raw evidence. NO silent caps, NO silent drops (D-11).

### Plugin script location + invocation
**Source:** memory `reference_plugin_script_location` + CLAUDE.md PROJECT decision (aggregator lives in `skills/lz-deep-research/scripts/` NOT `bin/`, verified 2026-06-15).
**Apply to:** all three files co-locate under `plugins/lz-advisor/skills/lz-deep-research/scripts/` (D-14). At the skill layer, reference via `${CLAUDE_PLUGIN_ROOT}`; invoke as `node "<abs-path>"` (NOT bare). The script itself takes a plain path arg (D-01).

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `lz-deep-research-aggregate.test.mjs` | test (`node:test`) | request-response | Plugin's FIRST `node --test`; NO `.test.mjs` exists; the `tests/*.sh` are a DIFFERENT domain (bash word-budget gates for review-skill agent markdown). Planner uses RESEARCH.md guidance 1 + Code Examples skeleton, NOT the bash fixtures. |

---

## Metadata

**Analog search scope:** `plans/_spike/` (prototype + run-dir + A2 proof), `tests/` (confirmed wrong-domain), `plugins/lz-advisor/skills/` (existing skills; lz-deep-research not yet present), repo-wide `package.json` + `*.test.mjs` (none exist).
**Files scanned:** spike `aggregate-spike.mjs` + `merge.mjs` + all `run/{claims,excerpts,votes,survivors.json}` data files; `tests/D-reviewer-budget.sh` (domain confirmation); CONTEXT.md (D-01..D-16); RESEARCH.md (full).
**Host facts confirmed this session:** no `package.json` (zero-dep), no `.test.mjs` (net-new `node:test`), no `lz-deep-research` skill dir (greenfield).
**Pattern extraction date:** 2026-06-15
