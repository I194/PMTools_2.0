import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './ReversalTestContainer.module.scss';
import { useWindowSize } from '../../../../../utils/GlobalHooks';
import GraphsSkeleton from '../GraphsSkeleton';
import { FoldTestResult, IDirData, ReversalTestClassicResult, ReversalTestResultAll } from '../../../../../utils/GlobalTypes';
import { foldTestBootstrap, reversalTestBootstrap, reversalTestClassic, reversalTestOldFashioned } from '../../../../../utils/statistics/PMTests';
import FoldTestGraph from '../../../../AppGraphs/FoldTestGraph/FoldTestGraph';
import { Button, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
  primaryColor,
  successColor,
} from '../../../../../utils/ThemeConstants';

import getCDF from '../../../../../utils/graphs/formatters/getCDF';
import TestControls from '../TestControls';
import { useForm, Controller } from 'react-hook-form';
import Direction from '../../../../../utils/graphs/classes/Direction';
import ClassicResult from './ClassicResult';

const ReversalTestControlledContainer = () => {

  const theme = useTheme();
  const [dataToShow, setDataToShow] = useState<ReversalTestResultAll>();
  const [isRunning, setIsRunning] = useState(false);

  const { getValues, formState: { errors }, control, handleSubmit  } = useForm();

  const handleOldFashionedCompute = () => {
    const { declination_1, inclination_1, N_1, K_1, declination_2, inclination_2, N_2, K_2 } = getValues();
    const direction_1 = new Direction(declination_1, inclination_1, 1);
    const direction_2 = new Direction(declination_2, inclination_2, 1);
    const oldFashionedResult = reversalTestOldFashioned(direction_1, N_1, K_1, direction_2, N_2, K_2);
    setDataToShow({...dataToShow, oldFashioned: oldFashionedResult});
  };
  
  useEffect(() => {
    if (isRunning) {
      handleOldFashionedCompute();
      setIsRunning(false);
    }
  }, [isRunning]);

  return (
    <>
      <form onSubmit={handleSubmit(() => setIsRunning(true))} className={styles.formControl}>
        {/* <TestControls isRunning={isRunning} setIsRunning={setIsRunning}/> */}
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{
            textTransform: 'none',
            width: 'fit-content',
            pl: '12px',
            pr: '12px',
          }}
        > 
          Рассчитать
        </Button>
        <div className={styles.controlled}>
          <div className={styles.inputs}>
            <div className={styles.input}>
              <Controller
                control={control}
                name="declination_1"
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Declination 1"
                    variant="standard"
                    helperText={errors.declination_1 && 'Поле обязательно'}
                    FormHelperTextProps={{
                      error: errors.declination_1,
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="inclination_1"
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Inclination 1"
                    variant="standard"
                    helperText={errors.inclination_1 && 'Поле обязательно'}
                    FormHelperTextProps={{
                      error: errors.inclination_1,
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="N_1"
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="N 1"
                    variant="standard"
                    helperText={errors.N_1 && 'Поле обязательно'}
                    FormHelperTextProps={{
                      error: errors.N_1,
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="K_1"
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="k 1"
                    variant="standard"
                    helperText={errors.K_1 && 'Поле обязательно'}
                    FormHelperTextProps={{
                      error: errors.K_1,
                    }}
                  />
                )}
              />
            </div>
            <div className={styles.input}>
              <Controller
                control={control}
                name="declination_2"
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Declination 2"
                    variant="standard"
                    helperText={errors.declination_2 && 'Поле обязательно'}
                    FormHelperTextProps={{
                      error: errors.declination_2,
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="inclination_2"
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Inclination 2"
                    variant="standard"
                    helperText={errors.inclination_2 && 'Поле обязательно'}
                    FormHelperTextProps={{
                      error: errors.inclination_2,
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="N_2"
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="N 2"
                    variant="standard"
                    helperText={errors.n_2 && 'Поле обязательно'}
                    FormHelperTextProps={{
                      error: errors.n_2,
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="K_2"
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="k 2"
                    variant="standard"
                    helperText={errors.K_2 && 'Поле обязательно'}
                    FormHelperTextProps={{
                      error: errors.K_2,
                    }}
                  />
                )}
              />
            </div>
          </div>
          {
            dataToShow?.oldFashioned &&
            <ClassicResult result={dataToShow.oldFashioned}/>
          }
        </div>
      </form>
    </>
  )
};

export default ReversalTestControlledContainer;
