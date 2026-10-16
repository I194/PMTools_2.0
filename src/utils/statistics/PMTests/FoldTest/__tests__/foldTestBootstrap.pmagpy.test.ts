import React from 'react';
import { readFileSync } from 'fs';
import { join } from 'path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Direction from '../../../../graphs/classes/Direction';
import parseDIR from '../../../../files/parsers/parserDIR';
import parsePMM from '../../../../files/parsers/parserPMM';
import { FoldTestResult, IDirData } from '../../../../GlobalTypes';
import { fixturePath } from '../../../../../test-utils/referenceFixtures';
import { createSeededRandom } from '../../../../../test-utils/seededRandom';
import FoldTestContainer from '../../../../../components/AppLogic/ToolsDIR/PMTests/FoldTestContainer';
import foldTestBootstrap, { CoordsWithBeddingPars, findBed, unfold } from '../foldTestBootstrap';

// PB-11: bootstrap fold test (Tauxe & Watson 1994) against PmagPy 4.3.14 primitives.
// Oracle generator: scripts/oracle_pb11_fold_test.py (rebuilds the ipmag.bootstrap_fold_test loop,
// which only prints/plots, from pmag.pseudo + pmag.dotilt_V + pmag.doprinc on the -50..150 % grid).
// foldTestClassic.ts (McFadden & Jones 1981) is an empty stub with no importer: nothing to verify.
// The single-fixture tau1 parity of SCI-01 lives in foldTestUnfoldAxis.test.ts and is not repeated.

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: {} }),
}));
// The SVG graph needs the Redux store; the stub keeps the result the panel hands it.
const mockGraphProps: { data?: FoldTestResult } = {};
jest.mock(
  '../../../../../components/AppGraphs/FoldTestGraph/FoldTestGraph',
  () => (props: { data: FoldTestResult }) => {
    mockGraphProps.data = props.data;
    return null;
  },
);

type DirectionRow = [number, number, number, number];
type DeterministicCase = {
  name: string;
  directions: DirectionRow[];
  pmagpyBeddings: Array<[number, number] | null>;
  tau1Curve: number[];
  bestUntilt: number;
  trueBeddings?: Array<[number, number]>;
};
type BootstrapCase = {
  name: string;
  directions: DirectionRow[];
  numberOfSimulations: number;
  replayUntilts: number[];
  independentSortedUntilts: number[];
  independentBounds95: [number, number];
};

const oracle = JSON.parse(
  readFileSync(fixturePath('part_b', 'pb11_fold_test.pmagpy.json'), 'utf8'),
) as {
  seed: number;
  coarseGrid: number[];
  realFiles: DeterministicCase[];
  synthetic: DeterministicCase;
  bootstrap: BootstrapCase[];
};

const repositoryRoot = join(__dirname, '../../../../../..');

/** Reads a committed file through the parser the DIR page uses for its extension. */
const parseRealFile = (relativePath: string): IDirData => {
  const text = readFileSync(join(repositoryRoot, relativePath), 'utf8');
  const name = relativePath.split('/').pop()!;
  return relativePath.endsWith('.pmm') ? parsePMM(text, name) : parseDIR(text, name).data;
};

const toDirData = (name: string, directions: DirectionRow[]): IDirData => ({
  name,
  format: 'DIR',
  created: '',
  interpretations: directions.map(([Dgeo, Igeo, Dstrat, Istrat], index) => ({
    id: index + 1,
    label: `S${index + 1}`,
    code: '',
    stepRange: '',
    stepCount: 0,
    Dgeo,
    Igeo,
    Dstrat,
    Istrat,
    MADgeo: 0,
    Kgeo: 0,
    MADstrat: 0,
    Kstrat: 0,
    comment: '',
    demagType: undefined,
  })),
});

/** The production setup of foldTestBootstrap: cartesian geographic vector + bedding from `findBed`. */
const toVectorsWithBedding = (directions: DirectionRow[]): CoordsWithBeddingPars[] =>
  directions.map(([Dgeo, Igeo, Dstrat, Istrat]) => {
    const geographic = new Direction(Dgeo, Igeo, 1).toCartesian();
    const bedding = findBed(geographic, new Direction(Dstrat, Istrat, 1).toCartesian());
    return { coordinates: geographic, beddingAzimuth: bedding.azimuth, beddingDip: bedding.dip };
  });

const azimuthDifference = (left: number, right: number) =>
  Math.abs(((((left - right) % 360) + 540) % 360) - 180);

/** Runs foldTestBootstrap to completion with Math.random replaced by the seeded generator. */
const runSeededBootstrap = (data: IDirData, numberOfSimulations: number) => {
  const random = createSeededRandom(oracle.seed);
  const randomSpy = jest.spyOn(Math, 'random').mockImplementation(random.next);
  let result: FoldTestResult = { untilts: [], savedBootstraps: [] };
  foldTestBootstrap(data, numberOfSimulations, (value) => {
    result = value as FoldTestResult;
  });
  jest.runAllTimers();
  const numberOfRandomCalls = randomSpy.mock.calls.length;
  randomSpy.mockRestore();
  return { result, numberOfRandomCalls };
};

/** Mounts the live fold-test panel, presses Run and returns the two displayed intervals. */
const runPanelAndReadIntervals = (data: IDirData) => {
  const random = createSeededRandom(oracle.seed);
  const randomSpy = jest.spyOn(Math, 'random').mockImplementation(random.next);
  render(React.createElement(FoldTestContainer, { dataToAnalyze: data }));
  fireEvent.click(screen.getByText('pmtests.controls.run'));
  act(() => {
    jest.runAllTimers();
  });
  randomSpy.mockRestore();
  // Document order: the 95 % bounds row ('pmtests.foldTest.first'), then the full range row.
  const [bounds95, range] = screen
    .getAllByText(/^-?\d+ — -?\d+$/)
    .map((element) => element.textContent!.split(' — ').map(Number));
  // The panel sorts the untilts in place (getCDF) before handing them to the graph.
  return { bounds95, range, sortedUntilts: [...mockGraphProps.data!.untilts] };
};

/** FoldTestContainer's bounds: sorted untilts at int(0.025 n) and int(0.975 n), as ipmag.py:1047-1048. */
const bounds95Of = (sortedUntilts: number[]) => [
  sortedUntilts[Math.floor(0.025 * sortedUntilts.length)],
  sortedUntilts[Math.floor(0.975 * sortedUntilts.length)],
];

const sortedCopy = (values: number[]) => [...values].sort((left, right) => left - right);

/**
 * Ranks of the 1000-draw independent sample that bracket the quantile `probability` estimated from
 * `simulations` PMTools draws: 3 sigma of the difference of two binomial proportions.
 */
const independentRankBand = (probability: number, simulations: number, independentSize: number) => {
  const spread =
    3 * Math.sqrt(probability * (1 - probability) * (1 / simulations + 1 / independentSize));
  return [
    Math.max(0, Math.floor((probability - spread) * independentSize)),
    Math.min(independentSize - 1, Math.ceil((probability + spread) * independentSize)),
  ];
};

/** Two-sample Kolmogorov-Smirnov statistic of two sorted integer samples. */
const kolmogorovSmirnovStatistic = (left: number[], right: number[]) => {
  const fractionAtOrBelow = (sorted: number[], value: number) =>
    sorted.filter((element) => element <= value).length / sorted.length;
  return Math.max(
    ...[...left, ...right].map((value) =>
      Math.abs(fractionAtOrBelow(left, value) - fractionAtOrBelow(right, value)),
    ),
  );
};

// Pure rotations and a 3x3 eigenvalue on unrounded doubles: only float noise separates the sides.
const BEDDING_TOLERANCE_DEGREES = 1e-9;
const TAU1_TOLERANCE = 1e-12;

// exampleDIR.pmm has identical geographic and stratigraphic columns (no tilt): its tau1 curve is flat
// and both sides return the grid edge -50 % by first-maximum tie-break, a degenerate agreement.
const realFileCases = oracle.realFiles.map((fileCase) => [fileCase.name, fileCase] as const);

describe('findBed and unfold on real files against pmag.dotilt_V + pmag.doprinc', () => {
  describe.each(realFileCases)('%s', (relativePath, fileCase) => {
    const vectors = toVectorsWithBedding(fileCase.directions);
    const { index, taus } = unfold(vectors, 0);

    it('reads the same geographic and stratigraphic columns as the oracle', () => {
      const parsed = parseRealFile(relativePath).interpretations.map(
        ({ Dgeo, Igeo, Dstrat, Istrat }) => [Dgeo, Igeo, Dstrat, Istrat],
      );
      expect(parsed).toEqual(fileCase.directions);
    });

    it('recovers the bedding PmagPy recovers (zero dip where geographic equals stratigraphic)', () => {
      const rows = fileCase.pmagpyBeddings.map((pmagpyBedding, row) => ({
        pmagpyBedding,
        vector: vectors[row],
      }));
      const untilted = rows.filter(({ pmagpyBedding }) => pmagpyBedding === null);
      const tilted = rows.filter(({ pmagpyBedding }) => pmagpyBedding !== null);
      expect(untilted.map(({ vector }) => vector.beddingDip)).toEqual(untilted.map(() => 0));
      tilted.forEach(({ pmagpyBedding, vector }) => {
        expect(azimuthDifference(vector.beddingAzimuth, pmagpyBedding![0])).toBeLessThan(
          BEDDING_TOLERANCE_DEGREES,
        );
        expect(Math.abs(vector.beddingDip - pmagpyBedding![1])).toBeLessThan(
          BEDDING_TOLERANCE_DEGREES,
        );
      });
    });

    it('matches the PmagPy tau1 curve on the 10 % grid', () => {
      expect(taus.map((point) => point.x)).toEqual(oracle.coarseGrid);
      taus.forEach((point, gridIndex) => {
        expect(Math.abs(point.y - fileCase.tau1Curve[gridIndex])).toBeLessThan(TAU1_TOLERANCE);
      });
    });

    it('finds the PmagPy best untilting of the 1 % grid', () => {
      expect(index).toBe(fileCase.bestUntilt);
    });
  });

  it('recovers the true two-limb beddings of two_limb_fold.dir up to the file rounding', () => {
    const twoLimbFold = oracle.realFiles.find((fileCase) => fileCase.trueBeddings)!;
    const vectors = toVectorsWithBedding(twoLimbFold.directions);
    // Each column is rounded to 0.1 degree (+-0.05 on both ends of a 15-45 degree arc): observed <= 0.21.
    twoLimbFold.trueBeddings!.forEach(([dipDirection, dip], row) => {
      expect(azimuthDifference(vectors[row].beddingAzimuth, dipDirection)).toBeLessThan(0.3);
      expect(Math.abs(vectors[row].beddingDip - dip)).toBeLessThan(0.3);
    });
  });
});

describe('findBed and unfold on a synthetic fold with known beddings (unrounded)', () => {
  const synthetic = oracle.synthetic;
  const vectors = toVectorsWithBedding(synthetic.directions);
  const { index, taus } = unfold(vectors, 0);

  it.each(synthetic.trueBeddings!.map((bedding, row) => [row, ...bedding]))(
    'row %i: recovers dip direction %f and dip %f',
    (row, dipDirection, dip) => {
      expect(azimuthDifference(vectors[row].beddingAzimuth, dipDirection)).toBeLessThan(
        BEDDING_TOLERANCE_DEGREES,
      );
      expect(Math.abs(vectors[row].beddingDip - dip)).toBeLessThan(BEDDING_TOLERANCE_DEGREES);
    },
  );

  it('matches the PmagPy tau1 curve and best untilting', () => {
    taus.forEach((point, gridIndex) => {
      expect(Math.abs(point.y - synthetic.tau1Curve[gridIndex])).toBeLessThan(TAU1_TOLERANCE);
    });
    expect(index).toBe(synthetic.bestUntilt);
  });
});

const bootstrapCases = oracle.bootstrap.map(
  (bootstrapCase) => [bootstrapCase.name, bootstrapCase] as const,
);
const toBootstrapData = (bootstrapCase: BootstrapCase) =>
  bootstrapCase.name.includes('/')
    ? parseRealFile(bootstrapCase.name)
    : toDirData(bootstrapCase.name, bootstrapCase.directions);

// The DIR page always runs 1000 draws; direct runs use the first 200 of the same seeded stream
// to keep this file under 10 s, and the panel test below covers all 1000 on one data set.
const SIMULATIONS_IN_DIRECT_RUN = 200;

describe('bootstrap distribution against the PmagPy bootstrap loop', () => {
  describe.each(bootstrapCases)('%s', (name, bootstrapCase) => {
    let run: ReturnType<typeof runSeededBootstrap>;
    beforeAll(() => {
      jest.useFakeTimers();
      run = runSeededBootstrap(toBootstrapData(bootstrapCase), SIMULATIONS_IN_DIRECT_RUN);
      jest.useRealTimers();
    });

    it('replays the same resamples to the same best untilting, draw by draw', () => {
      expect(run.numberOfRandomCalls).toBe(
        SIMULATIONS_IN_DIRECT_RUN * bootstrapCase.directions.length,
      );
      expect(run.result.untilts).toEqual(
        bootstrapCase.replayUntilts.slice(0, SIMULATIONS_IN_DIRECT_RUN),
      );
    });

    it('gives 95 % bounds inside the sampling band of an independent pmag.pseudo bootstrap', () => {
      const [lower, upper] = bounds95Of(sortedCopy(run.result.untilts));
      const independent = bootstrapCase.independentSortedUntilts;
      const [lowerFrom, lowerTo] = independentRankBand(0.025, SIMULATIONS_IN_DIRECT_RUN, independent.length); // prettier-ignore
      const [upperFrom, upperTo] = independentRankBand(0.975, SIMULATIONS_IN_DIRECT_RUN, independent.length); // prettier-ignore
      expect(lower).toBeGreaterThanOrEqual(independent[lowerFrom]);
      expect(lower).toBeLessThanOrEqual(independent[lowerTo]);
      expect(upper).toBeGreaterThanOrEqual(independent[upperFrom]);
      expect(upper).toBeLessThanOrEqual(independent[upperTo]);
    });

    it('has a distribution the two-sample KS test does not tell apart (alpha 0.001)', () => {
      const independentSize = bootstrapCase.independentSortedUntilts.length;
      const statistic = kolmogorovSmirnovStatistic(
        sortedCopy(run.result.untilts),
        bootstrapCase.independentSortedUntilts,
      );
      // c(0.001) * sqrt((n + m) / (n m))
      expect(statistic).toBeLessThan(
        1.949 *
          Math.sqrt(
            (SIMULATIONS_IN_DIRECT_RUN + independentSize) /
              (SIMULATIONS_IN_DIRECT_RUN * independentSize),
          ),
      );
    });
  });

  describe('live fold-test panel, 1000 draws as the DIR page runs it (late syn-folding set)', () => {
    const synFolding = oracle.bootstrap.find((bootstrapCase) => !bootstrapCase.name.includes('/'))!;
    const sortedReplay = sortedCopy(synFolding.replayUntilts);
    let panel: ReturnType<typeof runPanelAndReadIntervals>;
    beforeAll(() => {
      jest.useFakeTimers();
      panel = runPanelAndReadIntervals(toBootstrapData(synFolding));
      jest.useRealTimers();
    });

    it('hands the graph the PmagPy best untilting of all 1000 replayed draws', () => {
      expect(panel.sortedUntilts).toEqual(sortedReplay);
    });

    it('displays the PmagPy upper 95 % bound and the full range of the draws', () => {
      expect(panel.bounds95[1]).toBe(bounds95Of(sortedReplay)[1]);
      expect(panel.range).toEqual([sortedReplay[0], sortedReplay[sortedReplay.length - 1]]);
    });

    describe('recorded mismatches (Part B, not fixed)', () => {
      it('MISMATCH PB-11-1: a lower 95 % bound of exactly 0 % is displayed as -50 % (`|| -50` on a falsy 0)', () => {
        expect(bounds95Of(sortedReplay)[0]).toBe(0);
        expect(panel.bounds95[0]).toBe(-50);
      });
    });
  });
});
