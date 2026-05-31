# Review: Compodoc + Storybook Signal-Component Integration

**Commit:** 87a982a
**Scope:** feat(storybook): integrate Compodoc for signal-based Docs tab
**Files reviewed:** `.gitignore`, `package.json`, `.storybook/main.ts`, `.storybook/preview.ts`, `.storybook/tsconfig.json`, `project.json`, `ngx-smart-components.stories.ts`, `ngx-smart-components.ts`
**Verdict scope:** scope: api-correctness

---

## Findings

### Critical

**1. `build-storybook` `browserTarget` self-reference**
`project.json:72` -- `build-storybook` sets `browserTarget: "ngx-smart-components:build-storybook"`, pointing at itself. The `@storybook/angular:build-storybook` executor resolves `browserTarget` to extract Angular compiler options; pointing it at another Storybook executor is structurally invalid. The intended target is likely `ngx-smart-components:build`. The commit's `Verified` trailer records a successful `build-storybook` run so the executor may tolerate this in practice, but it should be investigated.

**2. `storybook` dev-server `browserTarget` cross-reference**
`project.json:49` -- `storybook` (`start-storybook`) also sets `browserTarget: "ngx-smart-components:build-storybook"` rather than an Angular browser build target. Same root cause as finding 1. Point at `ngx-smart-components:build` or a dedicated browser config.

Note: both `browserTarget` issues are pre-existing (not introduced in this commit -- the diff only changed `compodoc: false -> true`).

### Important

**3. Cold-clone TypeScript failure from gitignored generated file (two surfaces)**

`packages/ngx-smart-components/.storybook/preview.ts:3` -- Static import `import docJson from '../documentation.json'` references a gitignored, Compodoc-generated file. The Nx executor with `compodoc: true` runs Compodoc before TypeScript compilation, so `nx storybook` and `nx build-storybook` work. However, the IDE TypeScript server reads `.storybook/tsconfig.json` directly without invoking the executor, producing "Cannot find module" on a fresh clone.

`packages/ngx-smart-components/.storybook/tsconfig.json:9` -- The `include` array contains `"../documentation.json"` as a specific (non-glob) path. A specific path that does not exist produces a harder "File not found" diagnostic than the import alone. The `resolveJsonModule` import resolution in `preview.ts` is sufficient; the explicit `include` entry is redundant and compounds the cold-clone problem. Drop it.

**4. `storybook` target missing `documentation.json` in `outputs`**
`project.json:43-65` -- Only `build-storybook` declares `{projectRoot}/documentation.json` in `outputs`. The `storybook` dev-server (`continuous: true`) also generates this file via its `compodoc: true` pre-step, but the output is not tracked. While `continuous` tasks are not cached (so this does not affect Nx cache correctness), the asymmetry means the dev-server path is undocumented as a source of `documentation.json`.

### Suggestion

**5. `sampleChange` output never emits -- false JSDoc contract**
`ngx-smart-components.ts:28-29` -- `readonly sampleChange = output<string>()` follows the Angular two-way binding naming convention alongside `sample = input<string>()`, implying `[(sample)]` support. The JSDoc says "Emitted when the sample value changes" but the component has no `effect()` or emit logic. For a demo, either add an `effect(() => { this.sampleChange.emit(this.sample() ?? ''); })` or soften the JSDoc to "Demonstration output (not wired)."

**6. `test-storybook` hardcodes port 4200**
`project.json:89-93` -- `test-storybook` hardcodes `--url=http://localhost:4200`. If the `storybook` target port changes from `4200`, the interaction-test target silently targets the wrong server. Reference the `storybook` target's port dynamically or document the coupling.

**7. `.gitignore` missing trailing newline**
`.gitignore:55` -- The file ends without a trailing newline (`\ No newline at end of file`). POSIX requires text files to end with a newline; some tools behave inconsistently on files without one.

---

## Cross-Cutting Patterns

The two `browserTarget` issues (findings 1-2) are the dominant systemic defect -- circular wiring where both Storybook targets name `build-storybook` as their Angular build source.

Findings 3-4 share a root cause: `documentation.json` is a generated, gitignored artifact referenced by multiple consumers (import, tsconfig `include`, Nx cache outputs) without a guaranteed-exists contract. The cluster closes with: drop `"../documentation.json"` from the tsconfig `include`; declare `documentation.json` in `storybook`'s `outputs`; rely solely on the executor's Compodoc pre-step for the generated file.
