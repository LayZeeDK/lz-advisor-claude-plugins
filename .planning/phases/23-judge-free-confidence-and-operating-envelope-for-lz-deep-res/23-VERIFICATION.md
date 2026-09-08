---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
verified: 2026-09-09T00:00:00Z
status: passed
score: 6/6 ROADMAP success criteria verified (SC2 by accepted override -- narrowed, not upgraded); all 8 ENV ledger rows now level with the evidence -- 6 MET, ENV-04 MET as PARTIAL-Q2, ENV-08 PARTIAL on an accepted unrepairable ordering defect
behavior_unverified: 0
overrides_applied: 1
re_verification:
  previous_status: gaps_found
  previous_score: "5/6 ROADMAP success criteria verified (SC2 unmet as written); ENV-08's content-review half discharged; 3 requirements-ledger rows not level with the evidence"
  gaps_closed:
    - "Gap 1 (SC2 / ENV-03 proxy seat) -- CLOSED by an accepted override plus the ledger edit it asked for. `overrides[0]` carries the suggested text UNAMENDED with `accepted_by` / `accepted_at` / `reason` / `scope`; the frontmatter parses and the `must_have` text is a UNIQUE match to ROADMAP Success Criterion 2 (`.planning/ROADMAP.md:351`) -- 100% of its tokens appear in SC2, while every other criterion scores <=0.28 in BOTH directions, so the declared `scope` is mechanically as narrow as it claims and cannot reach another criterion. `.planning/REQUIREMENTS.md:96` and `:199` now carry the proxy-seat qualifier and land LEVEL rather than overshooting: each KEEPS `branch (a) MEASURED` and the full `tp 18 / fn 2`, `tn 20 / fp 0`, n=40, seed-20260907 figures, so the tally achievement is not thrown away, while naming the proxy seat, the two independent contract-mismatch grounds and the untested inference -- matching `23-ENVELOPE.md:31-40` and NOT ESTABLISHED row 12. The disable ground is real, not asserted: the seat lives at `plugins/lz-advisor/agents/research-verify-voter-sonnet.md` and `.claude/settings.json` sets `lz-advisor@lz-advisor-claude-plugins: false` in this repo"
    - "Gap 2 (ENV-04 realized disposition) -- CLOSED. `.planning/REQUIREMENTS.md:97` now appends the disposition in the same shape ENV-05 (`:98`) and ENV-06 (`:99`) use, and it is ACCURATE rather than merely present: PARTIAL-Q2, comparative bar NOT SET and NOT ESTABLISHED, one of two fresh q2 reports admissible with the built-in q2 an ABSENCE, comparative half branch (b) NOT-ESTABLISHABLE-BY-METHOD, both q1 rows a not-bar-setting dry run under the disclosed contamination. Every clause agrees with the status-table row at `:200`, with the record it cites -- `eval/lz-eval-p23-citation-audit-q2-record.md` line 1 reads exactly `ENV-04 status: PARTIAL-Q2` -- and with `23-ENVELOPE.md:47` plus NOT ESTABLISHED row 3"
    - "Gap 3 (ENV-08 ledger row false about its own cited ledger) -- CLOSED. `.planning/REQUIREMENTS.md:101` and `:204` now match the LIVE ledger: `gsd-tools windows status --raw` returns `open_count 0 / fixed_count 6 / waived_count 1 / total_count 7`, exactly what both lines assert. All three cited closure commits exist and are what the lines say (`e3a840a` the wording/precision corrections, `f778b13` the UNCITED label-guard fix, `f030aef` the ENV-03 seat-claim correction), and `PROJECT.md:116` does define review to admit a fresh-context reviewer subagent. The second missing bullet is also discharged: the disposition is DECIDED and RECORDED as staying PARTIAL with the box UNCHECKED, and I ENDORSE that call -- ENV-08's text binds the word BEFORE, the ordering was measurably breached for two named modules, and a waiver accepts that defect rather than meeting the requirement. Checkbox `- [ ]`, the requirement-text `**PARTIAL**` and the status-table `**PARTIAL**` are mutually consistent"
    - "Carried from the previous pass, re-confirmed: ENV-08's content-review half is discharged by REAL reviews, not presence checks (rows 1-5 review failed one record outright and produced substantive corrections at `e3a840a` plus a discrimination-proven guard fix at `f778b13`; the row-6 review FAILED the envelope on three named defects, corrected at `f030aef`), and the understated ENV-01/02/03/07 rows were corrected at `073d0f7`"
  gaps_remaining: []
  regressions: []
  no_regressions_found_in:
    - "Code. All eight Phase-23 co-tests are green at HEAD (161 pass / 0 fail) and the packaging boundary is 2/2, after the seven CR-01..CR-07 fixes landed post-verification. Every headline figure re-derives byte-identically against the POST-fix modules: `sources=12 unmatched=0 markers=0/0 uncited-units=59/67`, cells `tp 18 / fn 2` and `tn 20 / fp 0`, retrieval 30 of 40, `validateManifest` 3-pass-1-throw, `extractSystemInit` ccVersion 2.1.263"
    - "Freeze ancestry. `9ab9933` is still a strict ancestor of ALL post-freeze commits -- 46/46 now, up from the 22 the previous report checked -- and the negative control still discriminates (`1bdb1ee -> 3189239` exit 1, reverse exit 0)"
    - "The closure commit `18e63c9` introduced NO new inconsistency. It changed exactly two files and ten lines; nothing was re-run and no figure moved. Each of the five edited `.planning/REQUIREMENTS.md` lines was checked against its own cited source rather than against the commit message: the live WINDOWS ledger, the q2 record's machine-readable status line, `23-ENVELOPE.md:31-40` / `:46` / `:47` / NOT ESTABLISHED rows 3 and 12, `PROJECT.md:116`, `.claude/settings.json`, and all eight cited commit hashes"
gaps: []
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
    verifier_confirmation: >-
      Confirmed in the follow-up pass. Frontmatter parses; all five fields present. The `must_have`
      text matches ROADMAP Success Criterion 2 (`.planning/ROADMAP.md:351`) at 100% token coverage and
      matches NO other criterion above 0.28 in either direction, so the `scope` restriction is
      mechanically enforced by the text itself, not merely declared. The ledger edits it required
      landed level rather than overshooting. Counted toward `verified_truths` as PASSED (override).
overrides_suggested:
  - must_have: "Slice A runs: the verify-voter is scored against the frozen AVeriTeC seed list, tallied per confusion-matrix direction and never pooled, reported descriptively with its PROVISIONAL limits"
    status: accepted
    accepted_as: "overrides[0]"
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
    resolution: "Both halves done at `18e63c9` -- retained verbatim because `overrides[0]`'s reason cites this entry as the text it accepted unamended."
warnings_for_other_gates:
  - artifact: "23-ENVELOPE.md"
    line: "125-126"
    issue: "Published `10 of 23` body paragraphs ending on a Confidence/Assurance line and `19 of the 59` uncited units being metadata lines; I measure 9 and 20. Pre-existing from Plan 23-07, unchanged by `18e63c9`. The two errors run in OPPOSITE directions and the conclusion is unaffected. Fails NO must-have -- carried forward as a WARNING, worth a two-integer correction whenever the envelope is next touched"
  - artifact: "23-REVIEW.md"
    line: "frontmatter"
    issue: "Still reads `status: issues_found` / `critical: 7` though all seven CR fixes landed and are green in the co-tests. STALE rather than open. Belongs to whoever owns the review gate; not a Phase-23 goal defect and not a gap here"
  - artifact: "23-SECURITY.md"
    line: "frontmatter"
    issue: "`verdict: SECURED` / `threats_open: 0` against `verdict_as_audited: OPEN_THREATS` / `threats_open_as_audited: 1`, closed by the orchestrator at `8aaf967` with no auditor re-audit. Not re-adjudicated here; bears on no ROADMAP criterion and bears on ENV-08 only favourably"
---

# Phase 23: Judge-free confidence and operating envelope -- Verification Report (RE-VERIFICATION, CONFIRMED)

**Phase Goal:** produce defensible, honestly-bounded confidence in `lz-deep-research` using
confidence sources requiring neither a calibrated LLM judge nor closed-book gold; publish an
OPERATING ENVELOPE plus an explicit statement of what was NOT established and why; close the
v2.1.0 measured-quality question under one of three sanctioned terminations.

**Verified:** 2026-09-09
**Status:** passed
**Re-verification:** YES -- two passes. Pass 2 (this report's verdict) re-derived every figure at a HEAD
that had moved 12 commits, and found SC2 unmet as written on a proxy-seat disclosure the first pass never
saw. Pass 3 is a SCOPED CONFIRMATION over the closure commit `18e63c9`, which accepted the offered
override and brought three requirements-ledger rows level. All three open items are now closed.

## Pass 3 -- the scoped confirmation over `18e63c9`

`18e63c9` changed exactly two files and ten lines. Nothing was re-run and no figure moved, so the pass-2
evidence base is carried forward as established: the eight co-tests green at HEAD (161/0), the packaging
boundary 2/2, every headline figure re-deriving byte-identically on the post-CR-fix modules, freeze
ancestry 46/46 with a discriminating negative control, and the ENV-08 rows-1-6 closures being real
reviews. What I checked instead is the thing that changed, and I checked it for ACCURACY rather than
presence -- each edited line against its own cited source, never against the commit message.

### The override block

| Check | Result |
|---|---|
| Frontmatter parses | YES. Parsed with a real YAML parser; 14 top-level keys, `overrides` a one-item list |
| All required fields present | YES -- `must_have`, `reason`, `accepted_by`, `accepted_at`, `scope` |
| `must_have` matches the criterion it overrides | YES, and UNIQUELY. Token coverage against `.planning/ROADMAP.md:351` (SC2) is **1.00** in the must_have -> criterion direction. It is a near-verbatim restatement of SC2 minus only the trailing enumeration of the three PROVISIONAL limits, which the must_have compresses to "with its PROVISIONAL limits" |
| Does `scope` silently reach anything else? | NO, and this is mechanically true rather than a promise. Overlap against the other five criteria: SC1 0.20, SC3 0.28, SC4 0.16, SC5 0.08, SC6 0.16 -- every one far under the 0.80 match threshold in BOTH directions. The text cannot match another criterion even if the `scope` line were deleted. ENV-04..ENV-08 share no distinctive token with it either |
| Is it an upgrade in disguise? | NO. `overrides_applied` moved 0 -> 1 and nothing else in the score moved by it except SC2 itself. The reason text asserts a narrowing and the ledger edits it required carry that narrowing forward rather than dropping it |

**One ground in the reason I re-checked from disk rather than carrying:** "the plugin is deliberately
disabled in this repository, so the seat is absent from the executing session's registry." The seat is
`plugins/lz-advisor/agents/research-verify-voter-sonnet.md`, and `.claude/settings.json` in this repo sets
`"lz-advisor@lz-advisor-claude-plugins": false`. Both halves hold. This is an INDEPENDENT ground from the
contract mismatch, so the substitution's justification does not rest on a single reading.

### The five edited `REQUIREMENTS.md` lines, checked for accuracy

| Line | Edit | Accurate? | How I checked |
|---|---|---|---|
| `:96` | ENV-03 requirement text gains the proxy-seat qualifier | **YES, and level** | It keeps `COMPLETE on termination branch (a) MEASURED` and states "The tally half is fully satisfied and independently re-derived", so it does not overshoot into disowning the measurement. It names the proxy seat, both contract-mismatch grounds, the plugin disable, and the untested inference -- each of which I confirmed against `23-ENVELOPE.md:31-40` and NOT ESTABLISHED row 12 |
| `:199` | ENV-03 status row gains the same qualifier | **YES, and level** | Retains `unrefuted n=20 tp 18 / fn 2`, `refuted n=20 tn 20 / fp 0`, `n=40`, `seed 20260907` and the re-derivation note, then adds the proxy fact. Matches `23-ENVELOPE.md:46`, whose ENV-03 limits cell says the same in the same direction |
| `:97` | ENV-04 requirement text gains its realized disposition | **YES** | Every clause agrees with `:200` and with the record it cites. `eval/lz-eval-p23-citation-audit-q2-record.md` line 1 is exactly `ENV-04 status: PARTIAL-Q2` -- the single machine-readable status line that record designates for this purpose. Branch letter (b), NOT-SET comparative bar, single-admissible-report fact and the built-in-q2 ABSENCE all match `23-ENVELOPE.md:47` and NOT ESTABLISHED row 3. It adds "under the disclosed contamination", which `:200` omits and which ENV-04's own requirement text requires -- an addition, not a contradiction |
| `:101` | ENV-08 requirement text restated; box stays `- [ ]` | **YES** | The live ledger returns `open_count 0 / fixed_count 6 / waived_count 1 / total_count 7`, exactly as asserted. `e3a840a`, `f778b13`, `f030aef` all exist with the subjects the line describes. `PROJECT.md:116` does define review to admit "a fresh-context reviewer subagent" |
| `:204` | ENV-08 status row restated | **YES** | Same live-ledger match. The previously FALSE sentence ("SIX content reviews are NAMED AS OPEN GAPS") is gone and replaced by the true one. The final clause "A presence check was never allowed to stand in for a content review" is preserved and remains supported by the rows-1-6 evidence |

**No new inconsistency with `23-ENVELOPE.md`.** I read the envelope's ENV-03 paragraph (`:31-40`), its two
reading rows (`:46`, `:47`), and NOT ESTABLISHED rows 3 and 12 against all five edited lines. The ledger
is now weaker-or-equal to the envelope on every disputed point and identical on the figures, which is the
correct direction. One envelope fact the ledger does not repeat -- the header table's "ENV-03 Slice-A
verify-voter seat: alias `sonnet` only -- NAMED GAP, no resolved string recorded" (`:11`) -- is not a
ledger omission: no ENV requirement asks for a resolved model pin on the VOTER seat (ENV-02's pin
requirement binds captured REPORTS, and SC4 is satisfied on those), and the gap is already published where
a reader meets it.

### The ENV-08 PARTIAL call -- ENDORSED

The recorded call is **stays PARTIAL, checkbox UNCHECKED**, on the reasoning that a waiver accepts a
defect rather than meeting the requirement. **I endorse it, and I would have reached the same call.**

ENV-08's own text binds the ordering word: "content-reviewed **BEFORE** it drives an LLM task OR ships".
That clause was measurably breached for `eval/lz-eval-p23-citation-audit.mjs` and
`eval/lz-eval-p23-resolvability.mjs` -- `1bdb1ee` is not a git ancestor of `3189239`, which I re-confirmed
in both directions. Checking the box would make the ledger assert, in the requirement's own words, that
those two modules were reviewed before first use. That is false and no future action can make it true.
The substance was delivered and the protection was eventually provided; the ORDERING guarantee was not.
`[x]` would be a claim about the ordering, so `- [ ]` is the honest mark.

The three surfaces are mutually consistent: checkbox `- [ ]` at `:101`, requirement text `**PARTIAL**`
with the reason at `:101`, status row `**PARTIAL**` with the same reason at `:204`, and WINDOWS row 7
`waived` with its reason in the live ledger. No surface claims more than another.

**This PARTIAL is not a verification gap.** The pass-2 gap was that the ledger was FALSE about its own
cited ledger, not that ENV-08 was partial. A requirement recorded PARTIAL, with its defect named,
measured, dispositioned by the maintainer and accurately reflected on every surface, is a closed
disposition. ENV-08 also sits in no ROADMAP success criterion's evidence chain except SC5, which is
independently VERIFIED on its mechanical half.

## Goal Achievement

### The six ROADMAP Success Criteria

| # | Criterion | Status | Evidence I produced myself at HEAD |
|---|---|---|---|
| 1 | Pre-registration frozen in its own timestamped commit BEFORE any capture, vote or score | VERIFIED | `git show --name-only 9ab9933` returns EXACTLY three files (`lz-eval-p23-capture-driver.md`, `lz-eval-p23-prereg.md`, `lz-eval-p23-prereg.test.mjs`) at `2026-09-07T23:37:33+02:00`. I re-ran `git merge-base --is-ancestor` over ALL **46** post-freeze commits (the first pass checked 22): **46/46 ANCESTOR-OK, zero exceptions.** Negative control holds: `1bdb1ee -> 3189239` exit 1, reverse exit 0. `eval/lz-eval-p23-prereg.test.mjs` 25/25 green |
| 2 | **Slice A runs: THE VERIFY-VOTER is scored**, tallied per direction and never pooled, reported descriptively with its PROVISIONAL limits | **PASSED (override)** | Tally half fully re-derived: 40 raw verdict JSONs re-tallied to gold `unrefuted` **tp 18 / fn 2** and gold `refuted` **tn 20 / fp 0**, 40 distinct `(direction, drawIndex)` keys, `read.json` exactly five keys with no rate/interval/pass-fail field, three PROVISIONAL limits present verbatim, retrieval 30 of 40. The criterion's SUBJECT was a PROXY seat -- a generic `Explore` sub-agent on Sonnet 5 carrying the frozen dispatch string, per AMENDMENT RECORD 1 -- not the shipped `research-verify-voter-sonnet`. Accepted by the maintainer on 2026-09-09 as a NARROWING (`overrides[0]`), scope-limited to this criterion, with the narrowing published at `23-ENVELOPE.md:31-40` and NOT ESTABLISHED row 12 and now carried onto `REQUIREMENTS.md:96` / `:199` |
| 3 | Deterministic citation audit over every admissible report, format-normalized on rules fixed BEFORE any rate | VERIFIED | Re-ran the CLI on the POST-CR-03/CR-04-fix module: `sources=12 unmatched=0 markers=0/0 uncited-units=59/67`, byte-identical to the published record. I also independently reconstructed the module's whole unit pipeline and reproduced its 23 paragraphs and 67/59 exactly, so the enumeration is faithful. Only one report was admissible and the comparative bar is published NOT SET rather than fabricated |
| 4 | Every report used in any reading carries a `validateManifest`-passing MANIFEST; a report without one is NOT admissible; `extractSystemInit` pins a version from a real `system/init` event | VERIFIED | Executed in-process at HEAD, after `lz-eval-baseline-manifest.mjs` was changed by CR-06: lz q2 `true`, lz q1 `true`, built-in q1 `true`, built-in q2 **THROWS** `manifest report file does not exist (truncated/empty capture?)` -- exactly the string the envelope quotes -- and is filed `.MANIFEST.INADMISSIBLE.json`. `extractSystemInit` on both real q2 streams returns `ccVersion 2.1.263` plus the resolved model (`claude-sonnet-5`, `claude-opus-5`). Built-in q2 `report.md` confirmed absent on disk |
| 5 | ZERO out-of-family spend; no maintainer-authored gold; the eval tree never ships | VERIFIED | `rg -i` for openai / gpt-5 / gemini / copilot / mistral / cohere / ollama across all `eval/lz-eval-p23-*.mjs`: **exit 1, zero hits.** Gold is AVeriTeC dev-set `item.label` through `collapseAvtLabel`, external. `eval/lz-eval-packaging-boundary.test.mjs` 2/2 green, including "no shipped runtime `.mjs` imports any `eval/` script" and "no package.json/node_modules under the plugin tree" |
| 6 | An OPERATING ENVELOPE is published plus an explicit statement of what was not established and why; no significance claim, stated in advance as unreachable | VERIFIED | `23-ENVELOPE.md` carries exactly **8** `##` sections, all non-empty, and exactly **one** `Resolved branch:` line (`MEASURED`, line 178). NOT ESTABLISHED grew from 11 to **12** named rows -- row 12 added by the row-6 review, naming the confidence-label calibration gap. Ceiling arithmetic `2*0.5^5 = 0.0625` and `0.05^(1/5) = 0.549` sit in the FROZEN blob at `9ab9933` |

**Score: 6/6 criteria verified** -- five on direct evidence, SC2 as PASSED (override). `behavior_unverified: 0`.

### What SC2's override does and does not buy

The override does NOT say the shipped voter was measured. It says the criterion is satisfied by measuring
the reviewed voter PROMPT, and it accepts that as a narrower reading than the criterion's words. Three
things keep that honest, and I verified all three:

1. **The narrowing is published where a reader meets it.** `23-ENVELOPE.md:31-40` leads the "What this
   covers" section with it, the ENV-03 reading row's limits cell repeats it (`:46`), and NOT ESTABLISHED
   row 12 states outright that "No reading in this phase connects ENV-03 to the shipped label."
2. **The ledger no longer reads stronger than the envelope.** This was the pass-2 regression and it is
   fixed at `:96` and `:199` without overshooting -- both keep the figures and the branch letter.
3. **The substitution was pre-verdict and structurally forced.** AMENDMENT RECORD 1 moved no bar, item,
   seed or reporting rule, and the shipped seat is incapable of the dispatch on two independent grounds.

What remains genuinely unmeasured is the shipped seat's behaviour and the calibration of the printed
confidence label. Both are named, not implied. That is a scope boundary for a future phase, not a gap in
this one -- closing it needs a redesigned dispatch contract and the plugin re-enabled here.

### The three adversarial checks re-run

**Does anything improperly upgrade?** No. Exactly one `Resolved branch: MEASURED` line. The ENV-06
record still carries exactly one status line, `NOT-RUN branch (b)`, and the built-in q2 report and
`citation-audit-q2-builtin.json` are both still absent on disk, which is the fact that status line is
asserted against. `18e63c9` upgraded nothing: it added qualifiers and left every checkbox where it was.

**Is the proxy-seat narrowing carried where a reader will meet it?** In the envelope, YES and
prominently. In `.planning/REQUIREMENTS.md`, **now YES** -- both `:96` and `:199`. The pass-2 asymmetry
is gone.

**Did the seven post-review code fixes move any published figure?** No. I re-ran every one. `23-REVIEW.md`
predicted exactly this ("Latent" for CR-01..CR-07) and its prediction holds under my own execution.

### Requirements ledger -- the current state against the evidence

| Requirement | My verdict | Ledger says | Level? |
|---|---|---|---|
| ENV-01 | MET | `Complete` + full reasoning (lines 94, 197) | YES |
| ENV-02 | MET | `Complete` + full reasoning (lines 95, 198) | YES |
| ENV-03 | MET AS NARROWED -- proxy seat, under `overrides[0]` | `Complete as NARROWED` + the proxy qualifier + the full figures (lines 96, 199) | **YES -- brought level at `18e63c9`** |
| ENV-04 | MET AS PARTIAL-Q2 | disposition now on BOTH the requirement text (line 97) and the status row (line 200) | **YES -- second half closed at `18e63c9`** |
| ENV-05 | MET, branch (a) | `Complete` + branch letter (lines 98, 201) | YES |
| ENV-06 | MET by published termination, branch (b) | `Complete` + branch letter (lines 99, 202) | YES |
| ENV-07 | MET | `Complete` + reasoning (lines 100, 203) | YES |
| ENV-08 | PARTIAL -- content-review half DISCHARGED; ordering defect ACCEPTED, not met | `- [ ]` + `**PARTIAL**` on both surfaces, matching the live ledger (lines 101, 204) | **YES -- and I endorse the PARTIAL call** |

**No ORPHANED requirements.** ROADMAP maps ENV-01..08 to Phase 23 and all eight appear in the plans.

One INFO note, not a gap and not touched by `18e63c9`: line 197 says the freeze was proven an ancestor of
"all 22 post-freeze commits". That was true of the verification it records; the current count is 46, which
I re-measured. It is a record of a past check, not a claim about the present tree, so it is not false.

### ENV-08: are the six `fixed` rows real reviews?

I checked this rather than accepting the count, because a `fixed` row is exactly where a presence check
would hide.

| Row | Closed at | What the closure actually produced | Real review? |
|---|---|---|---|
| 1-5 | `a1f71c1` | `e3a840a` edits all five published records (+44 / -22 across five files); `f778b13` rewrites the UNCITED label guard because the old regex passed only on inflection mismatch and would NOT have caught an affirmative relabel to a support claim -- the exact substitution it exists to prevent | **YES.** A presence check produces no edits. The review failed one record outright and held four pending named edits |
| 6 | `295e1b4` | The review FAILED the envelope on three defects and `f030aef` corrected them: the document contradicted its own header table about what judged ENV-03; NOT ESTABLISHED read exhaustive while omitting the confidence-label calibration gap (now row 12); N7's stated reason was false and is corrected to the observed effect size | **YES**, and it is the closure that produced the SC2 finding |
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
| **Pass 3:** WINDOWS ledger matches what `REQUIREMENTS.md:101` / `:204` assert | `gsd-tools windows status --raw` | `open_count 0 / fixed_count 6 / waived_count 1 / total_count 7` | PASS |
| **Pass 3:** VERIFICATION frontmatter parses and `overrides[0]` is complete | real YAML parse | 14 keys; all five override fields present | PASS |
| **Pass 3:** override `must_have` matches SC2 and nothing else | token-overlap over all six criteria | SC2 **1.00**; SC1 0.20, SC3 0.28, SC4 0.16, SC5 0.08, SC6 0.16 | PASS |
| **Pass 3:** the plugin-disable ground is real | seat path + `.claude/settings.json` | seat at `plugins/lz-advisor/agents/research-verify-voter-sonnet.md`; `lz-advisor@lz-advisor-claude-plugins: false` | PASS |
| **Pass 3:** every commit cited by an edited ledger line exists with the described subject | `git log -1` on 8 hashes | all 8 resolve; subjects match | PASS |
| **Pass 3:** ENV-04's cited machine-readable status line | line 1 of `eval/lz-eval-p23-citation-audit-q2-record.md` | exactly `ENV-04 status: PARTIAL-Q2` | PASS |

**Note on the co-test count.** The first pass said "all six p23 co-tests ... 130 pass". There are
**eight** `eval/lz-eval-p23-*.test.mjs` files, not six -- `retain` (11) and `sliceA-gate` (7) were
missed. All eight are green: 34 + 25 + 14 + 11 + 20 + 7 + 26 + 24 = **161**. The count rose from 130
because the CR fixes added discriminating tests. This was an undercount in the first report, not a
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
| -- | -- | No `TBD` / `FIXME` / `XXX` in ANY file this phase changed after the first verification (`git diff --name-only 4f263df..HEAD`, 17 files plus the 2 from `18e63c9`, each scanned) | -- | Clean; the debt-marker gate does not fire on Phase-23 work |
| `.planning/STATE.md` | 166, 168, 169 | `TBD` in the per-phase metrics rollup for Phases 17/19/20 | Info | Pre-existing, other phases; `32a5219` touched only the `stopped_at` line |
| `eval/lz-eval-p23-sliceA-read.mjs` | 88, 164 | `PLACEHOLDER_RE` | Info | A template-substitution identifier, not a debt marker |
| `23-ENVELOPE.md` | 125-126 | "10 of 23 body paragraphs end on [a `Confidence:`/`Assurance:`] line" and "19 of the 59 uncited units are ... metadata lines" | Warning | I measure **9** of 23 and **20** of 59. My reconstruction reproduces the module's own 23 paragraphs and 67/59 pair exactly, so the enumeration is faithful. Pre-existing from Plan 23-07, unchanged by `18e63c9`; the two errors run in OPPOSITE directions and the conclusion ("at least in part a report-format effect") is unaffected. Worth a two-integer correction, but it fails no must-have. **Carried forward, still open** |
| `.planning/REQUIREMENTS.md` | 96, 199 | ENV-03 recorded MEASURED with no proxy-seat qualifier | ~~Blocker~~ **RESOLVED** | Fixed at `18e63c9`. Both lines now carry the qualifier and land level -- figures and branch letter retained |
| `.planning/REQUIREMENTS.md` | 97 | PARTIAL-Q2 requirement text with no realized disposition | ~~Blocker~~ **RESOLVED** | Fixed at `18e63c9`. Matches `:200` and the q2 record's own status line |
| `.planning/REQUIREMENTS.md` | 101, 204 | ENV-08 asserted as six OPEN content reviews against a ledger reading zero open | ~~Warning~~ **RESOLVED** | Fixed at `18e63c9`. Both lines now match the live ledger exactly |

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
  every one is green in the co-tests. That frontmatter is STALE rather than open. **Unchanged by
  `18e63c9` and carried forward.** Flagged for whoever owns the review gate; not a Phase-23 goal defect
  and not a gap here.
- **`23-VALIDATION.md`** reads `status: validated`, `nyquist_compliant: true`, `wave_0_complete: true`,
  PARTIAL only on ENV-08's human half -- which my ENV-08 finding above shows discharged on its
  content-review half, with the residual ordering defect accepted.

## Summary

**PASSED.** The phase goal is achieved and all three items the previous pass left open are closed.

**What closed, and how.** All three closures are edits to the requirements ledger plus the one maintainer
decision the previous pass asked for. Nothing was re-run and no figure moved, which I confirmed rather
than assumed -- `18e63c9` touches two files and ten lines.

1. **SC2 / ENV-03** -- the offered override was accepted unamended, and it is a legitimate override rather
   than a rubber stamp: the frontmatter parses, all five fields are present, and the `must_have` text
   matches SC2 at 100% token coverage while matching no other criterion above 0.28, so the declared
   `scope` is enforced by the text itself. `REQUIREMENTS.md:96` and `:199` now carry the proxy-seat
   qualifier and land LEVEL -- they keep `branch (a) MEASURED` and the full 18/2 and 20/0 figures, so the
   correction did not overshoot into disowning a real measurement.
2. **ENV-04** -- `:97` now carries the realized disposition, and it is accurate against `:200`, against
   the q2 record's own machine-readable `ENV-04 status: PARTIAL-Q2` line, and against the envelope's ENV-04
   row and NOT ESTABLISHED row 3.
3. **ENV-08** -- `:101` and `:204` now match the live ledger byte-for-byte on the counts they assert
   (`open 0 / fixed 6 / waived 1 / total 7`), every cited commit resolves, and the PARTIAL disposition is
   decided, recorded and consistent across all four surfaces.

**The ENV-08 PARTIAL call is sound and I endorse it.** ENV-08's text binds the word BEFORE; that ordering
was measurably breached for two named modules and cannot be repaired. `[x]` would assert the ordering held.
It did not. Unchecked is the honest mark, and PARTIAL-with-an-accepted-waiver is a closed disposition
rather than an open gap.

**Two items remain open and neither blocks.** Both are carried forward unchanged, as flagged:
`23-ENVELOPE.md:125-126` publishes "10 of 23" and "19 of 59" where I measure 9 and 20 -- errors in
opposite directions, conclusion unaffected, fails no must-have; and `23-REVIEW.md`'s frontmatter is stale
at `status: issues_found` / `critical: 7` though all seven fixes landed green, which belongs to the review
gate's owner. Neither is a Phase-23 goal defect, so neither holds the phase at `gaps_found`.

**The deliverable itself remains the strong part.** Every headline figure re-derives byte-identically on
modules that were rewritten by seven BLOCKER fixes after the first verification. The freeze holds over 46
post-freeze commits with a discriminating negative control. The envelope publishes an absence as an
absence, keeps a cost figure's ambiguity rather than picking the flattering reading, corrected itself
against its own review on three points, and now the requirements ledger says the same thing the envelope
says -- in both directions, on every row.

---

_Re-verified: 2026-09-09 (pass 3, scoped confirmation over `18e63c9`)_
_Verifier: Claude (gsd-verifier)_
_Planning files modified by this verification: none other than this report. Pass 2 called one
`gsd-tools windows status --raw` probe which dropped `branching_strategy` from `.planning/config.json` as
a read-side effect and I restored it with `git checkout --`; I called the same probe again in pass 3 and
`git status --porcelain` came back empty, so it did not recur. Every access to `eval/.cache/` and the
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

**Pass-3 note:** this is the disposition that keeps ENV-08 at PARTIAL, and `18e63c9` recorded that call
explicitly with the checkbox left unchecked. I endorse it; see "The ENV-08 PARTIAL call" above.

The ENV-08 ancestry rule caught its own authors. A control that fires on the people who wrote it is
evidence it is real rather than decorative.

### ACCEPTED -- the envelope's length overshoot

**Disposition: the recorded deviation is accepted. No disclosure is cut.**

The criterion (one page, at most two) and the mandated content list are mutually unsatisfiable, and
where they conflict the disclosure wins. The correct remedy is to amend the criterion in a later phase.

**Update from the re-verification:** the envelope is now **250 lines / 3608 words**, up from the
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

### ACCEPTED -- the ENV-03 proxy-seat substitution (added 2026-09-09)

**Disposition: accepted as a NARROWING, scope-limited to ENV-03 / ROADMAP Success Criterion 2.**
Recorded in this file's `overrides[0]` and carried onto `REQUIREMENTS.md:96` and `:199`. It upgrades
nothing: what remains unmeasured is the shipped seat's behaviour and the calibration of the printed
confidence label, and both are named at `23-ENVELOPE.md:31-40` and NOT ESTABLISHED row 12 rather than
implied. Closing them is new scope -- a redesigned dispatch contract plus the plugin re-enabled in this
repository -- not deferred Phase-23 work.
