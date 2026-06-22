---
phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d
plan: 03
subsystem: testing
tags: [eval, parity, deep-research, docs-grounded, architectural-parity, content-review]

# Dependency graph
requires:
  - phase: 17-schema
    provides: the frozen lz-deep-research data contract (confidence enum, downgrade-not-delete tally rubric, two-assurance distinction) that the lz side of the contrast is grounded in
  - phase: 20-orchestrator
    provides: the shipped lz-deep-research SKILL.md (verify wave, two Opus gates, disconfirming decomposition, first-class Contested/Unsupported report section) cited as the lz preserve-uncertainty design
provides:
  - eval/lz-eval-parity-architecture.md -- the ARCHITECTURAL-parity track (D-02 track 1): a docs-grounded built-in-vs-lz preserve-vs-collapse verification-design contrast
  - the content-reviewed REFERENCE that complements the MEASURED-parity track (Plans 22-04/05)
affects: [22-04 pre-registration freeze, 22-05 measured parity run, milestone-audit parity claim]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "docs-grounded flagging: every closed-source built-in claim explicitly marked docs-grounded with an explicit not-claimed list (anti-overclaim, T-22-08)"
    - "asymmetric-source contrast: docs-grounded inference on the closed side vs shipped-source citation on the open side"

key-files:
  created:
    - eval/lz-eval-parity-architecture.md
  modified: []

key-decisions:
  - "PAR-07 fully satisfied: the architectural-parity write-up is authored AND content-reviewed (the deliverable is the review-gated reference)"
  - "PAR-08 partially satisfied for this artifact only: the architectural-parity write-up portion of the PAR-08 review-before-use/publish gate is met; the broader PAR-08 (all eval scripts + prompts) closes across 22-04/22-05"
  - "Zero model spend, zero packages: PROSE only, grounded in already-verified published docs (canonical_refs) + the shipped lz schema/SKILL.md; no network fetch (the closed built-in source needs none)"

patterns-established:
  - "Pattern 1: docs-grounded disclaimer + per-claim docs-grounded flag + an explicit 'what the docs do NOT support' list, so a closed-source comparison cannot silently overclaim"

requirements-completed: [PAR-07]

# Metrics
duration: ~25min
completed: 2026-06-22
---

# Phase 22 Plan 03: Architectural-parity write-up Summary

**A docs-grounded `eval/lz-eval-parity-architecture.md` contrasting the built-in `/deep-research`'s collapse-uncertainty design (votes + adversarial cross-review + DROPS non-survivors) against lz-deep-research's preserve-uncertainty design (first-class Contested/Unsupported, downgrade-not-delete, non-unanimity human abstention, disconfirming search VERIF-02, source-independence weighting VERIF-03, the two-assurance distinction VERIF-06), closing on Anthropic's holistic-eval philosophy (D-01) -- content-reviewed before being treated as a deliverable.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-06-22T20:31:00Z (approx)
- **Completed:** 2026-06-22
- **Tasks:** 1 auto task + 1 blocking content-review checkpoint (orchestrator-approved)
- **Files modified:** 1 created

## Accomplishments

- Authored `eval/lz-eval-parity-architecture.md` (230 lines): the ARCHITECTURAL-parity track (D-02 track 1, PAR-07).
- Built-in side documented strictly docs-grounded -- every built-in claim flagged docs-grounded, sourced only from the published Anthropic posts (multi-agent-research-system, built-multi-agent-research-system, demystifying-evals) + the code.claude.com dynamic-workflows page; the closed-source basis (D-15: verified absent from all public Anthropic repos) is stated up front; an explicit "what the docs do NOT support" list prevents overclaim (T-22-08).
- lz side grounded in the shipped design: first-class Contested/Unsupported confidence tiers, the downgrade-not-delete tally rubric (the only removal path is the upstream quote-recheck `dropped` record), non-unanimity routed to human abstention, the disconfirming search (VERIF-02), source-independence weighting via the canonical-key corroboration lower bound (VERIF-03), and the two never-conflated assurances quote_fidelity (mechanical) vs claim_support (judgment) (VERIF-06) -- each cited to lz-deep-research-schema.md / SKILL.md (T-22-09).
- Closed on Anthropic's holistic-eval philosophy (D-01) as the methodological basis for trusting the multi-agent ARCHITECTURE as the correctness mechanism rather than a component error-rate gate.
- Passed the mandatory PROJECT.md "Review before use or publication" content review (PAR-08) BEFORE the artifact is treated as a deliverable: the orchestrator independently cross-checked the lz-side claims against the shipped source (schema confidence enum + Contested-on-split ~L410; unanimous-refutation->Low L421; quote_fidelity verified|downgraded L364-373; the `dropped` record as the ONLY claim-removal path L377/383-384; claim_support enum never derived from quote_fidelity L478-483; disconfirming_query/VERIF-02 L342 + SKILL Phase 1 L163; corroboration_lower_bound canonical-key dedup L58/134) and confirmed the built-in side is correctly docs-grounded-flagged with an explicit not-claimed list. Verdict: approved, no edits required.

## Task Commits

1. **Task 1: Author the docs-grounded architectural-parity write-up** - `780fc35` (docs)
2. **Task 2: Content-review checkpoint (blocking)** - resolved as orchestrator-approved (PAR-08 review passed; no edits)

**Plan metadata:** this SUMMARY + STATE + ROADMAP + REQUIREMENTS (docs: complete plan)

## Files Created/Modified

- `eval/lz-eval-parity-architecture.md` - The ARCHITECTURAL-parity track: the docs-grounded built-in-vs-lz preserve-vs-collapse verification-design contrast (PAR-07). ASCII-only, LF, no BOM, no AI-attribution.

## Verification

- Token grep (each token present, >= 1): `docs-grounded` = 21, `Contested` = 9, `downgrade-not-delete` = 3, `Unsupported` = 6 (`git grep -c -e "docs-grounded" -e "Contested" -e "downgrade-not-delete" -- eval/lz-eval-parity-architecture.md`).
- `node --test eval/lz-eval-packaging-boundary.test.mjs` -> EXIT 0 (2/2 pass): the .md lives under `eval/`, outside the plugin tree, so the one-directional eval->runtime packaging boundary holds.
- ASCII-only confirmed (non-ASCII byte scan clean); no BOM; LF-only (no CRLF); 14755 bytes.
- Commit hygiene: only `eval/lz-eval-parity-architecture.md` staged in the Task-1 commit; zero file deletions; clean working tree.
- Blocking content-review checkpoint: resolved "approved" (PAR-08), all five verification points passed.

## Decisions Made

- PAR-07 is marked Complete: the deliverable is the content-reviewed reference, and it is authored AND reviewed.
- PAR-08 is NOT flipped to Complete here: PAR-08 is a phase-wide gate covering every eval SCRIPT (+ code-reviewed tests) and every PROMPT/REFERENCE; only the architectural-parity write-up portion is satisfied by this plan. PAR-08 closes once the 22-04 freeze + 22-05 scripts/prompts also pass their reviews. The traceability note records the partial satisfaction.

## Deviations from Plan

None - plan executed exactly as written. (No deviation rules triggered: prose-only, zero spend, zero packages, no missing critical functionality, no architectural change.)

## Issues Encountered

- A reflexive attempt to fetch the Anthropic posts via markdown.new was correctly denied by the auto-mode classifier as a network call crossing the explicit ZERO-SPEND/no-network boundary. No fetch was needed: the canonical URLs in 22-CONTEXT.md `canonical_refs` were already FETCHED + verified during discuss-phase, and D-17 supplies the substantive contrast. The write-up cites those verified URLs and grounds the built-in claims as docs-grounded with no new network access.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The ARCHITECTURAL-parity track (D-02 track 1) is delivered and content-reviewed; it complements the MEASURED track that Plans 22-04 (pre-registration freeze) and 22-05 (the human-authorized Claude-pool spend) produce.
- Wave 1 is now complete (22-01, 22-02, 22-03 all done). Wave 2 (22-04, the pre-registration FREEZE) is unblocked.

## Self-Check: PASSED

- FOUND: eval/lz-eval-parity-architecture.md
- FOUND: 22-03-SUMMARY.md
- FOUND commit: 780fc35 (Task 1)
- ASCII-only / no BOM / LF confirmed on the deliverable + all edited planning docs.

---
*Phase: 22-deep-research-skill-eval-and-parity-baseline-with-built-in-d*
*Completed: 2026-06-22*
