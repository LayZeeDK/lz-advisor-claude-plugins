---
phase: 22
phase_name: "Deep-research skill eval and parity baseline with built-in deep-research"
project: "lz-advisor"
generated: "2026-09-05"
counts:
  decisions: 10
  lessons: 9
  patterns: 8
  surprises: 6
missing_artifacts:
  - "22-UAT.md"
---

# Phase 22 Learnings: Deep-research skill eval and parity baseline with built-in deep-research

> **Phase outcome in one line:** the measured-parity track produced NO parity verdict. The Stage-2
> judge-calibration gate failed on both attempted instruments, the pre-committed stopping rule
> halted the phase, and the honest result is a named gap in the MEASUREMENT INSTRUMENT -- not a
> finding about the `lz-deep-research` skill in either direction. Per D-03 the Sonnet-default skill
> ships regardless; this track was always confidence work, never a ship gate.

---

## Decisions

### Freeze the pre-registration in its own timestamped commit, before any spend
`ae7294d` (2026-06-22T20:23:01Z) contains ONLY the prereg, the driver, and the anti-drift test.
SUMMARY/STATE were committed separately so the freeze reads as a clean, unambiguous timestamp.

**Rationale:** D-20 makes the freeze commit the pre-registration timestamp of record. A commit that
also carries tracking churn muddies what exactly was frozen and when.
**Source:** 22-04-SUMMARY.md

### Assert the frozen prose numbers equal the frozen module constants byte-for-byte
The anti-drift co-test compares the prereg's NUMBERS table against the `Object.freeze`d constants,
and carries both a discriminating wrong-needle case and an invert-the-fix proof.

**Rationale:** A prose bar and a code bar that can drift apart is a silent result-shopping surface.
Tying them mechanically makes post-hoc bar tuning detectable rather than merely discouraged.
**Source:** 22-04-SUMMARY.md, verified in 22-SECURITY.md T-22-02

### Report SEM as a descriptor, never as a confidence gate
SEM is sample-stddev (n-1) / sqrt(k), reported beside the mean. No jstat import in the parity
scorer.

**Rationale:** D-07 forbids inferential statistics at n=2-3. Emitting a CI at that n would dress a
descriptive number as an inferential one.
**Source:** 22-01-SUMMARY.md

### Use a near-perfect, not perfect, calibration fixture for the "clears" case
A perfect (MCC 1.0) set has zero bootstrap variance, which collapses the one-sided BCa lower CI to
exactly the floor -- so the STRICT `> LOWER_FLOOR` gate correctly disqualifies it.

**Rationale:** The perfect set is the at-floor DISCRIMINATOR: a `>=` bug would wrongly clear it. The
"clears" case therefore needs 11/12 each direction, not 12/12.
**Source:** 22-02-SUMMARY.md

### Flag every built-in claim as docs-grounded, and publish what the docs do NOT support
The architectural-parity write-up carries 21 per-claim `docs-grounded` flags plus an explicit
negative list.

**Rationale:** The built-in `/deep-research` is closed-source. Without per-claim provenance a
comparison silently slides from "what the docs say" into "what we assume".
**Source:** 22-03-SUMMARY.md, verified in 22-SECURITY.md T-22-08

### Resolve the D-14 conditional branch BEFORE grading, and record it as resolved
The branch was settled FEASIBLE pre-grade (95 clean Supported / 216 clean Refuted).

**Rationale:** D-14 is explicit that a RESOLVED pre-registered conditional is valid
pre-registration, not result-shopping. Resolving it early removes the temptation to argue it either
way after seeing the numbers.
**Source:** 22-04-SUMMARY.md

### Retire Conditional C prospectively, in the amendment, before the run
AMENDMENT RECORD 3 killed the "widen the WiCE draw if under-powered" escape hatch ahead of time.

**Rationale:** A near-bar result can be argued into or out of an under-power branch after the fact.
Retiring it before the run removes the argument entirely -- and in the event, the realized shape
would not have triggered it anyway.
**Source:** eval/lz-eval-parity-prereg.md, 22-05-SUMMARY.md

### Authorize exactly ONE re-calibration on a forced replacement instrument, with a pre-committed stopping rule
Prompt and item set held UNCHANGED -- one variable at a time -- rather than revising the prompt
first. `cleared === false` was pre-committed to mean HALT.

**Rationale:** The pre-registered Opus 4.x judge became unaddressable (the Agent tool exposes model
aliases only), so the instrument change was FORCED, not chosen. A null on a re-runnable judge beats
a null on a judge nobody can invoke again.
**Source:** 22-05-SUMMARY.md, .continue-here.md decisions_made

### Commit the failing calibration as a durable record, not a gitignored cache artifact
`eval/lz-eval-parity-calibration-opus5-record.md` carries the aggregate confusion matrix and all 60
per-item rows; the same was done for the disqualified 4.x run.

**Rationale:** A replicator must be able to reproduce the null from a fresh clone. A null that dies
with one `git clean -xdf` is not a published result.
**Source:** 22-05-SUMMARY.md

### Do not compute the subgroup MCC at all -- not merely leave it unreported
Unlike the 4.x diagnosis, the Opus 5 record deliberately contains no per-subset MCC.

**Rationale:** The 4.x diagnosis had already shown the clear-cut subset (n=43) satisfies the ENTIRE
predicate. Selecting it after seeing a pooled failure is exactly the post-hoc subgroup selection
PAR-02's "NEVER relax the bar" forbids. Not computing it removes the number that could authorize
Stage-3 spend.
**Source:** 22-05-SUMMARY.md, independently confirmed in 22-VERIFICATION.md

---

## Lessons

### A pre-registered stopping rule is only worth what it costs to honor when it bites
It bit here. Every tempting move -- a third instrument, a prompt tweak, a wider draw, the clear-cut
subgroup that satisfies the whole predicate -- was pre-banned, and all were declined.

**Context:** The rule was written when the outcome was unknown and enforced when the outcome was a
failure. 22-VERIFICATION.md re-derived the gate result from the committed rows byte-identically and
verified both sha256 pins, both file histories, and the amendment-before-run ordering before
accepting the claim.
**Source:** 22-05-SUMMARY.md, 22-VERIFICATION.md

### A halted phase hides bugs, because nothing exercises the code that would have surfaced them
Two real defects in `eval/lz-eval-baseline-manifest.mjs` sat behind an 11/11 green co-test and were
found only when the security and Nyquist audits ran the module against REAL captures.

**Context:** `extractSystemInit` reads `event.version`, but a real `system/init` carries
`claude_code_version` -- so no MANIFEST is producible from any real capture, which is the mechanical
cause of verification gap SC1. Separately, `validateManifest` is `existsSync`-only although the
driver documents a "non-empty report" check, so a zero-byte report would validate.
**Source:** 22-SECURITY.md T-22-06/F3/F4, 22-VALIDATION.md B1/B2

### Green co-tests are not coverage; a test that cannot fail against a broken implementation is decoration
Both manifest defects lived under a green suite. So did the NUL-separator defect: every fixture used
a spaceless question id (`q1`, `qA`), so the entire parity-judge suite passed under a `' '`
separator.

**Context:** The fix was to prove discrimination by inverting the change -- degrade the separator,
observe the new tests fail and the 14 old ones still pass -- rather than trusting green.
**Source:** 22-REVIEW.md CR-01, 22-VALIDATION.md discrimination proof

### A code-review finding can be confidently wrong; verify the premise, not just the claim
`22-REVIEW.md` CR-04 reported as a BLOCKER that the emphatic no-tools instruction was missing,
having searched only the sha256-pinned prompt file. The instruction is pre-registered at DISPATCH in
AMENDMENT RECORD 3 -- placed there deliberately, because editing the pinned prompt is the banned
prompt revision.

**Context:** The orchestrator initially relayed CR-04 as fact and repeated the same file-scoping
error while "independently confirming" it. It was caught only by reading the two artifacts the
maintainer pointed at, which attribute the mitigation correctly. Two of the four reported BLOCKERs
did not survive adjudication.
**Source:** 22-REVIEW.md orchestrator adjudication note

### A stale handoff file is an active hazard, not just untidy
`.continue-here.md` survived the run still reading `status: paused-before-spend`, with a
`<next_action>` instructing the next session to "launch the single authorized ~60-call Opus 5
calibration". That attempt was already consumed.

**Context:** GSD reads `.continue-here.md` at every `execute-phase` invocation for blocking
anti-patterns, so the stale instruction would have been surfaced to the next session as guidance.
Two sibling artifacts were stale the same way: the ROADMAP 22-05 line was a bare `- [ ]`, and
STATE.md's superseded log entry was still tagged CURRENT.
**Source:** 22-VERIFICATION.md gap G5

### One stale `requirements-completed:` line can silently close unsatisfied requirements
`22-02-SUMMARY.md` declared `[PAR-02, PAR-03, PAR-06]` complete. All three requirement texts are
BEHAVIORAL; 22-02 landed only the modules.

**Context:** REQUIREMENTS.md and the ROADMAP both already recorded them Pending, so the SUMMARY was
the lone outlier -- but the milestone audit's 3-source cross-reference could have closed three open
requirements on the strength of that one line. The sibling 22-01-SUMMARY.md had set the correct
precedent with `requirements-completed: []` and an explanatory note.
**Source:** 22-VERIFICATION.md gap G4

### An invisible control character in source is a search hazard, not only a correctness hazard
Three literal NUL bytes made `eval/lz-eval-parity-judge.mjs` read as BINARY to ripgrep, so `rg` for
any symbol in it returned "binary file matches" and no lines.

**Context:** This is the silent false negative CLAUDE.md's Content Search section warns about, and
it blinded a real search during this phase's own review before being diagnosed. The same trap fired
twice more in the same session: a literal NUL leaked into a commit message and into `22-REVIEW.md`
itself, the latter making the whole report unsearchable.
**Source:** 22-REVIEW.md CR-01

### An "instrument replacement" can be forced by tooling, not chosen by the researcher
The pre-registered Opus 4.x judge could not be invoked at all, because the Agent tool exposes model
ALIASES only -- the alias had re-pointed to a new generation.

**Context:** This makes a pre-registered model unenforceable as written, and turns the old
generation unaddressable. The mitigation adopted was to write the RESOLVED model into every verdict
file and add a single-instrument check that refuses a set spanning two model strings.
**Source:** .continue-here.md decisions_made, 22-05-SUMMARY.md run property 2

### A no-file-reads pre-registration contract can create a NEW, unanticipated fidelity risk
AMENDMENT RECORD 3 required the payload INLINED in the agent prompt and forbade the judge reading
the dispatch file. That forced the orchestrating session to hand-transcribe ~520 KB across 60
dispatches.

**Context:** The independent transcription check came back INCONCLUSIVE, not passing -- 62 of 63
transcript files are 0 bytes and the transport retains no readable copy of the outbound prompt. So
the mechanical anti-leak scan covers the materialized dispatch files, NOT what each judge actually
received. Reported as the run's weakest link rather than upgraded to a pass.
**Source:** 22-05-SUMMARY.md run property 6, 22-SECURITY.md F5

---

## Patterns

### Report a null on a RE-RUNNABLE instrument, and publish it
Prefer a reproducible failure over an unreproducible one, and commit it rather than leaving it in a
gitignored cache.

**When to use:** Any pre-registered measurement that fails. The prior 4.x null was on a judge nobody
can invoke again; the Opus 5 null is reproducible from a fresh clone.
**Source:** 22-05-SUMMARY.md patterns-established

### Write-once verdict files to make a partial re-roll indistinguishable from a resume
The single authorized attempt is CONSUMED at the first landed verdict file, and landed verdicts are
immutable.

**When to use:** Any one-shot pre-registered run that could be paused and resumed. Without it, a
"resume" is operationally identical to a quiet second attempt.
**Source:** 22-05-SUMMARY.md patterns-established

### Zero-variance edge case as the at-floor test discriminator
A perfect calibration set collapses the bootstrap lower CI to exactly the floor, so it is the case
that distinguishes a strict `>` gate from a buggy `>=`.

**When to use:** Testing any threshold comparison where the degenerate input lands exactly on the
boundary.
**Source:** 22-02-SUMMARY.md

### Synthetic fixtures for licensed corpora
Author plausible synthetic rows in the dataset's shape -- never copy the licensed corpus -- with
deliberate leaky-token / pronoun / over-long claims to exercise filter exclusions offline.

**When to use:** Any test that needs a CC-BY-NC or CC-BY-ND dataset's SHAPE without redistributing
its content.
**Source:** 22-02-SUMMARY.md patterns-established

### Docs-grounded flag + explicit negative list for closed-source comparisons
Per-claim provenance flags plus a published "what the docs do NOT support" section.

**When to use:** Comparing against any closed-source or third-party system whose internals are
inferred rather than read.
**Source:** 22-03-SUMMARY.md patterns-established

### Allowlist, not blocklist, at an answer-leak boundary
`filterSliceA` emits `{ claim, claim_date }` only, so every leaky gold field is dropped by
construction rather than by enumeration.

**When to use:** Any boundary where held-back ground truth sits beside the payload. A blocklist
silently fails when the upstream schema gains a field.
**Source:** eval/lz-eval-sliceA-gold.mjs, 22-SECURITY.md T-22-05b

### Park a knowingly-red test outside the suite glob rather than inside it
`eval/__known-defects__/` sits outside `eval/*.test.mjs` deliberately, so the phase gate keeps
reporting the shipped contract's true state.

**When to use:** When an audit finds a real defect it is not authorized to fix. A red file inside
the gate glob either gets silenced or masks a genuine regression; outside it, the defect is
executable documentation. Move it into the normal suite once the defect is fixed.
**Source:** 22-VALIDATION.md, eval/__known-defects__/p22-baseline-manifest-defects.test.mjs

### Mark every mitigation as EXERCISED or UNEXERCISED in the security record
A halted phase leaves controls that are code-present but never fired. Recording which is which keeps
the record honest.

**When to use:** Any security audit over a phase that did not fully execute. An unexercised
mitigation is a strictly weaker claim than an exercised one, and conflating them overstates
assurance.
**Source:** 22-SECURITY.md

---

## Surprises

### The forced replacement instrument scored LOWER than the disqualified one
Opus 5: `mcc=0.4531 lowerCI=0.2366`. Opus 4.x: `mcc=0.4889 lowerCI=0.2722`. Worse on every headline
figure.

**Impact:** The re-run's own justification was that a reproducible null beats an unreproducible one,
so the result still had value -- but the working assumption that a newer generation would rescue a
near-bar gate was wrong. It pushed the construct question (is a WiCE-collapsed MCC gate the right
Stage-2 instrument at all?) from "maybe" to the headline deferred item.
**Source:** 22-05-SUMMARY.md

### The subtle subset is single-pole by construction, so it can only depress the pooled MCC
All 17 `partially_supported` items collapse to gold `refuted`, making tp and fn zero by
construction.

**Impact:** An instrument defect, not a judge failure -- and it was invisible until the 4.x
decomposition was computed. It is now a mandatory carry-forward for the successor phase's
pre-registration.
**Source:** 22-05-SUMMARY.md, .continue-here.md

### Three of sixty verdicts carry reasoning that contradicts their own verdict token
`dev00016-1`, `dev00219-1`, `dev00429-0`. All persisted verbatim.

**Impact:** Each verdict is parseable and in-enum, so the write-once clause does not permit
discarding it, and `readVerdict` scores only the token. A judge whose stated reasoning argues the
opposite of its emitted verdict is measured on the token, not the argument -- a limitation of the
two-token output contract. Descriptive; changed no verdict; explicitly NOT offered as an explanation
for the failure.
**Source:** 22-05-SUMMARY.md run property 5

### The transcription-fidelity check returned INCONCLUSIVE because the transport keeps no copy of what it sent
62 of 63 sub-agent transcript files are 0 bytes.

**Impact:** The check was written and run, and could not conclude. Rather than upgrade it to a pass,
the run recorded transcription fidelity as an UNVERIFIED assumption and named it the weakest link in
the record. The fix -- have the harness persist the exact dispatched string per item -- is a
carry-forward.
**Source:** 22-05-SUMMARY.md run property 6

### None of the nine Phase-22 test files runs in CI
`.github/workflows/ci.yml` pins a fixed list of four eval test files, written before this phase.

**Impact:** 106 of 108 Phase-22 tests never execute in CI -- including the anti-drift
result-shopping guard (T-22-02) and every fail-closed dispatch guard (T-22-05a). The controls exist
and pass locally, but nothing enforces them on a push.
**Source:** 22-VALIDATION.md

### A latent prompt-injection path from dataset content, present but never triggered
`lz-eval-parity-calibration-dispatch.mjs` substitutes placeholders with `String.prototype.replace`,
so `$&`, `` $` ``, `$'` and `$$` in dataset text are interpreted rather than inserted literally.

**Impact:** Measured, not assumed: 27 of 60 records contain a `$`, and 0 contain a hazardous
sequence -- so the 2026-09-05 run was not corrupted. The traced failure mode is a silently mangled
instrument, not an answer leak: a `` $` `` in the evidence injects preceding prompt text carrying no
uid and no gold marker, so neither existing guard fires. Escalated as proposed T-22-15 rather than
folded silently into the register.
**Source:** 22-SECURITY.md ESCALATED section, 22-REVIEW.md WR-07

---

## Carry-forward to the successor phase

The measured-parity track is CLOSED with the gate uncleared and the authorized attempt spent. A
successor phase needs its OWN fresh pre-registration and must carry, at minimum:

1. The construct question: is a WiCE-collapsed MCC gate the right Stage-2 instrument for a
   deep-research parity comparison at all?
2. The near-bar power question retired with Conditional C.
3. The single-pole subtle-subset instrument defect.
4. The two-token output-contract weakness (the three self-contradicting verdicts).
5. A harness that PERSISTS the exact dispatched string per item, closing the unverified
   transcription assumption.
6. Code review CR-01 (fixed 2026-09-05) and CR-03 (BCa knobs outside the freeze perimeter, deferred).
7. Security: T-22-04, T-22-06, the escalated T-22-15, and flags F1-F5.
8. Validation: defects B1/B2 in `lz-eval-baseline-manifest.mjs`, and the CI coverage gap.
9. The deferred LLM-AggreFact open-book transfer diagnostic (relocated, not dropped).

Requirements disposition for `/gsd-audit-milestone`: close PAR-01 and PAR-07; carry PAR-02, PAR-03,
PAR-04, PAR-05, PAR-06 and the PAR-08 remainder OPEN. Per D-03 the Sonnet-default `lz-deep-research`
skill ships regardless -- nothing here blocks the milestone.
