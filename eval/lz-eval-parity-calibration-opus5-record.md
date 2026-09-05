# Stage-2 judge calibration -- the Opus 5 re-calibration record (Phase 22; PAR-02 / D-13)

THE RESULT: **`mcc=0.4531 lowerCI=0.2366 cleared=false n=60`** (2026-09-05).

This is the durable, committed record of the SINGLE re-calibration authorized by AMENDMENT RECORD 3
of `eval/lz-eval-parity-prereg.md`. It is committed rather than left in `eval/.cache/` (which is
gitignored and dies with one `git clean -xdf`) for the same reason the Opus 4.x record is:
"published, not buried" means reproducible from a fresh clone, not a headline number in prose.

## Verdict under the pre-committed stopping rule

`cleared === false`. Per AMENDMENT RECORD 3 the phase **HALTS**:

- NO report was graded. An uncalibrated judge is a PAR-02 DISQUALIFIER, and no Stage-3 grading spend
  was authorized or incurred.
- NO third instrument. NO prompt revision. NO widening of the WiCE draw.
- NO subgroup read was even computed. The stopping rule bans it in terms ("no subgroup read"), so
  unlike the 4.x diagnosis this record deliberately contains no per-subset MCC. Only the aggregate
  confusion matrix and the raw per-item rows appear below, so a replicator can compute whatever a
  fresh pre-registration licenses them to compute.
- Conditional C was unavailable by construction (retired prospectively in AMENDMENT RECORD 3), and
  the realized shape would not have triggered it in any case.

The remaining construct question is deferred to a NEW phase under its OWN fresh pre-registration.

## Instrument of record

`claude-opus-5`, enforced: every one of the 60 verdict files carries the pin, and
`assembleGateInput`'s single-instrument check passed (the set spans exactly one model string).

Provenance is the AMENDMENT RECORD 3 route and carries its stated weakness: the id is the generation
the `opus` alias resolved to for this account in this session, taken from the orchestrating session's
own identity, NOT a per-call attestation read from a per-subagent init event (the Agent tool exposes
none). It establishes the GENERATION, not the individual call.

## Pre-run gates (all verified before verdict #1 landed)

| Gate | Result |
|------|--------|
| Calibration prompt sha256 `cb3d567a7ac099099453834f06db89f84c7b063c0eda317fd541e707747247e6` | MATCH |
| 60 WiCE records digest `2353066d70c5a4b421bc9294a620ac98f42cd3566ec705d524961c6da7e82e6b` | MATCH |
| `pendingItems` before the run | 60/60 (attempt unconsumed) |
| Set shape | total=60 unrefuted=26 refuted=34 subtle=17 (the frozen AMENDMENT RECORD 2 draw) |
| Anti-leak control over all 60 dispatch files | 0 uid hits, 0 gold-marker hits, 0 unsubstituted placeholders |

## Comparison to the disqualified Opus 4.x instrument

| | Opus 4.x | Opus 5 |
|---|---|---|
| MCC (point) | 0.4889 | **0.4531** |
| one-sided lower CI | 0.2722 | **0.2366** |
| `cleared` | false | **false** |
| accuracy | 0.750 | 0.733 |
| tp / fp / tn / fn | 18 / 7 / 27 / 8 | 17 / 7 / 27 / 9 |

The forced instrument replacement did not rescue the gate; it scored slightly LOWER on every
headline figure. Stated plainly because AMENDMENT RECORD 3's stated justification for re-running at
all was that a null on a re-runnable judge is a materially better result than a null on a judge
nobody can invoke again. That is what this is: a null a replicator can reproduce.

## Aggregate confusion matrix (positive class = `unrefuted`)

```
ALL  n=60  tp=17  fp=7  tn=27  fn=9  acc=0.733
```

## Transport fidelity limits realized in this run

1. **Temperature** (pre-existing, `lz-eval-parity-calibration-prompt.md`): the driver specifies temp
   0; the Agent sub-agent transport exposes no temperature knob, so the judge ran at the sub-agent
   default.
2. **Tool access** (pre-existing, AMENDMENT RECORD 3): the Agent tool cannot restrict a spawned
   agent's tools, so the judge ran on a general-purpose persona that DID possess file tools while the
   WiCE gold sat on disk. Mitigations were the emphatic no-tools instruction and uid omission.
   **Measured outcome: all 60 judge sub-agents returned `tool_uses: 0`.** The mitigation held in
   every case -- this is now an observation, not just a hope.
3. **Transcription** (NEW, not anticipated by AMENDMENT RECORD 3): the pre-registration requires the
   payload to be INLINED in the agent prompt and forbids the judge reading the dispatch file, so the
   orchestrating session transcribed ~520 KB of evidence by hand across the 60 dispatches.
   Transcription drift would silently alter the instrument. Mitigation applied: the 60 items share
   only 29 unique evidence documents, each read immediately before dispatch and reused verbatim
   within its group. An independent check was attempted -- recover each sub-agent's RECEIVED prompt
   from its transcript and diff it byte-for-byte against the pinned `item-NN.txt` -- and it came back
   INCONCLUSIVE, not passing: the checker recovered zero payloads because 62 of the 63 task transcript
   files are 0 bytes and the transport retains no readable copy of the outbound prompt. **Transcription
   fidelity is therefore an UNVERIFIED assumption of this run.** It is the weakest link in this
   record and a future phase should close it by having the harness itself persist the exact dispatched
   string per item.
4. **One transport interruption**: dispatching item `dev00131-0` was refused once with "Output
   blocked by content filtering policy" (the orchestrator's own message; no sub-agent spawned, no
   verdict file created). Disk state was verified (31 landed / 29 pending, the uid absent) and the
   identical dispatch succeeded on retry, so the block was transient. Recorded because an unexplained
   gap in a one-shot calibration is exactly what a replicator needs to see.

## Instrument-quality observation (descriptive; changed no verdict)

Three of sixty verdict files (`dev00016-1`, `dev00219-1`, `dev00429-0`) carry a `reasoning` string
that argues the OPPOSITE of the `verdict` token beside it. All three were persisted verbatim: each
verdict is parseable and in-enum, so the write-once clause does not permit discarding it, and
`readVerdict` scores only the token. A judge whose stated reasoning contradicts its own emitted
verdict is measured on the token, not the argument -- a limitation of the two-token output contract.
This is recorded as a seed for the future phase; it is NOT offered as an explanation for the failure
and must not be used to argue the set up or down.

## All 60 rows

| uid | verdict | gold | subtle | outcome |
|-----|---------|------|--------|---------|
| dev00003-0 | refuted | refuted | false | hit |
| dev00003-1 | refuted | refuted | false | hit |
| dev00003-2 | unrefuted | refuted | false | FP |
| dev00004-0 | refuted | refuted | true | hit |
| dev00004-1 | refuted | unrefuted | false | FN |
| dev00004-2 | refuted | refuted | true | hit |
| dev00005-0 | refuted | refuted | false | hit |
| dev00005-1 | refuted | refuted | false | hit |
| dev00016-0 | unrefuted | unrefuted | false | hit |
| dev00016-1 | refuted | unrefuted | false | FN |
| dev00016-2 | refuted | refuted | true | hit |
| dev00018-0 | unrefuted | unrefuted | false | hit |
| dev00018-1 | refuted | unrefuted | false | FN |
| dev00025-0 | refuted | refuted | true | hit |
| dev00025-1 | unrefuted | unrefuted | false | hit |
| dev00028-0 | refuted | unrefuted | false | FN |
| dev00028-1 | unrefuted | unrefuted | false | hit |
| dev00030-0 | refuted | refuted | false | hit |
| dev00030-1 | unrefuted | refuted | true | FP |
| dev00068-0 | refuted | refuted | false | hit |
| dev00068-1 | refuted | refuted | false | hit |
| dev00068-2 | refuted | refuted | false | hit |
| dev00108-0 | unrefuted | unrefuted | false | hit |
| dev00108-1 | refuted | refuted | false | hit |
| dev00108-2 | refuted | unrefuted | false | FN |
| dev00116-0 | unrefuted | unrefuted | false | hit |
| dev00116-1 | unrefuted | unrefuted | false | hit |
| dev00116-2 | unrefuted | unrefuted | false | hit |
| dev00126-0 | refuted | refuted | false | hit |
| dev00126-1 | refuted | refuted | false | hit |
| dev00126-2 | unrefuted | unrefuted | false | hit |
| dev00131-0 | unrefuted | refuted | false | FP |
| dev00131-1 | refuted | refuted | false | hit |
| dev00137-0 | unrefuted | unrefuted | false | hit |
| dev00137-1 | refuted | unrefuted | false | FN |
| dev00156-0 | unrefuted | unrefuted | false | hit |
| dev00156-1 | refuted | refuted | false | hit |
| dev00164-0 | unrefuted | unrefuted | false | hit |
| dev00164-1 | unrefuted | unrefuted | false | hit |
| dev00164-2 | unrefuted | unrefuted | false | hit |
| dev00217-0 | refuted | refuted | true | hit |
| dev00217-1 | refuted | refuted | true | hit |
| dev00217-2 | unrefuted | unrefuted | false | hit |
| dev00219-0 | refuted | unrefuted | false | FN |
| dev00219-1 | unrefuted | refuted | true | FP |
| dev00219-2 | refuted | refuted | false | hit |
| dev00224-0 | refuted | unrefuted | false | FN |
| dev00224-1 | unrefuted | unrefuted | false | hit |
| dev00236-0 | refuted | refuted | false | hit |
| dev00279-1 | unrefuted | unrefuted | false | hit |
| dev00279-2 | refuted | unrefuted | false | FN |
| dev00315-1 | refuted | refuted | true | hit |
| dev00316-0 | refuted | refuted | true | hit |
| dev00316-2 | refuted | refuted | true | hit |
| dev00330-1 | refuted | refuted | true | hit |
| dev00388-1 | unrefuted | refuted | true | FP |
| dev00418-1 | unrefuted | refuted | true | FP |
| dev00429-0 | unrefuted | refuted | true | FP |
| dev00520-0 | refuted | refuted | true | hit |
| dev00572-0 | refuted | refuted | true | hit |

## Reproducing this

```
node eval/lz-eval-parity-calibration-harness.mjs score   # over the landed verdicts
```

The 60 verdict files live at `eval/.cache/p22-baseline/calibration/<uid>.verdict.json`
(gitignored -- this document is the durable copy). Run notes for the session are at
`eval/.cache/p22-baseline/calibration-opus5-run-notes.md`.

## Cross-reference

- `eval/lz-eval-parity-prereg.md` -- AMENDMENT RECORD 3 (the authorization, the stopping rule, the
  write-once clause, the subgroup ban, the BCa knobs).
- `eval/lz-eval-parity-calibration-opus4x-record.md` -- the prior disqualified instrument.
- `eval/lz-eval-judge-calibration.mjs` -- the frozen `JUDGE_MCC_BAR` + `judgeCalibrationGate`.
- `eval/lz-eval-parity-driver.md` Stage 2 -- the transport this run followed.
