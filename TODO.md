# Improvement Plan

Tracked checklist of all pending improvements. Check items off as they are completed.

## P0 - Bugs / Memory Leaks

- [x] **Debounce cancel on unmount** (`components/BPFViewer.tsx:61-77`)
  - `useIsMobile` hook removes the resize listener on cleanup but never cancels the pending debounced timer. The debounced callback can fire after unmount causing a setState on an unmounted component.
  - Fix: add `.cancel()` method to debounce utility, call it in the `useEffect` cleanup return.

- [x] **Debounce utility missing cancel** (`utils/debounce.ts:36-49`)
  - Returns a plain function with no `.cancel()`. Consumers cannot clean up pending timers.
  - Fix: return an object/function with a `.cancel()` method that calls `clearTimeout`.
  - Also: **remove unused `throttle` export** (dead code, not used anywhere).

- [x] **FractionDesign crash on empty stages** (`components/designs/FractionDesign.tsx:68-71`)
  - `a11yMetadata.activeStageIndex + 1` renders `0/0` when stages array is empty. No guard.
  - Fix: return early or show fallback when `stages.length === 0`.

- [x] **Orphaned promise in fetchWithTimeout** (`services/BPFService.ts:243-248`)
  - `Promise.race([request, timeout])` — when timeout wins, the original request promise is never cancelled. The `.finally()` clears the timer but the request promise leaks.
  - Fix: use AbortController signal to actually cancel the underlying request when timeout fires.

## P1 - Remove Hardcoded Values

- [x] **Hardcoded entity display names** (`index.ts:315-318`)
  - Only `incident -> Case` and `salesorder -> Order` are mapped. All other Dataverse entities fall through to the camelCase splitter which can produce incorrect names.
  - Fix: use `context.utils.getEntityMetadata()` at runtime to fetch the real display name from Dataverse, with the hardcoded map as a synchronous fallback only.

- [x] **Hardcoded track color `#E1E1E1`** (`components/designs/LineDesign.tsx:28`, `GradientDesign.tsx:28`)
  - Track background is hardcoded, won't respect dark theme or custom inactive color.
  - Fix: use `colors.inactive` from props instead of hardcoded hex.

- [x] **Hardcoded default colors in manifest** (`ControlManifest.Input.xml:143-148`)
  - Colors like `#107C10`, `#0078D4`, `#E1E1E1` are duplicated between the manifest defaults and `utils/themeUtils.ts`.
  - Fix: ensure `themeUtils.ts` is the single source of truth; manifest defaults are informational only.

- [x] **Magic numbers in design components** (all 8 design files)
  - Animation durations (`2s`), transition times (`0.2s`), sizes (`32px`, `24px`, `16px`) are scattered inline.
  - Fix: extract to a shared `designConstants.ts` file.

## P2 - Accessibility

- [x] **Mobile aria-labels missing** (design components)
  - When text labels are hidden on mobile (`display: none`), no `aria-label` fallback is provided. Screen readers lose stage names entirely on small viewports.
  - Fix: add `aria-label={stageName}` to stage elements that hide their visible text.

- [x] **Accessibility tests too shallow** (`__tests__/a11y/accessibility.test.tsx`)
  - Only tests `chevron` design; doesn't test Enter/Space actually firing `onNavigate`; `aria-current="step"` assertion is `toBeGreaterThan(0)` instead of `toBe(1)`; doesn't check `aria-label` content.
  - Fix: test all 8 designs with axe, add keyboard event tests, strengthen ARIA assertions.

- [x] **ErrorBoundary uses inline styles** (`components/ErrorBoundary.tsx:45-78`)
  - Only component not using Fluent `makeStyles`. Won't pick up theme tokens.
  - Fix: refactor to use `makeStyles` consistent with the rest of the codebase.

## P3 - Type Safety

- [x] **Unsafe `any` casts** (`index.ts:169,202`, `configValidation.ts:52,84`, `debounce.ts:32`)
  - 5 places use `as any` with `eslint-disable` comments instead of proper type guards.
  - Fix: create type guards for `platformTheme` and dataset record, use `unknown` + narrowing in validation.

- [x] **Unused `_entityName` parameter** (`services/BPFService.ts:80`)
  - `getBPFDataForRecords` accepts `_entityName` but ignores it. Misleading API.
  - Fix: remove the parameter or implement entity-scoped filtering.

- [x] **Missing JSDoc on public types** (`types/index.ts`)
  - Complex interfaces like `IBPFConfiguration`, `IBPFInstance`, `IStageColors` lack documentation.
  - Fix: add JSDoc comments explaining when/how each type is used.

## P4 - Performance

- [x] **Default design loaded lazily** (`components/designs/index.tsx:21-28`)
  - All 8 designs including the default `chevron` are `React.lazy()`. First render always shows Suspense fallback spinner.
  - Fix: import `ChevronDesign` eagerly (static import), lazy-load the other 7.

- [x] **Missing OData pagination** (`services/BPFService.ts:189`)
  - Queries don't handle pagination. Dataverse default page size is 5000; large datasets could silently miss records.
  - Fix: implement `@odata.nextLink` pagination loop or set explicit `$top` value.

- [x] **No memoization on BPFRow** (`components/BPFRow.tsx`)
  - `BPFRow` re-renders whenever parent re-renders even if its props haven't changed.
  - Fix: wrap with `React.memo` with shallow comparison.

## P5 - Build & Deployment (PCF-Specific)

- [x] **PCF build pipeline** (`.github/workflows/ci.yml`)
  - CI runs `npm run build` (pcf-scripts build) but doesn't produce a deployable solution `.zip`.
  - Fix: add a CD workflow that runs `pac solution init` + `msbuild` to produce a managed solution artifact.

- [x] **Solution packaging scripts** (`package.json`)
  - No npm scripts for `pac solution` commands. Deployment is manual.
  - Fix: add `"solution:init"`, `"solution:build"`, `"solution:export"` scripts.

- [x] **Missing `.cdsproj` / Solution project**
  - No Solution project folder checked in. Every developer must manually run `pac solution init`.
  - Fix: check in a `Solution/` folder with `.cdsproj` and `solution.xml` so `msbuild` works out of the box.

- [x] **Environment-specific config**
  - No `.env` or config for target Dataverse environment URLs.
  - Fix: add `pac auth` profile instructions and optional `.env.example` for local dev.

## P6 - Code Quality / Polish

- [x] **Console logging in production** (`index.ts`, `services/BPFService.ts`)
  - `console.error` / `console.warn` calls with no environment check.
  - Fix: wrap in `if (__DEV__)` or remove; Dataverse has its own telemetry.

- [x] **Inconsistent error logging** (`services/BPFService.ts:112,211,311,376,435`)
  - Mix of `console.warn` and `console.error` without consistent severity.
  - Fix: standardize on a single approach (e.g., warn for recoverable, error for fatal).

- [x] **`escapeODataValue` silent on falsy input** (`utils/sanitize.ts:106-112`)
  - Returns empty string for null/undefined without warning. Could silently break queries.
  - Fix: throw or warn when called with invalid input.

- [x] **README coverage section outdated on each release**
  - Coverage numbers in README will go stale after every change.
  - Fix: generate coverage badge dynamically (e.g., Codecov, or badge from CI artifact).
