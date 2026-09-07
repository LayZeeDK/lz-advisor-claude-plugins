# Phase 23 judge-free confidence and operating envelope -- pre-registered rule (ENV-01 / D-16)

This is the single source of truth for every bar, item list, rule, seed, disclosure, pre-committed
conditional and termination in Phase 23. It is PRE-REGISTERED: it is written and committed with a
timestamp BEFORE any report is captured, any vote is cast or any figure is scored, so no bar can be
rationalised afterwards (D-16). The commit that carries this file is the pre-registration timestamp of
record for the whole phase, and every later plan proves it came first with git's ancestry test rather
than by comparing commit timestamps.

The authority is
`.planning/phases/23-judge-free-confidence-and-operating-envelope-for-lz-deep-res/23-CONTEXT.md`
D-01 through D-22, plus `23-RESEARCH.md`. It mirrors the `eval/lz-eval-parity-prereg.md` discipline (the
Phase-22 pre-registered lock rule) and the `eval/lz-eval-lock-rule.md` discipline before it.

**Phase 22 is SPENT, and nothing in it authorizes anything here.** `22-05-PLAN.md` is TERMINAL. The
single authorized calibration attempt is CONSUMED. AMENDMENT RECORD 3's stopping rule stands: no third
instrument, no prompt revision, no widened WiCE draw, no subgroup read. **No subgroup figure from the
Phase-22 data -- including the clear-cut subset that satisfies the entire Phase-22 gate predicate -- may
authorize any spend, relax any bar, or stand in for any Phase-23 reading here.** This document does not
reuse, amend, re-open or edit Phase 22's pre-registration. Phase 23 has its own authority, and this is
it.

## Frozen NUMBERS match the module constants byte-for-byte (anti-drift, ENV-01)

Every frozen NUMBER below is a module-level `Object.freeze`d LITERAL in the Plan 23-01 / 23-02 / 23-03
eval modules, chosen and committed BEFORE any capture, vote or score. They are NOT computed from any
reading. The anti-drift co-test `eval/lz-eval-p23-prereg.test.mjs` asserts the prose numbers below equal
those constants byte-for-byte, and asserts that each value-plus-one form is ABSENT, so post-hoc bar
tuning fails a test rather than passing unnoticed. The code is AUTHORITATIVE; if a number here ever
disagrees, the code wins and this document is wrong and must be corrected to match. Do NOT change a
number in one place without changing it in the other.

| Constant | Value | Source module |
|----------|-------|---------------|
| `SLICE_A_GATE.N_SUP_MIN` | 8 | `eval/lz-eval-sliceA-gold.mjs` |
| `SLICE_A_GATE.N_REF_MIN` | 8 | `eval/lz-eval-sliceA-gold.mjs` |
| `DRAW.SEED` | 20260907 | `eval/lz-eval-p23-sliceA-draw.mjs` |
| `DRAW.N_PER_DIRECTION` | 20 | `eval/lz-eval-p23-sliceA-draw.mjs` |
| `SPIKE_CEILING.MAX_RESUME_CYCLES` | 3 | `eval/lz-eval-p23-verify-complete.mjs` |
| `SPIKE_CEILING.MAX_RESET_WINDOWS` | 2 | `eval/lz-eval-p23-verify-complete.mjs` |
| `RESOLVE_LIMITS.TIMEOUT_MS` | 10000 | `eval/lz-eval-p23-resolvability.mjs` |
| `RESOLVE_LIMITS.MAX_BYTES` | 262144 | `eval/lz-eval-p23-resolvability.mjs` |
| `RESOLVE_LIMITS.MAX_REDIRECT_HOPS` | 3 | `eval/lz-eval-p23-resolvability.mjs` |
| `UNCITED.MAX_RANGE_SPAN` | 32 | `eval/lz-eval-p23-citation-audit.mjs` |

The non-numeric frozen constants are pinned by the same co-test through their owning modules and are
consumed BYTE-IDENTICAL: `ARXIV_RE`, `DOI_RE`, `KEEP_PARAMS` and `UNCITED` in
`eval/lz-eval-p23-citation-audit.mjs`; `SCHEME_ALLOWLIST` and `RESOLVE_OUTCOMES` in
`eval/lz-eval-p23-resolvability.mjs`; `LEDGER_HEADING_RE` in `eval/lz-eval-p23-verify-complete.mjs`; and
the voter prompt template rendered by `buildDispatchString` in `eval/lz-eval-p23-sliceA-read.mjs`
(Section (xiii)).

## Section (i) -- The capture budget, and its ratification (D-01 / D-03 / D-04)

Phase 23 budgets **ONE fresh capture pair (q2), on both systems**, gated behind the ENV-05 spike. The
existing q1 pair is carried as a DISCLOSED second data point, giving Slice-B **n=2**.

This is an **EXPLICIT freeze of a set smaller than Phase 22's frozen n=3**, made here in Phase 23's OWN
pre-registration, with its power implications stated up front (Section (ii)), and **RATIFIED BY THE
MAINTAINER at discuss time** (2026-09-06). It is the RETROSPECTIVE DEVIATION NOTE's option 2, done
properly.

**A deferral is not a ratification. This one is a ratification, and it is recorded as such.** The
distinction is the whole reason this section exists. In Phase 22 the maintainer DEFERRED the full n=3
campaign and the executing session then carried n=1 forward as though the design had been reduced; no
amendment ever covered it. Here the reduction is the decision itself, taken by the maintainer, written
into the pre-registration before any capture, and committed with a timestamp.

**At n=2 no per-question generalisation is available.** That is a limit on the CLAIM, not merely on a
confidence interval (D-04). q1 and q2 are reported as separate rows, never averaged, never combined into
a single rate, and never described as "across both questions". Phase 23 does NOT inherit `n=1` from the
Phase-22 cache by default.

### The frozen q2 question

The single fresh question this phase captures, frozen here and quoted identically in
`eval/lz-eval-p23-capture-driver.md`:

> Which post-training quantization methods preserve accuracy at 4-bit for transformer inference, and
> what accuracy drop does each report?

It cannot be swapped after the capture begins. Its selection reasoning -- bounded and single-facet, in an
arXiv-dense literature so the canonical identifier space is comparable to q1's, forcing numeric claims
that must be cited, and topically disjoint from q1's context-window-extension subject -- is recorded in
the driver's Stage 1.

q1 additionally carries four disclosures that travel with every figure taken from it: it had no MANIFEST
until Plan 23-01 rebuilt one; it has no stored built-in evidence corpus at all; its built-in capture cost
is retry-inflated across three resume cycles plus an earlier billing-limit failure; and three prior
sessions have partial sight of it (Section (vii)). q1 is a disclosed second data point, never a second
data point of equal standing.

## Section (ii) -- The ceiling is stated up front, not discovered (ENV-01 success criterion 6)

**No significance claim is made in Phase 23, and none is reachable at this n.** The arithmetic, stated
here in advance rather than offered afterwards as an excuse:

- The two-sided sign-test minimum at n=5 paired questions is `2 x 0.5^5 = 0.0625`. Even a unanimous
  result cannot cross a conventional 0.05 threshold, because the smallest attainable p-value is already
  above it.
- A perfect 5-for-5 sweep yields only a 95% Clopper-Pearson lower bound of `0.05^(1/5) = 0.549`. A
  one-sided interval whose lower bound sits barely above one half is not a performance claim.

Phase 23 may report DIRECTION, RAW PER-CELL VERDICTS and an OPERATING ENVELOPE. It may never report
significance. **A phase that ends without a significance claim has NOT fallen short** -- it has reported
what its design could support, which is the only honest outcome available at n<=5.

This ceiling binds every reading in the phase, including the ones that turn out favourable. A sweep is
not evidence of significance; it is a sweep at n=2 with the interval above attached.

## Section (iii) -- The exploratory declaration (ICH E9; RESEARCH Pattern 3)

The accepted vocabulary for "a real reading that is nonetheless not a performance claim" is the
CONFIRMATORY / EXPLORATORY distinction, and its canonical statement is regulatory text:

> "Their analysis may entail data exploration; tests of hypothesis may be carried out, but the choice of
> hypothesis may be data dependent. Such trials cannot be the basis of the formal proof of efficacy,
> although they may contribute to the total body of relevant evidence."
> -- ICH E9, *Statistical Principles for Clinical Trials*, section II.B Scope of Trials

> "The protocol should make a clear distinction between the aspects of a trial which will be used for
> confirmatory proof and the aspects which will provide data for exploratory analysis."
> -- ICH E9, same section

That second sentence is the design rule this section answers. **ALL Phase-23 readings are declared
EXPLORATORY, in advance, here.** Under the no-judge constraint there is no confirmatory arm at all: no
threshold was set for any reading to pass, none is applied afterwards, and no reading is the basis of a
formal proof of anything about lz-deep-research. Saying so in the freeze commit is stronger than
disclaiming it afterwards, because a disclaimer written after a result is seen is indistinguishable from
a reaction to that result.

This applies to ENV-03's Slice-A cross-tabulation, to ENV-04's citation audit on the fresh q2 pair, to
the ENV-05 spike's realized ceiling, and to any ENV-06 head-to-head reading that runs.

## Section (iv) -- The no-judge constraints

**NO third judge instrument is calibrated against the Phase-22 bar.** Phase 23 does not retry the
Phase-22 calibration gate in any form.

If a judge is used at all (ENV-06, conditional on the ENV-05 spike), then:

- its agreement is REPORTED as a disclosed limitation, and is NEVER used as a disqualifier; and
- any calibration gate that is used at all keys on a **LOWER-BOUND CI**, never on a point estimate.

The reason is a power fact, not a preference. At n=60 a judge whose TRUE value sits exactly at a 0.50
point bar fails that gate about **47 percent** of the time, with a 95 percent sampling interval spanning
roughly **0.28 to 0.73**. Raising n narrows the interval without reducing the false-fail rate, because
the median stays on the bar. The two realized Phase-22 figures (`mcc=0.4889` and `mcc=0.4531`) are two
draws from that distribution: **evidence of neither adequacy nor inadequacy of the instrument.** They
must never be read as a finding about the judge, and they authorize nothing here.

Per-dimension reads are weaker than system-level ones: pairwise preference is held valid at system level,
while metric-level assessment is held to require expert metric-wise annotation. If ENV-06 runs, it
reports the system-level pairwise outcome as the primary read and the per-dimension breakdown as
explicitly weaker, in the same table.

## Section (v) -- The Slice-A draw (D-08 / D-09 / D-10)

Slice A is judge-FREE, deterministic and DESCRIPTIVE. It passes the verify-voter ONLY the claim text and
the `claim_date` cutoff -- every leaky gold field stripped by `filterSliceA` -- and cross-tabulates the
voter's verdict against the held-back collapsed gold label PER CONFUSION-MATRIX DIRECTION, never pooled.
`sliceARead`'s output key set is exactly `['unrefuted','refuted','n','drawSeed','provisionalLimits']`:
no rate, no interval and no pass/fail field exists to be mistaken for a certification.

### The selection rule and the seed

The draw is a **balanced 40-item selection: 20 unrefuted + 20 refuted** (`DRAW.N_PER_DIRECTION` = `20`).
Balance is required because the tally is reported per direction; an unbalanced draw leaves the smaller
direction's row uninformative.

The draw is sampled from the RE-VERIFIED pool (below), not from the Phase-22 record's 95/216. Selection
is deterministic and seeded: `DRAW.SEED` = `20260907`, **fixed before the draw was ever computed**, and
consumed by a single `mulberry32` instance over a partial Fisher-Yates selection in `DIRECTIONS` order
(`unrefuted` then `refuted`). That order is part of the deterministic contract, not an implementation
detail. Re-seeding after seeing the draw is FORBIDDEN, which is why the realized list is quoted here in
full rather than described.

The routine is `drawBalanced` in `eval/lz-eval-p23-sliceA-draw.mjs`, sampling the OUTPUT of
`filterSliceA` (never the raw rows, or the answer-leak strip would be bypassed).

### The re-verified pool, and the recorded discrepancy against the Phase-22 record

Re-run from the on-disk 500-row AVeriTeC dev cache at zero spend:

```
$ node eval/lz-eval-sliceA-gold.mjs eval/.cache/chenxwh__AVeriTeC/data/dev.json
clean unrefuted=83 clean refuted=181 gate-cleared=true
```

**The Phase-22 pre-registration records "clean Supported = 95, clean Refuted = 216"** from a 2026-06-22
inspection of the same cache. The re-run gives **83 unrefuted / 181 refuted**. This is RECORDED AS A
DISCREPANCY AND NOT RECONCILED:

| Reading | unrefuted / Supported | refuted / Refuted | Source |
|---|---|---|---|
| Phase-22 frozen record (2026-06-22) | 95 | 216 | `eval/lz-eval-parity-prereg.md` Section (v) |
| Phase-23 re-verification (2026-09-07) | 83 | 181 | `node eval/lz-eval-sliceA-gold.mjs` |

The `SLICE_A_GATE` floors (`N_SUP_MIN` = `8`, `N_REF_MIN` = `8`) still clear with wide margin and both
directions stay populated, so the GATE OUTCOME IS UNCHANGED. What changes is only the number this phase
plans on: **83/181 is what Phase 23 plans on.** What caused the drift is not established here and is not
guessed at. The Phase-22 pre-registration is NOT edited, and neither is the gold module's header.

### The realized 40-item draw, quoted in full

This is the frozen Slice-A item set for ENV-03. Both directions, every `drawIndex`, every claim string.
The claim strings are VERBATIM CORPUS DATA and carry their original Unicode: they must not be
ASCII-transliterated, because the anti-drift co-test compares them against what `filterSliceA` actually
emits. That is a deliberate exception to this repository's ASCII preference, which governs SOURCE, not
quoted data.

```
$ node eval/lz-eval-p23-sliceA-draw.mjs eval/.cache/chenxwh__AVeriTeC/data/dev.json
drawn unrefuted=20 refuted=20 seed=20260907 pool-unrefuted=83 pool-refuted=181 unrefuted-first=32 unrefuted-last=28 refuted-first=56 refuted-last=20
unrefuted drawIndex=32 claim=Nigeria’s urban population at independence was approximately 7 million.
unrefuted drawIndex=63 claim=Fact Check: AARP Did NOT Spend 'Millions In TV Ads Targeting Republican Candidates' -- Nonprofit AARP Is Prohibited From Involvement In Any Political Campaigns
unrefuted drawIndex=52 claim=Americans advised to reconsider travel to Ghana due to COVID-19.
unrefuted drawIndex=11 claim=Former President Donald Trump who lost the popular vote by 3 million has nominated a full third of The United Supreme Court, as of 13th October 2020.
unrefuted drawIndex=18 claim=Forty percent of Iowa’s energy resources are from renewables.
unrefuted drawIndex=44 claim=Nigeria’s urban population at the time of independence was approximately 7 million
unrefuted drawIndex=38 claim=52% of Nigeria’s current population lives in urban areas
unrefuted drawIndex=60 claim=The White House blocked a plan to send facemasks to every household in April 2020.
unrefuted drawIndex=54 claim=Basketball superstar Michael Jordan is joining NASCAR as a team owner.
unrefuted drawIndex=46 claim=At independence, Nigeria had a population of 45 million.
unrefuted drawIndex=6 claim=Hunter Biden was chairman of the Nobel Peace Prize winning World Food Program.
unrefuted drawIndex=15 claim=From 8th October the UK government will combine weekly flu and covid reports.
unrefuted drawIndex=17 claim=Labour reversed the 4,400 health health worker cuts by the LNP.
unrefuted drawIndex=56 claim=Sightway Capital is owned by Two Sigma Investments.
unrefuted drawIndex=8 claim=A third of excess deaths in the United States between 1 March and  1 August 2020 during the COVID-19 pandemic could not be directly attributed to the coronavirus
unrefuted drawIndex=49 claim=A Maryland man was sentenced to a year in jail for throwing parties.
unrefuted drawIndex=73 claim=Spraying of Naira notes is an offence punishable by imprisonment in Nigeria.
unrefuted drawIndex=58 claim=The passing of Ruth Bader Ginsburg will have a profound effect on the future of the Supreme Court of America.
unrefuted drawIndex=64 claim=Tourism, lockdown key to deep New Zealand recession.
unrefuted drawIndex=28 claim=The wife of  Lal Bahadur Shastri (ex Prime minister of India) repaid his car loan after his death.
refuted drawIndex=56 claim=it is unknown whether a person under 20 can pass the disease to an older adult.
refuted drawIndex=119 claim=Minneapolis City Council has defunded the police.
refuted drawIndex=139 claim=Nita Ambani is to give Rs 200 crore for Kangana Ranaut’s new studio
refuted drawIndex=87 claim=Olive Garden prohibits its employees from wearing face masks depicting the American flag.
refuted drawIndex=27 claim=Dr Anthony Fauci wrote a paper regarding the Spanish Flu and stated that the majority of deaths in 1918-1919 was because of bacterial pneumonia from wearing masks.
refuted drawIndex=14 claim=Paul Pogba, who plays for Manchester United and the French national team, retired from international football in response to French President Macron’s comments on Islamist terrorism.
refuted drawIndex=83 claim=AARP endorsed President Biden and gave financial support to planned parenthood.
refuted drawIndex=168 claim=Suresh Raina, the Chennai Super Kings (CSK) cricketer, has withdrawn from the upcoming 2020 edition of the IPL after testing positive for COVID-19.
refuted drawIndex=11 claim=Sleeping under a mosquito bed net treated (or not treated) with insecticide is ineffective and harmful to human health.
refuted drawIndex=161 claim=Bill Gates was involved in crafting the TRACE Act.
refuted drawIndex=10 claim=Germany’s Foreign Minister Heiko Maas said that Thailand’s King Maha Vajiralongkorn didn’t do anything illegal while at his German residence.
refuted drawIndex=62 claim=In 1977 Senate Minority Leader Chuck Schumer had an affair with his daughter best friend from high school.
refuted drawIndex=16 claim=Breitbart News reports that the daughter of Delaware Democratic Senator Chris Coons and seven other underage girls were featured on Hunter Biden's laptop.
refuted drawIndex=153 claim=The CDC recommended wearing only certain beard styles to help prevent the spread of coronoavirus.
refuted drawIndex=94 claim=Shah Rukh Khan's Kolkata Knight Riders (KKR) is acquiring a 1.28 per cent stake in Reliance Retail at Rs 5,500 crore
refuted drawIndex=107 claim=Zimbabwe recorded its first coronavirus Infection before 20 February 2020.
refuted drawIndex=91 claim=The State of Massachusetts committed voter fraud by deleting over one million ballot images during the 2020 Presidential Election.
refuted drawIndex=76 claim=Flu shots lead to severe or life-threatening conditions making them unsafe.
refuted drawIndex=54 claim=Swiss Squash player Ambre Allinckx’s refuses to play in India due to safety reasons
refuted drawIndex=20 claim=Cutting the umbilical cord straight away deliberately denies the baby natural immunity so that medical professionals have a reason to vaccinate and medicate them.
```

`unrefuted` `drawIndex` values in draw order: 32, 63, 52, 11, 18, 44, 38, 60, 54, 46, 6, 15, 17, 56, 8,
49, 73, 58, 64, 28.
`refuted` `drawIndex` values in draw order: 56, 119, 139, 87, 27, 14, 83, 168, 11, 161, 10, 62, 16, 153,
94, 107, 91, 76, 54, 20.

Each `drawIndex` is the item's position in THAT DIRECTION's `filterSliceA` output. It is the join key
gold is recovered by at score time and it is NEVER dispatched: the voter record is `{ claim, claim_date }`
and nothing else.

### The PROVISIONAL limits recorded with every Slice-A read

They SCOPE the read; they do not block it. The first two are owned by the frozen gold module and are
recovered through its own accessor; the third is new to this read.

1. uniform 2020 `claim_date` (out-of-cutoff for a 2026 voter; the voter judges the claim as-of 2020).
2. topical narrowness (the AVeriTeC dev set is ~34% US-2020-politics, ~21% COVID -- NOT a representative
   cross-section of general research questions; Slice A speaks to fact-check-style claims, not Slice B
   natural breadth).
3. evidence-set mismatch (the AVeriTeC reference standard was labelled against 2020 evidence while the
   verify-voter searches the live 2026 web, so a verdict-vs-gold disagreement may reflect a different
   evidence set rather than a voter error).

## Section (vi) -- The frozen ENV-04 citation rules (D-02 / D-12 as revised / D-13 / D-18 / D-20 / D-21)

The rules below are frozen VERBATIM from `23-RESEARCH.md` Pattern 2, not paraphrased. Where a Unicode
character appears in the fold list it is written here as its code point, because this document is
otherwise ASCII; the character named is the character folded, and the implementing module
(`eval/lz-eval-p23-citation-audit.mjs`) is authoritative.

### (A) Citation-token extraction

> Handle exactly the forms the prior art handles. The published Markdown-report citation parser states it
> handles "numbered references ([1], [2]), footnote-style references ([^note]), inline Markdown links
> ([text](url)), autolinks (<url>), and ranges ([1-3])" and that it "normalizes line endings and
> whitespace" with "Code block removal strips fenced code sections to prevent false citation matches",
> then "Registry building creates a deduplicated citation list with normalized URLs". Add two forms these
> reports need and that list omits: **bare `arXiv NNNN.NNNNN` in prose** and **scheme-less `host/path`
> strings**.

A `[n-m]` marker range wider than `UNCITED.MAX_RANGE_SPAN` = `32` is prose, not a citation range.

### (B) Identifier canonicalization, in this order

1. **arXiv.** Canonical form is `arXiv:YYMM.NNNNN`. Strip any `arxiv.org/(abs|pdf|html)/` prefix, strip a
   trailing `vN`, strip a trailing `.pdf`, lowercase the scheme prefix to `arxiv:`.
   `https://arxiv.org/abs/2306.15595`, `arXiv 2306.15595` and `arxiv:2306.15595v2` all collapse to
   `arxiv:2306.15595`. This single rule is what makes the two systems comparable at all.
2. **DOI.** Reduce `https://doi.org/10.x/y`, `http://dx.doi.org/10.x/y` and bare `10.x/y` to `doi:10.x/y`,
   lowercased.
3. **Bare URL.** Lowercase scheme and host; drop a `www.` prefix; drop the fragment; drop a trailing
   slash; drop tracking query parameters by a frozen ALLOWLIST-INVERSION -- keep only parameters named in
   the frozen keep-list `KEEP_PARAMS` = `['id','v','page']`, and do not maintain a blocklist of tracker
   names. Add `https://` to a scheme-less `host/path` token before parsing.
4. **Case and Unicode.** Apply `NFC` to every extracted string before comparison. **Do not use NFKC** --
   the Unicode standard warns that Normalization Forms KC and KD "must _not_ be blindly applied to
   arbitrary text", because they erase formatting distinctions and may remove distinctions important to
   the semantics of the text.
5. **Fallback.** A token matching none of the above canonicalizes to itself under (4) and is counted in a
   named `unmatched` bucket that is REPORTED, never silently dropped. A silent drop is how a
   format-sensitive metric hides.

The rule ORDER is frozen: arXiv precedes URL, so the two surface forms of the same paper converge. If URL
ran first they never would, and the whole comparison would be format-sensitive again.

### (C) Unique-source count

The unique-source count is the **cardinality of the canonical identifier set per report**. The built-in's
`[n]` markers are resolved through the bibliography to identifiers BEFORE counting. Counting the built-in's
markers against lz's URLs is precisely the anti-pattern this rule exists to prevent.

### (D) Verbatim-quote match

A quote matches iff, after: `NFC`; collapse of all runs of whitespace (including `U+00A0`, `U+2007`,
`U+202F`) to a single space; fold of `U+2018`/`U+2019` to `'` and `U+201C`/`U+201D` to `"`; fold of
`U+2013`/`U+2014` to `-`; fold of `U+2026` to `...`; trim -- the normalized quote is a substring of the
normalized stored excerpt. **Case-sensitive.** A truncation marker (`...`, `[...]`) in the quote splits it
into segments, each of which must match in order.

Verbatim-quote match runs against STORED EXCERPTS obtained under the D-17 retention protocol
(Section (x)), never against a live fetch. Live re-fetch is used ONLY for link/identifier resolvability
and is reported SEPARATELY with its check date (Section (vi), resolvability, below).

### (E) Uncited-unit count -- STRUCTURAL, and this document says so

The unit is a sentence-level text unit inside the report's body sections (excluding headings, tables, code
fences and the bibliography section), split on `[.?!]` followed by whitespace plus an opening character.
A unit is CITED if it contains a citation token, or if a citation token appears at the end of its
containing paragraph -- adopting the published attribution rule: "When a citation appears at the end of a
passage, it applies to all preceding uncited sentences in that passage."

**This measures citation COVERAGE, not factual support, not groundedness, and not verification.** A
factual-support measure was NOT computed and cannot be, because every published implementation of one
decomposes claims with an LLM and judges support with an LLM or an NLI model, and Phase 23 has no judge
by constraint. That is a clean NOT-ESTABLISHABLE-BY-METHOD item for the envelope, not a gap. The prose of
any Phase-23 artifact must never write "supported" or "grounded" near this number.

### Resolvability (the live half, isolated)

Resolvability is a SEPARATE module (`eval/lz-eval-p23-resolvability.mjs`) with its own entry point and its
own dated output file, so the offline half stays reproducible. Its frozen limits are
`RESOLVE_LIMITS.TIMEOUT_MS` = `10000`, `RESOLVE_LIMITS.MAX_BYTES` = `262144`,
`RESOLVE_LIMITS.MAX_REDIRECT_HOPS` = `3`, with `SCHEME_ALLOWLIST` = `['http:','https:']` re-validated on
every hop and no credential forwarding.

Its named limitation is frozen with it and travels in every envelope it writes: **resolvability does NOT
distinguish a link that never existed from one that has since died** -- that distinction requires a second
third-party archive lookup which ENV-04 does not require and which would widen the network surface.
Resolvability is also NOT a source-quality measure. Read every outcome as of its `checkedAt`.

### Where the bar is set, and where it is not

**The ENV-04 bar is frozen on the FRESH q2 pair (D-02, route (a)), which no session has seen.**

The q1 audit is recorded as a PUBLISHED DRY RUN that does NOT set and does NOT check the bar (D-20). Its
realized figures, quoted from the Wave-3 record `eval/lz-eval-p23-citation-audit-q1-dryrun.md` as realized
and NOT reconciled against anything:

| Metric | built-in q1 | lz q1 |
|---|---|---|
| Unique canonical sources | 18 | 12 |
| Unmatched tokens (reported bucket) | 3 (`marker:[16]`, `marker:[17]`, `marker:[19]`) | 0 |
| Surface `[n]` markers (total / unique values) | 69 / 13 | 0 / 0 |
| Uncited text units (citation COVERAGE, not support) | 19 of 43 | 30 of 64 |
| Verbatim-quote match | not computable (no retained corpus) | 3 of 5 -- SINGLE-SYSTEM diagnostic |
| Resolvability @ 2026-09-07T12:33:22.655Z | 17 resolvable, 1 oversize | 10 resolvable, 2 oversize |

The three `oversize` outcomes are the `262144`-byte read cap firing on a PDF, a GitHub repository page and
a vendor research page -- NOT dead links. No figure in this table set any bar in this document.

### The built-in q1 correction -- THREE quantities, and D-21's own phrase is a MISLABEL

`.planning/notes/phase-22-diagnosis-two-root-causes.md` records **"26 numbered ref markers, 10-item source
list"** for the built-in q1 report, from a partial read of the head and both tails. The full-file
measurement disagrees, and it is recorded here beside the note rather than reconciled into it. **The
diagnosis note stays UNCHANGED and git-clean.**

This is TWO corrections, not one, and the second is a correction to D-21 itself:

| Quantity | Measured | What it measures |
|---|---|---|
| Total surface `[n]` markers | **69** | every `[n]`-shaped token in the report body |
| Unique marker VALUES | **13** | the distinct marker values `[1]`-`[10]` plus `[16]`, `[17]`, `[19]` |
| Unique CANONICAL SOURCES | **18** | the cardinality of the canonical identifier set (16 arXiv identifiers plus two URL identifiers) |

A fourth figure, recorded to make the arithmetic followable: **10** bibliography entries, i.e. markers that
resolve to an identifier through the source list.

**D-21's own phrase "69 markers / 13 unique sources" CONFLATES the second quantity with the third. It is a
MISLABEL: 13 is the unique-marker-VALUE count, and the size of the canonical identifier set is 18.** The
correction stands as recorded, and the number of unique canonical sources is **18** everywhere in this
phase -- it is never written as 13. Bending the extraction rule to reach 13 would have been precisely the
rule-tuned-to-a-number that this phase's commit-ordering control exists to prevent; the frozen rule was
implemented as written and the count was then measured.

### The quote-match asymmetry is a RETENTION failure (D-18)

The built-in's q1 quote-match is not computable because no evidence corpus was kept, NOT because the
built-in is structurally unable to supply one. An ordinary subagent transcript DOES retain fetched web
content -- verified empirically on a contemporaneous transcript carrying 915 KB across 57 `tool_result`
lines and 29 fetch/search calls. What failed was keeping it. Phase 23 therefore does NOT plan around a
permanent one-sided metric and does NOT drop quote-match on the belief that the built-in cannot supply
excerpts. The residual unknown is Section (ix)'s pre-committed conditional.

## Section (vii) -- The contamination disclosure, and the THIRD axis (ENV-04 / D-02 / D-21)

Listing every touch is what makes this disclosure COMPLETE rather than approximately complete. This is
the fullest form: EVERY session that touched either q1 report appears below, including the ones that saw
only metadata, each labelled with what it actually returned.

**How this ledger was established, and why it is not a recollection.** The maintainer could not recall
what had been read, so on 2026-09-07 the Claude session transcripts under
`~/.claude/projects/D--projects-github-LayZeeDK-lz-advisor-claude-plugins/` were parsed as JSONL and each
tool call's RETURNED output was measured. The ledger below is evidence-derived, not remembered. It
supersedes an earlier draft of this section that attributed the prose reads to the wrong session,
described them ambiguously, and understated the research session's line ranges.

**The measure is what each tool call RETURNED into a model's context, not what a process opened.** Several
operations called `readFileSync` over a whole report or a whole stream and then printed only counts or a
few extracted fields. Only the printed output can contaminate, so only the printed output is counted here
-- which is why a whole-file read can appear below as a small number.

**Stream-file access was bounded to provenance fields in every session** -- the `system/init` model and
version, and `total_cost_usd` -- and never printed report prose, even though the capture streams contain
the generated report text.

### A. 2026-09-04T15:17 -- session `a6cef555` (`/gsd-resume-work`). METADATA ONLY, no report prose.

Report byte sizes; `total_cost_usd` values read from the streams.

### B. 2026-09-05T19:23 -- session `5f330ed4` (`/gsd-execute-phase`), subagent `ae67f4d7`. METADATA ONLY, no report prose.

`ls -la` on the built-in report; `system/init` model and version from the streams.

### C. 2026-09-05T22:43-23:15 -- session `47836ace` (`/gsd-explore`). NOT PREVIOUSLY DISCLOSED.

**This is the only session that read substantial report prose before the ENV-04 bar was designed**, and an
earlier draft of this section did not name it at all -- it attributed these reads to the designing session,
which began 29 minutes later.

- 22:48:10 metadata: `ls -la` and `wc -c` on both reports.
- 22:48:24 structure scan over both reports: http(s) URL totals and uniques, Markdown-link counts, line
  counts.
- 22:48:32 **PROSE: `head -40` of the built-in report -- 5,297 chars / 39 lines returned.**
- 22:48:43 **PROSE: `tail -25` of the built-in report AND `tail -18` of the lz report -- 3,562 chars / 47
  lines returned**, together with a numbered-reference count on the built-in.

Total report prose into that session: **~8.9 KB**. To state it unambiguously rather than as "the head and
both tails of both reports": **ONE head (the built-in's) and TWO tails (built-in and lz). The lz report's
head was never read in this session.**

### D. 2026-09-05T23:44-23:45 -- session `bd364133` (`/gsd-discuss-phase`, THE DESIGNING SESSION), research subagent `a0d5a1d6`.

**The designing session's MAIN thread read neither report.** All access was this subagent's.

- Structure scans over both full reports: URL totals, uniques and hosts; `arXiv:`-form and bare
  arXiv-shaped token counts; DOI counts; Markdown-link counts; numbered-marker counts; ASCII-quote,
  smart-quote, ellipsis, non-breaking-space, en-dash and em-dash counts; byte and line counts.
- **PROSE, narrow and line-truncated to 200 chars per line: built-in verification-ledger lines 80-84 (5
  lines); built-in source-list lines 114-120 (7 lines); lz source-list lines 108-116 (9 lines).**
- **No argumentative content was read.**

### E. 2026-09-07T11:27-12:33 -- session `5ad9926a` (`/gsd-execute-phase`, waves 1-3, THE EXECUTING SESSION), subagents `aae3cb8f`, `a917b972`, `a911462b`.

This session ran the published dry run, so its access is the widest of any, and it is disclosed as such.

- PROSE: `head -3` of both reports (7 lines); `sed -n '3,8p'` of lz (6 lines); `sed -n '78,90p'` of the
  built-in (13 lines); **`sed -n '13,40p'` of lz (28 lines, 5,005 chars)**; and marker-context lines from
  the built-in.
- PROSE from a DISTINCT ARCHIVED ARTIFACT, named separately because it is not the report of record:
  **`sed -n '80,100p'` of `qB1-run1.report.partial-verify.md` (21 lines)**, the artifact of the incomplete
  run that the completeness predicate discriminates against.
- Structure: heading scans of both reports, unique-marker inventories, the canonical identifier sets via
  `eval/lz-eval-p23-citation-audit.mjs`, and quoted-span extraction.

**What follows.** The q2 pair is fresh to ALL FIVE of the above, which is why D-02 puts the ENV-04 bar
there and why the q1 audit is labelled not-bar-setting.

### The THIRD disclosure axis: MODEL GENERATION

Under the maintainer's generation-5 directive, **every NEW run in Phase 23 uses Claude generation 5 --
Sonnet 5 and Opus 5.** The fresh q2 pair is therefore captured on generation 5, while the q1 pair was
captured on generation 4 and cannot be re-captured without fresh spend.

The two Slice-B data points therefore differ along **THREE axes at once**:

1. **contamination** -- three sessions have partial sight of q1; none has seen q2;
2. **question identity** -- q1 and q2 are different questions on different subjects;
3. **model generation** -- q1 was captured on generation 4, q2 on generation 5.

**Consequence, stated plainly: with n=2 and three simultaneous differences, NO q1-versus-q2 difference can
be attributed to any single one of them.** This reinforces rather than duplicates the D-04 limit in
Section (i): at n=2 there is no per-question generalisation, and now there is also no per-axis
attribution. Any Phase-23 artifact that reports a q1-versus-q2 difference carries all three axes with it.

### The 4.x model strings in the q1 MANIFESTs are RECORDS, never targets

The following strings appear in the q1 MANIFESTs and are **MEASURED CAPTURE PROVENANCE required by ENV-02
admissibility**:

| Capture | Pinned model | Pinned CC version |
|---|---|---|
| built-in q1 | `claude-opus-4-8` | `2.1.186` |
| lz q1 | `claude-sonnet-4-6[1m]` | `2.1.186` |

They are RECORDS of previous runs and they are NEVER targets. **Rewriting them to name a generation-5
model would be falsification** -- it would claim a model produced a capture it did not produce. The
generation-5 directive binds what NEW runs use; it does not bind what past runs are recorded as having
used. The same protection covers every other dated 4.x string surviving in this repository's records.

## Section (viii) -- The ENV-05 spike and its frozen ceiling (D-05 / D-06 / D-07)

### The frozen ceiling

The spike CLEARS iff a built-in `/deep-research` capture reaches a VERIFICATION-COMPLETE report within a
ceiling frozen BEFORE the spike runs: **at most `SPIKE_CEILING.MAX_RESUME_CYCLES` = `3` resume cycles
across at most `SPIKE_CEILING.MAX_RESET_WINDOWS` = `2` reset windows.** This is the two-window protocol
empirically validated in Phase 22. The ceiling predicate is `spikeCeilingCheck` / `spikeCleared` in
`eval/lz-eval-p23-verify-complete.mjs`, and both boundaries are discrimination-proven (4 resume cycles
does not clear; 3 reset windows does not clear).

### Why ENV-05's literal wording is NOT the operative criterion (D-06)

ENV-05's requirement text says the spike settles "whether a capture completes inside one 5-hour pool
window". **That literal reading is NOT the operative criterion here, and the reason is on the record
already:** the Phase-22 q1 built-in capture needed THREE resume cycles across TWO windows. A strict
one-window bar therefore fails BY CONSTRUCTION on evidence already in hand, and testing it would terminate
ENV-06 on a reason already documented rather than newly learned -- which is the one thing termination
branch (b) is not for.

**This is a deliberate, MAINTAINER-RATIFIED reading of ENV-05, recorded here so it cannot be mistaken for
drift.** It is marked in the same manner as the D-20 sequencing note in Section (xiv).

### The mechanical verification-complete definition, and its caveat

A built-in capture is VERIFICATION-COMPLETE iff its `report.md` contains a verification-ledger section
whose header declares an `N/N` count with both numbers EQUAL, and that section's table has exactly N data
rows. The predicate is `isVerificationComplete` in `eval/lz-eval-p23-verify-complete.mjs`. It is
discrimination-proven against a real artifact of a real incomplete run already on disk
(`qB1-run1.report.partial-verify.md`), not against a synthesized fixture. A duplicate ledger heading is
REPORTED (`duplicateLedgerHeadings`) rather than silently resolved, and does not by itself fail
completeness.

**The caveat is frozen with the definition: it derives from a SINGLE observed report, and the built-in's
output format is NOT contractual.** If the q2 report's format differs, that is itself an ENV-07 finding
about the reference system, and the completeness check falls to a DOCUMENTED MANUAL READ recorded as a
deviation -- never a silent re-definition of the predicate. On the one negative example available, the
built-in signalled incompleteness by DROPPING the count from the heading rather than by declaring a
smaller one; the predicate handles both shapes, but only the heading-dropping shape is empirically
attested.

### The realized ceiling is publishable either way (D-07)

Whether or not the spike clears, the realized resume-cycle and reset-window counts are a publishable ENV-07
finding about the reference system's operating envelope. The counts are OBSERVATIONS the capturing session
must make and record; nothing in the module can derive them.

## Section (ix) -- The ONE pre-committed conditional, with BOTH branches written before the spike (D-19)

**The open question.** The built-in `/deep-research` is Workflow-hosted and its parent stream records only
the `Workflow` tool call, so its workers may be spawned by the Workflow runtime rather than as ordinary
subagents, and may write their fetched content elsewhere or not at all. Whether a Workflow-hosted run
leaves recoverable fetched content under the retention protocol is NOT known at freeze time and does not
need to be.

**The observation that resolves it.** The ENV-05 spike's FIRST post-retention action is to inspect the
retained transcript copy for entries carrying fetched source text, and to RECORD which branch below that
selects -- **before any rate is computed.**

**Branch A -- the built-in's workers DO leave recoverable fetched content.** Symmetric verbatim-quote
match runs on BOTH systems for q2, and the quote-match figure is reported comparatively.

**Branch B -- they do NOT.** ENV-04's comparative bar uses ONLY the symmetric text-derived metrics --
identifier resolvability and structural citation coverage -- and the lz quote-match is published as an
explicitly-labelled SINGLE-SYSTEM diagnostic, never comparative.

Both branches are frozen HERE, before the spike. **Resolving this after seeing any rate is exactly the
post-hoc choice pre-registration exists to remove.** No third branch may be added at observation time.

## Section (x) -- The capture-artifact RETENTION PROTOCOL (D-17)

**This is frozen here because it cannot be added retroactively, and it is a stated PRECONDITION of every
capture in this phase.**

Immediately after any capture completes, and BEFORE anything else:

1. Copy the built-in session's per-subagent transcript files from
   `~/.claude/projects/<cwd-hash>/<session-id>/subagents/agent-*.jsonl` into
   `eval/.cache/p23-baseline/builtin/q2/subagents/`. **This is the FIRST post-capture action**, before the
   session directory can be reclaimed.
2. Copy the WHOLE lz run directory `.lz-research/<run-id>/` -- `claims/`, `excerpts/`, `votes/`,
   `survivors.json`, `run_state.json` and `report.md` -- into `eval/.cache/p23-baseline/lz/q2/`.
3. Only then save the report and the stream and build the MANIFEST.

**The evidence that this is required rather than precautionary.** The built-in q1 capture ran 2026-06-23
with `session_id` `6e92b80e-d807-43ea-89d1-e24bf40f3ab1`. That session no longer exists anywhere under the
transcript store; NO June-2026 session survives, and the oldest surviving session in this repository's
project directory postdates it by months. **Sessions age out. An artifact not copied immediately is an
artifact lost.** The q1 evidence corpus is gone for both systems and is not recoverable; that is closed,
not deferred.

The destination tree `eval/.cache/` is gitignored and holds irreplaceable data. No task in this phase runs
`git clean` in any form.

## Section (xi) -- MANIFEST admissibility and the per-run cost rule (ENV-02 / D-22)

**Every report used in ANY reading carries a `validateManifest`-passing MANIFEST pinning the CC version,
the RESOLVED model and the per-run cost. A report without one is NOT admissible** and is excluded with its
exclusion recorded.

**The per-run cost source is named: the terminal `type=result` event's `total_cost_usd` of each capture
stream** (LAST-wins, since a stream may carry more than one result event), summed by `aggregateRunCost`
over a stream list the CALLER enumerates. The module never discovers its inputs from the filesystem, and
the enumeration plus its exclusions are recorded on the artifact.

### The frozen q1 stream enumerations

**lz q1 -- `costUsd` 18.1152213, `resumeCycles` 1:**

| Stream | Role | Terminal cost | `is_error` |
|---|---|---|---|
| `qB1-run1.stream.jsonl` | cold run | 8.927337350000004 | true |
| `qB1-run1.resume.stream.jsonl` | designed-in slug-match resume | 9.187883949999998 | false |

**built-in q1 -- `costUsd` 67.085261, `resumeCycles` 3:**

| Stream | Role | Terminal cost | `is_error` |
|---|---|---|---|
| `qB1-run1.stream.jsonl` | cold run | 48.5367785 | true |
| `qB1-run1.resume2.stream.jsonl` | report-recovery resume | 0.9598505 | false |
| `qB1-run1.resume3.stream.jsonl` | verifier-completion resume | 17.588632000000008 | false |

**Recorded EXCLUSIONS from the built-in enumeration, with their reasons:**

| Excluded stream | Terminal cost | Reason |
|---|---|---|
| `qB1-run1.resume.stream.jsonl` | none | Zero bytes -- the bare resume errored before emitting anything, so it carries no result event at all. |
| `qB1-run1.broad-partial-2026-06-22.stream.jsonl` | 47.081383 | DIFFERENT `session_id` (`8c54db7e-...`) from an earlier BROAD attempt on 2026-06-22, not part of the narrow q1 chain (`6e92b80e-...`). |

**Including the broad-partial stream would produce 114.166644, roughly DOUBLE the published built-in
figure.** The exclusion is frozen here so a later reader who finds that file in the same directory can
check the decision rather than re-derive it, and a co-test asserts the total is not 114.166644.

### The retry history travels with the number

Both cold runs terminated `is_error: true`. The built-in figure is retry-inflated across three resume
cycles plus an earlier billing-limit failure; the lz figure spans a cold run plus one resume across two
reset windows. **These figures MUST NOT be presented as a clean per-run cost comparison between the two
systems.** Any appearance of a cost ratio without the retry history attached breaks the ENV-02
transparency prohibition this phase is bound by. The cost comparison is an OPERATING OBSERVATION and
belongs in the envelope's Warnings, never in a comparative table.

One further observation recorded rather than reconciled: the lz q1 cold stream's FIRST result event
carries a different `session_id` (`4fce2c41-...`) than the stream's own `system/init` (`8183574c-...`).
LAST-wins makes it immaterial to the cost figure, but a reader auditing session identity across that
stream will meet it.

## Section (xii) -- The seed disposition (D-14)

**SEED-005 (dispatch provenance) is CONSUMED, and it BINDS every dispatch in this phase.** The exact
dispatched string plus its sha256 is persisted per item AT DISPATCH TIME, write-once, by
`writeDispatchRecord`; `readSliceAVerdicts` fails closed at score time on a verdict with no dispatch
record or a digest that disagrees with its stored string. This binds every ENV-03 voter dispatch and any
ENV-06 grading dispatch. It could only be closed before verdict one, which is why it landed in Wave 2.

**SEED-002, SEED-003 and SEED-004 are recorded NOT-CONSUMED-BECAUSE-NO-GATE, and are left DORMANT rather
than retired.** All three are Stage-2 judge-calibration-gate seeds, and Phase 23 declines that gate
(Section (iv)). A later phase that revives a judge gate still needs them, so retiring them would discard
work that a successor is entitled to inherit.

**This NARROWS the ROADMAP's "Consumes seeds SEED-002, SEED-003, SEED-004, SEED-005" line**, which was
written before the no-judge constraint was locked. The narrowing is recorded here rather than left to be
discovered as a discrepancy later.

## Section (xiii) -- The frozen ENV-03 voter prompt (SEED-005 / T-23-03)

The template below is what `buildDispatchString` renders in `eval/lz-eval-p23-sliceA-read.mjs`. It
produces the EXACT string dispatched for all 40 Slice-A verdicts in Plan 23-05, and until this freeze it
had received only executing-session review -- which under the project's review-before-use rule is not
review at all for a document that steers an LLM task. It is frozen HERE, where it is still free to change.

```
You are a verify-voter. Decide whether the CLAIM below is REFUTED by the evidence you can find.

Judge the claim AS OF the cutoff date below, not as of today. Evidence published after the cutoff
is out of scope.

CUTOFF (day-month-year): {{CLAIM_DATE}}
CLAIM: {{CLAIM}}

Answer with exactly one word, lowercase, and nothing else: refuted, or unrefuted.
```

**Both the quote and a hash are used, because each alone is weaker.** Prose can drift from code, so the
co-test asserts a sha256 of the string `buildDispatchString` actually renders; a hash is unreadable at
review time, so the template is quoted above for the maintainer to read at the Task-2 checkpoint. Together
they make "what was reviewed is what runs" a checkable claim rather than an assurance.

The template above and both digests below were RE-PINNED by **AMENDMENT RECORD 1 (2026-09-08)**, taken
before any dispatch with zero verdicts in existence. The superseded values are recorded there in full.

The pinned digests, asserted by `eval/lz-eval-p23-prereg.test.mjs`:

- The template as rendered above (obtained by rendering with each placeholder as its own literal value,
  which round-trips because the substitution is a single non-global scan through a replacer function and
  inserted text is never re-scanned):
  `a1cb493a980307271666597ac306d9cd383efdc9493acefefcf1aa159e7f1318`
- A fixed synthetic instantiation (`claim` = `A synthetic pin claim that is not a corpus item.`,
  `claimDate` = `2020-01-01`):
  `e95cc436b092adbb596b4ae16a2a9016088ad28bb1603341609f22d2a7960430`

### What the template deliberately WITHHOLDS -- this is the ENV-03 blinding

The dispatched string carries **the claim text and the `claim_date` cutoff, and nothing else.** It never
carries:

- the gold label,
- the gold justification,
- the fact-checking article,
- the corpus questions,
- the speaker,
- the `drawIndex`.

The `drawIndex` -- the join key gold is recovered by at score time -- lives on the dispatch RECORD, outside
the dispatched string. The answer is constrained to ONE lowercase word from the two-value verdict enum
`refuted | unrefuted`, matching the enum `readSliceAVerdicts` accepts.

**This withholding IS the ENV-03 blinding.** Stating it beside the frozen template means a later reader
checks the blinding from the template itself rather than trusting a summary of it.

### The substitution defect fixed before verdict one (T-22-15)

Substitution goes through a REPLACER FUNCTION in ONE non-global scan. Built with a plain string
replacement value instead, a claim containing `` $` `` injects the ENTIRE preceding prompt text into
itself, and the claim that reaches the voter is not the claim in the corpus. Neither existing anti-leak
guard would have fired, because the injected text carries no uid and no gold marker. The fix is
discrimination-proven and landed before the first Phase-23 verdict.

## Section (xiv) -- The sequencing record (D-16 / D-20)

### The three Wave 1-3 commits, with their ISO committer timestamps

A reader can check from git alone that the zero-spend corrections and the frozen normalization constants
preceded this freeze, and that this freeze precedes every capture, vote and score.

| Wave | Tail commit | ISO committer timestamp | What it landed |
|---|---|---|---|
| 1 (Plan 23-01) | `63373c3b7f2fa988a230348a5dd3c08c559d4221` | 2026-09-07T13:41:13+02:00 | ENV-02 Stage 0: the `claude_code_version` fix, the D-22 cost source, both q1 MANIFESTs |
| 2 (Plan 23-02) | `ca37ed722609159c390d55ced6da20f2cf38282e` | 2026-09-07T14:12:50+02:00 | the 83/181 re-verification, the seeded 40-item draw, dispatch provenance, the frozen spike ceiling |
| 3 (Plan 23-03) | `3189239ee7dd094e0a2bde3db418292a2e1b4750` | 2026-09-07T14:36:06+02:00 | the offline ENV-04 audit, the live resolvability half, the published q1 dry run |

The two Wave-3 RULE commits and the Wave-3 RATE commit, which are the ordering that matters most:

| Commit | ISO committer timestamp | Content |
|---|---|---|
| `2cb513349c59bdb58f0e110f386f4616e5476689` | 2026-09-07T14:26:29+02:00 | the frozen offline citation rules |
| `fcc206c992ca91ccf46af96b69ca2e73bb561f6c` | 2026-09-07T14:30:59+02:00 | the frozen live resolvability limits |
| `3189239ee7dd094e0a2bde3db418292a2e1b4750` | 2026-09-07T14:36:06+02:00 | the FIRST computed rate |

### A computed RATE landed before this freeze, and that is D-20, not a D-16 breach

**State this plainly rather than leave it to be discovered.** A computed citation RATE -- the Wave-3 q1
dry run's realized figures, together with a dated live resolvability reading -- landed BEFORE this freeze
commit.

The reason it is not a D-16 breach, given in full rather than by reference:

- **D-16 forbids any CAPTURE, VOTE or SCORE ahead of the freeze.** No capture, vote or score has run in
  this phase; the dry run read two reports already on disk from Phase 22, at zero model spend and one
  dated network call.
- **D-20 ratifies the q1 audit as a PUBLISHED DRY RUN that neither sets nor checks the bar**, and D-02 puts
  the ENV-04 bar on the FRESH q2 pair. The dry-run rate therefore cannot have moved anything this freeze
  fixes.
- **It had to precede the freeze, because this commit QUOTES its figures.** A zero-spend item ahead of the
  freeze is permitted precisely on the condition that it is REFLECTED IN the freeze -- and quoting it here
  is that reflection.
- The figures in Section (vi) are quoted AS REALIZED, not reconciled against anything, and **no bar in
  this document was derived from them.**

**This is marked the same way as the D-06 reinterpretation in Section (viii): a deliberate, RATIFIED
reading, recorded so it cannot be mistaken for drift.** A pre-registration written after a number was seen
is not a pre-registration; this one quotes a number it did not use.

### The pre-freeze ordering claim is scoped to RATIOS, and here is the exception

What the commit ancestry PROVES is rate-free before the Wave-3 publication commit `3189239` is **every
RATIO** -- the citation-coverage ratios, the quote-match ratio and the resolvability ratio. It is **NOT
every integer.**

**The stated exception:** the **18**-unique-canonical-sources count is pinned inside Plan 23-03's own
Task-1 co-test, in commit `2cb5133`, because that plan's acceptance criterion required the assertion to
live there -- the discrimination assertion cannot exist without the number. So an integer derived from the
q1 corpus does precede the Wave-3 record.

**This document therefore writes the RATIO-scoped claim and does NOT write the stronger "no measured figure
precedes this freeze".** The stronger sentence is unsupported by git, and a pre-registration that
overstates its own ordering guarantee is worse than one that states a narrower guarantee accurately. The
exception is named above so the scoping reads as a disclosure rather than as a hedge.

### How every later plan checks the ordering

The freeze commit carrying this file must be a STRICT GIT ANCESTOR of any commit carrying a capture, a
vote or a score. Later plans check it with git's ancestry test, never by comparing commit timestamps: two
commits can share a timestamp, and topology is what actually orders them.

## Section (xv) -- The termination clause (quoted in full from the ROADMAP)

> Phase 23 reaches RESOLUTION, and milestone v2.1.0 may close, on ANY of three equally valid terminations:
>
> **(a) MEASURED.** At least one pre-registered confidence source produced its planned reading; the phase
> publishes it with its stated limits.
>
> **(b) NOT-ESTABLISHABLE-BY-METHOD.** A pre-registered method was attempted and its result is unreachable
> or uninterpretable FOR A REASON IDENTIFIABLE INDEPENDENTLY OF THE RESULT -- insufficient item yield, a
> capture that cannot complete in budget, or a construct mismatch shown to defeat the inference. The phase
> publishes the named method, the evidence that it cannot deliver, and the operating envelope that stands
> without it. **This is a COMPLETED phase, not a gap**, and `/gsd-audit-milestone` must close it as such.
>
> **(c) NOT-ATTEMPTED-BY-BUDGET.** A method was descoped before spend on a recorded, maintainer-ratified
> decision, amended into the pre-registration AT THE TIME IT IS TAKEN -- never carried forward as a settled
> design. (This clause exists because Phase 22's n=3 -> n=1 reduction was an agent-side working posture
> that was never ratified; see the RETROSPECTIVE DEVIATION NOTE in `eval/lz-eval-parity-prereg.md`.)
>
> Phase 23 does NOT reach resolution if it produces no artifact for any source, or if it re-runs a method
> whose failure mode is already documented in the hope of a different draw.
>
> **The ceiling is stated up front, not discovered.** Phase 23 may report direction, raw per-cell verdicts,
> and an envelope; it may never report significance. A phase that ends without one has NOT fallen short.

**The transparency prohibition that binds every termination:** a NOT-ESTABLISHABLE-BY-METHOD or a
NOT-ATTEMPTED-BY-BUDGET termination must NEVER be presented as if it were a MEASURED one, and the
retry-inflated cost figure and the q1-plus-q2 pair must NEVER be presented as clean comparisons. Every such
figure carries its retry history and its per-question rows unaveraged.

## Section (xvi) -- The Assumptions Log and the abstain ledger, carried forward

Carried from `23-RESEARCH.md`. **Never promote an abstained item to settled prose.**

### Assumptions Log

| # | Claim | Status at freeze |
|---|---|---|
| A1 | The per-run `costUsd` can be recovered offline from the terminal `result` event in each q1 `stream.jsonl`. | **RESOLVED** by the Wave-1 measurement (D-22, Section (xi)): it can, LAST-wins, over a caller-enumerated stream list. |
| A2 | The built-in's sub-agent tool calls, and therefore its fetched source text, are recorded in the per-subagent transcript files and would survive if archived promptly. | **OPEN.** This is the question the Section (ix) conditional pre-commits both branches for, and the spike's first observation settles it. |
| A3 | Model cards carry nine named sections. | OPEN, LOW impact. Affects only which envelope skeleton is cited as prior art; three other formats were primary-verified. |
| A4 | DOIs are case-insensitive and the practical normalization is lowercase, prefix-preserved. | OPEN, LOW impact for q1 (zero DOIs measured); may matter for q2. |
| A5 | The built-in's `N/N confirmed` ledger heading plus table is stable enough for the mechanical completeness check to work on q2. | OPEN, MEDIUM impact. Derived from a single observed report; the mitigation is frozen in Section (viii). |
| A6 | A regex-based citation extractor over a frozen rule set is sufficient for these two report formats. | OPEN, LOW-MEDIUM impact. Reversible: if the co-test cannot discriminate the two formats, add a parser to `eval/` and re-run the Package Legitimacy Gate. |
| A7 | `filterSliceA`'s output ordering is stable across runs, so a seeded draw over it is reproducible. | **RESOLVED** by the Wave-2 co-test, which draws twice and compares. |

### Abstain ledger (unverifiable; carried, never quoted as support)

- *A benchmark rejected an LLM-judge design because judge-based aggregate scores vary across judge models
  and conflict with auditable evaluation* -- **abstain: unverifiable.** The conclusion is independently
  supported by a verified primary quote; cite that one, not this.
- *A follow-up paper declined a live-fetch citation metric because referenced pages become inaccessible*
  -- **abstain: unverifiable** (the paper is unnamed). The equivalent point IS verified from a primary
  source and is used instead.
- *Evaluation Cards treats every absent field as a claim not made* -- **abstain: unverifiable.** Attractive
  for the envelope and possibly true; do not quote it.
- *Model cards' nine sections* -- **abstain: non-authoritative source** (A3).
- *Binarizing a graded label raises agreement* -- **abstain: non-authoritative source** (carried forward,
  moot here).
- *BAcc to MCC mapping figures* -- **abstain: derived arithmetic, not measurement** (carried forward).
- *No deep-research arena leaderboard exists* -- **abstain: unverifiable** (absence of search hits is not
  absence of the thing).
- *The diagnosis note's "26 numbered ref markers, 10-item source list"* -- **superseded by measurement, not
  abstained.** See Section (vi); the note is not overwritten.
- *The research session's own contamination* -- **disclosed**, not abstained. See Section (vii).

## AMENDMENT RECORD

*(Empty at freeze. This is the convention, frozen with the document.)*

### 1. 2026-09-08 -- the voter transport row was wrong, and the dispatched cutoff was ambiguous

**Maintainer-ratified 2026-09-08. Taken BEFORE any dispatch, with ZERO verdicts in existence.** No
result had been seen, because no result existed: `eval/.cache/p23-read/sliceA/` had not been created,
no dispatch record had been written and no vote had been cast. This is the window an amendment is for
-- both defects were found while checking the frozen instrument against disk ahead of the first
dispatch, and both are fixed here rather than carried into the run and disclaimed afterwards.

**No BAR moves in this amendment, and no item, seed, rule or reporting discipline changes.** The 40-item
list, `DRAW.SEED` = `20260907`, the balanced 20/20 draw, the per-direction never-pooled reporting rule,
the exact five-key output contract and the three PROVISIONAL limits are all untouched. The
pre-registration never named a voter transport anywhere -- only
`eval/lz-eval-p23-capture-driver.md` did -- so half (a) below changes an operating document, not a
frozen bar.

#### Half (a) -- the transport row named a seat that cannot run this dispatch

`eval/lz-eval-p23-capture-driver.md`'s transport-split table specified the `voter` seat as the shipped
verify-voter Agent sub-agent, and Plan 23-05 Task 2 directed a reader to
`plugins/lz-advisor/agents/research-verify-voter-sonnet.md` "so the dispatched prompt matches what the
agent expects". **Checked against disk, that rationale is false**, on two independent grounds:

1. **The seat's contract contradicts the pinned string.** That agent requires four inputs the pinned
   string does not carry -- an evidence excerpt, an assigned attack mode, the arm (open-book or
   closed-book) and a vote-file path -- and it is contracted to WRITE A VOTE JSON in a four-field
   schema. The pinned string supplies none of the four and demands the opposite output: exactly one
   lowercase word.
2. **It is not loadable where the dispatch runs.** The plugin is deliberately disabled in this
   repository (`enabledPlugins: false`) so the marketplace build cannot shadow the working tree under
   test, so the agent is absent from the executing session's registry.

**Corrected to what will actually run:** a GENERIC Agent sub-agent on **Sonnet 5**, receiving the
`buildDispatchString` output **verbatim**, one drawn item per call, on the Claude **session pool**,
**SESSION-DRIVEN**. The pinned string is self-contained -- it opens `You are a verify-voter`, states the
task, the as-of rule and the answer format -- so the seat's role comes from the PROMPT rather than from
an agent definition. That is what makes the sha256 pin meaningful: the instrument is the string, and
nothing outside it conditions the vote.

**Every ABSOLUTE PROHIBITION is unchanged, in particular that `claude -p` is NEVER a voter or judge
transport.** The corrected row still forbids a bare `node` process from dispatching, and the resolved
model string is still recorded per the never-record-an-alias rule.

This was found because the executing agent for Plan 23-05 had no Agent tool, halted at the transport
precondition rather than substituting a permitted-looking one, and reported it. **It is the SIXTH
plan-stated or record-stated figure in this phase to disagree with disk**, and the phase's standing
discipline -- verify from disk, record the discrepancy, never bend the artifact to fit -- is what
surfaced it.

#### Half (b) -- the dispatched cutoff was ambiguous in a direction-biasing way

The corpus emits `claim_date` in **day-month-year** order, and the frozen template dispatched that value
under a bare `CUTOFF:` label. **16 of the 40 drawn items have a first field <= 12**, so `1-10-2020` is
ambiguous between 1 October 2020 and 10 January 2020 to a reader given no field order.

**The day-month-year reading is PROVEN from the draw itself, not assumed: 24 of the 40 items have a
first field GREATER THAN 12, which is impossible for a month.** The format is therefore established by
the data, and this amendment is a correction rather than a guess. All 40 values fall in 2020, so the
first PROVISIONAL limit -- the uniform 2020 cutoff -- was and remains accurate.

**Why it mattered enough to fix pre-spend rather than disclose post-hoc.** A month-day misreading lands
EARLIER in the year, so it excludes evidence the voter was entitled to use. For a refuted claim the
refuting evidence usually sits near the fact-check date, near the end of the admissible window; losing
that window pushes the voter toward `unrefuted`. That is a **direction-biasing false negative
concentrated on the refuted arm** -- not symmetric noise -- inside the phase's only guaranteed reading.

The balanced 20/20 draw and the per-direction never-pooled reporting rule would have made the damage
VISIBLE, as a lopsided refuted row rather than a diluted pooled figure, which is precisely what that
design is for. **Preventing it still beat observing it**, because prevention was free here: the fix cost
one label on one line, before the first verdict, and after the run it would have cost either a
disclaimed reading or 40 re-dispatched votes.

**The change is exactly one line of the frozen template**, from `CUTOFF: {{CLAIM_DATE}}` to
`CUTOFF (day-month-year): {{CLAIM_DATE}}`. No date converter was added, no value was reformatted, and
the T-22-15 replacer-function substitution is untouched -- it remains ONE non-global scan through a
replacer function at ONE call site.

#### The re-pinned digests, old and new

Both pins in `eval/lz-eval-p23-prereg.test.mjs` were RECOMPUTED from the changed template, never
hand-edited toward a guess:

| Pin | Superseded (freeze `9ab9933`) | In force (this amendment) |
|---|---|---|
| Template round-trip | `8a93c283591b1e81046a8d1d61da9d0e035ea922c5105afacf215b911309fe5a` | `a1cb493a980307271666597ac306d9cd383efdc9493acefefcf1aa159e7f1318` |
| Fixed synthetic instantiation | `4a2c47f2a70009762addb16f2485d362a13eda8ed0490406ecd4f654f1aa4efe` | `e95cc436b092adbb596b4ae16a2a9016088ad28bb1603341609f22d2a7960430` |

Recording both directions is what makes the re-pin auditable: a later reader can confirm the superseded
digest belonged to the superseded template rather than taking the new pin on trust. The
discrimination proof was re-run against the NEW pin and its failure output is recorded in the Plan
23-05 SUMMARY.

**Any change to this pre-registration after a result is seen is a NUMBERED, DATED AMENDMENT recorded at the
time it is taken, with the maintainer ratification noted -- NEVER an edit.** An amendment states what
changed, what did NOT change, why the change is feasibility-driven rather than result-driven, and whether
the window it was made in was genuinely open. A descope is amended in AT THE TIME IT IS TAKEN; a deferral
is not a ratification.

This is what termination branch (c) requires, and it exists because Phase 22's n=3 to n=1 reduction was
carried forward as settled design without one.

## Review record

This document is a frozen pre-registration and the authority for every rule in the phase, and
`eval/lz-eval-p23-capture-driver.md` is an LLM-steering document. Both fall under the project's
review-before-use-or-publication MUST (`.planning/PROJECT.md`): scripts, prompts AND Markdown references
are content-reviewed BEFORE they drive an LLM task or are published.

The content review at the Plan 23-04 Task-2 checkpoint covered NINE items, each surfaced as a specific
question rather than as a general request to approve:

1. the q2 question text, verbatim, with its selection reasoning;
2. the draw seed `20260907` and the realized 40-item list, with the record that the seed was fixed before
   the draw was computed;
3. the cost-stream enumeration for both q1 captures and the recorded exclusion of the different-session
   broad-partial stream;
4. the mechanical verification-complete definition and its single-observed-report caveat;
5. the resolvability limits and the named never-existed-versus-died-since omission;
6. the completeness of the contamination disclosure;
7. the completeness of the recorded discrepancies (83/181 against 95/216; 69 / 13 / 18 against the
   diagnosis note's 26 markers over a 10-item list, with D-21's "13 unique sources" named as a mislabel);
8. the q2 capture models, which are generation 5, and the resulting q1-versus-q2 model-generation split
   recorded as a third disclosure axis;
9. the pinned voter prompt template, and whether quoting it verbatim, sha256-pinning it, or both is the
   right form.

The maintainer-ratified items -- the capture budget, the spike ceiling and the balanced draw -- were
ratified at discuss time and were NOT re-opened by that review.

**Verdict: APPROVED, in TWO rounds. Recording it as one round would misstate what happened.**

- **Round 1 returned `revise-then-freeze`, on item 6.** The contamination disclosure was found INCOMPLETE
  when checked against session-transcript evidence. Items 1-5 and 7-9 stood as authored.
- **The correction:** Section (vii) was rewritten as a per-session ledger measured from the transcripts.
  Three errors were fixed. An entire session (`47836ace`, `/gsd-explore`, 2026-09-05T22:43-23:15) had gone
  undisclosed and was the only one to read substantial report prose (~8.9 KB) before the ENV-04 bar was
  designed; its reads had been misattributed to the designing session, which began 29 minutes later and
  whose main thread read neither report; and the research session's line ranges were understated, omitting
  the built-in verification-ledger lines entirely. Section (vii)'s own provenance paragraph records the
  same correction, so the two agree.
- **Round 2, on the corrected document, returned `approve-as-frozen`.**

**Reviewer:** Lars Gyrup Brink Nielsen
**Date:** 2026-09-07

A separate open item is tracked in `.planning/WINDOWS.md`: the independent ENV-08 content review of the
Wave-3 dry-run record and the Wave-1/2/3 eval modules, which have had only executing-session review. That
item blocks `/gsd-ship`, not this freeze.

## Cross-reference

- `eval/lz-eval-p23-capture-driver.md` -- the q2 capture protocol, including the D-17 retention step and
  the D-19 first-observation record.
- `eval/lz-eval-p23-prereg.test.mjs` -- the anti-drift co-test and the required-section presence checklist.
- `eval/lz-eval-p23-sliceA-draw.mjs` -- `DRAW`, `mulberry32`, `drawBalanced`, `claimsEqual`.
- `eval/lz-eval-p23-sliceA-read.mjs` -- `buildDispatchString`, `writeDispatchRecord`, `readSliceAVerdicts`,
  `sliceARead`.
- `eval/lz-eval-p23-verify-complete.mjs` -- `LEDGER_HEADING_RE`, `SPIKE_CEILING`, `isVerificationComplete`,
  `spikeCeilingCheck`, `spikeCleared`.
- `eval/lz-eval-p23-citation-audit.mjs` -- `ARXIV_RE`, `DOI_RE`, `KEEP_PARAMS`, `UNCITED`,
  `canonicalizeCitation`, `extractCitationTokens`, `normalizeForQuoteMatch`, `quoteMatches`,
  `countUncitedUnits`, `auditReport`.
- `eval/lz-eval-p23-resolvability.mjs` -- `SCHEME_ALLOWLIST`, `RESOLVE_LIMITS`, `RESOLVE_OUTCOMES`,
  `checkResolvability`.
- `eval/lz-eval-p23-citation-audit-q1-dryrun.md` -- the published, not-bar-setting q1 dry run.
- `eval/lz-eval-sliceA-gold.mjs` -- `SLICE_A_GATE`, `collapseAvtLabel`, `filterSliceA`,
  `sliceAFeasibilityGate`, `tallyPerDirection`.
- `eval/lz-eval-baseline-manifest.mjs` -- `extractSystemInit`, `extractTerminalCost`, `aggregateRunCost`,
  `buildManifest`, `validateManifest`.
- `eval/lz-eval-parity-prereg.md` -- Phase 22's SPENT pre-registration. Read for AMENDMENT RECORD 3's
  stopping rule and the RETROSPECTIVE DEVIATION NOTE. **Not amended, not re-opened, not edited by Phase 23.**
- `23-CONTEXT.md` D-01 through D-22 (D-12 as revised 2026-09-07); `23-RESEARCH.md` Patterns 2, 3 and 5,
  Pitfall 1, the Assumptions Log and the abstain ledger.
