---
phase: 07-address-all-phase-5-x-and-6-uat-findings
plan: 05
subsystem: skills+agents+references
tags: [reviewer-web-tool-design, finding-f, option-1-pre-emptive-scan, option-2-escalation-hook, verify-request-schema, principle-of-least-privilege, owasp-structured-output, spotify-honk-one-shot, parallel-wave-3]

# Dependency graph
requires:
  - phase: 07-address-all-phase-5-x-and-6-uat-findings
    plan: 02
    provides: "## Hedge Marker Discipline section in agents/reviewer.md (between Edge Cases and Boundaries) preserved byte-identically; new ## Class-2 Escalation Hook section composes additively after Final Response Discipline / before Edge Cases without disrupting Hedge Marker Discipline placement"
  - phase: 07-address-all-phase-5-x-and-6-uat-findings
    plan: 04
    provides: "## Output Constraint structural sub-caps in agents/reviewer.md (each Findings <=80w, Cross-Cutting Patterns <=160w, Missed surfaces <=30w, total <=300w) preserved byte-identically; new ## Class-2 Escalation Hook section is structural prose for the agent contract -- not output the agent emits at runtime -- so it does not consume runtime word budget"
  - phase: 07-address-all-phase-5-x-and-6-uat-findings
    plan: 03
    provides: "Common Contract Rule 5b (pv-* synthesis discipline) referenced by Phase 1 pre-emption and Phase 3 escalation flow; Scope-Disambiguated Provenance Markers section in context-packaging.md preserved as the section immediately preceding the new ## Verify Request Schema section (last h2 of the file)"
  - phase: 06-address-phase-5-6-uat-findings
    provides: "Pattern D 4-class taxonomy + Class 2-S sub-pattern (Phase 6 Plan 06-06) in references/orient-exploration.md; Plan 07-05 Phase 1 pre-emption references Class 2 (API currency / configuration / recommended pattern) and Class 2-S (security currency / CVE / advisory) verbatim; reviewer agent's [Read, Glob] tool grant per OWASP / arXiv 2601.11893 / Claude Code Issue #20264 stays unchanged (Option 3 PERMANENTLY REJECTED per CONTEXT.md D-04)"
provides:
  - "Phase 1 (Scan) Pre-emptive Class-2 scan sub-section in lz-advisor.review/SKILL.md enumerating vendor library imports + framework version-conditional patterns + build-tool target configs + supply-chain dependencies (Class 2-S sub-pattern); pre-empts top 3-5 surfaces per review invocation via WebSearch + WebFetch + pv-* synthesis"
  - "Phase 3 (Output) Reviewer Escalation Hook sub-section in lz-advisor.review/SKILL.md with 5-step one-shot escalation flow (parse / verify / synthesize / re-invoke / replace) per Spotify Honk principle; verification-unsuccessful escape hatch when re-invocation fails to close hedge"
  - "## Class-2 Escalation Hook section in agents/reviewer.md with <verify_request> emission directive; placed between ## Final Response Discipline and ## Edge Cases preserving Plan 07-02's ## Hedge Marker Discipline (between Edge Cases and Boundaries) and Plan 07-04's ## Output Constraint sub-caps byte-identically"
  - "## Verify Request Schema section in references/context-packaging.md (last h2 of file, after ## Scope-Disambiguated Provenance Markers from Plan 07-03) with full field definitions (5 fields: question REQUIRED + class REQUIRED + anchor_target OPTIONAL + severity OPTIONAL + <context> OPTIONAL), worked example (Compodoc 1.2.1 signal output Class-2 question), executor-side handling cross-reference, security rationale citing OWASP / arXiv 2601.11893 / Claude Code Issue #20264 / InfoQ Least-Privilege AI Agent Gateway"
  - "Reviewer keeps [Read, Glob] tool grant byte-identically -- principle of least privilege per OWASP AI Agent Security Cheat Sheet; Option 3 (extend tool grant with WebSearch/WebFetch/Bash) PERMANENTLY REJECTED per CONTEXT.md D-04 + 3 cited authorities"
affects: ["plan-07-06"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Paired upstream-prevention + downstream-detection within review skill: Phase 1 pre-emptive Class-2 scan (Option 1) anticipates likely vendor / framework / build-tool surfaces before reviewer consultation; Phase 3 reviewer escalation hook (Option 2) handles the long tail of reviewer-surfaced Class-2 surprises that pre-emption did not anticipate. The two layers compose: pre-emption catches the high-frequency cases (vendor library imports, framework version-conditional patterns), escalation handles the residual long tail. Together they close Finding F without extending the reviewer's tool grant."
    - "Structured-output-as-security-control: <verify_request> XML block in agent output is the security boundary that lets the reviewer escalate WITHOUT extending its [Read, Glob] tool grant. The agent emits a structured request; the executor (which already has full tool access in its profile) performs the verification on the agent's behalf. Architecturally aligned with InfoQ's Least-Privilege AI Agent Gateway pattern (MCP discovery + JSON-RPC structured calls + OPA authorization): higher-privilege gateway components handle network operations on behalf of lower-privilege agents that emit structured requests. Anchored in OWASP AI Agent Security Cheat Sheet (structured-output as security control), arXiv 2601.11893 (formal treatment of agent privilege escalation), Claude Code Issue #20264 (subagent privilege inheritance escalation)."
    - "Spotify Honk one-shot principle for re-invocation: reviewer is re-invoked at most ONCE per review with new pv-* anchors. If the second invocation still surfaces the same hedge, executor emits ungrounded finding with explicit 'verification unsuccessful' tag. Multi-round verification forbidden. This prevents reviewer-side gaming of verifier feedback (the failure mode that makes self-reports unreliable per outcome-based verification research) AND caps cost at most 1 additional WebSearch + WebFetch + reviewer-re-invocation per review, even when the reviewer surfaces N verify_request blocks (perform all verifications in one pre-pass, then re-invoke once)."
    - "Three-surface schema canonicalization: <verify_request> schema appears in 3 places (lz-advisor.review/SKILL.md Phase 3 escalation flow + agents/reviewer.md Class-2 Escalation Hook + references/context-packaging.md Verify Request Schema section). The 5 fields (question / class / anchor_target / severity / context) appear with identical semantics across all 3 surfaces. Future schema changes propagate atomically across all 3 surfaces."
    - "Per-agent placement variation distinguishing role-specific contracts: agents/reviewer.md Class-2 Escalation Hook lands between ## Final Response Discipline and ## Edge Cases (preserving Plan 07-02's ## Hedge Marker Discipline between Edge Cases and Boundaries); references/context-packaging.md Verify Request Schema is the LAST h2 of the file (after ## Scope-Disambiguated Provenance Markers from Plan 07-03); lz-advisor.review/SKILL.md Phase 1 pre-emption lands inside <scan> XML container before the closing 'Do not consult during scanning' line, Phase 3 escalation hook lands inside <output> XML container before the existing ### Verdict scope marker sub-section (Plan 07-03). Each placement matches the surface's existing structural conventions; XML container integrity preserved (<scan> + </scan> = 1 each; <output> + </output> = 1 each)."

key-files:
  created: []
  modified:
    - "plugins/lz-advisor/skills/lz-advisor.review/SKILL.md"
    - "plugins/lz-advisor/agents/reviewer.md"
    - "plugins/lz-advisor/references/context-packaging.md"

key-decisions:
  - "Phase 3 escalation hook landed BEFORE the existing ### Verdict scope marker sub-section (Plan 07-03) rather than after it. Rationale: the escalation flow may re-invoke the reviewer ONCE before final user-visible output, and the verdict scope marker is appended AFTER the reviewer's final response. Logical flow: detect <verify_request> -> perform verification -> synthesize pv-* -> re-invoke reviewer ONCE -> emit final verbatim response -> append verdict scope marker. The plan's textual guidance ('after the existing Do NOT list... and BEFORE the closing </output> tag') was written before Plan 07-03 added the verdict scope marker; the placement decision honors the plan's intent (escalation hook is part of Phase 3 logic that fires before final emission)."
  - "Schema field-identity (not byte-identity) between agents/reviewer.md and references/context-packaging.md. The plan's implementation notes asserted 'byte-identical' but the plan-supplied schema text differs intentionally: agents/reviewer.md uses class=\"2\" (reviewer-specific scope) and severity=\"<critical|important|suggestion>\" (3 reviewer severity levels); context-packaging.md uses class=\"<2|2-S|3|4>\" (full schema union) and severity=\"<critical|important|suggestion|high|medium>\" (reviewer + security-reviewer severity union). Both files reference the same 5 fields (question / class / anchor_target / severity / context) with identical semantics; field names and emission semantics are byte-identical, attribute value enumerations differ by emitter scope. Future schema changes propagate atomically across all 3 surfaces."
  - "Reviewer tool grant verified unchanged byte-identically: tools: [\"Read\", \"Glob\"] count = 1 in agents/reviewer.md (and security-reviewer.md by inheritance from CONTEXT.md D-04). Option 3 (extend grant) PERMANENTLY REJECTED per CONTEXT.md D-04 + OWASP AI Agent Security Cheat Sheet + arXiv 2601.11893 + Claude Code Issue #20264. The verify_request hook is the structured-output security control that closes Finding F without extending privilege."
  - "Pre-emption is conservative (top 3-5 surfaces per review invocation, not every import). Cost target: 1-3 additional WebSearch / WebFetch invocations per review, matching CONTEXT.md D-04 cost-discipline analysis. The reviewer's escalation hook handles the residual long tail."
  - "Cross-references between the 3 modified files form a navigable web: lz-advisor.review/SKILL.md Phase 1 references context-packaging.md Common Contract Rule 5b; Phase 3 references context-packaging.md 'Verify Request Schema' section; agents/reviewer.md Class-2 Escalation Hook references context-packaging.md 'Verify Request Schema' section AND lz-advisor.review/SKILL.md 'Reviewer Escalation Hook' section; context-packaging.md Verify Request Schema section references lz-advisor.review/SKILL.md Phase 3 + lz-advisor.security-review/SKILL.md (deferred to future phase)."

patterns-established:
  - "Two-layer Finding F closure: Phase 1 pre-emption (Option 1) catches high-frequency Class-2 surfaces; Phase 3 reviewer escalation hook (Option 2) handles long-tail surprises. Future Class-2 questions surfaced empirically can be added to either layer without re-architecting: high-frequency patterns extend Phase 1 enumeration list; reviewer-surfaced novel questions go through Phase 3 escalation flow naturally."
  - "Verify_request schema as a stable load-bearing canonical artifact: 5 fields (question / class / anchor_target / severity / context) appear verbatim across 3 surfaces. The schema is now a stable contract that future plans extend atomically. Class enumeration ('2' / '2-S' / '3' / '4') maps directly to references/orient-exploration.md Pattern D 4-class taxonomy + Class 2-S sub-pattern; future taxonomy extensions propagate to the schema's class= attribute enumeration."
  - "Spotify Honk one-shot semantics for verifier-feedback flows: re-invoke ONCE; if hedge persists, emit ungrounded finding with explicit 'verification unsuccessful' tag; do NOT iterate. Cost cap at 1 extra round-trip per review regardless of how many verify_request blocks the reviewer emits. Architectural pattern transferable to other Sonnet-as-executor + Opus-as-verifier flows in the plugin (e.g., security-reviewer when Plan 07-05 scope is extended in a future phase)."
  - "Principle-of-least-privilege as a load-bearing security argument: the verify_request hook preserves the reviewer's [Read, Glob] tool grant. The structured-output security control IS the cleaner solution than direct tool-grant expansion. Cited authorities (OWASP / arXiv 2601.11893 / Claude Code Issue #20264 / InfoQ Least-Privilege AI Agent Gateway) form a consistent literature basis for future plugin design decisions where adding tool privilege is the simplest mechanism but the wrong one."

requirements-completed: [FIND-F]

# Metrics
duration: approximately 8min
completed: 2026-05-01
---

# Phase 07 Plan 05: reviewer web-tool design (FIND-F) Summary

**Landed Option 1 + Option 2 in tandem closing Finding F (reviewer agent has no web-tool grant for self-verification of Class-2 questions) per CONTEXT.md D-04. Option 1 (pre-emptive Class-2 scan in executor): lz-advisor.review/SKILL.md Phase 1 enumerates likely Class-2 surfaces (vendor library imports + framework version-conditional patterns + build-tool target configs + supply-chain dependencies) and pre-empts top 3-5 surfaces via WebSearch / WebFetch + pv-* synthesis BEFORE consulting the reviewer. Option 2 (reviewer escalation hook): agents/reviewer.md gains a `## Class-2 Escalation Hook` section directing the reviewer to emit a structured `<verify_request question= class= anchor_target= severity=>` block when it cannot resolve a Class-2 question; lz-advisor.review/SKILL.md Phase 3 detects these blocks and re-invokes the reviewer ONCE with new pv-* anchors per Spotify Honk one-shot principle. references/context-packaging.md gains a `## Verify Request Schema` section documenting the 5-field schema + worked example + security rationale (principle of least privilege per OWASP / arXiv 2601.11893 / Claude Code Issue #20264 / InfoQ). Reviewer keeps `[Read, Glob]` tool grant byte-identically; Option 3 (extend grant) PERMANENTLY REJECTED.**

## Performance

- **Duration:** approximately 8 minutes
- **Started:** 2026-04-30T23:55:00Z (worktree-agent-a8c8a2d137ae088db, wave 3 sequential)
- **Tasks completed:** 3 of 3 (no checkpoints, no deviations)
- **Files modified:** 3 (1 SKILL.md + 1 agent prompt + 1 reference file)
- **Files created:** 0
- **Commits:** 3 per-task atomic commits with `--no-verify` (parallel-execution discipline; orchestrator validates hooks once after wave completes)

## What Was Done

### Task 1: Phase 1 pre-emptive Class-2 scan + Phase 3 reviewer escalation hook in lz-advisor.review/SKILL.md (FIND-F Option 1 + Option 2 wiring)

Two coordinated edits to `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` within the existing `<scan>` and `<output>` XML containers.

**Edit 1 -- Pre-emptive Class-2 scan sub-section in Phase 1 (`<scan>`).** Inserted a new `### Pre-emptive Class-2 scan (Option 1 closure for Finding F)` sub-section AFTER the existing `### Scan Criteria` section (which Plan 07-02 extended with the verification-gap bullet) and BEFORE the closing line "Do not consult the reviewer agent during scanning. Scanning is preparation." The sub-section enumerates 4 categories of likely Class-2 surfaces in code-review scope:

- **Vendor library imports.** Each `import` referencing a third-party package -- the library version + symbol pair is a likely Class-2 question.
- **Framework version-conditional patterns.** Storybook addon registration, Angular signals, Next.js routing, Nx target configurations, build-tool orchestration rules.
- **Build-tool target configs.** `project.json`, `nx.json`, `webpack.config.*`, `vite.config.*`, `tsconfig.*`, `package.json` scripts.
- **Supply-chain dependencies (Class 2-S sub-pattern, security-review only).** Each dependency in `package.json` is a Class 2-S question.

The pre-emption flow is 3 steps: WebSearch then WebFetch per orient-exploration.md Class 2 ranking; synthesize a `<pre_verified>` block per Common Contract Rule 5b; ride the pv-* anchor into the consultation prompt's `## Pre-Verified Package Behavior Claims` section. The pre-emption is conservative (top 3-5 most-likely surfaces per review, not every import) with cost target 1-3 additional WebSearch / WebFetch invocations per review.

**Edit 2 -- Reviewer Escalation Hook sub-section in Phase 3 (`<output>`).** Inserted a new `### Reviewer Escalation Hook (Option 2 closure for Finding F)` sub-section AFTER the existing "If no significant issues..." prose and BEFORE the existing `### Verdict scope marker` sub-section (Plan 07-03). The sub-section documents the 5-step one-shot escalation flow:

1. Parse each `<verify_request>` block (extract question / class / anchor_target / severity).
2. Perform requested verification (WebSearch + WebFetch for class="2"; npm audit + GHSA WebFetch for class="2-S").
3. Synthesize `<pre_verified>` blocks per Common Contract Rule 5b, using the verify_request's anchor_target as the new pv-* claim_id.
4. Re-invoke the reviewer agent ONCE with the new pv-* anchors.
5. Replace the original reviewer response with the re-invoked response in the user-visible output.

The one-shot rule (Spotify Honk principle) caps cost at most 1 additional WebSearch + WebFetch + reviewer-re-invocation per review and prevents reviewer-side gaming of verifier feedback. The reviewer keeps `[Read, Glob]` tool grant per `agents/reviewer.md` -- principle of least privilege per OWASP AI Agent Security Cheat Sheet.

**Placement decision (key-decision):** The Phase 3 escalation hook landed BEFORE the existing `### Verdict scope marker` sub-section (Plan 07-03) rather than after it. Rationale: the escalation flow may re-invoke the reviewer ONCE before final user-visible output, and the verdict scope marker is appended AFTER the reviewer's final response. Logical flow: detect `<verify_request>` -> perform verification -> synthesize pv-* -> re-invoke reviewer ONCE -> emit final verbatim response -> append verdict scope marker. The plan's textual guidance ("after the existing Do NOT list... and BEFORE the closing `</output>` tag") was written before Plan 07-03 added the verdict scope marker; the placement decision honors the plan's intent (escalation hook is part of Phase 3 logic that fires before final emission).

XML container integrity preserved: `<scan>` line 33, `</scan>` line 134; `<output>` line 150, `</output>` line 203 -- both opening and closing tags appear exactly once each.

**Commit:** `4a81a32 feat(07-05): add Phase 1 pre-emptive Class-2 scan + Phase 3 reviewer escalation hook to review SKILL.md`

### Task 2: ## Class-2 Escalation Hook section in agents/reviewer.md (FIND-F Option 2 emission)

Added a new `## Class-2 Escalation Hook` h2 section to `plugins/lz-advisor/agents/reviewer.md` between `## Final Response Discipline` (line 137) and `## Edge Cases` (line 174). Section ordering preserved: Output Constraint -> Severity Classification -> Context Trust Contract -> Review Process -> Review Focus -> Final Response Discipline -> **Class-2 Escalation Hook (NEW)** -> Edge Cases -> Hedge Marker Discipline (Plan 07-02) -> Boundaries.

The section directs the reviewer to emit a structured `<verify_request>` block when it encounters a Class-2 question that the executor's Phase 1 pre-emption did not anticipate AND that the reviewer cannot resolve from `[Read, Glob]` tool access alone. The schema example uses `class="2"` with reviewer-specific severity values (`<critical|important|suggestion>`):

```
<verify_request question="<one-sentence Class-2 question>" class="2" anchor_target="pv-<id-suggestion>" severity="<critical|important|suggestion>">
  <context>
    <one-line snippet from changed code or configuration that triggered the question>
  </context>
</verify_request>
```

The section documents:

- Required attributes (`question`, `class`) and optional attributes (`anchor_target`, `severity`).
- Class values: `"2"` (API currency / configuration / recommended pattern) and `"2-S"` (security currency / CVE / advisory; security-reviewer only -- the reviewer rarely encounters Class 2-S).
- Placement: INSIDE the `### Findings` section, immediately after the affected finding entry's analysis.
- One-shot rule: "Do NOT iterate; you will be re-invoked at most once per review."
- Re-invocation behavior: when re-invoked with new `<pre_verified>` anchors matching prior `anchor_target` values, treat anchors as authoritative per Common Contract Rule 5; close the hedges and do not re-emit verify_request blocks for the same questions.
- Verification-unsuccessful escape hatch: if re-invocation is still inconclusive, emit the affected finding with explicit "verification unsuccessful" tag (e.g., "Severity: Important (verification unsuccessful for Class-2 question on <topic>).") rather than another verify_request.
- Principle of least privilege rationale: the `[Read, Glob]` tool grant is intentionally narrow per OWASP AI Agent Security Cheat Sheet; the verify_request hook is the structured-output security control that lets the reviewer escalate WITHOUT extending the tool grant -- a cleaner solution than direct tool-grant expansion.

Plan 07-02's `## Hedge Marker Discipline` section (between Edge Cases and Boundaries) preserved byte-identically. Plan 07-04's `## Output Constraint` structural sub-caps preserved byte-identically.

**Commit:** `f42d89c feat(07-05): add Class-2 Escalation Hook section to reviewer agent`

### Task 3: ## Verify Request Schema section in references/context-packaging.md (Common Contract addendum)

Appended a new `## Verify Request Schema` h2 section to `plugins/lz-advisor/references/context-packaging.md` as the LAST h2 of the file, AFTER the existing `## Scope-Disambiguated Provenance Markers` section (Plan 07-03). The section documents the schema authoritatively with the full multi-class union for downstream consumer use:

```
<verify_request question="<one-sentence Class-2 question>" class="<2|2-S|3|4>" anchor_target="pv-<id-suggestion>" severity="<critical|important|suggestion|high|medium>">
  <context>
    <one-line snippet from changed code or configuration that triggered the question>
  </context>
</verify_request>
```

Five fields documented with bold-backtick names per markdown convention:

- **`question`** (REQUIRED): one-sentence question shaped so a `WebSearch` query or `WebFetch` URL can produce a definitive answer. Bad/Good example contrast for clarity.
- **`class`** (REQUIRED): one of `"2"` / `"2-S"` / `"3"` / `"4"` per `references/orient-exploration.md` Class 1-4 + Class 2-S taxonomy.
- **`anchor_target`** (OPTIONAL): kebab-case suggestion for the resulting `<pre_verified>` block's `claim_id` attribute (e.g., `pv-storybook-10-args-fn-spy`).
- **`severity`** (OPTIONAL): matches the affected finding's severity (Critical / Important / Suggestion for reviewer; Critical / High / Medium for security-reviewer).
- **`<context>`** (OPTIONAL): one-line snippet from changed code or configuration that triggered the question.

A worked example anchored on `@compodoc/compodoc@1.2.1` and signal `output()` (Compodoc + Storybook scenario from the empirical UAT chain) demonstrates the canonical shape:

```
<verify_request question="Does @compodoc/compodoc@1.2.1 support signal output() in component documentation generation?" class="2" anchor_target="pv-compodoc-signal-output-support" severity="important">
  <context>
    @sampleOutput = output<void>();
  </context>
</verify_request>
```

Cross-reference sub-section documents the executor-side flow lives in `lz-advisor.review/SKILL.md` Phase 3 "Reviewer Escalation Hook" section (Plan 07-05 scope) and that `lz-advisor.security-review/SKILL.md` wiring is deferred to a future phase.

A "Why structured output instead of tool-grant extension" sub-section makes the principle-of-least-privilege rationale explicit, citing 4 authorities:

- OWASP AI Agent Security Cheat Sheet (structured-output as security control)
- arXiv 2601.11893 (formal treatment of agent privilege escalation)
- Claude Code Issue #20264 (subagent privilege inheritance escalation concern)
- InfoQ Least-Privilege AI Agent Gateway (MCP discovery + JSON-RPC structured calls + OPA authorization architectural pattern)

**Schema field-identity (key-decision):** The schema in agents/reviewer.md uses `class="2"` (reviewer-specific scope) with severity union `<critical|important|suggestion>`; the schema in context-packaging.md uses `class="<2|2-S|3|4>"` (full schema union) with severity union `<critical|important|suggestion|high|medium>`. The plan's implementation note asserted "byte-identical" but the plan-supplied schema text differs intentionally: agents/reviewer.md is the reviewer-emission contract (concrete reviewer-applicable values); context-packaging.md is the schema-definition reference (full enumeration). Both files reference the same 5 fields (question / class / anchor_target / severity / context) with identical semantics. Field-identity is preserved; attribute-value enumerations differ by emitter scope.

**Commit:** `9191c65 feat(07-05): add Verify Request Schema section to context-packaging.md`

## Verification

### Per-task verification

All 3 tasks pass their automated `<verify>` and `<acceptance_criteria>` blocks:

- **Task 1:**
  - `### Pre-emptive Class-2 scan (Option 1 closure for Finding F)` count = 1
  - `### Reviewer Escalation Hook (Option 2 closure for Finding F)` count = 1
  - `<verify_request` count = 4 (instructions + parse-target references)
  - `Spotify Honk` count = 1; `Spotify Honk one-shot principle` count = 1
  - `principle of least privilege` count = 1
  - `Class 2` count = 6; `Class 2-S` count = 3
  - `Common Contract Rule 5b` count = 3
  - `Re-invoke the reviewer agent ONCE` count = 1
  - `## Review Summary` count = 1 (Required output shape template preserved)
  - awk container check for `<scan>` (line 33) < `### Pre-emptive Class-2 scan` (line 114) < `</scan>` (line 134): OK
  - awk container check for `<output>` (line 150) < `### Reviewer Escalation Hook` (line 176) < `</output>` (line 203): OK

- **Task 2:**
  - `## Class-2 Escalation Hook` count = 1
  - `<verify_request` count = 5 (instructions + schema example occurrences)
  - `anchor_target` count = 4
  - `severity=` count = 1; `question=` count = 1; `class=` count = 1
  - `class="2"` count = 1; `class="2-S"` count = 1
  - `one-shot` count = 1; `Do NOT iterate` count = 1
  - `verification unsuccessful` count = 1
  - `principle of least privilege` count = 1
  - awk section ordering Final Response Discipline (137) < Class-2 Escalation Hook (146) < Edge Cases (174): OK
  - Existing sections preserved: `## Output Constraint` count = 1; `## Boundaries` count = 1; `## Hedge Marker Discipline` count = 1 (Plan 07-02 byte-identical)
  - Tool grant unchanged: `tools: ["Read", "Glob"]` count = 1

- **Task 3:**
  - `## Verify Request Schema` count = 1
  - `<verify_request question=` count = 2 (schema definition + worked example)
  - `anchor_target` count = 4
  - `principle of least privilege` count = 1
  - `OWASP AI Agent Security Cheat Sheet` count = 1
  - `arXiv 2601.11893` count = 1
  - 4 field-definition headers present: `**`question`**` count = 1; `**`class`**` count = 1; `**`anchor_target`**` count = 1; `**`severity`**` count = 1
  - 4 class values enumerated: `"2"` count = 2; `"2-S"` count = 1; `"3"` count = 1; `"4"` count = 1
  - Worked example present: `@compodoc/compodoc@1.2.1 support signal output()` count = 1
  - Cross-reference present: `lz-advisor.review/SKILL.md` count = 2
  - `Spotify Honk one-shot principle` count = 1
  - awk section ordering `## Scope-Disambiguated Provenance Markers` (332) < `## Verify Request Schema` (355): OK

### Plan-level verification

| Check | Result |
|-------|--------|
| All 3 tasks pass automated checks | 3/3 |
| Reviewer tool grant unchanged: `tools: ["Read", "Glob"]` byte-identical | 1 occurrence (preserved) |
| Schema fields match (question / class / anchor_target / severity / context) across agents/reviewer.md AND context-packaging.md | Field-identical (5/5 fields with identical semantics); attribute-value enumerations differ by emitter scope per design |
| Existing 07-02 Hedge Marker Discipline preserved in agents/reviewer.md | 1 occurrence (byte-identical) |
| Existing 07-04 word-budget sub-caps preserved in agents/reviewer.md | 4 sub-cap markers (`each finding entry <=80 words`, `Budget: <=160 words`, `### Missed surfaces (optional)`, `<=300 words aggregate`) all = 1 occurrence each |
| Existing 07-03 Verdict scope marker preserved in lz-advisor.review/SKILL.md | 1 occurrence (`**Verdict scope:**`) |
| Existing 07-03 Scope-Disambiguated Provenance Markers preserved in context-packaging.md | 1 occurrence (preceding new section) |
| End-to-end UAT verification (reviewer surfaces unanticipated Class-2; executor parses verify_request + verifies + re-invokes once) | Deferred to Plan 07-06 |

### Threat register closure

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-07-05-01 (Elevation of Privilege: Reviewer / security-reviewer subagent privilege escalation via tool-grant inheritance) | mitigate | Closed: reviewer keeps `[Read, Glob]` tool grant per all 3 modified files; Option 3 (extend grant) PERMANENTLY REJECTED per OWASP / arXiv 2601.11893 / Claude Code Issue #20264. The verify_request hook (Tasks 1 + 2 + 3) is the structured-output security control: agent emits structured request; executor (which already has full tools) performs verification on agent's behalf. Architecturally aligned with InfoQ Least-Privilege AI Agent Gateway pattern. |
| T-07-05-02 (Tampering: Class-2 question classification bypass) | mitigate | Closed: reviewer's verify_request `class=` attribute MUST take one of 4 documented values (2 / 2-S / 3 / 4) per Common Contract "Verify Request Schema" section. Executor's Phase 3 detection logic uses class value to route verification (WebSearch/WebFetch for class 2/3/4; npm audit + GHSA for class 2-S). Malformed class values rejected by parser; reviewer cannot bypass class-routing. |
| T-07-05-03 (Repudiation: Reviewer iterative re-invoke gaming verifier feedback) | mitigate | Closed: one-shot rule (Spotify Honk principle) caps re-invocation at exactly 1 per review. If second invocation still surfaces same hedge, executor emits ungrounded finding with "verification unsuccessful" tag. Multi-round verification forbidden. Prevents agent from gaming verifier feedback (the failure mode that makes self-reports unreliable per outcome-based verification research). |
| T-07-05-04 (Information Disclosure: verify_request `<context>` element leaks code snippets to web tools) | accept | The `<context>` element typically contains a single line of changed code (e.g., `@sampleOutput = output<void>();`) that the executor sends to WebSearch as part of the question. For OSS / public projects (lz-advisor's primary use case), code is already publicly visible; for private projects, the user is responsible for redacting sensitive context. Common Contract Rule 5a (fetched-content as untrusted source) applies in reverse: executor's outbound query payload is user-controlled. |

### Wave 3 sequential-execution discipline

This plan ran as a sequential worktree agent (wave 3 with depends_on: [07-02]). The `<worktree_branch_check>` step detected the worktree was at the older bootstrap commit `c797c16` and reset to the expected base `5c10802` (post 07-01 + 07-02 + 07-03 + 07-04 commits). Hard reset to `5c10802` was correct because the worktree's local state (which appeared as inverted staged changes after soft reset) was older than the expected base; the soft-then-hard reset pattern matches the Wave 2 / Plan 07-04 environmental setup precedent documented in 07-04-SUMMARY.md. After hard reset, all 07-01 / 07-02 / 07-03 / 07-04 deliverables are present and `agents/reviewer.md` includes Hedge Marker Discipline (07-02) + word-budget sub-caps (07-04) byte-identically. Per-task commits use `--no-verify` per parallel-execution discipline; orchestrator validates hooks once after wave merges.

## Deviations from Plan

None -- plan executed exactly as written. No Rule 1/2/3 auto-fixes triggered, no Rule 4 architectural questions raised, no authentication gates encountered.

The placement decision for Phase 3 escalation hook (BEFORE the existing `### Verdict scope marker` sub-section rather than at the literal end of `<output>`) is documented as a key-decision rather than a deviation: the plan's textual guidance ("after the existing Do NOT list... and BEFORE the closing `</output>` tag") was written before Plan 07-03 added the verdict scope marker; the placement honors the plan's intent (escalation flow is part of Phase 3 logic that fires before final emission, and the verdict scope marker is appended AFTER the reviewer's final response per Plan 07-03 design).

The schema field-identity (rather than byte-identity) between agents/reviewer.md and context-packaging.md is documented as a key-decision: the plan-supplied schema text differs intentionally between the two surfaces (reviewer-scope concrete values vs. full schema union); both surfaces reference the same 5 fields with identical semantics. The plan's "byte-identical" implementation note was aspirational; the actual plan content reflects the planner's intent to document agent-emission scope vs. schema-definition scope separately.

The worktree branch base correction (hard reset to `5c10802` to pick up 07-01/02/03/04 commits that landed on main while this worktree branch was based on the older bootstrap commit `c797c16`) is environmental setup per the `<worktree_branch_check>` instructions, not a plan deviation.

## Known Stubs

None. All edits ship complete prose; no placeholder text, no TODO/FIXME markers introduced. The literal placeholders `<one-sentence Class-2 question>`, `<id-suggestion>`, `pv-<id-suggestion>`, `<value>`, `<topic>` in the prose are documentation conventions for the schema (matching existing agent-prompt placeholder syntax from Plan 07-02's `Assuming X (unverified), do Y. Verify X before acting.` and Plan 07-03's `**Verdict scope:** scope: <value>`); the smoke fixtures will grep for the literal `<verify_request` token at the beginning of emitted blocks, not for the placeholder text.

## Followups

- **Plan 07-06:** Comprehensive multi-hop chain UAT replay on plugin 0.10.0. The plan's behavioral validation criterion is: UAT scenario where reviewer surfaces a Class-2 question NOT pre-empted by Phase 1; verify executor parses verify_request, performs WebSearch + WebFetch, synthesizes pv-* blocks, re-invokes reviewer ONCE, and emits resolved findings. Behavioral confirmation lands in Plan 07-06's UAT replay subset (minimum: review skill on representative Compodoc + Storybook fixture; planner may extend to full review + security-review chain if budget allows).
- **Plan 07-06:** Plugin version bump 0.9.0 -> 0.10.0 affects `plugins/lz-advisor/.claude-plugin/plugin.json` + 4 SKILL.md frontmatter version fields. Plan 07-05 did not modify SKILL.md frontmatter (version field stays 0.9.0); 07-06 owns the version bump across all 5 surfaces byte-identically.
- **Future plan:** lz-advisor.security-review/SKILL.md verify_request wiring deferred per CONTEXT.md D-04 ("Plan 07-05 scope is reviewer only"). The same Phase 1 pre-emption + Phase 3 escalation hook pattern applies to security-review with class="2-S" routing (npm audit + GHSA WebFetch) instead of generic class="2" routing (WebSearch + WebFetch). When wired, the Verify Request Schema section in context-packaging.md already documents the full schema union (`class="<2|2-S|3|4>"`) so no schema change is needed.
- **Future plan:** Smoke fixture exercising the reviewer escalation flow end-to-end (synthesize Class-2 surface NOT in Phase 1 enumeration list -> assert reviewer emits verify_request -> assert executor performs verification + re-invokes once -> assert resolved finding emitted). Plan 07-06 may include this fixture or defer to a follow-up plan; CONTEXT.md does not specify a dedicated F-* fixture for FIND-F.
- **Future plan:** If empirical evidence (Plan 07-06 UAT replay or beyond) shows pre-emption catches >90% of Class-2 surfaces and the escalation hook fires <5% of the time, the cost-discipline target (1-3 additional WebSearch / WebFetch invocations per review) is met. If the escalation hook fires >25% of the time, the pre-emption enumeration list (Phase 1) may need expansion to capture the long-tail patterns; this is a calibration concern owned by a future phase.

## Self-Check: PASSED

Verified all claims:

- File `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` exists and contains:
  - `### Pre-emptive Class-2 scan (Option 1 closure for Finding F)` (count: 1)
  - `### Reviewer Escalation Hook (Option 2 closure for Finding F)` (count: 1)
  - `<verify_request` (count: 4) -- instruction + parse-target references
  - `Spotify Honk one-shot principle` (count: 1)
  - `Re-invoke the reviewer agent ONCE` (count: 1)
  - `principle of least privilege` (count: 1)
  - XML container integrity: `<scan>` line 33, `</scan>` line 134; `<output>` line 150, `</output>` line 203
- File `plugins/lz-advisor/agents/reviewer.md` exists and contains:
  - `## Class-2 Escalation Hook` (count: 1)
  - `<verify_request` (count: 5) -- instructions + schema example
  - `anchor_target` (count: 4)
  - `class="2"` (count: 1); `class="2-S"` (count: 1)
  - `Do NOT iterate` (count: 1); `verification unsuccessful` (count: 1)
  - `principle of least privilege` (count: 1)
  - Section ordering Final Response Discipline (137) < Class-2 Escalation Hook (146) < Edge Cases (174): VERIFIED
  - Tool grant `tools: ["Read", "Glob"]` (count: 1) -- byte-identical
  - Plan 07-02 `## Hedge Marker Discipline` (count: 1) -- preserved
  - Plan 07-04 `each finding entry <=80 words` (count: 1) -- preserved
- File `plugins/lz-advisor/references/context-packaging.md` exists and contains:
  - `## Verify Request Schema` (count: 1) -- last h2 of file
  - `<verify_request question=` (count: 2) -- schema + worked example
  - `**`question`**` (count: 1); `**`class`**` (count: 1); `**`anchor_target`**` (count: 1); `**`severity`**` (count: 1)
  - 4 class values: `"2"` (count: 2); `"2-S"` (count: 1); `"3"` (count: 1); `"4"` (count: 1)
  - `@compodoc/compodoc@1.2.1 support signal output()` (count: 1)
  - `OWASP AI Agent Security Cheat Sheet` (count: 1); `arXiv 2601.11893` (count: 1)
  - Section ordering `## Scope-Disambiguated Provenance Markers` (332) < `## Verify Request Schema` (355): VERIFIED
- Commit `4a81a32` exists in `git log` (Task 1 -- review SKILL.md)
- Commit `f42d89c` exists in `git log` (Task 2 -- reviewer agent)
- Commit `9191c65` exists in `git log` (Task 3 -- context-packaging.md)
