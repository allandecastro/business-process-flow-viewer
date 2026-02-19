# Contributing to Business Process Flow Viewer

Thank you for your interest in contributing to the Business Process Flow Viewer! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18.x or 20.x
- npm (comes with Node.js)
- Git
- Basic knowledge of TypeScript and React

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/business-process-flow-viewer.git
   cd business-process-flow-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Build the control**
   ```bash
   npm run build
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run build
   ```

4. **Commit your changes**
   - Pre-commit hooks will automatically run linting and tests
   - Use clear, descriptive commit messages
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Convention

We follow conventional commits format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Quality Standards

#### TypeScript

- Enable strict mode (already configured)
- No `any` types unless absolutely necessary
- Proper type definitions for all functions
- Use interfaces for object shapes

#### React

- Functional components with hooks
- Proper dependency arrays in useEffect
- Memoization where appropriate
- Accessibility attributes (ARIA labels, roles, etc.)

#### Testing

- Minimum 60% code coverage
- Test business logic thoroughly
- Test component rendering and interactions
- Test error scenarios

### Pre-commit Hooks

Pre-commit hooks automatically run:
- ESLint (with auto-fix)
- Tests for modified files

If checks fail, the commit is blocked. Fix issues and try again.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# CI mode (for GitHub Actions)
npm run test:ci
```

### Writing Tests

- Place tests in `__tests__/` directory
- Use the pattern: `ComponentName.test.tsx` or `utilName.test.ts`
- Use test utilities from `__tests__/setup/testUtils.tsx`
- Test both happy paths and error scenarios

Example:
```typescript
import { renderWithProviders } from '../setup/testUtils';
import { MyComponent } from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = renderWithProviders(<MyComponent />);
    expect(getByText('Hello')).toBeInTheDocument();
  });
});
```

## Pull Request Process

1. **Ensure all checks pass**
   - Tests pass locally
   - Build succeeds
   - No linting errors
   - Code coverage maintained

2. **Update documentation**
   - Update README if needed
   - Add JSDoc comments for new functions
   - Update CHANGELOG.md

3. **Create pull request**
   - Use the PR template
   - Provide clear description of changes
   - Link related issues
   - Request review

4. **Address review feedback**
   - Respond to comments
   - Make requested changes
   - Re-request review when ready

## Code Review Guidelines

### For Contributors

- Be open to feedback
- Explain your approach if asked
- Keep discussions professional and constructive

### For Reviewers

- Be respectful and constructive
- Explain reasoning behind suggestions
- Approve when standards are met

## Project Structure

```
business-process-flow-viewer/
├── components/          # React components
│   ├── designs/        # BPF design styles
│   │   ├── hooks/     # Shared hooks
│   │   └── shared/    # Shared components
│   ├── BPFViewer.tsx  # Main component
│   └── BPFRow.tsx     # Row component
├── services/           # Business logic
│   └── BPFService.ts  # BPF data fetching
├── utils/             # Utility functions
│   ├── themeUtils.ts  # Theme utilities
│   ├── debounce.ts    # Performance utilities
│   ├── sanitize.ts    # Security utilities
│   └── errorMessages.ts # Error handling
├── types/             # TypeScript definitions
├── __tests__/         # Test files
└── mocks/             # Mock data
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag vx.y.z`
4. Build solution for deployment
5. Create GitHub release with notes

## Getting Help

- Check existing issues and documentation
- Ask questions in discussions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
