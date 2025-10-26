import React, { FC, useCallback, useEffect, useState } from 'react';
import styles from './ProjectionSelect.module.scss';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import { Projection } from '../../../../../utils/graphs/types';
import { useAppDispatch, useAppSelector } from '../../../../../services/store/hooks';
import projectionByReference from '../../../../../utils/graphs/formatters/zijd/projectionByReference';
import { setProjection } from '../../../../../services/reducers/pcaPage';
import { Tooltip, Typography } from '@mui/material';

interface IProjectionButton {
  label: Projection
};

const AVAILABLE_PROJECTIONS: Projection[] = [
  { y: 'W, UP', x: 'N, N' },
  { y: 'N, UP', x: 'E, E' },
  { y: 'N, N', x: 'E, UP' },
];

const ProjectionButton: FC<IProjectionButton> = ({ label }) => {
  const dispatch = useAppDispatch();

  const { hotkeys, hotkeysActive } = useAppSelector(state => state.appSettingsReducer);
  const { projection, reference } = useAppSelector(state => state.pcaPageReducer); 

  const [projectionHotkey, setProjectionHotkey] = useState<{key: string, code: string}>({key: 'P', code: 'KeyP'});

  useEffect(() => {
    const zijdHotkeys = hotkeys.find(block => block.title === 'Управление диграммой Зийдервельда')?.hotkeys;

    if (zijdHotkeys) {
      setProjectionHotkey(zijdHotkeys.find(hotkey => hotkey.label === 'Прокручивание проекций')!.hotkey);
    }
  }, [hotkeys]);

  const handleProjectionSelect = useCallback(() => {
    dispatch(setProjection(label));
  }, [dispatch, label]);

  const handleHotkeys = useCallback((event: KeyboardEvent) => {
    const keyCode = event.code;

    if (keyCode === projectionHotkey.code) {
      event.preventDefault();
      const currProjectionIndex = AVAILABLE_PROJECTIONS.findIndex(proj => proj.y === projection.y);
      const nextProjectionIndex = (currProjectionIndex + 1) % AVAILABLE_PROJECTIONS.length;
      dispatch(setProjection(AVAILABLE_PROJECTIONS[nextProjectionIndex]));
    }
  }, [projection, projectionHotkey, dispatch]);

  useEffect(() => {
    if (!hotkeysActive) return;
    window.addEventListener("keydown", handleHotkeys);
    return () => {
      window.removeEventListener("keydown", handleHotkeys);
    };
  }, [hotkeysActive, handleHotkeys]);

  return (
    <Tooltip
      title={<Typography variant='body1'>{projectionHotkey.key}</Typography>}
      enterDelay={250}
      arrow
    >
      <Button
        color={label.y === projection.y ? 'secondary' : 'primary'}
        sx={{
          fontWeight: label.y === projection.y ? 600 : 400,
          borderRadius: '16px'
        }}
        onClick={handleProjectionSelect}
      >
        { projectionByReference(label, reference).y }
      </Button>
    </Tooltip>
  );
};

const ProjectionSelect = () => {
  return (
    <div className={styles.projectionSelect}>
      <ButtonGroup sx={{m: '4px', height: '24px'}} size='small'>
        <ProjectionButton label={{y: 'W, UP', x: 'N, N'}}/>
        <ProjectionButton label={{y: 'N, UP', x: 'E, E'}}/>
        <ProjectionButton label={{y: 'N, N', x: 'E, UP'}}/>
      </ButtonGroup>
    </div>
  )
};

export default ProjectionSelect;
