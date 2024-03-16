import React, { FC } from 'react';
import styles from './ProjectionSelect.module.scss';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import { Projection } from '../../../../../utils/graphs/types';
import { useAppDispatch, useAppSelector } from '../../../../../services/store/hooks';
import projectionByReference from '../../../../../utils/graphs/formatters/zijd/projectionByReference';
import { setProjection } from '../../../../../services/reducers/pcaPage';

interface IProjectionButton {
  label: Projection
};

const ProjectionButton: FC<IProjectionButton> = ({ label }) => {

  const dispatch = useAppDispatch();
  const { projection, reference } = useAppSelector(state => state.pcaPageReducer); 

  const handleProjectionSelect = () => {
    dispatch(setProjection(label));
  };

  return (
    <Button
      color={label.y === projection.y ? 'secondary' : 'primary'}
      sx={{
        fontWeight: label.y === projection.y ? 600 : 400
      }}
      onClick={handleProjectionSelect}
    >
      { projectionByReference(label, reference).y }
    </Button>
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
