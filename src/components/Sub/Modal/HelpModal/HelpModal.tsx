import React, { useCallback } from "react";
import styles from "./HelpModal.module.scss";
import { useAppDispatch } from "../../../../services/store/hooks";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { DefaultButton } from "../../Buttons";
import pmtoolsHowToUse from '../../../../assets/PMTools_how_to_use.pdf';

const HelpModal = () => {

  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const dispatch = useAppDispatch();

  const onManualClick = () => {
    window.open(pmtoolsHowToUse, '_blank')
  }

  return (
    <div className={styles.container}>
      PMTools v.{process.env.REACT_APP_VERSION}
      <DefaultButton variant='contained' onClick={onManualClick}>
        To manual (Russian version only)
      </DefaultButton>
    </div>
  )
};

export default HelpModal;
