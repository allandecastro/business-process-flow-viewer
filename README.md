# BusinessProcessFlowViewer v2

[![CI Status](https://github.com/allandecastro/business-process-flow-viewer/workflows/CI/badge.svg)](https://github.com/allandecastro/business-process-flow-viewer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/badge/npm-2.0.0-blue.svg)](package.json)

A modern PCF (Power Apps Component Framework) control that displays Business Process Flow stages in grid and subgrid views.

**Author:** Allan De Castro - Microsoft MVP
**Version:** 2.0.0
**Type:** Virtual PCF (React)

![Preview](img/preview.png)

## 🚀 What's New in v2

| Feature | v1 (2020) | v2 (2025) |
|---------|-----------|-----------|
| Architecture | Standard PCF | **Virtual PCF** |
| UI Library | Custom CSS | **Fluent UI v9** |
| Framework | Vanilla JS | **React 16.14** |
| Theming | Custom colors only | **Platform theme support** |
| Dataverse Calls | 1 per record | **Batched (N/50 calls)** |
| Bundle Size | ~150KB | **~20KB** (shared libs) |
| Design Options | 1 | **8 designs** |
| Responsive | No | **Yes** |

## 🎨 Design Styles

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

## ⚡ Performance Optimizations

### Dataverse Call Optimization

**Before (v1):** N records = N API calls (sequential)
```
Record 1 → API call → wait → response
Record 2 → API call → wait → response
...
Record N → API call → wait → response
```

**After (v2):** N records = ceil(N/50) API calls (batched)
```
Records 1-50 → Single API call with $filter OR → response
Records 51-100 → Single API call with $filter OR → response
```

### Caching Strategy

| Cache | Duration | Purpose |
|-------|----------|---------|
| Stage definitions | 5 minutes | Stages rarely change |
| Workflow IDs | 5 minutes | Process ID mapping |
| Fetched records | Session | Avoid refetching |

### Query Optimization

```typescript
// BEFORE: Fetching all columns
retrieveMultipleRecords('opportunitysalesprocess', `?$filter=...`)

// AFTER: Select only needed columns
retrieveMultipleRecords('opportunitysalesprocess', 
  `?$filter=${lookupField} eq ${id}&$select=businessprocessflowinstanceid,name,_activestageid_value,traversedpath,statuscode,${lookupField}`)
```

## 📦 Installation

### Prerequisites

- Node.js 18+
- Power Platform CLI (`pac`)
- .NET 6.0 SDK

### Build

```bash
cd BusinessProcessFlowViewer

# Install dependencies
npm install

# Generate types from manifest
npm run refreshTypes

# Build the control
npm run build

# Test locally
npm start
```

### Package for Deployment

A ready-to-build `Solution/` project is included in the repo:

```bash
# Restore NuGet packages and build managed + unmanaged solution zips
npm run solution:restore
npm run solution:build

# Output: Solution/bin/Release/*.zip
```

Or use `dotnet` directly:

```bash
dotnet build Solution/Solution.cdsproj -c Release
```

> **CI/CD:** The [CD workflow](.github/workflows/cd.yml) runs automatically on every GitHub release and produces downloadable solution artifacts.

### Deploying to Dataverse

```bash
# Authenticate (one-time setup per environment)
pac auth create --url https://your-org.crm.dynamics.com

# Import the managed solution
pac solution import --path Solution/bin/Release/BusinessProcessFlowViewer_managed.zip
```

See [.env.example](.env.example) for environment configuration.

## ⚙️ Configuration

### BPF Configuration (JSON)

The `parametersBPF` property accepts a JSON configuration:

```json
{
  "bpfs": [
    {
      "bpfEntitySchemaName": "opportunitysalesprocess",
      "lookupFieldSchemaName": "_opportunityid_value"
    },
    {
      "bpfEntitySchemaName": "leadtoopportunitysalesprocess",
      "lookupFieldSchemaName": "_leadid_value"
    }
  ]
}
```

### All Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `parametersBPF` | String | - | JSON configuration for BPFs |
| `designStyle` | Enum | `chevron` | Visual design style |
| `displayMode` | Enum | `stage` | Show stage or category names |
| `recordNameSize` | Enum | `medium` | Record name font size |
| `showEntityName` | Enum | `yes` | Show entity badge |
| `enableNavigation` | Enum | `yes` | Click to open record |
| `showPulseAnimation` | Enum | `yes` | Pulse on active stage |
| `usePlatformTheme` | Enum | `yes` | Use platform colors |
| `completedColor` | String | `#107C10` | Completed stage color |
| `completedTextColor` | String | `#FFFFFF` | Completed text color |
| `activeColor` | String | `#0078D4` | Active stage color |
| `activeTextColor` | String | `#FFFFFF` | Active text color |
| `inactiveColor` | String | `#E1E1E1` | Inactive stage color |
| `inactiveTextColor` | String | `#666666` | Inactive text color |

## 🎯 Usage

### Add to Subgrid

1. Open the form editor
2. Select a subgrid component
3. Click "Get more components"
4. Import `BusinessProcessFlowViewer`
5. Configure properties

### Add to View

1. Navigate to a view
2. Click "Get more components"
3. Import and configure

## 🏗️ Architecture

```
BusinessProcessFlowViewer/
├── index.ts                      # Main ReactControl entry point
├── ControlManifest.Input.xml     # PCF manifest
├── components/
│   ├── BPFViewer.tsx             # Main wrapper with FluentProvider
│   ├── BPFRow.tsx                # Individual record row
│   ├── ErrorBoundary.tsx         # Error boundary with retry
│   ├── index.ts                  # Barrel exports
│   └── designs/
│       ├── index.tsx             # Design factory (ChevronDesign eager, rest lazy)
│       ├── ChevronDesign.tsx     # 8 design components
│       ├── CircleDesign.tsx
│       ├── PillDesign.tsx
│       ├── SegmentedBarDesign.tsx
│       ├── StepperDesign.tsx
│       ├── GradientDesign.tsx
│       ├── LineDesign.tsx
│       ├── FractionDesign.tsx
│       ├── shared/StageIcon.tsx  # Shared stage icon component
│       └── hooks/
│           └── useBPFDesignHelpers.ts
├── services/
│   └── BPFService.ts             # Optimized batched WebAPI calls
├── types/
│   └── index.ts                  # TypeScript interfaces
├── utils/
│   ├── themeUtils.ts             # Platform theme extraction
│   ├── debounce.ts               # Debounce/throttle utilities
│   ├── sanitize.ts               # Input validation & OData escaping
│   ├── errorMessages.ts          # Error codes & user-friendly messages
│   └── configValidation.ts       # BPF config JSON validation
├── __tests__/                    # 340+ tests, 16 suites
└── strings/
    └── BusinessProcessFlowViewer.1033.resx
```

## 🔧 Technical Details

### Virtual PCF

This control uses the Virtual PCF pattern (GA late 2024):

```typescript
export class BusinessProcessFlowViewer 
  implements ComponentFramework.ReactControl<IInputs, IOutputs> {
  
  // No container parameter in init()
  public init(context, notifyOutputChanged): void { }
  
  // Returns React element instead of manipulating DOM
  public updateView(context): React.ReactElement {
    return React.createElement(BPFViewer, { ... });
  }
}
```

### Platform Libraries

Using shared platform libraries reduces bundle size:

```xml
<platform-library name="React" version="16.14.0" />
<platform-library name="Fluent" version="9.46.2" />
```

### Fluent UI v9

Uses Griffel for styling (CSS-in-JS):

```typescript
const useStyles = makeStyles({
  container: {
    display: 'flex',
    ...shorthands.padding('12px'),
  },
});
```

## 🧪 Development & Testing

This project includes comprehensive testing infrastructure with Jest and React Testing Library.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for CI (with coverage)
npm run test:ci
```

### Current Test Coverage

Coverage is generated automatically by CI on every push and PR.
View the latest coverage summary in the [CI workflow run](https://github.com/allandecastro/business-process-flow-viewer/actions/workflows/ci.yml) job summary.

- Coverage thresholds enforced: 80% statements/lines, 75% branches/functions
- Run `npm run test:coverage` locally to generate a detailed HTML report in `coverage/`

### Pre-commit Hooks

This project uses Husky and lint-staged to enforce code quality:
- ESLint automatically fixes issues
- Tests run for modified files
- Commits are blocked if checks fail

### CI/CD Pipeline

**CI** (every push and PR):
- Linting with ESLint
- Tests with coverage reporting
- Build verification
- Multi-version testing (Node 18.x, 20.x)

**CD** (on version tag push):
- Syncs version across `package.json`, `ControlManifest.Input.xml`, and `Solution.xml`
- Builds the managed + unmanaged Dataverse solution `.zip`
- Creates a GitHub release with the solution attached

### Releasing a New Version

```bash
# 1. Bump version in all project files
npm run version:bump patch   # or: minor, major, 2.1.0

# 2. Commit and tag
git add -A && git commit -m "chore: bump version to 2.0.1"
git tag v2.0.1

# 3. Push — this triggers the CD workflow automatically
git push && git push --tags
```

The CD workflow will build the solution, create a GitHub release at `v2.0.1`, and attach the managed `.zip` for import into Dataverse.

## 📋 Improvement Plan

See [TODO.md](TODO.md) for the full prioritized improvement checklist (P0–P6).

---

## 📝 License

MIT License - See LICENSE file

## 🙏 Acknowledgments

- Microsoft Power Platform team
- Fluent UI team
- Power Platform Community

---

Made with ❤️ by Allan De Castro - [Blog](https://blog.allandecastro.com) | [GitHub](https://github.com/allandecastro/)
