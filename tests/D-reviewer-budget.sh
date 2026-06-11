#!/usr/bin/env bash
# Budget smoke fixture for the reviewer agent (grouped severity grammar).
#
# Parses the grouped severity grammar emitted by
# plugins/lz-advisor/agents/reviewer.md -- findings grouped under
# ### Critical / ### Important / ### Suggestions / ### Questions headers,
# each finding a "N. <file>:<line>: <problem>. <fix>." line with a leading
# continuous integer and NO inline severity token (the section header is the
# sole severity source). Asserts the per-section word budgets and exits 0
# (green) on the current grammar. This is the reviewer half of the regression
# gate (GATE-01), retargeted in lockstep with the Phase 12 agent rewrite (D-10).
#
# Header-tracking parser: track the current ### severity header; count
# numbered finding lines beneath it. There is no inline-severity alternation
# in this grammar -- the single source of truth is the header regex plus the
# numbered-line regex, and the body-strip prefix is derived from the SAME
# numbered-line regex so the count and the strip cannot diverge (WR-05 fixture
# mitigation, carried over from the prior shorthand parser).
#
# Three run modes:
#   (default, no args)        self-extract the holistic worked example from
#                             the agent file, strip the "> " blockquote +
#                             wrapping backticks, parse + budget-check it.
#   --from-trace <file>       parse a captured response file through the
#                             same parser + assertions (Phase 13 supplies
#                             live traces; capability check here).
#   --self-test               synthesize a zero-finding input and assert the
#                             anti-vacuous guard fires (NON-zero exit).
#
# No live `claude -p` invocation (D-03). Standalone, zero-dependency:
# bash + coreutils only (no shared helper lib, D-10).
#
# Run from repo root: bash tests/D-reviewer-budget.sh

set -euo pipefail

# ---------------------------------------------------------------------------
# Config constants
# ---------------------------------------------------------------------------
# Post-Phase-9 path. NOT the stale top-level agents/reviewer.md that the
# legacy validate-phase-04.sh analog uses (RESEARCH Pitfall 1).
REVIEWER_AGENT="plugins/lz-advisor/agents/reviewer.md"
MIN_FINDINGS=5    # anti-vacuous floor (holistic example has 7; headroom 2)
PER_ENTRY_CAP=28  # D-09: per-finding outlier soft cap; prefix EXCLUDED from span
SOFT_TARGET=22    # D-09: per-finding soft target; a WARNING, not a hard fail (the
                  # binding cap is PER_ENTRY_CAP; the soft target informs concision)
PATTERNS_CAP=160  # D-09: cross_cutting_patterns
MISSED_CAP=30     # D-09: missed_surfaces (optional section)
MAX_COUNT=15      # #2: agents' <max_count>15</max_count> finding ceiling
PFV_CAP=60        # #2: per_finding_validation per-entry cap (### Per-finding validation)

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

# ---------------------------------------------------------------------------
# Mode dispatch
# ---------------------------------------------------------------------------
# SECURITY (T-11-01): quote "$TRACE_FILE" everywhere; never eval/source the
# trace; set -u + ${2:?...} catch a missing arg.
MODE="self-extract"
TRACE_FILE=""
case "${1:-}" in
  --from-trace)
    MODE="from-trace"
    TRACE_FILE="${2:?--from-trace needs a file}"
    ;;
  --self-test)
    MODE="self-test"
    ;;
  "")
    MODE="self-extract"
    ;;
  *)
    echo "usage: $0 [--from-trace <file> | --self-test]" >&2
    exit 2
    ;;
esac

# ---------------------------------------------------------------------------
# Agent-file existence guard (loud-fail; prevents a silent vacuous pass when
# the path moves -- RESEARCH Pitfall 1 "0 findings parsed" warning sign).
# Only self-extract mode reads the agent file.
# ---------------------------------------------------------------------------
if [ "$MODE" = "self-extract" ]; then
  if [ ! -f "$REVIEWER_AGENT" ]; then
    fail "agent file missing at $REVIEWER_AGENT" "self-extract source not found"
    exit 1
  fi
fi

# ---------------------------------------------------------------------------
# get_report: emit the raw report text on stdout per mode.
# ---------------------------------------------------------------------------
# self-extract: range the holistic block from "> ### Critical" (the grouped
# grammar's start sentinel; the holistic example begins with the Critical
# section) through the end of the blockquote (the first line that is NOT
# blockquote-prefixed ends the example -- this stops before the prose
# "Word count breakdown:" paragraph). Then strip the "> " prefix and any
# wrapping backticks. The holistic example stays one contiguous blockquote, so
# the terminator (first non-">" line) still bounds it correctly across all
# four severity sections + Cross-Cutting Patterns + Missed surfaces.
get_report() {
  case "$MODE" in
    self-extract)
      awk '/^> ### Critical$/{f=1} f && /^>/{print} f && !/^>/{exit}' "$REVIEWER_AGENT" \
        | sed -E 's/^> ?//; s/^`//; s/`$//'
      ;;
    from-trace)
      # T-11-01: quote "$TRACE_FILE"; never eval/source it. Normalize CRLF -> LF
      # (CR-02) so every downstream consumer -- the bash read loop AND the awk
      # section extractors -- sees LF-only text. Windows / Git Bash traces are
      # CRLF-terminated by default; without this the trailing \r corrupts the
      # per-finding wc -w span and the section heading lookups. tr fixes it
      # once, at the source.
      tr -d '\r' < "$TRACE_FILE"
      ;;
    self-test)
      # Zero-finding synthetic input in the NEW grouped grammar: all four
      # severity headers present, each with a literal (none) marker, plus the
      # trailing Cross-Cutting Patterns header. No numbered finding lines, so
      # the anti-vacuous guard must fire.
      printf '### Critical\n\n(none)\n\n### Important\n\n(none)\n\n### Suggestions\n\n(none)\n\n### Questions\n\n(none)\n\n### Cross-Cutting Patterns\n\nNo cross-cutting patterns across this set.\n'
      ;;
  esac
}

REPORT="$(get_report)"

# ---------------------------------------------------------------------------
# extract_section: print the body lines strictly BETWEEN the matched heading
# and the next "### " heading (or end of report).
# ---------------------------------------------------------------------------
# #3: GENERIC next-"### " boundary, mirroring the security fixture's
# extract_section, instead of hardcoding "### Missed surfaces" as the
# Cross-Cutting terminator. This is NOT dedup (D-10): the two fixtures stay
# standalone; only the boundary LOGIC is aligned. The heading is matched by a
# TOLERANT anchored regex ($0 ~ pat) so trailing variation ("(optional)",
# trailing space, surviving CR) is absorbed, while a missing/renamed required
# heading is caught by the explicit presence pre-check at the call site rather
# than silently zeroing the body.
extract_section() {
  local pat="$1"
  printf '%s\n' "$REPORT" | awk -v pat="$pat" '
    $0 ~ pat          { in_sec = 1; next }
    in_sec && /^### / { in_sec = 0 }
    in_sec            { print }
  ' | sed -E 's/^> ?//'
}

# ---------------------------------------------------------------------------
# Parse findings (header-tracking + numbered-line parser, D-10).
# ---------------------------------------------------------------------------
# Severity headers carry the severity (no inline token). Track the current
# ### severity header; count "N. <file>:<line[-range]>: " numbered lines
# beneath it. Use TOLERANT anchored matches ([[ =~ ]] anchored ^...$ / ^...),
# not byte-exact equality, so a trailing space / surviving CR / heading drift
# does not silently zero the parse (WR-03 / Pitfall 3 lesson).
#
# SINGLE SOURCE OF TRUTH (WR-05): FINDING_RE is used BOTH to count a finding
# AND (as the body-strip prefix below) to remove the "N. <file>:<line>: "
# prefix, so the count regex and the strip regex cannot diverge and leave the
# location prefix inside the counted wc -w span.
#
# (none) markers and blank lines are NOT findings -- they simply fail
# FINDING_RE and are skipped; no special-casing needed.
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
FINDING_RE='^[0-9]+\. `?[^[:space:]]+:[0-9]+(-[0-9]+)?: '
matched_count=0
current_sev=""
declare -a FINDING_BODIES=()

while IFS= read -r line; do
  case "$line" in
    *"<verify_request"*)
      continue
      ;;
  esac

  if [[ "$line" =~ $SEV_HEADERS ]]; then
    current_sev="$line"
    continue
  fi

  if [[ -n "$current_sev" && "$line" =~ $FINDING_RE ]]; then
    matched_count=$((matched_count + 1))
    # Strip the "N. <file>:<line[-range]>: " prefix (and any leading/trailing
    # backtick framing) so the counted span is the <problem>. <fix>. body only
    # (D-09 / Pitfall 5: the per-finding budget EXCLUDES the prefix). The strip
    # pattern is the FINDING_RE prefix -- single source of truth with the count.
    body="$(printf '%s' "$line" | sed -E 's/^[0-9]+\. `?[^[:space:]]+:[0-9]+(-[0-9]+)?: //; s/`$//')"
    FINDING_BODIES+=("$body")
  fi
done < <(printf '%s\n' "$REPORT")

# ---------------------------------------------------------------------------
# Anti-vacuous guard BEFORE the budget loop (D-04 / D-06).
# ---------------------------------------------------------------------------
# ALWAYS print the parsed count -- a green run showing "0 findings parsed" is
# the documented silent-pass detection signal.
echo "$matched_count findings parsed"

# --self-test inversion: the EXPECTED outcome is that the anti-vacuous guard
# FIRES on the zero-finding input -- proving fail-loudly behavior. The contract
# (plan <done>/<acceptance_criteria>/<verification>) requires this mode to exit
# NON-zero when the guard correctly fires. A non-firing guard (matched_count
# still >= MIN_FINDINGS on a zero-finding input) is itself a different failure,
# also non-zero.
if [ "$MODE" = "self-test" ]; then
  if [ "$matched_count" -lt "$MIN_FINDINGS" ]; then
    echo "[PASS] --self-test: zero-finding input correctly trips the anti-vacuous guard (fail-loudly)"
    echo "Status: [FAIL] -- self-test exits non-zero by design (the guard fired as expected)"
    exit 1
  else
    echo "[FAIL] --self-test: zero-finding input did NOT trip the anti-vacuous guard"
    echo "       expected matched_count < $MIN_FINDINGS, got $matched_count"
    exit 1
  fi
fi

# WR-01: a too-few-findings parse makes every downstream budget check
# meaningless (a 0-finding parse emits green [PASS] section lines that read as
# mostly-green even though the parser matched nothing). Short-circuit with a
# loud FAIL and a non-zero exit BEFORE the budget loop so no spurious green
# PASS lines muddy the diagnostic. This is also the RED-on-old proof: the OLD
# shorthand sample (`<path>:<line>: crit: ...` with NO leading "N." and a single
# ### Findings header) matches neither SEV_HEADERS nor FINDING_RE, so a
# --from-trace replay of the old grammar parses 0 findings and trips here.
if [ "$matched_count" -lt "$MIN_FINDINGS" ]; then
  fail "anti-vacuous: only $matched_count findings parsed (need >= $MIN_FINDINGS)" \
    "header-tracking parser matched too few findings -- gate would be vacuous"
  echo "Status: [FAIL] -- anti-vacuous guard fired; skipping budget checks"
  exit 1
fi
pass "anti-vacuous: matched_count $matched_count >= $MIN_FINDINGS"

# ---------------------------------------------------------------------------
# Per-section budget assertions (D-09) over the parsed report.
# ---------------------------------------------------------------------------

# Per-finding loop: each body (prefix excluded) <= PER_ENTRY_CAP (28w).
# No auto-clarity carve-out in the reviewer fixture (that is security-only).
#
# #2(c): the 22w SOFT_TARGET is the per-finding target, NOT the binding cap
# (D-09). A body within PER_ENTRY_CAP (28w) but over SOFT_TARGET (22w) emits a
# NON-FATAL [WARN] line and does NOT increment FAIL_COUNT, so it never changes
# the exit code. The hard gate is PER_ENTRY_CAP.
for body in "${FINDING_BODIES[@]}"; do
  wc_words=$(printf '%s' "$body" | wc -w)
  if [ "$wc_words" -le "$PER_ENTRY_CAP" ]; then
    pass "per-finding budget: $wc_words <= $PER_ENTRY_CAP -- $body"

    if [ "$wc_words" -gt "$SOFT_TARGET" ]; then
      echo "[WARN] per-finding soft target: $wc_words > $SOFT_TARGET (within hard cap $PER_ENTRY_CAP) -- $body"
    fi
  else
    fail "per-finding budget exceeded: $wc_words > $PER_ENTRY_CAP" "$body"
  fi
done

# #2(a): max_count=15 finding ceiling -- assert matched_count <= MAX_COUNT.
# Mirrors the agents' <max_count>15</max_count>. Reviewer holistic baseline=7,
# well under the ceiling.
if [ "$matched_count" -le "$MAX_COUNT" ]; then
  pass "max_count ceiling: $matched_count <= $MAX_COUNT"
else
  fail "max_count ceiling exceeded: $matched_count > $MAX_COUNT" \
    "the grouped grammar caps findings at $MAX_COUNT per response"
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
# (FIX #4: the prior dead per-entry-failed flag variable + its no-op `if` are
# gone; fail() already drives FAIL_COUNT / the exit code. The loop shape now
# matches the security fixture.)
#
# Extraction uses the generic extract_section() helper (#3 boundary). Robust to
# CRLF-normalized reports (from-trace already tr -d's CR).
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

# Cross-Cutting Patterns (REQUIRED): range from "### Cross-Cutting Patterns" to
# the NEXT "### " heading (generic boundary via extract_section, #3), strip any
# residual blockquote marker, wc -w, assert <= 160w. The 's/^> ?//' sed (inside
# extract_section) strips the bare ">" separator form too (not just "> "), so
# surviving blockquote-blank lines are not counted as words.
#
# CR-WR-01: presence pre-check FIRST. This section is REQUIRED. Without a
# presence check a missing header yields an empty body -> wc -w = 0 -> a
# vacuous GREEN pass. Mirror the security fixture's Threat Patterns gate: fail
# loudly when the required heading is absent.
# CR-WR-02 / #3: start pattern is the TOLERANT prefix form (no trailing "$"
# anchor) and the terminator is the GENERIC next-"### " boundary (not the
# hardcoded "### Missed surfaces"), so a future/added trailing section is not
# swallowed and a trailing-space / drifted header is caught by the presence
# check rather than silently zeroing the body.
if printf '%s\n' "$REPORT" | awk '/^### Cross-Cutting Patterns/{f=1} END{exit !f}'; then
  PATTERNS_BODY="$(extract_section '^### Cross-Cutting Patterns')"
  PATTERNS_WORDS=$(printf '%s' "$PATTERNS_BODY" | wc -w)
  if [ "$PATTERNS_WORDS" -le "$PATTERNS_CAP" ]; then
    pass "Cross-Cutting Patterns budget: $PATTERNS_WORDS <= $PATTERNS_CAP"
  else
    fail "Cross-Cutting Patterns budget exceeded: $PATTERNS_WORDS > $PATTERNS_CAP" \
      "$PATTERNS_BODY"
  fi
else
  fail "Cross-Cutting Patterns: REQUIRED heading not found" \
    "the grouped grammar mandates a ### Cross-Cutting Patterns section; absent here"
fi

# Missed surfaces (OPTIONAL): range from "### Missed surfaces" to the NEXT
# "### " heading (or end of report) via the generic extract_section helper (#3),
# wc -w, assert <= 30w only when the section is present. WR-04: the range is
# bounded at the next heading rather than run to EOF, so any later section in a
# --from-trace input (a future per-finding block, an appended section, trailing
# trace metadata) is NOT swallowed into the Missed-surfaces word count -- mirrors
# the security fixture's extract_section.
MISSED_BODY="$(extract_section '^### Missed surfaces')"
MISSED_WORDS=$(printf '%s' "$MISSED_BODY" | wc -w)
if printf '%s\n' "$REPORT" | awk '/^### Missed surfaces/{found=1} END{exit !found}'; then
  if [ "$MISSED_WORDS" -le "$MISSED_CAP" ]; then
    pass "Missed surfaces budget: $MISSED_WORDS <= $MISSED_CAP"
  else
    fail "Missed surfaces budget exceeded: $MISSED_WORDS > $MISSED_CAP" \
      "$MISSED_BODY"
  fi
else
  pass "Missed surfaces section absent (optional) -- no budget check"
fi

# ---------------------------------------------------------------------------
# Summary + exit (house STYLE from validate-phase-03.sh:148-158)
# ---------------------------------------------------------------------------
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
