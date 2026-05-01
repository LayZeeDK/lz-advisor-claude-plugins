---
phase: 7
slug: 07-address-all-phase-5-x-and-6-uat-findings
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-01
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

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log (9 entries)
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter
- [x] Reviewer + security-reviewer least privilege preserved (`tools: ["Read", "Glob"]` verified byte-identically; Option 3 PERMANENTLY REJECTED)
- [x] All 5 smoke fixture regression gates exist with valid Bash syntax

**Approval:** verified 2026-05-01
