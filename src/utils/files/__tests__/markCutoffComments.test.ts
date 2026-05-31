import markCutoffComments, { CUTOFF_COMMENT_MARKER } from '../transforms/markCutoffComments';
import Direction from '../../graphs/classes/Direction';
import { IDirData } from '../../GlobalTypes';

type Interpretation = IDirData['interpretations'][number];

const makeInterpretation = (overrides: Partial<Interpretation>): Interpretation => ({
  id: 1,
  label: 'S1',
  code: '',
  stepRange: '0-100',
  stepCount: 5,
  Dgeo: 0,
  Igeo: 0,
  Dstrat: 0,
  Istrat: 0,
  MADgeo: 2,
  Kgeo: 50,
  MADstrat: 2,
  Kstrat: 50,
  comment: '',
  demagType: 'thermal',
  ...overrides,
});

const makeData = (interpretations: Interpretation[]): IDirData => ({
  name: 'test',
  interpretations,
  format: 'DIR',
  created: '',
});

// Mean at the centre of the stereonet: a direction at inclination I sits
// (90 - I)° away from it. So Igeo 80 → 10° (kept), Igeo 40 → 50° (rejected).
const centreMean = new Direction(0, 90, 1);

describe('markCutoffComments', () => {
  it('marks only directions beyond the cutoff angle from the mean', () => {
    const data = makeData([
      makeInterpretation({ id: 1, Dgeo: 0, Igeo: 80 }), // 10° from mean — kept
      makeInterpretation({ id: 2, Dgeo: 0, Igeo: 40 }), // 50° from mean — rejected
    ]);

    const [kept, rejected] = markCutoffComments(data, centreMean, 'geographic', 45).interpretations;

    expect(kept.comment).toBe('');
    expect(rejected.comment).toBe(CUTOFF_COMMENT_MARKER);
  });

  it('appends to an existing comment without overwriting it', () => {
    const data = makeData([makeInterpretation({ Dgeo: 0, Igeo: 40, comment: 'outlier' })]);

    const [rejected] = markCutoffComments(data, centreMean, 'geographic', 45).interpretations;

    expect(rejected.comment).toBe(`outlier; ${CUTOFF_COMMENT_MARKER}`);
  });

  it('is idempotent — does not add a duplicate CUT45 marker', () => {
    const data = makeData([makeInterpretation({ Dgeo: 0, Igeo: 40 })]);

    const once = markCutoffComments(data, centreMean, 'geographic', 45);
    const twice = markCutoffComments(once, centreMean, 'geographic', 45);

    expect(twice.interpretations[0].comment).toBe(CUTOFF_COMMENT_MARKER);
  });

  it('tests stratigraphic coordinates when reference is stratigraphic', () => {
    const data = makeData([
      // geographic coords are inside the cutoff, stratigraphic coords are outside
      makeInterpretation({ id: 1, Dgeo: 0, Igeo: 85, Dstrat: 0, Istrat: 30 }),
    ]);

    const geographicResult = markCutoffComments(data, centreMean, 'geographic', 45);
    const stratigraphicResult = markCutoffComments(data, centreMean, 'stratigraphic', 45);

    expect(geographicResult.interpretations[0].comment).toBe('');
    expect(stratigraphicResult.interpretations[0].comment).toBe(CUTOFF_COMMENT_MARKER);
  });

  it('does not mutate the input dataset', () => {
    const data = makeData([makeInterpretation({ Dgeo: 0, Igeo: 40 })]);

    const result = markCutoffComments(data, centreMean, 'geographic', 45);

    expect(data.interpretations[0].comment).toBe('');
    expect(result).not.toBe(data);
  });
});
