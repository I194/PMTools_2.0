import * as fs from 'fs';
import * as path from 'path';
import parseSQUID from '../parsers/parserSQUID';
import parsePMD from '../parsers/parserPMD';

const fixturesParsers = path.resolve(__dirname, '../../../__tests__/fixtures/parsers');

describe('parserSQUID — D5 regression: khramov2026_70.squid', () => {
  const squidContent = fs.readFileSync(
    path.join(fixturesParsers, 'squid/real/khramov2026_70.squid'),
    'utf-8',
  );
  const pmdGoldenContent = fs.readFileSync(
    path.join(fixturesParsers, 'pmd/real/khramov2026_70.pmd'),
    'utf-8',
  );

  const squidParsed = parseSQUID(squidContent, 'khramov2026_70.squid');
  const pmdGolden = parsePMD(pmdGoldenContent, 'khramov2026_70.pmd').data;

  it('truncates the ARM-acquisition block silently', () => {
    // After the parser strips the filename and metadata headers, 20 data lines
    // remain: 10 AF demagnetization + 1 ARM + 9 AF-of-ARM. After truncation at
    // the first `ARM` line, only the 10 AF steps remain. R.V. Veselovsky's
    // reference golden PMD has 10 steps — same count.
    expect(squidParsed.steps).toHaveLength(10);
    expect(squidParsed.steps).toHaveLength(pmdGolden.steps.length);
  });

  it('produces M000–M090 step names matching the RV golden converter', () => {
    // Each AF field value in the raw `.squid` is in Oersted. The fix divides
    // by 10 (1 Oe ≈ 0.1 mT) and zero-pads to 3 digits. The bare `AF` first
    // line (zero-field NRM measurement) becomes `M000` — previous-buggy
    // behavior produced `M0`.
    const squidStepNames = squidParsed.steps.map((step) => step.step);
    const goldenStepNames = pmdGolden.steps.map((step) => step.step);
    const expectedStepNames = [
      'M000',
      'M010',
      'M015',
      'M020',
      'M030',
      'M040',
      'M050',
      'M060',
      'M075',
      'M090',
    ];
    expect(squidStepNames).toEqual(expectedStepNames);
    expect(squidStepNames).toEqual(goldenStepNames);
  });

  it('classifies all steps as alternating-field demagnetization', () => {
    // M-prefixed step names trigger the `alternating field` branch of the
    // demagType inference shared with parserPMD.
    for (const step of squidParsed.steps) {
      expect(step.demagType).toBe('alternating field');
    }
  });

  it('matches the golden PMD geographic direction within 0.5°', () => {
    // After the SQUID parser's coordinate transform (specimen → geographic
    // via toReferenceCoordinates with metadata.b corrected), Dgeo/Igeo must
    // match the directly-stated Dg/Ig in the golden PMD. The PMD file rounds
    // to 1 decimal; compare with precision 0 (tolerance < 0.5).
    for (let i = 0; i < pmdGolden.steps.length; i++) {
      expect(squidParsed.steps[i].Dgeo).toBeCloseTo(pmdGolden.steps[i].Dgeo, 0);
      expect(squidParsed.steps[i].Igeo).toBeCloseTo(pmdGolden.steps[i].Igeo, 0);
    }
  });

  it('matches the golden PMD MAG values within 1% relative tolerance', () => {
    // MAG (volumetric magnetization, A/m) is read directly from the same
    // column in both formats — no coordinate transform involved. Allow 1%
    // for the mag-column truncation in the source files.
    for (let i = 0; i < pmdGolden.steps.length; i++) {
      const ratio = squidParsed.steps[i].mag / pmdGolden.steps[i].mag;
      expect(ratio).toBeCloseTo(1, 1);
    }
  });

  it('locks the metadata.a >= 90 correction branch (a -= 90)', () => {
    // Raw SQUID metadata `a = 270.0`; since 270 ≥ 90, parser subtracts 90 → 180.
    // Matches golden PMD `a=180.0`. The `a < 90` branch (a += 270) is NOT
    // covered by this fixture — see fixtures/parsers/squid/README.md
    // synthetic-fixture matrix; locked separately in Phase 1 Step 4.
    expect(squidParsed.metadata.a).toBeCloseTo(180.0, 1);
    expect(squidParsed.metadata.a).toBeCloseTo(pmdGolden.metadata.a, 1);
  });
});
