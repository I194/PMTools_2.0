import React from 'react';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import Graphs from '../Graphs';
import { setupStore, AppStore } from '../../../services/store/store';
import {
  addInterpretation,
  setReference,
  setCutoffEnabled,
  setHiddenDirectionsIDs,
} from '../../../services/reducers/dirPage';
import { IDirData } from '../../../utils/GlobalTypes';

// The real stereonet is a heavy SVG component irrelevant to the cutoff-hiding
// effect under test — stub it. Same for the graph-settings/window-size hooks.
// (babel-jest hoists these jest.mock calls above the imports above.)
jest.mock('../../../components/AppGraphs', () => ({
  StereoGraphDIR: () => null,
}));
jest.mock('../../../utils/GlobalHooks', () => ({
  useDIRGraphSettings: () => ({ menuItems: [], settings: {} }),
  useWindowSize: () => [1000, 800],
}));

type Interpretation = IDirData['interpretations'][number];

const makeInterpretation = (overrides: Partial<Interpretation>): Interpretation => ({
  id: 1,
  label: 'S',
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

// Mean at the stereonet centre (0, 90): a direction sits (90 - inclination)°
// from it. So with a 45° cutoff, inclination < 45° is an outlier.
//  - direction 1: kept in geographic (Igeo 80 → 10°), cut in stratigraphic (Istrat 10 → 80°)
//  - direction 2: cut in geographic (Igeo 10 → 80°), kept in stratigraphic (Istrat 80 → 10°)
const data: IDirData = {
  name: 'file.dir',
  format: 'DIR',
  created: '',
  interpretations: [
    makeInterpretation({ id: 1, Dgeo: 0, Igeo: 80, Dstrat: 0, Istrat: 10 }),
    makeInterpretation({ id: 2, Dgeo: 0, Igeo: 10, Dstrat: 0, Istrat: 80 }),
  ],
};

const centreMean = { declination: 0, inclination: 90, length: 1 };
const interpretation = {
  uuid: 'u1',
  parentFile: 'file.dir',
  label: 'mean',
  code: 'fisher',
  rawData: {
    code: 'fisher',
    mean: {
      geographic: { direction: centreMean, MAD: 3 },
      stratigraphic: { direction: centreMean, MAD: 3 },
    },
  },
} as never;

const renderGraphs = (store: AppStore) =>
  render(
    <Provider store={store}>
      <Graphs dataToShow={data} />
    </Provider>,
  );

const hidden = (store: AppStore) => [...store.getState().dirPageReducer.hiddenDirectionsIDs].sort();

describe('DIR cutoff hiding re-syncs when the outlier set changes', () => {
  it('flipping Geo↔Strat with the cutoff on hides the new reference outliers, not the stale ones', () => {
    const store = setupStore();
    store.dispatch(addInterpretation({ interpretation }));
    store.dispatch(setReference('geographic'));
    store.dispatch(setCutoffEnabled(true));

    renderGraphs(store);
    // geographic: direction 2 is the outlier
    expect(hidden(store)).toEqual([2]);

    act(() => {
      store.dispatch(setReference('stratigraphic'));
    });
    // stratigraphic: direction 1 is the outlier; the stale id 2 must be released
    expect(hidden(store)).toEqual([1]);
  });

  it('disabling the cutoff preserves directions hidden manually', () => {
    const store = setupStore();
    store.dispatch(addInterpretation({ interpretation }));
    store.dispatch(setReference('geographic'));
    // user manually hides direction 1 (which the cutoff would keep)
    store.dispatch(setHiddenDirectionsIDs([1]));

    renderGraphs(store);

    act(() => {
      store.dispatch(setCutoffEnabled(true));
    });
    // manual hide (1) + cutoff outlier (2)
    expect(hidden(store)).toEqual([1, 2]);

    act(() => {
      store.dispatch(setCutoffEnabled(false));
    });
    // cutoff outlier released, manual hide kept
    expect(hidden(store)).toEqual([1]);
  });

  it('keeps a manual hide that is ALSO a cutoff outlier when the cutoff is turned off', () => {
    const store = setupStore();
    store.dispatch(addInterpretation({ interpretation }));
    store.dispatch(setReference('stratigraphic'));
    // id 1 is the stratigraphic outlier; the user also hides it by hand, so the
    // manual hide and the cutoff overlap on the same id.
    store.dispatch(setHiddenDirectionsIDs([1]));

    renderGraphs(store);

    act(() => {
      store.dispatch(setCutoffEnabled(true));
    });
    // already hidden manually; the cutoff adds nothing new
    expect(hidden(store)).toEqual([1]);

    act(() => {
      store.dispatch(setCutoffEnabled(false));
    });
    // the manual hide survives — the cutoff never "owned" id 1
    expect(hidden(store)).toEqual([1]);
  });
});
