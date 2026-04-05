export type ChangelogEntry = {
  version: string;
  date?: string;
  items?: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.6.3',
    date: 'April 5, 2026',
    items: [
      'DIR page: added "Merge all files into one collection" option — upload multiple files and combine them into a single collection with sequential IDs.',
      'DIR page: merge supports custom collection name or auto-generated name from file names.',
      'DIR page: merge works across formats (PMM, DIR, CSV, XLSX).',
      'PCA: fixed MAD=0 bug caused by incorrect eigenvalue sorting in PCA decomposition.',
      'Upload modal: fixed dark theme contrast — checkbox and text field are now clearly visible.',
      'File selector: fixed long merged names overflowing the dropdown — names are now truncated with ellipsis.',
    ],
  },
  {
    version: '2.6.2',
    date: 'March 29, 2026',
    items: [
      'Magnetization graph: fixed x-axis showing "mT" instead of "°C" for thermal demagnetization (read demagType from first non-NRM step).',
      'Metadata editor: fixed IEEE 754 floating-point artifacts (e.g., 22.599999999999994 instead of 22.6) by using string-based state.',
      'Metadata editor: fixed NaN when typing decimal separator ("." or ",") as first character — field no longer gets stuck.',
      'Interpretation labels: stripped file extension from component names (e.g., "300b" instead of "300b.pmd").',
      'SQUID parser: files with header but no measurement data are now rejected with a clear error message instead of crashing the app.',
      'Magnetization graph: guarded against -Infinity display when data is empty.',
      'File import: added validation modal that detects and reports invalid data rows on upload.',
      'Error boundary: added crash recovery UI so the app no longer shows a permanent white screen on unexpected errors.',
      'Parsers: added numeric field validation in DIR/PMD parsers to prevent NaN propagation.',
      'Zijderveld plot: guarded unit label against -INFINITY for empty datasets.',
      'localStorage: added safe JSON parsing to prevent blank screen on corrupted storage.',
      'Fixed React hooks order violations in DataTable components.',
      'Added ESLint, Prettier, Husky pre-commit hook, and CI typecheck/lint steps.',
      'Formatted entire codebase with Prettier; removed all console.log statements.',
    ],
  },
  {
    version: '2.6.1',
    date: 'December 19, 2025',
    items: [
      'PCA DataTable: fixed metadata change handling — steps are now recalculated to keep geographic/stratigraphic directions in sync.',
      'PCA export: fixed Hade/Plunge conversion (hade → plunge → hade) for PMD/CSV/XLSX exports.',
    ],
  },
  {
    version: '2.6.0',
    date: 'November 8, 2025',
    items: [
      'Improved stability for long sessions; fixed several memory leaks.',
      'Empty files are skipped on import to prevent crashes.',
      'Improved reliability when opening the first PCA/DIR files (the “drag files here” message no longer appears after import).',
      'Generalized toggle button component; refined styles.',
      'Updated Node.js to version 22.10.0.',
      'DIR statistics export: MAD and K values now differ between geographic and stereographic systems to match the app.',
      'Hotkeys: fixed hotkey initialization.',
      'Settings: added Display settings section; added numeric label controls for PCA/DIR.',
      'PCA stereo: added great-circle connections and enabled them by default.',
      'Reversal Test: fixed SVG export – now exports a single combined SVG for X/Y/Z components.',
      'Changelog: added version history.',
    ],
  },
  { version: '2.5.8', date: 'June 12, 2025' },
  { version: '2.5.7', date: 'April 8, 2024' },
  { version: '2.5.6', date: 'January 30, 2024' },
  { version: '2.5.5 – 2.1.0', date: '...' },
  { version: '2.0.0', date: 'January 29, 2022' },
];
