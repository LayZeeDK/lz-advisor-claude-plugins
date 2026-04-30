---
phase: 06-address-phase-5-6-uat-findings
reviewed: 2026-04-30T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - plugins/lz-advisor/references/orient-exploration.md
  - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md
findings:
  critical: 0
  warning: 0
  info: 1
  total: 1
status: issues_found
---

# Phase 6: Code Review Report (Gap-Closure Cycle)

**Reviewed:** 2026-04-30
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

This review covers the Phase 6 gap-closure commits (`0df782d`, `4e74b7b`,
`b7ec018`, `afad319`, `7ceeffd`, `5823485`, `b636730`) which addressed
amendments G1+G2 (`<context_trust_contract>` rewrite by provenance + the
ToolSearch-availability rule), amendment G3 (Class 2-S security-currency
sub-pattern + cross-reference), and the plugin version bump to 0.9.0. It
supersedes the earlier `06-REVIEW.md` from the initial review cycle.

## Summary

All structural and contractual checks pass. The gap-closure scope is
clean.

- **Byte-identical contract block** across all 4 SKILL.md files (SHA256
  `7a6716b1f147fba81548cf44450279f947e410200b055a8be5761c43f717415d`). The
  load-bearing canon is preserved.
- **ASCII-only** across all 6 reviewed files (no mojibake risk on
  Windows cp1252 pipes).
- **No TODO / FIXME / XXX / HACK markers** introduced in scope.
- **No non-canonical fetcher references** in plugin source: no
  `markdown.new`, `url-to-markdown`, or `playwright-cli`. Only canonical
  Claude Code `WebSearch`, `WebFetch`, and `ToolSearch` appear.
- **`plugin.json`** parses as valid JSON; `version: "0.9.0"`; no trailing
  commas, BOM, or encoding issues.
- **All 4 SKILL frontmatter** parse cleanly: `name` intact, `version:
  0.9.0`, third-person description preserved (each opens "This skill
  should be used when ...").
- **Heading sequence in `references/orient-exploration.md`** is correct:
  Class 1 (H2) -> Class 2 (H2) -> **Class 2-S (H3, nested under Class
  2)** -> Class 3 (H2) -> Class 4 (H2) -> Closing Note (H2).
- **Class 2-S worked example URL** is search-query-shaped
  (`github.com/advisories?query=@compodoc/compodoc`), not a raw vendor-doc
  URL. Matches the request's contract.
- **`@${CLAUDE_PLUGIN_ROOT}/...` references** in all 4 SKILL files
  resolve to existing files in `plugins/lz-advisor/references/`
  (`advisor-timing.md`, `context-packaging.md`, `orient-exploration.md`).
  No broken loads.
- **`ToolSearch` availability rule** is identical across all 4 SKILL
  contract blocks and references the canonical `WebSearch` /
  `WebFetch` tools plus a `command_permissions.allowedTools` fallback
  for sessions where `ToolSearch` is not available.
- **Cross-references are bidirectional and consistent**: the
  security-review SKILL line 78 points to Class 2-S in
  `orient-exploration.md`, and the Class 2-S text scopes itself
  explicitly: "This sub-pattern fires only inside
  `lz-advisor.security-review` for findings on third-party
  dependencies."
- **Provenance taxonomy** in the contract block (vendor-doc
  authoritative vs agent-generated source) is well-defined with three
  signals each, and the agent-generated branch correctly invokes the
  Pattern D web-first prescription rather than treating the artifact as
  ground truth.

One Info-level register observation noted below; no Critical or Warning
issues.

## Info

### IN-01: One `MUST NOT` imperative remains inside the contract block

**File:** `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md:54`

(byte-identical instances at `lz-advisor.plan/SKILL.md:51`,
`lz-advisor.review/SKILL.md:52`, `lz-advisor.security-review/SKILL.md:53`)

**Issue:** The review brief calls for a "calm imperative register (no
MUST/REQUIRED/CRITICAL)" inside the `<context_trust_contract>` block. One
`MUST NOT` instance survives in the verify-first marker preservation
clause:

> ... survive into the consultation prompt's `## Source Material` section
> verbatim; they MUST NOT be stripped, paraphrased, or promoted into
> `## Pre-verified Claims`.

This is the only all-caps RFC-2119-style imperative in the contract
block. There is no bare `MUST`, no `REQUIRED`, no `CRITICAL`. The wording
is functionally precise -- it specifies a literal-passthrough contract
that downstream skills depend on -- so the all-caps emphasis is arguably
proportionate to the contractual stakes rather than register-shouting.
Surfacing because the brief was explicit about register goals.

**Fix:** If the calm-register goal is strict, replace with a plain
imperative. The replacement preserves the constraint and matches the
rest of the block's prose style:

```markdown
... survive into the consultation prompt's `## Source Material` section
verbatim. Do not strip, paraphrase, or promote them into
`## Pre-verified Claims`.
```

If applied, the edit must land in all four SKILL.md files in the same
commit so the SHA256 byte-identicality canon is preserved.

If the maintainer prefers to keep the all-caps emphasis as a deliberate
register signal for the highest-stakes literal-passthrough rule in the
contract, document the exception (and the no-other-MUST policy) inline
or in `references/context-packaging.md` so it is a recorded convention
rather than an oversight.

---

_Reviewed: 2026-04-30_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
