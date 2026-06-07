#!/usr/bin/env bash
# Budget smoke fixture for the security-reviewer agent (4-slot OWASP fragment grammar).
#
# Parses the holistic worked example in plugins/lz-advisor/agents/security-reviewer.md
# (default self-extract mode), a captured response (--from-trace <file>), or a
# synthetic zero-finding input (--self-test). Asserts the per-section word budgets
# with an anti-vacuous matched_count >= 5 guard that runs BEFORE the budget loop,
# and a 75w auto-clarity outlier cap (RES-PFV-OUTLIER-CAP) for CVE/GHSA/CWE findings.
#
# Modes:
#   (default)              self-extract the agent holistic example and assert green
#   --from-trace <file>    parse a captured response file through the same parser
#   --self-test            feed a zero-finding input; the run MUST exit non-zero
#
# Phase 11 baseline: green on the CURRENT shorthand grammar (crit:/imp:/sug:/q:
# plus an OWASP [Axx] bracket slot). NO live claude -p invocation (Phase 13 supplies
# live traces). NO edit to the agent file (read-only input).
#
# Run from the repository root: bash tests/D-security-reviewer-budget.sh

set -euo pipefail

# --- Config constants -------------------------------------------------------
# Post-Phase-9 path (NOT the stale top-level agents/ path; see RESEARCH Pitfall 1).
SECURITY_AGENT="plugins/lz-advisor/agents/security-reviewer.md"
MIN_FINDINGS=5        # D-04 anti-vacuous floor (security holistic example: 6 findings, min 5)
PER_ENTRY_CAP=28      # D-09 per-entry outlier soft cap (prefix + OWASP tag EXCLUDED)
AUTO_CLARITY_CAP=75   # D-08 RES-PFV-OUTLIER-CAP for CVE/GHSA/CWE auto-clarity findings
PATTERNS_CAP=160      # D-09 threat_patterns
MISSED_CAP=30         # D-09 missed_surfaces

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  echo "[PASS] $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "[FAIL] $1"
  echo "       $2"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

# --- Mode dispatch (D-01 / D-02 / D-05) -------------------------------------
# T-11-01: quote every expansion; never eval/source the trace file; ${2:?...}
# catches a missing --from-trace argument under set -u.
MODE="self-extract"
TRACE_FILE=""
case "${1:-}" in
  --from-trace) MODE="from-trace"; TRACE_FILE="${2:?--from-trace needs a file}" ;;
  --self-test)  MODE="self-test" ;;
  "")           MODE="self-extract" ;;
  *)            echo "usage: $0 [--from-trace <file> | --self-test]" >&2; exit 2 ;;
esac

# --- Agent-file existence guard (loud-fail; RESEARCH Pitfall 1) -------------
if [ "$MODE" = "self-extract" ]; then
  if [ ! -f "$SECURITY_AGENT" ]; then
    fail "agent file missing at $SECURITY_AGENT" "self-extract source not found"
    exit 1
  fi
fi

# --- get_report: produce the raw report text for the active mode ------------
# self-extract: awk-range the holistic block from the blockquoted "### Findings"
#   through the END of the blockquote -- the first line that is NOT blockquote-
#   prefixed terminates the example. This terminator is SECTION-AGNOSTIC: it does
#   NOT gate the exit on the OPTIONAL "### Missed surfaces" heading (CR-01).
#   Because the holistic example is one contiguous blockquote, the first
#   non-blockquote line reliably ends it whether or not Missed-surfaces is
#   present, so the prose "Word count breakdown:" paragraph that follows is never
#   swallowed. Mirrors the reviewer fixture's terminator (D-reviewer-budget.sh).
get_report() {
  case "$MODE" in
    self-extract)
      awk '/^> ### Findings$/ { f = 1 } f && !/^>/ { exit } f { print }' "$SECURITY_AGENT" \
        | sed -E 's/^> ?//; s/^`//; s/`$//'
      ;;
    from-trace)
      # T-11-01: quote "$TRACE_FILE"; never eval/source it. Normalize CRLF -> LF
      # (CR-02) so every downstream consumer -- the bash read loop AND the awk
      # section extractor -- sees LF-only text. Windows / Git Bash traces are
      # CRLF-terminated by default; without this the awk exact-match heading
      # lookups and the per-finding wc -w spans both go wrong (engine-dependent
      # gate). tr fixes it once, at the source.
      tr -d '\r' < "$TRACE_FILE"
      ;;
    self-test)
      printf '### Findings\n\n### Threat Patterns\nNo findings.\n'
      ;;
  esac
}

REPORT="$(get_report)"

# --- Parse findings with the 4-slot FRAGMENT_RE (D-12) ----------------------
# 4-slot: <file>:<line>: <severity>: [<OWASP-tag>] <threat>. <fix>.
# Backtick-tolerant (D-08): optional leading/trailing backtick (already stripped
# in self-extract, but kept tolerant for --from-trace inputs that preserve them).
# The OWASP slot \[[^]]+\] matches [A01]..[A10] AND [Uncategorized] (D-12).
# WR-05: the severity alternation is defined ONCE in SEV and interpolated into
# BOTH the match regex and the body-strip sed below, so a Phase 12 severity-set
# change cannot make the count regex and the strip diverge (which would leave
# the severity token in the body and silently inflate wc -w).
SEV='(crit|imp|sug|q)'
FRAGMENT_RE="^\`?[^[:space:]]+:[0-9]+(-[0-9]+)?: ${SEV}: \[[^]]+\] "

matched_count=0
declare -a FINDING_BODIES=()

while IFS= read -r line; do
  # SKIP verify_request escalation lines: they trail the affected finding, are
  # not findings, and must not be counted or budget-checked.
  case "$line" in
    *"<verify_request"*) continue ;;
  esac

  if [[ "$line" =~ $FRAGMENT_RE ]]; then
    matched_count=$((matched_count + 1))
    # Strip the prefix up to AND INCLUDING the "[<OWASP-tag>] " segment so the
    # counted span is the <threat>. <fix>. body only (D-09 / Pitfall 5). Also
    # drop any trailing backtick that survived a trace input.
    body="$(
      printf '%s' "$line" \
        | sed -E "s/^\`?[^[:space:]]+:[0-9]+(-[0-9]+)?: ${SEV}: \[[^]]+\] //; s/\`$//"
    )"
    FINDING_BODIES+=("$body")
  fi
done < <(printf '%s\n' "$REPORT")

# --- Anti-vacuous guard BEFORE the budget loop (D-04 / D-06) ----------------
echo "$matched_count findings parsed"   # D-06 silent-pass detection signal

# --- --self-test inversion (D-05): zero findings MUST trip the guard --------
# The fail-loudly contract is proven by a NON-zero exit on zero-finding input.
# When the guard fires correctly, this mode exits 1 (the expected, "passing"
# outcome for the self-test); only a 0/green run on zero findings is a defect.
if [ "$MODE" = "self-test" ]; then
  if [ "$matched_count" -lt "$MIN_FINDINGS" ]; then
    echo "[OK] --self-test: zero-finding input tripped the anti-vacuous guard;"
    echo "     exiting NON-zero to prove fail-loudly (a green run here is the defect)."
    exit 1
  else
    echo "[FAIL] --self-test: zero-finding input did NOT trip the anti-vacuous guard"
    echo "       parser matched $matched_count findings on synthetic zero-finding input"
    echo "       this is a silent-pass defect -- the gate would be vacuous"
    exit 1
  fi
fi

# WR-01: a too-few-findings parse makes every downstream budget check
# meaningless (a 0-finding parse emits green [PASS] section lines that read as
# mostly-green even though the parser matched nothing). Short-circuit with a
# loud FAIL and a non-zero exit BEFORE the budget loop so no spurious green
# PASS lines muddy the diagnostic.
if [ "$matched_count" -lt "$MIN_FINDINGS" ]; then
  fail "anti-vacuous: only $matched_count findings parsed (need >= $MIN_FINDINGS)" \
       "FRAGMENT_RE matched too few findings -- gate would be vacuous"
  echo "Status: [FAIL] -- anti-vacuous guard fired; skipping budget checks"
  exit 1
fi
pass "anti-vacuous: matched_count $matched_count >= $MIN_FINDINGS"

# --- Per-finding budget loop with auto-clarity carve-out (D-08 / Pitfall 3) -
# Default cap is 28w (prefix + OWASP tag excluded). A finding whose body carries
# a [CVE-.../[GHSA-.../[CWE-... token is an auto-clarity carve-out and gets 75w.
# CVE/GHSA/CWE detection uses bash [[ =~ ]] (never the bare grep command).
for body in "${FINDING_BODIES[@]}"; do
  wc_words=$(printf '%s' "$body" | wc -w)
  cap="$PER_ENTRY_CAP"
  if [[ "$body" =~ \[(CVE|GHSA|CWE) ]]; then
    cap="$AUTO_CLARITY_CAP"
  fi

  if [ "$wc_words" -le "$cap" ]; then
    pass "per-entry budget: $wc_words <= $cap"
  else
    fail "per-entry budget exceeded: $wc_words > $cap" "$body"
  fi
done

# --- Section-body extraction over the normalized (de-quoted) report ---------
# After get_report the "> " framing is gone, so section headings appear as plain
# "### Threat Patterns" / "### Missed surfaces (optional)" lines. extract_section
# prints the body lines strictly BETWEEN the matched heading and the next "### "
# heading (or end of report).
#
# WR-03: match the heading by a TOLERANT anchored regex ($0 ~ pat) instead of
# byte-exact equality ($0 == h). Exact-match silently failed -- yielding an
# EMPTY body and a vacuous pass -- on any Phase 12 heading drift (trailing space,
# a changed parenthetical, casing, or a surviving CR). The anchored prefix
# absorbs trailing variation (e.g. "(optional)") while still requiring the "### "
# prefix, so a renamed/missing heading is caught by the explicit presence
# pre-check below rather than zeroing the body.
extract_section() {
  local pat="$1"
  printf '%s\n' "$REPORT" | awk -v pat="$pat" '
    $0 ~ pat          { in_sec = 1; next }
    in_sec && /^### / { in_sec = 0 }
    in_sec            { print }
  '
}

# Threat Patterns (REQUIRED): the heading MUST be present. Assert presence first
# (mirrors the reviewer fixture END{exit !found} pattern) so a missing/renamed
# required heading FAILS loudly instead of computing a budget over an empty body.
if printf '%s\n' "$REPORT" | awk '/^### Threat Patterns/{found=1} END{exit !found}'; then
  PATTERNS_BODY="$(extract_section '^### Threat Patterns')"
  patterns_wc=$(printf '%s' "$PATTERNS_BODY" | wc -w)
  if [ "$patterns_wc" -le "$PATTERNS_CAP" ]; then
    pass "threat_patterns budget: $patterns_wc <= $PATTERNS_CAP"
  else
    fail "threat_patterns budget exceeded: $patterns_wc > $PATTERNS_CAP" "$PATTERNS_BODY"
  fi
else
  fail "threat_patterns: REQUIRED '### Threat Patterns' heading not found" \
       "heading drift would zero the body into a vacuous pass -- failing loudly instead"
fi

# Missed surfaces (OPTIONAL): assert <= 30w only when the section is present.
MISSED_BODY="$(extract_section '^### Missed surfaces')"
if [ -n "$(printf '%s' "$MISSED_BODY" | tr -d '[:space:]')" ]; then
  missed_wc=$(printf '%s' "$MISSED_BODY" | wc -w)
  if [ "$missed_wc" -le "$MISSED_CAP" ]; then
    pass "missed_surfaces budget: $missed_wc <= $MISSED_CAP"
  else
    fail "missed_surfaces budget exceeded: $missed_wc > $MISSED_CAP" "$MISSED_BODY"
  fi
else
  pass "missed_surfaces: optional section absent -- skipped"
fi

# --- Summary + exit (house style; validate-phase-03.sh:148-158) -------------
TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo ""
echo "Results: $PASS_COUNT/$TOTAL passed"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "Status: [FAIL] -- $FAIL_COUNT assertion(s) failed"
  exit 1
else
  echo "Status: [PASS] -- all assertions passed"
  exit 0
fi
