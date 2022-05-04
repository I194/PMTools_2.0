import React, { FC } from "react";
import styles from './VGP.module.scss';
import { IDirData } from "../../../utils/GlobalTypes";
import SitesDataTable from '../DataTablesDIR/SitesDataTable/SitesDataTable';
import VGPDataTable from "../DataTablesDIR/VGPDataTable/VGPDataTable";
import Graphs from "./Graphs";
import { Typography, Button, Input } from "@mui/material";
import { UploadButton } from '../../Sub/Buttons';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { sitesFileToLatLon } from "../../../services/axios/filesAndData";
import { useTheme } from '@mui/material/styles';
import {
  textColor,
  primaryColor,
  successColor,
} from '../../../utils/ThemeConstants';

type Props = {
  data: IDirData;
}

const VGPmodalContent: FC<Props> = ({ data }) => {

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [coords, setCoords] = React.useState<Array<{lat: number, lon: number}>>([]);

  const { siteData } = useAppSelector(state => state.parsedDataReducer);

  const handleUpload = async (event: any, files?: Array<File>) => {
    const acceptedFile = files ? files[0] : event.currentTarget.files[0];
    dispatch(sitesFileToLatLon(acceptedFile));
  };

  console.log('looook', siteData)

  return (
    <div className={styles.modalContent}>
      <div className={styles.import}>
        <Typography color={textColor(theme.palette.mode)}>
          Введите или загрузите координаты сайтов
        </Typography>
        <div className={styles.upload}>
          <UploadButton 
            accept={['.csv', '.xlsx']}
            onUpload={handleUpload}
            label='Загрузить файл (.csv, .xlsx)'
          />
        </div>
        <Typography color={textColor(theme.palette.mode)}>
          в файле обязательно должны быть столбцы <code style={{color: primaryColor(theme.palette.mode)}}>lat</code> и <code style={{color: primaryColor(theme.palette.mode)}}>lon</code>.
        </Typography>
      </div>
      <div className={styles.import}>
        <Typography color={textColor(theme.palette.mode)}>
          Опциональными явялются столбцы <code style={{color: primaryColor(theme.palette.mode)}}>age</code> и <code style={{color: primaryColor(theme.palette.mode)}}>plate_id</code>, они нужны для экспорта в формат <code style={{color: successColor(theme.palette.mode)}}>GPlates</code>.
        </Typography>
      </div>
      <div className={styles.data}>
        <div className={styles.input}>
          <SitesDataTable data={data} sitesData={siteData?.data} />
        </div>
        <div className={styles.vgpTable}>
          <VGPDataTable />
        </div>
        <Graphs/>
      </div>
    </div>
  );
}

export default VGPmodalContent;