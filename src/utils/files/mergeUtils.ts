import { IDirData } from '../GlobalTypes';

type DirInterpretation = IDirData['interpretations'][number];

/**
 * Merge interpretations from multiple IDirData sources into a single array,
 * re-indexing IDs sequentially starting from 1.
 */
export const mergeInterpretations = (sources: IDirData[]): IDirData['interpretations'] => {
  let nextId = 1;
  return sources.flatMap((source) =>
    source.interpretations.map(
      (interp): DirInterpretation => ({
        ...interp,
        id: nextId++,
      }),
    ),
  );
};

/**
 * Create a single merged IDirData from multiple sources.
 */
export const createMergedDirData = (sources: IDirData[], name: string): IDirData => ({
  name,
  interpretations: mergeInterpretations(sources),
  format: 'merged',
  created: new Date().toISOString(),
});

/**
 * Generate a default name for a merged collection from source file names.
 * Takes the first two file names joined with " + ", adding "..." if there are more.
 */
export const generateMergedName = (fileNames: string[]): string => {
  if (fileNames.length === 0) return 'merged';
  if (fileNames.length === 1) return fileNames[0];
  const base = fileNames.slice(0, 2).join(' + ');
  return fileNames.length > 2 ? `${base} + ...` : base;
};
