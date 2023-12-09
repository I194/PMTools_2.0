import { useAppSelector } from './hooks';

export const pcaMiddleware = () => {

  return (store: { dispatch: any; getState: () => any }) => {

    return (next: (arg0: any) => void) =>

      (action: { type: any; payload: any }) => {

        const { dispatch, getState } = store;
        const { type, payload } = action;
        // if (type === "pcaPage/setStatisticsMode") {
        //   const { selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer);
        //   if (!selectedStepsIDs) dispatch(showStepsInput(true));
        // };
        next(action);
      };
  };
};

