import * as fs from 'fs';
import * as path from 'path';
import parsePMM from '../parsers/parserPMM';
import parseCSV_DIR from '../parsers/parserCSV_DIR';
import { createMergedDirData, mergeInterpretations } from '../mergeUtils';

const testDataDir = path.resolve(__dirname, '../../../../test-data');

describe('DIR file merge', () => {
  const pmmData = fs.readFileSync(path.join(testDataDir, 'season1_north.pmm'), 'utf-8');
  const csvData = fs.readFileSync(path.join(testDataDir, 'lab_results.csv'), 'utf-8');

  it('parsePMM should produce 8 interpretations from season1_north.pmm', () => {
    const result = parsePMM(pmmData, 'season1_north.pmm');
    expect(result.interpretations).toHaveLength(8);
    expect(result.interpretations[0].label).toBe('S1N-01');
    expect(result.interpretations[7].label).toBe('S1N-08');
  });

  it('parseCSV_DIR should produce 7 interpretations from lab_results.csv', () => {
    const result = parseCSV_DIR(csvData, 'lab_results.csv');
    expect(result.interpretations).toHaveLength(7);
    expect(result.interpretations[0].label).toBe('LAB-01');
    expect(result.interpretations[6].label).toBe('LAB-07');
  });

  it('mergeInterpretations should produce 15 items from PMM(8) + CSV(7)', () => {
    const pmm = parsePMM(pmmData, 'season1_north.pmm');
    const csv = parseCSV_DIR(csvData, 'lab_results.csv');
    const merged = mergeInterpretations([pmm, csv]);
    expect(merged).toHaveLength(15);
    expect(merged[0].label).toBe('S1N-01');
    expect(merged[7].label).toBe('S1N-08');
    expect(merged[8].label).toBe('LAB-01');
    expect(merged[14].label).toBe('LAB-07');
  });

  it('createMergedDirData should produce correct merged IDirData', () => {
    const pmm = parsePMM(pmmData, 'season1_north.pmm');
    const csv = parseCSV_DIR(csvData, 'lab_results.csv');
    const merged = createMergedDirData([pmm, csv], 'test-merge');
    expect(merged.name).toBe('test-merge');
    expect(merged.format).toBe('merged');
    expect(merged.interpretations).toHaveLength(15);
    // IDs should be re-indexed 1-15
    expect(merged.interpretations.map((i) => i.id)).toEqual(
      Array.from({ length: 15 }, (_, i) => i + 1),
    );
  });
});
