# Changelog

All notable changes to the Business Process Flow Viewer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-19

First stable release. Complete rewrite from vanilla JavaScript to a modern React + TypeScript Virtual PCF control with Fluent UI v9 theming.

### Highlights

- **8 design styles**: Chevron, Circles, Pills, Segmented, Stepper, Gradient, Line, Fraction
- **Conditional BPF support**: Uses `RetrieveActivePath` to show only active-path stages for BPFs with branching logic
- **Custom BPF support**: Works with both OOTB BPFs (e.g. `opportunitysalesprocess`) and custom BPF entities (e.g. `adc_custombpf`)
- **Multi-BPF configuration**: A single subgrid can display records from multiple BPF definitions via JSON config
- **Fluent UI v9 theming**: Inherits platform theme automatically, with optional custom color overrides
- **Responsive layout**: Container-based detection with ResizeObserver for proper subgrid sizing
- **371 automated tests** across 18 test suites with accessibility (axe-core) integration

### Performance
- Batched Dataverse API calls (N records in ceil(N/10) calls instead of N)
- Parallelized API calls reducing cold-cache load from 5-6 sequential calls to ~3
- 5-minute cache for stage definitions, workflow IDs, and active path results
- Request cancellation with AbortController and 30-second timeout protection

### Security
- Input sanitization (entity names, GUIDs, hex colors, OData values)
- BPF configuration validation with detailed error messages
- Custom `BPFError` class with error codes

### Accessibility
- ARIA attributes on all design components
- Keyboard navigation support
- Screen reader friendly labels with progress metadata

### CI/CD
- GitHub Actions CI pipeline (lint + test on push/PR)
- GitHub Actions CD pipeline (build + package managed/unmanaged solution on tag push)
- Pre-commit hooks with Husky and lint-staged (ESLint + Jest)

---

### Pre-release development history (0.1.x)

## [0.1.17] - 2026-02-19

### Removed
- **Unused files**: Removed `TODO.md` (all items completed), `test.html` and `test-harness.html` (standalone HTML test harnesses, not part of the actual test suite).

### Fixed
- **Preview image**: Removed stale "v2" label from `preview.svg`.
- **TESTING.md**: Rewrote testing guide to focus on the Jest test suite instead of removed HTML test files.

## [0.1.16] - 2026-02-19

### Fixed
- **Custom BPF entity support**: Fixed `Could not find a property named 'name'` error when using custom BPF entities (e.g. `adc_custombpf`). Removed hardcoded `$select` from BPF instance query and added dynamic name resolution that handles both OOTB BPFs (`name` column) and custom BPFs (`{prefix}_name` column).
- **Pulse animation logic**: Fixed `isProcessFinished` to correctly determine when a process is truly finished (no active stage + has completed stages). Active stage on the last step now correctly pulses since the user is still working on it.
- **FractionDesign rendering**: Fixed incorrect stage rendering in Fraction design component.
- **StageIcon accessibility**: Fixed stage icon component for proper accessibility attributes.
- **ErrorBoundary logger**: Fixed logger prefix inconsistency in error boundary component.
- **Design factory exports**: Fixed design component exports and factory function.

### Changed
- **Test suite expanded to 371 tests**: Added performance tracker tests, stronger design factory assertions, meaningful BPF service cache tests, finished BPF handling test, and fixed conditional/placeholder test assertions.
- **Documentation corrections**: Fixed design style count (6 to 8), corrected design names, removed premature version references, and updated versioning instructions across README, TESTING, and CONTRIBUTING docs.

## [0.1.15] - 2026-02-19

### Fixed
- **BPF config character limit**: Changed `parametersBPF` property from `SingleLine.Text` (100 char limit) to `Multiple` to support longer JSON configurations with multiple BPF definitions.
- **CI/CD badges**: Switched to native GitHub workflow badge URLs for private repo compatibility.

## [0.1.14] - 2026-02-19

### Changed
- **README screenshot**: Updated preview section to use PNG screenshot instead of SVG placeholder.
- **CI/CD badges**: Fixed CI/CD badge URLs using shields.io `for-the-badge` style.
- **Version badge auto-update**: `bump-version.js` now updates the README version badge automatically.
- **Separate logo file**: Header logo (`docs/logo.svg`) is now independent from the preview screenshot.

## [0.1.13] - 2026-02-19

### Fixed
- **Gradient/Line track alignment**: Track line now starts and ends at the center of the first and last stage markers, eliminating visible overshoot at both ends.

## [0.1.12] - 2026-02-19

### Added
- **Conditional BPF stage support**: Integrated the Dataverse `RetrieveActivePath` function to fetch only the stages in the active path for each BPF instance. BPFs with conditional branching now correctly show only the relevant branch stages instead of all stages. Falls back to fetching all stages if the function is unavailable.
- **Active path caching**: Per-instance active path results are cached for 5 minutes to avoid redundant API calls.

### Fixed
- **CircleDesign connector centering**: Connector lines between circles are now precisely centered using calculated margins based on circle diameter, replacing the previous `-20px` margin hack.

## [0.1.11] - 2026-02-19

### Fixed
- **Finished BPF stages**: All stages are now correctly marked as completed when a BPF instance has `statuscode = 2` (Finished).

## [0.1.10] - 2026-02-19

### Changed
- **Title-case stage names**: Stage names are now displayed in title case for consistent formatting.
- **Entity badge hidden by default**: The entity type badge next to record names is now hidden by default (`showEntityName` defaults to `no`).

## [0.1.9] - 2026-02-19

### Fixed
- **Container sizing**: Now uses `allocatedWidth` and `allocatedHeight` from the PCF framework to properly fill the subgrid container, instead of relying on CSS-only sizing.

## [0.1.8] - 2026-02-19

### Added
- **Subgrid command bar**: Enabled `displayCommandBar`, `displayViewSelector`, and `displayQuickFind` via `cds-data-set-options` so subgrids show the command bar, view selector, and quick find search.

### Fixed
- **Loading spinner stuck**: BPF stages now render after data loads. Previously `processDataset` completed async but nothing triggered the framework to re-render. Now calls `notifyOutputChanged` to trigger `updateView`.
- **Space utilization**: Stage wrappers in Circle and Stepper designs now use `flex: 1` to distribute evenly across full width. Connectors changed to fixed 24px width. Removed `maxWidth` caps on labels in Circle, Stepper, Gradient, and Line designs.

## [0.1.7] - 2026-02-19

### Fixed
- **Row height**: Reduced excessive vertical spacing in BPF rows. Line design padding reduced from 100px to 36px. Row padding tightened across all designs.

## [0.1.6] - 2026-02-19

### Added
- **Performance metrics**: Lightweight perf tracker that logs a timing table to the browser console. Enable with `sessionStorage.setItem('BPF_DEBUG', 'true')`. Shows each Dataverse API call's start time, duration, and cache status.

### Changed
- **Parallelized API calls**: Cold-cache loading reduced from 5-6 sequential Dataverse calls to ~3 by:
  - Combining two workflow queries (exact + contains) into a single call
  - Parallelizing `getProcessId` with `getStageCategoryLabels`
  - Parallelizing stage definitions fetch with BPF instances fetch
  - Starting BPF data fetch in parallel with entity display name resolution

## [0.1.5] - 2026-02-19

### Fixed
- **Navigation**: Records now open in a new tab instead of the current one (`openInNewWindow: true`)
- **Responsive layout**: Replaced `window.innerWidth` with `ResizeObserver` on the container element so narrow Dataverse subgrids correctly trigger mobile layout
- **Chevron label clipping**: Dynamic padding on chevron labels now accounts for the arrow clip-path indent per stage position (first, middle, last)

## [0.1.4] - 2026-02-19

### Fixed
- **Config validation**: Dataverse lookup field names starting with `_` (e.g. `_opportunityid_value`) are now accepted. Added `isValidFieldName()` with regex `^[a-z_]` for lookup field validation.

## [0.1.3] - 2026-02-19

### Changed
- **Namespace**: Renamed from `AllanDeCastro` to `ADC`
- **Manifest keys**: All display-name-key and description-key attributes converted to PascalCase
- **Solution zips**: CD pipeline now produces versioned filenames (e.g. `BusinessProcessFlowViewer_0.1.3_managed.zip`)

### Fixed
- Added missing resx entries for Gradient, Line, and Fraction design styles
- Removed stale `Design_Timeline` entry

## [0.1.2] - 2026-02-19

### Fixed
- **CD pipeline**: Restructured PCF build output into a control-named subdirectory to fix `ControlManifest.xml not found` errors during Solution MSBuild packaging (caused by `strings/` directory)

## [0.1.1] - 2026-02-19

### Fixed
- **CD pipeline**: Moved `preview.svg` from `img/` to project root to prevent MSBuild treating the `img/` directory as a separate control

## [0.1.0] - 2026-02-19

### Added

#### Release Pipeline
- GitHub Actions CD workflow triggered by tag push (`v*`)
- Automated Solution packaging (managed + unmanaged)
- GitHub Release with versioned solution zip artifacts

#### Testing & Quality
- 354 automated tests across 17 test suites
- Pre-commit hooks with Husky and lint-staged (ESLint + Jest)
- CI pipeline for automated testing

#### Security & Validation
- Input sanitization utilities (entity name, GUID, hex color, OData escaping)
- BPF configuration validation with detailed error messages
- Custom `BPFError` class with error codes

#### Performance
- Batch Dataverse API calls (N records in ceil(N/10) calls instead of N calls)
- 5-minute cache for stage definitions and workflow IDs
- Request cancellation with AbortController
- 30-second timeout protection for API calls

#### Accessibility
- ARIA attributes on all design components
- Keyboard navigation support
- Screen reader friendly labels

### Changed
- Complete rewrite from vanilla JavaScript to React + TypeScript
- Virtual PCF control with Fluent UI v9 theming
- 8 design styles: Chevron, Circles, Pills, Segmented, Stepper, Gradient, Line, Fraction
- Container-based responsive detection with ResizeObserver

---

[1.0.0]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.17...v1.0.0
[0.1.17]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.16...v0.1.17
[0.1.16]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.15...v0.1.16
[0.1.15]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.14...v0.1.15
[0.1.14]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.13...v0.1.14
[0.1.13]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.12...v0.1.13
[0.1.12]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/allandecastro/business-process-flow-viewer/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/allandecastro/business-process-flow-viewer/releases/tag/v0.1.0
