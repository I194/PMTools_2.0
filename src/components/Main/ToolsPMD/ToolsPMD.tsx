import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './ToolsPMD.module.scss';
import DropdownSelect from '../../Sub/DropdownSelect/DropdownSelect';
import InputSelect from '../../Sub/InputSelect/InputSelect';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { Typography } from '@mui/material';

const ToolsPMD: FC = ({}) => {

  const [coordinateSystem, setCoordinateSystem] = useState('');
  const [stepsFilter, setStepsFilter] = useState(null);

  return (
    <div className={styles.dataSettings}>
      <DropdownSelect 
        label={'Система координат'}
        options={['Образец', 'Географическая', 'Стратиграфическая']}
        onOptionSelect={() => null}
      />
      <InputSelect 
        placeholder={'Введите шаги'}
        leftIconButton={{icon: <FilterAltOutlinedIcon />, onClick: () => null}}
        rightIconButtons={[
          {icon: <Typography>PCA</Typography>, onClick: () => null},
          {icon: <Typography>PCA<sub>0</sub></Typography>, onClick: () => null},
          {icon: <Typography>GC</Typography>, onClick: () => null},
          {icon: <Typography>GCn</Typography>, onClick: () => null},
        ]}
      />
    </div>
  )
}

export default ToolsPMD;