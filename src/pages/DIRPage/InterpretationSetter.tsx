import React, { FC, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { 
  addInterpretation, 
  setStatisticsMode, 
  showSelectionInput
} from '../../services/reducers/dirPage';
import { IDirData, RawStatisticsDIR, StatisitcsInterpretationFromDIR } from '../../utils/GlobalTypes';
import calculateStatisticsDIR from '../../utils/statistics/calculateStatisticsDIR';
import ModalWrapper from '../../components/Common/Modal/ModalWrapper';
import InputApply from '../../components/Common/InputApply/InputApply';
import { useTranslation } from 'react-i18next';

interface IInterpretationSetter {
  dataToShow: IDirData | null;
}

type Statistics = {
  rawStatistics: RawStatisticsDIR;
  interpretation: StatisitcsInterpretationFromDIR;
}

const InterpretationSetter: FC<IInterpretationSetter> = ({ dataToShow }) => {

  const { t, i18n } = useTranslation('translation');

  const dispatch = useAppDispatch();

  const { 
    statisticsMode, 
    selectedDirectionsIDs, 
    reversedDirectionsIDs,
    currentFileInterpretations,
    allInterpretations,
    isCommentsInputVisible,
    labelModeIsNumeric
  } = useAppSelector(state => state.dirPageReducer);

  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [statisticsOnHold, setStatisticsOnHold] = useState<Statistics | null>(null);

  useEffect(() => {
    if (statisticsMode && !selectedDirectionsIDs) dispatch(showSelectionInput(true));
    if (statisticsMode && selectedDirectionsIDs && selectedDirectionsIDs.length >= 2 && dataToShow) {
      const statistics = calculateStatisticsDIR(dataToShow, statisticsMode, selectedDirectionsIDs, reversedDirectionsIDs);
      if (labelModeIsNumeric) {
        statistics.interpretation.label = `${allInterpretations.length}${statistics.interpretation.label}/${currentFileInterpretations.length}`;
      }
      if (isCommentsInputVisible) {
        setStatisticsOnHold(statistics);
        setShowCommentModal(true);
        return;
      }

      dispatch(addInterpretation(statistics));
      dispatch(setStatisticsMode(null));
    }
  }, [statisticsMode, selectedDirectionsIDs, dataToShow]);

  const handleAddComment = (comment: string) => {
    if (!statisticsOnHold) {
      setShowCommentModal(false);
    }

    const interpretationWithComment: StatisitcsInterpretationFromDIR = {
      ...statisticsOnHold?.interpretation as StatisitcsInterpretationFromDIR,
      comment
    };

    const statisticsWithComment: Statistics = {
      ...statisticsOnHold as Statistics,
      interpretation: interpretationWithComment
    }

    dispatch(addInterpretation(statisticsWithComment));
    dispatch(setStatisticsMode(null));
    setStatisticsOnHold(null);
    setShowCommentModal(false);
  }

  const handleDeclineAddComment = () => {
    if (!statisticsOnHold) {
      setShowCommentModal(false);
    }
    dispatch(addInterpretation(statisticsOnHold));
    dispatch(setStatisticsMode(null));
    setStatisticsOnHold(null);
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
}

export default InterpretationSetter;
