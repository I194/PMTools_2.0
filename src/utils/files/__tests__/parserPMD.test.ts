import * as fs from 'fs';
import * as path from 'path';
import parsePMD from '../parsers/parserPMD';

const fixturesParsers = path.resolve(__dirname, '../../../__tests__/fixtures/parsers');

describe('parserPMD — D3 regression: demagType inference scans the whole steps block', () => {
  describe('Crimea NRM-then-°C dialect (thermal evidence)', () => {
    const content = fs.readFileSync(
      path.join(fixturesParsers, 'pmd/real/crimea2013_nrm_celsius_dialect_143.pmd'),
      'utf-8',
    );

    it('infers demagType="thermal" from `90°C`/`150°C`/... step names', () => {
      // Affects 23 archive files in the Crimea sub-archive. Pre-D3 the parser
      // looked at the first valid step (`NRM`) only — `N` matched neither the
      // thermal nor the AF letter set, so demagType stayed undefined. D3 scans
      // all step names and detects `°` as a thermal marker.
      const result = parsePMD(content, 'crimea2013_nrm_celsius_dialect_143.pmd');
      expect(result.data.steps.length).toBeGreaterThan(0);
      for (const step of result.data.steps) {
        expect(step.demagType).toBe('thermal');
      }
    });

    it('emits NO ambiguity warning for confident detection', () => {
      const result = parsePMD(content, 'crimea2013_nrm_celsius_dialect_143.pmd');
      expect(result.validation.warnings ?? []).toHaveLength(0);
    });
  });

  describe('Polar Ural unprefixed step names (genuinely ambiguous)', () => {
    const content = fs.readFileSync(
      path.join(fixturesParsers, 'pmd/real/polarural2012_unprefixed_steps_1-1.pmd'),
      'utf-8',
    );

    it('keeps demagType=undefined when step names are bare numbers', () => {
      // Affects 66 archive files in the Polar Ural sub-archive. Step names are
      // `20`, `60`, `120`, `180`, `220` — consistent with both thermal (°C) and
      // AF (mT) demag protocols, no markers either way. The parser cannot
      // distinguish; result must explicitly stay undefined rather than guess.
      const result = parsePMD(content, 'polarural2012_unprefixed_steps_1-1.pmd');
      expect(result.data.steps.length).toBeGreaterThan(0);
      for (const step of result.data.steps) {
        expect(step.demagType).toBeUndefined();
      }
    });

    it('emits a non-blocking AMBIGUOUS_DEMAG_TYPE warning', () => {
      // The warning is what the UI surfaces (Phase 2 work) so the user knows
      // why the demag column is empty. The structured `code` field lets the
      // UI map the warning to a localized message.
      const result = parsePMD(content, 'polarural2012_unprefixed_steps_1-1.pmd');
      const warnings = result.validation.warnings ?? [];
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe('AMBIGUOUS_DEMAG_TYPE');
      expect(warnings[0].message).toMatch(/could not infer/i);
    });
  });

  describe('SQUID-converter golden 70.pmd (alternating field via M-prefix)', () => {
    const content = fs.readFileSync(
      path.join(fixturesParsers, 'pmd/real/khramov2026_70.pmd'),
      'utf-8',
    );

    it('infers demagType="alternating field" from `M000`/`M010`/... step names', () => {
      // The D5 SQUID fix produces `M000`-`M090` step names. Cross-checks D3:
      // the M-prefix path of inferDemagTypeFromStepNames must classify these
      // as alternating field, no warning.
      const result = parsePMD(content, 'khramov2026_70.pmd');
      expect(result.data.steps.length).toBeGreaterThan(0);
      for (const step of result.data.steps) {
        expect(step.demagType).toBe('alternating field');
      }
      expect(result.validation.warnings ?? []).toHaveLength(0);
    });
  });
});

describe('parserPMD — back-compat: standard T/M-prefix files still classify correctly', () => {
  // Synthetic-ish: build a tiny T-prefix file and an M-prefix file from
  // hand-crafted strings to lock the back-compat surface without depending on
  // any specific archive fixture.
  const buildPMD = (stepLines: string[]): string =>
    [
      '',
      'sample    a=  0.0   b=  0.0   s=  0.0   d=  0.0   v= 8.0E-6m3',
      ' PAL  Xc (Am2)  Yc (Am2)  Zc (Am2)  MAG(A/m)   Dg    Ig    Ds    Is   a95',
      ...stepLines,
      '',
    ].join('\n');

  it('keeps demagType="thermal" for canonical `T000` / `T100` step names', () => {
    const content = buildPMD([
      'T000  1.00E-08  2.00E-08  3.00E-08  3.74E-03 250.0  53.0 250.0  53.0  0.0',
      'T100  9.00E-09  1.80E-08  2.70E-08  3.36E-03 251.0  53.5 251.0  53.5  0.0',
    ]);
    const result = parsePMD(content, 'synthetic-thermal.pmd');
    expect(result.data.steps.every((step) => step.demagType === 'thermal')).toBe(true);
    expect(result.validation.warnings ?? []).toHaveLength(0);
  });

  it('keeps demagType="alternating field" for canonical `M000` / `M010` step names', () => {
    const content = buildPMD([
      'M000  1.00E-08  2.00E-08  3.00E-08  3.74E-03 250.0  53.0 250.0  53.0  0.0',
      'M010  9.00E-09  1.80E-08  2.70E-08  3.36E-03 251.0  53.5 251.0  53.5  0.0',
    ]);
    const result = parsePMD(content, 'synthetic-af.pmd');
    expect(result.data.steps.every((step) => step.demagType === 'alternating field')).toBe(true);
    expect(result.validation.warnings ?? []).toHaveLength(0);
  });
});
