# Evaluation Report — PMTools v2.6.1

Date: 2026-03-28

## Bug Report

### Bug 1: App crashes on malformed DIR data (no error boundary)

- **What**: Loading a .dir file with misaligned columns (producing NaN D/I values) crashes the entire DIR page
- **Steps**:
  1. Create a .dir file with columns shifted by 1+ character so Dgeo/Igeo parse as NaN
  2. Upload it on the DIR page
  3. Page renders with NaN values in table and empty stereonet
  4. Navigate away and back to /app/dir — page crashes with blank screen
- **Expected**: Error message or graceful handling of bad data
- **Actual**: `TypeError: Cannot read properties of null` in DataTable and StereoGraph components. Page goes blank. Requires `localStorage.clear()` to recover.
- **Severity**: critical
- **Files involved**: DIR page components (DataTable, StereoGraph), no error boundary wrapping them

### Bug 2: Missing translation key on Why PMTools page

- **What**: Raw i18n key displayed instead of translated text
- **Steps**: Navigate to /why-pmtools, scroll to "Graphs and diagrams" section
- **Expected**: Descriptive text about graph capabilities
- **Actual**: Shows raw key `whyPMToolsPage.graphics.lines.third`
- **Severity**: minor
- **Files involved**: `public/locales/en/translation.json` (missing key)

### Bug 3: Console error spam

- **What**: Hundreds of React/MUI warnings flood the console on every interaction
- **Details**:
  - `contentEditable` warnings: dozens per interaction — React warning about missing `suppressContentEditableWarning` prop
  - `MUI: The Menu component doesn't accept a Fragment as a child`: dozens per interaction on PCA and DIR pages
  - `Each child in a list should have a unique key`: on landing page and data tables
  - `Non-serializable value detected in Redux`: during PCA interpretation storage (action/state)
- **Severity**: minor (not user-facing, but heavy technical debt)

## Test Results

### Landing & Navigation

- Landing page loads correctly with all content sections
- /why-pmtools loads (with translation key bug noted above)
- /authors-and-history loads correctly
- /app/pca and /app/dir load correctly with file import dialogs

### PCA Page — File Loading & Graphs

- sample.pmd loads correctly: 8 demagnetization steps displayed
- **Zijderveld**: 8 numbered points with horizontal (filled) and vertical (open) projections. Axis labels and unit correct.
- **Stereonet**: Points cluster in NNW quadrant (~338/37), consistent with table Dgeo/Igeo values.
- **Magnetization (RMG)**: Decay curve from 1.0 to ~0.08 across T000-T600. Mmax=7.42E-3 A/m matches first step MAG.

### PCA Page — Selections & Analysis

- Row selection via checkboxes works (rows highlight, graph dots highlight)
- PCA line fitting on selected steps (1, 3, 5) produces interpretation:
  - Label=sample.pmd, Code=pca, StepRange=T000-T400, N=3
  - Dgeo=335.9, Igeo=26.7, Dstrat=332.9, Istrat=-0.7, MAD=0.9
- PCA lines render on Zijderveld (blue=horizontal, purple=vertical projections)
- Interpretation table appears with correct columns and values

### PCA Page — Coordinate Systems

- Geographic (Geo): Zijderveld shows "geographic", Unit=6.25E-4 A/m
- Stratigraphic (Strat): Zijderveld updates to "stratigraphic", Unit=6.94E-4 A/m
- Switching back to Geo restores original values
- Hotkey "Q" cycles between coordinate systems (shown in tooltip)

### DIR Page — File Loading

- Fixed sample.dir loads correctly: 8 directions displayed
- Table shows correct Dgeo, Igeo, Kgeo, MADgeo, Dstrat, Istrat values
- Stereonet shows two polarity clusters: normal (~338/37, filled) and reversed (~145/-42, open)
- Data in table matches dot positions on stereonet

### Theme Switching

- Dark to light: all UI elements, graphs, tables adapt correctly
- Zijderveld dots change from white-fill to black-fill, open circles for vertical projection
- No broken borders, invisible text, or color glitches
- PCA lines and interpretation table remain visible and readable

## Data Consistency

- **PCA**: Table D/I values match stereonet dot positions. PCA result direction matches fitted line on graphs. MAG values match RMG curve.
- **DIR**: Table D/I values match stereonet dot positions. Normal/reversed polarity rendered correctly.
- No mismatches found between any table and graph data.

## Scores (1-5)

| Category            | Score | Notes                                                                                   |
| ------------------- | ----- | --------------------------------------------------------------------------------------- |
| Design quality      | 4     | Clean, consistent dark/light themes. Professional graph styling. Good layout.            |
| Functionality       | 4     | PCA workflow end-to-end works. DIR works with valid data. All graph types render.        |
| Technical quality   | 3     | Heavy console error spam. No error boundary for malformed data. Redux warnings.          |
| UX                  | 4     | Intuitive layout. Clear graph/table relationship. Good hotkey tooltips. Smooth theming.  |

## Priority Fixes

1. **Critical**: Add error boundaries or input validation for malformed DIR/PCA data to prevent page crashes and unrecoverable state
2. **Minor**: Add missing translation key `whyPMToolsPage.graphics.lines.third` in en/ru locales
3. **Tech debt**: Fix contentEditable warnings (add `suppressContentEditableWarning` prop), MUI Menu Fragment children, React list key warnings, Redux serialization warnings
