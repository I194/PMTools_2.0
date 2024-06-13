import React, { FC, useEffect, useState } from 'react';
import styles from '../khokhlov-gvozdik/khokhlov-gvozdik.module.scss';
import CACDataTable from '../CACDataTable/CACDataTable';
import { useAppSelector } from '../../services/store/hooks';
import { IDirData, StatisitcsInterpretationFromDIR } from "../../utils/GlobalTypes";
import { DataTableDIR, StatisticsDataTableDIR } from '../../components/AppLogic';
import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
} from '../../utils/ThemeConstants';


// export function CACTable() {


//   return (
//     <div style={{ height: 400, width: '100%' }}>
     
//     </div>
//   );
// }





interface ITables {
  dataToShow: IDirData | null;
};

const CACTable: FC<ITables> = ({ dataToShow }) => {


// export function CACTable({ dataToShow }) {

  const theme = useTheme();
  
  const { currentInterpretation, currentFileInterpretations } = useAppSelector(state => state.dirPageReducer);
  const [interpretations, setInterpretations] = useState<StatisitcsInterpretationFromDIR[] | null>(null);

  useEffect(() => {
    if (currentFileInterpretations && currentFileInterpretations.length) setInterpretations(currentFileInterpretations);
    else if (currentInterpretation) setInterpretations([currentInterpretation]);
    else setInterpretations(null);
  }, [currentInterpretation, currentFileInterpretations]);

  return (
    <div 
    className={styles.table_container + ' ' + styles.commonContainer}
    // style={{backgroundColor: bgColorMain(theme.palette.mode)}}
    >
        <CACDataTable data={dataToShow}/>

        {/* <DataTableDIR data={dataToShow}/> */}
    </div>
  )
};

export default CACTable;


