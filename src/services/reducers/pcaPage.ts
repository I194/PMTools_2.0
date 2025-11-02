import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPmdData, IDirData, GraphPMD } from "../../utils/GlobalTypes";
import {
  RawStatisticsPCA,
  StatisitcsInterpretationFromPCA,
} from "../../utils/GlobalTypes";
import {
  Projection,
  Reference,
  StatisticsModePCA,
} from "../../utils/graphs/types";

interface IInitialState {
  reference: Reference;
  projection: Projection;
  selectedStepsIDs: Array<number> | null;
  hiddenStepsIDs: Array<number>;
  statisticsMode: StatisticsModePCA;
  isCommentsInputVisible: boolean;
  currentInterpretation: StatisitcsInterpretationFromPCA | null;
  currentFileInterpretations: Array<StatisitcsInterpretationFromPCA>;
  allInterpretations: Array<StatisitcsInterpretationFromPCA>;
  outputFilename: string;
  showStepsInput: boolean;
  largeGraph: GraphPMD;
  labelModeIsNumeric: boolean;
}

const initialState: IInitialState = {
  reference: "geographic",
  projection: { y: "W, UP", x: "N, N" },
  selectedStepsIDs: null,
  hiddenStepsIDs: [],
  statisticsMode: null,
  isCommentsInputVisible: true,
  currentInterpretation: null,
  currentFileInterpretations: [],
  allInterpretations: [],
  outputFilename: "",
  showStepsInput: false,
  largeGraph: 0,
  labelModeIsNumeric: false,
};

const pcaPage = createSlice({
  name: "pcaPage",
  initialState,
  reducers: {
    // Главная панель управления
    setReference(state, action: PayloadAction<Reference>) {
      state.reference = action.payload;
      localStorage.setItem('pcaPage_reference', JSON.stringify(state.reference));
    },
    setStatisticsMode(state, action) {
      state.statisticsMode = action.payload;
    },
    setShowStepsInput(state, action) {
      state.showStepsInput = action.payload;
    },
    setSelectedStepsIDs(state, action) {
      state.selectedStepsIDs = action.payload;
    },
    setHiddenStepsIDs(state, action: { payload: Array<number> }) {
      state.hiddenStepsIDs = action.payload;
    },
    addHiddenStepsIDs(state, action: { payload: Array<number> }) {
      const updatedHiddenStepsIDs = [
        ...new Set([...state.hiddenStepsIDs, ...action.payload]),
      ];
      state.hiddenStepsIDs = updatedHiddenStepsIDs;
    },
    toggleCommentsInput(state) {
      state.isCommentsInputVisible = !state.isCommentsInputVisible;
      localStorage.setItem('pcaPage_isCommentsInputVisible', JSON.stringify(state.isCommentsInputVisible));
    },
    setCommentsInput(state, action: { payload: boolean }) {
      state.isCommentsInputVisible = action.payload;
      localStorage.setItem('pcaPage_isCommentsInputVisible', JSON.stringify(state.isCommentsInputVisible));
    },
    // Label mode (numeric vs filename)
    toggleLabelMode(state) {
      state.labelModeIsNumeric = !state.labelModeIsNumeric;
      localStorage.setItem('pcaPage_isNumericLabel', JSON.stringify(state.labelModeIsNumeric));
    },
    setLabelMode(state, action: { payload: boolean }) {
      state.labelModeIsNumeric = action.payload;
      localStorage.setItem('pcaPage_isNumericLabel', JSON.stringify(state.labelModeIsNumeric));
    },
    // Панели управления на графикаъ
    setProjection(state, action: PayloadAction<Projection>) {
      state.projection = action.payload;
      localStorage.setItem('pcaPage_projection', JSON.stringify(state.projection));
    },
    // Дополнительная панель управления для малых экранов
    setLargeGraph(state, action: PayloadAction<GraphPMD>) {
      state.largeGraph = action.payload;
    },
    // Работа с результатами статистических методов обработки данных магнитных чисток
    addInterpretation(state, action: PayloadAction<StatisitcsInterpretationFromPCA>) {
      state.currentInterpretation = action.payload;
      state.currentFileInterpretations.push(action.payload);
      state.allInterpretations.push(action.payload);
      state.selectedStepsIDs = null;
      localStorage.setItem('pcaPage_allInterpretations', JSON.stringify(state.allInterpretations));
      localStorage.setItem('pcaPage_currentInterpretation', JSON.stringify(state.currentInterpretation.uuid));
    },
    deleteInterpretation(state, action: PayloadAction<string>) {
      const interpretationUUID = action.payload;
      const updatedInterpretations = state.allInterpretations.filter(
        (interpretation) => interpretation.uuid !== interpretationUUID
      );
      state.allInterpretations = updatedInterpretations;
      localStorage.setItem('pcaPage_allInterpretations', JSON.stringify(state.allInterpretations));
    },
    deleteInterepretationByParentFile(state, action: PayloadAction<string>) {
      const parentFileName = action.payload;
      const updatedInterpretations = state.allInterpretations.filter(
        (interpretation) => interpretation.parentFile !== parentFileName
      );
      state.allInterpretations = updatedInterpretations;
      localStorage.setItem('pcaPage_allInterpretations', JSON.stringify(state.allInterpretations));
    },
    setAllInterpretations(state, action: PayloadAction<StatisitcsInterpretationFromPCA[]>) {
      state.allInterpretations = action.payload;
      localStorage.setItem('pcaPage_allInterpretations', JSON.stringify(state.allInterpretations));
    },
    deleteAllInterpretations(state) {
      state.allInterpretations = [];
      state.currentFileInterpretations = [];
      state.currentInterpretation = null;
      localStorage.setItem('pcaPage_allInterpretations', JSON.stringify(state.allInterpretations));
      localStorage.setItem('pcaPage_currentInterpretation', JSON.stringify(''));
    },
    updateCurrentFileInterpretations(state, action: PayloadAction<string>) {
      const fileName = action.payload;
      state.currentFileInterpretations = state.allInterpretations.filter(
        (interpretation) => interpretation.parentFile === fileName
      );
    },
    setLastInterpretationAsCurrent(state) {
      if (!state.currentFileInterpretations.length) {
        state.currentInterpretation = null;
        return;
      }
      state.currentInterpretation = state.currentFileInterpretations[state.currentFileInterpretations.length - 1];
      localStorage.setItem('pcaPage_currentInterpretation', JSON.stringify(state.currentInterpretation.uuid));
    },
    setCurrentInterpretationByUUID(state, action: PayloadAction<{uuid: string}>) {
      const { uuid } = action.payload;
      const interpretationToSet = state.allInterpretations.find(interpretation => interpretation.uuid === uuid);
      if (!interpretationToSet) {
        return;
      }
      state.currentInterpretation = interpretationToSet;
      localStorage.setItem('pcaPage_currentInterpretation', JSON.stringify(state.currentInterpretation.uuid));
    },
    setNextOrPrevInterpretationAsCurrent(state, action: PayloadAction<{changeDirection: 'up' | 'down'}>) {
      if (!state.currentFileInterpretations.length || !state.currentInterpretation) {
        state.currentInterpretation = null;
        return;
      }
      const currentInterpretationIndex = state.currentFileInterpretations.findIndex(
        (interpretation) => (
          interpretation.uuid === state.currentInterpretation?.uuid
        )
      )

      const { changeDirection } = action.payload;

      const toNext = changeDirection === 'up' ? 1 : -1;

      const totalInterpretations = state.currentFileInterpretations.length;
      let nextInterpretationIndex = currentInterpretationIndex + toNext;

      if (nextInterpretationIndex < 0) {
        nextInterpretationIndex = totalInterpretations - 1;
      } else if (nextInterpretationIndex >= totalInterpretations) {
        nextInterpretationIndex = 0;
      }

      const nextInterpretation = state.currentFileInterpretations[nextInterpretationIndex];
      state.currentInterpretation = nextInterpretation;
      localStorage.setItem('pcaPage_currentInterpretation', JSON.stringify(state.currentInterpretation.uuid));
    },
    setOutputFilename(state, action: PayloadAction<string>) {
      state.outputFilename = action.payload;
    },
  },
  extraReducers: (builder) => {},
});

export const {
  setReference,
  setProjection,
  setSelectedStepsIDs,
  setHiddenStepsIDs,
  addHiddenStepsIDs,
  setStatisticsMode,
  setShowStepsInput,
  toggleCommentsInput,
  setCommentsInput,
  toggleLabelMode,
  setLabelMode,
  addInterpretation,
  deleteInterpretation,
  setAllInterpretations,
  setCurrentInterpretationByUUID,
  deleteAllInterpretations,
  updateCurrentFileInterpretations,
  setLastInterpretationAsCurrent,
  setNextOrPrevInterpretationAsCurrent,
  deleteInterepretationByParentFile,
  setOutputFilename,
  setLargeGraph,
} = pcaPage.actions;

const pcaPageReducer = pcaPage.reducer;
export default pcaPageReducer;
