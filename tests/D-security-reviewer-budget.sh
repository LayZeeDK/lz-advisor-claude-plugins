#!/usr/bin/env bash
# Budget smoke fixture for the security-reviewer agent (grouped severity grammar).
#
# Parses the grouped severity grammar emitted by
# plugins/lz-advisor/agents/security-reviewer.md -- findings grouped under
# ### Critical / ### Important / ### Suggestions / ### Questions headers, each
# finding a "N. <file>:<line>: [<OWASP-tag>] <threat>. <fix>." line with a
# leading continuous integer and NO inline severity token (the section header is
# the sole severity source). The OWASP / CVE / GHSA / CWE bracket is asserted
# present immediately after the location (a finding losing its tag fails to parse
# and the anti-vacuous guard catches the shortfall). Asserts the per-section word
# budgets with a 75w auto-clarity outlier cap (RES-PFV-OUTLIER-CAP) for
# CVE/GHSA/CWE findings, and exits 0 (green) on the current grammar. This is the
# security-reviewer half of the regression gate, retargeted in lockstep with the
# Phase 12 agent rewrite (D-10).
#
# Header-tracking parser: track the current ### severity header; count numbered
# finding lines beneath it. There is no inline-severity alternation in this
# grammar -- the single source of truth is the header regex plus the numbered-line
# regex (which embeds the [<tag>] bracket assertion), and the body-strip prefix is
# derived from the SAME numbered-line regex so the count and the strip cannot
# diverge (WR-05 fixture mitigation).
#
# Three run modes:
#   (default, no args)        self-extract the holistic worked example from the
#                             agent file, strip the "> " blockquote + wrapping
#                             backticks, parse + budget-check it.
#   --from-trace <file>       parse a captured response file through the same
#                             parser + assertions (Phase 13 supplies live traces;
#                             capability check here).
#   --self-test               synthesize a zero-finding input and assert the
#                             anti-vacuous guard fires (NON-zero exit).
#
# No live `claude -p` invocation (Phase 13 supplies live traces). Standalone,
# zero-dependency: bash + coreutils only (no shared helper lib).
#
# Run from the repository root: bash tests/D-security-reviewer-budget.sh

set -euo pipefail

# --- Config constants -------------------------------------------------------
# Post-Phase-9 path (NOT the stale top-level agents/ path; see RESEARCH Pitfall 1).
SECURITY_AGENT="plugins/lz-advisor/agents/security-reviewer.md"
MIN_FINDINGS=5        # D-04 anti-vacuous floor (security holistic example: 6 findings, min 5)
PER_ENTRY_CAP=28      # D-09 per-entry outlier soft cap (prefix + OWASP tag EXCLUDED)
SOFT_TARGET=22        # D-09 per-entry soft target; a WARNING, not a hard fail (the
                      # binding caps are PER_ENTRY_CAP / AUTO_CLARITY_CAP)
AUTO_CLARITY_CAP=75   # RES-PFV-OUTLIER-CAP for CVE/GHSA/CWE auto-clarity findings
PATTERNS_CAP=160      # D-09 threat_patterns
MISSED_CAP=30         # D-09 missed_surfaces
MAX_COUNT=15          # #2: agents' <max_count>15</max_count> finding ceiling
PFV_CAP=60            # #2: per_finding_validation per-entry cap (### Per-finding validation)

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

# --- Mode dispatch ----------------------------------------------------------
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
# self-extract: awk-range the holistic block from the blockquoted "### Critical"
#   (the grouped grammar's start sentinel; the holistic example begins with the
#   Critical section) through the END of the blockquote -- the first line that is
#   NOT blockquote-prefixed terminates the example. This terminator is
#   SECTION-AGNOSTIC: it does NOT gate the exit on the OPTIONAL
#   "### Missed surfaces" heading (CR-01). Because the holistic example is one
#   contiguous blockquote, the first non-blockquote line reliably ends it whether
#   or not Missed-surfaces is present, so the prose "Word count breakdown:"
#   paragraph that follows is never swallowed. Mirrors the reviewer fixture's
#   terminator (D-reviewer-budget.sh).
get_report() {
  case "$MODE" in
    self-extract)
      awk '/^> ### Critical$/ { f = 1 } f && !/^>/ { exit } f { print }' "$SECURITY_AGENT" \
        | sed -E 's/^> ?//; s/^`//; s/`$//'
      ;;
    from-trace)
      # T-11-01: quote "$TRACE_FILE"; never eval/source it. Normalize CRLF -> LF
      # (CR-02) so every downstream consumer -- the bash read loop AND the awk
      # section extractor -- sees LF-only text. Windows / Git Bash traces are
      # CRLF-terminated by default; without this the awk anchored heading lookups
      # and the per-finding wc -w spans both go wrong (engine-dependent gate).
      # tr fixes it once, at the source.
      tr -d '\r' < "$TRACE_FILE"
      ;;
    self-test)
      # Zero-finding synthetic input in the NEW grouped grammar: all four severity
      # headers present, each with a literal (none) marker, plus the trailing
      # Threat Patterns header. No numbered finding lines, so the anti-vacuous
      # guard must fire.
      printf '### Critical\n\n(none)\n\n### Important\n\n(none)\n\n### Suggestions\n\n(none)\n\n### Questions\n\n(none)\n\n### Threat Patterns\n\nNo chaining across this set -- the findings are independent.\n'
      ;;
  esac
}

REPORT="$(get_report)"

# --- Parse findings (header-tracking + numbered-line parser, D-10) ----------
# Severity headers carry the severity (no inline token). Track the current
# ### severity header; count "N. <file>:<line[-range]>: [<tag>] " numbered lines
# beneath it. Use TOLERANT anchored matches ([[ =~ ]] anchored ^...$ / ^...),
# not byte-exact equality, so a trailing space / surviving CR / heading drift
# does not silently zero the parse (WR-03 / Pitfall 3 lesson).
#
# FINDING_RE asserts the OWASP / CVE bracket (\[[^]]+\] ) is present AFTER the
# location (RPT-02). A finding line missing its [Axx]/[CVE-...] bracket will NOT
# match FINDING_RE -- it is not counted, and the anti-vacuous guard catches the
# resulting shortfall. The \[[^]]+\] form matches [A01]..[A10], [Uncategorized],
# [CVE-...], [GHSA-...], and [CWE-...].
#
# SINGLE SOURCE OF TRUTH (WR-05): FINDING_RE is used BOTH to count a finding AND
# (as the body-strip prefix below) to remove the "N. <file>:<line>: [<tag>] "
# prefix, so the count regex and the strip regex cannot diverge and leave the
# location prefix or the first bracket inside the counted wc -w span.
#
# (none) markers and blank lines are NOT findings -- they simply fail FINDING_RE
# and are skipped; no special-casing needed.
#
# #5: SEV_HEADERS is a CLOSED-VOCABULARY anchored match -- the 4 EXACT severity
# headers (### Critical / ### Important / ### Suggestions / ### Questions) with
# OPTIONAL TRAILING WHITESPACE ([[:space:]]*$). The trailing-whitespace tolerance
# absorbs a stray trailing space or a surviving CR (CR is already normalized
# upstream: from-trace does tr -d '\r'; self-extract reads the LF agent file) while
# the closing anchor PREVENTS an over-broad bare-prefix match (e.g. a foreign
# "### Critical findings" heading would otherwise set current_sev and let its
# numbered lines be counted as findings). Finding lines are matched separately by
# FINDING_RE; the header match only sets current_sev.
SEV_HEADERS='^### (Critical|Important|Suggestions|Questions)[[:space:]]*$'
FINDING_RE='^[0-9]+\. `?[^[:space:]]+:[0-9]+(-[0-9]+)?: \[[^]]+\] '
matched_count=0
current_sev=""
declare -a FINDING_BODIES=()

while IFS= read -r line; do
  # SKIP verify_request escalation lines: they trail the affected finding, are
  # not findings, and must not be counted or budget-checked.
  case "$line" in
    *"<verify_request"*) continue ;;
  esac

  if [[ "$line" =~ $SEV_HEADERS ]]; then
    current_sev="$line"
    continue
  fi

  if [[ -n "$current_sev" && "$line" =~ $FINDING_RE ]]; then
    matched_count=$((matched_count + 1))
    # Strip the "N. <file>:<line[-range]>: [<tag>] " prefix (location + leading
    # OWASP bracket) and any leading/trailing backtick framing so the counted
    # span is the <threat>. <fix>. body only (D-09 / Pitfall 5: the per-finding
    # budget EXCLUDES the prefix AND the leading OWASP tag). The strip pattern is
    # the FINDING_RE prefix -- single source of truth with the count. A SECOND
    # bracket (e.g. a [CVE-...] after the [A06] tag) survives into the body, so
    # the auto-clarity detection below still fires on CVE/GHSA/CWE findings.
    body="$(printf '%s' "$line" | sed -E 's/^[0-9]+\. `?[^[:space:]]+:[0-9]+(-[0-9]+)?: \[[^]]+\] //; s/`$//')"
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
# PASS lines muddy the diagnostic. This is also the RED-on-old proof: the OLD
# shorthand sample (`<path>:<line>: crit: [A02] ...` with NO leading "N." and a
# single ### Findings header) matches neither SEV_HEADERS nor FINDING_RE, so a
# --from-trace replay of the old grammar parses 0 findings and trips here.
if [ "$matched_count" -lt "$MIN_FINDINGS" ]; then
  fail "anti-vacuous: only $matched_count findings parsed (need >= $MIN_FINDINGS)" \
       "header-tracking parser matched too few findings -- gate would be vacuous"
  echo "Status: [FAIL] -- anti-vacuous guard fired; skipping budget checks"
  exit 1
fi
pass "anti-vacuous: matched_count $matched_count >= $MIN_FINDINGS"

# --- Per-finding budget loop with auto-clarity carve-out (Pitfall 3) --------
# Default cap is 28w (prefix + leading OWASP tag excluded). A finding whose body
# carries a [CVE-.../[GHSA-.../[CWE-... token is an auto-clarity carve-out and
# gets 75w. The detection runs on the body AFTER the leading [Axx] tag is
# stripped, so a [CVE-...] token appearing as a SECOND bracket in the body still
# triggers the carve-out. CVE/GHSA/CWE detection uses bash [[ =~ ]] (never the
# bare grep command).
for body in "${FINDING_BODIES[@]}"; do
  wc_words=$(printf '%s' "$body" | wc -w)
  cap="$PER_ENTRY_CAP"
  is_auto_clarity=0
  if [[ "$body" =~ \[(CVE|GHSA|CWE) ]]; then
    cap="$AUTO_CLARITY_CAP"
    is_auto_clarity=1
  fi

  if [ "$wc_words" -le "$cap" ]; then
    pass "per-entry budget: $wc_words <= $cap"

    # #2(c): the 22w SOFT_TARGET is the per-entry target, NOT the binding cap
    # (D-09). A body within its hard cap but over SOFT_TARGET emits a NON-FATAL
    # [WARN] line and does NOT increment FAIL_COUNT, so it never changes the exit
    # code. RESPECT the auto-clarity carve-out: do NOT warn on a [CVE]/[GHSA]/[CWE]
    # body within 75w -- those findings are by-design over 22w (the holistic 36w
    # CVE finding must not warn).
    if [ "$is_auto_clarity" -eq 0 ] && [ "$wc_words" -gt "$SOFT_TARGET" ]; then
      echo "[WARN] per-entry soft target: $wc_words > $SOFT_TARGET (within hard cap $cap) -- $body"
    fi
  else
    fail "per-entry budget exceeded: $wc_words > $cap" "$body"
  fi
done

# #2(a): max_count=15 finding ceiling -- assert matched_count <= MAX_COUNT.
# Mirrors the agents' <max_count>15</max_count>. Security holistic baseline=6,
# well under the ceiling.
if [ "$matched_count" -le "$MAX_COUNT" ]; then
  pass "max_count ceiling: $matched_count <= $MAX_COUNT"
else
  fail "max_count ceiling exceeded: $matched_count > $MAX_COUNT" \
       "the grouped grammar caps findings at $MAX_COUNT per response"
fi

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

# #2(b): Per-finding validation 60w/entry cap. The "### Per-finding validation"
# section is OPTIONAL; when ABSENT (the holistic baseline has no PFV section)
# emit a pass "optional section absent -- skipped" (mirrors the Missed-surfaces
# optional handling).
#
# FIX #2: a PFV entry is a multi-line PARAGRAPH (the contract is
# <per_entry max_words=60>, "one paragraph per finding"), so accumulate each
# entry's words ACROSS its paragraph -- a single-line count under-counts and
# silently passes a >60w multi-line entry. An ENTRY begins at a
# "Validation of Finding N:" line; its body runs from that line UP TO (but not
# including) the next boundary, where a boundary is ANY of: the next
# "Validation of Finding " line, the next blank line, or the next "### " heading.
# Accumulate wc -w across the entry's span (the opening line PLUS its continuation
# lines) and assert the running TOTAL <= PFV_CAP (60). Finalize the last open
# entry at EOF of PFV_BODY.
#
# FIX #2 (present-but-unparsed loud-fail): track a counter of PFV entries actually
# parsed; if the "### Per-finding validation" header was PRESENT but ZERO entries
# matched the "Validation of Finding " prefix, fail() loudly (mirror the WR-01
# anti-vacuous discipline) instead of falling through to a vacuous pass. The
# absent-branch ("optional section absent -- skipped") is UNCHANGED.
#
# Extraction reuses the existing extract_section helper. Robust to CRLF-normalized
# reports (from-trace already tr -d's CR).
finalize_pfv_entry() {
  # $1 = accumulated word count for the entry; $2 = the entry's first line.
  if [ "$1" -le "$PFV_CAP" ]; then
    pass "per-finding validation budget: $1 <= $PFV_CAP"
  else
    fail "per-finding validation budget exceeded: $1 > $PFV_CAP" "$2"
  fi
}

if printf '%s\n' "$REPORT" | awk '/^### Per-finding validation/{found=1} END{exit !found}'; then
  PFV_BODY="$(extract_section '^### Per-finding validation')"
  pfv_entries=0       # FIX #2: count parsed entries for the present-but-unparsed guard
  pfv_in_entry=0      # 1 while accumulating an open entry's paragraph
  pfv_acc=0           # running wc -w total for the open entry
  pfv_first=""        # the open entry's first ("Validation of Finding N:") line
  while IFS= read -r pfv_line; do
    case "$pfv_line" in
      "Validation of Finding "*)
        # Boundary: a new entry begins. Finalize the previous open entry first.
        if [ "$pfv_in_entry" -eq 1 ]; then
          finalize_pfv_entry "$pfv_acc" "$pfv_first"
        fi
        pfv_entries=$((pfv_entries + 1))
        pfv_in_entry=1
        pfv_first="$pfv_line"
        pfv_acc=$(printf '%s' "$pfv_line" | wc -w)
        ;;
      "### "*)
        # Boundary: a heading ends the current entry's paragraph. (extract_section
        # already stops at the next "### ", so this is belt-and-suspenders.)
        if [ "$pfv_in_entry" -eq 1 ]; then
          finalize_pfv_entry "$pfv_acc" "$pfv_first"
          pfv_in_entry=0
        fi
        ;;
      "")
        # Boundary: a blank line ends the current entry's paragraph.
        if [ "$pfv_in_entry" -eq 1 ]; then
          finalize_pfv_entry "$pfv_acc" "$pfv_first"
          pfv_in_entry=0
        fi
        ;;
      *)
        # Continuation line of the open entry: accumulate its words.
        if [ "$pfv_in_entry" -eq 1 ]; then
          pfv_line_wc=$(printf '%s' "$pfv_line" | wc -w)
          pfv_acc=$((pfv_acc + pfv_line_wc))
        fi
        ;;
    esac
  done < <(printf '%s\n' "$PFV_BODY")

  # Finalize the last open entry at EOF of PFV_BODY.
  if [ "$pfv_in_entry" -eq 1 ]; then
    finalize_pfv_entry "$pfv_acc" "$pfv_first"
  fi

  # FIX #2: present-but-unparsed loud-fail -- header present, zero entries parsed.
  if [ "$pfv_entries" -eq 0 ]; then
    fail "Per-finding validation: header present but ZERO entries parsed" \
      "a present ### Per-finding validation section with no 'Validation of Finding N:' entry is a vacuous pass -- failing loudly"
  fi
else
  pass "Per-finding validation section absent (optional) -- skipped"
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
