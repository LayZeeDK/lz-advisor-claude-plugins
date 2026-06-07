# Phase 12: Atomic grouped-grammar rewrite - Research

**Researched:** 2026-06-07
**Domain:** LLM output-grammar rewrite across coupled Markdown/YAML surfaces (Claude Code plugin agents + skills + self-extracting bash fixtures), zero runtime code
**Confidence:** HIGH

## Summary

Phase 12 changes the OUTPUT GRAMMAR of two Opus review agents from inline two-inline-code-span fragment shorthands (`<path>:<line>: crit: <problem>. <fix>.`) to findings GROUPED under fully spelled-out severity headlines (`### Critical` / `### Important` / `### Suggestions` / `### Questions`) with continuous integer numbering, explicit `(none)` empty-section markers, and the OWASP `[Axx]` tag preserved for security. The change is deliberately atomic because LLMs reproduce the FORMAT PATTERN of worked examples more reliably than they follow stated rules -- a partial rewrite (legend-but-not-examples, or one agent but not the other) produces mixed shorthand/spelled-out output. This is the documented Phase 7 "WR-05 scar": the legend was updated to the unified lexicon but a worked example at `context-packaging.md:317` still showed `Severity: High`, drifting from the new rule. The external research is unambiguous and CONVERGENT with the locked decisions: "Language models are pattern-followers more than rule-followers" and example format dominates stated instructions when the two conflict.

The surface map is larger and more coupled than the CONTEXT.md line-number estimates suggest, and one estimate is materially wrong. CRITICAL CORRECTION: the agents do NOT currently emit per-severity headers OR a single `### Findings` header that simply needs renaming. Each agent's Output Constraint mandates the response BEGIN with literal `### Findings` and LATER contain `### Cross-Cutting Patterns` (reviewer) / `### Threat Patterns` (security). Severity lives INLINE inside each finding line, not in a header. The rewrite REPLACES the single `### Findings` header with four severity sections, moves the severity signal from the inline token to the section header, and prepends continuous `N.` numbers. The two budget fixtures SELF-EXTRACT the holistic worked example from the agent file, strip the `> ` blockquote, and parse it -- so the agent example rewrite and the fixture parser rewrite are mechanically coupled, not merely "kept in sync."

A second high-value finding bears directly on Phase 13 (and frames what "the user sees the headlines" actually means): the Claude Code terminal markdown renderer does NOT differentiate heading levels. It strips the `###` syntax markers and renders the heading text in bold, with all heading levels visually identical (anthropics/claude-code#26390, closed-not-planned, Feb 2026). The literal `### Critical` text does NOT reach the terminal as `### Critical`; the user sees a bold "Critical" section label. This SATISFIES the success criterion (findings grouped under spelled-out severity headlines -- a bold "Critical" label IS a visible group headline) and does not break anything, but the planner and Phase 13 must understand that the literal-`###`-reaching-the-user framing is about the RAW agent text captured in `--output-format stream-json`, not the rendered terminal glyphs. Do not write a Phase 12 verification step that greps the rendered terminal for the literal string `### Critical`.

**Primary recommendation:** Plan ONE atomic unit. Sequence the rewrite legend-first, then ALL worked examples (in both agents) to match the legend byte-for-byte, then both skill contracts, then `context-packaging.md` display surfaces, then both fixtures (parser + embedded/self-extracted sample), then the 5-surface version bump -- with a final cross-surface self-audit grep that asserts ZERO `crit:|imp:|sug:|q:` tokens survive in the two agent files and that every worked example renders under one of the four headers. Run both fixtures RED-then-GREEN within the unit to prove the retarget.

## Architectural Responsibility Map

This is a documentation/prompt-engineering phase with no application tiers. The "tiers" are the plugin's component layers; the map shows which layer owns the grammar so the planner can sanity-check that each surface is touched by the right task.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Emit the grouped severity grammar (headers + numbered lines + `(none)`) | Agent layer (reviewer.md, security-reviewer.md Output Constraint + worked examples) | -- | Route A (locked): agents emit the shape directly; this is where legend + examples + `<output_constraints>` live |
| Carry the grouped headers to the user intact | Skill layer (review/SKILL.md, security-review/SKILL.md render-verbatim contract) | -- | The skill names the literal headers that MUST reach the user and forbids reformatting; SKILL-01 inverts the old prohibition |
| Cross-agent severity vocabulary consistency | Reference layer (context-packaging.md) | Skill layer | Display labels vs machine `severity=` attribute disposition (D-08); the Verification template's input-`### Findings` is a DIFFERENT surface from the agent's output-`### Findings` |
| Regression gate on the grammar | Test layer (tests/D-*-budget.sh) | Agent layer (self-extract source) | Fixtures self-extract the agent holistic example; parser + sample retarget in lockstep (D-10) |
| Version identity | Manifest + frontmatter (plugin.json + 4 SKILL.md `version:`) | Docs (README "What's New") | 5-surface atomic bump convention (SYNC-02) |

## Standard Stack

No external libraries are installed or recommended. This is a pure Markdown/YAML + bash-fixture phase. The "stack" is the existing toolchain:

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| bash + coreutils (`awk`, `sed`, `wc`, `tr`, `printf`) | Git Bash on Windows | Self-extracting budget fixtures; zero-dependency parser | [VERIFIED: tests/D-reviewer-budget.sh:23] -- existing fixtures are "Standalone, zero-dependency: bash + coreutils only (no shared helper lib)" |
| `git grep` | ARM64-native | Per-surface disposition sweep, residue check | [CITED: CLAUDE.md] -- mandated over grep on this machine |
| `claude -p --output-format stream-json` | current CLI | Phase 13 headless UAT (NOT this phase) | [VERIFIED: CLAUDE.md Conventions] -- documented headless verification path |

### No packages installed

This phase installs zero packages. The Package Legitimacy Audit section is N/A and omitted.

## Package Legitimacy Audit

N/A -- this phase installs no external packages (Markdown/YAML/bash only). No registry verification, slopcheck, or postinstall audit required.

## Architecture Patterns

### System Architecture Diagram (data flow through the review pipeline)

```
USER prompt ("review my changes")
   |
   v
[review/SKILL.md]  Phase 1 Scan  ->  Phase 2 Consult  ->  Phase 3 Output
   |  (executor: Sonnet)               |                      |
   |  scans diff, curates 3-5          |  Agent tool          |  render VERBATIM
   |  findings, packages prompt        |  invokes reviewer    |  + scope summary
   |  using context-packaging.md       |  (Opus)              |  + verify_request hook
   |  Verification template            |                      |
   |  (## Findings = INPUT shape)       v                      v
   |                          [agents/reviewer.md]      USER sees (terminal):
   |                          Output Constraint:        bold "Critical" label
   |                          emits grouped grammar     numbered findings
   |                          ### Critical              bold "Important" ...
   |                          1. path:line: ...         (### stripped, text bolded
   |                          ### Important             per renderer #26390)
   |                          (none)
   |                          ### Suggestions
   |                          ### Questions
   |                          ### Cross-Cutting Patterns
   |
   v
[tests/D-reviewer-budget.sh]  <-- SELF-EXTRACTS the holistic worked example
   self-extract mode: awk-range "> ### Findings" .. end-of-blockquote,
   strip "> " + backticks, parse with FRAGMENT_RE, assert per-section budgets.
   (security fixture is the same shape + OWASP [Axx] slot + 75w CVE carve-out)
```

The security-review pipeline is identical with `security-reviewer.md` / `### Threat Patterns` / OWASP `[Axx]` substituted.

### Recommended Project Structure

No new files. The phase edits exactly these existing surfaces (verified line numbers as of HEAD 2026-06-07):

```
plugins/lz-advisor/
|-- .claude-plugin/plugin.json          # :3 "version": "1.0.0"  -> 1.0.1
|-- agents/
|   |-- reviewer.md                      # legend :64-67; worked examples :96-134; output begins ### Findings :57
|   '-- security-reviewer.md             # legend :65-68 (+ formerly-residue :66-67); OWASP examples :100-141
|-- skills/
|   |-- plan/SKILL.md                    # :18 version: 1.0.0 -> 1.0.1 (version surface only)
|   |-- execute/SKILL.md                 # :19 version bump; :261 "### Findings" negative ref (disposition: see SYNC-01)
|   |-- review/SKILL.md                  # :19 version; :165/:175/:178-184 render-verbatim + invert prohibition
|   '-- security-review/SKILL.md         # :19 version; :151/:161/:164-170 render-verbatim + invert prohibition
|-- references/context-packaging.md      # :286-294 INPUT Findings template (severity LABELS); :378/:390/:402 severity= attr (lowercase, KEEP)
'-- README.md                            # :77 "## What's New"; :79 ### 1.0.0 -> add ### 1.0.1
tests/
|-- D-reviewer-budget.sh                 # SEV :131; FRAGMENT_RE :132; body-strip :148; anti-vacuous :183
'-- D-security-reviewer-budget.sh        # SEV :107; FRAGMENT_RE :108; body-strip :127; anti-vacuous :158
```

### Pattern 1: Grouped-severity report (industry-validated target shape)

**What:** Findings emitted under fixed-order named severity sections, each finding a numbered line; severity carried ONCE by the section header, not repeated inline.
**When to use:** This is the locked target (D-01..D-07). Validated against industry practice below.
**Example (target grammar, reviewer):**
```
### Critical

1. src/auth.ts:42: user can be null after .find(). Add guard before .email.
2. src/auth.ts:88: password compared with == (timing attack). Replace with bcrypt.compare.

### Important

3. src/client.ts:23: no retry on 429. Wrap in withBackoff(3).

### Suggestions

4. src/api.ts:88-140: 50-line fn does 4 things. Extract validate / normalize / persist.

### Questions

(none)

### Cross-Cutting Patterns

Findings 1, 2, and 3 share a root cause: missing input validation at boundary handlers.
```
[ASSUMED] -- this is the researcher's reconstruction of the target shape from the locked decisions D-01..D-07; the planner authors the canonical examples. Severity sits in the header (D-05), numbers are continuous across sections (D-06), empty sections show `(none)` (D-04), trailing analytical section preserved (D-03).

**Security variant** keeps the OWASP tag immediately after location (D-07): `1. src/handler.ts:42: [A04] JSON.parse on raw req.body crashes on malformed input. Wrap in try / catch + reject with 400.`

### Pattern 2: Format-instruction sandwich (the few-shot drift mitigation)

**What:** State the output-format rule BEFORE the worked examples AND restate it AFTER the examples block.
**Why:** [VERIFIED: multiple sources] "To avoid context loss, the strict output format specification has to be restated after the examples" and "instruction-first prompts noticeably reduce output drift versus context-first prompts." The agents already have an `<output_constraints>` XML block AFTER the worked examples (reviewer.md:160-187) -- this is the post-example restatement and it is load-bearing for drift control. The planner must update BOTH the pre-example legend AND the post-example `<output_constraints>` headings so the sandwich stays consistent.

### Anti-Patterns to Avoid

- **Partial example rewrite (the WR-05 scar):** Updating the legend but leaving any worked example in the old grammar. [VERIFIED: PROJECT.md:136] -- in Phase 7, `context-packaging.md:317` retained `Severity: High` after the lexicon was unified, producing a documented drift warning. Every one of the 8+ examples (reviewer: 4 standalone INCORRECT/CORRECT pairs + verify_request example + hedge example + 7-finding holistic; security: 4 pairs + verify_request + hedge + auto-clarity CVE example + 6-finding holistic) must change together.
- **Renaming `### Findings` -> `### Critical` mechanically:** WRONG mental model. The single `### Findings` header is REPLACED by four headers; the inline severity token is DROPPED (D-05); a leading `N.` number is ADDED (D-06). It is a restructure, not a rename.
- **Counting the severity header or `(none)` inside a per-finding word budget:** the section header and `(none)` marker sit OUTSIDE every counted span (see Common Pitfalls / wc -w gotcha). Do not let the body-strip regex accidentally include them.
- **Touching the lowercase `severity=` XML attribute:** D-08 -- `<verify_request ... severity="important"/>` stays lowercase machine-lexicon. It is NOT a display surface.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Severity vocabulary | A new/expanded tier set (Blocker/Major/Minor) | The locked unified Critical/Important/Suggestion/Question set | [CITED: REQUIREMENTS.md Out of Scope] -- expanding tiers is explicit scope creep; 4 named tiers is the industry norm |
| Empty-section signaling | Custom omit-when-empty logic | Always-emit + literal `(none)` (D-04) | Constant report shape keeps the fixture parser deterministic; matches SARIF `results: []` "clean scan" convention |
| Severity-to-rendering mapping | Color/emoji/icon markers | Plain spelled-out text headers | [CITED: REQUIREMENTS.md Out of Scope] -- emoji violates ASCII-only (cp1252 mojibake on Windows); the terminal renderer would not differentiate anyway |
| Fixture parser | A regex/AST library or new helper lib | bash `awk`/`sed`/`wc` header-tracking parser, reusing the Phase 11 scaffold | [VERIFIED: tests/D-reviewer-budget.sh:23] -- zero-dependency is the established fixture contract |

**Key insight:** The grouped-severity report shape is a SOLVED industry convention -- Conventional Comments (label/decoration vocabulary), SARIF (error/warning/note + Critical/High/Medium/Low security severity), reviewdog (RDFormat severity). The locked decisions reproduce the conventional shape with two project-specific simplifications (spelled-out section headers instead of inline labels; `(none)` instead of omitting). Do not reinvent; do not deviate from the locked shape.

## Industry Convention Validation (locked decisions D-01..D-07 vs real-world practice)

Per the objective: validate or challenge the locked decisions, but DO NOT propose reopening them -- flag only if a locked decision would actively break a downstream consumer. Result: every locked decision is consistent with or directly supported by industry practice. No downstream-breaking conflict found.

| Decision | Industry practice | Verdict |
|----------|-------------------|---------|
| D-01/D-02 four fixed-order severity sections | SARIF uses a fixed 3-level (error/warning/note) + CVSS 4-tier (Critical/High/Medium/Low) severity taxonomy [CITED: docs.github.com SARIF] | CONSISTENT -- 4 named tiers is the norm |
| D-04 always-emit `(none)` empty sections | SARIF `results: []` is the valid "clean scan" indicator; constant shape aids machine parsing [CITED: docs.github.com SARIF] | CONSISTENT -- explicit-empty beats omit |
| D-05 severity in header, dropped inline | Conventional Comments carries the label ONCE per comment, not repeated [CITED: conventionalcomments.org] | CONSISTENT -- single source of severity |
| D-06 continuous numbering across sections | Not a universal convention (reviewdog/SARIF use file:line as identity, not ordinal); but D-06 is REQUIRED here because `Cross-Cutting Patterns`/`Threat Patterns`/`Per-finding validation` reference findings by ordinal ("Findings 1, 2, 4") | CONSISTENT with project's own cross-reference need; continuous (not per-section restart) is correct -- per-section restart makes "Finding 2" ambiguous |
| D-07 OWASP `[Axx]` after location | SARIF rule-id + tags; security tools tag findings with category codes | CONSISTENT |

**One flag (non-blocking, NOT a reopen):** Conventional Comments and RPT-F02 (deferred) treat `question` as a KIND, not a severity tier. D-06/the locked vocabulary keep `Question` as a fourth severity-section. This is internally consistent for v1.0.1 (the deferred RPT-F02 explicitly owns the kind/severity axis split). No downstream consumer breaks because the four sections are all top-level `###` headers the skill passes through verbatim regardless of semantic axis. No action; recorded for the Phase 13 audit trail.

## Common Pitfalls

### Pitfall 1: Few-shot drift from partial example rewrite (HIGHEST RISK -- the central planning challenge)

**What goes wrong:** The agent emits MIXED output -- some findings under the new grouped headers, some in old `crit:` shorthand -- because one or more worked examples were left in the old grammar, and the model patterns off the surviving old example.
**Why it happens:** [VERIFIED: WebSearch, multiple sources] "Language models are pattern-followers more than rule-followers"; example FORMAT dominates stated instructions when they conflict (Min et al. 2022: models latch onto format pattern even when example content is irrelevant). The agent file is the agent's full system prompt; a single surviving `crit:` example is a competing pattern.
**How to avoid (planner sequencing + verification):**
1. **Single atomic unit (D-11):** both legends + every worked example + both `<output_constraints>` blocks + both skill contracts + context-packaging display surfaces + both fixtures + version bump in ONE phase, ideally with the agent-file rewrites in adjacent tasks so no intermediate commit ships a half-converted agent.
2. **Instruction sandwich:** update the pre-example legend AND the post-example `<output_constraints>` block so the format spec brackets the examples (instruction-first + restate-after both reduce drift).
3. **Examples-match-rules invariant:** after rewriting, the worked examples must agree with the legend byte-for-byte. The single most effective check is a mechanical one (see verification below).
4. **Per-agent completeness self-audit:** for EACH agent file, enumerate every blockquoted finding line and confirm it renders under one of the four headers with a leading `N.` and NO inline `crit:|imp:|sug:|q:` token.
**Warning signs:** a `git grep -nE 'crit:|imp:|sug:| q:' plugins/lz-advisor/agents/` returning ANY hit after the rewrite; a worked example whose header says `### Important` but whose body still has `imp:`; the holistic example's finding count drifting so the fixture's `MIN_FINDINGS=5` anti-vacuous guard no longer matches.

### Pitfall 2: Fixture/example coupling break (self-extract range)

**What goes wrong:** The fixture's self-extract `awk` range no longer bounds the holistic example correctly after the example is restructured into four sections, OR the new FRAGMENT_RE matches zero lines, OR the body-strip regex leaves the `N.`/`[Axx]` in the counted span and silently inflates `wc -w`.
**Why it happens:** The fixtures DON'T just parse a separate sample -- in default mode they self-extract the holistic worked example FROM the agent file (`awk '/^> ### Findings$/{f=1} f && /^>/{print} f && !/^>/{exit}'`). The new holistic example is a multi-section blockquote; the extract terminator (first non-`>` line) still works IF the example stays one contiguous blockquote, but the FRAGMENT_RE that today matches `^path:line: (crit|imp|sug|q): ` will match NOTHING against `1. path:line: <body>`.
**How to avoid:**
- Rebuild FRAGMENT_RE as a header-tracking + numbered-line parser (see Code Examples below). Track the current `### Severity` header; count lines matching `^[0-9]+\. <path>:<line[-range]>: ` beneath it; for security also assert the `[Axx]` bracket.
- Body-strip regex must strip `^[0-9]+\. [^[:space:]]+:[0-9]+(-[0-9]+)?: ` (review) and additionally `\[[^]]+\] ` (security) so the counted span stays the `<problem>. <fix>.` body -- preserving the existing "prefix EXCLUDED from span" semantics.
- Keep the `SEV` single-definition pattern the existing fixtures use (WR-05 mitigation baked into the fixture: the alternation is defined once and interpolated into both match and strip so they cannot diverge). For the new grammar there is no inline severity alternation; the equivalent single-source-of-truth is the header regex + the number-prefix regex.
- Preserve the anti-vacuous `matched_count >= MIN_FINDINGS` guard (D-10) BEFORE the budget loop.
**Warning signs:** `"0 findings parsed"` on a green run (the documented silent-pass signal the fixtures already print at D-reviewer-budget.sh:158); `--self-test` no longer exiting non-zero.

### Pitfall 3: CRLF on Windows + Git Bash corrupts the parser

**What goes wrong:** A trailing `\r` on each line breaks exact-match `awk` heading lookups and inflates/zeros `wc -w` spans.
**Why it happens:** Windows + Git Bash traces are CRLF-terminated by default; the repo runs on Windows (CLAUDE.md).
**How to avoid:** The existing `--from-trace` mode already normalizes with `tr -d '\r'` (D-reviewer-budget.sh:108). Keep that. For the NEW grouped-header parser, prefer TOLERANT anchored heading matches (`$0 ~ /^### Critical/` not `$0 == "### Critical"`) -- the security fixture already learned this lesson (WR-03 at D-security-reviewer-budget.sh:194-196: "Exact-match silently failed ... on any heading drift (trailing space, a changed parenthetical, casing, or a surviving CR)"). Anchored-prefix match + explicit presence pre-check is the robust pattern.
**Warning signs:** fixture green on Linux, red on Windows, or vice versa.

### Pitfall 4: `wc -w` "budget-neutral" assumption (the 3x-burned trap)

**What goes wrong:** Assuming the spell-out and regrouping are budget-neutral, then discovering empirically they are not.
**Why it happens:** [VERIFIED: STATE.md:103] -- "the project has been burned 3x assuming budget-neutrality." BPE-level reasoning says `crit` and `Critical` are each ~1 token and `wc -w` counts the body span excluding the prefix, so the change LOOKS neutral. But emergent prose surfaces (e.g., the "Severity revisions vs. executor:" surface that drove 50-100w overshoot on 0.12.1, per security-reviewer.md:194) are exactly what neutrality reasoning misses.
**How to avoid:** Phase 12 RE-SCOPES the existing per-fragment sub-caps to per-section sub-caps 1:1 (D-09: old `crit` cap -> Critical section cap; aggregate unchanged). Do NOT reason about neutrality in the plan. Phase 13 measures it empirically (n>=3). The Phase 12 fixture asserts the SAME per-section caps against the NEW grammar's body spans -- if the body span is genuinely unchanged (same `<problem>. <fix>.` text), the per-finding caps pass trivially; that is a STRUCTURAL check, not an empirical neutrality claim.
**Measurement methodology for Phase 13 (surface, do not assert):** the four `### Severity` header lines and `(none)` markers add words to a NAIVE whole-report `wc -w` but are NOT inside any per-section counted span (per-finding bodies exclude prefixes; patterns sections are range-bounded between their own headers). The correct measurement is per-section spans matching the `<output_constraints>` caps, not a whole-report count. The aggregate cap is `none` (the agents removed it in Phase 7); the binding gates are per-section. Phase 13's n>=3 should measure per-section spans, and separately note the whole-report delta for transparency.

### Pitfall 5: Conflating the two `### Findings` surfaces in context-packaging.md

**What goes wrong:** Renaming the INPUT-side `### Findings` in the Verification template (context-packaging.md:286-294) or the `### Findings` worked example at :396, mistakenly treating them as agent-OUTPUT display surfaces.
**Why it happens:** The string `### Findings` appears on BOTH (a) the agent's OUTPUT contract (agents/*.md, skills render-verbatim) AND (b) the executor's INPUT packaging to the agent (context-packaging.md Verification template: "## Findings [Numbered list of 3-5 curated findings]"). These are different directions of data flow.
**How to avoid:** The SYNC-01 per-surface disposition table MUST classify each `### Findings` hit. The INPUT-side packaging Findings list (context-packaging.md:286-294, :396-411 Verify Request worked example) is the executor's prompt TO the agent -- it is NOT the user-facing grouped report and should generally stay as-is (it carries `Severity (initial): [Critical/Important/Suggestion]` LABELS already, not the shorthand). The OUTPUT-side `### Findings` in the agents + skills IS the rewrite target. See the disposition table below for every hit.

### Pitfall 6: The `execute/SKILL.md:261` negative reference

**What goes wrong:** Leaving `execute/SKILL.md:261` ("Do not fabricate `### Findings` entries with severity tags -- the advisor does not produce that shape") stale, OR over-editing it.
**Why it happens:** It references the OLD reviewer/security-reviewer output shape (`### Findings` with inline severity tags) to tell the ADVISOR agent NOT to produce that shape. After Phase 12 the reviewer shape is no longer "`### Findings` with severity tags" -- it is four severity sections. The sentence's INTENT (advisor emits a 100-word enumerated response, not a findings-list) is unchanged, but its literal description of the reviewer shape is now imprecise.
**How to avoid:** Include this hit in the SYNC-01 disposition table. The safe disposition is a minimal precision edit (e.g., "Do not fabricate a reviewer-style grouped findings report -- the advisor does not produce that shape") so it does not assert a grammar that no longer exists. Flag for the planner as a discretion call; it is low-risk either way because it is a negative instruction to a DIFFERENT agent (advisor), not part of the reviewer/security-reviewer output contract.

## Per-Surface Disposition Table (SYNC-01 input -- every operational `git grep` hit)

Classified per D-08: (a) display label -> rename to grouped grammar; (b) machine attribute / input-packaging -> keep; (c) frozen `.planning/` history -> untouched (Phase 9 precedent; ~362 artifacts, not swept). All line numbers verified at HEAD 2026-06-07.

| Surface | Lines | Content | Disposition |
|---------|-------|---------|-------------|
| reviewer.md Output Constraint | :53, :57 | "MUST begin with `### Findings`" + literal header | (a) CHANGE -- replace single-header contract with four-severity-section contract (RPT-01, AGNT-01, SKILL-01 coupling) |
| reviewer.md legend | :64-67 | `crit:`/`imp:`/`sug:` shorthand legend | (a) CHANGE -- rewrite to section-header grammar definition |
| reviewer.md "use `sug:` instead" | :73 | drop-list reference to shorthand | (a) CHANGE -- update to new grammar's mechanism |
| reviewer.md worked examples | :96, :104, :112, :116, :121 | standalone CORRECT examples + verify_request + hedge | (a) CHANGE -- convert each to grouped grammar |
| reviewer.md holistic example | :125-142 | 7-finding `### Findings` + Cross-Cutting | (a) CHANGE -- restructure into 4 sections; FIXTURE SELF-EXTRACTS this |
| reviewer.md `<output_constraints>` | :160-187 | `<heading>### Findings</heading>` + section names | (a) CHANGE -- post-example restatement; add four severity sections |
| reviewer.md verify_request `severity=` | :117, :133, :261 | `severity="important"` machine attr | (b) KEEP lowercase (D-08, AGNT-03) |
| reviewer.md `### Cross-Cutting Patterns` | :136, :146, :150, :175 | trailing analytical section | (b) KEEP header name; ensure it sits AFTER the 4 severity sections (D-03); ordinal refs use continuous numbers (D-06) |
| reviewer.md Hedge/Class-2 prose refs to `### Findings` | :256, :272, :322 | "inside the `### Findings` section" | (a) CHANGE -- reword to "inside the relevant severity section" |
| security-reviewer.md Output Constraint | :54, :58 | "MUST begin with `### Findings`" + `### Threat Patterns` | (a) CHANGE -- same as reviewer + Threat Patterns trailing |
| security-reviewer.md legend | :65-68 | shorthand + `(formerly High)`/`(formerly Medium)` residue | (a) CHANGE + STRIP residue (AGNT-01, D-11: no third-gen "formerly X") |
| security-reviewer.md "use `sug:` instead" | :76 | drop-list reference | (a) CHANGE |
| security-reviewer.md worked examples | :100, :108, :116, :123, :127 | OWASP examples + verify_request + hedge + CVE auto-clarity | (a) CHANGE -- preserve `[Axx]` after location (D-07) |
| security-reviewer.md holistic example | :133-149 | 6-finding `### Findings` + Threat Patterns | (a) CHANGE -- restructure into 4 sections; FIXTURE SELF-EXTRACTS this |
| security-reviewer.md `<output_constraints>` | :165-192 | section names incl `threat_patterns` | (a) CHANGE -- add four severity sections |
| security-reviewer.md verify_request `severity=` | :117, :140, :270 | machine attr | (b) KEEP lowercase (D-08) |
| security-reviewer.md `### Threat Patterns` | :143, :153, :157, :180, :339, :343 | trailing analytical section + hedge prose | (b) KEEP header; reword `### Findings` prose refs to severity-section refs (a) |
| review/SKILL.md render-verbatim | :165, :175 | names `### Findings` + `### Cross-Cutting Patterns` as literal headers | (a) CHANGE -- name the four severity headers + Cross-Cutting as the verbatim headers (SKILL-01) |
| review/SKILL.md prohibition | :178 | "Reformat ... into severity groups" prohibition | (a) INVERT -- the four headers ARE the contracted shape now (SKILL-01) |
| review/SKILL.md header-protection rules | :179-184 | "Strip/rename/bold" + "Drop Cross-Cutting" | (a) CHANGE -- update protected header set to the four + Cross-Cutting |
| security-review/SKILL.md | :151, :161, :164, :165-170 | same shape as review | (a) CHANGE/INVERT -- same treatment, Threat Patterns substituted |
| context-packaging.md Verification template Findings | :286-294 | INPUT packaging "## Findings ... Severity (initial): [Critical/Important/Suggestion]" | (b) KEEP -- executor's prompt TO agent, not user-facing output; already uses spelled-out LABELS not shorthand |
| context-packaging.md Verify Request worked example | :396-411 | `### Findings` in an INPUT/schema example | (b) KEEP / review -- schema illustration, not the output contract (planner confirms; low risk) |
| context-packaging.md severity= attr | :378, :390, :402 | `severity="<critical|important|suggestion>"` BNF + attr doc + example | (b) KEEP lowercase machine-lexicon (D-08, AGNT-03) |
| context-packaging.md inline pv example | :60 | `### Findings` entry mention | (b) KEEP / review -- describes a finding-line anchor, planner confirms wording |
| execute/SKILL.md negative ref | :261 | "Do not fabricate `### Findings` entries with severity tags" | (a) PRECISION EDIT (Pitfall 6) -- minimal reword; discretion call |
| tests/D-reviewer-budget.sh | :131-132, :148, :112(self-test sample) | SEV + FRAGMENT_RE + body-strip + zero-finding sample | (a) RETARGET -- header-tracking parser (D-10); self-test sample uses new grammar |
| tests/D-security-reviewer-budget.sh | :107-108, :127, :91(self-test) | 4-slot FRAGMENT_RE + body-strip + sample | (a) RETARGET -- + `[Axx]` assertion preserved |
| plugin.json | :3 | `"version": "1.0.0"` | (a) BUMP -> 1.0.1 (SYNC-02) |
| {plan,execute,review,security-review}/SKILL.md | :18/:19 each | `version: 1.0.0` | (a) BUMP -> 1.0.1 (SYNC-02; the 5 surfaces = plugin.json + 4 SKILL.md) |
| README.md | :77, :79 | "## What's New" / `### 1.0.0` | (a) ADD `### 1.0.1` entry (changelog; historically NOT counted in the "5-surface" tally -- see below) |
| `.planning/**` (~362 artifacts) | -- | frozen history with shorthand | (c) UNTOUCHED (Phase 9 precedent; Phase 13 residue sweep exempts these) |

**5-surface tally clarification (SYNC-02):** the established convention is the 5 surfaces = `plugin.json` + 4 `SKILL.md version:` fields. README "What's New" is updated ALONGSIDE but is conventionally a separate changelog edit, not the 5th of the 5. [VERIFIED: CONTEXT.md:160] flags this exact question for planner confirmation; the historical answer is plugin.json + 4 SKILL.md = 5, README separate. [VERIFIED: STATE.md decisions / 16-phase precedent].

## Runtime State Inventory

This is a rewrite/refactor phase (string-grammar replacement across files). Per the rename/refactor protocol, the canonical question is: after every file is updated, what runtime systems still have the old grammar cached, stored, or registered?

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None -- the plugin has no datastore, no DB, no persisted state. Reports are emitted transiently to the terminal. | None -- verified: zero-runtime Markdown/YAML plugin (CLAUDE.md "ZERO runtime code") |
| Live service config | None -- no external service holds the grammar. The agents/skills ARE the config, and they live in git. | None -- verified by git grep of plugin tree; no `.mcp.json`, no hooks |
| OS-registered state | None -- no Task Scheduler, no pm2, no daemon registers this grammar. | None |
| Secrets/env vars | None -- no secret or env var references the severity vocabulary. | None |
| Build artifacts / installed packages | The plugin is loaded by Claude Code at session start from the marketplace cache OR via `--plugin-dir`. A running session has the OLD agent text in context until reloaded. | Phase 13 UAT must start a FRESH `claude -p` session (it does -- headless invocation loads the current file from `--plugin-dir`). No build step, no compiled artifact. The git tag `v1.0` is NOT pushed; no published marketplace copy to invalidate. |

**Key runtime-state finding:** the only "cache" is an in-memory Claude Code session's loaded copy of the agent files. Because Phase 13 uses fresh headless `claude -p --plugin-dir <abs path>` invocations, each run loads the post-rewrite files directly. There is no persisted grammar anywhere to migrate. This is a clean refactor with no data-migration task.

## Code Examples

### New header-tracking fixture parser (replaces inline-severity FRAGMENT_RE)

The current parser matches `^path:line: (crit|imp|sug|q): `. The new grammar has NO inline severity token; findings live under `### Severity` headers with leading continuous `N.` numbers. Robust bash pattern:

```bash
# Source: derived from existing tests/D-reviewer-budget.sh structure + WR-03 tolerant-match lesson.
# Track the current ### severity header; count N.-prefixed finding lines beneath it.
SEV_HEADERS='^### (Critical|Important|Suggestions|Questions)$'
# Finding line: leading "N. " then "<path>:<line[-range]>: " then body.
FINDING_RE='^[0-9]+\. [^[:space:]]+:[0-9]+(-[0-9]+)?: '
matched_count=0
current_sev=""
declare -a FINDING_BODIES=()
while IFS= read -r line; do
  case "$line" in
    *"<verify_request"*) continue ;;   # not a finding (existing rule)
  esac
  if [[ "$line" =~ $SEV_HEADERS ]]; then
    current_sev="$line"
    continue
  fi
  # (none) markers and blank lines are not findings; skipped by the FINDING_RE non-match.
  if [[ -n "$current_sev" && "$line" =~ $FINDING_RE ]]; then
    matched_count=$((matched_count + 1))
    # Body-strip: remove "N. <path>:<line[-range]>: " so wc -w counts the <problem>. <fix>. span only.
    body="$(printf '%s' "$line" | sed -E 's/^[0-9]+\. [^[:space:]]+:[0-9]+(-[0-9]+)?: //; s/`$//')"
    FINDING_BODIES+=("$body")
  fi
done < <(printf '%s\n' "$REPORT")
```

For the SECURITY fixture, after the location strip also strip the OWASP bracket and ASSERT it was present:
```bash
# Source: derived from tests/D-security-reviewer-budget.sh:108,127.
FINDING_RE='^[0-9]+\. [^[:space:]]+:[0-9]+(-[0-9]+)?: \[[^]]+\] '   # [Axx] / [Uncategorized] / [CVE-...]
# body-strip includes the bracket:
body="$(printf '%s' "$line" | sed -E 's/^[0-9]+\. [^[:space:]]+:[0-9]+(-[0-9]+)?: \[[^]]+\] //; s/`$//')"
```

[ASSUMED] -- the exact regex is the researcher's recommendation; the planner/executor authors the canonical fixture. The RED/GREEN proof (D-10): run the NEW parser against the OLD self-extracted shorthand sample -> expect 0 findings -> anti-vacuous guard fires RED; run against the NEW grouped sample -> expect >=5 findings -> GREEN.

### Self-extract range note

The existing self-extract awk (`/^> ### Findings$/{f=1} f && /^>/{print} f && !/^>/{exit}`) keys off `> ### Findings` as the start sentinel. After the rewrite the holistic example begins with `> ### Critical` (not `> ### Findings`). The self-extract start sentinel MUST change to `^> ### Critical$` (or a tolerant `^> ### (Critical|Findings)` during transition). The terminator (first non-`>` line) is unchanged and still works because the holistic example stays one contiguous blockquote. This is a REQUIRED fixture edit coupled to the example restructure -- another instance of the example/fixture coupling (Pitfall 2).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline two-inline-code-span fragment shorthand (`crit:`/`imp:`/`sug:`/`q:`) | Grouped spelled-out severity sections | Phase 12 (this phase) | User-facing clarity; aligns with Conventional Comments / SARIF conventions |
| `### Findings` single section, severity inline | Four `### Severity` sections, severity in header, continuous numbers | Phase 12 | Restructure not rename; fixture parser must retarget |
| Security lexicon Critical/High/Medium | Unified Critical/Important/Suggestion (Phase 7) | Phase 7 Plan 07-09 | `(formerly High)`/`(formerly Medium)` residue still present at security-reviewer.md:66-67 -- STRIP this phase (AGNT-01) |
| Aggregate 300w cap | Per-section sub-caps, aggregate `none` | Phase 7 (already shipped) | Phase 12 re-scopes per-fragment sub-caps to per-section 1:1 (D-09) |

**Deprecated/outdated:**
- `(formerly High)` / `(formerly Medium)` annotations (security-reviewer.md:66-67): leftover from the Phase 7 rename; strip per AGNT-01/D-11 -- no third generation of "formerly X" residue.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The target grouped-grammar example shapes shown in Pattern 1 / Code Examples are the researcher's reconstruction from locked decisions; the planner authors canonical text | Architecture Patterns, Code Examples | LOW -- decisions D-01..D-07 fully constrain the shape; reconstruction is illustrative |
| A2 | The exact header-tracking fixture regex is a recommendation, not a verified implementation | Code Examples | LOW -- planner/executor authors + RED/GREEN-tests the actual parser |
| A3 | README "What's New" is a separate changelog edit, NOT the 5th of the "5 surfaces" (5 = plugin.json + 4 SKILL.md) | Per-Surface Disposition | LOW -- matches 16-phase precedent; CONTEXT.md:160 flags it for planner confirmation |
| A4 | `execute/SKILL.md:261` needs only a minimal precision edit (not removal, not major rewrite) | Pitfall 6 | LOW -- it is a negative instruction to a DIFFERENT agent; either disposition is safe |
| A5 | context-packaging.md INPUT-side `### Findings` (Verification template :286-294, :396) stays as-is | Per-Surface Disposition, Pitfall 5 | MEDIUM -- if the planner mistakenly rewrites the input-packaging template, the executor's consultation prompt diverges from the agent's expectation; the disposition table mitigates by classifying it (b) KEEP |

**Note:** All other claims are VERIFIED (via Read/git grep of the repo) or CITED (official docs / authoritative sources). The five assumptions above are the only items needing planner/user confirmation.

## Open Questions

1. **Does the holistic worked example finding count stay >= the fixture's `MIN_FINDINGS=5`?**
   - What we know: reviewer holistic has 7 findings, security has 6; MIN_FINDINGS=5 with documented headroom.
   - What's unclear: distributing those findings across four sections (some sections may be empty -> `(none)`) does not reduce the TOTAL finding count, so the anti-vacuous floor still holds. But the planner must ensure the rewritten holistic examples keep >= 5 NUMBERED findings so the self-extract fixture stays GREEN.
   - Recommendation: planner authors the holistic examples with >= 5 numbered findings spread so at least Critical+Important are populated; Questions can be `(none)`.

2. **Should the four severity sections appear in the `<output_constraints>` XML block as four `<section>` entries, or one repeating `findings` section?**
   - What we know: the current block has one `<section name="findings" type="repeating">`. D-09 maps old per-fragment caps to per-section caps 1:1.
   - What's unclear: whether to model four named sections (`critical`, `important`, `suggestions`, `questions`) each with its own `max_words`, or keep one repeating findings section with a per-entry cap. D-09 says "old `crit` cap -> Critical section cap" implying four named sections.
   - Recommendation: four named `<section>` entries with per-section caps, matching D-09's 1:1 mapping intent; aggregate stays `none`. Planner decides exact cap numbers (Claude's Discretion per CONTEXT.md).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| bash + coreutils (awk/sed/wc/tr) | Budget fixtures | Yes | Git Bash | -- |
| git (git grep) | Disposition sweep, residue check | Yes | 2.54+ | -- |
| Claude Code CLI (`claude -p`) | Phase 13 UAT (NOT this phase) | Yes | current | -- |

No missing dependencies. Phase 12 is editable + testable entirely offline with bash.

## Validation Architecture

> nyquist_validation is enabled (config.json workflow.nyquist_validation = true). This section is the validation backbone for Phase 12.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bash + coreutils smoke fixtures (no test runner; self-contained scripts) |
| Config file | none -- `tests/D-reviewer-budget.sh`, `tests/D-security-reviewer-budget.sh` are standalone |
| Quick run command | `bash tests/D-reviewer-budget.sh` (exits 0 green / 1 red) |
| Full suite command | `bash tests/D-reviewer-budget.sh && bash tests/D-security-reviewer-budget.sh` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RPT-01 | Reviewer emits grouped `### Critical/Important/Suggestions/Questions`, no shorthand | unit (self-extract) | `bash tests/D-reviewer-budget.sh` (parser GREEN on new grammar) + `git grep -nE 'crit:\|imp:\|sug:\| q:' plugins/lz-advisor/agents/reviewer.md` returns nothing | retarget needed |
| RPT-02 | Security emits same headers, `[Axx]` preserved | unit | `bash tests/D-security-reviewer-budget.sh` ([Axx] assertion in FINDING_RE) | retarget needed |
| RPT-03 | Continuous finding numbers across sections | unit | fixture counts `^N.`-prefixed lines across all sections; manual check ordinals are 1..N contiguous | retarget needed |
| RPT-04 | Empty section renders `(none)` | unit | fixture treats `(none)` as non-finding (no match); manual assert each of 4 headers present even when empty | retarget needed |
| AGNT-01 | Legend + all examples rewritten; `(formerly X)` stripped | static | `git grep -nE 'formerly High\|formerly Medium\|crit:\|imp:\|sug:' plugins/lz-advisor/agents/` returns nothing | self-extract proves examples; grep proves residue gone |
| AGNT-02 | Per-section sub-caps re-scoped, aggregate intent unchanged | unit | fixture per-section budget assertions GREEN | retarget needed |
| AGNT-03 | Hedge frame, Class-2 hook, `severity=` lowercase survive | static | `git grep -n 'severity="' plugins/lz-advisor/agents/` shows only lowercase; Class-2/Hedge sections present | grep + manual |
| SKILL-01 | Render-verbatim absolute; prohibition inverted; new headers contracted | static | manual read of review/security-review SKILL.md Phase 3; grep new headers named as literal verbatim headers | manual |
| SYNC-01 | Disposition table covers every git grep hit; `.planning/` untouched | static | the disposition table above; `git grep` residue sweep scoped to `plugins/lz-advisor/` | manual + grep |
| SYNC-02 | 5-surface atomic version bump | static | `git grep -n '1\.0\.1' plugins/lz-advisor/.claude-plugin/plugin.json plugins/lz-advisor/skills/*/SKILL.md` shows 5 hits | grep |

### Sampling Rate
- **Per task commit:** run the relevant fixture (`bash tests/D-reviewer-budget.sh` after reviewer.md edits; security fixture after security-reviewer.md edits).
- **Per wave merge:** both fixtures green + residue grep clean.
- **Phase gate:** both fixtures GREEN on the new grammar AND RED on the old shorthand sample (D-10 RED/GREEN proof) AND `git grep -nE 'crit:|imp:|sug:| q:' plugins/lz-advisor/` returns ONLY the fixtures' own SEV-history comments (or nothing) BEFORE `/gsd-verify-work`.

### Wave 0 Gaps
- None for test INFRASTRUCTURE -- both fixtures exist (Phase 11) with `--self-test`, `--from-trace`, anti-vacuous guards.
- Wave 0 WORK item: the fixtures currently parse the OLD grammar (green on HEAD). The retarget (parser + self-extract sentinel + self-test sample) is IN-SCOPE Phase 12 work (D-10), committed in the SAME atomic unit as the agent rewrite. The RED/GREEN proof is: new parser RED on old sample, GREEN on new sample.

**Phase 13 (downstream, not this phase) validation backbone:** headless `claude -p /lz-advisor:review` + `/lz-advisor:security-review` against the dedicated worktree; capture `--output-format stream-json`; grep the RAW agent text (where `### Critical` IS literally present) for the four headers and zero shorthand; n>=3 per-section budget measurement (NOT whole-report neutrality assertion).

## Security Domain

> security_enforcement is absent from config (treated as enabled). This phase changes documentation/prompt text only; the security surface is the security-reviewer AGENT's contract, not application code.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | no auth in a Markdown plugin |
| V3 Session Management | no | -- |
| V4 Access Control | yes (indirect) | The reviewer/security-reviewer keep `[Read, Glob]` least-privilege tool grant; the `<verify_request>` escalation hook is the structured-output control that lets the agent escalate WITHOUT tool-grant expansion (OWASP AI Agent Security Cheat Sheet). Phase 12 MUST NOT alter the tool grant or remove the verify_request hook (AGNT-03). |
| V5 Input Validation | yes (indirect) | The skill wraps fetched content in `<fetched trust="untrusted">`; Phase 12 does not touch this. |
| V6 Cryptography | no | -- |

### Known Threat Patterns for this phase (prompt/contract surface)

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Grammar rewrite silently drops the Class-2 Escalation Hook or Hedge Marker Discipline | Tampering / Repudiation | AGNT-03 requires these survive byte-intact; the disposition table marks them (b) KEEP; verify the `## Class-2 Escalation Hook` and `## Hedge Marker Discipline` sections are present post-edit |
| Rewrite changes the lowercase `severity=` machine attribute to Title-Case, breaking the executor's verify_request parsing | Tampering | D-08 KEEP lowercase; fixture/grep asserts `severity="` values stay lowercase |
| OWASP `[Axx]` tag lost in security example conversion | Repudiation (loses threat-category provenance) | D-07 preserve `[Axx]` after location; security fixture FINDING_RE asserts the bracket present |
| Auto-clarity CVE carve-out (75w) example dropped | Information disclosure (security findings need full prose) | security fixture AUTO_CLARITY_CAP=75 + `[[ =~ \[(CVE|GHSA|CWE) ]]` detection; keep the CVE worked example |

## Sources

### Primary (HIGH confidence)
- Repo files (Read / git grep, HEAD 2026-06-07): `plugins/lz-advisor/agents/reviewer.md`, `agents/security-reviewer.md`, `skills/review/SKILL.md`, `skills/security-review/SKILL.md`, `skills/execute/SKILL.md`, `references/context-packaging.md`, `README.md`, `.claude-plugin/plugin.json`, `tests/D-reviewer-budget.sh`, `tests/D-security-reviewer-budget.sh` -- all surface line numbers, the self-extract coupling, the two-`### Findings`-surfaces distinction.
- `.planning/` (Read): 12-CONTEXT.md (D-01..D-11), REQUIREMENTS.md (10 reqs + Out of Scope), ROADMAP.md (Phase 12 success criteria), STATE.md (3x-burned budget-neutrality note, few-shot drift + cross-surface drift concerns), PROJECT.md (WR-05 scar at context-packaging.md:317).
- [anthropics/claude-code#26390](https://github.com/anthropics/claude-code/issues/26390) (WebFetch) -- terminal renderer strips `###` and bolds heading text, no level differentiation; closed-not-planned Feb 2026.

### Secondary (MEDIUM confidence)
- [Conventional Comments](https://conventionalcomments.org/) -- label/decoration vocabulary, single-label-per-comment, machine-parseable; validates D-05.
- [GitHub SARIF support for code scanning](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning) -- error/warning/note + CVSS Critical/High/Medium/Low; `results: []` clean-scan convention; validates D-01/D-02/D-04.
- [reviewdog RDFormat](https://github.com/reviewdog/reviewdog/blob/master/proto/rdf/README.md) -- severity levels, fail-level gating.
- WebSearch (verified against multiple sources) on LLM few-shot drift: "pattern-followers more than rule-followers"; restate format spec after examples; instruction-first reduces drift; Min et al. 2022 (format dominates content); Lu et al. 2022 (example order sensitivity).

### Tertiary (LOW confidence)
- None relied upon for load-bearing claims.

## Metadata

**Confidence breakdown:**
- Surface map + line numbers: HIGH -- verified by Read + git grep at HEAD.
- Few-shot drift mitigation: HIGH -- multiple converging external sources + the project's own documented WR-05 scar.
- Industry grouped-severity conventions: MEDIUM-HIGH -- official SARIF docs + Conventional Comments spec; validates all locked decisions, no downstream-breaking conflict.
- Terminal `###` rendering: HIGH -- direct WebFetch of the closed issue; reframes "headers reach the user" correctly for Phase 13.
- `wc -w` measurement: HIGH -- demonstrated empirically in this session; methodology (per-section spans, not whole-report) surfaced for Phase 13, neutrality NOT asserted.
- Fixture retarget approach: MEDIUM -- regex is a recommendation; RED/GREEN proof is the gate, not the specific regex.

**Research date:** 2026-06-07
**Valid until:** 2026-07-07 (stable -- Markdown/YAML grammar + bash; the only fast-moving input is the Claude Code renderer behavior, which only matters for Phase 13 framing)
