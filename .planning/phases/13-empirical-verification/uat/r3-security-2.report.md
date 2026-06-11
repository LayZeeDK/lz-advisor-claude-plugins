## Security Review Summary

Reviewed: `review-src/disk-info.ts` (disk-usage query module) + sibling `review-src/handler.ts` (scoped to `disk-info.ts` per request)

### Critical

1. review-src/disk-info.ts:35: [A03] `exec` concatenates attacker-controlled `query.mountPath` into a shell string; `/; rm -rf /` yields arbitrary RCE. Use `execFile('du', ['-sh', path])`; allow-list the mount path.
2. review-src/disk-info.ts:69: [A03] `exec('curl ' + url ...)` concatenates `JSON.stringify(parsed)` derived from attacker-influenced stdout into a shell string (second-order injection). Replace with `https` `fetch`/`execFile`.
3. review-src/disk-info.ts:20: [A07] live `sk_live_...` token hardcoded module-level; every repo reader, fork, and CI log obtains it. Move to a secrets manager / env var; rotate now.
4. review-src/disk-info.ts:68: [A02] cache URL built over `http://` with `API_TOKEN` as a query param leaks the secret to proxy/access logs. Switch to `https` + `Authorization` header.

### Important

5. review-src/disk-info.ts:46: [A01] unvalidated `query.mountPath` flows to `fsSize` enabling traversal (`../../etc`) outside intended mount. Canonicalize with `path.resolve` + allow-list prefix check.

### Suggestions

6. review-src/disk-info.ts:9-13: [A06] comment pins `systeminformation@3.42.0` predating command-injection advisories. Unresolved hedge: CVE applicability unverified (review-only, not installed). Verify advisory IDs before relying.
7. review-src/disk-info.ts:55-60: [A09] `catch (_)` in `cacheResult` swallows all errors silently; tampered-stdout / cache-write failures produce no log. Log the caught error to a monitored sink.

### Questions

(none)

### Per-finding validation

Validation of Finding 2: confirmed Critical but reachability is conditional -- it requires Finding 1's stdout to flow through `JSON.parse` -> `writeCache` AND the attacker to shape `du` output into injectable JSON. The dominant vector is direct shell-metacharacter injection at Finding 1 (line 35); Finding 2 is the second stage, not an independent unauthenticated entry.

Validation of Finding 6: held at Suggestions (executor said Important) pending CVE confirmation. File is review-only/not installed, so blast radius is theoretical until the advisory and an actual install are confirmed. Escalate to Important on positive verification.

### Threat Patterns

Findings 1->7->2 form a multi-stage chain: line 35 `exec` is the primary unauthenticated RCE sink; its stdout passes through `cacheResult` (Finding 7's silent `catch` hides tampering evidence) into `writeCache`'s second `exec` (Finding 2), giving a second injection stage that also exfiltrates the Finding 3 hardcoded token over the Finding 4 cleartext channel. Shared root: zero input validation on `query.mountPath` plus shell-string concatenation as the universal sink pattern. Findings 3 and 4 compound -- the same plaintext secret is both committed and wired onto the network. A single crafted `mountPath` chains RCE, credential theft, and blind monitoring (Finding 7) in one request.

### Missed surfaces (optional)

`getDiskUsage` returns `{ path, size }` to the caller -- if surfaced in an HTTP response, the echoed `path` is a reflected-output vector worth checking at the handler boundary.

**Verdict scope:** scope: security-threats
