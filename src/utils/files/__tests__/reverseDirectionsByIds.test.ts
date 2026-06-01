import reverseDirectionsByIds from '../transforms/reverseDirectionsByIds';
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

describe('reverseDirectionsByIds', () => {
  it('flips polarity (D+180, I negated) for listed ids in both coordinate sets', () => {
    const data = makeData([
      makeInterpretation({ id: 1, Dgeo: 30, Igeo: 40, Dstrat: 50, Istrat: 60 }),
    ]);

    const [reversed] = reverseDirectionsByIds(data, [1]).interpretations;

    expect(reversed.Dgeo).toBe(210);
    expect(reversed.Igeo).toBe(-40);
    expect(reversed.Dstrat).toBe(230);
    expect(reversed.Istrat).toBe(-60);
  });

  it('leaves directions not in the list untouched', () => {
    const data = makeData([
      makeInterpretation({ id: 1, Dgeo: 30, Igeo: 40 }),
      makeInterpretation({ id: 2, Dgeo: 100, Igeo: 10 }),
    ]);

    const [first, second] = reverseDirectionsByIds(data, [2]).interpretations;

    expect(first.Dgeo).toBe(30);
    expect(first.Igeo).toBe(40);
    expect(second.Dgeo).toBe(280);
    expect(second.Igeo).toBe(-10);
  });

  it('returns the same dataset reference when no ids are given', () => {
    const data = makeData([makeInterpretation({ id: 1 })]);
    expect(reverseDirectionsByIds(data, [])).toBe(data);
  });

  it('does not mutate the input', () => {
    const data = makeData([makeInterpretation({ id: 1, Dgeo: 30, Igeo: 40 })]);
    reverseDirectionsByIds(data, [1]);
    expect(data.interpretations[0].Dgeo).toBe(30);
    expect(data.interpretations[0].Igeo).toBe(40);
  });
});
