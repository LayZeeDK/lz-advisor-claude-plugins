---
phase: 11
slug: fixture-baseline
status: secured
threats_open: 0
asvs_level: 1
created: 2026-06-07
---

# SECURITY.md -- Phase 11: fixture-baseline

**Phase:** 11 -- fixture-baseline
**ASVS Level:** 1
**Block-on:** high
**Audit date:** 2026-06-07
**Audited commit (fixtures):** a607904 (tail of the a58db4f..a607904 code-review fix range)
**Implementation under audit (READ-ONLY):**

- `tests/D-reviewer-budget.sh`
- `tests/D-security-reviewer-budget.sh`

**Result:** SECURED -- 5/5 threats closed (2 mitigate verified in code, 3 accepted risks logged).

---

## Threat Verification

| Threat ID         | Category               | Disposition | Status | Evidence |
|-------------------|------------------------|-------------|--------|----------|
| T-11-01 (reviewer) | Tampering              | mitigate    | CLOSED | `tests/D-reviewer-budget.sh` -- `set -euo pipefail` (:25); `${2:?--from-trace needs a file}` (:62); quoted read-site `tr -d '\r' < "$TRACE_FILE"` (:108); no `eval`/`source` of the trace (only in comments). |
| T-11-01 (security) | Tampering              | mitigate    | CLOSED | `tests/D-security-reviewer-budget.sh` -- `set -euo pipefail` (:21); `${2:?--from-trace needs a file}` (:52); quoted read-site `tr -d '\r' < "$TRACE_FILE"` (:88); no `eval`/`source` of the trace (only in comments). |
| T-11-02 (reviewer) | Information disclosure | accept      | CLOSED | Accepted-risks log entry AR-1 below. |
| T-11-02 (security) | Information disclosure | accept      | CLOSED | Accepted-risks log entry AR-2 below. |
| T-11-SC            | Tampering              | accept      | CLOSED | Accepted-risks log entry AR-3 below. |

---

## Mitigation evidence detail (T-11-01)

The declared mitigation plan for T-11-01 (identical in both PLAN files) lists four controls:
quote every expansion; read via `cat "$TRACE_FILE"` and NEVER `eval`/`source`; `set -u`
(via `set -euo pipefail`); and `${2:?--from-trace needs a file}` to catch a missing/unset
argument (ASVS V5 input validation). Each was verified by direct inspection of the CURRENT
committed source (not documentation or intent).

### tests/D-reviewer-budget.sh

- **Quote every expansion:** the trace path is read as `tr -d '\r' < "$TRACE_FILE"` (:108) and
  assigned quoted at `TRACE_FILE="${2:?--from-trace needs a file}"` (:62). The only two
  expansions of `$TRACE_FILE` in the file are both double-quoted. No unquoted use exists.
- **Never `eval`/`source`:** a repo-tracked search for `eval` and word-boundary `source`
  returns matches ONLY inside comments (the T-11-01 mitigation notes at :55, :102 and the
  prose "self-extract source" / "at the source" at :83, :107). There is no `eval` statement
  and no `source`/`.` of the trace file. The trace content is consumed as DATA (piped through
  `tr`, then `printf '%s\n' "$REPORT"` into a `read` loop and `awk`), never executed.
- **`set -u`:** `set -euo pipefail` at :25.
- **Missing-arg catch:** `${2:?--from-trace needs a file}` at :62 -- under `set -u` an omitted
  `<file>` argument aborts before any read.

### tests/D-security-reviewer-budget.sh

- **Quote every expansion:** `tr -d '\r' < "$TRACE_FILE"` (:88); assignment
  `TRACE_FILE="${2:?--from-trace needs a file}"` (:52). Both expansions double-quoted; no
  unquoted use.
- **Never `eval`/`source`:** matches for `eval`/`source` are comment-only (:47, :82 mitigation
  notes; :61, :87 prose). No execution of the trace.
- **`set -u`:** `set -euo pipefail` at :21.
- **Missing-arg catch:** `${2:?--from-trace needs a file}` at :52.

### Benign deviation from the literal mitigation wording (documented, not a gap)

The mitigation plan said the trace would be read with `cat "$TRACE_FILE"`. The post-authoring
code-review fix pass (commits a58db4f..a607904) replaced `cat` with `tr -d '\r' < "$TRACE_FILE"`
to normalize CRLF -> LF (CR-02) for Windows / Git Bash traces. This changes the read TOOL but
NOT the security posture the mitigation guarantees: the file is still opened as read-only DATA,
the expansion is still double-quoted, and the content is still never executed (`tr` is a pure
stream filter; the result flows into `read`/`awk` as text). The substitution is, if anything,
marginally stronger (it removes a stray-`\r` corruption vector that could skew the per-finding
`wc -w` span). The mitigation is verified as PRESENT and EFFECTIVE under its declared intent.

---

## Accepted risks log

These entries close the `accept`-disposition threats. Acceptance rationale carried verbatim
from the PLAN `<threat_model>` blocks and confirmed against the current code.

### AR-1 -- T-11-02 (reviewer): reading reviewer.md as data -- ACCEPTED

- **Category:** Information disclosure
- **Component:** `tests/D-reviewer-budget.sh` self-extracts and reads
  `plugins/lz-advisor/agents/reviewer.md` as data.
- **Rationale:** The agent file is a committed, public plugin prompt. Reading it is the
  fixture's intended self-extract behavior. No secret / PII surface exists; there is nothing to
  disclose that is not already public in the repository.
- **Owner / review:** lz-advisor maintainer; re-review if the agent file ever ingests secrets.

### AR-2 -- T-11-02 (security): reading security-reviewer.md as data -- ACCEPTED

- **Category:** Information disclosure
- **Component:** `tests/D-security-reviewer-budget.sh` self-extracts and reads
  `plugins/lz-advisor/agents/security-reviewer.md` as data.
- **Rationale:** Same as AR-1 -- committed, public plugin prompt; intended self-extract
  behavior; no secret / PII surface.
- **Owner / review:** lz-advisor maintainer; re-review if the agent file ever ingests secrets.

### AR-3 -- T-11-SC: supply-chain / package installs -- ACCEPTED

- **Category:** Tampering (supply chain)
- **Component:** npm / pip / cargo installs.
- **Rationale:** This phase performs NO package installs. Both fixtures are pure bash plus
  bundled coreutils (`wc`, `sed`, `awk`, `tr`, `printf`) and the bash `[[ =~ ]]` engine. No
  npm / PyPI / crates registry surface exists, so slopcheck / registry-legitimacy verification
  do not apply (RESEARCH: "Package Legitimacy Audit: Not applicable").
- **Owner / review:** lz-advisor maintainer; re-review if any future phase adds a package
  manifest under `tests/` or elsewhere in scope.

---

## Unregistered flags

None. Both execution records (`11-01-SUMMARY.md`, `11-02-SUMMARY.md`) contain no
`## Threat Flags` section, and no new attack surface was declared during implementation. There
is nothing to map to an unregistered flag.

---

## Auditor notes

- Implementation files were treated as READ-ONLY and were not modified. Only this SECURITY.md
  was created.
- Verification was performed against the CURRENT committed state of the fixtures (working tree
  clean; HEAD for these files = a607904), per the audit constraint that the scripts were
  altered after initial authoring by the a58db4f..a607904 fix pass.
- D-03 (no live `claude -p` invocation) was confirmed as a defense-in-depth observation: the
  only `claude -p` references in either fixture are comments stating that no live invocation
  exists. This keeps untrusted live output out of scope for Phase 11; Phase 13 introduces live
  traces and SHOULD re-run this audit against the `--from-trace` path with real captured data.
