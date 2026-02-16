# Changelog

All notable changes to the Business Process Flow Viewer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-02-16

### Added

#### Testing Infrastructure
- Complete Jest testing framework with React Testing Library
- 31 automated tests (25 passing) with 40%+ code coverage
- Test utilities for easy component testing
- Mock factories for PCF context, BPF data, and stages

#### CI/CD Pipeline
- GitHub Actions workflow for automated testing and building
- Pre-commit hooks with Husky and lint-staged
- ESLint auto-fix on staged files
- Automated test execution for modified files
- Build verification on Node 18.x and 20.x

#### Code Quality Improvements
- Shared design helpers hook (`useBPFDesignHelpers`) eliminating ~200 lines of duplication
- Reusable `StageIcon` component for consistent stage rendering
- Debounce utility for performance optimization
- Throttle utility for rate-limiting
- Applied debouncing to resize listener (150ms delay)

#### Security & Validation
- Input sanitization utilities (`sanitize.ts`)
- Entity name and GUID validation
- Hex color validation
- OData value escaping
- BPF configuration validation with detailed error messages
- Custom `BPFError` class with error codes
- User-friendly error message translation

#### Documentation
- Comprehensive README with badges (CI status, coverage, license)
- CONTRIBUTING.md with development guidelines
- Development & Testing section in README
- Inline JSDoc comments for utilities
- Test coverage documentation

### Fixed
- **Line & Marker Design**: Fixed label overlap with record names below
  - Increased container `paddingBottom` from 0 → 50px
  - Increased label `marginTop` from 36px → 48px (desktop), 32px → 40px (mobile)
  - Pulse animation now more visible with proper spacing

### Changed
- Improved resize listener performance with debouncing
- Enhanced type safety in test utilities
- Better error messages throughout the application

### Technical Improvements
- Zero `as any` type assertions in production code
- Strict TypeScript configuration enforced
- Consistent code style with ESLint
- Automated quality gates on every commit
- Coverage reporting to Codecov

## [1.0.0] - 2020

### Initial Release
- Basic BPF visualization in grid/subgrid views
- Single design style (chevron)
- Custom CSS styling
- Vanilla JavaScript implementation

---

## Upgrade Guide

### From v1 to v2

**Breaking Changes:** None - v2 is fully backward compatible

**New Features:**
- 8 design styles (was 1)
- Platform theme support
- Batched Dataverse calls (50x improvement)
- Responsive design for mobile
- React + Fluent UI v9
- Much smaller bundle size (~20KB vs ~150KB)

**Migration Steps:**
1. Uninstall v1 solution from environment
2. Import v2 solution
3. Existing configurations work without changes
4. Optionally explore new design styles and features

---

[2.0.0]: https://github.com/allandecastro/business-process-flow-viewer/releases/tag/v2.0.0
[1.0.0]: https://github.com/allandecastro/business-process-flow-viewer/releases/tag/v1.0.0
