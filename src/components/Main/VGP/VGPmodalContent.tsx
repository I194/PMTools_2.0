import React, { FC } from "react";
import styles from './VGP.module.scss';
import { IDirData } from "../../../utils/GlobalTypes";
import SitesDataTable from '../DataTablesDIR/SitesDataTable/SitesDataTable';
import { Typography, Button, Input } from "@mui/material";
import { UploadButton } from '../../Sub/Buttons';
import parseCSV_SitesLatLon from "../../../utils/files/parsers/parserCSV_SitesLatLon";
import { getSitesLatLonData } from "../../../utils/files/fileManipulations";
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { sitesFileToLatLon } from "../../../services/axios/filesAndData";

type Props = {
  data: IDirData;
}

const VGPmodalContent: FC<Props> = ({ data }) => {

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
        <Typography>
          Введите или загрузите координаты сайтов.
        </Typography>
        <UploadButton 
          accept={['csv', 'xlsx']}
          onUpload={handleUpload}
        />
      </div>
      <div className={styles.input}>
        <SitesDataTable data={data}/>
      </div>
    </div>
  );
}

export default VGPmodalContent;