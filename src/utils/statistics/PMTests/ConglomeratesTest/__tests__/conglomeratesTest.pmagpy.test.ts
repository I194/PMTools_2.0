import { readFileSync } from 'fs';
import { join } from 'path';
import conglomeratesTest from '../conglomeratesTest';
import parseDIR from '../../../../files/parsers/parserDIR';
import parsePMM from '../../../../files/parsers/parserPMM';
import { ConglomeratesTestResult, IDirData } from '../../../../GlobalTypes';
import { fixturePath } from '../../../../../test-utils/referenceFixtures';

// PB-12: Watson (1956) conglomerate test against ipmag.conglomerate_test_Watson + pmag.fisher_mean
// (PmagPy 4.3.14). Oracle generator: scripts/oracle_pb12_conglomerate_test.py

type OracleResult = {
  n: number;
  result: { R: number; Ro_95: number; Ro_99: number; verdictLines: number[] } | null;
};
type DirectionSet = {
  name: string;
  declinations: number[];
  inclinations: number[];
  pmagpy: OracleResult;
};
type RealFileSet = DirectionSet & { format: 'dir' | 'pmm' };
type FanSet = { name: string; fanDeclination: number; pmagpy: OracleResult };
type ExactThresholdSet = DirectionSet & { exactTarget: number };
type UniformQuantile = { n: number; quantile95: number; quantile99: number };

const oracle = JSON.parse(
  readFileSync(fixturePath('part_b', 'pb12_conglomerate_test.pmagpy.json'), 'utf8'),
) as {
  verdictTexts: string[];
  realFiles: RealFileSet[];
  synthetic: DirectionSet[];
  fan: FanSet[];
  exactThreshold: ExactThresholdSet[];
  uniformResultantQuantiles: UniformQuantile[];
};

// R is a sum of unit vectors on identical inputs; only float noise separates the two sides.
const RESULTANT_TOLERANCE = 1e-12;

const RUSSIAN_FOR_ENGLISH: Record<string, string> = {
  '': '',
  [oracle.verdictTexts[0]]:
    'Этот набор направлений "проходит" тест конгломератов, то есть гипотеза о случайности распределения не может быть отклонена c 95% уровнем доверия',
  [oracle.verdictTexts[1]]: 'Гипотеза о случайности может быть отклонена с 95% уровнем доверия',
  [oracle.verdictTexts[2]]: 'Гипотеза о случайности может быть отклонена с 99% уровнем доверия',
};

const toDirData = (declinations: number[], inclinations: number[]): IDirData => ({
  name: 'pb12',
  format: 'DIR',
  created: '1970-01-01T00:00:00.000Z',
  interpretations: declinations.map((declination, index) => ({
    id: index + 1,
    label: `d${index + 1}`,
    code: 'DirOPCA',
    stepRange: '',
    stepCount: 0,
    Dgeo: declination,
    Igeo: inclinations[index],
    Dstrat: 0,
    Istrat: 0,
    MADgeo: 0,
    Kgeo: 0,
    MADstrat: 0,
    Kstrat: 0,
    comment: '',
    demagType: undefined,
  })),
});

/** Same construction as fan_declinations() in the oracle: I = 0, one D = 0 when N is odd, then +-D pairs. */
const fanDirData = (size: number, fanDeclination: number) => {
  const declinations: number[] = size % 2 ? [0] : [];
  for (let pair = 0; pair < Math.floor(size / 2); pair++) {
    declinations.push(fanDeclination, -fanDeclination);
  }
  return toDirData(declinations, new Array(size).fill(0));
};

const sizeOf = (name: string) => Number(/N=(\d+)/.exec(name)![1]);

let alertSpy: jest.SpyInstance;
beforeEach(() => {
  alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);
});
afterEach(() => alertSpy.mockRestore());

/** PMTools keeps only the last verdict that applies; ipmag prints every one (95% and 99% rejections). */
const expectParity = (actual: ConglomeratesTestResult | null, expected: OracleResult) => {
  if (expected.result === null) {
    expect(actual).toBeNull();
    expect(alertSpy).toHaveBeenCalledTimes(1);
    return;
  }
  expect(alertSpy).not.toHaveBeenCalled();
  expect(actual).not.toBeNull();
  const result = actual!;
  expect(result.N).toBe(expected.n);
  expect(Math.abs(result.R - expected.result.R)).toBeLessThan(RESULTANT_TOLERANCE);
  expect(result.Ro_95).toBe(expected.result.Ro_95);
  expect(result.Ro_99).toBe(expected.result.Ro_99);
  const lastVerdict = expected.result.verdictLines.slice(-1)[0];
  const expectedEnglish = lastVerdict === undefined ? '' : oracle.verdictTexts[lastVerdict];
  expect(result.resultDescription.en).toBe(expectedEnglish);
  expect(result.resultDescription.ru).toBe(RUSSIAN_FOR_ENGLISH[expectedEnglish]);
};

describe('conglomeratesTest against ipmag.conglomerate_test_Watson', () => {
  it.each(oracle.realFiles.map((realFile) => [realFile.name, realFile] as const))(
    '%s, parsed by the live parser',
    (path, realFile) => {
      const repositoryRoot = join(__dirname, '..', '..', '..', '..', '..', '..');
      const content = readFileSync(join(repositoryRoot, path), 'utf8');
      const parsed =
        realFile.format === 'dir' ? parseDIR(content, path).data : parsePMM(content, path);
      expect(parsed.interpretations.map((direction) => direction.Dgeo)).toEqual(
        realFile.declinations,
      );
      expect(parsed.interpretations.map((direction) => direction.Igeo)).toEqual(
        realFile.inclinations,
      );
      expectParity(conglomeratesTest(parsed), realFile.pmagpy);
    },
  );

  it.each(oracle.synthetic.map((testCase) => [testCase.name, testCase] as const))(
    '%s',
    (_name, testCase) => {
      const data = toDirData(testCase.declinations, testCase.inclinations);
      expectParity(conglomeratesTest(data), testCase.pmagpy);
    },
  );

  it.each(oracle.fan.map((testCase) => [testCase.name, testCase] as const))(
    '%s',
    (name, testCase) => {
      const data = fanDirData(sizeOf(name), testCase.fanDeclination);
      expectParity(conglomeratesTest(data), testCase.pmagpy);
    },
  );

  it('covers pass, 95% rejection and 99% rejection for every N from 5 to 40', () => {
    const verdictsBySize = new Map<number, Set<number>>();
    oracle.fan.forEach((testCase) => {
      const verdicts = verdictsBySize.get(sizeOf(testCase.name)) ?? new Set<number>();
      verdicts.add(testCase.pmagpy.result!.verdictLines.slice(-1)[0]);
      verdictsBySize.set(sizeOf(testCase.name), verdicts);
    });
    for (let size = 5; size <= 40; size++) {
      expect(Array.from(verdictsBySize.get(size)!).sort()).toEqual([0, 1, 2]);
    }
  });

  // Both sides compare strictly (R < Ro, R > Ro), so R == Ro_95 yields no verdict at all.
  it.each(oracle.exactThreshold.map((testCase) => [testCase.name, testCase] as const))(
    '%s exactly: same strict comparison on both sides',
    (_name, testCase) => {
      const result = conglomeratesTest(toDirData(testCase.declinations, testCase.inclinations));
      expect(result!.R).toBe(testCase.exactTarget);
      expect(testCase.pmagpy.result!.R).toBe(testCase.exactTarget);
      expectParity(result, testCase.pmagpy);
    },
  );
});

describe('Ro critical values against the exact distribution of R for uniform directions', () => {
  const criticalValues = (size: number) => {
    const result = conglomeratesTest(toDirData(new Array(size).fill(0), new Array(size).fill(0)));
    return [result!.Ro_95, result!.Ro_99];
  };

  // Watson's two-decimal table (N = 5..20) sits within 0.009 (95%) and 0.023 (99%) of the exact quantiles.
  it.each(oracle.uniformResultantQuantiles.filter((quantile) => quantile.n <= 20))(
    'table value for N=$n',
    ({ n, quantile95, quantile99 }) => {
      const [ro95, ro99] = criticalValues(n);
      expect(Math.abs(ro95 - quantile95)).toBeLessThan(0.01);
      expect(Math.abs(ro99 - quantile99)).toBeLessThan(0.025);
    },
  );

  // Above 20 both sides (and the thesis, section 1.4.1) use sqrt(chi2_3 * N / 3), which is conservative.
  it.each(oracle.uniformResultantQuantiles.filter((quantile) => quantile.n > 20))(
    'large-N formula for N=$n exceeds the exact quantile',
    ({ n, quantile95, quantile99 }) => {
      const [ro95, ro99] = criticalValues(n);
      expect(ro95).toBeCloseTo(Math.sqrt((7.815 * n) / 3), 12);
      expect(ro95 - quantile95).toBeGreaterThan(0.04);
      expect(ro95 - quantile95).toBeLessThan(0.06);
      expect(ro99 - quantile99).toBeGreaterThan(0.11);
      expect(ro99 - quantile99).toBeLessThan(0.14);
    },
  );
});
