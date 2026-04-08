# Evaluation Report — PMTools v2.6.1

Date: 2026-03-28
Scope: Verify fixes for bugs found in evaluation-report-1.md

## Bug Report

### Bug 1: Error boundary does not catch malformed DIR data (NOT FIXED)
- **What**: Uploading a malformed .dir file (with text in numeric columns) does not trigger the error boundary — instead, the app renders a table full of NaN values and a broken stereonet with 187 console errors
- **Steps**: Go to /app/dir → upload a .dir file where Dgeo/Igeo columns contain text fragments instead of numbers
- **Expected vs Actual**: Expected error boundary fallback UI ("Something went wrong" + recovery buttons). Actual: table renders with NaN in all numeric cells, stereonet SVG emits hundreds of errors (`<circle> attribute cx: Expected length, "NaN"`, `<text> attribute x: Expected length, "NaN"`)
- **Severity**: critical — the app enters a degraded state with no user-visible error message and no obvious recovery path

### Bug 2: Missing paragraph in "Graphs and diagrams" section (PARTIALLY FIXED)
- **What**: The `graphics.lines.first` paragraph (about vector graphics for publications) is not rendered on the Why PMTools page — only `graphics.lines.third` is shown
- **Steps**: Navigate to /why-pmtools → scroll to "Graphs and diagrams" section
- **Expected vs Actual**: Expected two paragraphs (first about vector graphics, third about graph types). Actual: only one paragraph shown (the third). The translation key exists in both EN and RU locale files, but the component (`WhyPMToolsPage.tsx:88`) only renders `graphics.lines.third`, not `graphics.lines.first`
- **Severity**: minor — no raw i18n keys are shown (original bug is fixed), but content is incomplete

### Bug 3a: contentEditable warning — FIXED
- **What**: No contentEditable warnings in console when interacting with hotkey fields in Settings modal
- **Severity**: N/A — verified fixed

### Bug 3b: MUI Menu Fragment warning — FIXED
- **What**: No "Menu component doesn't accept a Fragment as a child" warnings when right-clicking graphs to open context menus
- **Severity**: N/A — verified fixed

### Bug 3c: React list key warnings — NOT FIXED
- **What**: "Each child in a list should have a unique key prop" warnings still appear on page load
- **Steps**: Load any data file on /app/pca or /app/dir → check console
- **Expected vs Actual**: Expected zero warnings. Actual: warnings from `ToolsPMD` and `Dot` components on PCA page, and from DIR page on load
- **Severity**: minor — no user-visible impact, but indicates rendering inefficiency

### Bug 3d: Redux serialization warnings — NOT FIXED
- **What**: "A non-serializable value was detected in an action" warnings still appear when loading files
- **Steps**: Go to /app/pca or /app/dir → upload any file → check console
- **Expected vs Actual**: Expected zero warnings. Actual: 2 warnings for `filesAndData/filesToData` action (pending + fulfilled) because `File` objects are passed through Redux actions
- **Severity**: minor — no user-visible impact, but violates Redux best practices

### Bug 4: React hooks order change warnings (NEW)
- **What**: "React has detected a change in the order of Hooks" warnings for `MetaDataTablePMD` and `DataTablePMD` components
- **Steps**: Load a .pmd file on /app/pca → check console
- **Expected vs Actual**: Expected zero warnings. Actual: hooks order changes between renders (e.g., hook 17 goes from `undefined` to `useContext`), indicating conditional hook usage
- **Severity**: major — violates Rules of Hooks and can cause unpredictable behavior; may lead to state corruption or crashes in edge cases

### Bug 5: `findDOMNode` deprecation warnings (NEW)
- **What**: "findDOMNode is deprecated in StrictMode" warnings appear when running PCA analysis
- **Steps**: Select steps on /app/pca → click PCA → check console
- **Expected vs Actual**: Expected zero deprecation warnings. Actual: 2 warnings triggered during PCA calculation
- **Severity**: minor — React 17 tolerates this, but would break on React 18 upgrade

## Data Consistency Issues

No mismatches found between table data and graph visualizations:
- PCA page: Zijderveld diagram points match table values, PCA interpretation (Dgeo=335.9, Igeo=26.7, MAD=0.9) is correct
- DIR page: stereonet dot positions match table declination/inclination values, normal (~338/37) and reversed (~145/-42) clusters are correctly positioned

## Shortcut Issues

None detected. Hotkey fields in Settings accept new key bindings correctly and the "To default" button resets them.

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 4 | Clean layout, good dark/light theme support, consistent spacing |
| Functionality | 4 | Core PCA and DIR workflows work correctly; error boundary for malformed data is missing |
| Technical quality | 2 | 10+ console errors on typical usage: hooks order violations, list key warnings, Redux serialization, NaN SVG attributes with malformed data |
| UX | 4 | Clear navigation, intuitive data selection, good graph interactivity |

## Priority Fixes

1. **Error boundary for malformed DIR/PMD data** — the parser should validate numeric fields and throw before rendering; the existing ErrorBoundary component should catch render errors from NaN data
2. **React hooks order violation in MetaDataTablePMD / DataTablePMD** — conditional hook usage must be refactored; this is a correctness issue that can cause state bugs
3. **React list key warnings in ToolsPMD and Dot** — add unique keys to mapped elements
4. **Redux serialization warnings** — either configure the serializable check middleware to ignore `File` objects, or extract file data before dispatching
5. **Render missing `graphics.lines.first` paragraph** on Why PMTools page — add a `<Typography>` block for this translation key in the component
6. **findDOMNode deprecation** — replace with refs (needed for eventual React 18 migration)
