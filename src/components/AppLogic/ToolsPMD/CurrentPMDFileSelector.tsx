import React, { FC, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { 
  deleteAllInterpretations, 
  deleteInterepretationByParentFile, 
  setHiddenStepsIDs, 
  setSelectedStepsIDs, 
  setStatisticsMode, 
  updateCurrentFileInterpretations, 
  updateCurrentInterpretation 
} from '../../../services/reducers/pcaPage';
import { IPmdData } from '../../../utils/GlobalTypes';
import { deleteAllTreatmentData, deleteTreatmentData, setCurrentPMDid } from '../../../services/reducers/parsedData';
import DropdownSelectWithButtons from '../../Common/DropdownSelect/DropdownSelectWithButtons';
import { useTranslation } from 'react-i18next';

const CurrentPMDFileSelector: FC = () => {

  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation('translation');

  const { treatmentData, currentDataPMDid } = useAppSelector(state => state.parsedDataReducer);

  const [allDataPMD, setAllDataPMD] = useState<Array<IPmdData>>([]);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  useEffect(() => {
    if (treatmentData) {
      setAllDataPMD(treatmentData);
    };
  }, [treatmentData]);

  useEffect(() => {
    if (currentDataPMDid !== null) {
      const filename = allDataPMD[currentDataPMDid]?.metadata.name;
      if (filename) {
        setCurrentFileName(filename);
        dispatch(updateCurrentFileInterpretations(filename));
        dispatch(updateCurrentInterpretation());
        dispatch(setSelectedStepsIDs(null));
        dispatch(setHiddenStepsIDs([]));
        dispatch(setStatisticsMode(null));
      }
    }
  }, [currentDataPMDid, allDataPMD]);

  const handleFileSelect = (fileName: string) => {
    if (!allDataPMD.length) {
      dispatch(setCurrentPMDid(null));
      return;
    }

    const pmdIndex = allDataPMD.findIndex(pmd => pmd.metadata.name === fileName);
    dispatch(setCurrentPMDid(pmdIndex));
  };

  const handleFileDelete = (fileName: string) => {
    if (treatmentData) {
      // Надо переключиться на прошлый файл если удаляем файл на котором сейчас сидим, иначе currentDataPMDid будет ссылаться на некорректный индекс
      let fileNamePMDDataIndex = allDataPMD.findIndex(pmd => pmd.metadata.name === fileName);
      if (fileNamePMDDataIndex === currentDataPMDid) {
        dispatch(setCurrentPMDid(fileNamePMDDataIndex - 1));
      }

      dispatch(deleteTreatmentData(fileName));
      dispatch(deleteInterepretationByParentFile(fileName));
      dispatch(updateCurrentInterpretation());
      dispatch(setSelectedStepsIDs(null));
      dispatch(setHiddenStepsIDs([]));
      dispatch(setStatisticsMode(null));
    };
  };

  const handleAllFilesDelete = () => {
    dispatch(deleteAllTreatmentData());
    dispatch(deleteAllInterpretations());
    dispatch(updateCurrentInterpretation());
    dispatch(setSelectedStepsIDs(null));
    dispatch(setHiddenStepsIDs([]));
    dispatch(setStatisticsMode(null));
  };

  return (
    <DropdownSelectWithButtons 
      label={t('pcaPage.tools.currentFile.title')}
      options={allDataPMD.map(pmd => pmd.metadata.name)}
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

export default CurrentPMDFileSelector;