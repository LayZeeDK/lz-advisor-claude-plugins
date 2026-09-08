---
phase: 21
phase_name: "live-web-open-book-over-refusal-gold-and-arm-b-re-run"
project: "lz-advisor"
generated: "2026-06-22"
counts:
  decisions: 5
  lessons: 4
  patterns: 4
  surprises: 3
missing_artifacts:
  - "21-HUMAN-UAT.md (none -- verification passed with no human_needed items)"
---

# Phase 21 Learnings: live-web-open-book-over-refusal-gold-and-arm-b-re-run

## Decisions

### Stage the only metered spend behind TWO GO/NO-GO gates, not a blind range
The metered Copilot OOF spend was authorized in two steps: first a bounded `LZ_SAMPLE=2` pre-flight spike, then -- only after disclosing the spike's real per-item cost and a precise full-N projection -- a second explicit GO/NO-GO on the full N. The maintainer was never asked to authorize the blind ~100-350 estimate up front.

**Rationale:** The maintainer flagged 350 as too much; the staged spike (bounded BY CONSTRUCTION by the LZ_SAMPLE cap, applied before dispatch) is the HALT+RAISE cost guard (D-12/D-14), and the resumable evidenceSha cache makes the spike a down-payment, not a sunk cost.
**Source:** 21-05-PLAN.md, 21-OPENBOOK-CERT-RESULT.md

---

### Accept the pre-registered VOID-on-power-RAISE as-output
`validN=10 < N_CTRL_FLOOR 24` -> VOID-on-power-RAISE was accepted verbatim: one pass, no optional stopping, TAU never relaxed, denominator never grown/shrunk, frozen primitives byte-identical.

**Rationale:** The lock-rule (committed before any scored vote) pre-registered all three verdict branches; the git-history ordering is the anti-result-shopping anchor, so the result stands whatever it is.
**Source:** 21-OPENBOOK-LOCK-RULE.md, 21-OPENBOOK-CERT-RESULT.md

---

### A net-new normalize helper bridges worker output -> the frozen builder contract
`openbook-normalize-claims.mjs` injects the control claim from the packets (never the voter excerpt) and propagates the top-level source per claim, making the raw extract-worker output valid for the frozen `readControlBundle`.

**Rationale:** An under-specified plan gap -- the gold driver reads `rec.claim` and the builder needs per-claim source, neither of which the raw extract worker emits.
**Source:** 21-04-SUMMARY.md

---

### kappa + evidence_jaccard reported null (not computable), never gated
Both diagnostics are reported as `null` with a `diagnostics_note`; the available OOF agreement is surfaced as the `oof_agreement` tally instead.

**Rationale:** The frozen adjudicator surfaces only the all-agree/split CONSENSUS (not the two models' raw reads), so a true inter-rater kappa is not computable; the frozen voter packets carry no URLs, so a gold-vs-voter Jaccard is not computable. Both are D-08 reported-only; they never enter the CP gate.
**Source:** 21-04-SUMMARY.md, openbook-oof-gold.mjs

---

### OA-source preference for retrieval; the deterministic node blocklist is load-bearing
Retrieval preferred openly-fetchable PRIMARY sources (arXiv, PMC, europePMC, ACP/Copernicus, NOAA, bioRxiv) over bot-blocking publishers (NEJM, Nature, Science, FDA, sciencedirect, ash). The meta-source blocklist is enforced by a deterministic node filter, not by prompt avoidance.

**Rationale:** Publisher pages bot-block automated WebFetch; the search-worker prompt avoidance is best-effort only, so the node filter (0/159 blocklisted in the frozen snapshot) is the actual gate.
**Source:** 21-OPENBOOK-LOCK-RULE.md, openbook-lib.mjs

---

## Lessons

### The construct-matched gold can be UNDER-POWERED, a distinct failure mode from Phase 20
Phase 20 VOIDed on CONSTRUCT (closed-book gold vs open-book voter). Phase 21 fixed the construct (open-book live-web retrieval), and the new failure mode is POWER: the OOF pair reached an all-agree SUPPORTED consensus on only 10/30 controls (20 oof-splits), starving the denominator below the 24 floor.

**Context:** Two strong models legitimately disagree on entailment of broader-literature evidence for 2/3 of the closed-book-SELECTED controls -- the broader literature is more nuanced than the voter's fixed excerpt.
**Source:** 21-OPENBOOK-CERT-RESULT.md, openbook-rescore-result.json

---

### Per-control OOF cost is dominated by per-call fixed overhead at small batch sizes
The 2-control spike measured 7.86 credits/control; the full 8-control batches landed at ~2.1 credits/control. A linear extrapolation from a tiny spike is a conservative UPPER bound, not a point estimate.

**Context:** Batching amortizes the fixed per-call overhead (system prompt + instructions) across more controls, so per-control cost drops sharply as batch size grows. Project full-N cost as a band, and treat the small-spike per-item number as a ceiling.
**Source:** openbook-gold-credits.json (spike 15.72/2 vs full-N 59.58/8), 21-OPENBOOK-CERT-RESULT.md

---

### M-1 credit capture: verify per-call vs cumulative before summing
The credit record's `perCall` array must be checked for monotonic non-decrease before trusting `totalCredits`. Both Phase 21 runs had non-monotonic perCall (spike [11.3, 4.42]; full-N [16.4, 8.05, 18.5, 6, 5.45, 2.05, 1.87, 1.26]) -> genuinely per-call -> sum is correct.

**Context:** A monotonically non-decreasing perCall would be a cumulative running total (use the max, not the sum). Here the sequences decrease, so the M-1 cumulative trap does not apply -- but the check is mandatory.
**Source:** openbook-gold-credits.json, oof-transport-lib.mjs (buildCreditsRecord)

---

### `gsd-sdk query state.advance-plan` with no args mutates STATE.md as a side effect
Running the verb to probe its signature advanced the plan pointer (4->5), regenerated `stopped_at` from a stale template, and bumped progress counters (completed_phases 7->8 prematurely). Controlled `Edit`s on STATE.md are safer than the auto-advance for a phase-close that needs an accurate narrative.

**Context:** Discovered during the Phase 21 close. Probe SDK verbs that mutate state with `--help`/dry-run, not bare invocation; `git checkout -- .planning/STATE.md` cleanly discards an unintended SDK mutation.
**Source:** session (Phase 21 extract-learnings close); STATE.md git diff

---

## Patterns

### Staged, structurally-bounded metered spend
A bounded pre-flight spike (env cap applied BEFORE dispatch so it cannot overrun) measures real per-item cost; a resumable content-hash cache makes the spike a down-payment; a second human GO/NO-GO authorizes the full run on the measured projection.

**When to use:** Any metered out-of-family (Copilot AI Credits) spend where the per-item cost is uncertain and the per-call estimate has historically been wrong (M-1: ~3x).
**Source:** 21-05-PLAN.md, openbook-oof-gold.mjs (selectCandidates LZ_SAMPLE cap)

---

### Pre-registration via git-history ordering (anti-result-shopping)
Freeze the construct (snapshot sha256), the N, the estimator, and the decision rule in a lock-rule committed BEFORE any scored vote. The commit ordering is the anchor; the result is accepted whatever it is.

**When to use:** Any evaluation/certification where post-hoc rule changes would let you shop for a passing result.
**Source:** 21-OPENBOOK-LOCK-RULE.md

---

### Two-field gold: separate groundedness from validity
Each gold item carries a groundedness field (logged URLs + verbatim quotes + fetched_at + excerpt_ids) separate from a validity field (AVeriTeC 4-way -> frozen binary + consensus disposition).

**When to use:** When an over-refusal/error must be attributable to a retrieval gap vs a reasoning error -- the separation makes the failure mode diagnosable.
**Source:** openbook-oof-gold.mjs (buildOpenbookResult), OBG-02

---

### OOF non-unanimity -> RESIDUE (Guerdan), never coerced
When the all-agree pair splits, the item maps to `conflicting` -> RESIDUE: excluded from the binary denominator and routed to the human, never forced into SUPPORTED/NOT-SUPPORTED.

**When to use:** Any out-of-family adjudication where forcing a binary on genuine indeterminacy would inject label noise into the gate.
**Source:** 21-OPENBOOK-LOCK-RULE.md, openbook-oof-gold.mjs

---

## Surprises

### Total spend (75.30 credits) landed far under the ~100-350 estimate
Spike 15.72 + full-N 59.58 = 75.30 AI Credits -- well under the ceiling the maintainer flagged.

**Impact:** Batch amortization (7.86/control at batch=2 -> ~2.1/control at batch=8) cut the cost; the conservative spike projection (~236) over-estimated by ~3x. Cost-sensitive metered runs should batch densely (within the frozen contract) and not over-fear a small-spike per-item number.
**Source:** openbook-gold-credits.json, 21-OPENBOOK-CERT-RESULT.md

---

### 20/30 oof-splits -- the construct fix revealed under-power, it did not resolve sensitivity
The closed-book gold (Phase 20) confirmed all 30; the construct-matched open-book gold confirmed only 10.

**Impact:** The RAISE headline shifts from "construct mismatch" to "the closed-book-selected control set cannot be confidently confirmed open-book." A POWERED sensitivity verdict now requires an open-book-NATIVE control set (selected so the OOF pair's open-book consensus is high by construction) -- future work, not this milestone.
**Source:** 21-OPENBOOK-CERT-RESULT.md, openbook-gold-result.json (oof_agreement)

---

### crispr/cluster47 flipped: a Phase-20 "correct refute" became the lone genuine over-refusal
The control the Phase-20 analysis read as a correct refute (gene vs erythroid-specific enhancer) the open-book OOF pair confirmed SUPPORTED -- so the voter's refute is the one genuine over-refusal in the validN=10 denominator.

**Impact:** Non-load-bearing under VOID-on-power (cpUpper 0.3942 with validN 10 < 24), but it shows the broader-literature evidence can shift the judgment vs the fixed-excerpt closed-book read -- evidence that the construct matters even where the gate is unpowered.
**Source:** openbook-rescore-result.json (itemized dispositions)
