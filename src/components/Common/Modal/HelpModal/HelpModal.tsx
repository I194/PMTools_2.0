import React, { useCallback } from "react";
import styles from "./HelpModal.module.scss";
import { useAppDispatch } from "../../../../services/store/hooks";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { DefaultButton } from "../../Buttons";
import pmtoolsHowToUse from '../../../../assets/PMTools_how_to_use.pdf';
import pmtoolsPaperEng from '../../../../assets/IPSE798.pdf';
import pmtoolsPaperRu from '../../../../assets/FZE0150.pdf';
import { textColor } from "../../../../utils/ThemeConstants";
import { Typography } from "@mui/material";

const HelpModal = () => {

  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const dispatch = useAppDispatch();

  const handleOpenManual = () => {
    window.open(pmtoolsHowToUse, '_blank');
  }

  const handleOpenPaperEng = () => {
    window.open(pmtoolsPaperEng, '_blank');
  }

  const handleOpenPaperRu = () => {
    window.open(pmtoolsPaperRu, '_blank');
  }

  return (
    <div className={styles.container}>
      <Typography variant='body2' color={textColor(theme.palette.mode)} pr='16px'>
        {t('mainLayout.footer.source')}
      </Typography>
      <Typography variant="h6" color={textColor(theme.palette.mode)}>
        PMTools v.{process.env.REACT_APP_VERSION}
      </Typography>
      <DefaultButton variant='contained' onClick={handleOpenManual}>
        To manual (Russian version only)
      </DefaultButton>
      <DefaultButton variant='contained' onClick={handleOpenPaperEng}>
        To original paper (ENG)
      </DefaultButton>
      <DefaultButton variant='contained' onClick={handleOpenPaperRu}>
        To original paper (RU)
      </DefaultButton>
    </div>
  )
};

export default HelpModal;
