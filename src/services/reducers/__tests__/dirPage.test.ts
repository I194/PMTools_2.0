import dirPageReducer, {
  setHiddenDirectionsIDs,
  addHiddenDirectionsIDs,
  removeHiddenDirectionsIDs,
  setCenteredByMean,
  setCutoffEnabled,
  setCutoffAngle,
} from '../dirPage';

const initialState = dirPageReducer(undefined, { type: '@@INIT' });

describe('dirPage reducer — hidden directions', () => {
  it('removeHiddenDirectionsIDs removes only the ids in the payload, keeping the rest', () => {
    const withHidden = dirPageReducer(initialState, setHiddenDirectionsIDs([1, 2, 3, 4]));
    const next = dirPageReducer(withHidden, removeHiddenDirectionsIDs([2, 4]));
    expect(next.hiddenDirectionsIDs).toEqual([1, 3]);
  });

  it('removeHiddenDirectionsIDs leaves manually-hidden ids that are not in the payload', () => {
    // This is the cutoff re-sync invariant: dropping cutoff outliers must not
    // wipe directions the user hid by hand.
    const manuallyHidden = dirPageReducer(initialState, setHiddenDirectionsIDs([10, 20]));
    const next = dirPageReducer(manuallyHidden, removeHiddenDirectionsIDs([99]));
    expect(next.hiddenDirectionsIDs).toEqual([10, 20]);
  });

  it('addHiddenDirectionsIDs unions without introducing duplicates', () => {
    const first = dirPageReducer(initialState, addHiddenDirectionsIDs([1, 2]));
    const second = dirPageReducer(first, addHiddenDirectionsIDs([2, 3]));
    expect([...second.hiddenDirectionsIDs].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });
});

describe('dirPage reducer — center-by-mean / cutoff view state', () => {
  it('setCenteredByMean toggles the flag', () => {
    expect(dirPageReducer(initialState, setCenteredByMean(true)).centeredByMean).toBe(true);
    const on = dirPageReducer(initialState, setCenteredByMean(true));
    expect(dirPageReducer(on, setCenteredByMean(false)).centeredByMean).toBe(false);
  });

  it('setCutoffEnabled toggles the flag', () => {
    expect(dirPageReducer(initialState, setCutoffEnabled(true)).cutoffEnabled).toBe(true);
  });

  it('setCutoffAngle updates the angle', () => {
    expect(dirPageReducer(initialState, setCutoffAngle(30)).cutoffAngle).toBe(30);
  });

  it('defaults: centeredByMean false, cutoffEnabled false, cutoffAngle 45', () => {
    expect(initialState.centeredByMean).toBe(false);
    expect(initialState.cutoffEnabled).toBe(false);
    expect(initialState.cutoffAngle).toBe(45);
  });
});
