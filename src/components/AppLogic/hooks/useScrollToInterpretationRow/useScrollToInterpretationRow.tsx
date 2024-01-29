import { GridApiCommunity } from "@mui/x-data-grid/internals";
import { useEffect } from "react";
import { useAppSelector } from "../../../../services/store/hooks";

interface IUseScrollToInterpretationRowProps {
  apiRef: React.MutableRefObject<GridApiCommunity>;
  pageType: 'pca' | 'dir';
}

export const useScrollToInterpretationRow = ({apiRef, pageType}: IUseScrollToInterpretationRowProps) => {

  const currentPageReducer = pageType === 'pca' ? 'pcaPageReducer' : 'dirPageReducer';
  const { currentInterpretation } = useAppSelector(state => state[currentPageReducer]);

  useEffect(() => {
    if (currentInterpretation && apiRef?.current?.getAllRowIds) {
      const allRowIDs = apiRef.current.getAllRowIds();

      const dataUuid = pageType === 'pca' ? 'uuid' : 'label';
      const currentInterpretationRowIndex = allRowIDs.findIndex(rowId => rowId === currentInterpretation[dataUuid]);
      if (currentInterpretationRowIndex >= 0) {
        apiRef.current.scrollToIndexes({rowIndex: currentInterpretationRowIndex});
      }
    }
  }, [currentInterpretation, apiRef]);
}