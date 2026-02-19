# Changelog

All notable changes to the Business Process Flow Viewer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
