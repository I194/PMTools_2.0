import React, { FC, useEffect, useState } from 'react';
import styles from './PCAPage.module.scss';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { 
  addInterpretation, 
  setStatisticsMode, 
  setShowStepsInput, 
} from '../../services/reducers/pcaPage';
import { IPmdData, StatisitcsInterpretationFromPCA } from '../../utils/GlobalTypes';
import calculateStatisticsPMD from '../../utils/statistics/calculateStatisticsPMD';
import { MetaDataTablePMD, ToolsPMD } from '../../components/AppLogic';
import Graphs from './Graphs';
import Tables from './Tables';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
} from '../../utils/ThemeConstants';
import ModalWrapper from '../../components/Common/Modal/ModalWrapper';
import UploadModal from '../../components/Common/Modal/UploadModal/UploadModal';
import { useMediaQuery } from 'react-responsive';
import { setCurrentPMDid } from '../../services/reducers/parsedData';
import InputApply from '../../components/Common/InputApply/InputApply';
import { useTranslation } from 'react-i18next';

interface IInterpretationSetter {
  dataToShow: IPmdData | null;
}

const InterpretationSetter: FC<IInterpretationSetter> = ({ dataToShow }) => {

  const dispatch = useAppDispatch();

  const { t, i18n } = useTranslation('translation');

  const { statisticsMode, selectedStepsIDs, isCommentsInputVisible } = useAppSelector(state => state.pcaPageReducer);

  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [interpretationOnHold, setInterpretationOnHold] = useState<StatisitcsInterpretationFromPCA | null>(null);

  useEffect(() => {
    if (statisticsMode && !selectedStepsIDs) dispatch(setShowStepsInput(true));
    if (statisticsMode && selectedStepsIDs && selectedStepsIDs.length >= 2 && dataToShow) {
      const statistics = calculateStatisticsPMD(dataToShow, statisticsMode, selectedStepsIDs);
      if (isCommentsInputVisible) {
        setInterpretationOnHold(statistics.interpretation);
        setShowCommentModal(true);
        return;
      }
      // решил оставить id на совесть пользователя - теперь это просто название файла
      // statistics.interpretation.label = `${allInterpretations.length}${statistics.interpretation.label}/${currentFileInterpretations.length}`;
      // statistics.interpretation.label = `${statistics.interpretation.label}`;
      dispatch(addInterpretation(statistics.interpretation));
      dispatch(setStatisticsMode(null));
    } //else dispatch(updateCurrentInterpretation());
  }, [statisticsMode, selectedStepsIDs, dataToShow]);

  const handleAddComment = (comment: string) => {
    if (!interpretationOnHold) {
      setShowCommentModal(false);
    }

    const interpretationWithComment: StatisitcsInterpretationFromPCA = {
      ...interpretationOnHold as StatisitcsInterpretationFromPCA,
      comment
    };

    dispatch(addInterpretation(interpretationWithComment));
    dispatch(setStatisticsMode(null));
    setInterpretationOnHold(null);
    setShowCommentModal(false);
  }

  const handleDeclineAddComment = () => {
    if (!interpretationOnHold) {
      setShowCommentModal(false);
    }
    dispatch(addInterpretation(interpretationOnHold as StatisitcsInterpretationFromPCA));
    dispatch(setStatisticsMode(null));
    setInterpretationOnHold(null);
    setShowCommentModal(false);
  }

  return (
    <>
      {
        showCommentModal && isCommentsInputVisible && 
        <ModalWrapper
          open={showCommentModal}
          setOpen={setShowCommentModal}
          size={{width: '26vw', height: '14vh'}}
          position={{left: '50%', top: '20%'}}
          onClose={handleDeclineAddComment}
          isDraggable={true}
        >
          <InputApply 
            label={`${t('inputComment.label')}`}
            onApply={handleAddComment}
            placeholder={`${t('inputComment.placeholder')}`}
          />
        </ModalWrapper>
      }
    </>
  )
};

export default InterpretationSetter;
