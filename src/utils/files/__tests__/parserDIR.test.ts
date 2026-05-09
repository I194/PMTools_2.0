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
    // Standard parserDIR column layout (matches parserDIR.ts slice indices):
    //   [0:7]=label, [7:14]=code, [14:24]=stepRange, [24:27]=N,
    //   [27:33]=Dgeo, [33:39]=Igeo, [39:45]=Dstrat, [45:51]=Istrat,
    //   [51:58]=MADgeo, [58:64]=Kgeo, [64:]=comment
    const row1 = 'test01 GC     T100-T600   7 338.2  36.9 350.0  25.3   2.10 250.0 PCA';
    const row2 = 'test02 GC     T200-T550   5 145.5 -42.3 157.2 -30.8   3.40 180.0 PCA';
    const row3 = 'test03 GC     T100-T500   6 340.1  35.2 351.8  23.7   1.80 310.0 PCA';
    const macCRContent = `${row1}\r${row2}\r${row3}\r`;

    it('splits a Mac-CR-only file into 3 interpretations', () => {
      // Before the D1 fix, /\r?\n/ could not match a lone \r and the entire
      // synthetic content collapsed to a single string. The parser then
      // walked that one line and produced a single bogus interpretation
      // whose first 64 chars happen to match row1's columns; row2 and row3
      // were swallowed into the trailing comment field. So the test must
      // assert all three interpretations exist — not just one.
      const result = parseDIR(macCRContent, 'synthetic-mac-cr.dir');
      expect(result.data.interpretations).toHaveLength(3);
      expect(result.data.interpretations.map((interpretation) => interpretation.label)).toEqual([
        'test01',
        'test02',
        'test03',
      ]);
    });

    it('preserves Dgeo/Igeo numeric fields on rows that only exist after the CR-split', () => {
      // Specifically reads interpretations[1] and [2] — these only exist
      // when the regex actually splits on \r. If we read interpretations[0]
      // the assertion would pass even with the buggy regex (the merged
      // single-line content's first 64 chars are exactly row1).
      const result = parseDIR(macCRContent, 'synthetic-mac-cr.dir');
      const second = result.data.interpretations[1];
      expect(second.label).toBe('test02');
      expect(second.Dgeo).toBeCloseTo(145.5, 1);
      expect(second.Igeo).toBeCloseTo(-42.3, 1);
      expect(second.code).toBe('GC');
      expect(second.gcNormal).toBe(true);
      const third = result.data.interpretations[2];
      expect(third.label).toBe('test03');
      expect(third.Dgeo).toBeCloseTo(340.1, 1);
      expect(third.Igeo).toBeCloseTo(35.2, 1);
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

    it('fixture sanity: file is genuinely CR-only (16 \\r terminators, no \\n)', () => {
      // Not a parser-fix proof — this just locks the fixture's authenticity.
      // If someone re-saves the file on a modern editor the line endings
      // could silently flip to LF, neutralizing the regression value.
      expect(realContent.split('\r\n')).toHaveLength(1); // no CRLF
      expect(realContent.split('\n')).toHaveLength(1); // no lone LF
      expect(realContent.split('\r').length - 1).toBe(16); // 16 CR terminators
    });

    it('parser walks every line of the file (no single-line collapse)', () => {
      // The file uses a non-standard `rep G&S` column layout that current
      // parserDIR cannot interpret correctly (Dgeo column lands in
      // stepCount, etc.) — this is a SEPARATE issue from D1 and is
      // tracked as a future Phase 1 column-flexibility fix in the
      // dir/README.md "Pending follow-ups" section.
      //
      // What D1 proves:
      //   - the parser visits all 16 non-empty input rows (some get
      //     pair-consumed by the `rep G` branch), producing a fixed total
      //     of 11 interpretations + 1 invalidRow = 12 with the current
      //     parser implementation.
      //   - the LAST interpretation came from the LAST row of the file
      //     (label "HTC-Al" — slice(0:7) of " HTC-All "). Without the
      //     regex fix the parser would have stopped at the merged single
      //     line and never reached the bottom of the file.
      const result = parseDIR(realContent, 'kola2013_repG_macCR_component_means.dir');
      const totalRowsSeen =
        result.data.interpretations.length + result.validation.invalidRows.length;
      expect(totalRowsSeen).toBe(12);
      const lastLabel = result.data.interpretations[result.data.interpretations.length - 1].label;
      expect(lastLabel).toBe('HTC-Al');
    });
  });
});
