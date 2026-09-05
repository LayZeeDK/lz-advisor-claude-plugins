---
phase: 22
slug: deep-research-skill-eval-and-parity-baseline-with-built-in-d
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-09-05
---

# Phase 22 -- Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
>
> Verdict reached by `gsd-security-auditor` (opus, fresh context, 47 tool uses) on 2026-09-05.
> The orchestrator did NOT take the workflow's Step-3 short-circuit
> (`threats_open: 0 AND register_authored_at_plan_time: true AND asvs_level == 1` would have let it
> write this file without an audit); the auditor was spawned and owns every classification below.

**Phase state, and what it means for this record.** Phase 22 HALTED at the Stage-2 judge-calibration
gate (`mcc=0.4531 lowerCI=0.2366 cleared=false n=60`, against a frozen bar of `MCC >= 0.5` AND
`lowerCI > 0`). Stages 3-5 never ran. Several registered mitigations therefore guard code paths that
never executed. Those are marked **UNEXERCISED** and must not be read as field-proven: an unexercised
mitigation is a weaker claim than an exercised one. Conversely, the controls that DID fire under the
2026-09-05 run are marked **EXERCISED**, and two of them (T-22-02, T-22-10) were tested at full
strength precisely because the result was a failure.

**Threat surface.** This is dev-only research instrumentation under `eval/`, which never ships. The
realistic harms are a wrong or unfalsifiable measurement, unauthorized metered spend, and an
invalidated closed-book claim -- not user data, credentials, or availability. `high` severity is
reserved for research-integrity controls and for the one boundary that touches the distributed plugin.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| session-landed judge / calibration JSON -> node scorer | Model-produced verdicts read off disk by the deterministic scorer | Untrusted structured input (verdict tokens, scores) |
| eval tree -> shipped plugin tree | The eval modules must never be importable by the shipped runtime | Module imports (one-directional: eval -> runtime only) |
| captured stream-json / report -> MANIFEST validator | Headless-captured artifacts; a truncated or empty capture must not silently validate | Untrusted capture artifacts |
| dataset body on disk -> gold loader | Cached WiCE / AVeriTeC bodies; a tampered or HTML-error body must not silently parse | Untrusted dataset content |
| WiCE gold on disk <-> judge sub-agent | The answer key sits at `eval/__fixtures__/wice-vendored/records/<uid>.json` while a tool-capable judge runs | Held-back gold labels (answer-leak surface) |
| fetched report content -> the Opus judge | The judge reads live-web-fetched report text | Potentially hostile third-party page content |
| pre-registration prose <-> frozen module constants | Drift between the prose bar and the code bar would let the verdict be silently re-tuned | Frozen numeric thresholds |
| the parity verdict -> the milestone conclusion | The verdict must be mechanical and pre-registered, not rationalized post-hoc | Research claim |
| Claude session pool -> the eval | Every model run draws the bounded, human-acknowledged pool | Metered spend |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-22-01 | Tampering | malformed/partial judge JSON silently scored | medium | mitigate | `lz-eval-parity-judge.mjs:177-277` throws on !=2 orderings, k outside `PARITY_K_RANGE`, mismatched k, unknown ordering label, inconsistent `preferred`; on-disk path via fail-closed `readJson` (`lz-eval-readjson.mjs:27-40`). CR-01's raw NUL separator fixed -- `CELL_KEY_SEP` at `:58`, asserted by `lz-eval-parity-judge.test.mjs:355`. **PARTLY EXERCISED** (the fail-closed read ran over 60 verdict files; `scoreJudgeCells` itself UNEXERCISED) | closed |
| T-22-02 | Repudiation | post-hoc tuning of the parity bar (result-shopping) | high | mitigate | `lz-eval-parity-verdict.mjs:52-58` `Object.freeze`; `lz-eval-parity-prereg.test.mjs:56-151` asserts isFrozen + byte-for-byte prose/constant equality + a discriminating wrong-needle test + an invert-the-fix proof; freeze landed in its own timestamped commit `ae7294d` before any grading, and all three amendments precede the run. **EXERCISED UNDER A FAILING RESULT** -- the strongest available test of a repudiation control. Residual: see F2 | closed |
| T-22-03a | Tampering (supply chain) | an eval dep leaking into the shipped plugin | high | mitigate | `lz-eval-packaging-boundary.test.mjs:36-140` -- recursive `walk()` over the whole plugin tree, no enumerated allowlist, with non-vacuous `inspected >= 1` / `mjsInspected >= 1` self-checks. Re-run green (2/2) during this audit. Pinned `jstat@1.9.6` lives in `eval/package.json`, outside the plugin tree; no `package.json` or `node_modules` under `plugins/lz-advisor`. **EXERCISED** | closed |
| T-22-03b | Tampering | a truncated/empty headless capture silently graded | medium | mitigate | `lz-eval-baseline-manifest.mjs:158-201` -- `validateManifest` throws on missing model / ccVersion / reportPath / non-existent report / missing cost. **UNEXERCISED**; see F3 and F4 | closed |
| T-22-05a | Information disclosure | answer-leaking gold reaching the calibration judge | high | mitigate | `lz-eval-parity-calibration-dispatch.mjs:28-29` (`UID_PATTERN`, `GOLD_MARKERS`) and `:59-69` -- all three guards run over the POST-substitution body and `throw DispatchError`, i.e. fail closed. Payload allowlist at `lz-eval-parity-calibration-harness.mjs:160-171`. Guards proven discriminating by `lz-eval-parity-calibration-dispatch.test.mjs:66-118`, including a test that regenerates all 60 real dispatch files. **EXERCISED**: `opus5-record.md:44` (0 uid hits, 0 gold-marker hits, 0 unsubstituted placeholders across 60) and `:75` (all 60 sub-agents `tool_uses: 0`). Caveats F1 and F5 | closed |
| T-22-05b | Information disclosure | answer-leaking gold field reaching the Slice-A verify-voter | high | mitigate | `lz-eval-sliceA-gold.mjs:199-207` emits an allowlist `{ claim, claim_date }` only -- every leaky gold field dropped by construction, not by blocklist. **UNEXERCISED** (Stage 4 never ran) | closed |
| T-22-07 | Info disclosure / cost | an OOF model call sneaking into a calibration/gold module | medium | mitigate | Absence verified across all seven Phase-22 modules: zero `callOof`, `copilot`, `child_process`, `execSync`, `spawn`, `fetch(`, or `http(s)://` occurrences. `lz-eval-parity-driver.md:36-65`; enforced by `lz-eval-parity-prereg.test.mjs:218-228`. **EXERCISED** (`22-05-SUMMARY.md:113`) | closed |
| T-22-08 | Spoofing/Repudiation | overclaiming the built-in's closed design as fact | medium | mitigate | `lz-eval-parity-architecture.md:122-124` carries an explicit "What the docs do NOT support" list; 21 `docs-grounded` flags across the file. **EXERCISED** | closed |
| T-22-09 | Tampering | an inaccurate lz-design claim in a published reference | medium | mitigate | `lz-eval-parity-architecture.md:24-28`, `:127-142` cite the shipped schema reference + `SKILL.md`, both confirmed present. Blocking content review executed with line-level cross-checks (`22-03-SUMMARY.md:63`). **EXERCISED** | closed |
| T-22-10 | Repudiation | optional stopping / a branch added after seeing results | high | mitigate | `lz-eval-parity-prereg.md:376-392` (one-attempt stopping rule + write-once, consumed at the first landed verdict), `:399-406` (Conditional C retired PROSPECTIVELY), `:426-443` (subgroup read banned as a pass, backed independently by `judgeCalibrationGate`'s subtle-item `ContractError`). **EXERCISED AT FULL STRENGTH** -- the gate failed, the phase halted, no third instrument, no prompt revision, no subgroup MCC computed; independently re-derived in `22-VERIFICATION.md` ("VERIFIED HONORED") | closed |
| T-22-12 | Info disclosure / cost | an OOF call during grading | medium | mitigate | Same evidence as T-22-07. **EXERCISED** -- zero out-of-family spend during the 2026-09-05 run | closed |
| T-22-13 | Tampering | a background-wait-truncated built-in capture graded as complete | medium | mitigate | `lz-eval-parity-driver.md:95` (`CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0`) + `validateManifest`. Closed at ASVS L1 (pattern present in the cited files); at L2 this would be PARTIAL. **UNEXERCISED**; see F3/F4 | closed |
| T-22-14 | Tampering | marketplace lz-advisor shadowing the working tree during capture | medium | mitigate | `lz-eval-parity-driver.md:114-118` + `.claude/settings.json` project-scope disable. **EXERCISED AND INDEPENDENTLY VERIFIED** by the auditor: the lz capture's `system/init` `plugins` array holds exactly one lz-advisor entry, pointing at the working tree, `source: lz-advisor@inline`. No marketplace build was loaded | closed |
| T-22-SC | Tampering | npm/pip/cargo installs | high | mitigate | `git log -- eval/package.json eval/package-lock.json package.json` -- last touched `f918e66` (2026-06-16, Phase 18). ZERO package changes in Phase 22. **EXERCISED** | closed |
| T-22-04 | Tampering | a tampered dataset body silently calibrating | medium | mitigate | **CONTROL ABSENT AS SPECIFIED.** The register claims `verifySha256` is "reused via `loadManifest`"; that reuse does not exist. Neither `verifySha256` (`lz-eval-dataset.mjs:98`) nor `loadManifest` (`:181`) is imported by any Plan 22-02 module. The Slice-A CLI (`lz-eval-sliceA-gold.mjs:272-299`) accepts an arbitrary `<averitec-dev.json>` path and reads it through `readJson` with NO integrity check at read time. Only the second clause (fail-closed `readJson`) is implemented; integrity rests on an unenforced convention that the operator fetched through `fetchDataset`. UNEXERCISED (no AVeriTeC data cached) | open -- below high threshold (non-blocking) |
| T-22-06 | Repudiation | averaging across CC versions / hidden run averaging | medium | mitigate | **CONTROL INERT.** The CC-version pin cannot land: `extractSystemInit` reads `event.version` (`lz-eval-baseline-manifest.mjs:91-98`) but the real `system/init` event carries `claude_code_version`. Reproduced against BOTH real captures -- exit 2, "system/init event has no CC version -- the run cannot be pinned (D-15/D-16)" -- while the streams plainly carry `claude_code_version: 2.1.186`. The model pin extracts correctly; the version pin never can, so NO MANIFEST can be produced from any real capture, and zero MANIFESTs exist on disk (this is the mechanical cause of `22-VERIFICATION.md` gap SC1). Fails in the safe direction, but the control is inert. One-line fix. The second clause (per-direction Slice-A tally never pooled) IS present at `lz-eval-sliceA-gold.mjs:257-262`, UNEXERCISED | open -- below high threshold (non-blocking) |
| T-22-11 | Tampering (prompt injection) | hostile fetched report content steering the Opus judge | medium | accept | Accepted residual, now logged below. Backstops present and verified: `lz-eval-parity-prereg.md:205-209`; position-swap agreement at `lz-eval-parity-driver.md:189-193` and `cellVerdict` (both orderings must agree, cancelling single-source steering). UNEXERCISED -- Stage 3 never ran | closed (accepted; see log) |
| T-22-15 | Tampering (prompt integrity) | dataset content injects substitution text into the judge prompt | medium | **ESCALATED -- unregistered** | Not in any `<threat_model>`; raised by the auditor, deliberately NOT closed silently. See the escalation section below | open -- below high threshold (non-blocking) |

*Status: open | closed | open (below the high threshold, non-blocking)*
*Severity: critical > high > medium > low -- only open threats at or above `workflow.security_block_on` count toward `threats_open`*
*Disposition: mitigate (implementation required) | accept (documented risk) | transfer (third-party)*

### Severity assignment -- disclosed, because none of the registers carried a Severity column

None of the five `<threat_model>` blocks has a Severity column. The auditor assigned severity per
threat by impact x likelihood rather than leaving any threat unranked, and recommended that basis.

A literal reading of the missing-severity fail-closed clause would instead rank all three open
threats `critical` and record **`threats_open: 3` (all blocking)**. Both numbers are recorded here so
the disposition is auditable and reversible. The assigned-severity basis is adopted: that clause
exists to stop unranked threats being silently dropped, and none is dropped -- all three are ranked,
recorded, and carried forward. Note also that the phase is already TERMINAL, so no advancement is
being unblocked by this choice; all three, plus T-22-15, belong in the successor phase's
pre-registration and none can be exercised until Stage 3 is rebuilt.

---

## ESCALATED -- proposed T-22-15 (unregistered; do not close silently)

**Dataset content injects substitution text into the judge prompt via `String.prototype.replace`.**
Severity medium. Category: Tampering (prompt integrity).

`lz-eval-parity-calibration-dispatch.mjs:54-57` substitutes the three placeholders with string
replacements, so `$&`, `` $` ``, `$'` and `$$` in a claim, context, or evidence document are
interpreted rather than inserted literally -- dataset content reaching a model prompt through an
unsafe path, on the module whose whole job is anti-leak dispatch integrity.

Verified empirically rather than taken on trust: over `loadCalibrationItems()`, **27 of 60 records
contain `$`, and 0 contain a hazardous `$&` / `` $` `` / `$'` / `$$` sequence**. The 2026-09-05 run
was therefore NOT corrupted. The threat is latent, not realized.

Blast radius, traced: a `$'` in the claim injects the still-unsubstituted later placeholders, which
the `:59-61` survival guard would catch. A `` $` `` in the evidence -- the last substitution --
injects preceding prompt text only, carrying no uid and no gold marker, so neither the uid guard nor
the gold-marker guard fires and the corruption is **silent**. The failure mode is a silently mangled
instrument, NOT an answer leak.

Fix is one line per call site (a replacer function: `.replace(needle, () => value)`). It must be
fixed before any dispatch is materialized again, and it belongs in the successor phase's threat model.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-22-01 | T-22-11 | Hostile fetched report content steering the Opus judge (Tampering / prompt injection). The judge reads end-state report text, not arbitrary tool execution; n=2-3 reports captured headless on the Claude pool; the claim-extraction bridge scores claims against the report's own cited evidence; blinding + position-swap require BOTH orderings to agree, cancelling single-source steering. Low-value target, descriptive at n=2-3. Residual accepted. Never exercised -- Stage 3 did not run in Phase 22. | Maintainer (via `22-05-PLAN.md` `<threat_model>`, disposition `accept`) | 2026-09-05 |

*Accepted risks do not resurface in future audit runs.*

---

## Unregistered flags (WARNING -- not threats, but they weaken specific claims)

**None of the five SUMMARY files contains a `## Threat Flags` section** -- a process gap. The flags
below are the auditor's, derived from reading and exercising the code.

- **F1 -- T-22-05 mitigation (a) has no code artifact.** The "emphatic no-tools instruction" exists as
  pre-registered prose (`lz-eval-parity-prereg.md:480-482`) and as a claim in the records, but nothing
  materializes it: `renderDispatch` builds the body from the frozen prompt plus payload only.
  Mitigation (b), uid omission, IS mechanically enforced. (a) rests on session behavior with a
  measured outcome (`tool_uses: 0` x60) and no test that would catch its omission on a future run. The
  pre-registration concedes this itself: "a mitigation, not a guarantee."
- **F2 -- the BCa knobs sit outside the freeze perimeter** (code review CR-03). `alpha` /
  `resamples = 2000` / `seed = 'bca'` are pre-registered in prose (`lz-eval-parity-prereg.md:361-365`)
  but are DEFAULT PARAMETERS of `bcaBootstrapLowerCI` (`lz-eval-mcc.mjs:254`) -- no frozen constant,
  absent from `antiDriftChecks()`, no co-test. The prereg itself records measured lowerCI jitter of
  0.2580-0.2843 across plausible alternatives, i.e. decisive in the near-bar band. This is the single
  unguarded result-shopping surface in an otherwise well-enforced freeze. Deferred by the maintainer
  to the successor phase.
- **F3 -- `validateManifest` is `existsSync`-only.** `lz-eval-parity-driver.md:127` states a cell is
  done "iff its MANIFEST passes `validateManifest` (non-empty report + system/init model + cost)", but
  `lz-eval-baseline-manifest.mjs:185-190` checks existence only. A zero-byte `report.md` -- the classic
  truncation artifact T-22-13 exists to catch -- would pass.
- **F4 -- the capture control was never applied to the one real capture.** Both cache directories hold
  a `qB1-run1.report.md` plus `.err`/resume streams, and NO MANIFEST anywhere. Nothing was graded, so
  no harm materialized. A successor phase inheriting this cache must run `validateManifest` (after
  fixing T-22-06) before treating either report as gradeable.
- **F5 -- transcription fidelity of the 60 dispatches is unverified.** `opus5-record.md:78-88`: the
  payload was hand-transcribed into each agent prompt, the recovery check came back INCONCLUSIVE (62
  of 63 transcripts are 0 bytes), and no harness persisted the outbound string. Consequence for
  T-22-05a: the mechanical anti-leak scan covers the materialized `item-NN.txt` files, NOT what each
  judge actually received. The record names this its weakest link.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-09-05 | 18 | 15 | 3 (all below the `high` block threshold) | gsd-security-auditor (opus) |

Totals count the 14 registered IDs split into their per-component parts (T-22-03a/b, T-22-05a/b),
plus T-22-SC and the escalated T-22-15.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log (AR-22-01)
- [x] `threats_open: 0` confirmed -- no OPEN threat reaches the `high` block threshold
- [x] `status: verified` set in frontmatter
- [ ] T-22-04, T-22-06, T-22-15 and flags F1-F5 carried into the successor phase's pre-registration

**Approval:** verified 2026-09-05 -- by `gsd-security-auditor`, not self-certified by the orchestrator.

**Carry-forward:** the three open threats and the escalated T-22-15 are NOT closable in Phase 22 --
the phase is TERMINAL and none of them can be exercised until Stage 3 is rebuilt. They belong in the
successor phase's own pre-registration, together with the code-review findings logged in
`.continue-here.md`.
