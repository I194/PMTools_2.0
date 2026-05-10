import * as fs from 'fs';
import * as path from 'path';
import parsePMD from '../parsers/parserPMD';

const fixturesParsers = path.resolve(__dirname, '../../../__tests__/fixtures/parsers');

// Build a synthetic .pmd file from a list of pre-formatted step lines. The
// header layout matches the real format byte-for-byte so the fixed-width
// column slicing inside parserPMD lands on the right offsets.
const buildPMD = (stepLines: string[]): string =>
  [
    '',
    'sample    a=  0.0   b=  0.0   s=  0.0   d=  0.0   v= 8.0E-6m3',
    ' PAL  Xc (Am2)  Yc (Am2)  Zc (Am2)  MAG(A/m)   Dg    Ig    Ds    Is   a95',
    ...stepLines,
    '',
  ].join('\n');

// Build a single step line from a raw step name. PMD is position-based
// fixed-width: the parser slices [0, 4) for the step column, so we pad
// (or truncate) the step name to exactly 4 chars before appending the
// numeric columns. Two leading spaces before the X column match the
// canonical archive layout.
const stepLine = (stepName: string): string => {
  const stepCol = stepName.padEnd(4, ' ').slice(0, 4);
  return `${stepCol}  1.00E-08  2.00E-08  3.00E-08  3.74E-03 250.0  53.0 250.0  53.0  0.0`;
};

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
  // any specific archive fixture. Uses the module-scope `buildPMD` helper.
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

describe('parserPMD — D3: mixed thermal + AF evidence is treated as ambiguous', () => {
  it('returns demagType=undefined + AMBIGUOUS_DEMAG_TYPE warning when both signals appear', () => {
    // 90C votes thermal (\d[Cc]\b path), M050 votes AF (M-prefix path).
    // Globally ambiguous — the parser must NOT guess: thermalEvidence=1 and
    // alternatingEvidence=1, both > 0, so the `&& other === 0` guard kicks in
    // and the result falls through to undefined + warning. This locks the
    // arbitration rule; without the guard, the file would be misclassified.
    const data = buildPMD([stepLine('90C'), stepLine('M050')]);
    const result = parsePMD(data, 'mixed.pmd');
    expect(result.data.steps).toHaveLength(2);
    expect(result.data.steps.every((step) => step.demagType === undefined)).toBe(true);
    const warnings = result.validation.warnings ?? [];
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe('AMBIGUOUS_DEMAG_TYPE');
  });
});

describe('parserPMD — D3: thermal markers beyond the U+FFFD path', () => {
  it('classifies UTF-8-correct "90°C" (literal U+00B0) as thermal', () => {
    // Branch lock: when the upstream layer decoded the file properly (e.g. a
    // genuine UTF-8 source with U+00B0), the literal degree sign must still
    // be detected. Distinct from the Crimea fixture, which is ISO-8859 and
    // mis-decodes 0xB0 → U+FFFD; that path hits the `�` branch instead.
    const data = buildPMD([stepLine('90°C')]);
    const result = parsePMD(data, 'utf8-degree.pmd');
    expect(result.data.steps[0].demagType).toBe('thermal');
    expect(result.validation.warnings ?? []).toHaveLength(0);
  });

  it('classifies "200C" (no degree symbol, digit+C boundary) as thermal', () => {
    // Branch lock: \d[Cc]\b path. Real archive files don't use this dialect,
    // but the regex is documented behaviour — if a future file ships bare
    // "200C"/"500C" step names the classification must hold. The \b boundary
    // prevents false positives like "Cool" or "5Csample".
    const data = buildPMD([stepLine('200C')]);
    const result = parsePMD(data, 'digit-C.pmd');
    expect(result.data.steps[0].demagType).toBe('thermal');
    expect(result.validation.warnings ?? []).toHaveLength(0);
  });
});

describe('parserPMD — D3: letter-prefix detection requires a digit after T/M', () => {
  it('does NOT classify "Tea" (4-char word starting with T) as thermal', () => {
    // The pre-tightening regex /^[Tt]/ would have voted thermal here, which
    // is wrong for any 4-char word that happens to start with T. The strict
    // /^[Tt]\d/ requires a digit immediately after the letter, so words don't
    // vote. With one neutral step the file resolves to undefined + warning.
    const result = parsePMD(buildPMD([stepLine('Tea')]), 'tea.pmd');
    expect(result.data.steps[0].demagType).toBeUndefined();
    expect(result.validation.warnings ?? []).toHaveLength(1);
  });

  it('does NOT classify "Mac" (4-char word starting with M) as alternating field', () => {
    // Symmetric to the Tea case — strict /^[Mm]\d/ ignores 4-char M-words.
    const result = parsePMD(buildPMD([stepLine('Mac')]), 'mac.pmd');
    expect(result.data.steps[0].demagType).toBeUndefined();
    expect(result.validation.warnings ?? []).toHaveLength(1);
  });

  it('still classifies canonical "T100" / "M050" via the digit-anchored prefix', () => {
    // Sanity: tightening must not break the back-compat path. Already covered
    // implicitly by the back-compat block above; explicit assertion here
    // makes the "Tea/Mac fail vs T100/M050 succeed" pair self-contained.
    expect(parsePMD(buildPMD([stepLine('T100')]), 't100.pmd').data.steps[0].demagType).toBe(
      'thermal',
    );
    expect(parsePMD(buildPMD([stepLine('M050')]), 'm050.pmd').data.steps[0].demagType).toBe(
      'alternating field',
    );
  });
});

describe('parserPMD — D3: Siberia "T 20" with-space step-1 (position-based padding)', () => {
  const content = fs.readFileSync(
    path.join(fixturesParsers, 'pmd/real/siberia2014_t-space-step1_23.pmd'),
    'utf-8',
  );

  it('classifies as thermal: step 1 ("T 20") casts no vote, T120+ steps do', () => {
    // PMD is fixed-width: step-1 here is right-aligned in the 4-char column
    // as "T 20" (T, space, 2, 0). The strict ^[Tt]\d regex does not match
    // step 1 (the space breaks it), but T120/T180/T240/T300/... do match.
    // thermalEvidence > 0, alternatingEvidence === 0 → file classified as
    // thermal, no warning. This proves the strict regex does not regress
    // the position-based-padding dialect that real Siberia files use.
    const result = parsePMD(content, 'siberia2014_t-space-step1_23.pmd');
    expect(result.data.steps.length).toBeGreaterThan(1);
    for (const step of result.data.steps) {
      expect(step.demagType).toBe('thermal');
    }
    expect(result.validation.warnings ?? []).toHaveLength(0);
  });
});

describe('parserPMD — D3: \\d{1,2}mT step names classify as alternating field', () => {
  // Coverage of the /mT/i branch. The range that fits the 4-char column is
  // 1..99 ("5mT " is 3 chars + pad, "99mT" is 4 chars exactly); 100mT would
  // not fit the fixed-width column at all, so the regex's reachable domain
  // is bounded by the format itself, not by an arbitrary test choice. We
  // hit single-digit min/max, two-digit min/max, and a couple of midpoints —
  // enough to lock the regex without depending on a property-based runner.
  it.each([1, 5, 9, 10, 50, 75, 99])('"%dmT" step votes alternating field', (value) => {
    const data = buildPMD([stepLine(`${value}mT`)]);
    const result = parsePMD(data, `${value}mT.pmd`);
    expect(result.data.steps.length).toBeGreaterThan(0);
    expect(result.data.steps.every((step) => step.demagType === 'alternating field')).toBe(true);
    expect(result.validation.warnings ?? []).toHaveLength(0);
  });

  it('a multi-step mT-only file (mixed values) classifies as AF without warning', () => {
    // Locks the "every voting step agrees" path with multiple mT steps in
    // one file — distinct from the single-step it.each above, which doesn't
    // exercise the per-step accumulator with more than one row.
    const data = buildPMD([stepLine('5mT'), stepLine('20mT'), stepLine('80mT')]);
    const result = parsePMD(data, 'mt-multi.pmd');
    expect(result.data.steps).toHaveLength(3);
    expect(result.data.steps.every((step) => step.demagType === 'alternating field')).toBe(true);
    expect(result.validation.warnings ?? []).toHaveLength(0);
  });
});
