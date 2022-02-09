import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './ToolsPMD.module.scss';
import DropdownSelect from '../../Sub/DropdownSelect/DropdownSelect';
import InputSelect from '../../Sub/InputSelect/InputSelect';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

const ToolsPMD: FC = ({}) => {

  const [coordinateSystem, setCoordinateSystem] = useState('');
  const [stepsFilter, setStepsFilter] = useState(null);

  return (
    <>
      <DropdownSelect 
        label={'Система координат'}
        options={['Образец', 'Географическая', 'Стратиграфическая']}
        onOptionSelect={() => null}
      />
      <InputSelect 
        placeholder={'Введите шаги'}
        leftIconButton={{icon: <FilterAltOutlinedIcon />, onClick: () => null}}
        rightIconButtons={[
          {icon: <FilterAltOutlinedIcon />, onClick: () => null},
          {icon: <FilterAltOutlinedIcon />, onClick: () => null},
          {icon: <FilterAltOutlinedIcon />, onClick: () => null},
          {icon: <FilterAltOutlinedIcon />, onClick: () => null},
          {icon: <FilterAltOutlinedIcon />, onClick: () => null},
        ]}
      />
    </>
  )
}

export default ToolsPMD;