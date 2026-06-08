## Security Review Summary

Reviewed: `review-src/disk-info.ts` -- TypeScript disk-usage module accepting an attacker-controlled mount path, shelling out to `du` via `child_process.exec`, querying `systeminformation.fsSize`, and writing results to a remote HTTP cache.

---

All six findings confirmed against source. Splitting Finding 4 per FIX-2 (two distinct sinks: cleartext transport + token-in-URL + secondary injection).

### Critical

1. review-src/disk-info.ts:35: [A03] `exec` concatenates attacker-controlled `query.mountPath` into a shell string; `"/; rm -rf /"` yields arbitrary OS command execution. Use `execFile` with an arg array; allow-list the mount path.
2. review-src/disk-info.ts:69: [A03] `writeCache` interpolates `JSON.stringify(parsed)` (derived from attacker stdout) into `exec('curl ...')`, a second injection sink. Use `execFile`/`fetch` with arg array, no shell.
3. review-src/disk-info.ts:46: [A01] same unvalidated `path` passed to `fsSize` enables traversal (`"../../etc/passwd"`) outside intended mount. Canonicalize + allow-list against permitted mount roots.

### Important

4. review-src/disk-info.ts:20: [A02] live secret `API_TOKEN` (`sk_live_...`) hardcoded in source; any repo reader obtains it, unrotatable without redeploy. Move to a secrets manager / env var; rotate now.
5. review-src/disk-info.ts:68: [A02] cache write uses `http://` and carries the token as a URL query param, leaking it on-path and in access logs. Use `https` + `Authorization` header.

### Suggestions

6. review-src/disk-info.ts:9-15: [A06] `systeminformation@3.42.0` pinned; annotation cites command-injection advisories patched in later majors. Unresolved hedge: specific CVE unconfirmed (unverified). Verify advisory before relying; upgrade to patched major.
```
<verify_request question="Does systeminformation@3.42.0 have published GHSA/NVD command-injection advisories, and which version patches them?" class="2-S" anchor_target="pv-systeminformation-3-42-0-cves" severity="suggestion">
  <context>
    "systeminformation": "3.42.0"  -- predates the command-injection advisories patched in later majors
  </context>
</verify_request>
```
7. review-src/disk-info.ts:55-60: [A09] `cacheResult` swallows all errors silently, hiding malformed-stdout / cache-write failures from detection. Log caught errors with context; alert on parse anomalies.

### Questions

(none)

### Per-finding validation

Validation of Finding 2: raised to Critical (executor folded this into an Important A02 finding). The `curl` sink is an independent command-injection path -- `parsed` derives from attacker-influenced `du` stdout via `JSON.parse`, so shell metacharacters in object values reach `exec`. Confirmed exploitable, not conditional; re-tagged A03.

Validation of Finding 5: held at Important (executor's A02). Confirmed: plaintext `http://` + token-in-query is a real cleartext-credential exposure, but exploitation needs on-path/log access, so not Critical.

### Threat Patterns

Findings 1, 2, 3 share one root: unvalidated `query.mountPath` reaches multiple sinks (shell, filesystem, transitively the curl sink) with no allow-list (the missing input-validation guard at line 30). Findings 1 and 2 chain: injection at line 35 controls `du` stdout, which flows through `cacheResult` into the second `exec` at line 69 -- a single request reaches two RCE sinks. Findings 4, 5 chain with 7: the cleartext token (5) plus swallowed errors (7) mean exfiltration via the on-path leak goes undetected. Finding 6 (vulnerable dep) amplifies the same OS-disk-API injection surface.

### Missed surfaces (optional)

`du` stdout flows unvalidated into `JSON.parse` then a shell sink (line 56-69); the parse-to-exec data path itself is an untrusted-data-integrity surface worth tracking beyond the two named injection points.

---

**Verdict scope:** scope: security-threats

---

**Note on open `verify_request`:** Finding 6 carries an unresolved hedge on the specific CVE identifiers for `systeminformation@3.42.0`. The reviewer escalated this as a Class 2-S question (`pv-systeminformation-3-42-0-cves`). Since the dependency is annotated as "review material only; not installed", `npm audit` cannot resolve it in this workspace. If you need the specific advisory references confirmed, run `npm audit` against a project that pins `systeminformation@3.42.0`, or search GHSA/NVD for `systeminformation` command injection.
