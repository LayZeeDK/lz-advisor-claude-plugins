# Plan: Set Up Compodoc + Storybook Docs Tab with Signal Inputs/Outputs

## Strategic Direction

1. Run `npm install -D @storybook/addon-docs@10.3.5 @compodoc/compodoc` so versions match `storybook@10.3.5`.
2. Add `'@storybook/addon-docs'` to `addons` in `.storybook/main.ts`.
3. Set `compodoc: true` and `compodocArgs: ["-p","packages/ngx-smart-components/tsconfig.lib.json","-e","json","-d","packages/ngx-smart-components"]` in both `storybook` and `build-storybook` targets (Bug 1).
4. Append `"{projectRoot}/documentation.json"` to `build-storybook` `outputs`; prevents stale-cache hits.
5. Write `preview.ts`: `setCompodocJson(docJson)` plus global `tags: ['autodocs']` -- set globally, not per-story.
6. Add `resolveJsonModule: true` and `"../documentation.json"` to `.storybook/tsconfig.json`; keep `exclude` as `["../**/*.spec.ts"]` only (Bug 3).
7. Add `packages/ngx-smart-components/documentation.json` to `.gitignore` (Bug 2), delete leftover file.
8. Add JSDoc `disabled = input(false)` and `activated = output<void>()` to component with class-level JSDoc.
9. Set story `args: { disabled: false }`; renders input default in Docs controls.
10. Run `pnpm nx build-storybook ngx-smart-components` to regenerate `documentation.json` and verify Docs tab.

## Steps

1. **Install missing packages**
   - File: `package.json` (root)
   - Change: Run `npm install -D @storybook/addon-docs@10.3.5 @compodoc/compodoc` -- version-pinned to match the installed `storybook@10.3.5`
   - Rationale: Neither package is in `package.json` or `node_modules/`; `@storybook/addon-docs` provides the `setCompodocJson` API and the Docs addon; `@compodoc/compodoc` generates `documentation.json`

2. **Add `@storybook/addon-docs` to Storybook addons**
   - File: `packages/ngx-smart-components/.storybook/main.ts`
   - Change: Change `addons: []` to `addons: ['@storybook/addon-docs']`
   - Rationale: Without the addon registered, Storybook ignores Compodoc data and the Docs tab never appears

3. **Enable Compodoc in the `storybook` target**
   - File: `packages/ngx-smart-components/project.json`
   - Change: In the `storybook` target options, set `"compodoc": true` and add `"compodocArgs"`:
     ```json
     "compodocArgs": [
       "-p", "packages/ngx-smart-components/tsconfig.lib.json",
       "-e", "json",
       "-d", "packages/ngx-smart-components"
     ]
     ```
   - Rationale: `-p` tells Compodoc which tsconfig to parse; `-e json` produces the JSON format Storybook reads; `-d packages/ngx-smart-components` places `documentation.json` where `preview.ts` imports it (Bug 1 mitigation -- omitting `-d` causes executor to write to workspace root)

4. **Enable Compodoc in the `build-storybook` target**
   - File: `packages/ngx-smart-components/project.json`
   - Change: In `build-storybook`, same `compodoc: true` and `compodocArgs` as step 3; also add `"{projectRoot}/documentation.json"` to `outputs`:
     ```json
     "outputs": ["{options.outputDir}", "{projectRoot}/documentation.json"]
     ```
   - Rationale: Adding `documentation.json` to outputs tells Nx it is a cache artifact, so stale documentation from a prior run is never served (prevents the "Controls panel shows old descriptions" class of bug)

5. **Write `.storybook/preview.ts`**
   - File: `packages/ngx-smart-components/.storybook/preview.ts`
   - Change: Replace the empty file with:
     ```typescript
     import type { Preview } from '@storybook/angular';
     import { setCompodocJson } from '@storybook/addon-docs/angular';
     import docJson from '../documentation.json';

     setCompodocJson(docJson);

     const preview: Preview = {
       tags: ['autodocs'],
     };

     export default preview;
     ```
   - Rationale: `setCompodocJson` loads Compodoc's extracted JSDoc into Storybook's runtime; `tags: ['autodocs']` set globally means every story automatically gets a Docs page without repeating the tag in each story meta

6. **Update `.storybook/tsconfig.json`**
   - File: `packages/ngx-smart-components/.storybook/tsconfig.json`
   - Change: Add `"resolveJsonModule": true` to `compilerOptions`; add `"../documentation.json"` to the `include` array; keep `exclude` as `["../**/*.spec.ts"]` only (no story patterns in exclude)
   - Rationale: `resolveJsonModule` is required for the `import docJson from '../documentation.json'` statement in `preview.ts`; including the JSON in the tsconfig include ensures the compiler can resolve it; excluding only spec files (not stories) is the Bug 3 mitigation

7. **Update `.gitignore`**
   - File: `.gitignore`
   - Change: Add `packages/ngx-smart-components/documentation.json` (not `/documentation.json` -- Bug 2 mitigation)
   - Also: Delete the leftover untracked `packages/ngx-smart-components/documentation.json` before the next Storybook run to ensure a fresh generation

8. **Add JSDoc, signal input, and signal output to the component**
   - File: `packages/ngx-smart-components/src/lib/ngx-smart-components/ngx-smart-components.ts`
   - Change: Add class-level JSDoc, import `input` and `output` from `@angular/core`, and add two signal members:
     ```typescript
     import {
       ChangeDetectionStrategy,
       Component,
       ViewEncapsulation,
       input,
       output,
     } from '@angular/core';

     /**
      * A smart component showcasing signal-based input and output.
      */
     @Component({
       selector: 'smart-ngx-smart-components',
       imports: [],
       template: `<p>NgxSmartComponents works!</p>`,
       styles: `
         :host {
           display: block;
         }
       `,
       encapsulation: ViewEncapsulation.Emulated,
       changeDetection: ChangeDetectionStrategy.OnPush,
     })
     export class NgxSmartComponents {
       /** Whether the component is disabled. */
       readonly disabled = input(false);

       /** Emitted when the component is activated. */
       readonly activated = output<void>();
     }
     ```
   - Rationale: Compodoc reads JSDoc from both the class decorator and the signal members; `input()` and `output()` are the Angular 17+ signal-based APIs that replace `@Input()`/`@Output()`

9. **Update story args to include the signal input**
   - File: `packages/ngx-smart-components/src/lib/ngx-smart-components/ngx-smart-components.stories.ts`
   - Change: Update the `Primary` story `args` to include `{ disabled: false }`:
     ```typescript
     export const Primary: Story = {
       args: {
         disabled: false,
       },
     };
     ```
   - Rationale: Storybook populates the Controls panel from `args`; including the input's default value makes the control visible and interactive in both the Canvas and the Docs tab

10. **Validate**
    - Run: `pnpm nx build-storybook ngx-smart-components`
    - Verify: Build completes without errors; `packages/ngx-smart-components/documentation.json` is regenerated and contains an entry for `NgxSmartComponents` with `inputsClass` (for `disabled`) and `outputsClass` (for `activated`) populated with descriptions; the Docs tab in Storybook dev server shows the component description, input description, and output description

## Key Decisions

- **`@storybook/addon-docs@10.3.5` pinned**: The version is pinned to match `storybook@10.3.5` to avoid peer dependency conflicts. If `@compodoc/compodoc` has no explicit version constraint against Storybook, install without a pin.
- **`tags: ['autodocs']` set globally in `preview.ts`**: Avoids repeating the tag in every story file; all stories in the library get a Docs page automatically. Per-story override is still possible by adding `tags: ['!autodocs']` to opt out.
- **`-d packages/ngx-smart-components` is mandatory**: The `@storybook/angular` executor auto-appends `-d <workspaceRoot>` when the flag is absent, placing `documentation.json` at the workspace root. The `preview.ts` import resolves to `packages/ngx-smart-components/documentation.json`. Mismatch = runtime import error.
- **`"{projectRoot}/documentation.json"` in `build-storybook` outputs**: Without this, Nx's cache can restore a stale `documentation.json` from a prior run, hiding JSDoc changes.
- **Risk -- signal `output()` in Compodoc**: Compodoc 1.x has partial support for signal-based outputs; it may populate `outputsClass` or may not. If the Docs tab shows the output type but not the JSDoc description, this is a known Compodoc limitation -- the input JSDoc will still render correctly.
- **`.gitignore` path**: Must be `packages/ngx-smart-components/documentation.json`, not `/documentation.json`. The leading slash anchors to the workspace root and never matches the package-level file.

## Dependencies

- Step 1 (install) must complete before any step that references the installed packages (steps 2, 5).
- Steps 2-7 (configuration) are independent of each other and can be done in any order after step 1.
- Step 8 (component) and step 9 (stories) are independent of the configuration steps but logically follow step 1.
- Step 10 (validate) must run last, after all prior steps are complete.

## Verdict

**Verdict scope:** scope: api-correctness

The plan covers correctness of the Compodoc/Storybook integration, Angular signal API usage, and Nx build-tool orchestration. It does NOT cover security threats (use `/lz-advisor.security-review` after implementation), performance, or accessibility. Downstream skills reading this plan MUST check scope-match per `references/context-packaging.md` before treating the verdict as authoritative for their question.
