import React, { FC } from "react";
import styles from './VGP.module.scss';
import { IDirData } from "../../../utils/GlobalTypes";
import SitesDataTable from '../DataTablesDIR/SitesDataTable/SitesDataTable';
import VGPDataTable from "../DataTablesDIR/VGPDataTable/VGPDataTable";
import { Typography, Button, Input } from "@mui/material";
import { UploadButton } from '../../Sub/Buttons';
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { sitesFileToLatLon } from "../../../services/axios/filesAndData";
import { useTheme } from '@mui/material/styles';
import {
  textColor,
  primaryColor,
} from '../../../utils/ThemeConstants';

type Props = {
  data: IDirData;
}

const VGPmodalContent: FC<Props> = ({ data }) => {

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [coords, setCoords] = React.useState<Array<{lat: number, lon: number}>>([]);

  const { siteLatLonData } = useAppSelector(state => state.parsedDataReducer);

  const handleUpload = async (event: any, files?: Array<File>) => {
    const acceptedFile = files ? files[0] : event.currentTarget.files[0];
    // const latLon = await getSitesLatLonData(acceptedFile);
    // setCoords(latLon.coords);
    dispatch(sitesFileToLatLon(acceptedFile));
  };

  console.log(siteLatLonData);

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
          в файле должны быть столбцы <code style={{color: primaryColor(theme.palette.mode)}}>lat</code> и <code style={{color: primaryColor(theme.palette.mode)}}>lon</code>
        </Typography>
      </div>
      <div className={styles.data}>
        <div className={styles.input}>
          <SitesDataTable data={data} latLonData={siteLatLonData?.coords}/>
        </div>
        <div className={styles.vgpTable}>
          <VGPDataTable />
        </div>
      </div>
    </div>
  );
}

export default VGPmodalContent;