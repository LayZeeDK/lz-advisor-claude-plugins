---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
reviewed: 2026-09-08T00:00:00Z
depth: deep
files_reviewed: 18
files_reviewed_list:
  - .github/workflows/ci.yml
  - eval/lz-eval-baseline-manifest.mjs
  - eval/lz-eval-baseline-manifest.test.mjs
  - eval/lz-eval-baseline-manifest-defects.test.mjs
  - eval/lz-eval-p23-citation-audit.mjs
  - eval/lz-eval-p23-citation-audit.test.mjs
  - eval/lz-eval-p23-prereg.test.mjs
  - eval/lz-eval-p23-resolvability.mjs
  - eval/lz-eval-p23-resolvability.test.mjs
  - eval/lz-eval-p23-retain.mjs
  - eval/lz-eval-p23-retain.test.mjs
  - eval/lz-eval-p23-sliceA-draw.mjs
  - eval/lz-eval-p23-sliceA-draw.test.mjs
  - eval/lz-eval-p23-sliceA-gate.test.mjs
  - eval/lz-eval-p23-sliceA-read.mjs
  - eval/lz-eval-p23-sliceA-read.test.mjs
  - eval/lz-eval-p23-verify-complete.mjs
  - eval/lz-eval-p23-verify-complete.test.mjs
findings:
  critical: 7
  warning: 11
  info: 4
  total: 22
status: issues_found
---

# Phase 23: Code Review Report

**Reviewed:** 2026-09-08
**Depth:** deep (cross-module, with empirical probes against the retained evidence)
**Files Reviewed:** 18
**Status:** issues_found

## Summary

17 source files, ~6,244 lines, reviewed as code for the first time. Every finding below was
**reproduced by running the code**, not inferred from reading it. Probes were read-only against the
repo and wrote only into the OS temp tree; `eval/.cache/` and `.lz-research/` were read and never
mutated.

The tree is unusually well documented and its argument-checking discipline is consistent. That
discipline is also what hid these defects from three prior gates: the module headers assert controls
in prose so confidently that the assertions read as verification. Six of the seven BLOCKERs are cases
where a header claims a property the code does not have.

**Two findings would change a published figure if the code were re-run; one already qualifies a
published figure retroactively.** The rest are latent -- they did not fire on the realized inputs,
which I verified item by item against the 40 write-once Slice-A records, the three retained
`citation-audit-*.json` artifacts, and both q2 stream captures. Section
[Published-figure impact](#published-figure-impact) states this per finding.

The three prior fixes are **sound**; one is incomplete. See
[Assessment of the three prior fixes](#assessment-of-the-three-prior-fixes).

## Structural Findings (fallow)

No `<structural_findings>` block was supplied with this review, so there is no structural pre-pass to
build on. The cross-module facts below were derived directly and are flagged as such: the
fenced-code asymmetry between `citation-audit.mjs` and `verify-complete.mjs` (CR-04), and the
write-once asymmetry between `sliceA-read.mjs` and `retain.mjs` (CR-07).

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: `sliceARead` completeness is a TOTAL, not per-direction -- an all-one-direction pool is accepted as a complete balanced read

**File:** `eval/lz-eval-p23-sliceA-read.mjs:350-363`

**Issue:** `required = DRAW.N_PER_DIRECTION * 2` and the guard is `definite.length < required`. Nothing
checks the split. D-08's entire argument is that balance is what makes the per-direction read say
anything, and `drawBalanced` enforces it rigorously at draw time -- but the READ never re-checks it.

Reproduced: 40 definite verdicts, all `unrefuted`, 0 `refuted`, accepted without error:

```
SCENARIO 1 (0 refuted, 40 unrefuted) ACCEPTED as a COMPLETE read:
  n = 40  unrefuted = {"tp":40,"fn":0}  refuted = {"tn":0,"fp":0}
```

`refuted: {tn:0, fp:0}` is an **empty row published as a measured one**. A downstream reader sees
`n=40` and a complete-looking four-cell tally. `tallyPerDirection` cannot catch this -- it splits
whatever cells `mccFromPairs` returns and has no per-direction floor.

The module's own doc (`:219-220`) says "sliceARead is what refuses to read a pool with too few
DEFINITE verdicts". It refuses a small pool; it does not refuse a lopsided one. Untested: the suite
covers "fewer than 40" (`:396`) and "abstain-padded" (`:416`), never the split.

**Fix:** count per direction and require both floors, mirroring `drawBalanced`'s guard.

```js
const required = DRAW.N_PER_DIRECTION;
const perDirection = { unrefuted: 0, refuted: 0 };

for (const p of pairs) {
  if (DIRECTIONS.includes(p.verdict)) {
    perDirection[p.direction] += 1;
  }
}

for (const direction of DIRECTIONS) {
  if (perDirection[direction] !== required) {
    throw new ContractError(
      'sliceARead requires EXACTLY ' + required + ' definite verdicts in direction ' + direction +
        ' and found ' + perDirection[direction] +
        ' (D-08: an unbalanced read leaves a direction uninformative while the tally still looks complete)',
      'sliceARead',
    );
  }
}
```

Note the `!==`: it closes CR-02 in the same guard.

### CR-02: a duplicate verdict file double-counts and corrupts a per-direction cell; `n` has no upper bound

**File:** `eval/lz-eval-p23-sliceA-read.mjs:272-321, 350-353`

**Issue:** `readSliceAVerdicts` iterates every `*.verdict.json` in `verdictDir` and pushes one pair per
FILE. Two files carrying the same `(direction, drawIndex)` both pair against the same dispatch record
and both enter the tally. The `dispatch` Map is keyed and therefore deduplicated; the verdict side is
not. `sliceARead` then admits `definite.length >= required` -- `>=`, not `===` -- so a pool larger than
40 passes.

Reproduced. A clean 20+20 pool, then ONE stray retry file added under a different filename for an
item that already had a verdict:

```
SCENARIO 2 baseline (clean 20+20):        n = 40  {"tp":20,"fn":0} {"tn":20,"fp":0}
SCENARIO 2 with ONE duplicate retry file: n = 41  {"tp":20,"fn":1} {"tn":20,"fp":0}
```

A single leftover file **invented an `fn` that did not happen** and inflated `n` past the
pre-registered 40. This is exactly the artifact a partial re-roll leaves behind, and `writeDispatchRecord`'s
write-once discipline (`:194`) protects the dispatch side against precisely this while the verdict
side is unguarded.

**Fix:** reject a repeated key on read, and pin `n` with `!==` as in CR-01.

```js
const seen = new Set();
// ... inside the verdictDir loop, after computing `key`:
if (seen.has(key)) {
  throw new ContractError(
    'readSliceAVerdicts found TWO verdict files for direction ' + verdictRecord.direction +
      ' drawIndex ' + verdictRecord.drawIndex + ' in ' + JSON.stringify(name) +
      ' (a duplicate is a re-roll artifact, not a resume -- it would double-count a cell)',
    'readSliceAVerdicts',
  );
}
seen.add(key);
```

### CR-03: `ARXIV_RE` has no anchors and no word boundary -- it swallows DOIs and unrelated URLs, and can merge two distinct sources into one identifier

**File:** `eval/lz-eval-p23-citation-audit.mjs:72-74, 121-124`

**Issue:** `/(?:arxiv[:\s]*|arxiv\.org\/(?:abs|pdf|html)\/)?(\d{4}\.\d{4,5})(v\d+)?(?:\.pdf)?/i` -- the
prefix alternation is **optional** and there is no `\b` or anchor around the captured group. Because
`canonicalizeCitation` tries this rule FIRST (`:121`), any token containing a `NNNN.NNNN` substring
anywhere becomes an arXiv identifier. `\d{4}` is not anchored either, so the engine slides into the
middle of a longer digit run.

Reproduced:

```
10.1145/3442188.3445922                  => arxiv:2188.34459
https://doi.org/10.1145/3442188.3445922  => arxiv:2188.34459
10.1007/978-3-030-12345.67890            => arxiv:2345.67890
10.5555/1234.56789                       => arxiv:1234.56789
https://blog.eleuther.ai/2023.12345-yarn => arxiv:2023.12345
https://other.example/2023.12345-x       => arxiv:2023.12345
```

Three separate failures in one rule:

1. **The DOI rule is unreachable for the most common ML/AI DOI shape.** `10.1145/...` (ACM) and
   `10.1007/...` (Springer) both carry a dot-separated numeric suffix. `DOI_RE` at `:82` is correct;
   it simply never runs for them. `requestUrlFor` (`resolvability.mjs:118`) then sends the mangled id
   to `https://arxiv.org/abs/2188.34459`, and whatever that returns becomes the published
   resolvability outcome for a source that is not on arXiv.
2. **Two distinct sources merge.** `10.1145/3442188.3445922` and `10.9999/9992188.3445922` both
   canonicalize to `arxiv:2188.34459` -- the digit window the engine happens to land on is shared. The
   unique-source COUNT, a headline figure, silently drops by one.
3. **A non-arXiv URL merges with a real arXiv paper.** `https://other.example/2023.12345-x` collapses
   onto `arxiv:2023.12345`. The whole reason the canonicalizer exists (`:28-34`) is to stop the
   comparison being a format artifact; this makes it a digit-coincidence artifact.

**Fix:** anchor the whole token and require the prefix when the form is a URL. The identity rule the
header states -- `abs`/`pdf`/`html` path or an explicit `arxiv` prefix -- is already the right rule; it
just is not enforced.

```js
export const ARXIV_RE = Object.freeze(
  /^(?:arxiv[:\s]*|(?:https?:\/\/)?(?:www\.)?arxiv\.org\/(?:abs|pdf|html)\/)(\d{4}\.\d{4,5})(v\d+)?(?:\.pdf)?$/i,
);
```

Keep `BARE_ARXIV_SCAN_RE` (`:202`) as the SCANNER that finds bare prose identifiers, but have it emit a
normalized `arxiv:<id>` token rather than handing raw text to a canonicalizer whose arXiv branch now
demands a prefix. Move the `DOI_RE` test ahead of the arXiv test as a second line of defense.

### CR-04: `isVerificationComplete` does not strip fenced code, so a ledger heading quoted inside a fence governs the verdict

**File:** `eval/lz-eval-p23-verify-complete.mjs:130-144`

**Issue:** The heading scan walks every line of the report. There is no fence handling. The FIRST match
wins (`:137`) and any later one is demoted to `duplicateLedgerHeadings`, which the doc explicitly says
"does not fail completeness" (`:113-114`).

A `/deep-research` report that shows its own output format in a fenced block -- a common thing for a
report to do -- puts an example ledger heading before the real one. Reproduced:

```
ledger heading QUOTED INSIDE a fenced block   complete=true declared=2 rows=2 dup=1
```

The predicate **certified an illustrative 2-row example as the verification ledger** and ignored the
real `3/3` ledger below it. `declaredN`, `confirmedN` and `tableRows` in the published record would all
describe the example.

This is a cross-module asymmetry, not an oversight in isolation: the sibling
`citation-audit.mjs:233-256` has a `stripFencedCode` for exactly this reason, with a comment citing the
published rationale. `verify-complete.mjs` was written in the same wave and does not use it.

**Fix:** strip fenced code before scanning. `stripFencedCode` is already written and proven; export it
from `citation-audit.mjs` (or lift it into a shared helper) rather than duplicating it -- the two
modules must not diverge on what a fence is.

### CR-05: `isVerificationComplete` returns `complete: true` for a `0/0 confirmed` ledger over an empty table

**File:** `eval/lz-eval-p23-verify-complete.mjs:200-233`

**Issue:** The predicate requires `declaredN === confirmedN` and `tableRows === declaredN`. At zero,
both hold. Reproduced:

```
0/0 confirmed with an empty table   complete=true declared=0 rows=0 dup=0
```

A report that verified **nothing** is certified verification-complete, and `spikeCleared` (`:271`) then
turns that into a cleared ENV-05 spike as long as the ceiling half also clears. This is the ONE
failure mode a frozen mechanical predicate exists to prevent: the doc's stated concern is a run
"truncated mid-verify" (`:228-229`), and a run truncated before the first verification produces
precisely `0/0` with an empty table.

There is no `declaredN > 0` guard and no test at the zero boundary -- notable in a suite that is
otherwise careful to prove every cap at its own limit (`:265-290`).

**Fix:**

```js
if (declaredN === 0) {
  return {
    complete: false,
    declaredN,
    confirmedN,
    tableRows,
    duplicateLedgerHeadings,
    reason:
      'the ledger declares 0/0 confirmed over an empty table -- a report that verified nothing is ' +
      'not verification-complete (this is the shape a run truncated BEFORE the first verify produces)',
  };
}
```

### CR-06: `extractTerminalCost` silently skips a malformed line, so a truncated terminal `result` event promotes an earlier under-reporting one

**File:** `eval/lz-eval-baseline-manifest.mjs:159-166`

**Issue:** The scanner skips unparseable lines with `continue` and keeps last-result-wins. The header
argues the skip is safe because a malformed line "can never satisfy the guard" (`:135`). True for the
guard -- and false for the SELECTION. Skipping the last line does not fail; it makes the
second-to-last `result` event terminal.

The module's own header documents why that is severe (`:129-133`): the real built-in q1 cold stream
carries two `result` events and the first reports `0.7800860000000001` against the run's
`48.5367785` -- "a first-result-event implementation would silently under-report the run by ~98%". A
capture whose final line is a partially flushed `result` object hits exactly that path, with **no
error and no signal**. The published built-in q2 run ended in error on both streams, so a truncated
tail is a live scenario in this phase, not a hypothetical.

Both retained q2 captures are intact (`unparseableLines=0`, both end with a newline), so no published
cost figure is affected today. The code is still wrong.

**Fix:** distinguish "garbage in the middle" from "truncated at the end". The cheapest correct rule is
to fail on any unparseable non-empty line at or after the last successfully parsed `result` event.

```js
} catch {
  malformedAfterLastResult = terminal !== null;
  continue;
}
// ... after the loop, before reading total_cost_usd:
if (malformedAfterLastResult) {
  throw new ContractError(
    'the stream carries an unparseable line AFTER the last readable result event -- the capture may be ' +
      'truncated and the terminal cost cannot be established (D-22; no earlier result event is substituted)',
    'extractTerminalCost',
  );
}
```

### CR-07: `retainRunDirectory` returns a destination that already holds retained evidence, with no existence check

**File:** `eval/lz-eval-p23-retain.mjs:115-139`

**Issue:** The module is positioned as THE control that guards the retention write (`:13-17`: "the
control that guards the write deliberately does not perform the write: the caller copies, using the
destination this module returned"). It validates the run-id shape and containment, and returns a path.
It never checks whether that path already exists.

Reproduced against the live tree (read-only -- `retainRunDirectory` touches no file):

```
eval/.cache/p23-baseline already exists on disk: true
retain returns a dest with NO existence check: ...\eval\.cache\p23-baseline\20260908-105102-x
```

The documented CLI contract is `DEST=$(node eval/lz-eval-p23-retain.mjs "$RUN_ID" ...) && cp -r ...`
(`:147`). A re-run with the same run-id -- or a run-id an operator reuses after a failed first attempt --
hands `cp -r` a destination inside a tree the project records as **irreplaceable with no backup
(T-23-06)**. `cp -r` merges into an existing directory and overwrites same-named files.

The pattern to apply is in the tree already: `writeDispatchRecord` (`sliceA-read.mjs:194-204`) refuses
to overwrite for exactly this reason, in the same wave, with the same `ContractError` idiom. That
discipline was not carried across.

**Fix:** refuse an existing destination. This keeps the module pure with respect to writing -- `existsSync`
reads.

```js
if (fs.existsSync(dest)) {
  throw new ContractError(
    where + ' refuses a destination that already exists: ' + JSON.stringify(dest) +
      ' (retained capture evidence under eval/.cache/ is irreplaceable and has no backup, T-23-06; a ' +
      'repeat retention must be a new run-id, never a merge into an existing one)',
    where,
  );
}
```

## Warnings

### WR-01: the URL branch of `canonicalizeCitation` keeps trailing sentence punctuation, splitting one source into two

**File:** `eval/lz-eval-p23-citation-audit.mjs:135-154`, with `:198` and `:201`

**Issue:** `BARE_URL_SCAN_RE`'s class `[^\s"'<>)\]},]+` excludes a comma but **not** a period,
semicolon, colon, `!` or `?`. A sentence-final URL therefore carries its punctuation into the
identifier, and the URL branch has no trailing-punctuation strip -- while the DOI branch does
(`:130`, `.replace(/[.,;)\]]+$/, '')`), and the header even says so at `:79-80`.

Reproduced, including the split at the level `extractCitationTokens` reports:

```
https://x.example/page.  => url:x.example/page.
https://x.example/page   => url:x.example/page

extract identifiers: ["url:x.example/page","url:x.example/page."]
```

One source, cited once in prose and once in the bibliography, counts as **two unique sources**. That
inflates `uniqueSources.count` and adds a phantom row to the resolvability denominator.

**Fix:** apply the same strip the DOI branch uses, before `new URL`:

```js
const trimmed = token.replace(/[.,;:!?]+$/, '');
const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
```

### WR-02: the sentence splitter does not split at a list-item boundary, so a whole bullet list is ONE unit -- this understates the published coverage denominator

**File:** `eval/lz-eval-p23-citation-audit.mjs:175, 537-556`

**Issue:** `SENTENCE_SPLIT_RE` requires the next unit to begin `["'*`(\[]?[A-Z]`. A Markdown bullet
begins `- ` or `* ` followed by whatever, so no split occurs across `\n- `. A bullet list collapses into
a single "sentence-level text unit", and the passage rule (`:547`) then lets a citation on the last
bullet mark the entire collapsed block as cited.

This **fired on the real published data.** Re-running `countUncitedUnits` over
`eval/.cache/p23-baseline/lz/q2/q2-run1.report.md` reproduces the published `59 / 67` and shows 5 of
those 67 units are multi-sentence collapses -- the largest is 983 characters holding 6 sentence-enders:

```
uncited 59 / total 67
MULTI-SENTENCE UNIT #3 (6 enders, 983 chars): "- Focus: post-training quantization (no full retraining), ..."
units with >1 sentence-ender: 5 of 67
```

So the published denominator `67` is not a sentence-level count of the report; a per-sentence rule
would give roughly 75. The direction of the reading (coverage is low) is unchanged, but the exact pair
`59/67` is a product of the splitter's uppercase lookahead. The envelope's Warnings section
(`23-ENVELOPE.md:125`) discloses a different format effect (`Confidence:` metadata lines) and does not
cover this one.

**Fix:** treat a list-item start as a unit boundary. The smallest change that does it:

```js
SENTENCE_SPLIT_RE: /(?<=[.?!])\s+(?=["'*`(\[]?[A-Z])|\n(?=\s*(?:[-*+]|\d+[.)])\s+\S)/,
```

Whatever the rule becomes, it changes a published figure, so it belongs in an amendment with a
timestamp rather than a quiet edit -- same discipline as a re-seed.

### WR-03: dropping heading, table and fence lines merges the paragraphs that surrounded them

**File:** `eval/lz-eval-p23-citation-audit.mjs:527-537` and `:233-256`

**Issue:** The heading/table/rule filters and `stripFencedCode` **remove** lines rather than replacing
them with a blank line. `prose.split(/\n\s*\n/)` then joins text from either side of the removed block
into one paragraph, and the passage-level rule propagates one citation across a section boundary.

Reproduced:

```
heading between paragraphs, no blank line   uncited 0 / total 2
same content with blank lines               uncited 1 / total 2
```

An uncited claim in one section inherits citedness from the next section's first sentence. It
deflates the numerator.

**Fix:** replace rather than drop -- `.map((line) => (isHeading(line) || isTable(line) || isRule(line) ? '' : line))`,
and have `stripFencedCode` push `''` for each removed line. Both keep the line-structural properties the
comment at `:223-225` depends on.

### WR-04: an unclosed fence silently deletes the rest of the report from the unit population

**File:** `eval/lz-eval-p23-citation-audit.mjs:233-256`

**Issue:** Once `fenceChar` is set, every subsequent line is dropped until a matching closing fence. If
the report never closes the fence -- a truncated capture, or a nested-fence mismatch -- the entire tail is
discarded with no error and no reported reason. Reproduced:

```
unclosed fence: uncited 1 / total 1
```

Three claims in the input, one counted. Both numerator and denominator shrink together, so the RATE
still looks plausible while the population is wrong. That is the shape of defect that is hardest to
notice downstream.

Neither published q1/q2 report contains a fence (`fence lines: 0`), so nothing published is affected.

**Fix:** track it and surface it.

```js
if (fenceChar !== null) {
  throw new ContractError(
    'the report ends inside an unclosed code fence -- the tail cannot be classified and silently ' +
      'dropping it would shrink both the numerator and the denominator',
    'stripFencedCode',
  );
}
```

### WR-05: the body read has no deadline at all -- the T-23-14 timeout covers only the response headers

**File:** `eval/lz-eval-p23-resolvability.mjs:254-313`

**Issue:** The header claims "an abort signal and a raced deadline at TIMEOUT_MS" as a named T-23-14
control (`:19`). The race (`:258-269`) covers only the `fetchImpl` promise, which for a real `fetch`
settles when the **headers** arrive. `controller.abort()` is called only on the TIMED_OUT branch
(`:279`); once a response is returned, the controller is never armed again. `overCap(response.body)` at
`:311` then reads the stream with no deadline and no abort.

A server that returns 200 headers and then trickles bytes below the 256 KiB cap hangs `checkOne`
indefinitely. Because `checkResolvability` awaits identifiers sequentially (`:223-225`), one such host
stalls the whole run.

This is distinct from the already-recorded per-hop-deadline item: that one bounds the worst case at
~40 s; this one has no bound.

**Fix:** arm the controller with the deadline for the body read too, and treat an abort as `timeout`.

```js
const bodyDeadline = delay(RESOLVE_LIMITS.TIMEOUT_MS).then(() => TIMED_OUT);
const tooBig = await Promise.race([overCap(response.body), bodyDeadline]);

if (tooBig === TIMED_OUT) {
  controller.abort();

  return record(url, status, RESOLVE_OUTCOMES.TIMEOUT);
}
```

### WR-06: a throw from the body read aborts the whole resolvability run and discards every completed record

**File:** `eval/lz-eval-p23-resolvability.mjs:311`

**Issue:** The `try`/`catch` at `:257-276` wraps only the fetch race. `await overCap(response.body)` sits
outside it. A stream error -- an aborted connection mid-body, a decoding failure -- propagates out of
`checkOne`, out of `checkResolvability`, and out of the CLI's `catch` as exit 2 with **no output file
written** (`:350-351` never runs). Eleven completed checks are lost to one flaky twelfth.

Every other failure mode in this module is deliberately recorded as an outcome rather than thrown; this
one path breaks that pattern.

**Fix:** wrap it and record `network-error`, consistent with every sibling failure:

```js
let tooBig;

try {
  tooBig = await overCap(response.body);
} catch {
  return record(url, status, RESOLVE_OUTCOMES.NETWORK_ERROR);
}
```

### WR-07: a missing or misspelled `verdict` key becomes a silent abstain

**File:** `eval/lz-eval-p23-sliceA-read.mjs:281`

**Issue:** `verdictRecord.verdict == null ? null : verdictRecord.verdict` maps both an explicit `null`
(a deliberate abstain) and an **absent** key (a malformed or truncated record) to the same `null`.
Reproduced -- a record with no `verdict` key and one with a typo'd `verdct` key both read as abstains:

```
SCENARIO 3 (missing / typo verdict key) => [null,null]
```

The enum check at `:283` never fires because `null` is admissible. Abstains reduce the definite count,
so CR-01's floor is the only thing standing between a batch of malformed records and a short read --
and per CR-01 that floor does not check the split.

**Fix:** require the key to be present, then apply the enum.

```js
if (!Object.prototype.hasOwnProperty.call(verdictRecord, 'verdict')) {
  throw new ContractError(
    'readSliceAVerdicts verdict record has no `verdict` key -- an ABSENT key is a malformed record, ' +
      'not an abstain (an explicit null is the abstain): ' + JSON.stringify(name),
    'readSliceAVerdicts',
  );
}
```

### WR-08: `auditReport` publishes a `0 / N` quote-match rate when the excerpt corpus is empty

**File:** `eval/lz-eval-p23-citation-audit.mjs:584-590, 597`

**Issue:** With `excerpts: []`, `excerpts.some(...)` is `false` for every quote, so `matched` stays 0 and
the record reads `numerator: 0, denominator: quotes.length`. Reproduced:

```
{"numerator":0,"denominator":2}
```

"0 of 2 quotes matched" and "no corpus existed to match against" are different findings and must not
share a representation -- the QUOTE_LABEL itself says the measure is a diagnostic for the side that
"retained a corpus" (`:181`), and the envelope names the q1 corpus loss as a retention failure. The
q1 records are the exact case where this would misread.

**Fix:** refuse the combination rather than reporting a zero.

```js
if (quotes.length > 0 && excerpts.length === 0) {
  throw new ContractError(
    'auditReport refuses to score quotes against an EMPTY excerpt corpus: a 0/N result would read as ' +
      'a match failure when the finding is a retention failure (D-18)',
    'auditReport',
  );
}
```

### WR-09: `assertInside` compares paths case-sensitively, so a correct destination is refused on Windows depending on how it was typed

**File:** `eval/lz-eval-p23-retain.mjs:85-102, 134-136`

**Issue:** Containment is a `startsWith` over strings. `path.resolve` normalizes separators but
preserves case, while the ReFS/NTFS filesystem this runs on is case-insensitive. `RETAIN_CACHE_ROOT.DIR`
takes its case from `import.meta.url`; a caller-supplied `destRoot` takes its case from the operator or
from `process.cwd()`. Reproduced:

```
REFUSE UPPERCASE drive/path (Windows case-insensitive fs)
REFUSE 8.3 short name style
```

Both name real directories inside the cache root and both are refused. This fails CLOSED, so it is not
a bypass -- the risk is the opposite one: an operator who hits a spurious refusal mid-retention edits or
routes around the guard. Also worth stating plainly: the co-test's sibling-prefix case would pass
even with a case-insensitive comparison, so tightening this does not weaken the T-23-07 proof.

**Fix:** compare case-insensitively on `win32` only, so POSIX semantics stay exact.

```js
function samePathPrefix(root, candidate) {
  const fold = (s) => (process.platform === 'win32' ? s.toLowerCase() : s);

  return fold(candidate) === fold(root) || fold(candidate).startsWith(fold(root) + path.sep);
}
```

`fs.realpathSync.native` on the deepest existing ancestor would also resolve 8.3 short names, but that
is more machinery than the problem needs.

### WR-10: `requestUrlFor` forces `https:` on every `url:` identifier, so an http-only source is reported non-resolving

**File:** `eval/lz-eval-p23-resolvability.mjs:126-128`, with `citation-audit.mjs:135`

**Issue:** `canonicalizeCitation` drops the scheme deliberately -- "one page served over http and https
is one source" (`:100-101`) -- which is right for IDENTITY. `requestUrlFor` then reconstructs a request
URL by always prepending `https://`. A source cited as `http://...` that serves no TLS comes back
`network-error` or `dead`, and is published as a non-resolving link.

The module is explicit that resolvability "is not a source-quality measure" (`:36-37`), but it is
presented as a property of the LINK, and here it is partly a property of the reconstruction.

**Fix:** either retain the observed scheme alongside the identifier, or fall back to `http:` once on a
transport failure and record which scheme answered. Whichever is chosen, the substitution belongs in
the `limitation` string (`:87-91`) -- it is currently undisclosed.

### WR-11: `allowedScheme` reports an unparseable URL as `scheme-blocked`, conflating two outcomes in a published breakdown

**File:** `eval/lz-eval-p23-resolvability.mjs:137-143, 250-251, 298-302`

**Issue:** `allowedScheme` returns `false` from its `catch`, and the caller records
`SCHEME_BLOCKED`. A malformed identifier and a genuinely disallowed scheme land in the same bucket, as
does an unparseable `Location` header at `:301`. The published resolvability breakdown is a tally over
`RESOLVE_OUTCOMES`, so the two are indistinguishable in the record.

`SCHEME_BLOCKED` carries a security meaning -- it is the T-23-05 control firing. Reading a parse failure
as a blocked SSRF attempt overstates the control and hides a data-quality problem.

**Fix:** add `MALFORMED_URL: 'malformed-url'` to the frozen `RESOLVE_OUTCOMES` and separate the parse
failure from the allowlist rejection. Note this widens a frozen vocabulary, so it is an amendment.

## Info

### IN-01: published cost figures carry raw float-accumulation noise

**File:** `eval/lz-eval-baseline-manifest.mjs:203-211` (`aggregateRunCost`)

**Issue:** Summing `total += extractTerminalCost(...)` in float order produces the
`55.30793200000004` and `79.32313525000006` that appear verbatim in `23-ENVELOPE.md:115`. Fourteen
significant digits on a dollar amount are float artifacts presented as precision.

**Fix:** keep the exact sum internally, and quote a decided precision at the publication boundary. Do
not round inside the aggregate -- the refusal to impute is correct.

### IN-02: `RUN_ID_RE` has no length bound

**File:** `eval/lz-eval-p23-retain.mjs:57`

**Issue:** `[a-z0-9-]+` is unbounded. A 4,000-character run-id is accepted:

```
"20260908-105102-aaaaaaaaaaaaaa...(4016)"    true
```

The composed path then exceeds Windows `MAX_PATH` and the caller's `cp` fails at the OS layer rather
than at the guard that exists to reject bad run-ids.

**Fix:** bound the slug, e.g. `[a-z0-9-]{1,80}`. Confirm first that the realized run-id
`20260908-105102-post-training-quantization-4bit` still matches (it is 47 characters). Frozen constant,
so this is an amendment.

### IN-03: `[n]` markers above 999 are neither counted nor reported

**File:** `eval/lz-eval-p23-citation-audit.mjs:193, 360-382`

**Issue:** `MARKER_SCAN_RE` uses `\d{1,3}`, so `[1000]` produces no match at all -- it is not counted in
`markerTokens.total` and does not reach the `unmatched` bucket. The module's stated discipline is that
nothing is silently dropped (`:36-39`).

**Fix:** widen to `\d{1,4}` and let the existing `MAX_RANGE_SPAN` check reject an implausible range, or
add a wider catch-all scanner whose matches go straight to `unmatched`.

### IN-04: `checkedAt` is stamped after every request completes, not when the check began

**File:** `eval/lz-eval-p23-resolvability.mjs:223-228`

**Issue:** `now()` is called after the sequential loop finishes. For a 12-identifier run the timestamp
can trail the first request by minutes; under WR-05 it is unbounded. The published
`@ 2026-09-08T09:30:52.465Z` dates the END of the check.

**Fix:** capture `startedAt` before the loop and emit both.

## Published-figure impact

Per-finding, checked against the retained evidence rather than reasoned about:

| Finding | Would change a published figure? | Evidence checked |
|---|---|---|
| CR-01, CR-02 | **No.** Latent. | All 40 write-once records are exactly 20 `unrefuted` / 20 `refuted`, all definite, no duplicate `(direction, drawIndex)` key, no extra files in either directory. ENV-03's `tp 18 / fn 2`, `tn 20 / fp 0`, `n=40` stand. |
| CR-03, WR-01 | **No.** Latent. | All three `citation-audit-*.json` identifier sets are clean arXiv ids plus 4 URLs. No DOI appears in any report. `url:aclanthology.org/2025.acl-long.618` escapes CR-03 only because `acl-` follows the dot. No identifier carries trailing punctuation; no prefix-pair duplicates. `18`, `12`, `12` stand. |
| CR-04, CR-05 | **No.** Latent. | ENV-05's published reading is "did NOT clear, failing on COMPLETENESS... no report was produced" -- no report means the no-heading branch, which is robust to both. The ceiling half (1 resume / 2 windows) is unaffected. |
| CR-06 | **No.** Latent. | Both retained q2 streams: `unparseableLines=0`, both end with a newline, `resultEvents=2` with the terminal one intact. Every published cost stands. |
| CR-07 | **No.** No data was lost. | The realized retention was verified clean by 23-SECURITY.md. The exposure is prospective, as the module header itself says. |
| **WR-02** | **YES -- retroactively qualifies one.** | The bullet collapse fired on the real q2 report. `59 / 67` is reproducible but 5 of the 67 units are multi-sentence collapses holding ~13 sentence-enders. A per-sentence denominator is roughly 75. The reading (coverage is low) does not change; the exact pair does. Not covered by the envelope's existing format-effect caveat at `:125`. |
| WR-03, WR-04, WR-08 | **No.** Latent. | Neither q1 nor q2 report contains a fence (`fence lines: 0`); the only bibliography heading in q2 is `## Sources` at line 184 of 214, correctly near the end; the published q2 audit ran with a non-empty excerpt corpus. |
| WR-05 through WR-07, WR-09 through WR-11, IN-01 through IN-04 | **No**, except IN-01, which is cosmetic in an already-published string. | -- |

**Recommendation on WR-02:** treat it as an amendment to the ENV-04 coverage row with a timestamp,
not a silent recomputation -- the same discipline the phase applies to a re-seed. The `59/67` pair
should carry a note that the unit rule does not split at a list-item boundary, or the rule should be
changed and the figure re-derived under a dated amendment.

## Assessment of the three prior fixes

**T-23-07 / `lz-eval-p23-retain.mjs` (`8aaf967`) -- sound on its stated threat, incomplete as a
retention guard.** The path-traversal control is correct and I could not break it. `RUN_ID_RE` is
anchored at both ends and genuinely excludes what it claims: `/`, `\`, `..`, `:`, uppercase, and -- worth
confirming because it is a common trap in other languages -- a trailing newline, since JavaScript `$`
without `m` matches only at end of input. Verified:

```
"20260908-105102-ok"      true      "20260908-105102-ok\n"   false
"20260908-105102-a/b"     false     "20260908-105102-.."     false
"20260908-105102-A"       false
```

`assertInside`'s `+ path.sep` is correct and necessary; the sibling-prefix case is refused, and the
co-test proves it with a fixture that asserts the fixture is genuinely prefix-sharing before asserting
the refusal (`:134-135`) -- a real discrimination test, not a tautological one. Root-equals-candidate,
trailing separators and UNC all behave. Freezing a non-global regex is safe and the co-test asserts
`RUN_ID_RE.global === false`, which is the right thing to pin.

Two gaps: no destination-existence check (CR-07) and case-sensitive comparison on a case-insensitive
filesystem (WR-09). The symlink limitation is disclosed honestly at `:30-33` and I have nothing to add
to it. The second `assertInside` on the composed `dest` (`:136`) is unreachable-by-construction given
the first passed and the run-id pattern admits no separator -- harmless defense in depth, not a defect.

**The guard that did not guard (`f778b13`) -- sound, and now genuinely discriminating.** The replacement
at `citation-audit.test.mjs:181-203` matches every occurrence of a support/groundedness word and
requires a `NOT` immediately in front of it. That is an affirmative-claim check, so it would catch a
relabel to `"factual support: 12/40"` -- the exact regression the original inflection-mismatch assertion
let through. The comment records why the old form was hollow, which is the part that keeps it from
regressing again.

**The stale comment on a live control (`d0bf303`) -- sound, and the `/g` is confirmed required.**
`PLACEHOLDER_RE` carries two distinct placeholders, so without `/g` the dispatched prompt would ship a
literal `{{CLAIM}}`. The corrected comment's claim that `/g` does not weaken the T-22-15 fix is right,
and I verified the whole substitution path end to end rather than taking it on the comment:

```
CUTOFF (day-month-year): 02-03-2020
CLAIM: A $& $` $' $$ {{CLAIM_DATE}} claim
```

All four dollar sequences round-trip literally, and a `{{CLAIM_DATE}}` literal inside the claim is not
re-substituted. Nothing in `buildDispatchString` can leave an unsubstituted placeholder, double-substitute,
or mangle a regex-special claim. Also checked and clean: `CLAIM|CLAIM_DATE` alternation order is
leftmost-first, so `{{CLAIM_DATE}}` matches only via backtracking to the second branch -- it works, and
it is fragile enough to be worth reordering to `CLAIM_DATE|CLAIM` if the pattern is ever touched.

## Also checked and found clean

Recording these so a later reader knows they were examined, not skipped.

- **`mulberry32` and the seeded draw.** One generator instance consumed left to right in frozen
  `DIRECTIONS` order; the first five outputs are pinned by a co-test; `selectIndices`' partial
  Fisher-Yates uses `i + floor(rand() * (len - i))` with a half-open `rand()`, so `i <= j < len` and no
  swap can read out of bounds. The balance guard is correct at the boundary -- a pool with exactly
  `nPerDirection` survivors draws, 19 refuses, and both are tested. `nPerDirection: 0` consumes no
  randomness and so cannot shift a later direction's stream. Determinism is proven by a deep-equal
  same-seed pair and falsified by a different-seed selection.
- **Global-regex `lastIndex` hazards.** `String.prototype.matchAll` clones its regex and `split`
  species-constructs a sticky clone, so none of the module-level `/g` scanners leak `lastIndex` across
  calls; `hasCitationToken` (`citation-audit.mjs:501-511`) additionally builds a fresh `RegExp` per
  `.test` with a comment saying why. Consistent and correct.
- **Frozen-regex safety.** `LEDGER_HEADING_RE`'s comment that a frozen GLOBAL regex would throw on
  `exec`/`test` is accurate -- `Object.freeze` makes `lastIndex` non-writable and these modules are strict.
  Both frozen regexes are correctly non-global.
- **CRLF handling.** `verify-complete.mjs` splits on `/\r?\n/` and `citation-audit.mjs` normalizes
  `\r\n?` first; a CRLF report parses identically to LF. Verified by probe.
- **Windows path handling** in `retain.mjs` beyond WR-09: `path.resolve` from `fileURLToPath(import.meta.url)`
  is cwd-independent as claimed, `path.sep` is used rather than a hardcoded separator, and UNC and
  drive-relative shapes fail closed.
- **`validateManifest`'s zero-byte report check** (`baseline-manifest.mjs:348-356`) is the right shape
  for defect B2: exactly zero bytes, a truncation check rather than a content heuristic, and `statSync`
  on a directory also fails closed.
- **`buildManifest`'s three optional provenance fields** are defensively copied and only added when
  supplied, so the pre-existing 8-field shape is genuinely unchanged for existing callers.
- **CLI guards.** All five thin CLIs use `fileURLToPath(import.meta.url) === path.resolve(process.argv[1])`,
  so importing runs nothing, and all exit 2 on a `ContractError`. `resolvability.mjs`'s CLI correctly
  refuses to run without a global `fetch` rather than silently producing an empty envelope.
- **Test suite.** 197/197 pass across the 11 phase-23-registered files (explicit-file form, per the
  host's `node --test <dir>` quirk). All 15 registered files are present in `ci.yml` with no duplicates
  and no missing entry.

One observation outside the change set, offered only because it bears on the reproducibility this tree
is built for: `ci.yml`'s pre-existing `cd eval && (npm ci || npm install)` falls back to an unpinned
install when `npm ci` fails on lockfile drift, and the gate still goes green. Not a phase-23 finding --
the line is unchanged context in this diff -- but it undercuts the pinned-devDependency guarantee the
surrounding comment describes.

## Compliance confirmation

- **No planning file modified.** `.planning/STATE.md`, `.planning/ROADMAP.md` and `.planning/config.json`
  are untouched; no `gsd-tools query` was run, so no SDK side-effect mutation was possible. `git status`
  was clean immediately before this file was written.
- **No source file modified.** Review only. No `Edit` or `Write` against any `.mjs`, `.yml`, `.md`
  record, SUMMARY, PLAN, pre-registration or capture driver.
- **No retained data mutated.** `eval/.cache/` and `.lz-research/` were read only -- `readFileSync`,
  `readdirSync`, `existsSync`, `statSync`. No `git clean` in any form. Every probe fixture was created
  under `os.tmpdir()` via `mkdtempSync`; the one `retainRunDirectory` call naming a live cache path
  returns a string and writes nothing by construction.
- **This artifact is ASCII, LF, no BOM,** and avoids the banned vocabulary.

---

_Reviewed: 2026-09-08_
_Reviewer: Claude (gsd-code-reviewer), Opus 5 (`claude-opus-5[1m]`)_
_Depth: deep_
