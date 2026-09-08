---
phase: 23-judge-free-confidence-and-operating-envelope-for-lz-deep-res
verdict: SECURED
verdict_as_audited: OPEN_THREATS
threats_open: 0
threats_open_as_audited: 1
threats_closed: 51
threats_unreachable: 3
threats_total: 54
blocker_closed_at: 8aaf967
blocker_closed_note: >
  The audit's verdict at HEAD 073d0f7 was OPEN_THREATS on T-23-07. That blocker was
  remediated at 8aaf967 exactly as the auditor specified, and the closure was verified
  by the orchestrator against that specification. The auditor did NOT re-audit; see
  the REMEDIATION section for what was checked and what that does and does not prove.
asvs_level: 1
block_on: high
audited_at_head: 073d0f74bb1509227fb378cb87990e7b211d2c0a
auditor: gsd-security-auditor
audited: 2026-09-08
persisted_by: orchestrator
persistence_note: >
  The auditor role has Write disabled by the single-writer contract (#2119), so it
  returned the complete verdict and the orchestrator persisted it verbatim in
  substance. The orchestrator did NOT derive, soften or add any verdict of its own.
---

# Phase 23 -- security audit

**Verdict: OPEN_THREATS.** Closed 50 of 54, open 1 of 54, unreachable 3 of 54. The single open
threat is at severity `high` against a `block_on` of `high`, so it BLOCKS.

**The one open threat is a missing CONTROL, not a bad outcome.** The realized retention in this
phase was verified clean; the exposure is prospective.

## Method -- what was recomputed rather than read

Four verifications went past pattern-matching depth:

- **T-23-03 / T-23-09 over the real evidence.** All 40 on-disk dispatch records loaded, the frozen
  draw rebuilt through `filterSliceA`, each item's FULL AVeriTeC row recovered, and that row's own
  non-dispatchable field values enumerated (recursing into arrays and objects, >= 12 chars) against
  the dispatched string. **40 checked, 40/40 sha256 digests recompute, 0 gold-value leaks.**
  Value-based and enumerated from the corpus rows, so a schema gaining a field could not hide a leak.
- **T-23-20 by allowlist inversion.** 64 commits, 60 touched files, plus a whole-tree token sweep at
  every commit. The excluded address was never written as a search needle.
- **T-23-26 / T-23-12.** `extractTerminalCost` re-run over both built-in q2 streams and
  `aggregateRunCost` over the enumerated pair.
- **T-23-05 on live output.** All 38 records across both dated runs checked for key set and for any
  body-shaped field.

Plus freeze ancestry (24/24 in range, negative control exit 1) and 181 co-tests in the auditor's own
process (179 + 2, 0 fail), explicit FILE form throughout.

## Open -- BLOCKING

### T-23-07 -- path traversal in the lz retention step (elevation of privilege, high)

**Expected control:** the run-id validated against a fixed identifier pattern before path
composition, AND the destination resolved and asserted inside the phase cache before any write.

**Found: no code implements either half.** Files searched: `eval/*.mjs` (no run-id regex, no
containment assertion), `plugins/` (none), `eval/lz-eval-p23-capture-driver.md` Stage 2b (names the
source `.lz-research/<run-id>/` and the destination `eval/.cache/p23-baseline/lz/q2/` and nothing
else), `eval/lz-eval-p23-prereg.md` (zero hits for the threat id, for identifier-pattern, for
traversal or for containment), and `git show --name-only` over all four 23-06 commits -- Markdown
records only, **no script landed**.

The control exists in exactly one place: a retrospective claim at `23-06-SUMMARY.md:116-119` with its
threat row at `:436`. The retention was an ephemeral inline command that no longer exists and cannot
be re-run or re-inspected.

**Residual risk, sized:**

- **This phase's window has closed and the outcome is clean.** Verified independently: the realized
  run-id `20260908-105102-post-training-quantization-4bit` does satisfy the claimed pattern, the
  manifest's `lzRunId` agrees, the destination resolves inside the cache root, everything landed under
  `eval/.cache/p23-baseline/`, and `find eval/.cache -name "*..*"` returns nothing.
- **The exposure is PROSPECTIVE.** Any later phase re-running this retention has no code control,
  because the frozen driver steering it omits the step. The next operator gets the same unguarded path
  composition with a model-authored identifier reaching a filesystem write.

**Why the auditor did not close it.** Both fixes are forbidden to that role: editing
`eval/lz-eval-p23-capture-driver.md` would touch a file frozen in `9ab9933` (the rule is to record an
open threat instead), and authoring a retention module would be patching implementation.

**Suggested closure, as specified by the auditor:** a committed `eval/lz-eval-p23-retain.mjs`
exporting `retainRunDirectory({ runId, destRoot })` that (1) tests `runId` against a frozen regex and
throws otherwise, (2) resolves the destination and throws unless
`resolved === root || resolved.startsWith(root + path.sep)`, and (3) carries a co-test with a
`..`-bearing run-id AND a sibling-prefix case (`p23-baseline-evil`) as its two discrimination proofs.
Then amend the driver by numbered AMENDMENT RECORD, or point the next capture plan at the module.

## Open -- non-blocking

**None.** Every medium and low finding resolved to closed or to a documented accepted risk.

## Closed -- mitigate (46)

Verified with code evidence. Highlights, with the rest carried in the auditor's returned register:

| Threat | Cat | Sev | Evidence |
|---|---|---|---|
| T-23-02 | Repudiation | high | `p23-prereg.test.mjs:44-49` imports frozen constants, `:100-115` builds needles FROM them and asserts value+1 absent, `:143-152` proves a one-digit edit fails. Freeze `9ab9933` contains exactly 3 files |
| T-23-02c | Repudiation | high | Rule commits `2cb5133` (14:26:29) and `fcc206c` (14:30:59) both strictly precede the first rate commit `3189239` (14:36:06) |
| T-23-02d/f | Repudiation | high | `merge-base --is-ancestor 9ab9933` over `9ab9933..073d0f7`: **24/24 OK**; control `3189239` exits 1 |
| T-23-03 | Info disclosure | high | `sliceA-gold.mjs:200` emits `{claim, claim_date}` by construction; `sliceA-draw.mjs:229` keeps `drawIndex` outside `voterRecord`. **Re-derivation: 0 leaks over 40 real strings** |
| T-23-04 | Tampering | high | `sliceA-read.mjs:159` substitutes through a replacer FUNCTION; discrimination co-tests `:136-165` cover all four dollar sequences singly, combined, and at the `claimDate` site |
| T-23-05 | SSRF | high | Allowlist `:61` checked at `:250` BEFORE the `:259` fetch and re-checked every loop pass; non-http(s) rejected at `:240-242` with no request; hops capped `:294`; `credentials:'omit'`, `cache:'no-store'`, `referrerPolicy:'no-referrer'`, `headers:{}` at `:260-266`; record factory `:238` the sole construction site. **38/38 live records exactly 5 keys, 0 body fields.** Offline half proven network-free at `citation-audit.test.mjs:83` |
| T-23-06 | DoS (phase) | high | `git clean` appears only in prohibitions. Zero `rmSync`/`unlinkSync`/`fs.rm`/`rm -rf`/`renameSync` in any p23 module, test or planning artifact. 7 skip-if-absent guards. 217 MB cache, 2.6 MB `.lz-research`, 40+40 records, both corpora present |
| T-23-09 | Repudiation | high | `sliceA-read.mjs:189-199` refuses overwrite; `:247-260` digest mismatch throws; `:288-297` verdict-without-dispatch throws. **40/40 digests recompute** |
| T-23-12 | Repudiation | high | `baseline-manifest.mjs:210-227` takes caller-supplied `streamTexts`; no `readdirSync` or glob in the module. All four MANIFESTs carry `costStreams` (3/2/2/1); built-in q1 carries 2 `costStreamsExcluded` with reasons. The 23-01 self-reported risk that lz q1 shipped implicit is NOT realized |
| T-23-14 | DoS | high | `RESOLVE_LIMITS:67-71`; `overCap:164-176` returns the instant `bytes > MAX_BYTES` rather than draining; deadline raced `:258-269`, `abort()` at `:279`. Boundary tests at cap, cap+1, hop 3 and hop 4 |
| T-23-20 | Info disclosure | high | **Allowlist inversion.** All 64 commits carry the approved public address as BOTH author and committer; one distinct identity in range; 0 non-approved tokens across the 60 touched files at HEAD. Two third-party tokens surfaced in pre-existing unrelated files (a vendored WiCE record; a docs trailer example) -- outside parties' addresses, which the rule explicitly does not guard. Bare-domain half: 22 hostname tokens, all public research or tooling |
| T-23-21 | Tampering | med | `branching_strategy` present at config lines 30 and 62; `git diff --exit-code` on config/STATE/ROADMAP exits 0; STATE frontmatter intact |
| T-23-26 | Tampering | high | **Re-derived:** 24.015203250000027 + 55.30793200000004 = 79.32313525000006, exactly `costUpperBoundUsd`. The ambiguous figure is published both ways |
| T-23-31 | Spoofing | high | **CLOSED ON EVIDENCE, contrary to `23-08-SUMMARY.md`.** `parity-judge.mjs:92-107` `resolvePreference` maps position to system, called at `:281` BEFORE `cellVerdict` at `:301`. The fixture exists: `parity-judge.test.mjs:137-150` sets `preferred:'A'` on BOTH orderings and asserts `'tie'`. Both green |
| T-23-33 | Repudiation | high | `eval/.cache/p22-baseline/judge/` is EMPTY; no p23 module references a calibration path; no subgroup figure taken |
| T-23-38 | Repudiation | high | 6 named-gap rows in `WINDOWS.md` 1-6, each naming its wording properties; `open_count: 7`, all `open`. No omission and no silent pass |
| T-23-39 | Repudiation | high | The git-ancestry rule **caught a real failure** (windows row 7), re-derived both directions: `1bdb1ee -> 3189239` exits 1, reverse exits 0. A control that fires on its own author is the strongest evidence it is real |
| T-23-42/43 | Repudiation | high | `q2-record.md:1` exactly one `ENV-04 status: PARTIAL-Q2`, consistent with one q2 audit output on disk; the branch letter rides the status line, and (b) is legitimate because the spike record exists at 17084 bytes -- method attempted at full cost |

## Closed -- accepted risks (4)

| Threat | Sev | Acceptance verified |
|---|---|---|
| T-23-10 | med | `git ls-files -- eval/.cache .lz-research` returns **0 files.** Both gitignored (`.gitignore:18`, `:26`); the committed record carries counts, names and sizes only |
| T-23-17 | med | **0 body-shaped keys across all 38 live records;** committed records carry counts, labels and identifiers only; corpora stay in the gitignored cache |
| T-23-24 | med | The 23-08 pacing table shows grading was last by design and spent ZERO reset windows, so exhaustion could not cost the floor |
| T-23-SC | low | `git diff bde9040^..073d0f7 -- eval/package.json eval/package-lock.json package.json` is **empty.** The single pinned `jstat@1.9.6` is untouched; no install task exists in the phase |

## Unreachable -- no dispatch occurred (3)

ENV-06 terminated on branch (b) and nothing was graded. Premise verified independently:
`p22-baseline/judge/` empty, no cells output, built-in q2 report absent.

| Threat | Sev | Why |
|---|---|---|
| T-23-30 | high | No grading string dispatched, so no blinding mapping exists to leak |
| T-23-34 | high | No verdict file written, so no artifact could carry a resolved model string. See flag 6 for the reachable ENV-03 analogue |
| T-23-09b | high | No grading dispatch, so no string to make recoverable |

## Unregistered flags (7)

None is a blocker and none is covered by any plan's `<threat_model>` row.

1. **No internal-host restriction on the network surface.** `resolvability.mjs:117-135`: the `url:`
   prefix maps any model-authored `host/path` to `https://host/path` with no loopback, private-IP or
   link-local check, and DNS is not pinned across hops. T-23-05's declared list is fully implemented,
   but internal-network reachability is not on it and is registered nowhere. The channel is narrow by
   construction (5-key record, status and final URL, never a body), so the residual is a liveness
   oracle rather than content disclosure. NOT exercised -- live hosts were arxiv.org,
   aclanthology.org, github.com, blog.eleuther.ai, trychroma.com, attention-survey.github.io. Wants a
   register row before any wider live run.
2. **The 10000 ms deadline is per hop, not per identifier.** Raced inside the `for(;;)` at `:258-269`,
   so the worst case is roughly 40 s per identifier under the 3-hop cap. Bounded, so T-23-14 holds,
   but the module header reads as a total.
3. **`overCap` abandons the body iterator without cancelling it.** `:169-172` returns on the first
   over-cap chunk, satisfying the stop-at-cap requirement, but there is no `body.cancel()`, so the
   connection may linger. Cosmetic at this scale.
4. **A stale comment sits on the T-23-04 control.** `sliceA-read.mjs:81-82` says "Non-global and
   applied once per key set" while `PLACEHOLDER_RE:83` carries `/g`. **The code is correct** and the
   global flag is required -- two placeholders must both substitute, and a `/g` replacer pass does not
   re-scan inserted text. The hazard is that the comment invites a future maintainer to remove the
   flag, silently leaving a literal placeholder in the dispatched prompt. One-line comment fix.
5. **`23-08-SUMMARY.md` understates T-23-31, incorrectly.** It says the mapping layer has no
   implementation and no fixture and that any revival must build it first. Both exist and pass. The
   error is in the safe direction but would send a future ENV-06 revival to rebuild working, tested
   machinery. The published record was not edited.
6. **ENV-03's voter seat recorded no resolved model string.** Zero `model` fields across all 40
   verdict and 40 dispatch records; the record documents only the alias. T-23-34 is 23-08-scoped and
   unreachable, and Plan 23-05 declares no equivalent, so this is not a mitigation gap -- but it is
   exactly the pattern the project's recorded lesson names, that Agent-tool models are aliases rather
   than pins and the resolved model belongs in the artifact. No register row owns it.
7. **T-23-22's declared mechanism is not the implemented one.** No `writeVerdict` exists and nothing
   makes verdict FILES write-once; verdicts came from a session-driven dispatch. The vector is still
   blocked (dispatch-record refusal `:189-199` plus fail-closed read `:288-297`), so it is counted
   CLOSED on the vector, and flagged because the wording and the code describe different controls.

## Tests executed in the auditor's own process

| Command | Result |
|---|---|
| `node --test` over 6 p23 files + `baseline-manifest` + `baseline-manifest-defects` + `parity-judge` (explicit FILE form) | **179 pass, 0 fail** |
| `node --test eval/lz-eval-packaging-boundary.test.mjs` | 2 pass, 0 fail -- the eval tree still never ships |
| `merge-base --is-ancestor` over all 24 commits in `9ab9933..073d0f7` plus control | 24/24 OK; `3189239` exits 1 |
| Gold-leak re-derivation over 40 real dispatch records | 40 checked, 40/40 digests recompute, 0 leaks |
| `extractTerminalCost` + `aggregateRunCost`, both built-in q2 streams | sum 79.32313525000006, matches `costUpperBoundUsd` exactly |
| `validateManifest` over all four MANIFESTs | 3 pass; built-in q2 throws on report existence |
| Identity allowlist inversion, 64 commits / 60 files | 1 distinct identity (the approved public address); 0 non-approved identity tokens |
| Live resolvability record shape, both dated runs | 38/38 exactly 5 keys, 0 body fields |

## A correction the audit issued upward

The orchestrator's dispatch framed T-23-31 as having no implementation and no fixture, and therefore
as unreachable. **That framing came from `23-08-SUMMARY.md` and is factually wrong.** Both the
position-to-system mapping layer and the same-position tie fixture exist and pass. T-23-31 is CLOSED
on evidence, not accepted as unreachable. The orchestrator propagated the SUMMARY's error and the
audit caught it -- which is the reason this gate is reached by a dedicated agent rather than
self-certified.

## Planning-file confirmation

The auditor modified no planning file and wrote no file at all (Write disabled for its role). It
called no `gsd-tools query` verb, so no SDK mutator ran.
`git diff --exit-code .planning/config.json .planning/STATE.md .planning/ROADMAP.md` exits 0. No
`git clean` in any form; every cache access was a read, and the 217 MB retained tree, both excerpt
corpora and the 40 write-once Slice-A records are intact. No published record, SUMMARY,
pre-registration or frozen status line was edited, and neither `eval/lz-eval-parity-prereg.md` nor
`.planning/notes/phase-22-diagnosis-two-root-causes.md` was touched. No Phase-22 calibration verdict
was read and no Phase-22 figure was used to authorize or excuse anything.

**Nothing escalated.** The register was complete enough to verify every entry by disposition; no
threat was blocked from verification.

## REMEDIATION -- T-23-07 closed 2026-09-08 at `8aaf967`

Recorded after the audit. **The audit's own verdict text above is unaltered** -- it was true at HEAD
`073d0f7` and stays as the auditor wrote it.

`eval/lz-eval-p23-retain.mjs` now implements both halves of the control the record had only claimed:

- `RUN_ID_RE = Object.freeze(/^[0-9]{8}-[0-9]{6}-[a-z0-9-]+$/)` tested BEFORE any path composition;
- `assertInside(root, candidate)` in ONE place, applied to both `destRoot` and the composed
  destination, admitting a candidate only when it IS the root or sits under `root + path.sep`.

The module is **write-free by design** -- it reads, writes, copies, moves and deletes nothing, which
is what makes "the control cannot touch the evidence" airtight rather than argued. A guarded CLI
returns the validated destination so a shell step gets the control without the module owning data.

**Both discrimination proofs were RUN, not asserted**, with failure output recorded in the executor's
report:

| Proof | Guard weakened to | Result |
|---|---|---|
| traversal | `RUN_ID_RE` -> `/^.+$/` | 8 pass / 2 fail, exit 1 -- "Missing expected exception" on the `..`-bearing run-id |
| sibling prefix | bare `candidate.startsWith(root)` | 8 pass / 2 fail, exit 1 -- a sibling root whose NAME merely prefixes the cache root is wrongly admitted |

Both guards restored; the hazard also reproduces against the real frozen root via the CLI, which
refuses `eval/.cache-evil/lz`. Co-test 10/10; `eval/lz-eval-p23-retain.test.mjs` registered in the CI
eval list keeping every existing entry; full list 260/260 exit 0. No co-test case touches the
filesystem -- every path is composed under the temp dir and never realized, so a failing case cannot
reach `eval/.cache/`.

Flag 4 was also fixed: the `PLACEHOLDER_RE` comment now describes the `/g` flag the code carries and
says why it is required. **The claim was proven rather than trusted** -- dropping the flag fails 4 of
23 T-23-04 cases; restored and diff-confirmed byte-identical. The regex, the replacer and all
behaviour are untouched.

Independently confirmed by the orchestrator after the closure: the control is present in code at the
lines above, 33/33 across the new and the T-23-04 co-tests, `eval/.cache` still 217 MB with 40/40
Slice-A records, no traversal artifact, no `eval/.cache-evil` left behind, and
`git diff --exit-code` over config, STATE and ROADMAP returning zero.

**What this does NOT prove.** The auditor did not re-run its 54-entry register against the new HEAD.
The closure is verified against the auditor's own written specification and by the two discrimination
proofs it asked for; it is not a fresh full audit. The remaining six unregistered flags stay open and
non-blocking, and the two follow-ups below stay outstanding.

### Follow-ups still outstanding

1. `eval/lz-eval-p23-capture-driver.md` Stage 2b still names the retention destination without citing
   this module. The driver is frozen in `9ab9933`, so pointing it at the control needs a numbered
   maintainer-ratified AMENDMENT RECORD -- or the next capture plan referencing the module directly.
2. The same superseded "non-global" wording survives at `eval/lz-eval-p23-prereg.md:720,748,963`
   (frozen) and at `eval/lz-eval-p23-prereg.test.mjs:160-161`, neither of which flag 4 named.

## Review record

ENV-08 content review: this artifact is an audit verdict authored by the dedicated auditor agent and
persisted by the orchestrator. Its factual claims are the auditor's, each carried with the file and
line evidence it found. The REMEDIATION section is the orchestrator's, and it states explicitly which
of its claims are verified and which would need a fresh audit.
