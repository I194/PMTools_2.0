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
import { useTranslation } from "react-i18next";
import VGPMean from "./VGPMean";
import { useMediaQuery } from "react-responsive";

type Props = {
  data: IDirData;
}

const VGPmodalContent: FC<Props> = ({ data }) => {

  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const dispatch = useAppDispatch();
  const widthLessThan1400 = useMediaQuery({ query: '(max-width: 1400px)' });

  // const { siteData } = useAppSelector(state => state.parsedDataReducer);

  const handleUpload = async (event: any, files?: Array<File>) => {
    const acceptedFile = files ? files[0] : event.currentTarget.files[0];
    dispatch(sitesFileToLatLon(acceptedFile));
  };

  return (
    <div className={styles.modalContent}>
      <div className={styles.topCenter}>
        <div className={styles.import}>
          <Typography color={textColor(theme.palette.mode)}>
            {t("vgp.upload.first")}
          </Typography>
          <div className={styles.upload}>
            <UploadButton 
              accept={['.csv', '.xlsx']}
              onUpload={handleUpload}
              label={
                widthLessThan1400 
                  ? '.csv, .xlsx'
                  : `${t("vgp.upload.button")} (.csv, .xlsx)`
              }
            />
          </div>
          <Typography color={textColor(theme.palette.mode)}>
            {t("vgp.upload.second")} <code style={{color: primaryColor(theme.palette.mode)}}>lat</code> & <code style={{color: primaryColor(theme.palette. mode)}}>lon</code>.
          </Typography>
        </div>
        <div className={styles.import}>
          <Typography color={textColor(theme.palette.mode)}>
            {t("vgp.upload.third")} <code style={{color: primaryColor(theme.palette.mode)}}>age</code> & <code style={{color: primaryColor(theme.palette.mode)} }>plate_id</code>
            {t("vgp.upload.fourth")} <code style={{color: successColor(theme.palette.mode)}}>GPlates</code>
          </Typography>
        </div>
        <div className={styles.vgpRes}>
          <VGPMean />
        </div>
      </div>
      <div className={styles.data}>
        <div className={styles.input}>
          <SitesDataTable data={data} />
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