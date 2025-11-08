import React from "react";
import { Divider, FormControlLabel, Switch, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../../../services/store/hooks";
import { useTheme } from "@mui/material/styles";
import { textColor,  } from "../../../../../../utils/ThemeConstants";
import { useTranslation } from "react-i18next";
import { toggleLabelMode as toggleLabelModePCA } from "../../../../../../services/reducers/pcaPage";
import { toggleLabelMode as toggleLabelModeDIR } from "../../../../../../services/reducers/dirPage";
import styles from "./styles.module.scss";

const DisplaySection = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t } = useTranslation("translation");

  const { labelModeIsNumeric: pcaNumeric } = useAppSelector((s) => s.pcaPageReducer);
  const { labelModeIsNumeric: dirNumeric } = useAppSelector((s) => s.dirPageReducer);

  return (
    <div className={styles.container}>
      <Typography variant="h6" color={textColor(theme.palette.mode)}>
        {t("settings.display.title")}
      </Typography>
      <Divider />
      <div className={styles.content}>
        <FormControlLabel
          sx={{ mt: 2 }}
          control={
            <Switch
              color="primary"
              checked={pcaNumeric}
              onChange={() => dispatch(toggleLabelModePCA())}
            />
          }
          label={t("settings.display.numericLabel.pca")}
        />

        <FormControlLabel
          sx={{ mt: 1 }}
          control={
            <Switch
              color="primary"
              checked={dirNumeric}
              onChange={() => dispatch(toggleLabelModeDIR())}
            />
          }
          label={t("settings.display.numericLabel.dir")}
        />
      </div>
    </div>
  );
};

export default DisplaySection;


