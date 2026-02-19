# Testing the BPF Viewer Control

This guide explains how to test the Business Process Flow Viewer control with mock data before deploying to Dynamics 365/Power Apps.

## Quick Start

### Option 1: Simple HTML Test (Recommended)

1. **Build the control:**
   ```bash
   npm run build
   ```

2. **Open the test file:**
   - Simply open `test.html` in your web browser (double-click it)
   - Or use a local web server for better compatibility:
     ```bash
     npx http-server -p 8080
     ```
   - Then navigate to: `http://localhost:8080/test.html`

3. **Test different styles:**
   - Use the dropdowns to switch between all 8 design styles
   - Try different display modes (Stage Name vs Category)
   - Adjust record name sizes
   - Click "Refresh" to apply changes
   - Click on record names to test navigation (shows alert)

**Note:** This test file renders an HTML visualization of the BPF designs. The actual PCF control uses React components, but the visual appearance and behavior are identical.

### Option 2: PCF Test Harness

Use the built-in PCF test harness (note: shows empty state by default):

```bash
npm start
```

Then open: `http://localhost:8182`

**Note:** The pcf-start harness doesn't provide mock dataset records for virtual controls, so you'll see the "No records to display" empty state. Use `test.html` for a better testing experience.

## Mock Data Overview

The `test.html` file includes 8 sample records:

### Opportunities (6 records)
- **Contoso Ltd** - Stage 3 of 4 (Propose) - 2 stages completed
- **Fabrikam Inc** - Stage 2 of 4 (Develop) - 1 stage completed
- **Adventure Works** - Stage 4 of 4 (Close) - 3 stages completed
- **TailSpin Toys** - Stage 1 of 4 (Qualify) - Just started
- **Wingtip Toys** - No BPF attached
- **Loading Example** - Shows loading state

### Lead (1 record)
- **Northwind Traders** - Stage 2 of 3 (Research) - 1 stage completed

### Case (1 record)
- **CASE-2024-00142** - Stage 3 of 3 (Resolve) - 2 stages completed

## Design Styles Available

1. **Chevron** - Classic ribbon-style arrows (like out-of-the-box D365)
2. **Circles** - Connected circles with stage numbers/checkmarks
3. **Pills** - Rounded badge-style horizontal layout
4. **Segmented** - Single progress bar with colored segments
5. **Stepper** - Numbered boxes with connecting lines
6. **Gradient** - Gradient progress bar with stage markers
7. **Line** - Linear progress track with markers
8. **Fraction** - Compact fraction display (e.g. 2/5) with progress bar

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
- **Wingtip Toys** - Shows "No Business Process Flow" message
- **Loading Example** - Shows loading spinner and text

### Scenario 4: Different Entity Types
- Switch between Opportunities, Leads, and Cases
- Verify entity badges display correctly (if enabled)
- Check that each has appropriate number of stages

### Scenario 5: Display Modes
- **Stage Name** - Shows actual stage names (Qualify, Develop, etc.)
- **Category** - Shows stage category names

### Scenario 6: Navigation
- Click on a record name
- Should see an alert showing the record details
- (In production, this opens the record form)

## Configuration Options

The test harness lets you configure:

- **Design Style** - 8 different visual styles
- **Display Mode** - Stage name or category name
- **Record Name Size** - Small, Medium, Large
- **Show Entity Name** - Display entity badges (Opportunity, Lead, etc.)
- **Enable Navigation** - Allow clicking records to open them
- **Show Pulse Animation** - Animated pulse on active stages
- **Use Platform Theme** - Use Fluent UI colors vs custom colors
- **Custom Colors** - Set your own colors for completed/active/inactive stages

## Advanced Testing

### Testing with Real Dataverse API Calls

The control includes a MockWebAPI in `mocks/index.ts` that simulates Dataverse responses. To test with actual API calls, deploy to a Dynamics 365 environment.

### Testing Different BPF Configurations

Edit the `MOCK_BPF_CONFIG` in `test.html` or `mocks/index.ts` to test different BPF setups:

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

## Troubleshooting

### Test file shows blank screen
- Make sure you ran `npm run build` first
- Check browser console for errors
- Verify `out/controls/bundle.js` exists

### Design doesn't match expectations
- Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache
- Rebuild with `npm run build`

### Mock data not showing
- Open browser dev tools (F12)
- Check Console tab for JavaScript errors
- Verify the test.html file loaded correctly

## Next Steps

Once you're happy with the testing:

1. **Package the solution:**
   ```bash
   npm run build
   ```

2. **Import to Dynamics 365:**
   - The built solution is in `out/controls/`
   - Follow the Power Apps Component Framework deployment guide

3. **Configure in Power Apps:**
   - Add the control to a grid/subgrid
   - Set the BPF configuration JSON
   - Customize colors and design style as needed

## Files Reference

- `test.html` - Simple standalone test harness with inline mock data
- `test-harness.html` - Advanced test harness with full configuration UI
- `mocks/index.ts` - Comprehensive mock data and services
- `out/controls/bundle.js` - Built control bundle
- `out/controls/ControlManifest.xml` - Control manifest

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review component code in `components/`, `services/`, and `types/`
- Examine browser console for detailed error messages
