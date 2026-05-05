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
| 2026-05-05 | 62 | 62 | 0 | gsd-security-auditor (gap delta: Plans 07-12 + 07-13 + post-seal-fix WR-04/05 + IN-01) |

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

---

## Amendment 2026-05-05 (B) -- Plans 07-12 + 07-13 + post-seal-fix Threat Delta

After the 2026-05-05 (A) amendment closing the Plans 07-09 / 07-10 / 07-11 delta, two additional waves landed: Wave 8 (Plan 07-12, halted-by-design at Task 1; no source-file changes) and Wave 9 (Plan 07-13, four tasks shipped; plugin 0.12.1 -> 0.12.2). After Phase 7 was sealed at `passed_with_residual` on 2026-05-05, the user overrode the Phase 8 deferral of `gsd-code-review-fix --all` findings, which produced 3 post-seal cleanup commits closing WR-04, WR-05, and IN-01 from `07-REVIEW-GAPS-2.md`. This amendment audits ONLY this gap-closure delta; the 46 threats verified earlier (29 baseline 2026-05-01 + 17 delta amendment 2026-05-05 (A)) are not re-audited.

**Plans / commits audited:**
- Plan 07-12 (commits `d3898b2`, `0d1d822`; HALTED at Task 1 per plan-design halt criterion; n=3 fresh re-runs of `D-security-reviewer-budget.sh` on plugin 0.12.1 disconfirmed the n=1 326w "regression" -- mean 272.3w, 3/3 PASS; ZERO source-file changes)
- Plan 07-13 (commits `92cac0b` WR-01, `ea2045e` WR-02, `b5916ea` WR-03, `bd3c378` version bump + amendments, `7a8c4b0` SUMMARY; plugin 0.12.1 -> 0.12.2; severity-vocabulary alignment + new self-contained `## Class-2 Escalation Hook` section)
- Phase sealing (commits `3ef95fc` 07-REVIEW-GAPS-2.md authored, `6a6c408` phase complete `passed_with_residual`, `da99b17` PROJECT.md evolved with 0.12.2 sealing)
- Post-seal-fix wave per user override of Phase 8 deferral (commits `7f28903` WR-04 BNF tightening, `5ea449f` WR-05 worked-example severity, `f5af779` IN-01 wording polish, `6569969` 07-REVIEW-FIX-GAPS-2.md `all_fixed`)

### Threat Register (Delta)

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-07-12-01 | Repudiation | Stochastic-outlier-driven false-positive structural change to `agents/security-reviewer.md` Output Constraint section | mitigate | Plan 07-12 Task 1 explicit empirical halt-criterion fired (verdict 0/3 over 300w cap on n=3 fresh re-run; mean 272.3w; 9.2% under cap); Direction 1A worked-example calibration + Direction 1B per-section sub-cap re-balance NOT shipped; structural change against non-reproducible failure prevented | closed |
| T-07-12-02 | Tampering | Plan 07-12 halt-by-design source-file invariance contract | mitigate | `git diff` confirms ZERO file modifications under `plugins/lz-advisor/` for Plan 07-12 commits (`d3898b2` + `0d1d822`); only `.planning/...regression-gate-0.12.1/D-security-reviewer-budget-3x.log` + 07-12-SUMMARY.md created -- pure empirical-evidence artifacts | closed |
| T-07-12-03 | Information Disclosure | `regression-gate-0.12.1/D-security-reviewer-budget-3x.log` JSONL trace content | accept | Local fixture-trace artifact written under `.planning/phases/07-.../regression-gate-0.12.1/`; 3 sequential `claude -p` invocations against synthesized OWASP threat-model fixture (no PII); same threat profile as AR-07-08 (Phase 6 UAT replay) + AR-07-11 (D-advisor-budget.sh JSONL parsing); carry-forward acceptance | closed |
| T-07-13-01 | Tampering | `agents/security-reviewer.md:312` Hedge Marker Discipline security-clearance carve-out severity-vocabulary mismatch (legacy `Severity: Medium` / `premature high-severity` vs Plan 07-09 renamed canon) | mitigate | WR-01 mechanical replacement: `Severity: Suggestion pending verification` (line 312, 1 occurrence verified) + `premature classification as Important` (line 312, 1 occurrence verified post IN-01 polish); legacy `Severity: Medium pending` returns 0 plugin-wide; legacy `premature high-severity` returns 0 plugin-wide; per-finding severity prefix table (lines 65-68: `crit:` / `imp:` / `sug:` / `q:`) PRESERVED byte-identically | closed |
| T-07-13-02 | Tampering | 5-surface legacy-severity-vocabulary drift (Critical/High/Medium and Critical, High, or Medium variants) across SKILL.md + context-packaging.md | mitigate | WR-02 mechanical alignment: 5 surfaces edited (`lz-advisor.security-review/SKILL.md` lines 14 + 126 + 164; `references/context-packaging.md` lines 289 + 388) to `Critical / Important / Suggestion` lexicon; triple-form anti-regression checks all return 0 (`Critical / High / Medium` slash-spaced; `Critical/High/Medium` slash-no-space; `Critical, High` comma-form); Surface 4 (line 388) Option A applied (full alignment of internal verify_request schema; no backward-compat translation note) | closed |
| T-07-13-03 | Elevation of Privilege | Broken cross-file pointer at `agents/security-reviewer.md:119` to `## Class-2 Escalation Hook in reviewer.md` (agents are stateless and cannot read sibling agent files at runtime; the silent failure mode would either drop Class 2-S escalation entirely or leak instructions from sibling-agent context) | mitigate | WR-03 structural fix: NEW self-contained `## Class-2 Escalation Hook` section at `agents/security-reviewer.md:232` between `## Threat Modeling` (line 219) and `## Final Response Discipline` (line 260); cross-file pointer at line 119 replaced with `see ## Class-2 Escalation Hook below`; broken `Class-2 Escalation Hook` in reviewer.md` substring returns 0 plugin-wide; OWASP / arXiv 2601.11893 / Claude Code Issue #20264 / Plan 07-05 D-04 privilege-escalation anchors cited at line 258 | closed |
| T-07-13-04 | Tampering | `agents/security-reviewer.md` byte-identical-preservation invariant for sister sections during WR-03 structural edit | mitigate | Section ordering verified post-edit: `## Output Constraint` (52), `## OWASP Top 10 Lens` (165), `## Context Trust Contract` (182), `## Review Process` (209), `## Threat Modeling` (219), `## Class-2 Escalation Hook` (232 -- new), `## Final Response Discipline` (260), `## Edge Cases` (269), `## Hedge Marker Discipline` (288), `## Boundaries` (314); all sister sections preserved byte-identically per Plan 07-13 must_haves contract; line 129 carve-out enumeration updated to add `## Class-2 Escalation Hook` to byte-identical-preservation list | closed |
| T-07-13-05 | Elevation of Privilege | security-reviewer agent tool grant + budget invariants during WR-01 + WR-03 structural changes | mitigate | Frontmatter `tools: ["Read", "Glob"]` UNCHANGED at line 45; `effort: medium` UNCHANGED at line 44 (D-04 amendment 2026-05-02 reversion criterion preserved); `maxTurns: 3` UNCHANGED at line 46; principle of least privilege per OWASP AI Agent Security Cheat Sheet + arXiv 2601.11893 + Claude Code Issue #20264 preserved; Plan 07-05 D-04 (Option 3 PERMANENTLY REJECTED) cross-reference present in new Class-2 Escalation Hook section line 258 | closed |
| T-07-13-06 | Spoofing | New `## Class-2 Escalation Hook` section duplication of canonical schema content from `references/context-packaging.md` introduces drift hazard between agent-side schema BNF and reference-side schema BNF | mitigate | All 3 schema surfaces verified parity-aligned (post WR-04 fix below): `agents/reviewer.md:230`, `agents/security-reviewer.md:239`, `references/context-packaging.md:376` all use `severity="<critical|important|suggestion>"` (no `\|high\|medium` remnants); IN-02 documented as known-hazard with explicit 3-surface touch contract for future schema changes; agent-side duplication is architecturally unavoidable (agents cannot resolve `${CLAUDE_PLUGIN_ROOT}/references/...` includes at runtime per WR-03 root-cause finding) | closed |
| T-07-13-07 | Repudiation | 5-surface plugin version-string consistency 0.12.1 -> 0.12.2 | mitigate | All 5 surfaces atomically at 0.12.2 (`plugin.json:3` + 4 SKILL.md frontmatter version: fields verified); zero 0.12.1 / 0.12.0 / 0.11.0 / 0.10.0 / 0.9.0 remnants in version-surface fields; valid JSON parsing + valid YAML frontmatter parsing across all 5 surfaces; PATCH classification per SemVer (no public API change; mechanical text replacements + section addition documenting existing-but-implicit Class-2 Escalation Hook contract for security-reviewer) | closed |
| T-07-13-08 | Tampering | 4-SKILL byte-identical canon preservation during Plan 07-13 (despite line 14 + 126 + 164 edits in `lz-advisor.security-review/SKILL.md`) | accept | Plan 07-13 edits are skill-specific Phase 1 + Phase 3 prose + user-visible description; the shared `<context_trust_contract>` / `<orient_exploration_ranking>` blocks remain byte-identical across all 4 SKILL.md (canonical block contract preserved per Plan 07-09 / Plan 07-11 contracts); the 4-SKILL byte-identical canon contract applies only to the shared blocks, not skill-specific Phase prose -- the modified surfaces are correctly outside the canon scope | closed |
| T-07-13-09 | Information Disclosure | Plan 07-13 SUMMARY.md captures 3 documented Rule 3 deviations (per-commit-reading rule fallback + per-task version-bump fallback + 07-REVIEW.md gap-list-adjacency fallback) | accept | All 3 deviations are authored-fallback-paths in the plan itself (not unsanctioned divergence); each documented in `## Deviations from Plan` section of 07-13-SUMMARY.md with commit cross-references; cleanly closes Plan 07-12 halt-coordination side-effects without introducing new attack surface | closed |
| T-07-13-10 | Spoofing | Phase sealing commits (`6a6c408` `passed_with_residual` + `da99b17` PROJECT.md evolved) traceability of WR-04 + WR-05 deferral context vs subsequent override | mitigate | 07-VERIFICATION.md `closure_amendment_2026_05_05_severity_vocabulary_alignment` block (line 564) records WR-01/02/03 closure rationale; `07-REVIEW-GAPS-2.md` (commit 3ef95fc) names WR-04 + WR-05 + IN-01 + IN-02 with explicit Phase 8 deferral; `07-REVIEW-FIX-GAPS-2.md` (commit 6569969) records user-override-driven post-seal fixes with `status: all_fixed`; the deferral->override audit trail is fully preserved | closed |
| T-07-WR04-01 | Tampering | `references/context-packaging.md:376` BNF schema severity allow-list permitted legacy `\|high\|medium` values, contradicting field-definition prose at line 388 (Critical / Important / Suggestion only) | mitigate | WR-04 fix at commit `7f28903`: BNF allow-list tightened from `severity="<critical\|important\|suggestion\|high\|medium>"` to `severity="<critical\|important\|suggestion>"`; 3-surface schema parity now enforced (`agents/reviewer.md:230`, `agents/security-reviewer.md:239`, `references/context-packaging.md:376` all aligned); the IN-02 known-hazard 3-surface-touch contract was implicitly satisfied by Wave 9's ahead-of-time tightening on the agent surfaces -- WR-04 closes the canonical-reference lag | closed |
| T-07-WR05-01 | Tampering | `references/context-packaging.md:317` Verification Template worked-example demo Findings block used `Severity: High` (legacy lexicon) contradicting the same file's Findings template at line 288 (post-WR-02 mandates Critical/Important/Suggestion for the executor's initial severity field) | mitigate | WR-05 fix at commit `5ea449f`: line 317 `Severity: High` -> `Severity: Important`; closest mapping for exploitable supply-chain risk where defense-in-depth applies; the example now correctly illustrates the Findings template four lines below; pre-WR-02 worked example contradiction closed; verified `git grep -n "Severity: Important" plugins/lz-advisor/references/context-packaging.md` returns line 317 only | closed |
| T-07-IN01-01 | Repudiation | Wording-quality side-effect of WR-01 mechanical rename: `important-severity classification` compound modifier reads less naturally than the legacy `high-severity classification` form; future readers may regress the rename if the compound modifier feels grammatically awkward | mitigate | IN-01 fix at commit `f5af779`: `agents/security-reviewer.md:312` rephrased from `premature important-severity classification` -> `premature classification as Important`; preserves rule's semantic meaning (still flags hedge markers as a sign of premature severity-bumping); mirrors canonical noun-form usage; 0 occurrences of `important-severity` / `high-severity` / `medium-severity` / `suggestion-severity` compound modifiers in `plugins/lz-advisor/agents/`, `skills/`, or `references/` | closed |

**Delta total: 16 threats. Closed: 16. Open: 0.**

### Implementation Evidence (Delta)

| Mitigation | File | Evidence |
|------------|------|----------|
| Plan 07-12 halt-by-design empirical gate (T-07-12-01, T-07-12-02) | `agents/security-reviewer.md` + `plugin.json` | `git diff 6e96b27..d3898b2 -- plugins/lz-advisor/` returns ZERO source changes; only `regression-gate-0.12.1/D-security-reviewer-budget-3x.log` + `07-12-SUMMARY.md` created |
| WR-01 Hedge Marker carve-out severity-vocabulary alignment (T-07-13-01) | `plugins/lz-advisor/agents/security-reviewer.md:312` | `Severity: Suggestion pending verification` present (1 occurrence); `premature classification as Important` present post-IN-01 polish (1 occurrence); legacy strings 0 plugin-wide |
| WR-02 5-surface legacy-lexicon alignment (T-07-13-02) | `lz-advisor.security-review/SKILL.md` lines 14 + 126 + 164; `references/context-packaging.md` lines 289 + 388 | `Critical / Important / Suggestion` present at lines 14 (comma-form), 126, 164, 289, 388; `Critical / High / Medium` + `Critical/High/Medium` + `Critical, High` triple-form anti-regression all return 0 plugin-wide |
| WR-03 NEW self-contained `## Class-2 Escalation Hook` section (T-07-13-03, T-07-13-04) | `plugins/lz-advisor/agents/security-reviewer.md:232-258` | `^## Class-2 Escalation Hook$` present at line 232 (1 occurrence); cross-file pointer at line 119 replaced with `see ## Class-2 Escalation Hook below`; carve-out enumeration line 129 includes `## Class-2 Escalation Hook`; section ordering preserved (Output Constraint -> OWASP -> Context Trust -> Review Process -> Threat Modeling -> NEW Class-2 Hook -> Final Response Discipline -> Edge Cases -> Hedge Marker -> Boundaries); Class 2-S primary + pv-cve-... / pv-advisory-ghsa-... / pv-compodoc-... anchor_target conventions present at line 246; OWASP / arXiv 2601.11893 / Claude Code Issue #20264 / Plan 07-05 D-04 privilege-escalation anchors cited at line 258 |
| Agent guard preservation (T-07-13-05) | `plugins/lz-advisor/agents/security-reviewer.md` | `tools: ["Read", "Glob"]` (line 45); `effort: medium` (line 44; D-04 reversion criterion preserved); `maxTurns: 3` (line 46) |
| 3-surface BNF schema parity post WR-04 (T-07-13-06, T-07-WR04-01) | `agents/reviewer.md:230` + `agents/security-reviewer.md:239` + `references/context-packaging.md:376` | All 3 surfaces use `severity="<critical\|important\|suggestion>"`; zero `\|high\|medium` remnants in any BNF allow-list |
| Plugin 0.12.2 (T-07-13-07) | `plugin.json:3` + 4 `SKILL.md` frontmatter | All 5 surfaces at `0.12.2`; zero 0.12.1 remnants in version-surface fields |
| WR-05 worked-example severity alignment (T-07-WR05-01) | `references/context-packaging.md:317` | `Severity: Important` present (was `Severity: High` pre-fix); aligns demo with Findings template at line 288 |
| IN-01 wording polish (T-07-IN01-01) | `agents/security-reviewer.md:312` | `premature classification as Important` present (was `premature important-severity classification` post-WR-01 pre-IN-01); 0 compound-modifier severity tokens (`high-severity` / `medium-severity` / `important-severity` / `suggestion-severity`) in plugins/lz-advisor/{agents,skills,references}/ |
| 07-VERIFICATION.md closure block (T-07-13-10) | `07-VERIFICATION.md:564` | `## closure_amendment_2026_05_05_severity_vocabulary_alignment` block present; preserves prior Phase 7 Sealing Verdict block byte-identically |
| 07-REVIEW.md WR-01/02/03 RESOLVED (T-07-13-10) | `07-REVIEW.md:86,90,94` | `WR-01: RESOLVED via Plan 07-13 Task 1 (commit 92cac0b; plugin 0.12.2)` + WR-02/03 closure entries each with commit cross-references; pre-existing IN-01/IN-02 entries preserved |

### Accepted Risks Log (Delta)

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-07-16 | T-07-12-03 | `regression-gate-0.12.1/D-security-reviewer-budget-3x.log` is a local empirical-evidence artifact written by 3 sequential `claude -p` invocations against the synthesized OWASP threat-model fixture (no PII; representative Compodoc / Storybook / Angular signal scenarios). Same threat profile as AR-07-08 (Phase 6 UAT replay JSONL trace handling) + AR-07-11 (D-advisor-budget.sh JSONL parsing) carry-forward. | gsd-security-auditor | 2026-05-05 |
| AR-07-17 | T-07-13-08 | Plan 07-13 modifies skill-specific Phase 1 + Phase 3 prose + user-visible description in `lz-advisor.security-review/SKILL.md` (lines 14 + 126 + 164). The 4-SKILL byte-identical canon contract applies ONLY to the shared `<context_trust_contract>` and `<orient_exploration_ranking>` blocks, not to skill-specific Phase prose; the modified surfaces are correctly outside the canon scope. The shared blocks remain byte-identical across all 4 SKILL.md per Plan 07-09 / Plan 07-11 contracts. | gsd-security-auditor | 2026-05-05 |
| AR-07-18 | T-07-13-09 | Plan 07-13's 3 documented Rule 3 deviations (07-VERIFICATION.md amendment placement adapted around missing Plan 07-12 amendment block; 07-REVIEW.md gap-list adjacency adapted around WR-01/02/03 not being inline; version bump owned solo by Plan 07-13 due to Plan 07-12 halt) all use authored-fallback-paths embedded in the plan itself. Each is documented in 07-13-SUMMARY.md `## Deviations from Plan` with commit cross-references. None constitute unsanctioned divergence from plan intent. | gsd-security-auditor | 2026-05-05 |

### Plan 07-12 Halt-by-Design as Security-Positive Event

Plan 07-12 was authored with an explicit empirical halt criterion: BEFORE shipping Direction 1A (worked-example calibration to ~260w) + Direction 1B (per-section sub-cap re-balance 250/160/30 -> 200/100/30), the plan required `D-security-reviewer-budget.sh` to be re-run 3x on plugin 0.12.1 to confirm the n=1 326w "regression" was reproducible. The 3x re-run produced 297w / 282w / 238w (mean 272.3w; 9.2% under 300w cap; 3/3 PASS). Per the plan's own 4-state verdict ladder (3/3 over cap -> ship; 2/3 -> ship; 1/3 -> surface to user; 0/3 -> halt), the 0/3 path fired and Tasks 2-4 were SKIPPED.

This is a security-positive event for two reasons:

1. **Prevented shipping a structural change against a non-reproducible failure.** Tightening the worked-example anchor to ~260w + reducing per-section sub-caps would have constrained future legitimate complexity additions to the security-reviewer prompt without empirical justification. The structural change would have been classified as `mitigate` against a stochastic-outlier-driven phantom regression (Hypothesis 4 from `07-RESEARCH-GAPS-2.md` Gap 1, ranked LOW confidence ~15% probability sampling-spread; CONFIRMED as actual cause).

2. **Preserved budget-headroom invariant for legitimate future expansion.** Plan 07-13's WR-03 added a ~32-line `## Class-2 Escalation Hook` section to `agents/security-reviewer.md`. If Plan 07-12 had shipped Direction 1A + 1B against the phantom regression first, Plan 07-13's section addition would have either (a) forced the agent further toward the tightened cap, eroding the established 9.2% under-cap headroom, or (b) required additional structural cuts elsewhere in the agent prompt to re-establish headroom. By halting, Plan 07-12 preserved the budget-headroom buffer that absorbed Plan 07-13's WR-03 section addition cleanly.

T-07-12-01 disposition `mitigate` reflects this: the threat (false-positive structural change against stochastic outlier) was structurally prevented by the plan-author's halt criterion + 3x re-run evidence chain.

### Smoke Fixture Regression Gates (Delta)

The 5 fixtures from the 2026-05-01 audit + 2026-05-05 (A) amendment retain bash -n syntax validity. Plans 07-12 + 07-13 + post-seal-fix do NOT extend any fixture (Plan 07-12 RAN `D-security-reviewer-budget.sh` 3x as the empirical gate but did not modify it; Plan 07-13 references the fixture in commentary only; WR-04/05/IN-01 fixes are markdown-prose-only).

| Fixture | Delta | Threats Covered (delta) |
|---------|-------|--------------------------|
| `D-security-reviewer-budget.sh` | NO modification; ran 3x on plugin 0.12.1 as Plan 07-12 Task 1 empirical halt-gate; mean 272.3w / 3/3 PASS | T-07-12-01 (halt criterion fired correctly); T-07-12-02 (no source-file change to fixture) |

### Unregistered Flags (Delta)

None. The 2 SUMMARY.md files (`07-12-SUMMARY.md`, `07-13-SUMMARY.md`) contain no `## Threat Flags` section. The 2 review documents (`07-REVIEW-GAPS-2.md`, `07-REVIEW-FIX-GAPS-2.md`) enumerate WR-04, WR-05, IN-01, IN-02 as code-quality findings (not unregistered threat flags); WR-04 + WR-05 + IN-01 are mapped to T-07-WR04-01 + T-07-WR05-01 + T-07-IN01-01 above; IN-02 is a known-hazard documentation-only entry tracked under T-07-13-06 (its mitigation is the 3-surface BNF schema parity verified post WR-04). No unregistered attack surface detected.

### Sign-Off (Delta)

- [x] All 16 delta threats have a disposition (mitigate / accept)
- [x] Accepted risks documented in Accepted Risks Log (3 new entries: AR-07-16, AR-07-17, AR-07-18)
- [x] `threats_open: 0` confirmed (29 + 17 + 16 = 62 threats; wait -- recount: original baseline 29 + amendment A delta 17 + amendment B delta 16 = 62 -- audit-trail row uses 60 because original 29 + 17 + 14 net-new = 60; the WR-04/05/IN-01 IDs are `T-07-WR04-01` / `T-07-WR05-01` / `T-07-IN01-01` newly minted in this amendment; recount: 13 Plan 07-12+07-13 IDs + 3 post-seal IDs = 16 new IDs; baseline 29 + amendment A 17 + amendment B 16 = 62 total; the audit-trail row "60" reflects an earlier draft count; correcting to 62 here for ground-truth)
- [x] `status: verified` maintained in frontmatter (delta amended 2026-05-05 (B))
- [x] Reviewer + security-reviewer + advisor least privilege preserved (`tools: ["Read", "Glob"]` verified byte-identically across all 3 agents; Option 3 PERMANENTLY REJECTED; verified post WR-03 structural edit)
- [x] All 5 smoke fixture regression gates retain bash -n syntax validity; D-security-reviewer-budget.sh successfully exercised as Plan 07-12 Task 1 empirical halt-gate (3/3 PASS)
- [x] Plugin version 0.12.2 across 5 surfaces (zero 0.12.1 remnants in version surfaces)
- [x] 3-surface BNF schema parity (`severity="<critical\|important\|suggestion>"` at `agents/reviewer.md:230` + `agents/security-reviewer.md:239` + `references/context-packaging.md:376`)
- [x] 07-VERIFICATION.md `closure_amendment_2026_05_05_severity_vocabulary_alignment` block records WR-01/02/03 closure structurally on 0.12.2; Phase 7 Sealing Verdict block preserved byte-identically
- [x] 07-REVIEW.md WR-01/02/03 RESOLVED entries with commit cross-references; pre-existing IN-01/IN-02 entries preserved
- [x] 07-REVIEW-FIX-GAPS-2.md `status: all_fixed` records WR-04/05/IN-01 closure + IN-02 known-hazard documentation post-seal

**Approval (B):** verified 2026-05-05 (amendment B; gap delta: 16 new threats from Plans 07-12 halt-by-design + Plan 07-13 WR-01/02/03 closure + post-seal-fix WR-04/05/IN-01 closure verified closed; cumulative 62 threats audited across baseline + amendment A + amendment B).
