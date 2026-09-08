# Opus 4.x Stage-2 judge calibration -- the DISQUALIFIED run (permanent record)

Committed so the disqualified run survives a fresh clone. The verdict store under
`eval/.cache/` is gitignored, so without this table "published, not buried" would hold only
for the headline number. See `eval/lz-eval-parity-prereg.md` AMENDMENT RECORD 3.

## Gate result

```
mcc=0.4889  lowerCI=0.2722  cleared=false  n=60      (exit 1 -- DISQUALIFIER, PAR-02)
```

Predicate: `cleared = mcc >= JUDGE_MCC_BAR.POINT (0.5) && lowerCI > JUDGE_MCC_BAR.LOWER_FLOOR (0)`.
Lower CI is BCa at `alpha=0.05, resamples=2000, seed='bca'` (pre-registered in AMENDMENT RECORD 3;
these were previously code defaults only).

## Decomposition (descriptive diagnosis -- NEVER a pass; see AMENDMENT RECORD 3)

```
ALL              n=60  tp=18 fp=7 tn=27 fn= 8  acc=0.750  mcc=0.4889  lowerCI=0.2722
subtle only      n=17  tp= 0 fp=4 tn=13 fn= 0  acc=0.765  mcc=0.0000   <- single-pole (all gold refuted)
clear-cut only   n=43  tp=18 fp=3 tn=14 fn= 8  acc=0.744  mcc=0.5045  lowerCI=0.2804
```

Outcome tally over the 60 rows below: 45 hit / 7 FP / 8 FN.

The clear-cut subset clears the FULL predicate (`cleared === true`). Reporting it as a cleared gate
is FORBIDDEN post-hoc subgroup selection. It also fails closed in code: that subset carries zero
subtle items, so `judgeCalibrationGate` throws its D-13 subtle-count `ContractError`.

## Instrument

Opus 4.x, dispatched by the Agent tool alias `model: opus` in the session of 2026-06-23. The verdict
files recorded only `{uid, verdict, reasoning}` -- no model pin -- so the instrument is attributable
only via session context and file mtimes. `readVerdict` now fails closed on an unpinned verdict, so
this set is deliberately NOT re-scorable through that path; it is archival.

## Per-item rows

| uid | judge verdict | WiCE gold | subtle | outcome |
|-----|---------------|-----------|--------|---------|
| `dev00003-0` | refuted | refuted | no | hit |
| `dev00003-1` | refuted | refuted | no | hit |
| `dev00003-2` | unrefuted | refuted | no | FP |
| `dev00004-0` | refuted | refuted | yes | hit |
| `dev00004-1` | refuted | unrefuted | no | FN |
| `dev00004-2` | refuted | refuted | yes | hit |
| `dev00005-0` | refuted | refuted | no | hit |
| `dev00005-1` | refuted | refuted | no | hit |
| `dev00016-0` | unrefuted | unrefuted | no | hit |
| `dev00016-1` | unrefuted | unrefuted | no | hit |
| `dev00016-2` | unrefuted | refuted | yes | FP |
| `dev00018-0` | refuted | unrefuted | no | FN |
| `dev00018-1` | unrefuted | unrefuted | no | hit |
| `dev00025-0` | refuted | refuted | yes | hit |
| `dev00025-1` | unrefuted | unrefuted | no | hit |
| `dev00028-0` | refuted | unrefuted | no | FN |
| `dev00028-1` | unrefuted | unrefuted | no | hit |
| `dev00030-0` | refuted | refuted | no | hit |
| `dev00030-1` | unrefuted | refuted | yes | FP |
| `dev00068-0` | refuted | refuted | no | hit |
| `dev00068-1` | refuted | refuted | no | hit |
| `dev00068-2` | refuted | refuted | no | hit |
| `dev00108-0` | refuted | unrefuted | no | FN |
| `dev00108-1` | unrefuted | refuted | no | FP |
| `dev00108-2` | refuted | unrefuted | no | FN |
| `dev00116-0` | unrefuted | unrefuted | no | hit |
| `dev00116-1` | unrefuted | unrefuted | no | hit |
| `dev00116-2` | unrefuted | unrefuted | no | hit |
| `dev00126-0` | refuted | refuted | no | hit |
| `dev00126-1` | refuted | refuted | no | hit |
| `dev00126-2` | unrefuted | unrefuted | no | hit |
| `dev00131-0` | refuted | refuted | no | hit |
| `dev00131-1` | unrefuted | refuted | no | FP |
| `dev00137-0` | unrefuted | unrefuted | no | hit |
| `dev00137-1` | refuted | unrefuted | no | FN |
| `dev00156-0` | unrefuted | unrefuted | no | hit |
| `dev00156-1` | refuted | refuted | no | hit |
| `dev00164-0` | unrefuted | unrefuted | no | hit |
| `dev00164-1` | unrefuted | unrefuted | no | hit |
| `dev00164-2` | unrefuted | unrefuted | no | hit |
| `dev00217-0` | refuted | refuted | yes | hit |
| `dev00217-1` | refuted | refuted | yes | hit |
| `dev00217-2` | unrefuted | unrefuted | no | hit |
| `dev00219-0` | unrefuted | unrefuted | no | hit |
| `dev00219-1` | refuted | refuted | yes | hit |
| `dev00219-2` | refuted | refuted | no | hit |
| `dev00224-0` | refuted | unrefuted | no | FN |
| `dev00224-1` | unrefuted | unrefuted | no | hit |
| `dev00236-0` | refuted | refuted | no | hit |
| `dev00279-1` | unrefuted | unrefuted | no | hit |
| `dev00279-2` | refuted | unrefuted | no | FN |
| `dev00315-1` | refuted | refuted | yes | hit |
| `dev00316-0` | refuted | refuted | yes | hit |
| `dev00316-2` | refuted | refuted | yes | hit |
| `dev00330-1` | refuted | refuted | yes | hit |
| `dev00388-1` | unrefuted | refuted | yes | FP |
| `dev00418-1` | refuted | refuted | yes | hit |
| `dev00429-0` | unrefuted | refuted | yes | FP |
| `dev00520-0` | refuted | refuted | yes | hit |
| `dev00572-0` | refuted | refuted | yes | hit |
