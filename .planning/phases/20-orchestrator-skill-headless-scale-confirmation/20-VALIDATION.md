---
phase: 20
slug: orchestrator-skill-headless-scale-confirmation
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-19
validated: 2026-06-21
---

# Phase 20 — Validation Strategy

> Per-phase validation contract. Phase 20 ships an LLM-PROMPT orchestrator SKILL.md plus an additive
> off-model aggregator extension. The two are validated by complementary signals: (1) DETERMINISTIC
> `node:test` suites over the aggregator + the trace parser + the prose-contract SSOT guards, and (2) a
> real headless `claude -p` empirical spike (`20-04-SC5-SPIKE.md`, $29.07) whose stream-json trace is
> parsed mechanically + un-fakeably. The five PIPE-* requirements are orchestrator PROMPT behaviors of a
> Markdown skill -- correctly validated by the empirical spike + the worker-contract SSOT test, NOT by
> hollow unit tests.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test + node:assert/strict (stdlib, zero-dep), FILE-form only (host quirk -- never the dir form) + headless `claude -p --output-format stream-json` empirical gate |
| **Config file** | none for the plugin tree (zero-dep, never ships); `eval/` has its own package.json (only dep jstat@1.9.6, gitignored node_modules) |
| **Quick run command** | `node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs` |
| **Full suite command** | FILE-form enumeration of every `*.test.mjs` (plugin tree + `eval/` tree); the CI `ci.yml` glob-discovery job is authoritative |
| **Headless skill verification** | `claude --model sonnet --permission-mode auto --plugin-dir plugins/lz-advisor -p "/lz-advisor:lz-deep-research <q>" --verbose --output-format stream-json` |
| **Estimated runtime** | plugin tree seconds; eval tree tens of seconds; SC-5 spike ~57 min one-shot (build-time, done) |

---

## Sampling Rate

- **After every task commit:** Run the touched FILE-form suite (aggregator suite for D-12; the eval suite for the touched seam)
- **After every plan wave:** FILE-form enumeration of affected `*.test.mjs` (plugin + eval tree)
- **Before `/gsd:verify-work`:** Full suite green + SC-5 spike passing all 5 acceptance criteria + live-cert verdict produced
- **Max feedback latency:** seconds (deterministic node:test) + the one-shot SC-5 headless spike (minutes, already executed)

---

## Per-Task Verification Map

> One row per Phase-20 requirement. "Test Type" distinguishes DETERMINISTIC node:test (unit) from the
> mechanically-parsed headless empirical spike (behavioral) and the static prose-contract SSOT guard.

| Req ID | Wave | Requirement | Test Type | Automated Command / Method | Test File | Status |
|--------|------|-------------|-----------|----------------------------|-----------|--------|
| PIPE-01 | spike | Decompose into ~5 sub-angles before searching | behavioral (empirical spike) + prose-contract | SC-5 stream-json trace (search wave fired; ANGLES cap == 5 in SKILL.md); worker-contract SSOT | `eval/lz-eval-sc5-trace.test.mjs` + `eval/lz-eval-worker-contract.test.mjs` | [OK] COVERED-by-empirical-spike |
| PIPE-02 | spike | Scope-clarify first (interactive AskUserQuestion OR Assuming-frame headless) | behavioral (empirical spike) | SC-5 `-p` run did NOT stall on AskUserQuestion; full path ran end-to-end exit 0; `scope.md` retained | `eval/lz-eval-sc5-trace.test.mjs` (`20-04-SC5-SPIKE.md`) | [OK] COVERED-by-empirical-spike / Manual |
| PIPE-06 | spike | Cite every claim inline to its source | behavioral (empirical spike) | SC-5 run produced `report.md` (~21.9KB cited); citation join reads `sources/<key>.json` (D-17 fail-loud) | `20-04-SC5-SPIKE.md` (report.md on disk) | [OK] COVERED-by-empirical-spike / Manual |
| PIPE-08 | 1 | Contested first-class verdict (not averaged away) | unit (deterministic core) + behavioral | Aggregator tally: Contested branch precedes Medium (`aggregate.mjs:657`); D-12a Contested escalate test; SC-5 report Contested section | `plugins/.../lz-deep-research-aggregate.test.mjs` (49/49) | [OK] COVERED |
| PIPE-09 | spike | Structured written report deliverable (5-section) | behavioral (empirical spike) | SC-5 trace: `report.md` written to run dir with the 5-section micro-format (D-11) | `20-04-SC5-SPIKE.md` (report.md on disk) | [OK] COVERED-by-empirical-spike / Manual |
| VERIF-05 | 1 | Escalate = UNION(Contested OR load_bearing OR ~15-20% audit sample) | unit (deterministic) | D-12a Contested->escalate; D-12b load_bearing OR-fold->escalate; D-12c discriminating in/out-of-sample hash pair; determinism (no Math.random); frozen `AUDIT_SAMPLE_RATE` 0.15 | `plugins/.../lz-deep-research-aggregate.test.mjs` (49/49) | [OK] COVERED |
| AGG-05 | spike | Run dir retained as audit trail | behavioral (empirical spike) | SC-5: run dir retained on disk (claims/excerpts/sources/votes/survivors.json/scope.md/report.md); aggregator re-run reproduces survivors summary, exit 0 | `eval/lz-eval-sc5-trace.test.mjs` (`survivorsReproducible`/exitOk) + `20-04-SC5-SPIKE.md` | [OK] COVERED |
| COST-01 | spike | Exactly two Opus advisor gates over bounded curated JSON | behavioral (empirical spike) | SC-5 trace: `advisorSpawns === 2` (EXACTLY, AND-folded gate); JSONL cross-check 2x `agentType: lz-advisor:advisor`; zero `research-verify-voter-opus` spawns | `eval/lz-eval-sc5-trace.test.mjs` (advisorSpawns gate) | [OK] COVERED |
| COST-03 | spike | Fan-out wave-batched <=5 in-flight | behavioral (empirical spike) | SC-5 trace: `maxInFlight === 5` (EXACTLY at the cap), `waves === 24`, `waveBoundaryHeld === true` across >=3 waves | `eval/lz-eval-sc5-trace.test.mjs` (maxInFlight/waveBoundary gates) | [OK] COVERED |
| COST-04 | 1 | Anthropic first-party API floor (no Bedrock/Vertex/Foundry) | static (prose-contract SSOT) | NEW dual-sided SSOT guard: positive Anthropic-floor language present AND no provider token/branching prose; mirrors worker-contract SSOT | `eval/lz-eval-cost04-anthropic-floor.test.mjs` (3/3, NEW) | [OK] COVERED (newly automated) |
| INTEG-01 | spike | Discoverable as `lz-advisor:lz-deep-research` | behavioral (empirical spike) | SC-5 init-probe stream-json INIT `slash_commands` list includes `lz-advisor:lz-deep-research` (parsed, not self-report) | `20-04-SC5-SPIKE.md` (init-probe.stream.json) | [OK] COVERED-by-empirical-spike (bare-form -> Manual) |
| INTEG-02 | 1 | `.lz-research/` gitignored | static | `git check-ignore .lz-research/<run-id>/scope.md` returns the path (exit 0); `.gitignore:20 /.lz-research/` | `git check-ignore` (CI/manual one-liner) | [OK] COVERED |

*Status legend: [OK] COVERED (deterministic test green) - COVERED-by-empirical-spike (un-fakeable trace parse) - Manual (interactive-only nuance) - [X] red - [WARN] flaky*

**Deterministic-suite evidence (re-run this audit 2026-06-21, all green):**

```
node --test plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.test.mjs  -> 49/49 pass
node --test eval/lz-eval-sc5-trace.test.mjs                                                          -> 13/13 pass
node --test eval/lz-eval-worker-contract.test.mjs                                                    -> 15/15 pass
node --test eval/lz-eval-resume-fixture.test.mjs                                                     ->  8/8  pass
node --test eval/lz-eval-cost04-anthropic-floor.test.mjs   (NEW this audit)                          ->  3/3  pass
```

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. The Wave-0 fixtures planned in RESEARCH.md
`## Validation Architecture` were authored during execution and are GREEN:

- [OK] `lz-deep-research-aggregate.test.mjs` -- D-12 `escalate`/`load_bearing` fixtures (load_bearing->escalate; Contested->escalate; in/out-of-sample discriminating hash pair; determinism; frozen `AUDIT_SAMPLE_RATE` 0.15). Covers VERIF-05 + PIPE-08 deterministic core. **49/49.**
- [OK] `eval/lz-eval-sc5-trace.test.mjs` -- the SC-5 stream-json trace parser (maxInFlight<=5 [COST-03], advisorSpawns==2 [COST-01], wave boundary, exitOk, zero Write failures, run-dir reproducible [AGG-05]). **13/13.**
- [OK] `eval/lz-eval-worker-contract.test.mjs` -- the cluster-id vote-keying + canonical-URL SSOT (Risk 1 merged-cluster contract; PIPE-* SSOT). **15/15.**
- [OK] `eval/lz-eval-live-cert.test.mjs`, `lz-eval-harvest.test.mjs` -- the live-cert deterministic seams (STUB, no spend; LZ_SPEND hard-guard). Live-cert verdict = NOT WORKS -> RAISE (settle-OR-raise D-01; Phase 21).
- [OK] `eval/lz-eval-cost04-anthropic-floor.test.mjs` -- **NEW this validation pass.** Closes the one genuine deterministic gap: COST-04 was verified only by a manual `git grep`. Now a committed, fail-able dual-sided prose-contract SSOT guard. **3/3.**

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bare-form `/deep-research` collision disambiguation | INTEG-01 (nuance) | The QUALIFIED `lz-advisor:lz-deep-research` is empirically confirmed via the init-probe `slash_commands` list. The BARE-form collision with the Claude Code built-in is resolved only in the INTERACTIVE picker and CANNOT be confirmed headless (the qualified probe cannot catch bare-form collisions -- MEMORY `headless_probe`). | Open an interactive session with `--plugin-dir plugins/lz-advisor`, type `/deep` and confirm the picker disambiguates `lz-advisor:lz-deep-research` from the built-in. Out of scope for the qualified-discoverability requirement as written. |
| SC-5 packaged-skill headless concurrency (the full empirical spike) | PIPE-01/02/06/09, COST-01/03, AGG-05, INTEG-01 | Requires a real `claude -p` packaged run that spends session pool ($29.07); trace-parsed un-fakeably. Already EXECUTED + GRADED (`20-04-SC5-SPIKE.md`, run dir `20260619-232106`). | Run the packaged skill headless; capture `--output-format stream-json` to a file; grade with `node eval/lz-eval-sc5-trace.mjs <trace>` -> assert `pass: true` (maxInFlight<=5, advisorSpawns==2, waveBoundaryHeld, exitOk, workerWriteFailures==0, waves>=3). |
| Live over-refusal + full-WORKS certification (blocking spend) | SC-6 / VERIF-05 (live arm) | Spends real Claude pool + Copilot AI Credits; human-authorized staged blocking checkpoint (D-07). | Pre-register the lock rule, freeze N/ceilings/estimator, run the staged `LZ_SPEND=1` spend, RAISE the verdict. EXECUTED: NOT WORKS -> RAISE under settle-OR-raise (D-01); both arms transparently VOIDed (sensitivity VOID-on-construct, specificity VOID-on-power); Sonnet-default ships; Haiku flip deferred; RAISE captured as Phase 21. |

---

## Validation Sign-Off

- [x] All requirements have automated verify (deterministic or un-fakeable empirical spike) or a justified Manual classification
- [x] Sampling continuity: no 3 consecutive requirements without automated verify (every requirement maps to a green deterministic suite or the parsed SC-5 trace)
- [x] Wave 0 covers all MISSING references (the one genuine deterministic gap -- COST-04 -- now has `eval/lz-eval-cost04-anthropic-floor.test.mjs`)
- [x] No watch-mode flags (FILE-form `node --test` only)
- [x] Feedback latency bounded (seconds for deterministic suites)
- [x] `nyquist_compliant: true` set in frontmatter (post-execution)

**Approval:** validated -- all 12 requirements covered; one new automated test closes the only genuine deterministic gap.

---

## Validation Audit -- 2026-06-21 (gsd-nyquist-auditor)

**Stance:** FORCE -- assume every requirement is uncovered until a green, fail-able test proves it.

**Classification of the 12 requirements:**

- **Deterministic, COVERED by green suites (no new test needed):** VERIF-05 + PIPE-08-core (aggregator
  49/49 -- D-12a/b/c + determinism + frozen `AUDIT_SAMPLE_RATE`); COST-01 + COST-03 + AGG-05 (SC-5 trace
  parser 13/13 -- advisorSpawns==2, maxInFlight<=5, waveBoundaryHeld, exitOk, workerWriteFailures==0,
  reproducible survivors); INTEG-02 (`git check-ignore` exit 0). Re-ran all suites this pass; green.
- **LLM-prompt behaviors, COVERED-by-empirical-spike (NOT deterministically unit-testable; NO hollow
  test fabricated):** PIPE-01, PIPE-02, PIPE-06, PIPE-09 -- orchestrator prompt behaviors of a Markdown
  skill, correctly validated by the real $29.07 SC-5 headless spike (`20-04-SC5-SPIKE.md`, mechanically
  parsed trace) + the worker-contract SSOT test. Per the explicit constraint, no grep-the-prose tests
  were authored for these.
- **INTEG-01:** COVERED-by-empirical-spike for the qualified form (init-probe `slash_commands`); the
  bare-form collision is correctly Manual (interactive picker only).

**One GENUINE deterministic gap found and FILLED:** COST-04 (Anthropic-API floor; no
Bedrock/Vertex/Foundry) was an automatable contract invariant verified ONLY by a manual `git grep` in
the verification report -- zero committed, fail-able guard, unlike every other deterministic requirement.
Authored `eval/lz-eval-cost04-anthropic-floor.test.mjs` (dev-only eval, ships nothing; mirrors the
legitimate worker-contract SSOT prose-contract pattern): a DUAL-SIDED guard asserting both the POSITIVE
Anthropic-floor language and the NEGATIVE absence of any provider token/branching prose. **3/3 green.**

**Discrimination proven empirically (not a trivially-passing test):** injected a synthetic
`fall back to AWS Bedrock deployment` line into a tempdir COPY of SKILL.md (the real file untouched) and
re-ran the assertions -> the guard CAUGHT the violation (both the negative-token and the branching-prose
assertions fired). The test fails on the mutant, passes on the real contract.

**No implementation files modified. No BLOCKER, no ESCALATE.** All 12 requirements resolve to FILLED or
COVERED; `nyquist_compliant` and `wave_0_complete` flipped to `true`.

**Files for commit:** `eval/lz-eval-cost04-anthropic-floor.test.mjs` (new); this `20-VALIDATION.md`.
