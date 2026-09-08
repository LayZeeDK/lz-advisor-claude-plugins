# Slice A -- the judge-free per-direction descriptive read (ENV-03, Phase 23 Plan 23-05)

**This is a cross-tabulation of the verify-voter's verdicts against a 2020-labelled reference standard,
reported per direction and never pooled. It is an EXPLORATORY diagnostic read, not a performance claim:
no threshold was set in advance for it to pass, none is applied afterwards, and it cannot be the basis of
a claim about lz-deep-research's accuracy on general research questions.** Its three named PROVISIONAL
limits -- the uniform 2020 `claim_date`, the ~34% US-2020-politics / ~21% COVID topical narrowness, and
the evidence-set mismatch between 2020-labelled gold and a live-2026-web voter -- scope what the numbers
can mean.

The frozen authority is `eval/lz-eval-p23-prereg.md` (freeze commit
`9ab993319da0fc3a10ae0cba45f10cb19576b93a`, 2026-09-07T23:37:33+02:00) as amended by its AMENDMENT
RECORD 1 (2026-09-08). This record exists because `eval/.cache/` is gitignored: a reading that dies with
one cache clean is not a published reading (threat T-23-06, which has no backup).

## The four cells, per direction, never pooled

`sliceARead` returned EXACTLY the five keys `["unrefuted", "refuted", "n", "drawSeed",
"provisionalLimits"]`. There is no rate, no accuracy, no interval and no pass/fail field in the output,
and none is derived here.

**Gold direction `unrefuted` (n = 20)**

| Cell | Count |
|---|---|
| true positives (`tp`) -- gold `unrefuted`, voter said `unrefuted` | **18** |
| false negatives (`fn`) -- gold `unrefuted`, voter said `refuted` | **2** |

**Gold direction `refuted` (n = 20)**

| Cell | Count |
|---|---|
| true negatives (`tn`) -- gold `refuted`, voter said `refuted` | **20** |
| false positives (`fp`) -- gold `refuted`, voter said `unrefuted` | **0** |

`n` = 40 definite verdicts. `drawSeed` = 20260907.

**The cells ARE the output.** Publishing the cross-tabulation itself rather than a derived rate is STARD
2015 item 23 ("Cross tabulation of the index test results ... by the results of the reference standard"),
and it is why the balanced 20/20 draw was frozen: an unbalanced draw leaves the smaller direction's row
uninformative, and a pooled figure would hide a direction-asymmetric error inside a single number. See
*The error structure* below, where that design property earns itself.

## The deliberate decline of a confidence interval

**No confidence interval is emitted, by design, and that is recorded here as a decision rather than left
as an omission.** STARD 2015 item 24 asks for estimates of accuracy and their precision; ENV-03 declines
both halves deliberately.

The reason is that **at this n and against this reference standard the limit is on the CLAIM, not merely
on an interval.** An interval would quantify sampling uncertainty around a quantity this design does not
license anyone to read as the voter's accuracy -- the reference standard is 2020-labelled, the pool is
topically narrow, and the read is exploratory by pre-registration. Attaching a precision estimate to a
figure whose construct validity is the actual limit would make the reading look more certifying, not
less. The pre-registration states the phase's no-significance ceiling up front for the same reason.

## The three PROVISIONAL limits

Quoted verbatim from the frozen module's own strings, as `sliceARead` returned them. They SCOPE the read;
they do not block it.

1. `uniform 2020 claim_date (out-of-cutoff for a 2026 voter; the voter judges the claim as-of 2020)`
2. `topical narrowness (the AVeriTeC dev set is ~34% US-2020-politics, ~21% COVID -- NOT a representative cross-section of general research questions; Slice A speaks to fact-check-style claims, not Slice B natural breadth)`
3. `evidence-set mismatch (the AVeriTeC reference standard was labelled against 2020 evidence while the verify-voter searches the live 2026 web, so a verdict-vs-gold disagreement may reflect a different evidence set rather than a voter error)`

### A fourth limit, measured in this run: the read is not purely open-book

The third frozen limit asserts that the voter "searches the live 2026 web". **That is now a MEASUREMENT
rather than an assumption, and it does not hold universally.**

| | Retrieved (`tool_uses` > 0) | Answered from parametric memory (`tool_uses` = 0) |
|---|---|---|
| gold `unrefuted` | 16 / 20 | 4 / 20 |
| gold `refuted` | 14 / 20 | 6 / 20 |
| **all** | **30 / 40** | **10 / 40** |

The ten memory-answered items: `unrefuted-11`, `unrefuted-60`, `unrefuted-6`, `unrefuted-58`,
`refuted-119`, `refuted-139`, `refuted-11`, `refuted-107`, `refuted-91`, `refuted-76`.

**So roughly a quarter of the pool was decided closed-book, and the third provisional limit holds for 30
of 40 items rather than for all 40.** This is stated as a limitation of this reading, not as a defect:
the frozen prompt invites retrieval ("the evidence you can find") but does not compel it, and a model
that already knows a fact does not search. Retrieval is claim-dependent, which is a property of the
instrument as frozen.

Per-item `tool_uses` counts live in `eval/.cache/p23-read/sliceA/retrieval.json` and are reproduced in
the per-item rows below. **They are deliberately held OUTSIDE the frozen verdict schema** so that adding
this observation could not perturb `readSliceAVerdicts` or the five-key read contract -- a side record
cannot change a number it sits beside.

## The error structure

Both errors fall on the same arm:

- `unrefuted drawIndex=17` -- gold `unrefuted`, voter said `refuted`. Retrieved (3 tool uses).
- `unrefuted drawIndex=6` -- gold `unrefuted`, voter said `refuted`. Answered from memory (0 tool uses).

**Two false refutes, ZERO false upholds.** One error retrieved and one did not, so retrieval does not
cleanly predict correctness at this n.

A candidate explanation, offered as a hypothesis and NOT as an established finding: the frozen prompt
frames the task as deciding "whether the CLAIM below is REFUTED", an asymmetric framing that could nudge
a voter toward refuting. The shipped voter contract pushes the same direction on purpose -- it instructs
the seat to "err toward `refuted` when the evidence does not fully support the claim as stated" -- so an
asymmetry in this direction is consistent with the design intent rather than surprising. **This run
cannot distinguish prompt framing from claim difficulty**, and nothing here tests it.

**At n = 20 per arm, 2-versus-0 is NOT significant and is not presented as established.** The
pre-registration's up-front ceiling forbids any significance claim in this phase, and this reading makes
none. What the run supports is the weaker and still useful statement that the two error cells are not
symmetric in this draw.

**The design property this vindicates:** the balanced 20/20 draw and the per-direction never-pooled
reporting are what make the asymmetry visible at all. A single pooled figure over 40 items would have
absorbed both errors into one number and shown nothing about which direction they fell in. That was the
stated reason for the design before any verdict existed, and it is the reason the most interesting thing
in this run is legible.

## Provenance attestation -- the Phase-22 record's weakest link, closed

The Phase-22 transcription-fidelity check came back INCONCLUSIVE rather than passing: 62 of 63 transcript
files were zero bytes and the transport retained no readable copy of the outbound prompt, so what the
instrument actually was is unrecoverable for that run. That was the single weakest link in the Phase-22
record by its own assessment, and it cannot be retrofitted after a write-once run. SEED-005 exists to
close it, and this run closes it.

| Check | Result |
|---|---|
| Dispatch records on disk | **40** |
| Verdicts on disk | **40**, all definite |
| `readSliceAVerdicts` fail-closed cross-check (every verdict has a dispatch record; every stored sha256 recomputes from its stored string) | **PASSED**, 40 pairs returned |
| Independent re-verification: every dispatch record byte-identical to what `buildDispatchString` renders from the frozen draw | **40 ok / 0 mismatched**, no extra records, every drawn item present |
| Write-once provenance overwritten at any point | **No** |

The independent re-verification matters because **32 of the 40 items were dispatched by a delegated
loop.** Recomputing every dispatched string from the frozen builder and the frozen draw is what makes
that delegation auditable rather than trusted. The dispatch harness itself was ephemeral scratchpad
tooling that never entered the repository, and **it composed no prompt**: every dispatched string came
from the frozen `buildDispatchString`, and every provenance record from the frozen write-once
`writeDispatchRecord`.

## How the run was conducted

**Transport.** SESSION-DRIVEN through the Agent tool, one drawn item per call, on the Claude session
pool: `subagent_type: "Explore"`, `model: "sonnet"`. This is the generic Agent sub-agent on Sonnet 5 that
AMENDMENT RECORD 1 specifies, and NOT the shipped `research-verify-voter-sonnet` seat, which cannot
consume the pinned string (it requires an evidence excerpt, an attack mode, an arm and a vote-file path,
and is contracted to write a four-field vote JSON where the pinned string demands one lowercase word).
`claude -p` was not used as a voter transport at any point.

**Seat selection was decided on evidence, not assertion.** A first pilot used a synthetic claim
("Nigeria's capital city is Lagos") that is not one of the 40. Both candidate seats answered it in about
two seconds with zero tool uses, and one of them answered it WRONG. **That first pilot was a badly
designed probe rather than evidence of a broken seat** -- the fact was easy enough to answer from memory,
so it could not test retrieval at all. A second pilot used an unknowable synthetic claim, and the same
`Explore` seat then made two confirmed `WebSearch` calls over 29.8 seconds. The conclusion carried
forward into the limits above is that **the frozen prompt invites retrieval but does not compel it, and
retrieval is claim-dependent.**

**The verdict parsing rule, frozen at dispatch time and applied uniformly to all 40:** the verdict is the
LAST whitespace-delimited token of the reply, lowercased and stripped of trailing punctuation, and it
must be exactly `refuted` or `unrefuted`; anything else is an abstain. The rule was fixed before the
verdicts were read rather than adjusted to fit them, which is what keeps it a parser and not a coder.
Several replies carried prose around the verdict word; one preamble case is noted in
`eval/.cache/p23-read/sliceA/format-notes.json` (`unrefuted-52`).

**The one abstain, and its re-cast.** `refuted drawIndex=14` (Pogba / Macron) first returned the verdict
word followed by a blank line and a `Sources:` list of four URLs, so the last token was part of a URL.
**It was recorded `null` -- an abstain -- rather than coded from the obvious surrounding prose.** It was
then re-cast on its ORIGINAL recorded dispatch string, reusing the write-once provenance rather than
rewriting it, and returned a clean `refuted` with 2 tool uses. Both passes are recorded here: an abstain
that is re-cast is exactly the "re-cast on the next pass" path the plan specifies, and omitting the first
pass would misstate the run. The pool completed with 40 definite verdicts, which is what `sliceARead`
requires -- it throws on fewer rather than reading partially.

## The transfer caveat

The confirmatory-versus-exploratory vocabulary is borrowed from ICH E9 (clinical trials), and the
diagnostic-accuracy reporting layout from STARD 2015 (diagnostic studies). **The transfer to an LLM
evaluation is BY ANALOGY.** A binary index test against a reference standard is structurally similar to
what Slice A does, which is why the layout fits, but neither standard was written for this setting and
neither has been validated for it. The borrowed vocabulary is used here for the discipline it imposes on
what may be claimed -- not as authority that already covers this case.

## Pacing and realized cost

Slice A was ordered FIRST among the phase's metered readings, deliberately and before any q2 capture,
because both draw the same 5-hour session pool. Running the cheap certain reading first means a later
pool exhaustion costs the phase its comparative reading but not its floor.

| | |
|---|---|
| Items dispatched | 40 |
| Re-casts | 1 (`refuted drawIndex=14`, after an abstain) |
| Rate-limit events | none observed |
| Reset-window spread | a single window; the dispatch did not span a pool reset |
| Realized terminal cost | not separately metered -- the Agent-tool voter draws the shared session pool and no per-call cost figure is exposed to the dispatching session |

The cost row is recorded as unavailable rather than estimated. This phase's standing rule is that a
figure is measured from disk or recorded as absent, never guessed at.

## All 40 rows

In the frozen draw order, so this block can be diffed directly against the pre-registration's quoted
draw. `gold` is the drawn direction (the direction IS the gold label by construction). `cell` is the
confusion-matrix cell the row lands in. `tool_uses` is the retrieval side record. `sha256` is the digest
of the exact dispatched string, so the instrument is reconstructible from this file alone after a cache
wipe. Claim text is VERBATIM CORPUS DATA carrying its original Unicode.

```
unrefuted drawIndex=32 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=1-10-2020 sha256=19e2c69edb91598d60f670462bbb0764e10f2bdeadcef3f8f301c0312b83eca0 claim=Nigeria’s urban population at independence was approximately 7 million.
unrefuted drawIndex=63 gold=unrefuted verdict=unrefuted cell=tp tool_uses=3 claim_date=15-9-2020 sha256=6fd7761b9ced7881ae7a9880d7f47c4cc286286b2c4348faa76d4619ced526e6 claim=Fact Check: AARP Did NOT Spend 'Millions In TV Ads Targeting Republican Candidates' -- Nonprofit AARP Is Prohibited From Involvement In Any Political Campaigns
unrefuted drawIndex=52 gold=unrefuted verdict=unrefuted cell=tp tool_uses=3 claim_date=22-9-2020 sha256=00217c23cf4cd551f506e07338a577a9c924b025854f8645c01fb0f95121b45a claim=Americans advised to reconsider travel to Ghana due to COVID-19.
unrefuted drawIndex=11 gold=unrefuted verdict=unrefuted cell=tp tool_uses=0 claim_date=13-10-2020 sha256=42825fbe39b51eddc4f0abd240f44eae8842e941d07bce940efdbec28361b2ee claim=Former President Donald Trump who lost the popular vote by 3 million has nominated a full third of The United Supreme Court, as of 13th October 2020.
unrefuted drawIndex=18 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=8-10-2020 sha256=46897467c121b6674f61f88b57757e2fa2f40d877998f49b2e79fcbea51b72b5 claim=Forty percent of Iowa’s energy resources are from renewables.
unrefuted drawIndex=44 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=1-10-2020 sha256=f5d7a646680d21a480736fdd8c6371fdd83035755bade3b6c847d459be4f835f claim=Nigeria’s urban population at the time of independence was approximately 7 million
unrefuted drawIndex=38 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=1-10-2020 sha256=32d328b42c13eed76b7aa1a66e8a99fb78208c098810d2ee85eeaa44edcc05d7 claim=52% of Nigeria’s current population lives in urban areas
unrefuted drawIndex=60 gold=unrefuted verdict=unrefuted cell=tp tool_uses=0 claim_date=17-9-2020 sha256=4dc23107a651fe1118d38d3ceb31831b00fe90e6921d2abe83c5bd39ba326cc5 claim=The White House blocked a plan to send facemasks to every household in April 2020.
unrefuted drawIndex=54 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=21-9-2020 sha256=5531d33c65697cf50befaaea25eeb09296657ba2c5de4bfe3d70dfa85d56ac88 claim=Basketball superstar Michael Jordan is joining NASCAR as a team owner.
unrefuted drawIndex=46 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=1-10-2020 sha256=3748fe3f3979ff969ae1eb46c9d4b5e8258d99b4f0c1bf1c6ff715e4f31ded36 claim=At independence, Nigeria had a population of 45 million.
unrefuted drawIndex=6 gold=unrefuted verdict=refuted cell=fn tool_uses=0 claim_date=20-10-2020 sha256=a1c51db1ee655f58ab192d1dc9a542b96575197f608863956bb6a1f4fa10ab95 claim=Hunter Biden was chairman of the Nobel Peace Prize winning World Food Program.
unrefuted drawIndex=15 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=10-10-2020 sha256=af362c2d8b0c8a8ecc7b6632e9fc5ad269af20d605fb6660c48485b3d187ea7e claim=From 8th October the UK government will combine weekly flu and covid reports.
unrefuted drawIndex=17 gold=unrefuted verdict=refuted cell=fn tool_uses=3 claim_date=9-10-2020 sha256=d1308898b0f83112ab40d6c0223fbf2e74f742ebba3c940ee95a4159c34e917c claim=Labour reversed the 4,400 health health worker cuts by the LNP.
unrefuted drawIndex=56 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=19-9-2020 sha256=5d19fa43afc561c01f2b2a64b3b52a82db45886f83379b3092d21e9171953aba claim=Sightway Capital is owned by Two Sigma Investments.
unrefuted drawIndex=8 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=18-10-2020 sha256=0705b16c236c5166de17ae76ab48802bf778b8e47e75afbbd6bbaa976e0e8bfd claim=A third of excess deaths in the United States between 1 March and  1 August 2020 during the COVID-19 pandemic could not be directly attributed to the coronavirus
unrefuted drawIndex=49 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=27-9-2020 sha256=a53b4ac0bc81bb0514d57232a8df49553d342f1fa121a0ed07caeebb4dcd6fb6 claim=A Maryland man was sentenced to a year in jail for throwing parties.
unrefuted drawIndex=73 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=6-9-2020 sha256=dc5578fdd5681058ea7a755cd2bee3deef90366a694a84466fe7d32b9ea74609 claim=Spraying of Naira notes is an offence punishable by imprisonment in Nigeria.
unrefuted drawIndex=58 gold=unrefuted verdict=unrefuted cell=tp tool_uses=0 claim_date=18-9-2020 sha256=9cb076fb670d86c1a5813e048a7a9402676a4fdf0994ab16a70d0114dbe3696b claim=The passing of Ruth Bader Ginsburg will have a profound effect on the future of the Supreme Court of America.
unrefuted drawIndex=64 gold=unrefuted verdict=unrefuted cell=tp tool_uses=3 claim_date=14-9-2020 sha256=fc932480c7bbe5a33ecaf2ba725e98721a483bc5e3054cabf60cb66c04f30884 claim=Tourism, lockdown key to deep New Zealand recession.
unrefuted drawIndex=28 gold=unrefuted verdict=unrefuted cell=tp tool_uses=2 claim_date=2-10-2020 sha256=e24834346f20dad0ee8309fcbf4e6b0be868c4708be814d2ba188fbd3d84e396 claim=The wife of  Lal Bahadur Shastri (ex Prime minister of India) repaid his car loan after his death.
refuted drawIndex=56 gold=refuted verdict=refuted cell=tn tool_uses=2 claim_date=8-10-2020 sha256=8d24801dfd7b68529a29e102633eb8f0609b8c8528d5d8d92a26c164d72681ae claim=it is unknown whether a person under 20 can pass the disease to an older adult.
refuted drawIndex=119 gold=refuted verdict=refuted cell=tn tool_uses=0 claim_date=16-9-2020 sha256=f7441c3022b1d7078fade4f9634597abf103ea9f46ccb5a2e6397cd871749623 claim=Minneapolis City Council has defunded the police.
refuted drawIndex=139 gold=refuted verdict=refuted cell=tn tool_uses=0 claim_date=9-9-2020 sha256=97533d1d2be0b410dffc0abfa45e363fee0812f313096ef36f83c6acde6928bb claim=Nita Ambani is to give Rs 200 crore for Kangana Ranaut’s new studio
refuted drawIndex=87 gold=refuted verdict=refuted cell=tn tool_uses=2 claim_date=28-9-2020 sha256=f8ed1acf6544371995ba5b95e4e458f6b71515b678add1abdc061b4c2d5219a8 claim=Olive Garden prohibits its employees from wearing face masks depicting the American flag.
refuted drawIndex=27 gold=refuted verdict=refuted cell=tn tool_uses=3 claim_date=19-10-2020 sha256=4ca7f59967cdf08f285bfbe5a878de80253acb172d0f18bf0d1c71f58e7074bf claim=Dr Anthony Fauci wrote a paper regarding the Spanish Flu and stated that the majority of deaths in 1918-1919 was because of bacterial pneumonia from wearing masks.
refuted drawIndex=14 gold=refuted verdict=refuted cell=tn tool_uses=2 claim_date=26-10-2020 sha256=410b45f711b87a0b61fbf93c37ea59a05b3a37f2f9dbaa51988ad7823a5b9939 claim=Paul Pogba, who plays for Manchester United and the French national team, retired from international football in response to French President Macron’s comments on Islamist terrorism.
refuted drawIndex=83 gold=refuted verdict=refuted cell=tn tool_uses=2 claim_date=28-9-2020 sha256=08cf122bd1c4c8ec69ca5eb92a07c64c28d464d815733952af7e579f02d8278a claim=AARP endorsed President Biden and gave financial support to planned parenthood.
refuted drawIndex=168 gold=refuted verdict=refuted cell=tn tool_uses=2 claim_date=29-8-2020 sha256=efa3978024c7e499cc8ee71b391fcc56c145fe17b352fd2c5d280487dfcfb36e claim=Suresh Raina, the Chennai Super Kings (CSK) cricketer, has withdrawn from the upcoming 2020 edition of the IPL after testing positive for COVID-19.
refuted drawIndex=11 gold=refuted verdict=refuted cell=tn tool_uses=0 claim_date=26-10-2020 sha256=a52d4aabd71eb81ee796e577fa4f4fefaef24df88ec7694aa9380ac5e69a7436 claim=Sleeping under a mosquito bed net treated (or not treated) with insecticide is ineffective and harmful to human health.
refuted drawIndex=161 gold=refuted verdict=refuted cell=tn tool_uses=3 claim_date=1-9-2020 sha256=70975cdf03ab237f24b9e5b5225cbd956ec678022aec35bcf491b9dd90b7f54e claim=Bill Gates was involved in crafting the TRACE Act.
refuted drawIndex=10 gold=refuted verdict=refuted cell=tn tool_uses=2 claim_date=27-10-2020 sha256=1ad5dc5a78fc499b99163084de9e14b04a1acc71f746292549ce06dd7f103a7b claim=Germany’s Foreign Minister Heiko Maas said that Thailand’s King Maha Vajiralongkorn didn’t do anything illegal while at his German residence.
refuted drawIndex=62 gold=refuted verdict=refuted cell=tn tool_uses=1 claim_date=5-10-2020 sha256=34b627100066ccf6ed0ce01bf30d6dead7d37b93cded0cc04dbeffee6e2e1a1d claim=In 1977 Senate Minority Leader Chuck Schumer had an affair with his daughter best friend from high school.
refuted drawIndex=16 gold=refuted verdict=refuted cell=tn tool_uses=2 claim_date=25-10-2020 sha256=0b81d3a767587a3d40d6e66403576677894e4e6ff2cc42207e9ce34b1b3e06a9 claim=Breitbart News reports that the daughter of Delaware Democratic Senator Chris Coons and seven other underage girls were featured on Hunter Biden's laptop.
refuted drawIndex=153 gold=refuted verdict=refuted cell=tn tool_uses=2 claim_date=3-9-2020 sha256=0644f3ff5153f79a96d89b84c2953ebe5fae6466840967893d2c2d8661dacee8 claim=The CDC recommended wearing only certain beard styles to help prevent the spread of coronoavirus.
refuted drawIndex=94 gold=refuted verdict=refuted cell=tn tool_uses=2 claim_date=23-9-2020 sha256=56c4765dfae029ca72ecd0989a2b153f27ca6e9c9a8092829e142b1eb2497128 claim=Shah Rukh Khan's Kolkata Knight Riders (KKR) is acquiring a 1.28 per cent stake in Reliance Retail at Rs 5,500 crore
refuted drawIndex=107 gold=refuted verdict=refuted cell=tn tool_uses=0 claim_date=19-9-2020 sha256=953c029c9babf071c3f4e0dda99bcc3cf8b3c445a2f4be7bf55ab11c1fa570c5 claim=Zimbabwe recorded its first coronavirus Infection before 20 February 2020.
refuted drawIndex=91 gold=refuted verdict=refuted cell=tn tool_uses=0 claim_date=24-9-2020 sha256=310c4c2a031743fa7e8a61391670f80d06aec4517c766230787e2c284ae1af6e claim=The State of Massachusetts committed voter fraud by deleting over one million ballot images during the 2020 Presidential Election.
refuted drawIndex=76 gold=refuted verdict=refuted cell=tn tool_uses=0 claim_date=1-10-2020 sha256=f77be639db280aae5fa7f26279fbc98b655a0d5d7b9cdc76914ef70a2b048ff9 claim=Flu shots lead to severe or life-threatening conditions making them unsafe.
refuted drawIndex=54 gold=refuted verdict=refuted cell=tn tool_uses=3 claim_date=9-10-2020 sha256=116fb66785c40ca5ea10609bc74444b0c15f53a2aaff74ae6e94b03ab9ee66b9 claim=Swiss Squash player Ambre Allinckx’s refuses to play in India due to safety reasons
refuted drawIndex=20 gold=refuted verdict=refuted cell=tn tool_uses=3 claim_date=23-10-2020 sha256=a329167fdf0fb41d08634c498efe87d99045c6a6a30ee3380abd778f0f992987 claim=Cutting the umbilical cord straight away deliberately denies the baby natural immunity so that medical professionals have a reason to vaccinate and medicate them.
```

## Reproducing this

From a fresh clone plus the AVeriTeC dev cache, at zero spend:

```
node eval/lz-eval-p23-sliceA-draw.mjs eval/.cache/chenxwh__AVeriTeC/data/dev.json
node --test eval/lz-eval-p23-sliceA-read.test.mjs eval/lz-eval-sliceA-gold.test.mjs eval/lz-eval-p23-sliceA-draw.test.mjs
```

The draw re-derives from `DRAW.SEED` = `20260907`. Each row's `sha256` recomputes as the SHA-256 of the
string `buildDispatchString({ claim, claimDate })` renders for that row, under the template pinned by
AMENDMENT RECORD 1 (`a1cb493a980307271666597ac306d9cd383efdc9493acefefcf1aa159e7f1318`). The verdicts
themselves are not reproducible without re-spending the pool -- they are model outputs, and this file is
their durable record.

## What this reading does NOT establish

- It is **not** a certification, and no bar was set for it to clear.
- It says nothing about lz-deep-research's accuracy on general research questions. The pool is
  fact-check-style claims with a uniform 2020 cutoff, which is the first and second PROVISIONAL limits.
- It does **not** establish that the voter's error profile is asymmetric in general. Two errors versus
  zero at n = 20 per arm is an observation about this draw.
- It is **not** purely open-book: 10 of 40 items were decided without retrieval.
- It carries no pooled **accuracy** rate, no accuracy figure, no confidence interval and no pass/fail
  verdict, and none may be derived from it and presented as this reading's result. (The pooled
  RETRIEVAL count of 30 of 40 above is a descriptive count of tool use, not an accuracy rate.)

## Review record

**Content review of this record is OWED and OPEN.** Under the project's review-before-use-or-publication
rule, a committed durable record of a measurement is reviewed before it is relied on. This record has had
executing-session review only, which for a published artifact is not review.

It is tracked as an open defect in `.planning/WINDOWS.md` alongside the Wave-1/2/3 modules and the
Wave-3 dry-run record, and it closes with the phase-wide ENV-08 gate in Plan 23-09. ENV-08 blocks
`/gsd-ship`; it does not block this reading from being recorded, and recording it unreviewed with the
gap named is better than holding it in a gitignored cache where a single clean would destroy it.

## Cross-reference

- `eval/lz-eval-p23-prereg.md` -- the frozen authority: Section (v) (the draw, the seed, the realized
  40-item list, the three PROVISIONAL limits), Section (xiii) (the frozen voter prompt and its blinding),
  and AMENDMENT RECORD 1 (the transport correction and the cutoff label).
- `eval/lz-eval-p23-capture-driver.md` -- Stage 7, the voter transport and its prohibitions.
- `eval/lz-eval-p23-sliceA-read.mjs` -- `buildDispatchString`, `writeDispatchRecord`,
  `readSliceAVerdicts`, `sliceARead`.
- `eval/lz-eval-sliceA-gold.mjs` -- `filterSliceA`, `tallyPerDirection`, the frozen PROVISIONAL limits.
- `eval/lz-eval-parity-calibration-opus5-record.md` -- the Phase-22 record whose weakest link the
  provenance attestation above closes.
- `.planning/phases/23-judge-free-confidence-and-operating-envelope-for-lz-deep-res/23-05-SUMMARY.md` --
  the plan record for this run.
