# Phase 17: JSON schema + verification contract reference - Pattern Map

**Mapped:** 2026-06-15
**Files analyzed:** 3 (1 new doc, 2 modify-in-place)
**Analogs found:** 3 / 3 (every target has a concrete in-repo analog -- no RESEARCH-only patterns needed)

This is a CONTRACT-WRITING phase with one lockstep corrective code task. The file set is small
and fully bounded; every target copies from an existing analog (the four sibling references for
the new doc; the file ITSELF for both modify-in-place targets). All locked decisions (D-01..D-12)
are inputs, not re-openable -- this map is analog-matching only.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `plugins/lz-advisor/references/lz-deep-research-schema.md` (NEW) | reference doc (contract/config) | transform (freezes the aggregator's read/write shapes into prose) | the four sibling `references/*.md` (esp. `verify-target-selection.md` + `context-packaging.md`) | role-match (house-style) -- exact for structure/tone, content is net-new |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (MODIFY) | service / pure-function module | batch / file-I/O (off-model deterministic reduction) | the file ITSELF (modify-in-place: `tally()` decision block + doc-comment + stdout line) | exact (self-analog) |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (MODIFY) | test (node:test fixture) | request-response (input run-dir -> asserted output) | the existing committed test cases in the SAME file | exact (self-analog) |

**Sequencing constraint (load-bearing, from RESEARCH Pitfall 1 + D-12):** apply the `.mjs` + `.test.mjs`
correction BEFORE writing the doc's frozen-shape sections, so the doc freezes the CORRECTED code
(post-D-02), never the as-shipped `Rejected` / `Low/Contested` spike artifact. Order: (1) `.mjs`
tally rewrite + stdout line, (2) `.test.mjs` enum comment + four new tier cases + 5-label stdout
assertion, (3) the new `references/*.md` doc.

---

## Pattern Assignments

### `plugins/lz-advisor/references/lz-deep-research-schema.md` (reference doc, transform)

**Analog:** the four sibling files in `plugins/lz-advisor/references/` -- `advisor-timing.md`,
`context-packaging.md`, `verify-target-selection.md`, `orient-exploration.md`. This new file is the
FIFTH in that directory and must match their prose-contract house style (D-11).

**Title + intent-paragraph pattern** -- copy the "single source of truth FOR / consumed by" opener.
`verify-target-selection.md` lines 1-12 is the cleanest template:
```markdown
# Verify Target Selection by Change Surface

This is the single source of truth for choosing the verification command that
actually exercises a change. Both `plan` and `execute` consume this contract:

- `plan` names the matching command ...
- `execute` selects and runs the matching target ...

Neither skill duplicates the mapping below -- both reference this file.
```
Mirror for the new doc: an H1 naming the contract (e.g. "Deep-Research Data-Contract Schema"), then
an intent paragraph stating (a) the anti-drift rule (the aggregator SOURCE is authoritative; this doc
freezes it verbatim, D-12) and (b) the consumers (Phase 18 eval/voter, Phase 19 workers, Phase 20
orchestrator/synthesis). `context-packaging.md` lines 1-12 is the same opener pattern at more length.

**Section-depth pattern** -- `##` for major sections, `###` for sub-sections; prose-heavy, not
bullet-only. `context-packaging.md` uses `### Source Material vs Your Own Findings` / `### Structure` /
`### Worked Example` under `##` parents (lines 130, 157, 197); `orient-exploration.md` uses `## Class 1`
.. `## Class 4` with `###` sub-patterns (e.g. `### Class 2-S` line 49). A suggested section ordering is
in RESEARCH "Recommended doc structure" (lines 168-190) -- ordering/headings are Claude's discretion.

**Contract-rendering pattern** -- fenced code blocks for shapes/templates; tables for enumerated
mappings. `context-packaging.md` renders templates as fenced blocks (the Proposal/Verification
`### Structure` blocks, lines 159-195 and 265-303) and an enum-mapping table (`## When to Use Each
Template`, lines 333-343). For this doc:
- JSON shapes: fenced ```json (or annotated `.mjs` excerpts) -- copy field names BYTE-FOR-BYTE from
  the corrected `aggregate()` survivor map (see the `.mjs` assignment below); every field's
  name/type/allowed-values/owner/stage must be unambiguous (Claude's discretion on json-vs-table).
- The tally rubric: a truth table is a natural fit -- the per-tally->confidence table is pre-built in
  RESEARCH lines 301-310 (copy it; it maps every readable tally to exactly one of the 5 tiers).

**Worked-example pattern (REQUIRED for VERIF-06)** -- the sibling files lead with a principle, then
show a worked example: `verify-target-selection.md` `## Worked examples` (lines 37-47);
`context-packaging.md` `### Worked Example` (lines 197-241). The two-assurance orthogonality (D-04/D-05)
MUST carry a worked example showing `quote_fidelity: verified` coexisting with `claim_support:
unsupported` (the exact conflation VERIF-06 exists to prevent).

**Caveat-section pattern** -- state-the-limit sections. `verify-target-selection.md` `## Tooling
freshness (stale-daemon caveat)` (lines 49-57) models the explicit-caveat style; mirror it for the
WR-04 normalized-substring lower-bound caveat and the corroboration-lower-bound caveat.

**Cross-reference pattern** -- cite the aggregator SOURCE path + exact function names per D-12
(`aggregate`, `tally`, `mergeClusters`, `quoteOutcome`, `recheckClusters`, `enforceCeilings`,
`CEILINGS`). Siblings cross-link via `references/<name>.md` and `${CLAUDE_PLUGIN_ROOT}`
(`context-packaging.md` line 44 references `orient-exploration.md`; the script is referenced via
`${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_SKILL_DIR}` per memory `reference_plugin_script_location`).
HOUSE RULE / Pitfall 14 (`feedback_no_cross_skill_body_references`): this reference is the canonical
home; do NOT reference another SKILL's named sections -- SKILL.md files point AT this doc.

**Tone:** declarative, contract-style, no emoji, pure ASCII (global CLAUDE.md). Verbatim-freeze
content (the survivor record, `dropped` record, `CEILINGS`, the quote-recheck three-way + WR-04
caveat, the stdout summary, the run-dir layout) is pre-distilled copy-ready in RESEARCH "Code Examples"
(lines 399-490) -- the doc COPIES these from the corrected code; it does not paraphrase.

---

### `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` (service, batch/file-I/O)

**Analog:** the file ITSELF -- this is a confined modify-in-place. The change touches exactly three
points; everything else (the seat-reading loop, the cap-counting loop, the vote-file lookup, the
`votes_ignored` accounting, all validation / path-safety / fail-closed code) is UNCHANGED.

**Target 1 -- the `tally()` decision block.** `tally()` spans lines 429-497. The CURRENT decision
block (lines 477-496), verbatim:
```javascript
  const refuted = seats.filter((v) => v === 'refuted').length;
  const unrefuted = seats.filter((v) => v === 'unrefuted').length;

  if (refuted >= 2) {
    return 'Rejected';
  }

  if (unrefuted === 3) {
    return 'High';
  }

  if (unrefuted === 2) {
    return 'Medium';
  }

  if (readableSeats === 0) {
    return 'Unsupported';
  }

  return 'Low/Contested';
```
The three inputs the Option I rubric needs ALREADY exist: `readableSeats` (declared line 434,
incremented line 454), `unrefuted` (line 478), `refuted` (line 477). Replace the decision block with
the five Option I branches IN THIS ORDER (the split branch MUST precede the `unrefuted === 2` Medium
branch -- Pitfall 2):
```javascript
  if (readableSeats === 0) {
    return 'Unsupported';
  }

  if (unrefuted === 3) {
    return 'High';
  }

  if (unrefuted >= 1 && refuted >= 1) {
    return 'Contested';            // voter split: any explicit refutation alongside support
  }

  if (unrefuted === 2) {
    return 'Medium';               // refuted === 0 here (the split case is caught above)
  }

  return 'Low';                    // thin support, OR refuted-without-support (downgrade-not-delete)
```
Net change: drop `refuted >= 2 -> 'Rejected'`; hoist the `readableSeats === 0` guard to the top; add
the `unrefuted >= 1 && refuted >= 1 -> 'Contested'` split branch; rename the fall-through `'Low/Contested'`
to `'Low'`. Internal variable naming is Claude's discretion (D-02). Behaviorally identical truth table
is in RESEARCH lines 301-312 (load-bearing rows: `0 unrefuted / 3 refuted -> Low` per D-03b;
`>=1 unrefuted AND >=1 refuted -> Contested` per D-03).

**Target 2 -- the `tally()` doc-comment.** Lines 427-428, verbatim:
```javascript
// Rubric (PRESERVED verbatim): refuted >= 2 -> Rejected; unrefuted === 3 -> High;
// unrefuted === 2 -> Medium; zero readable seats -> Unsupported; otherwise -> Low/Contested.
```
Rewrite to describe the Option I rubric (the 5 ordered branches + the split-before-Medium note).

**Target 3 -- the stdout by-confidence summary line.** The `byConfidence` helper (line 546) is fine
as-is; the `survivors:` summary entry (lines 560-570) emits FOUR labels including the fused
`Low/Contested`, verbatim:
```javascript
    'survivors: ' +
      survivors.length +
      ' (High ' +
      byConfidence('High') +
      ', Medium ' +
      byConfidence('Medium') +
      ', Low/Contested ' +
      byConfidence('Low/Contested') +
      ', Unsupported ' +
      byConfidence('Unsupported') +
      ')',
```
Update to the five labels in enum order: `High / Medium / Low / Contested / Unsupported`. Note
`byConfidence('Rejected')` was never in the summary (so `Rejected` survivors were already invisible --
another reason it's an accidental artifact). Style of the rewritten line is Claude's discretion;
target shape:
```
survivors: <Z> (High <h>, Medium <m>, Low <l>, Contested <c>, Unsupported <u>)
```

**Anti-pattern (CLAUDE.md / Pitfall 5):** the source is pure ASCII -- U+FEFF appears ONLY as the JS
escape backslash-u-F-E-F-F (line 69), NEVER as a literal byte. After editing, scan `rg -n "[^\x00-\x7F]"`
(must return nothing) before commit.

**Verify (host-quirk gated, FILE form only -- Pitfall 4):**
```
node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs
```
Baseline confirmed 13/13 GREEN this session (file form). NEVER the directory form (`node --test <dir>`
spuriously exits 1 on this host -- memory `reference_node_test_dir_exit1_quirk`).

---

### `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` (test, request-response)

**Analog:** the existing committed test cases in this SAME file. The file has TWO fixture-construction
patterns; the four new tier cases follow the established shape.

**Pattern A -- committed `__fixtures__/<case>/{claims,excerpts,votes}/` tree (preferred for the new
tier cases).** Used by `SC5-1..SC5-5` + `CR-01` (e.g. `aggregate(fx('near-duplicate-merged'))`, lines
41-105). The `fx()` helper resolves test-file-relative (line 35): `const fx = (name) =>
path.join(HERE, '__fixtures__', name)`. A committed case is three small files. The High-tier
`near-duplicate-merged` case is the exact template the four new cases copy:
- `claims/w1.json` (single line, no trailing structure):
  `{"worker":"w1","source":"s1","claims":[{"id":"c1","text":"X reduces Y by 30%","quote":"X reduces Y by 30%","excerpt_id":"e1"}]}`
- `excerpts/e1.txt`: plain text CONTAINING the quote verbatim so the claim survives quote-recheck:
  `The randomized study found that X reduces Y by 30% across all trials.`
- `votes/cluster0-<seat>.json`: each `{"verdict":"unrefuted"}` (seat 0/1/2).

**Vote-file naming (load-bearing).** `tally()` looks up `<clusterId>-<seat>.json` FIRST, then
`<memberId>-<seat>.json` (lines 436-455). The first cluster is always `cluster0` (set in
`mergeClusters`, line 248: `'cluster' + clusters.length`). The committed High-tier fixtures use
`cluster0-0/1/2.json`; the new fixtures should follow the same `cluster0-<seat>.json` convention.
A MISSING seat file = `insufficient` (write no file for that seat). The four new cases differ from
`near-duplicate-merged` ONLY in their `votes/` seat verdicts (and the absence of seat files for
sub-3-seat tiers):
- `Medium`: 2 readable `unrefuted` seats + 1 missing seat (write `cluster0-0`, `cluster0-1`; omit `-2`).
- `Low` (thin): 1 readable `unrefuted` seat + 2 missing (write `cluster0-0` only).
- `Low` (downgrade-not-delete, D-03b): 3 `refuted` seats, 0 uphold -> assert `Low` AND that the claim
  still appears in survivors (NOT deleted).
- `Contested` (D-03): >=1 `unrefuted` AND >=1 `refuted` (e.g. `cluster0-0` unrefuted + `cluster0-1`
  refuted) -> `Contested`.
- `Unsupported`: 0 readable vote seats (no `votes/` dir or no matching files for the cluster) ->
  `Unsupported`. RESEARCH Open Question 1 (line 516) suggests a temp-run-dir for this case if a
  no-votes committed tree reads oddly -- Claude's discretion. A `refuted` vote file is
  `{"verdict":"refuted"}` (compare the committed `{"verdict":"unrefuted"}` seat files).

**Pattern B -- temp-run-dir helper (alternative / for no-input cases).** `tmpRunDirWithWorker(worker)`
(lines 109-116) builds a throwaway run-dir under `os.tmpdir()` from one worker record and returns the
path; used by the `WR-*` fail-closed tests (lines 118-155). A fuller inline temp-run-dir that also
seeds `votes/` + a runtime-generated excerpt is the CRLF/BOM test (lines 187-217) -- the model for an
`Unsupported`/no-votes case if Pattern A reads oddly. WR-05 discipline: never write a runtime/BOM/CRLF
input into the committed `__fixtures__` tree.

**Assertion-shape pattern.** Copy the per-tier assertion from `SC5-4` (line 87):
`assert.equal(r.survivors[0].confidence, 'High')`. Each new case asserts its tier the same way. For
the downgrade-not-delete case, ALSO assert the claim is present (NOT deleted), e.g. via
`r.survivors.length` / `r.survivors.some(...)` (the absence-assertion pattern is in `SC5-1`, lines
48-51). Today ONLY `High` is exercised (line 87); the four new cases close the Medium/Low/Contested/
Unsupported gaps (RESEARCH Wave 0 Gaps, lines 563-570).

**Target -- the enum-documenting header comment.** Lines 11-12, verbatim:
```javascript
// quote_fidelity in {verified, downgraded}, confidence in
// {High, Medium, Low/Contested, Rejected, Unsupported}).
```
Update the confidence set to `{High, Medium, Low, Contested, Unsupported}` (lockstep with the `.mjs`
enum, D-02).

**Target -- stdout 5-label assertion (D-02).** Add an assertion that the summary line names all five
labels. The existing `assert.match(r.summary, /.../ )` + `assert.ok(r.summary.includes('...'))` shapes
are the model (`CR-01` line 100; `SC5-1` line 47; `SC5-5` line 162). Build a survivors set spanning
multiple tiers (or assert per-tier substrings) so the line `High .. Medium .. Low .. Contested ..
Unsupported` is verified.

**Net suite size:** from 13 tests to >=17 (four new tier cases + the stdout-label assertion, plus the
enum-comment edit). Same framework, same fixture patterns -- net-new fixture DATA + assertions, no new
infrastructure.

---

## Shared Patterns

### House-style (applies to the new reference doc)
**Source:** `plugins/lz-advisor/references/verify-target-selection.md` (cleanest, smallest exemplar)
+ `context-packaging.md` (worked-example + table exemplar).
**Apply to:** `lz-deep-research-schema.md`.
Pattern: H1 contract title -> "single source of truth FOR / consumed by" intent paragraph -> `##`
major sections with prose + fenced shapes + mapping tables -> a `## Worked example(s)` section ->
an explicit `## ...caveat` section -> cross-references by `references/<name>.md` + the SOURCE path.

### Freeze-from-(corrected)-code / anti-drift (D-12)
**Source:** the corrected `lz-deep-research-aggregate.mjs` -- `aggregate()` survivor map (lines 524-531),
`recheckClusters()` `dropped` record (line 360), `CEILINGS` (lines 115-121), `quoteOutcome()` +
`recheckClusters()` three-way + WR-04 caveat (lines 303-331, 367), stdout summary (lines 556-571),
run-dir layout (read by `mergeClusters` claims + `tally` votes).
**Apply to:** every frozen-shape section of the doc. Copy field names BYTE-FOR-BYTE; cite exact
function + line anchors. Copy-ready transcriptions are in RESEARCH "Code Examples" (lines 399-490).
The survivor record field set, in order, is the load-bearing one (RESEARCH lines 405-413):
```javascript
  const survivorRecords = capped.map((cl) => ({
    id: cl.id,
    claim: cl.text,
    sources: [...cl.sources].sort(),
    corroboration_lower_bound: cl.sources.size,
    quote_fidelity: cl.quote_fidelity,
    confidence: tally(cl, runDir, caps),   // post-D-02: one of High|Medium|Low|Contested|Unsupported
  }));
```

### Pure-ASCII invariant + FILE-form test gate
**Source:** the `.mjs` header (lines 16-17), the `.test.mjs` host-quirk header (lines 14-18), global
CLAUDE.md, memories `reference_node_test_dir_exit1_quirk` + Pitfall 5.
**Apply to:** all three files. After editing any `.mjs`/`.test.mjs`/`.md`: `rg -n "[^\x00-\x7F]"`
returns nothing; gate on the FILE-form test command only.

---

## No Analog Found

None. All three targets have a concrete in-repo analog (sibling references for the new doc; the file
itself for both modify-in-place targets). The planner does NOT need to fall back to RESEARCH-only or
external patterns for any file.

---

## Metadata

**Analog search scope:** `plugins/lz-advisor/references/` (4 files, all read in full);
`plugins/lz-advisor/skills/lz-deep-research/scripts/` (aggregator + fixture + committed `__fixtures__`
tree).
**Files scanned:** 6 read in full (4 references + 2 modify-in-place targets) + the `__fixtures__`
directory listing (91 committed fixture files) + 4 representative committed fixture files
(`near-duplicate-merged` claims/excerpt/vote, `fabricated-quote-dropped` vote).
**Baseline test state verified:** 13/13 GREEN (file form) this session.
**Pattern extraction date:** 2026-06-15
