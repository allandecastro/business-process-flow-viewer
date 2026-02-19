# Business Process Flow Viewer

[![CI Status](https://github.com/allandecastro/business-process-flow-viewer/workflows/CI/badge.svg)](https://github.com/allandecastro/business-process-flow-viewer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Power Apps Component Framework (PCF) virtual control that displays business process flow stages for records in grid and subgrid views.

Built with React 16.14, TypeScript, and Fluent UI v9. Works with any Dataverse entity that has a business process flow.

**Author:** Allan De Castro

## What's New in v2

| Feature | v1 (2020) | v2 |
|---------|-----------|-----------|
| Architecture | Standard PCF | **Virtual PCF** |
| UI Library | Custom CSS | **Fluent UI v9** |
| Framework | Vanilla JS | **React 16.14** |
| Theming | Custom colors only | **Platform theme support** |
| Dataverse Calls | 1 per record | **Batched + parallel** |
| Bundle Size | ~150KB | **~20KB** (shared libs) |
| Design Options | 1 | **8 designs** |
| Responsive | No | **Container-based** |

## Design Styles

| Style | Description |
|-------|-------------|
| `chevron` | Classic BPF ribbon arrows (default) |
| `circles` | Connected circles with labels |
| `pills` | Rounded badge style |
| `segmented` | Single segmented progress bar |
| `stepper` | Numbered boxes with connectors |
| `gradient` | Gradient progress bar |
| `line` | Linear progress track |
| `fraction` | Fraction display (e.g. 2/5) |

## Installation

1. Download the latest managed solution from [Releases](https://github.com/allandecastro/business-process-flow-viewer/releases)
2. Import the solution into your Dataverse environment
3. Add the control to a grid or subgrid view

## Configuration

### BPF Configuration (JSON)

The `parametersBPF` property accepts a JSON configuration:

```json
{
  "bpfs": [
    {
      "bpfEntitySchemaName": "opportunitysalesprocess",
      "lookupFieldSchemaName": "_opportunityid_value"
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `bpfEntitySchemaName` | Schema name of the BPF entity (e.g. `opportunitysalesprocess`) |
| `lookupFieldSchemaName` | Lookup field on the BPF entity that references the parent record (e.g. `_opportunityid_value`) |

Multiple BPF definitions can be configured for entities with more than one business process flow.

### All Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `parametersBPF` | String | - | JSON configuration for BPFs |
| `designStyle` | Enum | `chevron` | Visual design style |
| `displayMode` | Enum | `stage` | Show stage or category names |
| `recordNameSize` | Enum | `medium` | Record name font size (small/medium/large) |
| `showEntityName` | Enum | `yes` | Show entity type badge next to record name |
| `enableNavigation` | Enum | `yes` | Click row to open record in new tab |
| `showPulseAnimation` | Enum | `yes` | Subtle animation on active stage |
| `usePlatformTheme` | Enum | `yes` | Use Dataverse environment theme colors |
| `completedColor` | String | `#107C10` | Completed stage background color |
| `completedTextColor` | String | `#FFFFFF` | Completed stage text color |
| `activeColor` | String | `#0078D4` | Active stage background color |
| `activeTextColor` | String | `#FFFFFF` | Active stage text color |
| `inactiveColor` | String | `#E1E1E1` | Inactive stage background color |
| `inactiveTextColor` | String | `#666666` | Inactive stage text color |

Custom colors are used when `usePlatformTheme` is set to `no`.

## Performance

The control is optimized for large datasets:

- **Batched API calls** - Fetches BPF data for up to 10 records per API call using `$filter` with OR conditions
- **Parallel requests** - Stage definitions, category labels, workflow IDs, and BPF instances are fetched concurrently with `Promise.all`
- **Caching** - Stage definitions, workflow IDs, and category labels are cached for 5 minutes
- **Request cancellation** - Stale requests are cancelled via AbortController when the dataset changes
- **Column selection** - Only needed columns are requested to minimize payload size

### Debug Mode

Enable performance metrics in the browser console:

```js
sessionStorage.setItem('BPF_DEBUG', 'true')
```

This logs a timing table for each dataset load showing start time, duration, and cache status for each Dataverse API call. Useful for diagnosing slow loading. Disable with:

```js
sessionStorage.removeItem('BPF_DEBUG')
```

## Development

### Prerequisites

- Node.js 18.x or 20.x
- npm

### Setup

```bash
npm install
```

### Commands

```bash
npm run build          # Build the PCF control
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
npm run lint           # Run ESLint
```

### Project Structure

```
business-process-flow-viewer/
├── index.ts                       # PCF control entry point
├── ControlManifest.Input.xml      # PCF manifest
├── components/
│   ├── BPFViewer.tsx              # Main wrapper with FluentProvider
│   ├── BPFRow.tsx                 # Single record row
│   ├── ErrorBoundary.tsx          # Error boundary
│   └── designs/                   # 8 design style components
│       ├── hooks/                 # Shared hooks (useBPFDesignHelpers)
│       └── shared/                # Shared components (StageIcon)
├── services/
│   └── BPFService.ts              # Dataverse API (batching, caching, parallel)
├── utils/
│   ├── themeUtils.ts              # Color resolution & theme helpers
│   ├── configValidation.ts        # BPF config validation
│   ├── sanitize.ts                # Input sanitization & validation
│   ├── errorMessages.ts           # User-friendly error messages
│   ├── perfTracker.ts             # Performance instrumentation
│   └── logger.ts                  # Centralized logging
├── types/                         # TypeScript type definitions
├── __tests__/                     # 354 tests across 17 suites
├── Solution/                      # Dataverse solution project
└── .github/workflows/             # CI/CD pipelines
```

### Pre-commit Hooks

Husky and lint-staged enforce code quality on every commit:
- ESLint with auto-fix
- Jest tests for modified files
- Commits are blocked if checks fail

### CI/CD

**CI** (every push and PR): Linting, tests with coverage, build verification on Node 18.x and 20.x.

**CD** (on version tag push `v*`): Builds the managed + unmanaged Dataverse solution and creates a GitHub Release with versioned zip files attached.

### Releasing

```bash
node scripts/bump-version.js 0.x.x
git add -A && git commit -m "chore: bump version to 0.x.x"
git tag v0.x.x
git push && git push --tags
```

The CD workflow automatically builds and publishes the solution.

## License

MIT License - See [LICENSE](LICENSE) file

## Author

Allan De Castro - [GitHub](https://github.com/allandecastro/)
