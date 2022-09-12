import React, { useCallback } from "react";
import styles from "./SettingsModal.module.scss";
import { Typography, Button } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { addDirStatFiles, addTreatmentFiles } from "../../../../services/reducers/files";
import { useAppDispatch } from "../../../../services/store/hooks";
import { useTheme } from "@mui/material/styles";
import { textColor } from "../../../../utils/ThemeConstants";
import { VerticalTabs } from "../../Tabs";
import { HotkeysSection } from "./Sections";

const SettingsModal = () => {

  const theme = useTheme();
  const dispatch = useAppDispatch();

  const content = [
    {
      label: 'Горячие клавиши',
      content: <HotkeysSection />
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
