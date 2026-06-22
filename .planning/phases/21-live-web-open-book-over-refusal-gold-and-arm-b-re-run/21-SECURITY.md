---
phase: 21
slug: live-web-open-book-over-refusal-gold-and-arm-b-re-run
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-22
---

# Phase 21 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> Plan-time-authored register (`register_authored_at_plan_time: true`); this audit VERIFIES each
> declared mitigation exists in the implemented code. Implementation files were NOT modified.
> Realized phase outcome is `VOID-on-power-RAISE` (a valid pre-registered statistical outcome);
> this document audits the SECURITY mitigations, not the statistical verdict.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| open-book gold JSON -> rescore | metered OOF gold labels cross into the certification arithmetic; the frozen N must not be silently grown/shrunk | per-uid binary label (`validity[uid].binary`) |
| content-derived uid / excerpt-id -> file path | uids/excerpt-ids from disk used as path/map keys | confirmed_uid (`<topic>::<cluster>`), excerpt_id, canonical source key |
| live-web (untrusted) -> WebFetch -> stored excerpt -> snapshot | adversarial page text becomes evidence the OOF later judges | retrieved page text, canonical URL, quote, fetched_at |
| logged URL -> meta-source blocklist | a meta-source (own fact-check / leaderboard / dataset) must not leak a copied verdict into the gold | logged canonical URLs |
| LZ_SPEND gate -> Copilot subprocess | the ONLY metered-spend boundary; an unauthorized/uncapped dispatch would spend AI Credits | OOF prompt (gold-blind), Copilot CLI invocation |
| pre-registration commit -> spend | the freeze MUST precede any scored vote (anti-result-shopping) | lock-rule doc + snapshot sha256 pin |
| credit capture -> disclosure | a 0/null credit reading must not be reported as free | per-call AI-Credits values |
| eval tree -> shipped plugin | eval may IMPORT the shipped aggregator (safeId/ContractError); the runtime must NEVER import eval | `safeId` / `ContractError` (one-directional) |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-21-01 | Tampering (integrity) | rescore validN denominator | mitigate | Frozen-N fail-closed on grown/shrunk arm: `openbook-rescore.mjs:121-140` (`goldByUid.size !== confirmedSet.size` throws; missing/extra uid throws); `sampleUids = all 30` so `validN = supportedInSample` (`:148-154`) | closed |
| T-21-02 | Tampering (path) | content-derived uid as map/path key | mitigate | `VOTE_DIR` is a FIXED constant (`openbook-rescore.mjs:30`); uids are opaque Map keys read from `trace.uid` (`:54,66`); NO path built from a content-derived uid; `safeId` correctly NOT imported here | closed |
| T-21-03 | Elevation | eval -> runtime import boundary | mitigate | One-directional: `git grep` for any real `import`/`require` of eval under `plugins/` returns NONE (the single match is a documentary comment at `lz-deep-research-aggregate.mjs:138`, not an import); eval is gitignored, never ships | closed |
| T-21-04 | Tampering / Info disclosure | meta-source blocklist (bypass / coverage) | mitigate | Deterministic node filter `isMetaSource`/`filterMetaSources` (`openbook-lib.mjs:77-113`) is the load-bearing gate; APPLIED in `applyBlocklist` (`openbook-retrieval-log.mjs:257-272`) invoked by `buildEvidenceSnapshot` BEFORE freeze (`:326`); empirically 0 blocklisted URLs over all 159 evidence items in the frozen snapshot | closed |
| T-21-05 | Tampering (path) | crafted uid/excerpt-id traversal | mitigate | Imported shipped `safeId`/`ContractError` (`openbook-retrieval-log.mjs:27-30`) applied two-stage on RAW uid (`:192`), encoded uid (`:196`), source key (`:114`), excerpt_id (`:145`) BEFORE any path use; throws ContractError on traversal | closed |
| T-21-06 | Tampering (SSRF surface) | live-web retrieval evidence stored verbatim | mitigate | Builder/rescore perform NO network I/O (fetch was Plan-04 session WebFetch, off-node); source-scan of `openbook-retrieval-log.mjs` shows 0 network/spawn primitives; evidence frozen-then-read-only; OOF judges gold-blind | closed |
| T-21-07 | Info disclosure | OOF/retrieval artifacts on a tracked path | mitigate | `openbook-evidence.json` + all p21 artifacts under gitignored `eval/.cache/p21-live/` (`git check-ignore` confirms) | closed |
| T-21-08 | Elevation | eval -> runtime import boundary | mitigate | Same one-directional boundary as T-21-03; `openbook-retrieval-log.mjs` + `openbook-normalize-claims.mjs` IMPORT the shipped aggregator's safeId (`:30` / `:39`), never the reverse | closed |
| T-21-09 | Elevation (cost) | unauthorized/runaway Copilot spend | mitigate | `requireSpend('callOof')` inside the frozen `makeCopilotCallModel` (imported `openbook-oof-gold.mjs:43`); `isCliEntry` dispatch guard (`:365`); `LZ_SAMPLE` cap read (`:326`) + applied in `selectCandidates` (`:328`) BEFORE `recordToCandidate`/dispatch | closed |
| T-21-10 | Info disclosure | OOF transcripts/credits on a tracked path | mitigate | `oof-verdicts-openbook` + `openbook-gold-result.json` + `openbook-gold-credits.json` gitignored (`git check-ignore` confirms) | closed |
| T-21-11 | Tampering | gold leakage (copied verdict reaches OOF) | mitigate | Candidate shape is `{ uid, claim, evidence:[{sentence}] }` only (`openbook-oof-gold.mjs:144-179`); `recordToCandidate` emits NEVER a URL / gold label / voter verdict / disputed flag; `expectedEntailment:'true'` gold-blind | closed |
| T-21-12 | Repudiation | 0-credit reading misread as free | mitigate | `buildCreditsRecord` returns `totalCredits: null` when unmeasured, never 0 (`oof-transport-lib.mjs:134`); ANSI-strip `parseCredits` (`:57`); `openbook-oof-gold.mjs:356` reports UNMEASURED-not-zero | closed |
| T-21-13 | Elevation | eval -> runtime import boundary | mitigate | Same one-directional boundary (T-21-03); `openbook-oof-gold.mjs` imports the frozen eval seams within the eval tree only; no plugin-tree file imports eval | closed |
| T-21-14 | Tampering / Info disclosure (SSRF) | live-web retrieval evidence stored verbatim | mitigate | Plan-04 retrieval used the WebFetch worker contract (off-node session); downstream node blocklist drops meta sources (T-21-04); evidence frozen-then-read-only; OOF gold-blind | closed |
| T-21-15 | Tampering | meta-source blocklist bypass at the live boundary | mitigate | Belt-and-suspenders: search-worker prompt avoidance (best-effort, Plan 04) PLUS the load-bearing node filter re-run over the real snapshot; 0 blocklisted URLs in the frozen 159-item snapshot (verified) | closed |
| T-21-16 | Tampering (integrity) | result-shopping / optional stopping | mitigate | Lock-rule freezes N + snapshot sha256 + estimator BEFORE any scored vote; commit `59f8d4b` (2026-06-22 09:21) PRECEDES the metered-run commit `fe19746`; snapshot sha256 `9faee64a...` matches the lock-rule pin exactly; zero-votes window clean | closed |
| T-21-17 | Info disclosure | retrieval/review artifacts on a tracked path | mitigate | `.lz-research/p21-openbook` + `eval/.cache/p21-live/*` gitignored; only the lock-rule + cert docs (no secrets) tracked under `.planning/` (`git ls-files` / `git check-ignore` confirm) | closed |
| T-21-18 | Elevation | eval -> runtime import boundary | mitigate | Plan-04 adversarial review (`review-openbook-nospend.md`) asserted it; re-verified here: no plugin-tree file imports eval (one-directional) | closed |
| T-21-19 | Elevation (cost) | unauthorized/runaway Copilot spend | mitigate | `requireSpend('callOof')` + `isCliEntry` (`openbook-oof-gold.mjs:43,365`); spend was a human-authorized BLOCKING checkpoint (`21-05-PLAN.md autonomous:false`); 1-2 item pre-flight spike bounded by the `LZ_SAMPLE` cap; HALT+RAISE on over-estimate; batched + cache-reuse minimized credits | closed |
| T-21-20 | Tampering (integrity) | result-shopping / moving snapshot / TAU relax | mitigate | OOF judged the pinned frozen snapshot (sha256 verified, not re-frozen); denominator is the frozen 30 (rescore fails closed, T-21-01); `TAU_OR` read from `decideScopedSensitivity` (`openbook-rescore.mjs:181`), never relaxed (verified 0.15 in result); arms never pooled; one pass | closed |
| T-21-21 | Repudiation | AI-Credits reading misread as free | mitigate | `buildCreditsRecord` null=UNMEASURED (`oof-transport-lib.mjs:134`); `gold-credits.json` shows 8/8 captured, 59.58; cert discloses 75.30 total (15.72 spike + 59.58 full-N) + says verify the dashboard (M-1) | closed |
| T-21-22 | Info disclosure | OOF transcripts/credits on a tracked path | mitigate | gold result + verdicts cache + credits gitignored under `eval/.cache/p21-live/`; only the cert doc (no secrets) tracked (`git check-ignore` confirms) | closed |
| T-21-23 | Elevation | eval -> runtime import boundary | mitigate | All drivers gitignored under `eval/.cache/p21-live/`; no plugin-tree file imports eval (one-directional, verified); eval never ships | closed |
| T-21-SC | Tampering (supply chain) | npm/pip/cargo installs | mitigate | No package manifest/lockfile touched in the phase span (`327b69f..HEAD` empty); the only eval devDep `jstat@1.9.6` predates this phase (added Phase 18-02, 2026-06-16); metered surface is the pre-vetted Copilot CLI transport, not a package install; zero new deps | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|

No accepted risks. All 24 declared threats verified CLOSED with code-located or commit/ignore-state evidence.

---

## New / Net-New Attack Surface (informational)

No SUMMARY declared a `## Threat Flags` section (`git grep` returned none across all five SUMMARYs), so there is
no executor-flagged unregistered attack surface to map. One NET-NEW implementation file appeared during
execution and is fully covered by the plan-time register:

- `eval/.cache/p21-live/openbook-normalize-claims.mjs` (Plan 04, net-new per `21-04-SUMMARY.md`): bridges the
  retrieval worker output to the frozen builder contract. It builds `claims/<encoded-uid>.json` paths from
  confirmed_uids and applies the SAME two-stage `safeId` path-safety as the builder (`:160-162`), imports
  `safeId`/`ContractError` from the shipped aggregator one-directionally (`:36-39`), is `isCliEntry`-guarded
  (`:232`), and carries no network/spawn primitive (source-scan = 0). Covered by T-21-05 (path-safety) and
  T-21-08 (import boundary). NOT a BLOCKER, NOT an unregistered flag.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-22 | 24 | 24 | 0 | gsd-security-auditor |

Evidence highlights (FORCE-stance verification, not documentation acceptance):
- Frozen primitives byte-identical: `git diff --quiet eval/lz-eval-*.mjs` + the shipped aggregator = CLEAN.
- Meta-source blocklist held empirically: 0 blocklisted URLs over all 159 evidence items in the frozen snapshot.
- Snapshot sha256 `9faee64a...` matches the lock-rule pin; lock-rule commit `59f8d4b` precedes the spend commit `fe19746`.
- eval->runtime import boundary one-directional: zero real imports of eval from `plugins/`.
- Credits honest: `buildCreditsRecord` null=UNMEASURED-not-zero; 8/8 captured; 75.30 disclosed.
- Zero new deps: no manifest/lockfile touched in the phase span.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer) — all 24 are `mitigate`
- [x] Accepted risks documented in Accepted Risks Log — none
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-22
