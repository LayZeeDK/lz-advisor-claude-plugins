---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
verified: 2026-09-09T00:00:00Z
status: gaps_found
score: 5/6 ROADMAP success criteria verified (SC2 unmet as written); ENV-08's content-review half now discharged; 3 requirements-ledger rows still not level with the evidence
behavior_unverified: 0
overrides_applied: 1
re_verification:
  previous_status: gaps_found
  previous_score: "6/6 ROADMAP success criteria verified; 6/8 ENV requirements met, 1 PARTIAL-Q2, 1 PARTIAL"
  gaps_closed:
    - "Gap 2 (ENV-08 content review) -- BOTH missing bullets satisfied. WINDOWS rows 1-6 are `fixed` and each closure is a real content review, not a presence check: the rows 1-5 review failed one record outright and produced substantive corrections to all five at `e3a840a` plus a discrimination-proven guard fix at `f778b13`; the row 6 review FAILED the envelope on three named defects, corrected at `f030aef`. `PROJECT.md:116` admits a fresh-context reviewer subagent as a valid form of independent review, so the closures are legitimate under the project's own rule. Row 7 carries a substantive `waived` disposition accepting the ordering breach as an unrepairable recorded historical defect"
    - "Gap 3 (understated dispositions) -- closed for ENV-01/ENV-02/ENV-03/ENV-07 at `073d0f7`: all four now read `[x]` and carry a full realized disposition in the status table"
    - "Gap 1, first missing bullet -- `.planning/REQUIREMENTS.md:200` now reads `Complete as PARTIAL-Q2` and carries the NOT-SET comparative bar, the single-admissible-report fact and the branch-(b) letter"
  gaps_remaining:
    - "Gap 1, second missing bullet -- `.planning/REQUIREMENTS.md:97` still carries NO realized disposition on the ENV-04 requirement text, unlike ENV-05 (line 98) and ENV-06 (line 99) which each append theirs"
    - "ENV-08's ledger row -- `.planning/REQUIREMENTS.md:101` is still `- [ ]` and line 204 still asserts `SIX content reviews are NAMED AS OPEN GAPS rather than closed`, which the ledger it cites now contradicts (open_count 0, fixed 6, waived 1)"
  regressions:
    - "`.planning/REQUIREMENTS.md:96` and `:199` now read STRONGER than the phase's own published envelope. `073d0f7` (12:46) marked ENV-03 `[x] Complete -- termination branch (a) MEASURED` with no qualifier; `f030aef` (16:24) then corrected the envelope to state that a PROXY seat, not the shipped `research-verify-voter-sonnet`, judged the 40 claims and that inference to the shipped seat `is an inference the phase did not test`. The ledger was never brought level, so the row asserts an ENV-03 requirement whose text says `the verify-voter is scored`"
    - "`.planning/REQUIREMENTS.md:204` became FALSE about the ledger it cites when WINDOWS rows 1-6 closed at `a1f71c1` / `295e1b4`, after `073d0f7` was written. Understating direction, but the sentence is not true"
  no_regressions_found_in:
    - "Code. All eight Phase-23 co-tests are green at HEAD (161 pass / 0 fail) and the packaging boundary is 2/2, after the seven CR-01..CR-07 fixes landed post-verification. Every headline figure re-derives byte-identically against the POST-fix modules: `sources=12 unmatched=0 markers=0/0 uncited-units=59/67`, cells `tp 18 / fn 2` and `tn 20 / fp 0`, retrieval 30 of 40, `validateManifest` 3-pass-1-throw, `extractSystemInit` ccVersion 2.1.263"
    - "Freeze ancestry. `9ab9933` is still a strict ancestor of ALL post-freeze commits -- 46/46 now, up from the 22 the previous report checked -- and the negative control still discriminates (`1bdb1ee -> 3189239` exit 1, reverse exit 0)"
gaps:
  - truth: "Slice A runs: THE VERIFY-VOTER is scored against the frozen AVeriTeC seed list, tallied per confusion-matrix direction and never pooled, reported descriptively with its PROVISIONAL limits (ROADMAP Success Criterion 2 / ENV-03)"
    status: partial
    reason: >-
      The tally half is fully satisfied and I re-derived all of it. What is NOT satisfied is the
      criterion's SUBJECT. `23-ENVELOPE.md:31-40` now states plainly that "what judged the 40 binary
      claims was a PROXY seat, not the shipped voter" -- a generic `Explore` Agent sub-agent on Sonnet
      carrying the frozen dispatch string -- and that "any inference from it to the shipped seat's
      behaviour is an inference the phase did not test". NOT ESTABLISHED row 12 goes further: "No
      reading in this phase connects ENV-03 to the shipped label." The substitution is legitimate,
      pre-verdict and maintainer-ratified (AMENDMENT RECORD 1, `eval/lz-eval-p23-prereg.md:890-935`),
      and its reasoning is strong: the shipped seat structurally CANNOT consume the pinned string (it
      requires an evidence excerpt, an attack mode, an arm and a vote-file path the string does not
      carry, and is contracted to write a four-field vote JSON where the string demands one lowercase
      word), and the plugin is deliberately disabled in this repo so the seat is not even loadable.
      But a pre-registration amendment cannot amend a ROADMAP success criterion, and no override
      accepting the deviation exists. This disclosure landed at `f030aef`, AFTER the previous
      verification's HEAD, which is why the previous report recorded SC2 as VERIFIED without testing
      seat identity.
    artifacts:
      - path: ".planning/ROADMAP.md"
        line: 351
        issue: "Success Criterion 2 names `the verify-voter` as the thing scored; a proxy seat was scored"
      - path: ".planning/REQUIREMENTS.md"
        line: 96
        issue: "ENV-03 reads `- [x]` against requirement text that says `the verify-voter is scored`, with no proxy-seat qualifier"
      - path: ".planning/REQUIREMENTS.md"
        line: 199
        issue: "`Complete -- termination branch (a) MEASURED` with no trace of the proxy substitution the envelope now leads with"
    missing:
      - "Either an accepted override recording that the proxy seat satisfies SC2/ENV-03 as amended (the deviation looks intentional and well-reasoned -- see the suggested override below), or a re-run against the shipped seat"
      - "Carry the proxy-seat qualifier onto REQUIREMENTS.md lines 96 and 199 so the ledger does not read stronger than 23-ENVELOPE.md"
  - truth: "A branch-(b) or PARTIAL disposition is never recorded as if it were unqualified"
    status: partial
    reason: >-
      Half of the previous gap is closed: line 200 now carries `Complete as PARTIAL-Q2`, the NOT-SET
      comparative bar and the branch-(b) letter. The second missing bullet is untouched -- line 97's
      ENV-04 requirement text still ends on the frozen-normalization sentence with no realized
      disposition, while ENV-05 (line 98) and ENV-06 (line 99) each append theirs in the shape the
      previous report asked ENV-04 to match. A reader of the requirement text alone still sees an
      unqualified `[x]`.
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        line: 97
        issue: "ENV-04 requirement text carries no realized disposition, unlike ENV-05 at line 98 and ENV-06 at line 99"
    missing:
      - "Append the realized disposition to the ENV-04 requirement text at line 97 in the same shape ENV-05 and ENV-06 already use (PARTIAL-Q2, comparative bar NOT SET, branch (b), only lz q2 admissible)"
  - truth: "The requirements ledger states each requirement's realized disposition"
    status: partial
    reason: >-
      ENV-08's content-review half IS now discharged -- six ledger rows `fixed` on real reviews, one
      `waived` with a sound reason -- but `.planning/REQUIREMENTS.md` was never updated to say so. Line
      101 is still `- [ ]` and line 204 still asserts that "SIX content reviews are NAMED AS OPEN GAPS
      rather than closed" and points the reader at "`.planning/WINDOWS.md` ids 1-7" as evidence. That
      ledger now reads open_count 0 / fixed 6 / waived 1, so the sentence is not true. The direction is
      understating rather than inverting, so nothing false is claimed in the phase's favour -- but this
      is the file `/gsd-audit-milestone` and `/gsd-ship` consume, and it currently misdescribes both the
      requirement and the ledger it cites.
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        line: 101
        issue: "`- [ ]` for a requirement whose content-review half is discharged and whose ordering defect is dispositioned"
      - path: ".planning/REQUIREMENTS.md"
        line: 204
        issue: "asserts six OPEN content-review gaps against a ledger that reads zero open, six fixed, one waived"
    missing:
      - "Restate ENV-08 to what is now true: mechanical halves MET; six content reviews DELIVERED (WINDOWS rows 1-6 fixed, corrections at e3a840a / f778b13 / f030aef); the review-before-use ORDERING defect for lz-eval-p23-citation-audit.mjs and lz-eval-p23-resolvability.mjs ACCEPTED as an unrepairable recorded historical defect (row 7 waived)"
      - "Decide and record whether ENV-08 with an accepted ordering defect is MET or stays PARTIAL, and set the checkbox to match"
deferred: []
behavior_unverified_items: []
coincidental_reliance_items: []
human_verification: []
overrides:
  - must_have: "Slice A runs: the verify-voter is scored against the frozen AVeriTeC seed list, tallied per confusion-matrix direction and never pooled, reported descriptively with its PROVISIONAL limits"
    accepted_by: "Lars Gyrup Brink Nielsen (maintainer)"
    accepted_at: "2026-09-09"
    reason: >-
      Accepted as offered in `overrides_suggested` below, on the verifier's own reasoning and without
      amendment. What ENV-03 and ROADMAP Success Criterion 2 measured is the reviewed verify-voter
      PROMPT carried verbatim in the frozen dispatch string, not the shipped agent wrapper: the
      shipped `research-verify-voter-sonnet` seat structurally cannot execute this dispatch on two
      independent grounds the verifier established from disk before any verdict existed -- its input
      contract requires four fields the pinned string does not carry, and its output contract is a
      four-field vote JSON where the string demands one lowercase word -- and the plugin is
      deliberately disabled in this repository, so the seat is absent from the executing session's
      registry. AMENDMENT RECORD 1 (`eval/lz-eval-p23-prereg.md:890-935`) substituted a generic Agent
      sub-agent on Sonnet receiving the pinned string verbatim, pre-verdict and maintainer-ratified,
      with no bar, item, seed or reporting rule moved.
      This override records a real NARROWING of what ENV-03 measured and upgrades nothing. The
      narrowing is already published, not hidden: `23-ENVELOPE.md:31-40` leads with it and NOT
      ESTABLISHED row 12 states that no reading in this phase connects ENV-03 to the shipped label.
      Scoring the shipped seat is not deferred work on this phase -- it would require redesigning the
      dispatch contract and re-enabling the plugin in this repository, which is new scope.
    scope: "ENV-03 / ROADMAP Success Criterion 2 only. Does not extend to any other ENV requirement or success criterion."
overrides_suggested:
  - must_have: "Slice A runs: the verify-voter is scored against the frozen AVeriTeC seed list, tallied per confusion-matrix direction and never pooled, reported descriptively with its PROVISIONAL limits"
    reason: >-
      The shipped `research-verify-voter-sonnet` seat cannot execute this dispatch on two independent
      grounds established from disk before any verdict existed: its input contract requires four fields
      the pinned string does not carry and its output contract is a four-field vote JSON where the
      string demands one lowercase word, and the plugin is deliberately disabled in this repository so
      the seat is absent from the executing session's registry. AMENDMENT RECORD 1 substituted a generic
      Agent sub-agent on Sonnet receiving the pinned string verbatim, pre-verdict and
      maintainer-ratified, with no bar, item, seed or reporting rule moved. The instrument being
      measured is the reviewed prompt rather than the agent wrapper, and the envelope carries the
      narrowing as a leading limit plus NOT ESTABLISHED row 12 rather than hiding it. Accepting this
      records a real narrowing of what ENV-03 measured; it does not upgrade anything.
    to_accept: "add an `overrides:` entry with this must_have text plus accepted_by and accepted_at to this file's frontmatter, and carry the same qualifier onto REQUIREMENTS.md lines 96 and 199"
---

# Phase 23: Judge-free confidence and operating envelope -- Verification Report (RE-VERIFICATION)

**Phase Goal:** produce defensible, honestly-bounded confidence in `lz-deep-research` using
confidence sources requiring neither a calibrated LLM judge nor closed-book gold; publish an
OPERATING ENVELOPE plus an explicit statement of what was NOT established and why; close the
v2.1.0 measured-quality question under one of three sanctioned terminations.

**Verified:** 2026-09-09
**Status:** gaps_found
**Re-verification:** YES -- against a tree that moved by 12 commits since the previous report's HEAD
(`4f263df`), including seven code fixes the previous verifier never saw.

## What moved, and what I re-derived rather than carried forward

The previous report was reached at `4f263df`. Twelve commits landed after it: an envelope correction
(`f030aef`), the ENV-08 row-6 closure (`295e1b4`), a deep code review that found 7 BLOCKERs
(`d02d43d`), seven fixes for them (`b813d19` .. `6584e76`), the WR-02 denominator amendment
(`1f25e1a`), and learnings extraction (`32a5219`). Because those seven fixes changed the very modules
every published figure was computed by, I re-ran the figures against the POST-fix code rather than
trusting either report.

**Nothing moved. Every re-derived figure is identical to the published one, on the fixed modules.** The
one place the tree got materially BETTER is `f030aef`, and it is also the place that changes my verdict:
the envelope now discloses that ENV-03 measured a proxy seat, which SC2 does not permit as written.

## Goal Achievement

### The six ROADMAP Success Criteria

| # | Criterion | Status | Evidence I produced myself at HEAD |
|---|---|---|---|
| 1 | Pre-registration frozen in its own timestamped commit BEFORE any capture, vote or score | VERIFIED | `git show --name-only 9ab9933` returns EXACTLY three files (`lz-eval-p23-capture-driver.md`, `lz-eval-p23-prereg.md`, `lz-eval-p23-prereg.test.mjs`) at `2026-09-07T23:37:33+02:00`. I re-ran `git merge-base --is-ancestor` over ALL **46** post-freeze commits (the previous report checked 22): **46/46 ANCESTOR-OK, zero exceptions.** Negative control holds: `1bdb1ee -> 3189239` exit 1, reverse exit 0. `eval/lz-eval-p23-prereg.test.mjs` 25/25 green |
| 2 | **Slice A runs: THE VERIFY-VOTER is scored**, tallied per direction and never pooled, reported descriptively with its PROVISIONAL limits | **UNMET AS WRITTEN** | Tally half fully re-derived: 40 raw verdict JSONs re-tallied to gold `unrefuted` **tp 18 / fn 2** and gold `refuted` **tn 20 / fp 0**, 40 distinct `(direction, drawIndex)` keys, `read.json` exactly five keys with no rate/interval/pass-fail field, three PROVISIONAL limits present verbatim, retrieval 30 of 40. But the criterion's SUBJECT was not scored: `23-ENVELOPE.md:31` -- "**What judged the 40 binary claims was a PROXY seat, not the shipped voter**", a generic `Explore` sub-agent on Sonnet, per AMENDMENT RECORD 1. See gap 1 |
| 3 | Deterministic citation audit over every admissible report, format-normalized on rules fixed BEFORE any rate | VERIFIED | Re-ran the CLI on the POST-CR-03/CR-04-fix module: `sources=12 unmatched=0 markers=0/0 uncited-units=59/67`, byte-identical to the published record. I also independently reconstructed the module's whole unit pipeline and reproduced its 23 paragraphs and 67/59 exactly, so the enumeration is faithful. Only one report was admissible and the comparative bar is published NOT SET rather than fabricated |
| 4 | Every report used in any reading carries a `validateManifest`-passing MANIFEST; a report without one is NOT admissible; `extractSystemInit` pins a version from a real `system/init` event | VERIFIED | Executed in-process at HEAD, after `lz-eval-baseline-manifest.mjs` was changed by CR-06: lz q2 `true`, lz q1 `true`, built-in q1 `true`, built-in q2 **THROWS** `manifest report file does not exist (truncated/empty capture?)` -- exactly the string the envelope quotes -- and is filed `.MANIFEST.INADMISSIBLE.json`. `extractSystemInit` on both real q2 streams returns `ccVersion 2.1.263` plus the resolved model (`claude-sonnet-5`, `claude-opus-5`). Built-in q2 `report.md` confirmed absent on disk |
| 5 | ZERO out-of-family spend; no maintainer-authored gold; the eval tree never ships | VERIFIED | `rg -i` for openai / gpt-5 / gemini / copilot / mistral / cohere / ollama across all `eval/lz-eval-p23-*.mjs`: **exit 1, zero hits.** Gold is AVeriTeC dev-set `item.label` through `collapseAvtLabel`, external. `eval/lz-eval-packaging-boundary.test.mjs` 2/2 green, including "no shipped runtime `.mjs` imports any `eval/` script" and "no package.json/node_modules under the plugin tree" |
| 6 | An OPERATING ENVELOPE is published plus an explicit statement of what was not established and why; no significance claim, stated in advance as unreachable | VERIFIED | `23-ENVELOPE.md` carries exactly **8** `##` sections, all non-empty, and exactly **one** `Resolved branch:` line (`MEASURED`, line 178). NOT ESTABLISHED grew from 11 to **12** named rows -- row 12 added by the row-6 review, naming the confidence-label calibration gap. Ceiling arithmetic `2*0.5^5 = 0.0625` and `0.05^(1/5) = 0.549` sit in the FROZEN blob at `9ab9933` |

**Score: 5/6 criteria verified.** SC2 is the one that does not hold as written.

### Why SC2 flipped, and why it is not a code defect

The previous verifier marked SC2 VERIFIED on the tally mechanics and did not test seat identity. At
that HEAD the envelope's "What this covers" section still said the claims were "judged by the shipped
verify-voter". `f030aef` corrected that -- the row-6 content review caught the document contradicting
its own header table -- and the corrected text is unambiguous:

> ENV-03 measured a proxy under the reviewed prompt, and any inference from it to the shipped seat's
> behaviour is an inference the phase did not test.

The substitution itself is defensible and I confirmed its reasoning from disk: the shipped seat's input
and output contracts are incompatible with the pinned string, and the plugin is disabled in this repo so
the seat is not loadable. AMENDMENT RECORD 1 was taken with zero verdicts in existence and moved no bar,
item, seed or reporting rule. **This is a scope narrowing that was disclosed, not concealed.** But
SC2 names `the verify-voter`, a pre-registration amendment cannot amend a ROADMAP criterion, and no
override exists -- so it resolves to a gap with an override suggestion rather than to a pass.

### The three adversarial checks re-run

**Does anything improperly upgrade?** No. Exactly one `Resolved branch: MEASURED` line. The ENV-06
record still carries exactly one status line, `NOT-RUN branch (b)`, and the built-in q2 report and
`citation-audit-q2-builtin.json` are both still absent on disk, which is the fact that status line is
asserted against.

**Is the proxy-seat narrowing carried where a reader will meet it?** In the envelope, YES and
prominently -- leading paragraph of "What this covers", the ENV-03 row's limits cell, and NOT
ESTABLISHED row 12. In `.planning/REQUIREMENTS.md`, NO. That asymmetry is a regression and is gap 1's
second missing bullet.

**Did the seven post-review code fixes move any published figure?** No. I re-ran every one. `23-REVIEW.md`
predicted exactly this ("Latent" for CR-01..CR-07) and its prediction holds under my own execution.

### Requirements ledger -- the current state against the evidence

| Requirement | My verdict | Ledger says | Level? |
|---|---|---|---|
| ENV-01 | MET | `Complete` + full reasoning (line 197) | YES |
| ENV-02 | MET | `Complete` + full reasoning (line 198) | YES |
| ENV-03 | **MET AS AMENDED -- proxy seat, not the shipped voter** | `Complete -- branch (a) MEASURED`, no qualifier (lines 96, 199) | **NO -- ledger stronger than the envelope** |
| ENV-04 | MET AS PARTIAL-Q2 | status table line 200 correct; requirement text line 97 carries no disposition | **HALF** |
| ENV-05 | MET, branch (a) | `Complete` + branch letter (lines 98, 201) | YES |
| ENV-06 | MET by published termination, branch (b) | `Complete` + branch letter (lines 99, 202) | YES |
| ENV-07 | MET | `Complete` + reasoning (lines 100, 203) | YES |
| ENV-08 | **content-review half DISCHARGED; ordering defect ACCEPTED** | `- [ ]` and "SIX content reviews are NAMED AS OPEN GAPS" (lines 101, 204) | **NO -- ledger false about its own cited ledger** |

**No ORPHANED requirements.** ROADMAP maps ENV-01..08 to Phase 23 and all eight appear in the plans.

### ENV-08: are the six `fixed` rows real reviews?

I checked this rather than accepting the count, because a `fixed` row is exactly where a presence check
would hide.

| Row | Closed at | What the closure actually produced | Real review? |
|---|---|---|---|
| 1-5 | `a1f71c1` | `e3a840a` edits all five published records (+44 / -22 across five files); `f778b13` rewrites the UNCITED label guard because the old regex passed only on inflection mismatch and would NOT have caught an affirmative relabel to a support claim -- the exact substitution it exists to prevent | **YES.** A presence check produces no edits. The review failed one record outright and held four pending named edits |
| 6 | `295e1b4` | The review FAILED the envelope on three defects and `f030aef` corrected them: the document contradicted its own header table about what judged ENV-03; NOT ESTABLISHED read exhaustive while omitting the confidence-label calibration gap (now row 12); N7's stated reason was false and is corrected to the observed effect size | **YES**, and it is the closure that produced my SC2 finding |
| 7 | `waived` at `4f263df` | Accepted as an unrepairable recorded historical defect, with the reason recorded in the ledger and in full below | **Sound disposition.** No later action makes `1bdb1ee` an ancestor of `3189239`; the honest options were to record it or obscure it, and it is recorded |

**Is a fresh-context agent review a valid discharge of ENV-08?** Yes, under the project's own rule.
`.planning/PROJECT.md:116` defines review as "an independent pass against the contract (a fresh-context
reviewer subagent, a cross-AI consult, or a deliberate self-review documented where the work is
tracked when independence is impractical)". The row-6 closure names its own form and states it is
weaker than a maintainer's own prose read rather than presenting it as equivalent. I am therefore NOT
re-opening row 6 as a human item -- it was discharged by a form the project sanctions, and the residual
weakness is disclosed at `23-ENVELOPE.md:231-236`.

### Behavioral Spot-Checks (all re-run at HEAD, on the post-CR-fix modules)

| Behavior | Command | Result | Status |
|---|---|---|---|
| Freeze is a strict ancestor of every post-freeze commit | `git merge-base --is-ancestor 9ab9933 <c>` over `git rev-list 9ab9933..HEAD` | 46 commits, 46 ANCESTOR-OK, 0 bad | PASS |
| Negative control discriminates | `git merge-base --is-ancestor 1bdb1ee 3189239` | exit 1 (reverse exit 0) | PASS |
| Citation audit reproduces on lz q2 | `node eval/lz-eval-p23-citation-audit.mjs .../lz/q2/q2-run1.report.md` | `sources=12 unmatched=0 markers=0/0 uncited-units=59/67` | PASS |
| Slice A cells re-tally from raw verdicts | 40 verdict JSONs, tallied independently of `read.json` | `{"unrefuted":{"tp":18,"fn":2},"refuted":{"tn":20,"fp":0}}` | PASS |
| 40 distinct scored items | distinct `(direction, drawIndex)` pairs | 40 of 40 | PASS |
| `read.json` publishes no rate | key enumeration | exactly `unrefuted, refuted, n, drawSeed, provisionalLimits` | PASS |
| Retrieval count | `retrieval.json` non-zero entries | 30 of 40 | PASS |
| Frozen draw reproduces | `node eval/lz-eval-p23-sliceA-draw.mjs .../dev.json` | runs clean, emits the balanced 20/20 draw | PASS |
| `validateManifest` over four MANIFESTs | executed in-process | 3 pass, built-in q2 throws the quoted string | PASS |
| `extractSystemInit` on both q2 streams | executed in-process | `ccVersion 2.1.263` + `claude-sonnet-5` / `claude-opus-5` | PASS |
| Built-in q2 report absent | directory listing | only `.err`, streams, timing, `.MANIFEST.INADMISSIBLE.json` | PASS |
| All EIGHT p23 co-tests, explicit FILE form | `node --test eval/lz-eval-p23-*.test.mjs` (8 files named) | **161 pass, 0 fail, 0 skipped** | PASS |
| Packaging boundary | `node --test eval/lz-eval-packaging-boundary.test.mjs` | 2 pass, 0 fail | PASS |
| Zero out-of-family transport | `rg -i` over all `eval/lz-eval-p23-*.mjs` | exit 1, zero hits | PASS |
| Envelope structure | `##` heading count, `Resolved branch:` count | 8 sections, 1 branch line | PASS |

**Note on the co-test count.** The previous report said "all six p23 co-tests ... 130 pass". There are
**eight** `eval/lz-eval-p23-*.test.mjs` files, not six -- `retain` (11) and `sliceA-gate` (7) were
missed. All eight are green: 34 + 25 + 14 + 11 + 20 + 7 + 26 + 24 = **161**. The count rose from 130
because the CR fixes added discriminating tests. This was an undercount in the previous report, not a
regression.

### Probe Execution

No `scripts/*/tests/probe-*.sh` exists in this repo and this phase declares none. The equivalent
runnable checks are the co-tests and CLIs above, all executed in my own process.

### The WR-02 amendment (`1f25e1a`) -- re-derived, since its own subject flags an un-re-derived figure

The commit subject reads "figure not re-derived", so I derived it myself. The amendment's claims and
what I measure:

| Amendment claim | My measurement | Held? |
|---|---|---|
| The frozen `SENTENCE_SPLIT_RE` does not split across `\n- `, so a bullet list collapses into ONE unit | Confirmed from the regex and reproduced: my reconstruction of the module's pipeline returns its exact 23 paragraphs and 67/59 pair | YES |
| "5 of the 67 units are multi-sentence collapses" | **5** | YES, exactly |
| "the largest holding roughly 983 characters and six sentence-enders" | 991 characters, **6** enders | YES within its own "roughly" |
| "A per-sentence denominator would be approximately 75" | **76** | YES within its own "approximately" |
| `59 of 67` stands as published, NOT restated | The published pair is unchanged and the reasoning (a frozen unit rule may not be re-chosen after seeing a rate) is correct | YES |

The discipline here is right: the recommendation in `23-REVIEW.md` was to amend with a timestamp rather
than recompute silently, and that is what happened.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| -- | -- | No `TBD` / `FIXME` / `XXX` in ANY file this phase changed after the previous verification (`git diff --name-only 4f263df..HEAD`, 17 files, each scanned) | -- | Clean; the debt-marker gate does not fire on Phase-23 work |
| `.planning/STATE.md` | 166, 168, 169 | `TBD` in the per-phase metrics rollup for Phases 17/19/20 | Info | Pre-existing, other phases; `32a5219` touched only the `stopped_at` line |
| `eval/lz-eval-p23-sliceA-read.mjs` | 88, 164 | `PLACEHOLDER_RE` | Info | A template-substitution identifier, not a debt marker |
| `23-ENVELOPE.md` | 125-126 | "10 of 23 body paragraphs end on [a `Confidence:`/`Assurance:`] line" and "19 of the 59 uncited units are ... metadata lines" | Warning | I measure **9** of 23 and **20** of 59. My reconstruction reproduces the module's own 23 paragraphs and 67/59 pair exactly, so the enumeration is faithful. Pre-existing from Plan 23-07, not a post-verification regression; the two errors run in OPPOSITE directions and the conclusion ("at least in part a report-format effect") is unaffected. Worth a one-integer correction, but it fails no must-have |
| `.planning/REQUIREMENTS.md` | 96, 199 | ENV-03 recorded MEASURED with no proxy-seat qualifier while the envelope leads with it | Blocker | The ledger reads stronger than the deliverable. Gap 1 |
| `.planning/REQUIREMENTS.md` | 97 | PARTIAL-Q2 requirement text with no realized disposition | Blocker | Gap 2 |
| `.planning/REQUIREMENTS.md` | 101, 204 | ENV-08 asserted as six OPEN content reviews against a ledger reading zero open | Warning | Understating, but false about the ledger it cites. Gap 3 |

### Gates owned by other agents -- noted, not re-adjudicated

- **`23-SECURITY.md`** reads `verdict: SECURED` / `threats_open: 0` against
  `verdict_as_audited: OPEN_THREATS` / `threats_open_as_audited: 1`, closed by the orchestrator at
  `8aaf967` with no auditor re-audit. Not mine to re-adjudicate. **It does not bear on any of the six
  ROADMAP criteria**: T-23-07 concerns the retention path control in `eval/lz-eval-p23-retain.mjs`,
  which sits in no criterion's evidence chain, and `23-REVIEW.md`'s published-figure table records
  "No. No data was lost" for it. It bears on ENV-08 only FAVOURABLY -- `8aaf967` added the control, the
  code review then found it "sound on its stated threat, incomplete as a retention guard" (CR-07), and
  `6584e76` fixed that, so the eval-script review half of ENV-08 is stronger now than at the audit's
  HEAD.
- **`23-REVIEW.md`** still carries `status: issues_found` with `critical: 7`, but all seven CR fixes
  landed (`b813d19`, `c0f9967`, `b5315a1`, `3984880`, `e055ce7`, `1894d37`, `6584e76`) and I confirmed
  every one is green in the co-tests. That frontmatter is STALE rather than open. Flagged for whoever
  owns the review gate; not a Phase-23 goal defect.
- **`23-VALIDATION.md`** reads `status: validated`, `nyquist_compliant: true`, `wave_0_complete: true`,
  PARTIAL only on ENV-08's human half -- which my ENV-08 finding above now shows discharged.

## Gaps Summary

**The deliverable is sound and the arithmetic is exceptionally clean.** Every headline figure re-derives
byte-identically at HEAD, on modules that were rewritten by seven BLOCKER fixes after the last
verification. The freeze holds over 46 post-freeze commits with a discriminating negative control. The
envelope publishes an absence as an absence, keeps a cost figure's ambiguity rather than picking the
flattering reading, and -- since the last report -- corrected itself against its own review on three
points, one of which is the finding that changes my verdict.

**Two of the three previous gaps are closed, and closed properly.** ENV-08's content-review half was
discharged by reviews that FAILED their subjects and produced substantive corrections, not by presence
checks; the ordering defect is dispositioned as an unrepairable recorded historical fact rather than
smoothed over. The understated ENV-01/02/03/07 rows were corrected.

**What blocks a pass is entirely in `.planning/REQUIREMENTS.md`, and it is now failing in both
directions at once.** Three rows are not level with the evidence:

1. **ENV-03 (lines 96, 199) reads stronger than the envelope.** This is the one that matters. `073d0f7`
   marked ENV-03 an unqualified `Complete -- branch (a) MEASURED` at 12:46; `f030aef` then established
   at 16:24 that a PROXY seat, not the shipped `research-verify-voter-sonnet`, judged the 40 claims, and
   that the inference to the shipped seat is one the phase did not test. The ledger was never brought
   level. A reader of that ledger alone would take the headline confidence reading of the whole phase as
   measuring the shipped component -- which the phase itself says it does not. This is exactly the
   failure mode gap 1 of the previous report was written to catch, arriving on a different row.
2. **ENV-04 (line 97) still carries no realized disposition** -- the previous report's second missing
   bullet, untouched.
3. **ENV-08 (lines 101, 204) is false about the ledger it cites** -- it asserts six open content-review
   gaps against a ledger that reads zero open, six fixed, one waived.

The first of these also means ROADMAP Success Criterion 2 is unmet as written. The substitution behind
it is well-reasoned, pre-verdict, maintainer-ratified and prominently disclosed -- which is why it is a
candidate for an accepted override rather than for rework. `overrides_suggested` in the frontmatter
carries the exact text.

**None of this is closable by re-running anything.** All three are edits to one file, plus one
maintainer decision on whether the proxy seat satisfies SC2/ENV-03 as amended.

---

_Re-verified: 2026-09-09_
_Verifier: Claude (gsd-verifier)_
_Planning files modified by this verification: none other than this report. I called one
`gsd-tools windows status --raw` probe, which dropped `branching_strategy` from
`.planning/config.json` as a read-side effect; I restored it with `git checkout --` and
`git status --porcelain` is empty apart from this file. Every access to `eval/.cache/` and the
gitignored trees was a read; no capture evidence, excerpt corpus or write-once Slice-A record was
touched._

---

## HISTORICAL RECORD -- the previous verification's MAINTAINER DISPOSITIONS (2026-09-08)

Preserved verbatim in substance because it is the maintainer's own record. **One item has since moved:**
row 6 was closed at `295e1b4` (16:29) with the review documented at `23-ENVELOPE.md:209-241`, after the
section below was written. The other two dispositions stand and I confirmed both.

### ACCEPTED -- the WINDOWS row 7 review-before-use ordering failure

**Disposition: accepted as a recorded historical defect. Waived in the ledger with its reason.**

The finding is real and measured: the review record for `eval/lz-eval-p23-citation-audit.mjs` and
`eval/lz-eval-p23-resolvability.mjs` (`1bdb1ee`) is NOT a git ancestor of their first-use commit
`3189239`. I re-confirmed both directions at HEAD: `1bdb1ee -> 3189239` exits 1, the reverse exits 0.

No later action makes `1bdb1ee` an ancestor of `3189239`; re-reviewing now would establish ordering for
FUTURE use while the recorded breach concerns PAST use. Repair is not available, so the honest options
were to record it or obscure it. The substantive review has since been delivered and found three real
defects in what the two modules claimed -- a per-hop deadline described as a total, a both-forms
unification claim pointing at a test that skips without the cache, and a label guard whose regex would
not have caught an affirmative relabel to a support claim. All three are fixed and the guard fix is
discrimination-proven. The protection review-before-use exists to provide was provided -- late, and now
recorded as late.

The ENV-08 ancestry rule caught its own authors. A control that fires on the people who wrote it is
evidence it is real rather than decorative.

### ACCEPTED -- the envelope's length overshoot

**Disposition: the recorded deviation is accepted. No disclosure is cut.**

The criterion (one page, at most two) and the mandated content list are mutually unsatisfiable, and
where they conflict the disclosure wins. The correct remedy is to amend the criterion in a later phase.

**Update from this re-verification:** the envelope is now **250 lines / 3608 words**, up from the
190 / 2627 the disposition accepted. The growth is entirely disclosure -- the row-6 review corrections
(`f030aef`, +30 lines including NOT ESTABLISHED row 12 and the proxy-seat paragraph) and the WR-02
denominator amendment (`1f25e1a`, +9 lines). The accepted deviation is therefore larger than when it was
accepted, for the reason the acceptance gave. Recorded, not re-opened; it is a plan acceptance criterion,
not a ROADMAP criterion.

### RESOLVED SINCE -- WINDOWS row 6, the envelope usefulness read

The previous section recorded this as OPEN and not delegable. It was closed at `295e1b4` on five
independent fresh-context agent reviews plus maintainer ratification of the resulting corrections. The
review FAILED the document on three defects, corrected at `f030aef`. `PROJECT.md:116` names a
fresh-context reviewer subagent as a valid form of independent review, and the closure names its own
form and states it is weaker than a maintainer's own prose read rather than claiming equivalence. I
accept the closure and am not re-opening it.
