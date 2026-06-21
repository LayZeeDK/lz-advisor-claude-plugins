---
phase: 20
slug: orchestrator-skill-headless-scale-confirmation
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-21
---

# Phase 20 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> Register authored at plan time (all 7 PLANs 20-01..20-07 carry a `<threat_model>` block); this audit VERIFIED each declared mitigation exists in the implementation (no new-threat scan). Read-only audit -- no implementation file modified.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Fetched web content -> worker | Untrusted source text enters extract/search workers | Public web text (treated as untrusted; never sets control flow) |
| Worker -> run dir (`.lz-research/<run-id>/`) | Least-privilege Write of immutable worker files, excerpts, votes | Public source text + JSON records (gitignored, no secrets) |
| Run dir -> deterministic aggregator | Off-model Node script decides claim survival/escalation | Worker-authored JSON, ids basename-guarded by `safeId` |
| Orchestrator -> Opus advisor (x2 gates) | Read-only consult over bounded curated JSON | Ranking cut-line + final synthesis JSON only |
| eval/ tree -> runtime (one-directional) | Dev-only eval imports shipped aggregator helpers; runtime never imports eval | `ContractError`/`safeId`/`listJson` (eval -> runtime only) |
| Live-cert / OOF spend stages | Metered model + Copilot AI Credits spend | Gated behind `LZ_SPEND=1` + a blocking human checkpoint |

---

## Threat Register

### Shipped surface (full severity -- distributed in the marketplace plugin)

| Threat ID | Category | Component | Disposition | Mitigation (verified) | Status |
|-----------|----------|-----------|-------------|------------------------|--------|
| T-20-01 | Tampering | escalate audit-sample id keying | mitigate | `stableHashFraction(cl.id)` hashes only the aggregator-generated `'cluster'+N` id (`aggregate.mjs:141-150,351,710`); content-derived ids stay behind `safeId` (`:178-192,302,396,441`) | closed |
| T-20-02 | Spoofing | worker `load_bearing` flag | accept | Fail-OPEN: only ADDS a re-vote, never removes a verdict; audit branch (c) fires independently in the same `escalate` UNION (`aggregate.mjs:341-343,707-710`) | closed |
| T-20-03 | Repudiation (integrity) | audit-sample reproducibility | mitigate | Stable FNV-1a hash, no `Math.random` (`aggregate.mjs:141-150`; `git grep "Math.random"` empty); byte-identical escalate flags asserted (20-01-SUMMARY) | closed |
| T-20-04 | Tampering | code/schema/worker drift | mitigate | Additive `escalate` field on the frozen survivor record mirrored into schema + extract-worker prompt in one lockstep wave; worker-contract SSOT test (`eval/lz-eval-worker-contract.test.mjs`) | closed |
| T-20-09 | Tampering (prompt injection) | fetched content steering a worker | mitigate | Workers extract only falsifiable claims bound to verbatim quotes (`research-extract-worker.md:104-153`); off-model quote-recheck drops fabricated quotes upstream of voting (`aggregate.mjs:426-503`); only the deterministic aggregator decides survival | closed |
| T-20-10 | Elevation of privilege | Bash/Write escaping the run dir | mitigate | SKILL `allowed-tools` Bash limited to `Bash(git:*), Bash(node:*)` (`SKILL.md:19`); workers carry least-privilege Write only and OMIT `Agent`; `safeId` basename-guards every worker id | closed |
| T-20-11 | Information disclosure | secrets in the run dir | mitigate | Run dir holds only public text + counts + JSON; `.lz-research/` gitignored (`.gitignore:20`); no credential written to disk | closed |
| T-20-12 | DoS | over-fan-out disk-I/O storm | mitigate | `<=5`-in-flight foreground cap (`SKILL.md:63-66,202-204`); `ANGLES=5 / MAX_FETCH=15` before spawn; aggregator fail-closes above its raw-claims ceiling, exit 2 (`aggregate.mjs:274-281,325-332`) | closed |
| T-20-13 | Repudiation (cost integrity) | hidden 3rd Opus / cloud fallback | mitigate | Exactly two Opus consults (`SKILL.md:54-55`); never spawns `research-verify-voter-opus`; no Bedrock/Vertex/Foundry branch (grep empty); SC-5 trace asserts `advisorSpawns === 2` | closed |
| T-20-28 | Tampering (correctness) | degenerate-aggregate resume trap | mitigate | report.md absent -> ALWAYS re-run stage-2, gated by `run_state.json{stage2_complete:true}`, never inferred from survivors confidence (`SKILL.md:114-125,304-318`) | closed |
| T-20-29 | Repudiation (integrity) | decompose/run_state record drift | mitigate | Records identical across SKILL.md + schema + orchestration reference (anti-drift lockstep, `SKILL.md:177-184,303-306`) | closed |
| T-20-30 | Tampering (scope creep) | aggregator edit sneaks in | mitigate | ZERO aggregator changes by 20-07 (SKILL counts votes itself, `SKILL.md:316-317`); `git log` confirms aggregator untouched since 20-01 | closed |
| T-20-31 | Information disclosure | resumed run-dir committed | mitigate | `.lz-research/` + `eval/.cache/` gitignored; only SKILL.md + references + gitignored eval fixture committed (no run data) | closed |

### Dev / eval-tree surface (dev-time severity -- `eval/` is gitignored, never shipped)

| Threat ID | Category | Component | Disposition | Mitigation (verified) | Status |
|-----------|----------|-----------|-------------|------------------------|--------|
| T-20-05 / T-20-18 / T-20-27 | DoS (spend) | unintended model/Credits spend | mitigate | `requireSpend()` throws unless `LZ_SPEND==='1'` (`live-cert.mjs:121-130`), called first in every spend stage (`:445,661,683`, armA-native `:53`, contrastive-authoring `:333`); dry-run/test suites run stubs only | closed |
| T-20-06 / T-20-19 / T-20-24 | Repudiation (result-shopping) | add-until-pass / relaxed TAU / pooled arms | mitigate | Pre-registered lock rule frozen before scoring (`freezeArms`, `stage1FreezeGold`); N + bar constants frozen; optional stopping forbidden; arms never pooled (disjoint-uid guard); prose thresholds == `EVAL_THRESHOLDS` byte-for-byte | closed |
| T-20-07 / T-20-20 | Information disclosure | OOF transcripts/secrets on tracked path | mitigate | Transcripts/caches in gitignored `eval/.cache/`; no secret on a tracked path | closed |
| T-20-08 / T-20-21 | Tampering (validity) | same-family / coerced-binary adjudicator | mitigate | Frozen OUT-OF-FAMILY all-agree pair primary (`FROZEN_OOF_PAIR`); Guerdan response-set exclusion routes multi-defensible items to the maintainer, never coerces a binary (`classifyAdjudicationResidue`) | closed |
| T-20-14 | Spoofing (validity) | SC-5 acceptance faked/subjective | mitigate | Acceptance parsed mechanically from the trace (`sc5-trace.mjs:255-266`); 1 passing + 4 single-criterion discriminating failing fixtures | closed |
| T-20-15 | Elevation of privilege | auto-mode Write/aggregator escape | mitigate | `--permission-mode auto` classifier-gated; least-privilege Write; command-prefix-filtered node Bash; SC-5 asserted zero worker Write failures | closed |
| T-20-16 | Information disclosure | captured trace commits secrets | mitigate | Trace in gitignored `eval/.cache/p20-sc5/`; run dir gitignored; `git status` clean of trace artifacts | closed |
| T-20-17 | DoS (cost) | SC-5 spike spends budget | accept | Deliberate, human-budgeted build-time spend; `<=5` cap bounds fan-out | closed |
| T-20-22 / T-20-26 | Spoofing (over-confidence / telemetry-as-gate) | WORKS read as green-light; probe read as cert | mitigate | `decisionMatrix.raiseToUser: true` hardcoded; Haiku flip DEFERRED regardless (D-06); 10-pair probe scored voter RUN-but-NOT-GATED | closed |
| T-20-23 / T-20-25 | Tampering (validity / pooling) | lexical/difficulty artifact; arms pooled | mitigate | Construct-validity gate present: `lexicalOverlapAuc` + `oneSidedNotEasierGuard` SMD; arms never pooled into one N (`freezeArms` disjoint guard) | closed |
| T-20-SC (every plan) | Tampering (supply chain) | npm/pip/cargo installs | mitigate | No plugin `package.json` (zero-dep plugin tree); `eval/` sole devDependency `jstat@1.9.6` pinned + unchanged (lockfile matches); no new dependency added | closed |

*Status: open . closed*
*Disposition: mitigate (implementation required) . accept (documented risk) . transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-20-01 | T-20-02 | `load_bearing` is a worker-set flag but is fail-OPEN: it only ADDS a re-vote, never removes/weakens a verdict, and the unanimous-uphold audit branch (c) fires independently. Worst-case abuse is bounded extra escalation cost, capped by the same `escalate` UNION and `MAX_VERIFY_CLAIMS`. | Lars Gyrup Brink Nielsen | 2026-06-21 |
| AR-20-02 | T-20-17 | The SC-5 headless-scale spike is a deliberate, human-budgeted build-time spend (RESEARCH Risk 6); the `<=5` in-flight cap bounds fan-out; it is a scheduled spend, not unbounded. | Lars Gyrup Brink Nielsen | 2026-06-21 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-21 | 31 | 31 | 0 | gsd-security-auditor (opus), verify-mitigations mode |

Notes:
- Read-only audit; no implementation file modified.
- One-directional `eval -> runtime` import boundary intact (no runtime file imports from `eval/`), so no eval dependency can leak into the marketplace package.
- Shipped fail-closed disciplines present and exercised (ContractError on missing `id`/`text`/`quote`/`source`, path-traversal rejection, Windows reserved-device-name rejection, ceiling-overflow exit 2).
- This is a prompt-orchestration plugin (markdown skills/agents + one zero-dep Node aggregator), not a network service; mitigations framed accordingly.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-21
