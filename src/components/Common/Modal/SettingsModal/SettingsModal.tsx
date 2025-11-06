import React, { useCallback } from "react";
import styles from "./SettingsModal.module.scss";
import { useAppDispatch } from "../../../../services/store/hooks";
import { useTheme } from "@mui/material/styles";
import { VerticalTabs } from "../../Tabs";
import { HotkeysSection, DisplaySection } from "./Sections";
import { useTranslation } from "react-i18next";

const SettingsModal = () => {

  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const dispatch = useAppDispatch();

  const content = [
    {
      label: t('settings.hotkeys.title'),
      content: <HotkeysSection />
    },
    {
      label: t('settings.display.title'),
      content: <DisplaySection />
    },
    // {
    //   label: 'Выбор направлений',
    //   content: (
    //     <>
    //       Выбор направлений
    //     </>
    //   )
    // },
    // {
    //   label: 'Данные',
    //   content: (
    //     <>
    //       Данные
    //     </>
    //   )
    // }
  ]

  return (
    <div className={styles.container}>
      <VerticalTabs content={content}/>
    </div>
  )
};

export default SettingsModal;
