# Changelog

All notable changes to the **lz-advisor** Claude Code plugin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-06-14

This is a breaking release. The four skills are now invoked with an `lz-` prefix so
they no longer shadow Claude Code's built-in `/plan`, `/review`, and `/security-review`.

### Changed

- **BREAKING -- skill rename (`lz-` prefix).** All four skills are renamed. The bare
  `/plan`, `/review`, and `/security-review` shadowed Claude Code built-ins; the `lz-`
  prefix de-shadows them, and `/execute` was renamed too for suite consistency and
  `/lz-` autocomplete grouping. Migration:

  | v1.0.1 (old) | v2.0.0 (new) |
  |---|---|
  | `/plan` | `/lz-plan` |
  | `/execute` | `/lz-execute` |
  | `/review` | `/lz-review` |
  | `/security-review` | `/lz-security-review` |
  | `lz-advisor:plan` | `lz-advisor:lz-plan` |
  | `lz-advisor:execute` | `lz-advisor:lz-execute` |
  | `lz-advisor:review` | `lz-advisor:lz-review` |
  | `lz-advisor:security-review` | `lz-advisor:lz-security-review` |

- **BREAKING -- `/lz-security-review` canonical severities.** The security review report
  now groups findings under the canonical 5-tier security severity taxonomy --
  `### Critical` / `### High` / `### Medium` / `### Low` / `### Informational`, omit-when-empty
  -- plus a non-severity `### Open Questions` section, replacing the prior
  `Critical / Important / Suggestions / Questions` grouping. This is a breaking
  output-contract change for security-review consumers. Note: `/lz-review`
  intentionally KEEPS its `Critical / Important / Suggestions / Questions` taxonomy --
  the two review skills no longer use a symmetric severity vocabulary.

- The cross-skill provenance-marker label `**Verdict scope:**` is renamed to
  `**Verdict axis:**` (cosmetic; the machine-readable `scope: <value>` token is unchanged).

## [1.0.1] - 2026-06-11

### Changed

- **Review report grammar overhaul.** The `/review` and `/security-review` skills
  now present findings GROUPED under fully spelled-out severity headlines --
  `### Critical`, `### Important`, `### Suggestions`, and `### Questions`, in a fixed
  order -- replacing the previous two-letter shorthand (`crit:` / `imp:` / `sug:` /
  `q:`) that prefixed each finding line.
- Findings are numbered continuously across all severity sections, so
  cross-references between findings stay unambiguous.
- Every severity section is always shown, with an explicit `(none)` marker when it
  has no findings.
- OWASP `[Axx]` category tags are preserved verbatim on security findings.

## [1.0.0] - 2026-06-01

Initial stable release. **lz-advisor** implements the advisor strategy: it pairs an
Opus advisor with your session model (typically Sonnet) so you get near-Opus quality
on coding tasks at a lower cost, by consulting the stronger model only at
high-leverage moments rather than running it end to end.

### Added

- **Four advisor-strategy skills:**
  - `/plan` -- orient on the codebase, consult the Opus advisor for strategic
    direction, then produce an actionable implementation plan before you write code.
  - `/execute` -- work through a task with strategic Opus consultation at
    high-leverage moments: before substantive work, when stuck, and before
    declaring done. Optionally consumes a plan file produced by `/plan`.
  - `/review` -- Opus-powered code quality review of completed work, with findings
    grouped by severity.
  - `/security-review` -- Opus-powered, OWASP-informed security and threat review of
    completed work.
- **Three dedicated Opus agents** -- `advisor` (used by `/plan` and `/execute`),
  `reviewer` (used by `/review`), and `security-reviewer` (used by
  `/security-review`) -- each constrained to concise output (advisor guidance stays
  under ~100 words).
- **Verification-chain integrity** built into the skills: pre-verified-claim
  discipline, hedge-marker handling, and web verification so claims about external
  packages and APIs are checked rather than assumed.
- **Per-section output budgets** for the review agents, **change-surface-matched
  verification targets**, and **pack-then-trust** final advisor consultations.
- **Zero external dependencies.** The plugin uses Claude Code's native Agent tool --
  no API keys and no setup beyond installation.
- **Marketplace installation:**

  ```
  /plugin marketplace add LayZeeDK/lz-advisor-claude-plugins
  /plugin install lz-advisor@lz-advisor-claude-plugins
  ```

[2.0.0]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/releases/tag/v1.0.0
