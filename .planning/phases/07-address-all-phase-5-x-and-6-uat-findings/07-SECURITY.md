---
phase: 7
slug: 07-address-all-phase-5-x-and-6-uat-findings
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-01
amended: 2026-05-05
---

# Phase 7 -- Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

This phase delivers prompt-engineering changes to the lz-advisor Claude Code marketplace plugin. The plugin contains NO runtime code, NO API calls, and NO network surface -- all "source" files are markdown prompts (agents, skills), markdown references, a JSON manifest, and Bash smoke fixtures. The threat surface is therefore prompt injection, content provenance laundering, subagent privilege boundaries, verdict integrity, and cost discipline -- not classic OWASP web application threats. ASVS Level 1 selected accordingly.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Upstream skill output -> downstream skill input | Hedge markers, pv-* anchors, version qualifiers, verdict scope tags propagate across `/lz-advisor.review` -> `/lz-advisor.plan` -> `/lz-advisor.execute` -> `/lz-advisor.security-review` chains | Plain-text prompt content; agent-generated source material |
| Input prompt -> agent consultation | Agent-generated source flows from upstream skills into the executor's consultation prompt; pv-* synthesis layer is the trust translation point | Prompt-shaped XML blocks (pv-* anchors, fetched-content wrappers, verify_request escalations) |
| pv-* block -> agent treatment | Advisor / reviewer / security-reviewer treat pv-* claims as authoritative ground truth; a forged or self-anchored pv-* block laundering claimed knowledge into authoritative weight is the load-bearing threat | Structural XML elements with source= and method= attributes |
| Reviewer / security-reviewer agent ([Read, Glob]) -> Class-2 verification | Agents have no web tools; verify_request hook is the structured-output security control that lets the agent escalate WITHOUT tool-grant extension (per OWASP / arXiv 2601.11893 / Claude Code Issue #20264 documented subagent privilege escalation) | Structured `<verify_request>` XML emitted in agent response |
| Executor commit subject choice -> branch-state semantics | Executor decides commit subject prefix; SKILL.md `<verify_before_commit>` contract steers the decision; smoke fixture path-d catches subject-prefix violations | Git commit subject + body strings |
| `<context_trust_contract>` rule prose -> model interpretation | Reframed default-on ToolSearch rule's cost-asymmetry framing is the load-bearing prevention layer for confabulated pv-* synthesis on agent-generated input | Prompt-rule prose interpreted by Sonnet 4.6 / Opus 4.7 |
| Smoke fixture / UAT replay scratch repos -> persistent filesystem | Scratch repos isolated via `mktemp -d` + trap-on-EXIT cleanup; no persistent side effects | Throwaway scratch git repos and JSONL traces |

---

## Threat Register

Phase 7 threat register aggregated from 8 plans (07-01 through 07-08). All `mitigate` dispositions verified by grep against implementation files cited in mitigation plans. All `accept` dispositions logged in Accepted Risks Log.

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-07-01-01 | Repudiation | pv-* synthesis layer in 4 SKILL.md + Common Contract Rule 5 | mitigate | Rule 5b (Format mandate + Source-grounded evidence + Self-anchor rejection + Synthesis mandate + ToolSearch precondition) in `references/context-packaging.md`; B-pv-validation.sh smoke fixture (4 + 1 assertions) | closed |
| T-07-01-02 | Tampering | Class 2/3/4 question routing via ToolSearch availability rule | mitigate | pv-* synthesis precondition paragraph in 4 SKILL.md `<context_trust_contract>` blocks (byte-identical canon); Rule 5b ToolSearch precondition sub-rule | closed |
| T-07-01-03 | Tampering | Existing Common Contract Rule 5a (fetched-content prompt-injection defense) | accept | Rule 5a carry-forward unchanged from Phase 6 (`<fetched source="..." trust="untrusted">` wrapper); composes additively with new Rule 5b | closed |
| T-07-02-01 | Tampering | Verify-skip on hedged claims (E.1 + E.2) | mitigate | `## Hedge Marker Discipline` section in 3 agents with literal `Unresolved hedge:` frame + 5 sentinel regexes; `<verify_before_commit>` block in execute SKILL.md (E.1 + E.2 + cost-cliff + Verified: trailer); E-verify-before-commit.sh smoke fixture (3-path OR assertion) | closed |
| T-07-02-02 | Repudiation | Apply-then-revert silent rollback of advisor Critical content (Finding A) | mitigate | Reconciliation extension (apply-then-revert flow, Finding A) in execute SKILL.md `<verify_before_commit>` block forbidding silent revert; xhigh advisor cost as cheap insurance | closed |
| T-07-02-03 | Repudiation | Silent-drop of numbered input findings (silent-resolve sub-pattern) | mitigate | `## Findings Disposition (when input is a numbered finding list)` template section in plan SKILL.md with 4 dispositions (addressed / deferred / rejected / not-applicable) | closed |
| T-07-02-04 | Elevation of Privilege | Reviewer / security-reviewer agent privilege | accept | Both agents keep `tools: ["Read", "Glob"]` per OWASP / arXiv 2601.11893 / Claude Code Issue #20264; verified byte-identically in agent frontmatter | closed |
| T-07-03-01 | Tampering | Hedge stripping at skill boundaries (Finding C hop 3) | mitigate | Common Contract Rule 5c (Hedge propagation rule) in `references/context-packaging.md`; `## Cross-Skill Hedge Tracking` section in `references/orient-exploration.md`; agent-side `## Hedge Marker Discipline` (T-07-02-01) | closed |
| T-07-03-02 | Tampering | Version-qualifier injection from training data (Finding C hop 5) | mitigate | Common Contract Rule 5d (Version-qualifier anchoring rule) requires package.json read + `pv-version-anchor-N` synthesis before propagating qualifier | closed |
| T-07-03-03 | Repudiation | Cross-axis confidence laundering (Finding C hop 8b) | mitigate | `## Scope-Disambiguated Provenance Markers` section in context-packaging.md with 4 scope values; `**Verdict scope:**` literal in 4 SKILL.md output templates | closed |
| T-07-03-04 | Information Disclosure | Cross-skill hedge tracking via filesystem-readable artifacts | accept | Hedge markers in plan / review files are user-visible artifacts; rule operates on file content user already sees -- no new disclosure surface | closed |
| T-07-03-05 | Tampering | Prompt injection via fetched content interacting with hedge markers | accept | Common Contract Rule 5a (`<fetched>` wrapper) is orthogonal to Rule 5c; hedges sourced from upstream skills, not fetched URLs | closed |
| T-07-04-01 | Cost discipline (no security category) | Word-budget regression on 3 agents | mitigate | Descriptive sub-cap prose in 3 agent prompts (advisor 100w + Density example references; reviewer + security-reviewer 80w / 160w / 30w / 300w aggregate); 3 D-budget.sh smoke fixtures | closed |
| T-07-04-02 | Tampering | Smoke fixtures invoke `claude -p --dangerously-skip-permissions` | accept | Required for non-interactive smoke runs; scratch repos isolated via `mktemp -d` + `trap 'rm -rf' EXIT`; matches existing KCB-economics + DEF-response-structure pattern | closed |
| T-07-05-01 | Elevation of Privilege | Reviewer / security-reviewer subagent privilege escalation via tool-grant inheritance | mitigate | Reviewer + security-reviewer keep `[Read, Glob]` tool grant (verified); Option 3 PERMANENTLY REJECTED; verify_request hook (3 surfaces) is structured-output security control per OWASP AI Agent Security Cheat Sheet + InfoQ Least-Privilege AI Agent Gateway | closed |
| T-07-05-02 | Tampering | Class-2 question classification bypass | mitigate | `<verify_request>` `class=` attribute documented as one of 4 enumerated values in `## Verify Request Schema`; executor's Phase 3 detection routes by class | closed |
| T-07-05-03 | Repudiation | Reviewer iterative re-invoke gaming verifier feedback | mitigate | One-shot rule (Spotify Honk principle) caps re-invocation at exactly 1; "verification unsuccessful" tag if second invocation still hedges | closed |
| T-07-05-04 | Information Disclosure | verify_request `<context>` element leaks code snippets to web tools | accept | OSS / public projects (lz-advisor primary use case) -- code already publicly visible; private-project users responsible for redaction; outbound query payload is user-controlled | closed |
| T-07-06-01 | Configuration consistency (no security category) | Plugin version bump + smoke fixture creation + UAT replay infrastructure | accept | Version metadata change is non-functional; smoke fixtures + UAT replay run isolated `claude -p` against scratch repos; ASVS V14 satisfied by 5-surface byte-identical version-string consistency | closed |
| T-07-06-02 | Information Disclosure | UAT replay JSONL traces may contain user prompt content | accept | Traces stored under `.planning/phases/07-.../uat-replay/sessions/`; contain synthesized fixture prompts (no PII; representative Compodoc / Storybook / Angular scenarios) -- same threat profile as Phase 6 UAT replay | closed |
| T-07-07-01 | Tampering | ToolSearch availability rule prose in 4 SKILL.md `<context_trust_contract>` | mitigate | "Phase 1 first action" default-on reframe in 4 SKILL.md (byte-identical canon preserved); cost-asymmetry framing; 2 worked examples; B-pv-validation.sh Assertion 5 detection layer | closed |
| T-07-07-02 | Repudiation | Confabulated pv-* synthesis on agent-generated input | mitigate | B-pv-validation.sh Assertion 5 grep-asserts ToolSearch tool_use events appear before pv-* block synthesis on agent-generated input; smoke fixture failure exits 1 with trace dump | closed |
| T-07-07-03 | Tampering | Plugin version drift (5 surfaces 0.10.0 -> 0.11.0) | mitigate | `plugin.json` version `0.11.0` (verified); 5-surface bump per Plan 07-07 Task 3; zero 0.10.0 remnants in plugin.json + 4 SKILL.md frontmatter | closed |
| T-07-07-04 | Repudiation | Milestone-audit traceability of Gap 1 closure | mitigate | 07-VERIFICATION.md amendment marks Gap 1 CLOSED; 06-VERIFICATION.md Amendment 7 (seventh) seals residual #1 with cross-references | closed |
| T-07-07-05 | Information Disclosure | Worked example testbed details (Storybook 10.3.5 + Compodoc + signal API specifics) | accept | Public OSS library names; inclusion in plugin canon does NOT leak proprietary information; utility outweighs testbed-specific phrasing maintenance cost | closed |
| T-07-08-01 | Tampering | Subject-prefix discipline rule prose in SKILL.md `<verify_before_commit>` | mitigate | "Subject-prefix discipline when Outstanding Verification is populated" subsection in execute SKILL.md with positive default + trailer-only carve-out anchored in `git diff --stat` semantics; E-verify-before-commit.sh path-d assertion (PATH_D_VIOLATION) | closed |
| T-07-08-02 | Repudiation | Per-commit reading silently shipping non-wip subject + Outstanding Verification | mitigate | 3-shape worked example pair (Shape 2 INCORRECT names per-commit-reading failure mode); E-verify-before-commit.sh path-d assertion exits 2 on violation; synthesized in-process scenario provides structural firing proof | closed |
| T-07-08-03 | Tampering | --replay flag accepting arbitrary SHA reference | mitigate | SHA format validation (`^[0-9a-f]{6,40}$`) rejects malformed SHAs before `git show`; defense-in-depth on top of `git show --no-patch` read-only semantics; structural error-path emits "cannot read commit" + exit 65 | closed |
| T-07-08-04 | Repudiation | Structural-validation proof against historical commits | mitigate | Synthesized in-process path-d scenario provides load-bearing structural fire (path-d exits 2 in-process); --replay error-path validation provides flag-wired proof; empirical replay against ngx-smart-components testbed is documented manual-auditor operation, not phase-closure gate | closed |
| T-07-08-05 | Repudiation | Milestone-audit traceability of Gap 2 closure + Phase 7 sealing | mitigate | GAP-G2-wip-scope registered in REQUIREMENTS.md with Phase 7 traceability; 07-VERIFICATION.md amendment marks Gap 2 CLOSED structurally; 06-VERIFICATION.md Amendment 8 (eighth) seals residual #2 + records Phase 7 sealing verdict enumerating Plans 07-01..07-08 | closed |

*Status: open / closed*
*Disposition: mitigate (implementation required) / accept (documented risk) / transfer (third-party)*

**Total: 29 threats. Closed: 29. Open: 0.**

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-07-01 | T-07-01-03 | Phase 6 Common Contract Rule 5a (`<fetched>` wrapper) carries forward unchanged. Plan 07-01 does not modify the prompt-injection defense for fetched content; Rule 5b composes additively with 5a. The `<fetched source="..." trust="untrusted">` wrapper continues to handle outbound URL trust; Rule 5b handles inbound pv-* synthesis trust. Risk is the carry-forward itself, not a new exposure. | gsd-planner | 2026-05-01 |
| AR-07-02 | T-07-02-04 | Plan 07-02 explicitly does NOT extend reviewer / security-reviewer tool grants. Both agents keep `tools: ["Read", "Glob"]` per OWASP AI Agent Security Cheat Sheet, arXiv 2601.11893 (formal subagent privilege escalation), and Claude Code Issue #20264 (subagent tool-grant inheritance concern). Verified byte-identically in agent frontmatter. The new scan criterion in review SKILL.md operates within the existing tool grant. | gsd-planner | 2026-05-01 |
| AR-07-03 | T-07-03-04 | Cross-skill hedge tracking operates on file content the user already sees (plan / review files). No new disclosure surface; the rule prevents stripping (an integrity issue) rather than introducing visibility. | gsd-planner | 2026-05-01 |
| AR-07-04 | T-07-03-05 | Common Contract Rule 5a's `<fetched>` wrapper is orthogonal to Rule 5c hedge propagation. Hedges originate from upstream skills (not fetched URLs); Rule 5a applies to fetched-source URL trust, Rule 5c applies to skill-output trust. The two rules cover disjoint surfaces. | gsd-planner | 2026-05-01 |
| AR-07-05 | T-07-04-02 | `claude -p --dangerously-skip-permissions` flag is required for non-interactive smoke runs (no terminal for permission prompts). Scratch repos isolated via `mktemp -d` + `trap 'rm -rf "$SCRATCH"' EXIT`. Pattern matches existing KCB-economics.sh + DEF-response-structure.sh fixtures already validated in Phase 5.4. | gsd-planner | 2026-05-01 |
| AR-07-06 | T-07-05-04 | `<verify_request>` `<context>` element typically contains a single line of changed code (e.g., a signal output() call site). For OSS / public projects (lz-advisor primary use case), code is already publicly visible. For private projects, the user is responsible for redacting sensitive context before invoking the skill. The outbound query payload is user-controlled. | gsd-planner | 2026-05-01 |
| AR-07-07 | T-07-06-01 | Plan 07-06 introduces no new threat surface. Inherits prior phase threat model: principle-of-least-privilege agent tools (Plan 07-05), Common Contract Rules 5/5a/5b/5c/5d/6 (Plans 07-01 + 07-03), structured pv-* validation (Plan 07-01). Version metadata change is non-functional; ASVS V14 satisfied by 5-surface byte-identical version-string consistency. | gsd-planner | 2026-05-01 |
| AR-07-08 | T-07-06-02 | UAT replay JSONL traces stored under `.planning/phases/07-.../uat-replay/sessions/` contain synthesized fixture prompts (no PII; representative Compodoc / Storybook / Angular signal scenarios). Same threat profile as Phase 6 UAT replay infrastructure (already accepted in Phase 6 security audit). | gsd-planner | 2026-05-01 |
| AR-07-09 | T-07-07-05 | Worked examples reference specific public OSS library + version + symbol names from the UAT testbed (`@storybook/angular@10.3.5`, `@compodoc/compodoc@1.2.1`, signal `output()`). Public OSS names cannot leak proprietary information. Concrete pattern-match anchors for Sonnet 4.6 (per Anthropic best practices) outweigh testbed-specific phrasing maintenance cost. If a future testbed shifts (e.g., Storybook 11), examples may need updating; residual maintenance cost is acceptable. | gsd-planner | 2026-05-01 |

*Accepted risks do not resurface in future audit runs.*

---

## Unregistered Flags

None. SUMMARY.md files contain no `## Threat Flags` section per Phase 7 convention. The only security-adjacent section is `## Threat Mitigation Status` in `07-07-SUMMARY.md`, which restates Plan 07-07's threat-register dispositions (informational, no new attack surface).

---

## Implementation Evidence Quick Reference

Cross-reference grep results (verified 2026-05-01) confirming each `mitigate` disposition is present in implementation files:

| Mitigation | File | Evidence |
|------------|------|----------|
| Common Contract Rule 5b (pv-* validation) | `plugins/lz-advisor/references/context-packaging.md` | `5b. pv-* synthesis discipline` present; 3 self-anchor patterns enumerated |
| 4-SKILL byte-identical pv-* precondition | `plugins/lz-advisor/skills/lz-advisor.{plan,execute,review,security-review}/SKILL.md` | `pv-* synthesis precondition.` present in all 4 |
| Hedge Marker Discipline (3 agents) | `plugins/lz-advisor/agents/{advisor,reviewer,security-reviewer}.md` | `## Hedge Marker Discipline` + `Unresolved hedge:` literal frame (4 occurrences each) |
| `<verify_before_commit>` block | `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` | Open + close tags present; Reconciliation extension (Finding A) present |
| Findings Disposition (silent-resolve fix) | `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` | `## Findings Disposition` template section present |
| Reviewer scan criterion (Finding G) | `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` | `Verification gaps in implementation of hedged claims` bullet present |
| Reviewer / security-reviewer least privilege | `plugins/lz-advisor/agents/{reviewer,security-reviewer}.md` | `tools: ["Read", "Glob"]` (Option 3 rejected) |
| Common Contract Rules 5c + 5d | `plugins/lz-advisor/references/context-packaging.md` | `5c. Hedge propagation rule` + `5d. Version-qualifier anchoring rule` present |
| Cross-Skill Hedge Tracking | `plugins/lz-advisor/references/orient-exploration.md` | `## Cross-Skill Hedge Tracking` section present |
| Scope-Disambiguated Provenance Markers | `plugins/lz-advisor/references/context-packaging.md` + 4 SKILL.md | `## Scope-Disambiguated Provenance Markers` section + `**Verdict scope:**` in all 4 SKILL.md |
| Word-budget enforcement (3 agents) | `plugins/lz-advisor/agents/{advisor,reviewer,security-reviewer}.md` | `D-{advisor,reviewer,security-reviewer}-budget.sh` references + sub-caps (80w / 160w / 30w / 300w) |
| Class-2 Escalation Hook (verify_request) | `plugins/lz-advisor/agents/reviewer.md` + review SKILL.md + context-packaging.md | `## Class-2 Escalation Hook` + `Pre-emptive Class-2 scan` + `Reviewer Escalation Hook` + `## Verify Request Schema` |
| Plugin version 0.11.0 (5 surfaces) | `plugins/lz-advisor/.claude-plugin/plugin.json` + 4 SKILL.md frontmatter | `"version": "0.11.0"` (verified) |
| ToolSearch default-on reframe | 4 SKILL.md `<context_trust_contract>` | `Phase 1 first action` present in all 4; `default-on Phase 1` in context-packaging.md Rule 5b |
| Subject-prefix discipline (Gap 2) | `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` | `Subject-prefix discipline when Outstanding Verification is populated` present |

### Smoke Fixture Regression Gates

5 Bash smoke fixtures (`bash -n` syntax-valid for all 5):

| Fixture | Plan | Threats Covered | Status |
|---------|------|-----------------|--------|
| `B-pv-validation.sh` | 07-01 + 07-07 (Assertion 5) | T-07-01-01, T-07-07-02 | exists, syntax-valid, 5 assertions |
| `D-advisor-budget.sh` | 07-04 | T-07-04-01 (advisor) | exists, syntax-valid |
| `D-reviewer-budget.sh` | 07-04 | T-07-04-01 (reviewer) | exists, syntax-valid |
| `D-security-reviewer-budget.sh` | 07-04 | T-07-04-01 (security-reviewer) | exists, syntax-valid |
| `E-verify-before-commit.sh` | 07-06 + 07-08 (path-d + --replay) | T-07-02-01, T-07-02-02, T-07-08-01, T-07-08-02, T-07-08-03 | exists, syntax-valid, 4 paths + --replay flag |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-01 | 29 | 29 | 0 | gsd-security-auditor |
| 2026-05-05 | 46 | 46 | 0 | gsd-security-auditor (gap delta: Plans 07-09, 07-10, 07-11) |

---

## Amendment 2026-05-05 -- Plans 07-09, 07-10, 07-11 Threat Delta

After the 2026-05-01 audit, three additional plans landed (Plans 07-09, 07-10, 07-11) introducing 17 NEW STRIDE threats. This amendment audits those threats only; the 29 threats verified on 2026-05-01 are not re-audited.

**Plans audited:**
- Plan 07-09 (commits `00638bd`, `74929e1`, `5787a3c`, `24e80c6`; plugin 0.11.0 -> 0.12.0; reviewer + security-reviewer fragment-grammar emit template + effort xhigh -> medium)
- Plan 07-10 (commits `a11834d`, `cd4e49b`; advisor fragment-grammar emit template; effort: high preserved)
- Plan 07-11 (commits `fb872d9`, `3e03ed0`, `3ef407d`, `bf8a8db`, `c220fb4`; plugin 0.12.0 -> 0.12.1; Rule 5b dual-surface amendment + B-pv-validation Assertion 6)

### Threat Register (Delta)

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-07-09-01 | Information Disclosure / Tampering | reviewer / security-reviewer fragment-grammar silent truncation (false-negative on real bugs) | mitigate | Soft per-finding word target (20w / 22w with 25w / 28w outlier safety) + DROP/KEEP lists + auto-clarity carve-out for Class 2-S security findings + binding empirical recall gate | closed |
| T-07-09-02 | Denial of Service (silent quality degradation) | reviewer + security-reviewer effort xhigh -> medium misses Class-1 bugs | mitigate (with binding reversion) | CONTEXT.md D-04 amendment 2026-05-02 names binding 15% Class-1 recall reversion criterion | closed |
| T-07-09-03 | Tampering | smoke fixture vacuous pass on transitional Sonnet shape | mitigate | LEGACY_RE backward-compat fallback in D-{reviewer,security-reviewer}-budget.sh + section-presence + 4 distinct word-budget assertions per fixture | closed |
| T-07-09-04 | Denial of Service (cost-cliff at borderline recall drop) | borderline below-15% recall drop ambiguity | accept | 15% threshold is binding line; below-threshold accepts trade-off as documented design intent | closed |
| T-07-10-01 | Tampering | advisor.md ## Output Constraint surgical-edit boundaries | mitigate | Lines 53-56 (descriptive lead) + 58 (Assuming-frame contract) + 62-76 (Density examples) PRESERVED byte-identically; only line 60 REPLACED with Format declaration; 13 grep acceptance tests verified no unintended changes | closed |
| T-07-10-02 | Information Disclosure | D-advisor-budget.sh parser scope | accept | Local file IO + Node ESM stdlib only; no network calls; reads SD body extracted from local JSONL trace | closed |
| T-07-10-03 | Denial of Service | D-advisor-budget.sh `claude -p --dangerously-skip-permissions` invocation | accept | Existing fixture pattern (Phase 5.4+ precedent); matches AR-07-05 carry-forward | closed |
| T-07-10-04 | Elevation of Privilege | advisor agent tool grant | mitigate | Frontmatter `tools: ["Read", "Glob"]` UNCHANGED (verified byte-identically); principle of least privilege preserved per OWASP AI Agent Security Cheat Sheet | closed |
| T-07-10-05 | Spoofing | Plan 07-04 -> Plan 07-10 cross-link in advisor.md | mitigate | New Output Constraint prose explicitly cites `07-VERIFICATION.md` + `Plan 07-10` as rewrite-rationale anchors; downstream readers can grep `D-advisor-budget.sh` for empirical anchor | closed |
| T-07-10-06 | Repudiation | smoke-fixture exit codes | mitigate | Node ESM 3-way exit code (0 PASS / 1 FAIL / 2 LEGACY-FALLBACK) + bash dispatch with [OK]/[ERROR]/[INFO]/[WARN] log lines + tail-100 dump on failure | closed |
| T-07-11-01 | Spoofing | user-facing pv-* token without backing canonical XML (orphan / potential confabulation) | mitigate | B-pv-validation.sh Assertion 6 detects orphan tokens via `comm -23` set difference; orphan-nonempty fails fixture with explicit orphan-list dump | closed |
| T-07-11-02 | Tampering | references/context-packaging.md Rule 5b surgical-edit boundary | mitigate | Line 50 ONLY edited (Format mandate sub-rule); Rules 5a / 5c / 5d / 6 / 7 + 4 other 5b sub-rules preserved byte-identically; 12 grep acceptance tests | closed |
| T-07-11-03 | Information Disclosure | B-pv-validation.sh Assertion 6 token enumeration | accept | Tokens read from local JSONL fixture trace; no external network calls; `rg` + `comm` only | closed |
| T-07-11-04 | Repudiation | 5-surface plugin version bump consistency 0.12.0 -> 0.12.1 | mitigate | All 5 surfaces atomically at 0.12.1 (plugin.json + 4 SKILL.md frontmatter); zero 0.12.0 / 0.11.0 / 0.10.0 / 0.9.0 remnants in version surfaces; valid JSON + valid YAML parsing | closed |
| T-07-11-05 | Denial of Service | Plan 07-10 + Plan 07-11 concurrent in wave 7 | accept | Zero file overlap (07-10: advisor.md + D-advisor-budget.sh; 07-11: context-packaging.md + B-pv-validation.sh + REQUIREMENTS.md + 5 version surfaces + 07-VERIFICATION.md); no race condition | closed |
| T-07-11-06 | Elevation of Privilege | SKILL.md byte-identical canon prose change | accept | Plan 07-11 modifies only frontmatter `version:` field; Rule 5b amendment lives in references/context-packaging.md and resolves via @-load; no per-skill prose surface gains new content | closed |
| T-07-11-07 | Tampering | 07-VERIFICATION.md `closure_amendment_2026_05_04` block insertion | mitigate | Block inserts after `gaps: []` line and before closing `---`; existing `empirical_subverification_2026_05_03` block preserved byte-identically (single-occurrence grep); body of report (after frontmatter) byte-identical | closed |

**Delta total: 17 threats. Closed: 17. Open: 0.**

### Implementation Evidence (Delta)

| Mitigation | File | Evidence |
|------------|------|----------|
| Reviewer fragment-grammar (T-07-09-01) | `plugins/lz-advisor/agents/reviewer.md` | `Format: <file>:<line>: <severity>: <problem>. <fix>.` (line 59); DROP / Keep lists; 3 worked example pairs; holistic ~296w example |
| Security-reviewer fragment-grammar + auto-clarity (T-07-09-01) | `plugins/lz-advisor/agents/security-reviewer.md` | `[<OWASP-tag>]` format (line 60); `Auto-clarity (Class 2-S security carve-out)` (line 125) |
| Reviewer + security-reviewer effort medium (T-07-09-02) | `plugins/lz-advisor/agents/{reviewer,security-reviewer}.md` | Frontmatter `effort: medium` (line 43 / 44); CONTEXT.md D-04 amendment 2026-05-02 binding 15% recall reversion criterion (line 97) |
| Smoke fixture LEGACY_RE backward-compat (T-07-09-03) | `D-reviewer-budget.sh` + `D-security-reviewer-budget.sh` | LEGACY_RE present in both (count: 2 each); FRAGMENT_RE primary path; 4 distinct word-budget assertions per fixture |
| Advisor fragment-grammar (T-07-10-01, T-07-10-04, T-07-10-05) | `plugins/lz-advisor/agents/advisor.md` | `Format: each numbered item is` (line 60); `effort: high` preserved (line 43); `tools: ["Read", "Glob"]` preserved (line 44); `07-VERIFICATION.md` + `Plan 07-10` cross-references (line 84); 2 Density example blocks preserved byte-identically (lines 86, 94); `## Hedge Marker Discipline` preserved |
| D-advisor-budget.sh fragment-grammar parser (T-07-10-06) | `D-advisor-budget.sh` | ADVISOR_FRAGMENT_RE (3 occurrences); ASSUMING_FRAME_RE (2 occurrences); 3-way Node ESM exit code dispatch (case 0/1/2); LEGACY_WC fallback; Critical-block strip preserved |
| Rule 5b dual-surface (T-07-11-02) | `plugins/lz-advisor/references/context-packaging.md` | `internal-prompt surface` (line 51); `user-facing artifact surface` (line 54); 3 acceptable shapes enumerated (lines 56, 58, 60); Rules 5a / 5c / 5d / 6 / 7 preserved |
| B-pv-validation.sh Assertion 6 (T-07-11-01) | `B-pv-validation.sh` | `Assertion 6 (FIND-B.2 dual-surface scope, Plan 07-11 D2 amendment)` (line 141); `pv-[a-z]{2,}-[a-z0-9-]{2,}` token regex; `comm -23` orphan detection; 3-path PASS/SKIP/FAIL semantics |
| Plugin 0.12.1 (T-07-11-04) | `plugin.json` + 4 `SKILL.md` | All 5 surfaces at `0.12.1`; zero 0.12.0 remnants in version-surface fields |
| 07-VERIFICATION.md closure_amendment block (T-07-11-07) | `07-VERIFICATION.md` | `closure_amendment_2026_05_04:` (line 119); `empirical_subverification_2026_05_03:` preserved (line 89); `gaps: []` preserved (line 118) |

### Smoke Fixture Regression Gates (Delta)

The 5 fixtures from the 2026-05-01 audit retain bash -n syntax validity. The Plans 07-09 / 07-10 / 07-11 delta extends three of them:

| Fixture | Delta | Threats Covered (delta) |
|---------|-------|--------------------------|
| `B-pv-validation.sh` | Assertion 6 added (token-form resolution check); 5 -> 6 assertions; SUCCESS message updated to "all 6 assertions passed" | T-07-11-01 |
| `D-advisor-budget.sh` | ADVISOR_FRAGMENT_RE per-item parser + ASSUMING_FRAME_RE outlier branch + 3-way Node ESM exit code + LEGACY_WC fallback | T-07-10-06 |
| `D-reviewer-budget.sh` + `D-security-reviewer-budget.sh` | Fragment-grammar FRAGMENT_RE primary + LEGACY_RE backward-compat + per-line word-budget assertions + section-presence + aggregate <=300w preserved | T-07-09-03 |

### Accepted Risks Log (Delta)

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-07-10 | T-07-09-04 | Per CONTEXT.md D-04 amendment 2026-05-02, the trade is explicit: medium IS the cost-sensitive choice; the 15% Class-1 recall threshold is the binding reversion line; ambiguous below-threshold accepts the recall trade-off as the documented design intent. If empirical evidence shows the trade is unfavorable in practice (real Critical bugs missed at medium), the amendment reverts via the documented criterion. | gsd-planner | 2026-05-02 |
| AR-07-11 | T-07-10-02 | D-advisor-budget.sh parser reads only the SD body (extracted from local JSONL trace via `extract-advisor-sd.mjs`); no external network calls; no secrets in scope. Local file IO + Node ESM stdlib only. Pattern matches AR-07-08 (Phase 6 UAT replay JSONL trace handling) carry-forward. | gsd-planner | 2026-05-04 |
| AR-07-12 | T-07-10-03 | `--dangerously-skip-permissions` flag is required for non-interactive smoke runs (no terminal for permission prompts). Carries forward AR-07-05 rationale; matches Phase 5.4+ + Phase 6 + Phase 7 fixture pattern already validated. | gsd-planner | 2026-05-04 |
| AR-07-13 | T-07-11-03 | B-pv-validation.sh Assertion 6 enumerates pv-* anchors INSIDE the test fixture's local JSONL trace via `rg` + `comm`; no external network calls; no secrets in scope. Same threat profile as Assertions 1-5 (already accepted in AR-07-05 + AR-07-08 carry-forward). | gsd-planner | 2026-05-04 |
| AR-07-14 | T-07-11-05 | Plans 07-10 and 07-11 have ZERO file overlap (07-10: advisor.md + D-advisor-budget.sh; 07-11: context-packaging.md + B-pv-validation.sh + REQUIREMENTS.md + 5 version surfaces + 07-VERIFICATION.md). Both plans were ridden in wave 7 in parallel; no race condition. The orchestrator's atomic-commit per task convention prevents partial state. | gsd-planner | 2026-05-04 |
| AR-07-15 | T-07-11-06 | Plan 07-11 does NOT modify SKILL.md prose; only the frontmatter `version:` field (Task 4). The Rule 5b amendment lives in `references/context-packaging.md` and resolves via existing @-load cross-references in each SKILL.md; no per-skill prose surface gains new content. The byte-identical canon contract (verified across 4 SKILL.md via 3 cross-file diffs exit 0) is preserved. | gsd-planner | 2026-05-04 |

### Unregistered Flags (Delta)

None. The 3 SUMMARY.md files (07-09-SUMMARY.md, 07-10-SUMMARY.md, 07-11-SUMMARY.md) contain no `## Threat Flags` section. They include `## Threat Model Compliance` sections that restate the structured threat IDs from the PLAN.md threat models -- informational restatements that map cleanly to the 17 IDs above; no unregistered attack surface detected.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log (9 + 6 = 15 entries)
- [x] `threats_open: 0` confirmed (29 + 17 = 46 closed)
- [x] `status: verified` maintained in frontmatter (delta amended 2026-05-05)
- [x] Reviewer + security-reviewer + advisor least privilege preserved (`tools: ["Read", "Glob"]` verified byte-identically across all 3 agents; Option 3 PERMANENTLY REJECTED)
- [x] All 5 smoke fixture regression gates exist with valid Bash syntax (B-pv-validation.sh now 6 assertions; D-*-budget.sh fixtures now fragment-grammar-aware with backward-compat fallback)
- [x] Plugin version 0.12.1 across 5 surfaces (zero version-drift remnants)
- [x] CONTEXT.md D-04 amendment 2026-05-02 with binding 15% Class-1 recall reversion criterion present
- [x] 07-VERIFICATION.md `closure_amendment_2026_05_04` block records both Plan 07-10 + Plan 07-11 closures structurally on 0.12.1; `empirical_subverification_2026_05_03` preserved byte-identically

**Approval:** verified 2026-05-01; amended 2026-05-05 (gap delta: 17 new threats from Plans 07-09, 07-10, 07-11 verified closed)
