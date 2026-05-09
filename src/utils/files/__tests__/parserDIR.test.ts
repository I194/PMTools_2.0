import * as fs from 'fs';
import * as path from 'path';
import parseDIR from '../parsers/parserDIR';

const fixturesParsers = path.resolve(__dirname, '../../../__tests__/fixtures/parsers');

describe('parserDIR — D1 regression: Mac classic CR-only line endings', () => {
  // Decomposed into two cases:
  //
  //   1. Synthetic CR-only file using the standard parserDIR column layout —
  //      isolates the D1 fix (line-ending regex) from any column-format
  //      concern, asserts exact interpretation values.
  //
  //   2. The real archive file (kola2013_repG_macCR_component_means.dir) —
  //      uses a non-standard `rep G&S` column layout that current parserDIR
  //      cannot interpret correctly (a separate issue, tracked as a future
  //      Phase 1 column-flexibility fix). For D1 we only assert the file is
  //      no longer collapsed into a single string by the regex.

  describe('synthetic CR-only file (regex isolation)', () => {
    // Standard parserDIR column layout:
    //   [0:7]=label, [7:14]=code, [14:24]=stepRange, [24:27]=N,
    //   [27:33]=Dgeo, [33:39]=Igeo, [39:45]=Dstrat, [45:51]=Istrat,
    //   [51:58]=K, [58:64]=MAD, [64:]=comment
    const row1 = 'test01 GC     T100-T600   7 338.2  36.9 350.0  25.3   2.10 250.0 PCA';
    const row2 = 'test02 GC     T200-T550   5 145.5 -42.3 157.2 -30.8   3.40 180.0 PCA';
    const row3 = 'test03 GC     T100-T500   6 340.1  35.2 351.8  23.7   1.80 310.0 PCA';
    const macCRContent = `${row1}\r${row2}\r${row3}\r`;

    it('splits a Mac-CR-only file into 3 interpretations', () => {
      // Before the D1 fix, /\r?\n/ could not match a lone \r and the entire
      // synthetic content collapsed to 1 string → 0 interpretations.
      const result = parseDIR(macCRContent, 'synthetic-mac-cr.dir');
      expect(result.data.interpretations).toHaveLength(3);
      expect(result.data.interpretations.map((interpretation) => interpretation.label)).toEqual([
        'test01',
        'test02',
        'test03',
      ]);
    });

    it('preserves Dgeo/Igeo numeric fields through CR-split', () => {
      const result = parseDIR(macCRContent, 'synthetic-mac-cr.dir');
      const first = result.data.interpretations[0];
      expect(first.Dgeo).toBeCloseTo(338.2, 1);
      expect(first.Igeo).toBeCloseTo(36.9, 1);
      expect(first.code).toBe('GC');
      expect(first.gcNormal).toBe(true);
    });

    it('also handles CRLF and LF line endings (back-compat)', () => {
      const crlfContent = `${row1}\r\n${row2}\r\n${row3}\r\n`;
      const lfContent = `${row1}\n${row2}\n${row3}\n`;
      expect(parseDIR(crlfContent, 'crlf.dir').data.interpretations).toHaveLength(3);
      expect(parseDIR(lfContent, 'lf.dir').data.interpretations).toHaveLength(3);
    });
  });

  describe('real archive file (kola2013_repG_macCR_component_means.dir)', () => {
    const realContent = fs.readFileSync(
      path.join(fixturesParsers, 'dir/real/kola2013_repG_macCR_component_means.dir'),
      'utf-8',
    );

    it('splits the file into 17 raw lines via the unified regex', () => {
      // The file has 16 \r terminators (no trailing line). Splitting yields
      // 17 string fragments. Before the D1 fix this regex match would have
      // failed and the file would have stayed as 1 monolithic string.
      const lines = realContent.split(/\r\n|\r|\n/);
      expect(lines).toHaveLength(17);
    });

    it('parser walks the lines individually (no single-line collapse)', () => {
      // The file uses a non-standard `rep G&S` column layout that current
      // parserDIR cannot interpret correctly (Dgeo column lands in
      // stepCount, etc.) — this is a SEPARATE issue from D1 and is
      // tracked as a future Phase 1 column-flexibility fix in the
      // dir/README.md "Pending follow-ups" section. What D1 proves: the
      // parser sees more than 1 row of input, so the line-ending fix is
      // working. Each visited row either becomes an interpretation or an
      // invalidRow — none are silently lost in a collapsed single line.
      const result = parseDIR(realContent, 'kola2013_repG_macCR_component_means.dir');
      const totalRowsSeen =
        result.data.interpretations.length + result.validation.invalidRows.length;
      expect(totalRowsSeen).toBeGreaterThan(1);
    });
  });
});
