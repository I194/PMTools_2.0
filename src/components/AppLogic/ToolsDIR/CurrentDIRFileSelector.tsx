import React, { FC, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { IDirData } from '../../../utils/GlobalTypes';
import { deleteAllDirStatData, deleteDirStatData, setCurrentDIRid } from '../../../services/reducers/parsedData';
import DropdownSelectWithButtons from '../../Common/DropdownSelect/DropdownSelectWithButtons';
import {
  setSelectedDirectionsIDs, 
  setStatisticsMode, 
  updateCurrentInterpretation, 
  updateCurrentFileInterpretations, 
  deleteInterepretationByParentFile,
  setHiddenDirectionsIDs,
  deleteAllInterpretations,
  setReversedDirectionsIDs,
} from '../../../services/reducers/dirPage';
import { useTranslation } from 'react-i18next';

const CurrentDIRFileSelector: FC = () => {

  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('translation');

  const { dirStatData, currentDataDIRid } = useAppSelector(state => state.parsedDataReducer);

  const [allDirData, setAllDirData] = useState<Array<IDirData>>([]);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  useEffect(() => {
    if (dirStatData) {
      setAllDirData(dirStatData);
    };
  }, [dirStatData]);

  useEffect(() => {
    if (currentDataDIRid !== null && allDirData.length) {
      const filename = allDirData[currentDataDIRid]?.name;
      if (filename) {
        setCurrentFileName(filename);
        dispatch(updateCurrentFileInterpretations(filename));
        dispatch(updateCurrentInterpretation());
        dispatch(setSelectedDirectionsIDs(null));
        dispatch(setHiddenDirectionsIDs([]));
        dispatch(setReversedDirectionsIDs([]));
        dispatch(setStatisticsMode(null));
      }
    }
  }, [currentDataDIRid, allDirData]);

  const handleFileSelect = (fileName: string) => {
    if (!allDirData.length) {
      dispatch(setCurrentDIRid(null));
      return;
    }

    const dirIndex = allDirData.findIndex(dir => dir.name === fileName);
    dispatch(setCurrentDIRid(dirIndex));
  };

  const handleFileDelete = (fileName: string) => {
    if (dirStatData) {
      // Надо переключиться на прошлый файл если удаляем файл на котором сейчас сидим, иначе currentDataPMDid будет ссылаться на некорректный индекс
      let fileNameDirDataIndex = allDirData.findIndex(dir => dir.name === fileName);
      if (fileNameDirDataIndex === currentDataDIRid) {
        dispatch(setCurrentDIRid(fileNameDirDataIndex - 1));
      }

      dispatch(deleteDirStatData(fileName));
      dispatch(deleteInterepretationByParentFile(fileName));
      dispatch(updateCurrentInterpretation());
      dispatch(setSelectedDirectionsIDs(null));
      dispatch(setHiddenDirectionsIDs([]));
      dispatch(setReversedDirectionsIDs([]));
      dispatch(setStatisticsMode(null));
    };
  };

  const handleAllFilesDelete = () => {
    dispatch(deleteAllDirStatData());
    dispatch(deleteAllInterpretations());
    dispatch(updateCurrentInterpretation());
    dispatch(setSelectedDirectionsIDs(null));
    dispatch(setHiddenDirectionsIDs([]));
    dispatch(setReversedDirectionsIDs([]));
    dispatch(setStatisticsMode(null));
  };

  return (
    <DropdownSelectWithButtons 
      label={t('dirPage.tools.currentFile.title')}
      options={allDirData.map(dir => dir.name)}
      defaultValue={currentFileName}
      onOptionSelect={handleFileSelect}
      minWidth={'210px'}
      maxWidth={'210px'}
      useArrowListeners
      showDelete
      onDelete={handleFileDelete}
      onDeleteAll={handleAllFilesDelete}
    />
  )
}

export default CurrentDIRFileSelector;