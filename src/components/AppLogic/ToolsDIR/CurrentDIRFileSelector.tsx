import React, { FC, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { IDirData } from '../../../utils/GlobalTypes';
import {
  deleteAllDirStatData,
  deleteDirStatData,
  setCurrentDIRid,
} from '../../../services/reducers/parsedData';
import DropdownSelectWithButtons from '../../Common/DropdownSelect/DropdownSelectWithButtons';
import {
  setSelectedDirectionsIDs,
  setStatisticsMode,
  setLastInterpretationAsCurrent,
  updateCurrentFileInterpretations,
  deleteInterepretationByParentFile,
  setHiddenDirectionsIDs,
  deleteAllInterpretations,
  setReversedDirectionsIDs,
  setCenteredByMean,
  setCutoffEnabled,
} from '../../../services/reducers/dirPage';
import { useTranslation } from 'react-i18next';

const CurrentDIRFileSelector: FC = () => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('translation');

  const { dirStatData, currentDataDIRid } = useAppSelector((state) => state.parsedDataReducer);

  const [allDirData, setAllDirData] = useState<Array<IDirData>>([]);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  // The file this effect last applied its resets for. Guards against re-firing on
  // an allDirData reference change (e.g. another upload) while the same file is
  // still selected — which would otherwise wipe the current file's view state.
  // Keyed on the filename, not the numeric id: deleting another file shifts
  // indices under a fixed id, and that case must still re-sync to the new file.
  const lastAppliedFileNameRef = useRef<string | null>(null);

  useEffect(() => {
    if (dirStatData) {
      setAllDirData(dirStatData);
    }
  }, [dirStatData]);

  useEffect(() => {
    if (currentDataDIRid !== null && allDirData.length) {
      const filename = allDirData[currentDataDIRid]?.name;
      if (filename) {
        setCurrentFileName(filename);
        // Only reset per-file state when the selected file actually changes.
        if (lastAppliedFileNameRef.current === filename) return;
        lastAppliedFileNameRef.current = filename;
        dispatch(updateCurrentFileInterpretations(filename));
        dispatch(setLastInterpretationAsCurrent());
        dispatch(setSelectedDirectionsIDs(null));
        dispatch(setHiddenDirectionsIDs([]));
        dispatch(setReversedDirectionsIDs([]));
        dispatch(setStatisticsMode(null));
        // Center-by-mean / cutoff are per-file view state: reset on file switch.
        dispatch(setCenteredByMean(false));
        dispatch(setCutoffEnabled(false));
      }
    }
  }, [currentDataDIRid, allDirData]);

  const handleFileSelect = (fileName: string) => {
    if (!allDirData.length) {
      dispatch(setCurrentDIRid(null));
      return;
    }

    const dirIndex = allDirData.findIndex((dir) => dir.name === fileName);
    dispatch(setCurrentDIRid(dirIndex));
  };

  const handleFileDelete = (fileName: string) => {
    if (dirStatData) {
      // Надо переключиться на прошлый файл если удаляем файл на котором сейчас сидим, иначе currentDataPMDid будет ссылаться на некорректный индекс
      let fileNameDirDataIndex = allDirData.findIndex((dir) => dir.name === fileName);
      if (fileNameDirDataIndex === currentDataDIRid) {
        dispatch(setCurrentDIRid(fileNameDirDataIndex - 1));
      }

      dispatch(deleteDirStatData(fileName));
      dispatch(deleteInterepretationByParentFile(fileName));
      dispatch(setLastInterpretationAsCurrent());
      dispatch(setSelectedDirectionsIDs(null));
      dispatch(setHiddenDirectionsIDs([]));
      dispatch(setReversedDirectionsIDs([]));
      dispatch(setStatisticsMode(null));
      dispatch(setCenteredByMean(false));
      dispatch(setCutoffEnabled(false));
    }
  };

  const handleAllFilesDelete = () => {
    dispatch(deleteAllDirStatData());
    dispatch(deleteAllInterpretations());
    dispatch(setLastInterpretationAsCurrent());
    dispatch(setSelectedDirectionsIDs(null));
    dispatch(setHiddenDirectionsIDs([]));
    dispatch(setReversedDirectionsIDs([]));
    dispatch(setStatisticsMode(null));
    dispatch(setCenteredByMean(false));
    dispatch(setCutoffEnabled(false));
  };

  return (
    <DropdownSelectWithButtons
      label={t('dirPage.tools.currentFile.title')}
      options={allDirData.map((dir) => dir.name)}
      defaultValue={currentFileName}
      onOptionSelect={handleFileSelect}
      minWidth={'210px'}
      maxWidth={'210px'}
      useArrowListeners
      showDelete
      onDelete={handleFileDelete}
      onDeleteAll={handleAllFilesDelete}
    />
  );
};

export default CurrentDIRFileSelector;
