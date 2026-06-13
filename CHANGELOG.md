# Changelog

All notable changes to the **lz-advisor** Claude Code plugin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.1]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/LayZeeDK/lz-advisor-claude-plugins/releases/tag/v1.0.0
