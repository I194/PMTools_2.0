import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import styles from './ToolsPMD.module.scss';
import DropdownSelect from '../../Sub/DropdownSelect/DropdownSelect';
import ButtonGroupWithLabel from '../../Sub/ButtonGroupWithLabel/ButtonGroupWithLabel';
import { Button } from '@mui/material';
import { Reference } from '../../../utils/graphs/types';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { addCurrentFileInterpretation, setCurrentStatistics, setReference, setStatisticsMode } from '../../../services/reducers/pcaPage';
import { IPmdData } from '../../../utils/GlobalTypes';
import ModalWrapper from '../../Sub/Modal/ModalWrapper';
import ToolsPMDSkeleton from './ToolsPMDSkeleton';
import OutputDataTablePMD from '../DataTablesPMD/OutputDataTable/OutputDataTablePMD';
import StatModeButton from './StatModeButton';

const labelToReference = (label: string) => {
  if (label === 'Образец') return 'specimen';
  if (label === 'Стратиграфическая') return 'stratigraphic';
  return 'geographic';
};

const referenceToLabel = (reference: Reference) => {
  if (reference === 'specimen') return 'Образец';
  if (reference === 'stratigraphic') return 'Стратиграфическая';
  return 'Географическая';
};

interface IToolsPMD {
  data: IPmdData | null;
};

const ToolsPMD: FC<IToolsPMD> = ({ data }) => {

  const dispatch = useAppDispatch();

  const { reference, currentInterpretation } = useAppSelector(state => state.pcaPageReducer); 

  const [coordinateSystem, setCoordinateSystem] = useState<Reference>('geographic');
  const [allFilesStatOpen, setAllFilesStatOpen] = useState<boolean>(false);

  useEffect(() => {
    window.addEventListener("keydown", handleStatisticsModeSelect);
    return () => {
      window.removeEventListener("keydown", handleStatisticsModeSelect);
    };
  }, []);
  
  useEffect(() => {
    setCoordinateSystem(reference);
  }, [reference]);

  const handleReferenceSelect = (option: string) => {
    dispatch(setReference(labelToReference(option)));
  };

  const handleStatisticsModeSelect = useCallback((e) => {
    const key = (e.key as string).toLowerCase();
    const { ctrlKey, shiftKey, altKey } = e; 
    if ((shiftKey || altKey) && key === 'd') dispatch(setStatisticsMode('pca'));
    if ((shiftKey || altKey) && key === 'o') dispatch(setStatisticsMode('pca0'));
    if ((shiftKey || altKey) && key === 'g') dispatch(setStatisticsMode('gc'));
    if ((shiftKey || altKey) && key === 'i') dispatch(setStatisticsMode('gcn'));
  }, []);

  const onStatisticsApply = useCallback(() => {
    dispatch(addCurrentFileInterpretation());
    dispatch(setStatisticsMode(null));
  }, []);

  const onStatisticsDecline = useCallback(() => {
    dispatch(setCurrentStatistics(null))
    dispatch(setStatisticsMode(null));
  }, []);

  if (!data) return <ToolsPMDSkeleton />;

  return (
    <ToolsPMDSkeleton>
      <DropdownSelect 
        label={'Система координат'}
        options={['Образец', 'Географическая', 'Стратиграфическая']}
        defaultValue='Географическая'
        onOptionSelect={handleReferenceSelect}
      />
      <ButtonGroupWithLabel label='Статистический метод'>
        <StatModeButton mode='pca'/>
        <StatModeButton mode='pca0'/>
        <StatModeButton mode='gc'/>
        <StatModeButton mode='gcn'/>
      </ButtonGroupWithLabel>
      <ButtonGroupWithLabel label='Рассчитанная статистика'>
        <Button color='success' onClick={() => onStatisticsApply()} disabled={!currentInterpretation}>Применить</Button>
        <Button color='error' onClick={() => onStatisticsDecline()} disabled={!currentInterpretation}>Отменить</Button>
      </ButtonGroupWithLabel>
      <ButtonGroupWithLabel label='Смотреть статистику'>
        <Button onClick={() => setAllFilesStatOpen(true)}>По всем файлам</Button>
      </ButtonGroupWithLabel>
      <ModalWrapper
        open={allFilesStatOpen}
        setOpen={setAllFilesStatOpen}
      >
        <OutputDataTablePMD />
      </ModalWrapper>
    </ToolsPMDSkeleton>
  )
}

export default ToolsPMD;