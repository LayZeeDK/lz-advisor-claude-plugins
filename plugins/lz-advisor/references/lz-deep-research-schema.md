# Deep-Research Data-Contract Schema

This is the single source of truth for the deep-research data contract: the JSON
shapes every component in the pipeline reads and writes, the tally rubric that
maps a vote tally to a confidence level, the named-ceilings contract, the
quote-recheck contract, and the two structurally separate verification
assurances. The deep-research aggregator script
(`${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`)
is AUTHORITATIVE for every shape it consumes or emits; this document freezes
those shapes verbatim and never paraphrases them.

These downstream components consume this contract and MUST implement against it:

- **Phase 18** (eval harness + verify-voter): reads the frozen vote record and
  the corrected tally rubric; owns the new `claim_support` assurance and the
  reserved voter envelope.
- **Phase 19** (search + extract workers): WRITE the `claims/`, `excerpts/`, and
  `sources/` files to the frozen shapes below.
- **Phase 20** (orchestrator + synthesis): READS `survivors.json` and AUGMENTS
  it into the report claim record, joining the source record for citations and
  promoting cross-source contradictions to `Contested`; enforces the carried
  ceilings (`ANGLES`, `MAX_FETCH`) at wave dispatch.

SKILL.md files point AT this document for the schema; they never inline it. This
reference is the canonical home for the schema, so the skills stay free of
cross-skill body references (one skill must not reference another skill's named
sections; shared knowledge lives here).

## Anti-drift discipline (D-12)

The aggregator SOURCE is authoritative for every aggregator-consumed and
aggregator-emitted shape. This document freezes them by COPYING field names,
enum values, and rubric branches byte-for-byte from the code -- never by
re-deriving them in fresh prose. The authoritative functions, all in
`skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs`, are:

- `aggregate(runDir)` -- the top-level pipeline; writes the survivor record and
  the stdout summary.
- `tally(cl, runDir, capsOut)` -- the vote rubric; returns the confidence label.
- `mergeClusters(runDir)` -- reads `claims/*.json`; corroboration as a
  distinct-source Set.
- `quoteOutcome(member, excerptsById, allExcerpts)` -- the three-way quote
  outcome.
- `recheckClusters(clusters, excerpts)` -- cluster survival + cluster-level
  `quote_fidelity`; emits the dropped record.
- `enforceCeilings(rankedClusters)` -- the observable `MAX_VERIFY_CLAIMS` cap.
- `CEILINGS` -- the single frozen ceilings object.

Any future change to a frozen shape MUST update the code AND this reference in
lockstep. If the doc says `corroboration_lower_bound` but the code emits a
different name, the contract is wrong; the code wins, and the doc must be
corrected to match. Field names below are quoted exactly as the source emits
them (snake_case, e.g. `corroboration_lower_bound`, never camelCase).

A formal machine-enforced JSON Schema (a schema-keyword document plus a runtime
validator library) is deliberately NOT used. The aggregator's runtime
enforcement is the fail-closed `JSON.parse` (via `readJson`), the `ContractError`
class, the WR-01/WR-02/WR-03 field guards in `mergeClusters` (reject a missing
`text`, `quote`, or `source`), and the `safeId` path-traversal guard. That
existing enforcement is the reason a second validator would be redundant and a
zero-dependency violation.

## Run-dir layout

The run dir is an immutable per-file blackboard. Each producer writes its own
files; nothing is a shared appendable ledger. The aggregator reads `claims/`,
`excerpts/`, and `votes/`; it writes `survivors.json`. The `sources/` record is
forward-declared for the synthesis citation join (the aggregator does not read
it).

```
<run-dir>/claims/<worker-id>.json   -> {"worker","source","claims":[{"id","text","quote","excerpt_id"}]}
<run-dir>/excerpts/<excerpt-id>.txt -> plain UTF-8 (CRLF or LF; BOM tolerated)
<run-dir>/votes/<id>-<seat>.json    -> {"verdict":"unrefuted"|"refuted"}  (missing seat -> "insufficient")
<run-dir>/sources/<source-id>.json  -> {"id","url","title","fetched_at",...}  (NEW; D-07; aggregator does NOT read it)
<run-dir>/survivors.json            -> the output array (<= SYNTH_CAP)
```

The `claims[].source` value, every `survivors[].sources[]` entry, and the
`sources/<source-id>.json` `id` MUST be the SAME canonical source key (D-08; see
"The source record"). `worker-id` and `excerpt-id` are filename basenames; ids
derived from file content are run through `safeId` (basename-only; rejects path
separators, `.`, `..`).

## The source record (sources/<source-id>.json)

A dedicated per-source metadata record, forward-declared for Phase 19 (the
extract worker writes it) and Phase 20 (synthesis joins it for inline citations,
PIPE-06). The aggregator does NOT read this file: corroboration counts the
source id only, via a Set in `mergeClusters`, so the metadata is irrelevant to
the off-model reduction.

```json
{
  "id": "https://example.org/a/study",
  "url": "https://example.org/a/study",
  "title": "A randomized study of X and Y",
  "fetched_at": "2026-06-15T00:00:00Z"
}
```

| Field | Type | Required | Owner | Notes |
|-------|------|----------|-------|-------|
| `id` | string | yes | Phase 19 extract worker | The canonical source key. MUST equal `claims[].source` and the `survivors[].sources[]` entries (D-08). |
| `url` | string | yes | Phase 19 extract worker | The fetched URL (typically the canonical URL). |
| `title` | string | yes | Phase 19 extract worker | The source title for the citation. |
| `fetched_at` | string | optional | Phase 19 extract worker | ISO-8601 fetch timestamp. Forward-looking; additive. |

Forward-looking fields beyond `{id, url, title}` (e.g. `fetched_at`,
`publisher`) are additive and at the worker's discretion; consumers MUST ignore
unknown fields.

**Canonical-URL key rule (D-08, VERIF-03 source-independence).** The
`source-id` is a canonicalized source key so that N syndicated copies of one
source count as ONE distinct source. The Phase-19 extract worker computes the
canonical key (e.g. lowercase scheme + host, strip default ports, strip tracking
query parameters, strip a trailing slash and URL fragment) and uses that
identical key everywhere it writes the source: in `claims[].source`, and as the
`sources/<id>.json` `id`. This reference fixes the rule at the contract level;
the extract worker implements the exact canonicalization (Phase 19).

## The claim record (claims/<worker-id>.json)

The PIPE-05 worker-input shape, read by `mergeClusters`. One file per worker; a
`claims` array of falsifiable claims, each with the verbatim `quote` and the
`excerpt_id` that cites the stored excerpt the quote was drawn from.

```json
{
  "worker": "w1",
  "source": "https://example.org/a/study",
  "claims": [
    {
      "id": "c1",
      "text": "X reduces Y by 30%",
      "quote": "X reduces Y by 30%",
      "excerpt_id": "e1"
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `worker` | string | informational (not enforced by aggregator) | The producing worker id. Not read by `mergeClusters`; included for human readability and Phase 19 traceability only. |
| `source` | string | yes (fail-closed) | The canonical source key (D-08). `mergeClusters` rejects a missing or empty `source` (WR-03): a missing source would leak `null` into the frozen `sources[]` and silently under-count corroboration. |
| `claims[].id` | string | yes (fail-closed) | Claim id; used as the first-member fallback for the vote-file lookup. `mergeClusters` rejects a missing or empty `id` (AGG-1; test co-labeled WR-04 for the SC-4 acceptance anchor: `ContractError('claim missing non-empty id', ...)`). Without the guard a missing `id` coerces to the literal `"undefined"` in `tally()`'s member-id vote-file fallback (`votes/undefined-0.json`), cross-contaminating vote tallies across all id-less claims. |
| `claims[].text` | string | yes (fail-closed) | The claim text; becomes the survivor `claim`. `mergeClusters` rejects a missing or empty `text` (WR-02). |
| `claims[].quote` | string | yes (fail-closed) | The verbatim supporting quote; checked by the quote-recheck. `mergeClusters` rejects a missing or empty `quote` (WR-01). |
| `claims[].excerpt_id` | string | optional | The cited excerpt's basename. If absent, the cited-excerpt check is skipped and the quote can only verify as `downgraded` via some other excerpt. |

Clustering: `mergeClusters` merges two claims into one cluster when
`jaccard(a.text, b.text) >= 0.6` (an under-merge bias -- two paraphrases below
the threshold stay separate). The first cluster is always `cluster0`
(`'cluster' + clusters.length`), the second `cluster1`, and so on.

## The stored-excerpt (excerpts/<excerpt-id>.txt)

The PIPE-04 evidence artifact: plain UTF-8 text, one file per excerpt, read by
`loadExcerpts`. The excerpt is the immutable evidence a quote is re-checked
against; it is stored at fetch time so the quote-recheck is verifiable and
reproducible.

- Encoding: plain UTF-8. CRLF or LF line endings are both tolerated; a leading
  BOM is tolerated.
- `excerpt-id` is the filename basename (the `.txt` stripped), run through
  `safeId`.
- Comparison is BOM- and newline-insensitive: every excerpt is read once and
  pre-normalized by `normalize()` (BOM strip, CRLF/CR -> LF, lowercase,
  non-alphanumeric -> space, number-word fold, drop the token `percent`), so a
  CRLF-saved excerpt still matches an LF-captured quote and "30%" matches
  "thirty percent".

## The vote record (votes/<id>-<seat>.json)

Per-seat adversarial verdicts, read by `tally`. The aggregator-consumed core is
frozen hard; the voter-authored companion fields are a reserved, additive-only
envelope.

### Frozen aggregator-consumed core (D-09)

```json
{ "verdict": "unrefuted" }
```

- `verdict` is `"unrefuted"` or `"refuted"`. This is exactly what `tally` reads
  via `readJson(f).verdict`.
- A missing seat file -> the seat counts as `"insufficient"`. A present file
  with `verdict == null` also -> `"insufficient"`.
- Seats are 0-indexed: `votes/<id>-0.json`, `votes/<id>-1.json`,
  `votes/<id>-2.json`.
- Seats are capped at `VOTES_PER_CLAIM` (3) BY FILE NAMING: `tally` reads seats
  `0..VOTES_PER_CLAIM-1`; a 4th-and-beyond seat file is ignored deterministically
  and counted into `caps.votes_ignored` (observability-as-contract).
- Vote-file lookup per seat is cluster-id FIRST
  (`<clusterId>-<seat>.json`), then the first-member claim id
  (`<memberId>-<seat>.json`). The first cluster is `cluster0`, so the
  conventional file name is `cluster0-<seat>.json`.

### Reserved voter envelope (D-10; Phase-18-owned semantics)

The voter MAY add companion fields to the same vote file. These are
FORWARD-DECLARED as an additive-only reserved envelope; their prompt-level
semantics are owned by Phase 18:

- `attack_mode` (VERIF-01) -- the adversarial framing the voter used.
- `disconfirming_query` (VERIF-02) -- the disconfirming search the voter ran.
- a source-independence note (VERIF-03).

Rule: Phase 18 MAY fill these fields' semantics and MAY add further fields, but
MUST NOT change the consumed shape of `verdict`. The aggregator reads only
`verdict`; everything else in the vote file is invisible to the off-model
reduction.

## The quote-recheck contract

The quote-recheck runs UPSTREAM of the vote tally (a fabricated quote is
removed before any vote is counted). It guards verbatim CONSISTENCY only --
whether the quote is a verbatim match against a stored excerpt. Whether the
quote actually entails the claim is a separate assurance (`claim_support`; see
"The two assurances"). Source: `quoteOutcome` and `recheckClusters`.

### Three-way per-member outcome (quoteOutcome)

For a member's normalized quote `nq = normalize(member.quote)`:

| Outcome | Condition | Effect |
|---------|-----------|--------|
| `verified` | `nq` is present in its CITED excerpt (`cited != null && cited.includes(nq)`) | Full quote-fidelity assurance; member kept. The null check is load-bearing: it fires when `excerpt_id` is absent (a valid optional case per the claim schema), so a missing cited excerpt cannot throw and the quote falls through to the downgraded/dropped paths. |
| `downgraded` | `nq` is absent from the cited excerpt but present in SOME OTHER stored excerpt (`allExcerpts.some(ex => ex.includes(nq))`) | Real text, wrong attribution -- member KEPT, fidelity lowered, NOT dropped. |
| `dropped` | `nq` is absent from ALL stored excerpts, OR `nq === ''` (empty normalized quote) | Member removed. |

### Cluster-level survival and quote_fidelity (recheckClusters)

- A cluster SURVIVES iff it has at least one member whose outcome is `verified`
  or `downgraded`.
- The cluster's `quote_fidelity` is `'verified'` if at least one kept member is
  `verified`, otherwise `'downgraded'` (any verified member lifts the cluster).
- A cluster with ZERO kept members (every member `dropped`) is removed and
  recorded in the dropped list.

### The dropped record -- the ONLY claim-removal path

```json
{ "id": "cluster0", "claim": "X reduces Y by 30%", "reason": "quote-not-in-any-excerpt" }
```

This is the only path that removes a claim. The vote tally NEVER deletes a claim
(see "downgrade-not-delete" in the tally rubric). Source: `recheckClusters`.

### QR-01 caveat (normalized-substring is a lower-bound match)

The re-check is a normalized-SUBSTRING test (`.includes` on the space-joined
token string), NOT a token-sequence or word-boundary test. A short numeric quote
can therefore match inside a longer token -- e.g. `normalize('30')` is "present"
in `normalize('the rate is 130 overall')` because `"...130 overall".includes("30")`
is true. This is the proven, frozen lexical contract inherited from the spike,
and it is an ACCEPTED LOWER-BOUND fidelity property: the re-check guards verbatim
consistency only and may over-verify on substrings, consistent with the
"corroboration is a lower bound" framing. Do NOT add token-boundary padding
without re-freezing these match semantics.

## The tally rubric

The vote tally maps every readable tally to exactly one confidence tier. Source:
the `tally` decision block. This is the corrected Option I rubric -- the two
spike labels (a terminal-delete tier and a fused low-or-contested token) have
been removed. Inputs: `readableSeats` (count of seats with a readable vote file),
`unrefuted` (`seats.filter(v => v === 'unrefuted').length`), `refuted`
(`seats.filter(v => v === 'refuted').length`).

```
readableSeats === 0             -> Unsupported
unrefuted === 3                 -> High
unrefuted >= 1 && refuted >= 1  -> Contested   // voter split: any explicit refutation alongside support
unrefuted === 2                 -> Medium       // refuted === 0 here (the split case is caught above)
otherwise                       -> Low          // thin support, OR refuted-without-support (downgrade-not-delete)
```

The branch order is load-bearing: the split branch (`unrefuted >= 1 && refuted >= 1`)
MUST precede the `unrefuted === 2` Medium branch. If Medium came first, a
2-unrefuted / 1-refuted tally would silently return `Medium` and erase the
dissent the `Contested` value exists to surface.

**Downgrade-not-delete.** The tally never removes a claim. A unanimous
refutation (0 unrefuted / N refuted, no uphold) returns `Low` -- downgraded and
SURFACED, never deleted. `Low` covers BOTH "weak / thin support" AND
"actively-refuted-without-support." The only removal path is the quote-recheck
`dropped` record above.

### Truth table

| unrefuted | refuted | insufficient | readableSeats | -> confidence |
|-----------|---------|--------------|---------------|---------------|
| 0 | 0 | 0 | 0 | `Unsupported` |
| 3 | 0 | 0 | 3 | `High` |
| 2 | 0 | 0 | 2 | `Medium` |
| 1 | 0 | 0 | 1 | `Low` (thin support) |
| 1 | 0 | 2 | 1 | `Low` (thin support) |
| 0 | 3 | 0 | 3 | `Low` (downgrade-not-delete; surfaced, never deleted) |
| 2 | 1 | 0 | 3 | `Contested` (voter split) |
| 1 | 1 | 1 | 2 | `Contested` (voter split) |
| 1 | 2 | 0 | 3 | `Contested` (voter split) |

## The confidence enum

There is ONE confidence vocabulary, byte-identical in code and contract. There
is no second per-report confidence field and no mapping table -- the single enum
below is the only confidence vocabulary at any stage.

```
High | Medium | Low | Contested | Unsupported
```

- This enum is emitted by `tally` and stored on every survivor record and every
  report claim record (`confidence`).
- `Contested` is FIRST-CLASS (PIPE-08): the deterministic tally emits it on a
  per-claim voter split (>=1 `unrefuted` AND >=1 `refuted`), and the Phase-20
  synthesis stage MAY additionally promote a cross-source contradiction to the
  SAME `Contested` value -- one value, one meaning ("genuine disagreement").
  This enum value IS the VERIF-05 contested-split escalation signal: escalation
  keys on any `Contested` claim.
- The two spike-inherited labels (a terminal-delete tier and a fused
  low-or-contested token) are NOT part of the contract; they were an accidental
  spike artifact, corrected in the aggregator before this freeze.

## The two assurances

A reported claim carries TWO structurally separate verification assurances. They
answer different questions, have different owners, and are NEVER conflated or
derived one from the other (D-04/D-05).

### Assurance 1 -- quote verified verbatim (`quote_fidelity`)

- Answers: is the quote a verbatim match against its cited stored excerpt?
- Field: `quote_fidelity`, enum `verified | downgraded`.
- Owner: the AGGREGATOR. MECHANICAL, deterministic, off-model (computed by
  `quoteOutcome` / `recheckClusters`). FROZEN verbatim from the aggregator.

### Assurance 2 -- claim supported by the quote (`claim_support`)

- Answers: does the quoted text actually entail the claim?
- Field: `claim_support`, enum `supported | partial | unsupported`, plus
  `unassessed` for the not-yet-voted state.
- Owner: the VOTER / SYNTHESIS (Phase 18/20). A JUDGMENT, never mechanical. NEW
  field; the aggregator does not emit it.

`claim_support` is NEVER derived from or collapsed into `quote_fidelity`. They
are orthogonal axes: the quote can be a perfect verbatim match AND still fail to
support the claim.

### Worked example (the VERIF-06 orthogonality)

Consider a survivor whose quote is real and correctly attributed, but does not
entail the claim. The aggregator marks `quote_fidelity: verified` (the quote IS
present verbatim in its cited excerpt). When the voter judges entailment, it
marks `claim_support: unsupported` (the verbatim quote does not actually support
the broader claim). The report claim record carries both, side by side:

```json
{
  "id": "cluster0",
  "claim": "Drug X cures the disease in most patients",
  "sources": ["https://example.org/a/study"],
  "corroboration_lower_bound": 1,
  "quote_fidelity": "verified",
  "confidence": "Medium",
  "claim_support": "unsupported",
  "citation": "A randomized study of X and Y (https://example.org/a/study)"
}
```

Here the cited excerpt verbatim contains "X improved the marker in 12% of
patients" (so `quote_fidelity: verified` -- the quote is real and correctly
attributed), but that quote does not entail "cures the disease in most patients"
(so `claim_support: unsupported`). Collapsing the two assurances into one field
would let the verbatim match launder an unsupported claim into looking verified
-- exactly the conflation VERIF-06 exists to prevent.

## The aggregator survivor record (stage 1)

Written by `aggregate()` to `survivors.json` (an array, capped at `SYNTH_CAP`).
The frozen field set, IN THIS ORDER:

```json
{
  "id": "cluster0",
  "claim": "X reduces Y by 30%",
  "sources": ["s1", "s2"],
  "corroboration_lower_bound": 2,
  "quote_fidelity": "verified",
  "confidence": "High"
}
```

| Field | Type | Allowed values | Owner | Notes |
|-------|------|----------------|-------|-------|
| `id` | string | `cluster<N>` | Aggregator (`mergeClusters`) | Cluster id by first-seen order. |
| `claim` | string | -- | Aggregator | The cluster's representative claim text (first member's `text`). |
| `sources` | string[] | canonical source keys, sorted ascending | Aggregator | Distinct source ids only; no raw excerpt text. |
| `corroboration_lower_bound` | integer | `cluster.sources.size` (POST-recheck) | Aggregator | A distinct-source LOWER bound (see caveat). Value is the post-`recheckClusters` distinct-source count: sources whose ONLY member was quote-dropped no longer appear in this Set. A 3-source merge-time cluster that loses 2 sources to fabricated-quote drops emits `corroboration_lower_bound: 1`. The schema's merge-time under-count (D-09) and this post-recheck narrowing are both intentional: only sources with at least one verifiable quote contribute to the count. |
| `quote_fidelity` | string | `verified \| downgraded` | Aggregator | Assurance 1. |
| `confidence` | string | `High \| Medium \| Low \| Contested \| Unsupported` | Aggregator (`tally`); synthesis may promote to `Contested` | Mandated on every survivor record (SC-3). |

**Corroboration is a lower bound (caveat).** `corroboration_lower_bound` is the
size of the distinct-source Set AFTER `recheckClusters`, never an exact independence count.
Two under-counts apply: (1) the merge-time under-count: two paraphrases from ONE source count
as 1, not 2 (D-09); (2) the post-recheck narrowing: if a source's only member is quote-dropped
(fabricated or absent from all excerpts), that source no longer appears in the cluster's Set.
Both are intentional -- only sources with at least one verifiable quote contribute. It is a
floor on independent corroboration, not a precise measure.

## The report claim record (stage 2)

Assembled by the Phase-20 synthesis step as a SUPERSET of the survivor record.
There is NO separate report-stage confidence field; `confidence` is the one enum
across both stages, and synthesis MAY upgrade a claim's `confidence` to
`Contested` on a cross-source contradiction.

Report claim record = the survivor fields PLUS:

- `claim_support` -- Assurance 2 (`supported | partial | unsupported | unassessed`),
  populated by the voter/synthesis (Phase 18/20).
- `citation` -- the inline citation, joined from the source record (PIPE-06).

```json
{
  "id": "cluster0",
  "claim": "X reduces Y by 30%",
  "sources": ["https://example.org/a/study", "https://example.org/b/review"],
  "corroboration_lower_bound": 2,
  "quote_fidelity": "verified",
  "confidence": "High",
  "claim_support": "supported",
  "citation": "A randomized study of X and Y (https://example.org/a/study); A review of X (https://example.org/b/review)"
}
```

Every report claim record structurally carries a `confidence` field (SC-3) and
BOTH assurances -- `quote_fidelity` and `claim_support` (SC-4).

## The named-ceilings contract

The single frozen ceilings object, copied verbatim from `CEILINGS`:

```javascript
export const CEILINGS = Object.freeze({
  ANGLES: 5,
  MAX_FETCH: 15,
  MAX_VERIFY_CLAIMS: 24,
  VOTES_PER_CLAIM: 3,
  SYNTH_CAP: 20,
});
```

Enforcement is split across two stages:

| Ceiling | Value | Enforced by | What it caps |
|---------|-------|-------------|--------------|
| `MAX_VERIFY_CLAIMS` | 24 | Aggregator (`enforceCeilings`) | Ranked clusters carried into the tally (applied AFTER ranking; the cap is recorded in `caps.claims`). |
| `VOTES_PER_CLAIM` | 3 | Aggregator (`tally`) | Vote seats read per claim; extra seats are ignored and counted into `caps.votes_ignored`. |
| `SYNTH_CAP` | 20 | Aggregator (`aggregate`) | The `survivors` output array (the cap is recorded in `caps.synth`). |
| `ANGLES` | 5 | Phase-20 orchestrator (at wave dispatch) | Number of decomposition angles / search waves. CARRIED by the aggregator, not enforced by it. |
| `MAX_FETCH` | 15 | Phase-20 orchestrator (at wave dispatch) | Max distinct fetches per run. CARRIED by the aggregator, not enforced by it. |

Every cap fires observably: the aggregator records each fired cap in the `caps`
object and surfaces it in the stdout summary's `capped:` line (no silent
truncation).

## The stdout summary and exit codes

`aggregate()` returns a deterministic, counts-only, four-line summary (never raw
source text). The CLI prints it to stdout. The fourth line names all five
confidence tiers in enum order.

```
raw: <rawCount> -> clusters: <clusterCount> (merged: <K>)
quote-recheck: verified <A> | downgraded <B> | dropped <C>
capped: <none | claims X->24 [synth Y->20] [votes_ignored N]>
survivors: <Z> (High <h>, Medium <m>, Low <l>, Contested <c>, Unsupported <u>)
```

**`votes_ignored` scope caveat.** When both `MAX_VERIFY_CLAIMS` and `SYNTH_CAP`
fire, `votes_ignored` may include counts from clusters that did not survive
`SYNTH_CAP` (e.g. clusters 21-24 in the `MAX_VERIFY_CLAIMS=24` / `SYNTH_CAP=20`
gap): `tally()` accumulates extra-seat counts for all ranked clusters before
`SYNTH_CAP` drops the overflow. This is a documented scope caveat of the EXISTING
observability counter; tightening the count to survivors-only is deferred (AGG-4,
Phase 18 review D-02). It does not affect tally results -- only the reported
`votes_ignored` figure.

CLI exit codes: `0` on success (writes `survivors.json`, prints the summary);
`2` on a contract violation -- a missing or non-directory `<run-dir>`, or any
`ContractError` (malformed JSON, a missing required field, an unsafe id) -- with
a stderr message naming the offending file.

## Stage-ownership summary

Who writes, reads, and owns each contract element:

| Element | Primary owner | Stage | Notes |
|---------|---------------|-------|-------|
| `quote_fidelity` | Aggregator (`quoteOutcome` / `recheckClusters`) | aggregate | Mechanical; Assurance 1; frozen. |
| `confidence` + tally rubric | Aggregator (`tally`) | aggregate; synthesis may promote to `Contested` | One 5-tier enum. |
| `corroboration_lower_bound` | Aggregator (`mergeClusters` Set size) | aggregate | Distinct-source lower bound. |
| `claim_support` | Voter / synthesis (Phase 18/20) | report | Judgment; Assurance 2; NEW. |
| `verdict` (vote consumed core) | Voter writes / aggregator reads | vote / aggregate | Frozen-hard consumed shape (D-09). |
| `attack_mode` / `disconfirming_query` / source-independence note | Voter (Phase 18) | vote | Reserved envelope; additive-only (D-10). |
| Source record + canonical-URL key | Extract worker writes (Phase 19) / synthesis joins (Phase 20) | source / report | Aggregator does NOT read it; citation join (D-07/D-08). |
| `citation` (inline) | Synthesis (Phase 20) | report | Joined from the source record. |
| `MAX_VERIFY_CLAIMS` / `VOTES_PER_CLAIM` / `SYNTH_CAP` | Aggregator | aggregate | Actively enforced, observable caps. |
| `ANGLES` / `MAX_FETCH` | Phase-20 orchestrator | dispatch | Carried by the aggregator; enforced at wave dispatch. |
