---
phase: 18
slug: haiku-prompt-engineering-deep-research-verify-voter-early-ga
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-16
---

# Phase 18 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

Register origin: `register_authored_at_plan_time: true` (all 5 PLAN files carried a parseable `<threat_model>` block). The gsd-security-auditor (Opus) verified each planned mitigation EXISTS in committed code rather than scanning for new threats.

Phase outcome context: the phase goal (settle-or-raise the Haiku-first flag) was achieved via the EVAL-03 **RAISE** branch — the decisive Haiku-vs-Sonnet gating run VOIDed via saturation and the DEFINITIVE eval (EVAL-01/02/04) relocated to Phase 19. The security-relevant INFRASTRUCTURE was nonetheless built and committed; this audit verifies that infrastructure. The three live-run-specific threats (T-18-LEAK2, T-18-FUSILENT, the live-run clause of T-18-TOKENLEAK2) are closed on their STRUCTURAL mitigation; the decisive execution they ultimately guard is a Phase-19 concern.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| research sources -> shipped reference doc | A stale/hallucinated technique baked into the EVAL-05 artifact would propagate to the Haiku voter prompt and silently degrade eval fairness | Prompt-engineering technique claims (public prose) |
| npm registry -> eval/ install surface | An untrusted/typosquatted/tampered package could execute install scripts or ship malicious code into dev tooling | Dev dependency bytes (jstat@1.9.6) |
| eval/ dev tooling -> shipped marketplace plugin (D-11) | A dev dependency must NEVER leak into the distributed plugin package | Module imports / package files |
| live voter output files -> eval aggregator | The aggregator parses vote JSON written by model calls; malformed/oversized input must fail closed | Vote JSON (untrusted shape) |
| HuggingFace CDN -> eval/.cache/ | Downloaded corpus JSONL is UNTRUSTED until sha256-verified against the pinned manifest | Dataset JSONL (untrusted until hashed) |
| HF_TOKEN secret -> loader | The gated-dataset token must be read at eval time and never logged or committed | Bearer secret |
| crafted example uid -> cache filename | A content-derived basename could attempt path traversal | Filesystem path component |
| open-book voter -> retrieved corpus | A leaked fact-check verdict in the retrieval set would contaminate the open-book false-uphold number | Retrieved evidence (eval validity) |
| voter agents -> shipped plugin package | The agents ship; they must be strictly zero-dep (no eval/ import) or the D-11 boundary breaks | Agent prompt files |
| eval verdict -> Haiku-first flag | A post-hoc rationalized verdict would defeat the pre-registered gate | Gating decision |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-18-01 | Tampering (info integrity) | EVAL-05 reference technique claims | mitigate | `[CITED:]` verified-source tag on every load-bearing technique; `[ASSUMED]` preserved verbatim. Verified: 14 `[CITED:` + 8 `[ASSUMED]` tags in `references/lz-haiku-prompt-engineering.md`; D-08 framing L9-37 | closed |
| T-18-02 | Information Disclosure | the shipped reference doc | accept | Pure-prose public reference; no secrets/tokens/PII; ships with the OSS plugin by design. See Accepted Risks Log | closed |
| T-18-SC | Tampering / Elevation | first `npm install jstat@1.9.6` | mitigate | Exact pin (`eval/package.json:9`, no caret/tilde) + committed lockfile (`package-lock.json:16-19`, registry.npmjs.org + sha512 integrity + `dev:true`) + BLOCKING human-verify checkpoint (18-02-SUMMARY:98, commit f918e66, 6/6 checks PASS, MIT LICENSE, no install scripts) | closed |
| T-18-DEPLEAK | Elevation (user-side) | the marketplace plugin package | mitigate | D-11 boundary: eval/ outside plugins/. `lz-eval-packaging-boundary.test.mjs:34-70` (no package.json/node_modules under plugin tree) + `:72-122` (no runtime->eval import); gated in CI on every push/PR (`ci.yml:38-43`, `test-act.yml:12-15,25-28`) | closed |
| T-18-LOCKDRIFT | Tampering | the pinned dependency tree | mitigate | `package-lock.json` committed (lockfileVersion 3); `.gitignore:14` `/eval/node_modules/`; CI restores via `npm ci \|\| npm install` (`ci.yml:37`) | closed |
| T-18-PARSE | Denial of Service | eval aggregator JSON parse of vote files | mitigate | `lz-eval-aggregate.mjs:149-163` readJson via imported `ContractError`+`stripBom`; sole `JSON.parse` (L159) inside try/catch; fail closed naming the file | closed |
| T-18-TRAVERSE | Tampering | content-derived basenames (vote/claim ids) | mitigate | `lz-eval-aggregate.mjs:201` content-derived id routed through imported `safeId`; test `:254-275` proves `../evil` rejected | closed |
| T-18-MATHTRUST | Tampering (result integrity) | the Clopper-Pearson upper bound | mitigate | `lz-eval-aggregate.mjs:91-129` jstat-only CP/Wilson/comb; NO hand-rolled logGamma/incbeta/betaInv (grep-absent); anchors pinned (CP(0,15)~=0.218, beta.inv(0.2,3,3)~=0.327, comb(15,3)=455 at `lz-eval-aggregate.test.mjs:59-117`) | closed |
| T-18-DEPLEAK2 | Elevation (user-side) | the one-directional cross-tree import | mitigate | `lz-eval-aggregate.mjs:39-44` one-directional eval->runtime import; packaging-boundary test `:72-122` asserts no reverse import | closed |
| T-18-DATATAMPER | Tampering | the fetched dataset file | mitigate | `lz-eval-dataset.mjs:63` pinned WiCE revision; `verifySha256:96-108` fail-closed; offline drift gate (`lz-eval-dataset.test.mjs:291-356`) recomputes sha256 over vendored WiCE + discriminating tampered-byte assertion | closed |
| T-18-TOKENLEAK | Information Disclosure | HF_TOKEN | mitigate | `lz-eval-dataset.mjs:117-166` token read from env/HF_TOKEN_PATH/HF_HOME; returned, never logged (console L374/380 emit only counts/error msg); `.gitignore:12` `/eval/.cache/` | closed |
| T-18-PATHTRAV | Tampering | content-derived cache basenames | mitigate | `lz-eval-dataset.mjs:316-321` cacheSlug -> imported `safeId`; `fetchDataset:332-333` path.join on the guarded slug | closed |
| T-18-MALFORMED | Denial of Service | loader parse of downloaded JSONL | mitigate | `lz-eval-dataset.mjs:174-188` fail-closed readJson; `loadManifest:195-237` shape validation; tests `:184-214` fail-closed on malformed/bad-shape input | closed |
| T-18-LICENSE | Compliance (info disclosure of encumbered text) | committed artifacts | mitigate | `wice-vendored/NOTICE` (ODC-BY/MIT, EMNLP 2023 citation); AVeriTeC/LLM-AggreFact manifest-only (`lz-eval-manifest.json:3`); cache gitignored (`.gitignore:12`); no encumbered corpus text committed | closed |
| T-18-LEAK | eval validity | open-book retrieval | mitigate | D-05 encoded in manifest book/stratum tagging (64 `closed` + 6 `open`; subtle/open-book strata L9-24); KS + date-cutoff in the open-book stratum note | closed |
| T-18-LEAK2 | eval validity (live run) | open-book retrieval in the live run | mitigate | STRUCTURAL: same manifest tagging + closed-book control arm (`book:closed` rows) built. Decisive live run relocated to Phase 19 | closed (structural) |
| T-18-FUSILENT | verification safety | silent unanimous false-uphold | mitigate | STRUCTURAL: aggregator computes per-stratum false-uphold + Haiku-minus-Sonnet DELTA (`lz-eval-aggregate.mjs:181-232`); lock rule `lz-eval-lock-rule.md:42-55` encodes the un-weakened DELTA-upper gate (NOT "majority correct"). Definitive run = Phase 19 | closed (structural) |
| T-18-POSTHOC | Repudiation | the eval verdict | mitigate | `lz-eval-lock-rule.md` committed before any model call (f497c5a); `lockRuleVerdict:248-258` mechanical PASS/FAIL-RAISE; raise-to-user on non-viable | closed |
| T-18-TOKENLEAK2 | Information Disclosure (live run) | HF_TOKEN in the live run | mitigate | STRUCTURAL: token read at runtime via `resolveHfToken`, never echoed; cache gitignored (`.gitignore:12`). Live run = Phase 19 | closed (structural) |
| T-18-DEPLEAK3 | Elevation (user-side) | the shipped voter agents | mitigate | `git grep "eval/"` in both voter agents returns NONE; agents zero-dep; packaging-boundary test backstops | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-18-01 | T-18-02 | `plugins/lz-advisor/references/lz-haiku-prompt-engineering.md` is a pure-prose public reference that ships with the open-source plugin by design. It contains no secrets, tokens, or PII (verified: content is `[CITED:]`/`[ASSUMED]`-tagged prompt-engineering prose only). Accepted by design; no mitigation required. ASVS L1 | Lars Gyrup Brink Nielsen | 2026-06-16 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-16 | 20 | 20 | 0 | gsd-security-auditor (Opus) |

Verdict: **SECURED** — all 20 declared mitigations (19 mitigate + 1 accept) present in committed code; no threats open at or above the HIGH block-severity threshold. No unregistered attack surface introduced beyond the registered eval/ tree (18-02-SUMMARY Threat Flags: none; 18-05-SUMMARY deviations are eval-methodology / Phase-19 fix-inputs, not new threat surface).

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-16
