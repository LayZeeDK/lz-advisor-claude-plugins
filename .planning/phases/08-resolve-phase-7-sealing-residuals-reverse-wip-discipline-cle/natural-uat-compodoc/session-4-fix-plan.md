# Plan: Address Storybook Compodoc Review Findings

## Strategic Direction

1. Remove `browserTarget` entirely from `storybook` and `build-storybook` targets in `project.json`; library has no browser target and the self-reference is invalid (F1, F2).
2. Delete `"../documentation.json"` from `include` in `.storybook/tsconfig.json`; `resolveJsonModule` suffices (F3).
3. Add `{projectRoot}/documentation.json` to `outputs` on `storybook` target for symmetry (F4).
4. Add `effect(() => this.sampleChange.emit(this.sample() ?? ''))`; wires the implied `[(sample)]` contract (F5).
5. Replace hardcoded `--url` port with documented coupling comment (F6).
6. Append trailing newline to `.gitignore` (F7).

## Findings Disposition

- **Finding F1:** `build-storybook` `browserTarget` self-reference (`project.json:72`)
  - **Disposition:** addressed
  - **Rationale:** Step 1 removes `browserTarget` from `build-storybook`. The library has no `@angular-devkit/build-angular:browser` target; `browserTarget` defaults to `null` and is not needed.

- **Finding F2:** `storybook` dev-server `browserTarget` cross-reference (`project.json:49`)
  - **Disposition:** addressed
  - **Rationale:** Step 1 also removes `browserTarget` from `storybook`. Same root cause and fix as F1.

- **Finding F3:** Cold-clone TypeScript failure from gitignored generated file (two surfaces: `preview.ts:3` and `tsconfig.json:9`)
  - **Disposition:** addressed
  - **Rationale:** Step 2 removes `"../documentation.json"` from the `include` array. `resolveJsonModule` in `compilerOptions` is sufficient for the import in `preview.ts`; the explicit `include` entry is redundant and causes a harder "File not found" diagnostic on a fresh clone.

- **Finding F4:** `storybook` target missing `documentation.json` in `outputs`
  - **Disposition:** addressed
  - **Rationale:** Step 3 adds `{projectRoot}/documentation.json` to the `storybook` target's `outputs`, mirroring what `build-storybook` already declares.

- **Finding F5:** `sampleChange` output never emits -- false JSDoc contract
  - **Disposition:** addressed
  - **Rationale:** Step 4 adds an `effect()` body that emits `this.sample()` whenever the input changes, fulfilling the implied `[(sample)]` two-way binding contract the naming convention promises. Also adds `effect` to the Angular imports.

- **Finding F6:** `test-storybook` hardcodes port 4200
  - **Disposition:** addressed
  - **Rationale:** Step 5 adds a comment documenting the coupling between `test-storybook`'s `--url` port and the `storybook` target's `port` option, making the dependency explicit without introducing dynamic port resolution.

- **Finding F7:** `.gitignore` missing trailing newline
  - **Disposition:** addressed
  - **Rationale:** Step 6 appends a trailing newline to `.gitignore` per POSIX text file requirements.

## Steps

1. **Remove `browserTarget` from `storybook` and `build-storybook` targets**
   - File: `packages/ngx-smart-components/project.json`
   - Change: Delete the `"browserTarget": "ngx-smart-components:build-storybook"` line from both the `storybook` target (line 49) and the `build-storybook` target (line 72). The library project has no `@angular-devkit/build-angular:browser` executor target; `browserTarget` is optional (default: `null`) and the current value is a circular/self-referential reference that happens to be tolerated in practice but is structurally invalid.
   - Rationale: Addresses F1 and F2. Verified against `build-schema.json`: `browserTarget` defaults to `null` (pv-1).

2. **Remove `"../documentation.json"` from `.storybook/tsconfig.json` `include`**
   - File: `packages/ngx-smart-components/.storybook/tsconfig.json`
   - Change: Delete the `"../documentation.json"` entry from the `include` array (currently line 9). Leave all other `include` entries unchanged. `resolveJsonModule: true` in `compilerOptions` already enables the `import docJson from '../documentation.json'` import in `preview.ts`; the explicit `include` entry is redundant and produces a harder "File not found" diagnostic on a cold clone where `documentation.json` does not yet exist.
   - Rationale: Addresses the `tsconfig.json` surface of F3.

3. **Add `{projectRoot}/documentation.json` to `storybook` target `outputs`**
   - File: `packages/ngx-smart-components/project.json`
   - Change: Add an `"outputs"` field to the `storybook` target containing `["{projectRoot}/documentation.json"]`. The `build-storybook` target already declares this output; the `storybook` dev-server (with `compodoc: true`) also generates this file and should declare it for symmetry and discoverability.
   - Rationale: Addresses F4. `continuous: true` tasks are not cached by Nx, so this is a documentation concern, not a cache-correctness concern.

4. **Wire `sampleChange` output with `effect()` in `NgxSmartComponents`**
   - File: `packages/ngx-smart-components/src/lib/ngx-smart-components/ngx-smart-components.ts`
   - Change: Add `effect` to the Angular imports. Add a constructor body with `effect(() => { this.sampleChange.emit(this.sample() ?? ''); })`. This fulfills the `[(sample)]` two-way binding contract implied by the naming convention and the JSDoc comment "Emitted when the sample value changes."
   - Rationale: Addresses F5. The advisor preferred wiring over softening the JSDoc because the naming convention (`sampleChange` alongside `sample`) is a contract, not an accident.

5. **Document port coupling in `test-storybook` target**
   - File: `packages/ngx-smart-components/project.json`
   - Change: Add a `// port must match storybook target port: 4200` comment (or an equivalent `"description"` field if the JSON format allows it; otherwise document in a `README.storybook.md` or inline in the command string as a `# comment` prefix is not valid JSON). Since `project.json` is JSON and comments are not supported natively, add a `"_comment"` sibling key to the `test-storybook` options object: `"_comment": "url port must match storybook target options.port (currently 4200)"`.
   - Rationale: Addresses F6. Dynamic port resolution is not straightforward in Nx `run-commands`; explicit documentation prevents silent mismatches if the port ever changes.

6. **Append trailing newline to `.gitignore`**
   - File: `.gitignore`
   - Change: Append a single newline character after the last line (`packages/ngx-smart-components/documentation.json`). The file currently ends without a trailing newline (POSIX text file violation).
   - Rationale: Addresses F7. One character change; prevents tool inconsistencies.

## Key Decisions

- **Remove `browserTarget` rather than pointing at `ngx-smart-components:build`:** The library's `build` target uses `@nx/angular:package`, not `@angular-devkit/build-angular:browser`. The schema says `browserTarget` "should generally target" the browser builder -- pointing at a library packager target is not the intended use. Since the Storybook setup needs no app-level styles or assets, `null` (omitted) is the correct value.
- **`effect()` wiring over JSDoc softening for F5:** The `[(sample)]` convention is load-bearing for consumers reading the API. Softening the JSDoc while keeping the naming pattern would leave a misleading API surface. An `effect()` in the constructor is idiomatic Angular signals and matches what a real component would do.
- **`_comment` field for F6:** JSON does not support comments. A `_comment` sibling key is the conventional workaround in project.json files and does not affect Nx executor behavior.
- **Risk -- F4 `outputs` on `continuous` target:** Adding outputs to a `continuous: true` task is safe; Nx does not cache continuous tasks. The only downside is a no-op for caching purposes, but it improves output documentation.

## Dependencies

Steps can be applied in any order; they touch independent files and independent sections of `project.json`. Steps 1 and 3 both edit `project.json` and should be done sequentially in a single edit pass to avoid diff conflicts.

Suggested order: 1 + 3 together (project.json), then 2 (tsconfig.json), then 4 (ngx-smart-components.ts), then 5 (project.json _comment addition), then 6 (.gitignore).

## Verdict

**Verdict scope:** scope: api-correctness

The plan covers build-tool orchestration correctness (Nx target wiring, Angular Storybook executor options), TypeScript configuration correctness, and Angular signals API usage. It does NOT cover security threats (use `/lz-advisor.security-review` after implementation), performance, or accessibility. Downstream skills reading this plan MUST check scope-match per `references/context-packaging.md` "Scope-Disambiguated Provenance Markers" before treating this verdict as authoritative for their question.
