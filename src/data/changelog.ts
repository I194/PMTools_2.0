export type ChangelogEntry = {
  version: string;
  date?: string;
  items?: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.6.0',
    date: 'October 8, 2025',
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


