# Phase 19 Security Audit -- Search + Extract Worker Agents + Offline Eval

**Phase:** 19 -- search-extract-worker-agents
**Audit type:** Retroactive threat-mitigation verification (post-completion)
**ASVS level:** L1 (assumed -- no `asvs_level` in `.planning/config.json`; the implemented surface is the DEV-ONLY `eval/` tree + Markdown worker agents, no production attack surface; the trust boundaries are about EVAL INTEGRITY -- artifact construction, result-shopping, contamination, gold validity -- not runtime exploitation)
**block_on:** open (GSD default -- no explicit `security_block_on`; `security_enforcement` implicitly ON via `gsd-security-auditor` configured)
**Overall verdict:** SECURED -- all declared threats CLOSED. No edits required.
**Threats closed:** 24 / 24 (mitigate: 23 verified in code + discriminating tests; accept: 1 documented).
**Blockers:** NONE.

Threat register sources verified: `19-04-PLAN.md` `<threat_model>` (RE-PLAN-12 NET-NEW T-19-32..T-19-37 + CARRIED set), and the per-plan threat models in `19-01-PLAN.md`, `19-02-PLAN.md`, `19-03-PLAN.md`.

---

## Verification method per disposition

- `mitigate` -> located the declared mitigation pattern in the cited file (`file:symbol`) AND confirmed a DISCRIMINATING test asserts it. Code structure alone was never accepted as evidence.
- `accept` (T-19-16) -> verified the accepted-risk rationale holds in the implemented artifact (dev-only tree, gitignored cache).
- Full FILE-form `node:test` re-run (never the dir form -- host quirk): 70 + 180 + 41 = 291 tests, 0 failures. Working tree clean; `eval/.cache/` gitignored + untracked; no committed AVeriTeC/FEVER/VitaminC/WiCE-NC raw text.

---

## RE-PLAN-12 NET-NEW threats (the offline confound-robust MCC SCREEN)

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-19-32 | Tampering (contrastive-pair artifact) | mitigate | CLOSED | `eval/lz-eval-baseline-guard.mjs:dualBaselineGuard` (L278) -- MECHANICAL dual baseline (lexical TF/bag-of-words L251 + claim-only no-evidence L262). Comparator `AT_CHANCE_MCC = 0` (L43), NOT 0.5 -- the scale-mix guard. `guardPasses = lexicalAtChance && claimOnlyAtChance` (L285). Tests: `lz-eval-baseline-guard.test.mjs` 3 DISCRIMINATING fixtures (at-chance->pass L153; lexical-artifact->fail L170; claim-side/F3-myopia->fail L190) + the scale-mix assertion that a weak lexical artifact has lower CI in (0,0.5) -- the exact band a 0.5 comparator would misread (L203-212). |
| T-19-33 | Repudiation (offline-WORKS overclaim) | mitigate | CLOSED | `eval/lz-eval-contrastive-screen.mjs:runContrastiveScreen` -- `const provisional = true; // ALWAYS` (L244), set on BOTH gate and demote branches. `offline_never_works: true` in the manifest `mcc_screen` (L177) + `screen_decision_rule` (L193). Tests: `provisional===true` asserted on GATE (`lz-eval-contrastive-screen.test.mjs` L207) AND DEMOTE (L222); manifest `offline_never_works` machine-asserted in `lz-eval-aggregate.test.mjs` L1183, L1207. |
| T-19-34 | Repudiation (result-shopping the MCC bar) | mitigate | CLOSED | Bar constants are FROZEN module literals: `MCC_BAR_POINT=0.5` / `MCC_CI_ALPHA=0.05` / `MCC_CI_LOWER_FLOOR=0` (`eval/lz-eval-mcc.mjs` L63-65), NOT corpus-derived. `decideContrastiveScreen` never tunes the bar (`lz-eval-contrastive-screen.mjs` L67-85). The manifest `pre_registered_timestamp: "2026-06-19T16:07:00Z"` (fixture L175) is MACHINE-ASSERTED in `lz-eval-aggregate.test.mjs` L1185-1190: parses ISO-8601 (`Date.parse` finite), rejects the literal placeholder (`!/[<>]/`), STRICTLY in the past (`Date.parse(ts) < Date.now()`). Manifest bar constants asserted byte-equal to module (L1177). Bar legs DISCRIMINATING: `mcc=0.49 -> demote` (L42). |
| T-19-35 | Tampering (asymmetric screen) | mitigate | CLOSED | `runContrastiveScreen` OOF-judges all 24 items through the SINGLE carried `makeBatchedOofProbe` -> `runProbeConsensus` contract (`lz-eval-contrastive-screen.mjs` L191-218); SUPPORTED requires entails=true, REFUTED entails=false -- same strict screen, no asymmetric branch. Test asserts exactly ONE `runProbeConsensus` call path and the carried import (`lz-eval-contrastive-screen.test.mjs` L242-253). Difficulty matched BY CONSTRUCTION (same 12 dense trap bundles -- manifest `contrastive_construction` L156-164). |
| T-19-36 | Repudiation (silent revival/deletion of retired synthetic arm) | mitigate | CLOSED | All four RE-PLAN-9 keys (`control_source` L119, `control_construction` L131, `survival_probe` L142, `control_decision_rule` L153) carry a `superseded_by_replan12` annotation with the body PRESERVED, not deleted; the synthetic source is NOT fetched. `over_refusal_moved_to_live` records the over-refusal CP gate moved to Phase-20 live with `TAU_OR 0.15` + `N_CTRL_FLOOR 24` byte-identical + `engine_struct_unchanged: true` (fixture L196-203). Anti-drift asserts the supersession is recorded for all four keys (`lz-eval-aggregate.test.mjs` L1217-1221) and the engine struct unchanged (L1210-1215). |
| T-19-37 | Tampering (hand-rolled statistical primitive) | mitigate | CLOSED | `eval/lz-eval-mcc.mjs` routes BCa bias-correction + percentile through `jStat.normal.inv` (L316, L347) / `jStat.normal.cdf` (L350); resampling is a seeded mulberry32 index pick only (L201-212), no distribution math. Test asserts the jstat import + usage AND that NO hand-rolled `normalInv/betaInv/incbeta/logGamma/inverseNormalCdf` function or const is defined (`lz-eval-mcc.test.mjs` L232-244, DISCRIMINATING). D-07 honored. |

---

## CARRIED threats (verified still mitigated, not re-touched)

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-19-01 | Tampering (source key -> filename) | mitigate | CLOSED | SHA-256-hex `sourceFilename` (no path separators); `sourceFilename` test asserts `^[0-9a-f]{64}\.json$` (`19-01-SUMMARY.md`; aggregator `safeId`). |
| T-19-02 / T-19-13 | Info Disclosure (date-cutoff leak) | mitigate | CLOSED | Fail-closed strict-`<` `dateFilter` / `parseAvtDate` in `eval/lz-eval-trap-assembler.mjs`; undated OR `>= claimDate` dropped; the contrastive-pair evidence is the carried date-filtered dense bundle. Boundary + undated-drop tests green in the carried suite. |
| T-19-03 | Tampering (readJson) | mitigate | CLOSED | Fail-closed `readJson` (ContractError, never bare `JSON.parse`); carried, untouched. |
| T-19-04 | Elevation of Privilege (cross-tree import) | mitigate | CLOSED | Import is strictly eval -> runtime (one-directional). `eval/lz-eval-packaging-boundary.test.mjs` L34-54 asserts NO `package.json`/`node_modules` under `plugins/lz-advisor/`; green (2/2). |
| T-19-05 | Elevation of Privilege (worker tools grant) | mitigate | CLOSED | Least privilege: `research-search-worker.md` `tools: ["WebSearch", "Write"]` (L38); `research-extract-worker.md` `tools: ["WebFetch", "Write"]` (L35). No Read/Bash/over-broad grant. Both `model: sonnet`, `maxTurns: 6`, `effort: medium`. |
| T-19-06 | Info Disclosure (receipt/excerpt) | mitigate | CLOSED | One-line counts-only receipt; raw source text stays in `excerpts/<id>.txt` on disk; main session never holds it. Receipt-format assertion (`19-02-SUMMARY.md`). |
| T-19-07 | Tampering (worker filename) | mitigate | CLOSED | SHA-256-hex filename (no separators); aggregator read-time `safeId` rejects unsafe content-derived ids; round-trip fixture uses real hex. |
| T-19-08 | Spoofing (source-key identity) | mitigate | CLOSED | Schema requires `claims[].source === sources record id`; round-trip test asserts equality. |
| T-19-09 | Tampering (corpus integrity) | mitigate | CLOSED | `verifySha256` fail-closed + per-file sha256 pinned in the manifest (fixture `sources[].files[].sha256`); tampered-buffer + drift-gate recompute tests. |
| T-19-10 | Compliance (mutated CC-BY-NC text) | mitigate | CLOSED | Mutated AVeriTeC text -> gitignored `eval/.cache/` ONLY (`.gitignore` L12); committed manifest is recipe-not-text; no `text` field on AVeriTeC rows; `git ls-files` confirms NO raw corpus committed. |
| T-19-11 | Info Disclosure (date-cutoff leak in recipe) | mitigate | CLOSED | Recipe excludes fact-check / cached-claim-url; classifies only via the fail-closed dateFilter; carried. |
| T-19-12 / T-19-15 | Repudiation (result-shopping the gate / re-pre-registration) | mitigate | CLOSED | Lock rule re-registered in the still-open zero-votes window BEFORE any vote; anti-drift asserts prose == `EVAL_THRESHOLDS` byte-for-byte (`lz-eval-aggregate.test.mjs` L208-237, L661-696); RE-PLAN-12 is ADDITIVE (MCC bar fixed + TIMESTAMPED before any spend); no TAU/floor relaxed (over-refusal CP gate moved to live, FROZEN). |
| T-19-19 | Spoofing (measurement validity) | mitigate | CLOSED | `toScoredVote` takes `vote.verdict` from the MODEL free-text return, NEVER searchAndStop's flag-enum; `lz-eval-voter-dispatch.workflow.harness.test.mjs` L168-177 asserts the model's 'refuted' persists even when searchAndStop's mechanical enum says 'insufficient'/'refuted-default' (DISCRIMINATING); `parseVoteVerdict` rejects the flag enum (L162-163). |
| T-19-20 | Tampering (always-refute confound) | mitigate | CLOSED | RE-CRACKED structurally by MCC: `matthewsCorrelation` returns 0 (NOT NaN) on a degenerate single-class confusion matrix (`eval/lz-eval-mcc.mjs` L99-101, F4) over the difficulty-matched contrastive pairs; over-refusal arm moved to the live stage. |
| T-19-21 | Tampering (in-family-gold bias) | mitigate | CLOSED | Gold is OUT-OF-FAMILY-decided: `FROZEN_PAIR = ['gpt-5.5', 'gemini-3.1-pro-preview']` (`lz-eval-contrastive-screen.mjs` L55); contrastive pairs authored on family-independent dense trap bundles + OOF-judged. Manifest `out_of_family_only_retain` carried byte-identical. |
| T-19-22 | Tampering (artifact-selection / style bypass) | mitigate | CLOSED | F5 subject-difficulty floor + covariate-overlap check (carried `certifyModel`); RE-PLAN-12 difficulty-matches by construction (same bundle) + the dual-baseline guard catches a lexical/style bypass (see T-19-32). |
| T-19-25 | Tampering (batching contamination) | mitigate | CLOSED | DP1-DP4 in `eval/lz-eval-oof-batch.mjs`: `<=8`/call (hard near-boundary `<=6`), opaque non-ordinal ids, order reshuffled with recorded seed, `runContaminationGate` `>=11/12` single-vs-batched per model with a reversed-order variant, DP3 fail-closed-to-drop. Test L291-314 asserts 12/12 + 11/12 pass, 10/12 -> batch-5 directive (DISCRIMINATING). Adapter reused unchanged for the contrastive items. |
| T-19-SC | Tampering (npm/pip/cargo installs) | mitigate | CLOSED | `eval/package.json` devDependencies = `{ "jstat": "1.9.6" }` ONLY (pre-approved Phase 18-02). No new packages. The plugin tree stays zero-dep (T-19-04 boundary test). |

---

## Accepted risk (disposition: accept)

| Threat ID | Category | Disposition | Rationale (verified) |
|-----------|----------|-------------|----------------------|
| T-19-16 | Denial of Service / cost (OOF screen + contrastive judging exhaust the capped pool / AI Credits) | accept | The eval is DEV-ONLY and never ships; the contrastive screen is a SMALL OOF spend (24 items, batched) + resumable; the dual-baseline guard is NO-SPEND and runs FIRST. RE-PLAN-12 REPLACED the larger synthetic-arm survival probe + gold rebuild + three-voter spend with one small contrastive-screen spend. Verified: the costly synthetic machinery is recorded superseded + NOT run (manifest `superseded_by_replan12` annotations); the offline single-spend is gated behind a NO-SPEND mechanical guard. Budget across reset windows. Accepted -- no production exposure. |

---

## Unregistered flags (new attack surface with no threat mapping)

NONE. No `## Threat Flags` section in any `19-0x-SUMMARY.md`; the SUMMARY threat-coverage sections (19-01 `## Threat Model Adherence`, 19-02 `## Threat Model Coverage`) map every surface back to a registered T-19 id. The RE-PLAN-12 modules introduce no new external interface beyond the pre-approved `jstat` quantile dependency (T-19-SC).

---

## Frozen-primitive integrity check (no regression)

Confirmed UNCHANGED and byte-identical (asserted by the carried + RE-PLAN-12 anti-drift tests, all green): `EVAL_THRESHOLDS` numbers incl. `TAU_OR=0.15` / `N_CTRL_FLOOR=24`, `clopperPearsonUpperOneSided`, `URL_DATE_RULE`, the OOF gold-decider identity (`gpt-5.5` + `gemini-3.1-pro-preview`, `--effort high`), the all-agree rule, gold-blindness, the HEALTHY trap / false-uphold arm, the contamination gate. No edit was made to any frozen primitive or any pre-registered number.

## Test re-run (FILE-form node:test, host quirk respected)

- `lz-eval-mcc` + `lz-eval-baseline-guard` + `lz-eval-contrastive-screen` + `lz-eval-aggregate`: 70 pass / 0 fail.
- carried regression (`offline-read`, `trap-assembler`, `wice-traps`, `voter-dispatch.workflow.harness`, `dataset`, `oof-batch`, `worker-contract`, `packaging-boundary`): 180 pass / 0 fail.
- plugin-tree aggregator (`lz-deep-research-aggregate.test.mjs`): 41 pass / 0 fail.
- Working tree clean; `eval/.cache/` gitignored + untracked; no committed NC/CC corpus text.
