---
phase: 20-orchestrator-skill-headless-scale-confirmation
verified: 2026-06-21T22:30:00Z
status: passed
score: 6/6 success criteria satisfied (SC-6 satisfied-by-honest-RAISE per pre-registered settle-OR-raise D-01)
re_verification:
  previous_status: none
  note: initial verification
requirements_to_flip:
  - id: PIPE-01
    to: Complete
  - id: PIPE-02
    to: Complete
  - id: PIPE-06
    to: Complete
  - id: PIPE-08
    to: Complete
  - id: PIPE-09
    to: Complete
  - id: AGG-05
    to: Complete
  - id: COST-01
    to: Complete
  - id: COST-03
    to: Complete
  - id: COST-04
    to: Complete
---

# Phase 20: Orchestrator skill + headless scale confirmation Verification Report

**Phase Goal:** The `lz-deep-research` skill wires the full pipeline (scope-clarify -> decompose -> dispatch worker waves -> run the aggregator -> consult the Opus advisor at exactly two gates -> assemble the cited report) using the already-settled Phase-18 voter default, is discoverable as `lz-advisor:lz-deep-research`, wave-batches the fan-out at <=5 in-flight, retains the gitignored run dir as the audit trail, and is empirically confirmed working as a packaged skill at real headless concurrency.

**Verified:** 2026-06-21
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

The phase goal decomposes into two parts: (A) the shippable orchestrator skill + empirically-confirmed headless scale (SC-1..SC-5), and (B) the optional live verify-voter certification (SC-6). Part A is fully delivered and empirically proven. Part B reached a design-sanctioned honest RAISE under the pre-registered settle-OR-raise rule (D-01); the Sonnet-default voter ships regardless, so SC-6 is SATISFIED-BY-HONEST-RAISE and is NOT a phase gap (see SC-6 analysis below).

### Observable Truths (Success Criteria)

| # | Success Criterion | Status | Evidence |
|---|-------------------|--------|----------|
| 1 | User invokes `/lz-advisor:lz-deep-research <question>`; skill clarifies scope first (interactive or Assuming-frames headless) then decomposes into ~5 sub-angles before searching | PASS | SKILL.md Phase 0 scope guard (lines 128-152) with AskUserQuestion-then-Assuming-frame fallback; Phase 1 decompose caps `ANGLES = 5` before spawning (lines 154-185); SC-5 live run executed the full path end-to-end (`20-04-SC5-SPIKE.md`) |
| 2 | Structured cited report; every claim cited inline; Contested first-class (not averaged); escalate on UNION (contested split OR load-bearing OR ~15-20% audit sample) | PASS | Report 5-section micro-format in orchestration ref sec 1; Contested-and-Unsupported first-class section (sec 1c); escalate UNION implemented + tested in aggregator (`aggregate.mjs:707-710`, tests D-12a/b/c green 49/49) |
| 3 | Opus advisor consulted read-only at EXACTLY two gates over bounded curated JSON; fan-out wave-batched <=5 in-flight | PASS | SKILL.md two-gate discipline (lines 54, 168-174, 330-334); wave-batch hard cap (lines 63-66, 196-203); SC-5 trace: `advisorSpawns = 2` (exactly), `maxInFlight = 5` (exactly), waveBoundaryHeld=true |
| 4 | Anthropic first-party API floor (no Bedrock/Vertex paths); discoverable as `lz-advisor:lz-deep-research`; `.lz-research/` gitignored | PASS | SKILL.md lines 44-47 (Anthropic floor, no provider branching); `git grep` Bedrock/Vertex/Foundry = 0 hits; init-probe `slash_commands` includes `lz-advisor:lz-deep-research`; `.gitignore:20 /.lz-research/` |
| 5 | Run dir retained as audit trail; packaged-skill headless run at real concurrency leaves host stable with wave-batched (non-serial) spawns | PASS | SKILL.md retention stated 3x (lines 74, 142, 355); SC-5 live run ($29.07): exit 0, survivors.json reproducible, 0 Write failures, 24 waves @ maxInFlight 5, run dir retained + gitignored |
| 6 | (AMENDED RE-PLAN-12) LIVE stage is the PRIMARY over-refusal + full-WORKS certifier; pre-registered CP gates decide WORKS; Haiku flip settled here else Sonnet-default remains | PASS (satisfied-by-honest-RAISE) | Certifier RAN pre-registered (`20-05-LIVE-CERT-RESULT.md` FINAL); verdict NOT WORKS -> RAISE under settle-OR-raise (D-01); two arms never pooled; both VOIDs transparently reported (sensitivity VOID-on-construct, specificity VOID-on-power), not laundered; Sonnet-default ships (D-01); Haiku flip deferred (D-06); RAISE captured as Phase 21 |

**Score:** 6/6 success criteria satisfied (SC-1..SC-5 fully delivered + empirically proven; SC-6 satisfied-by-honest-RAISE).

### SC-6 analysis: the live-cert RAISE is the design-sanctioned outcome, NOT a gap

The phase explicitly pre-registered a **settle-OR-raise** rule (decision D-01): the live verify-voter certification was always a gate that could honestly resolve to RAISE without blocking the shippable deliverable. The verdict reached `NOT WORKS -> RAISE` because neither error-rate arm could VALIDLY certify on-distribution:

- **Sensitivity (over-refusal) = VOID-on-construct.** Arm B harvested 40 controls, 30 OOF-confirmed; the open-book live-web voter refuted 4/30 (raw CP-upper 0.2796 > TAU_OR 0.15). A 3-round unanimous cross-family board ruled the breach is a wrong-construct artifact (closed-book gold vs open-book live-web voter). A pre-registered two-sided re-adjudication confirmed 0 false-upholds and that the 4 refutes are CORRECT (the voter caught overclaimed/contradicted controls). The construct mismatch means the measurement neither certifies nor refutes; the raw 4/30 is reported transparently, never laundered into a pass.
- **Specificity (false-uphold) = VOID-on-power.** Difficulty-matched dense-evidence traps are structurally infeasible on-distribution (the pipeline extracts each claim FROM its evidence, claim ~= evidence). Clean-evidence re-test: 1/16 retained, far below the N>=30 floor. The off-distribution Phase-19 MCC SCREEN-PASS is reported as non-certifying.

Both VOIDs are transparently surfaced; the certifier ran pre-registered; the two arms were never pooled; the anti-result-shopping discipline (frozen primitives byte-identical, N never tuned, re-adjudication output reported as-is) is intact. **The Sonnet-default verify-voter SHIPS regardless** (D-01) and is wired as the orchestrator's verify stage (SKILL.md line 56, 279). The RAISE (build a live-web open-book over-refusal gold + re-run arm B) is captured as the NEW **Phase 21** (`.planning/phases/21-live-web-open-book-over-refusal-gold-and-arm-b-re-run/` confirmed to exist; ROADMAP Phase 21 goal matches). This is FUTURE WORK, not a Phase-20 deliverable.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `plugins/lz-advisor/skills/lz-deep-research/SKILL.md` | Thin 7-phase dispatcher; two Opus gates; wave-batch <=5; Anthropic floor; run-dir retention | VERIFIED | 357 lines; frontmatter `name: lz-deep-research`, `version: 2.1.0`; 7 phase blocks + discipline + resume; @-mentions both references; dispatches all 4 agents by name |
| `plugins/lz-advisor/references/lz-deep-research-orchestration.md` | 5-section report micro-format, citation join, two-gate packaging, wave-batch/per-invocation-model reminders, resume UX | VERIFIED | 224 lines; all five required topics present; ASCII-only; no cross-skill body references |
| `plugins/lz-advisor/references/lz-deep-research-schema.md` | Frozen JSON shapes (survivor record + escalate, report claim record, tally rubric, confidence enum, ceilings, two assurances) | VERIFIED | Present (41KB); @-mentioned by SKILL.md line 42 |
| `plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs` | Aggregator + additive escalate/load_bearing extension (VERIF-05) | VERIFIED | 797 lines; `escalate` = UNION(Contested OR load_bearing OR audit-sample) at lines 707-710; additive after `confidence`; CLI runs exit 0 on fixture |
| `lz-deep-research-aggregate.test.mjs` | Validation fixture incl. escalate tests | VERIFIED | 49/49 pass (file form); D-12a Contested, D-12b load_bearing OR-fold, D-12c audit-sample discriminating pair, determinism, additive-field-unchanged |
| `.gitignore` `/.lz-research/` (INTEG-02) | Gitignored run dir | VERIFIED | `.gitignore:20` |
| Skill discoverability `lz-advisor:lz-deep-research` (INTEG-01) | In slash_commands | VERIFIED | init-probe slash_commands list confirmed (`20-04-SC5-SPIKE.md` lines 110-124) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| SKILL.md Phase 2 | research-search-worker agent | named Agent call, `model: sonnet` | WIRED | SKILL.md:197; agent file exists |
| SKILL.md Phase 3 | research-extract-worker agent | named Agent call, `model: sonnet` | WIRED | SKILL.md:227; agent file exists |
| SKILL.md Phase 5 | research-verify-voter-sonnet agent | named Agent call, `model: sonnet` | WIRED | SKILL.md:279; agent file exists |
| SKILL.md Phase 1/6 | advisor agent (2 gates) | named Agent call, `model: opus` | WIRED | SKILL.md:168 (Gate 1), :330 (Gate 2); advisor.md exists |
| SKILL.md Phase 4/5 | aggregator script | `node "${CLAUDE_PLUGIN_ROOT}/.../lz-deep-research-aggregate.mjs"` | WIRED | SKILL.md:252 path matches actual file location exactly |
| aggregator escalate flag | SKILL.md re-vote dispatch | read `escalate` from survivors.json, re-vote on true (never recompute) | WIRED | SKILL.md:286-292; aggregator emits flag; behavioral spot-check confirmed `escalate: true` in survivors.json |
| SKILL.md | research-verify-voter-opus (PROHIBITED) | descriptive only, never literal name | WIRED (prohibition holds) | `git grep` literal name = 0 hits (D-18 zero-hit gate) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Aggregator test suite (incl. VERIF-05 escalate) | `node --test ...aggregate.test.mjs` | 49/49 pass, 0 fail | PASS |
| Aggregator CLI runs end-to-end + emits escalate | `node aggregate.mjs <contested-split fixture>` | exit 0; survivors.json with `confidence: Contested`, `escalate: true` | PASS |
| No Bedrock/Vertex/Foundry branching (COST-04) | `git grep -i bedrock\|vertex\|foundry SKILL.md` | 0 hits | PASS |
| Eval-only Opus voter not dispatched (D-18) | `git grep research-verify-voter-opus SKILL.md` | 0 hits | PASS |
| SC-5 packaged-skill headless run at real concurrency | live `claude -p` ($29.07, $20-04-SC5-SPIKE.md) | maxInFlight=5, advisorSpawns=2, waves=24, exit 0, 0 Write failures | PASS |

### Requirements Coverage

| Requirement | Description | Status | Evidence | Flip? |
|-------------|-------------|--------|----------|-------|
| PIPE-01 | Invoke skill; decompose into ~5 sub-angles before searching | SATISFIED | SKILL.md Phase 1 `ANGLES = 5` cap (lines 162-166); SC-5 run executed it | Pending -> Complete |
| PIPE-02 | Scope clarified first (interactive or Assuming-frames headless) | SATISFIED | SKILL.md Phase 0 (lines 144-151), Assuming-frames at 148-150 | Pending -> Complete |
| PIPE-06 | Final report cites every claim inline to source | SATISFIED | Orchestration ref sec 1b/2 inline `(Title, url)` join; SC-5 report.md (~21.9KB cited) | Pending -> Complete |
| PIPE-08 | Cross-source contradictions flagged; Contested first-class | SATISFIED | Orchestration ref sec 1c first-class section; aggregator tally Contested branch precedes Medium (`aggregate.mjs:657`) | Pending -> Complete |
| PIPE-09 | Structured written report as deliverable | SATISFIED | SKILL.md Phase 6 writes report.md (lines 336-355); SC-5 produced report.md | Pending -> Complete |
| VERIF-05 | Escalate on UNION (contested OR load-bearing OR audit sample) | SATISFIED | `aggregate.mjs:707-710`; tests D-12a/b/c green | Already Complete |
| AGG-05 | Run dir retained as audit trail | SATISFIED | SKILL.md retention 3x; SC-5 run dir retained + gitignored on disk | Pending -> Complete |
| COST-01 | Opus advisor at exactly 2 gates over bounded curated JSON | SATISFIED | SKILL.md two gates (lines 168, 330); SC-5 advisorSpawns=2 exactly | Pending -> Complete |
| COST-03 | Fan-out wave-batched <=5 in-flight | SATISFIED | SKILL.md hard cap (lines 63-66); SC-5 maxInFlight=5 exactly | Pending -> Complete |
| COST-04 | Anthropic first-party floor; no Bedrock/Vertex paths | SATISFIED | SKILL.md lines 44-47; 0 provider-branch hits | Pending -> Complete |
| INTEG-01 | Discoverable as `lz-advisor:lz-deep-research` | SATISFIED | init-probe slash_commands list | Already Complete |
| INTEG-02 | `.lz-research/` gitignored | SATISFIED | `.gitignore:20` | Already Complete |

**Note for milestone audit:** 9 of the 12 Phase-20 requirements are still marked `Pending` in `.planning/REQUIREMENTS.md` (PIPE-01/02/06/08/09, AGG-05, COST-01/03/04). All 9 are now empirically SATISFIED and should flip to `Complete`. VERIF-05, INTEG-01, INTEG-02 are already correctly marked `Complete`. COST-02 (Haiku-first flag OFF until eval clears) is a Phase-18 requirement already Complete; the Haiku flip stays deferred per the live-cert RAISE (D-06), consistent with COST-02's "OFF until the gating eval clears it."

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | -- | No TBD/FIXME/XXX/TODO/HACK/PLACEHOLDER markers in any Phase-20 deliverable | -- | Clean |

### Human Verification Required

None blocking. One interactive-only nuance is noted as informational (already documented, not a gap):

- **Bare-form `/deep-research` collision disambiguation** -- The QUALIFIED form `lz-advisor:lz-deep-research` is empirically confirmed discoverable via the init-probe slash_commands list. The BARE-form `/deep-research` collision with the Claude Code built-in can only be resolved in the INTERACTIVE picker and cannot be confirmed headless (per `20-04-SC5-SPIKE.md` and MEMORY `headless_probe`). INTEG-01 as written ("discoverable as `lz-advisor:lz-deep-research`") is satisfied by the qualified form. The bare-form interactive disambiguation is a known platform behavior, out of scope for the qualified-discoverability requirement, and not a Phase-20 gap.

### Gaps Summary

No genuine gaps. The orchestrator skill is a complete, contract-aligned thin dispatcher wiring all seven pipeline phases; every dispatched agent and the aggregator path resolve to real files; the VERIF-05 escalate extension is implemented, tested (49/49), and confirmed at runtime; the wave-batch <=5 cap and exactly-two-Opus-gates discipline held EXACTLY at their bounds in a real $29.07 headless run; the run dir is retained and gitignored; and discoverability is empirically confirmed.

The live verify-voter certification (SC-6) reached `NOT WORKS -> RAISE` -- this is the pre-registered, design-sanctioned honest outcome under settle-OR-raise (D-01), with both arms transparently VOIDed and never laundered into a pass. The shippable deliverable (the Sonnet-default skill + empirically-confirmed headless scale) never depended on the cert verdict; the Sonnet-default voter ships regardless, and the RAISE is captured as Phase 21. SC-6 is therefore SATISFIED-BY-HONEST-RAISE, not an unmet goal.

---

_Verified: 2026-06-21T22:30:00Z_
_Verifier: Claude (gsd-verifier)_
