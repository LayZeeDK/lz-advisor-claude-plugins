---
status: pass-with-observations
phase: 06-address-phase-5-6-uat-findings
type: manual-uat
skill: lz-advisor.security-review
plugin_version: 0.8.9
testbed: D:/projects/github/LayZeeDK/ngx-smart-components
testbed_branch: uat/manual-s4-v089-compodoc
session_log: c:/Users/LarsGyrupBrinkNielse/.claude/projects/D--projects-github-LayZeeDK-ngx-smart-components/2d388e98-1e6a-4978-8290-115852470529.jsonl
session_start: 2026-04-29T21:46:04Z
session_end: 2026-04-29T21:53:51Z
session_duration_min: 7.8
turn_duration_ms: 119943
input_commit_range: 09a09d7^..05ea109
commits_reviewed: ["09a09d7", "0cb8ae7", "05ea109"]
verdict: PASS-with-observations
---

# Phase 6 Security-Review UAT -- Manual Verification on Plugin 0.8.9

The security-review UAT closes the Phase 6 follow-up UAT cycle (5 of 5 manual UATs done). It exercises the security-review skill on the post-fix commit range (`09a09d7^..05ea109`) covering Compodoc + Storybook integration through fn() spy + gitignore anchor fixes. Layered checks: Phase 6 Pattern D regression on commit-range input (third agent-generated source shape candidate), Phase 7 Finding C continuation on the unverified Storybook 8+ chain, Phase 7 Finding B.1 in security-review context, and security-specific concerns on test instrumentation patterns.

## Workflow phase compliance

| Phase | SKILL.md expectation | Observed | Verdict |
|---|---|---|---|
| 1. Scan | Read scope, derive file list, scan for findings, classify by OWASP | 4 Bash (1 git log + 3 git diff slices), 2 Read (preview.ts, project.json); 3 findings articulated with file:line + OWASP categorization + code context + initial severity | PASS |
| 2. Consult | Single advisor call with Verification template (3 findings + Threat Model Context + Project Guidelines) | One Agent call to `lz-advisor:security-reviewer`; advisor `tool_uses: 0`, `output_tokens: 1090`, `duration_ms: 20128`; structural output with Findings + Threat Patterns + Missed surfaces | PASS structurally; word-budget regression (Observation D) |
| 3. Output | Render findings with executor's severity revisions; emit Threat Patterns chain; final summary references commit hashes | Final output renders 3 findings with reviewer-revised severities (Low/Medium/Low), preserves a verify-first hedge marker on Finding 1, articulates supply-chain -> stored-XSS chain with explicit deployment-config gating; concise summary | PASS |

## Empirical metrics

| Metric | Value | Note |
|---|---|---|
| Total Agent calls | 1 | Spec-compliant (single Verification consult per security-review SKILL.md) |
| Advisor `tool_uses` | 0 | Spec-compliant; pure synthesis under Context Trust Contract batched-verification permit |
| Advisor word budget | ~412w | **OVER BUDGET** -- 300w cap per `agents/security-reviewer.md`; ~37% over (Observation D) |
| Executor tool calls | 7 (Bash 4, Read 2, Agent 1) | Tight scan; no orient over-investigation |
| **WebSearch + WebFetch** | **0 (executor); 0 (advisor)** | Pattern D did NOT fire (Observation A); BUT see Observation A's nuance on question-class correctness |
| **ToolSearch invocations to load Web tools** | **0** | WebSearch/WebFetch are deferred again per `deferred_tools_delta`; never loaded |
| pv-* XML blocks in consultation | 0 | `context-packaging.md` was attached at session start; templates available, not used (Observation B) |
| Files attached at session start | 2 | `references/advisor-timing.md`, `references/context-packaging.md`. NO plan/review file -- input was 3 commit SHAs, not @-mentioned file. |
| Permissions for Web tools | Allowed | `command_permissions.allowedTools` includes `WebSearch, WebFetch` |
| Findings: pre-curated -> reviewer-revised | Medium / Medium / Low-Medium -> Low / Medium / Low | Reviewer demonstrated adversarial review, not rubber-stamp; deployment-posture caveats added |
| Hedge markers in advisor output | 1 (Finding 1: "Assuming the deployed Storybook is publicly served (unverified) ... Verify deployment posture before acting.") | Hedge marker SYNTHESIZED by Opus reviewer -- validates upstream synthesis capability; Phase 7 Finding C gap is downstream propagation, not synthesis |

## Observations

### A. Phase 6 Pattern D regression on commit-range input -- NOT REPRODUCED in the prior framing; NEW gap surfaces

**0 WebSearch + 0 WebFetch + 0 ToolSearch** by both executor and advisor. Numerically identical telemetry to plan-fixes and execute-fixes UATs.

**But the prior framing does not apply.** Amendments 2 and 3 to 06-VERIFICATION.md framed the gap as: input shaped like authoritative source triggers the `<context_trust_contract>` carve-out and suppresses Pattern D. That framing requires inlined authoritative-source-shaped content in the user prompt. This UAT's input was **3 commit SHAs** (pure references, no inlined content), so the carve-out should not have triggered -- and it didn't. The trust-contract amendment direction is unchallenged here.

**The actual question class is mostly correct for 0 web-tool use.** Security-review's primary questions are domain-reasoning (Class-1):

- "Is `(window as any)` write a security risk?" -- training-data + threat-model reasoning
- "Is unpinned `^1.2.1` a supply-chain risk?" -- domain knowledge
- "Is gitignored-artifact-static-import a TOCTOU risk?" -- domain knowledge

None are Class-2/3/4 questions. Pattern D's web-first prescription should NOT fire for these. The 0 web-tool count is correct behavior for security review's question mix.

**HOWEVER, a NEW Pattern D gap surfaces inside this skill.** Security-review's question mix structurally INCLUDES embedded Class-2 questions that the current orient ranking does not surface:

- "Are there known CVEs in `@compodoc/compodoc@1.2.1` or its transitive deps?" -- textbook Class-2 (vulnerability currency)
- "Is `documentation.json` schema documented by Storybook / Compodoc upstream?" -- vendor-doc question
- "Has `@storybook/angular@10.3.5` published any known security advisories?" -- vendor-currency check

The reviewer flagged Finding 2 (unpinned `@compodoc/compodoc`) theoretically as a supply-chain risk but never ran an empirical CVE check. A WebSearch like `@compodoc/compodoc CVE 2025 2026`, an `npm audit`, or a fetch of the GitHub Security Advisories database would have anchored Finding 2's severity (or revised it down if no advisories exist for the version). This is a missed Class-2 surface that the current Pattern D ranking does not promote when the SKILL is `lz-advisor.security-review`.

**Net for amendment 4 (NEW):** Pattern D's question-class taxonomy currently classifies questions structurally (type-symbol existence / API currency / migration / language semantics) but does not explicitly surface SECURITY-EMBEDDED Class-2 patterns: CVE checks, security-advisory lookups, package-vulnerability scans. These are Class-2 by nature (currency-dependent) but live inside Class-1 domain-reasoning skills. The orient ranking should call them out as Class-2 within security-review's specific scope.

### B. Phase 7 Finding B.1 in-skill synthesis gap REPRODUCED

Same failure mode as execute-fixes UAT: `references/context-packaging.md` was attached at session start with full canonical pv-* XML templates. The executor's consultation prompt has 0 pv-* blocks. Three obvious anchor candidates skipped:

| Candidate | Source | Evidence shape |
|---|---|---|
| `pv-window-assignment-line` | Read of `preview.ts` line 4 | `(window as any).__STORYBOOK_COMPODOC_JSON__ = docJson;` literal |
| `pv-compodoc-version` | git diff of package.json | `+    "@compodoc/compodoc": "^1.2.1",` |
| `pv-gitignore-entry` | git diff of .gitignore | `+/packages/ngx-smart-components/documentation.json` |

All three could have been packaged as `<pre_verified source="..." claim_id="..."><claim>...</claim><evidence method="git-diff|file-read">...</evidence></pre_verified>` blocks. None were synthesized.

This is the fourth UAT in Phase 6 confirming B.1's broadened scope (synthesis gap, not just carry-forward). The fix is `references/context-packaging.md` Common Contract Rule 5 mandating pv-* synthesis after material Read or Bash outputs in the orient/scan phase, regardless of skill.

### C. Phase 7 Finding C continuation -- BIFURCATED OUTCOME

The fn() spy + Storybook 8+ qualifier chain has TWO axes; the security-review affects them differently:

**Axis 1: API-correctness chain (review -> exec -> advisor -> plan -> exec consult -> commit `05ea109`)** -- the security-review skill DID NOT engage with this chain. The reviewer never asked whether `fn()` is the canonical Storybook pattern, never verified the unanchored "canonical Storybook 8+ pattern" qualifier against installed `@storybook/angular@10.3.5`. The chain breaks at the security-review boundary on this axis -- but only because security review is out of scope for API correctness, not because the chain was broken intentionally. The unverified qualifier persists, untouched, with no challenge from any agent in the chain.

**Axis 2: Security-clearance imprimatur (NEW hop 8 on a different axis)** -- the security review verdict adds a security imprimatur to the same commits that ship the unverified API claim. The away_summary records: "Two low-severity and one medium-severity finding around supply chain risk and XSS in the docs site." Future skill invocations seeing commit `05ea109` will read security-review provenance as "security-cleared with only Medium/Low concerns". Security clearance does not validate API correctness, but a downstream consumer (human or agent) might conflate the two.

| Hop | Source | Axis | Confidence delta |
|---|---|---|---|
| 1-7 | (per execute-fixes session-notes Finding C section) | API-correctness | Hedge stripped, qualifier introduced, qualifier reaches commit |
| **8a** | **Security-review skill UAT** | **API-correctness** | **No change** (out of scope; chain stalled but not broken) |
| **8b (NEW)** | **Security-review skill UAT (away_summary)** | **Security-clearance** | **Imprimatur added** (Medium/Low concerns -> commits read as security-reviewed) |

The bifurcation is the load-bearing observation. Phase 7's hedge propagation rule and version-qualifier anchoring rule must distinguish question-class scope across skills. A security-review skill cannot be expected to break an API-correctness chain; conversely, a security-cleared status must not be misread as a global cleared status.

**Refinement to Finding C (NEW):** add a fourth proposed guard: **scope-disambiguated provenance markers**. When a skill issues a verdict (PASS-with-observations, security-cleared, etc.), the verdict must be tagged with the question-class scope it covers (API correctness, security threats, performance, accessibility). Downstream skills reading the verdict must check scope-match before treating it as authoritative for the question they are answering.

### D. Word-budget regression on security-reviewer agent

The reviewer's response runs ~412 words against the 300-word cap specified in CLAUDE.md and `agents/security-reviewer.md`. ~37% over budget.

**Breakdown (approximate):**

- Findings header + 3 finding blocks (~233 words)
- Missed surfaces note (~28 words)
- Threat Patterns (~140 words)
- Headers/labels (~11 words)
- **Total: ~412 words**

The output is structurally compliant (Findings + Threat Patterns sections present, file:line citations, OWASP categorization, severity revisions with rationale, hedge marker preserved) and qualitatively useful. The over-run is in the Threat Patterns section's extended chain articulation -- valuable content but exceeding the prescribed cap.

**Comparison to prior word-budget regression (06-VERIFICATION.md original Stage 1 DEF):** the advisor's Strategic Direction in the Stage 1 KCB run was 111 words against a 100-word cap (~11% over). This security-review case is materially worse (~37% over a higher cap), suggesting the security-reviewer's word-budget contract is not load-bearing in the agent prompt the way the advisor's is.

**Proposed direction:** revisit `agents/security-reviewer.md` word-budget framing. Options:

- Tighten the prompt's word-budget enforcement language (Phase 5.4 D-08 verbose-prompt nudge style).
- Add a smoke test fixture that asserts security-reviewer response stays at <=300w on a representative scan input.
- Re-evaluate whether 300w is the right cap for security-review (Threat Patterns sections are inherently multi-finding-spanning narratives; perhaps 400w is the right cap with stricter Findings-section discipline).

### E. Positive observations (worth preserving)

- **Hedge marker SYNTHESIZED by Opus reviewer.** Finding 1's response includes the literal string "Assuming the deployed Storybook is publicly served (unverified) ... Verify deployment posture before acting." This is exactly the verify-first marker shape Phase 7 Finding C's proposed hedge propagation rule wants downstream skills to preserve. The security-reviewer demonstrably can synthesize hedges; the gap in Finding C is downstream propagation, not upstream synthesis.
- **Severity revision discipline.** Executor pre-curated 3 findings at Medium/Medium/Low-Medium; reviewer revised to Low/Medium/Low with deployment-posture context for each. Adversarial review, not rubber-stamp. Validates the executor-advisor pairing pattern for security work.
- **Threat-pattern chain articulated with explicit gating conditions.** The supply-chain -> stored-XSS chain is composed across Findings 2 + 1 + 3 with explicit AND/OR gating ("CI uses `npm install` rather than `npm ci`" OR "Storybook build is published as public-facing documentation"). High-quality systemic-risk articulation.
- **Adjacent-surface flagging.** Reviewer named two specific out-of-diff surfaces worth checking (`main.ts` Compodoc include globs for path traversal, `npm run` scripts with shell-interpolated args). Useful for follow-up scope.
- **xhigh effort budget compliance on tool use.** `tool_uses: 0` on the Agent call confirms batched verification under the Context Trust Contract permit.

## Phase 6 / Phase 7 classification

- **NEW Phase 6 amendment 4 candidate (Observation A):** Pattern D's question-class taxonomy should explicitly surface SECURITY-EMBEDDED Class-2 patterns (CVE checks, security-advisory lookups, package-vulnerability scans) as Class-2 within `lz-advisor.security-review`'s scope. Currently these are not promoted by the orient ranking despite being natural Class-2 surfaces.
- **Phase 7 Finding B.1 fourth data point (Observation B):** in-skill synthesis gap reproduces; pv-* templates available, 0 synthesized. No new framing -- adds weight to the existing B.1 broadened scope.
- **Phase 7 Finding C bifurcation (Observation C):** chain has TWO axes (API-correctness and security-clearance); skills can break one without addressing the other. NEW guard proposal: scope-disambiguated provenance markers on verdicts.
- **Phase 7 word-budget candidate (Observation D):** security-reviewer agent over-runs 300w cap by ~37%. Either tighten the prompt or revisit the cap. Mirrors the original DEF Word-budget regression (advisor SD 111w vs 100w cap).

## Phase 6 verdict for security-review UAT

**PASS-with-observations.** Mechanically clean: workflow phases ran, single advisor call, structural output, useful findings, hedge marker preserved, severity revision discipline demonstrated, threat-pattern chain articulated. Net new contributions to Phase 6 / Phase 7 scope:

- 1 new Phase 6 amendment direction (security-embedded Class-2 surfacing)
- 1 new Phase 7 candidate (word-budget regression)
- 1 Phase 7 Finding C refinement (bifurcation -> scope-disambiguated provenance)
- 1 fourth data point on Phase 7 Finding B.1 (in-skill synthesis gap)

The security review output is shippable. All 3 findings are reasonable, the chain narrative is correct, and the hedge marker on Finding 1 is exactly the right shape for downstream consumers.

## Cross-references

- Phase 6 verification: `.planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md` (amendment 4 covers this UAT)
- Phase 7 candidates: `.planning/phases/06-address-phase-5-6-uat-findings/PHASE-7-CANDIDATES.md`
- Plan-fixes UAT (Finding C origin): `.planning/phases/06-address-phase-5-6-uat-findings/uat-plan-skill-fixes/session-notes.md`
- Execute-fixes UAT (Finding C extension to hop 7): `.planning/phases/06-address-phase-5-6-uat-findings/uat-execute-skill-fixes/session-notes.md`
- Input commit range: `09a09d7^..05ea109` on testbed branch `uat/manual-s4-v089-compodoc`
