# Testing the BPF Viewer Control

This guide explains how to test the Business Process Flow Viewer control.

## Unit Tests

Run the full test suite:

```bash
npm test
```

Run in watch mode during development:

```bash
npm run test:watch
```

Run with coverage report:

```bash
npm run test:coverage
```

## Test Suite Overview

The project has 371+ tests across 18 test suites covering:

- **Component tests** - BPFViewer, BPFRow, ErrorBoundary, all 8 design components, StageIcon
- **Service tests** - BPFService (Dataverse API calls, caching, batching, RetrieveActivePath, fallback)
- **Utility tests** - configValidation, debounce, errorMessages, logger, perfTracker, sanitize, themeUtils
- **Accessibility tests** - axe-core integration tests for all design components
- **Hook tests** - useBPFDesignHelpers (pulse logic, stage status, accessibility metadata)

## Design Styles Available

1. **Chevron** - Classic ribbon-style arrows (like out-of-the-box D365)
2. **Circles** - Connected circles with stage numbers/checkmarks
3. **Pills** - Rounded badge-style horizontal layout
4. **Segmented** - Single progress bar with colored segments
5. **Stepper** - Numbered boxes with connecting lines
6. **Gradient** - Gradient progress bar with stage markers
7. **Line** - Linear progress track with markers
8. **Fraction** - Compact fraction display (e.g. 2/5) with progress bar

## PCF Test Harness

Use the built-in PCF test harness for local development:

```bash
npm start
```

Then open: `http://localhost:8182`

**Note:** The pcf-start harness doesn't provide mock dataset records for virtual controls, so you'll see the "No records to display" empty state. For full end-to-end testing, deploy to a Dataverse environment.

## Testing Scenarios

### Scenario 1: Different Stage Progressions
- Look at records in different stages to see active/completed/inactive states
- Verify pulse animation on active stages (if enabled)
- Check that completed stages show the correct color

### Scenario 2: Mobile Responsiveness
- Resize your browser window to < 640px
- Verify designs adjust for mobile view
- Check that text remains readable

### Scenario 3: No BPF / Loading States
- Records without a BPF should show "No active Business Process Flow"
- Loading records should show a spinner

### Scenario 4: Different Entity Types
- Test with Opportunities, Leads, Cases, and custom entities
- Verify entity badges display correctly (if enabled)

### Scenario 5: Display Modes
- **Stage Name** - Shows actual stage names (Qualify, Develop, etc.)
- **Category** - Shows stage category names

### Scenario 6: Custom BPF Entities
- Test with both OOTB BPFs (e.g. `opportunitysalesprocess`) and custom BPFs (e.g. `adc_custombpf`)
- Verify BPF name resolves correctly for both types

## Configuration Options

The control supports these configuration properties:

- **Design Style** - 8 different visual styles
- **Display Mode** - Stage name or category name
- **Record Name Size** - Small, Medium, Large
- **Show Entity Name** - Display entity badges (Opportunity, Lead, etc.)
- **Enable Navigation** - Allow clicking records to open them
- **Show Pulse Animation** - Animated pulse on active stages
- **Use Platform Theme** - Use Fluent UI colors vs custom colors
- **Custom Colors** - Set your own colors for completed/active/inactive stages

## Testing Different BPF Configurations

Edit the `MOCK_BPF_CONFIG` in `mocks/index.ts` to test different BPF setups:

```javascript
{
  bpfs: [
    {
      bpfEntitySchemaName: 'opportunitysalesprocess',
      lookupFieldSchemaName: '_opportunityid_value'
    }
    // Add more BPFs here
  ]
}
```

## Deployment Testing

Once you're happy with unit tests:

1. **Build the control:**
   ```bash
   npm run build
   ```

2. **Package the solution:**
   ```bash
   npm run solution:build
   ```

3. **Import to Dynamics 365:**
   - Import the managed solution zip from `Solution/bin/Release/`
   - Add the control to a grid/subgrid
   - Set the BPF configuration JSON
   - Customize colors and design style as needed

## Files Reference

- `mocks/index.ts` - Mock data and services for testing
- `__tests__/` - All unit test files
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test setup (jest-dom matchers)

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review component code in `components/`, `services/`, and `types/`
- Examine browser console for detailed error messages
