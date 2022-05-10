import React, { FC } from "react";
import styles from './PMTests.module.scss';
import { IDirData } from "../../../../utils/GlobalTypes";
import FoldTestContainer from "./FoldTestContainer";
import { Typography, Button, Input } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { useTheme } from '@mui/material/styles';
import {
  textColor,
  primaryColor,
  successColor,
} from '../../../../utils/ThemeConstants';
import { VerticalTabs } from "../../../Sub/Tabs";

type Props = {
  data: IDirData;
}

const PMTestsModalContent: FC<Props> = ({ data }) => {

  const theme = useTheme();
  const dispatch = useAppDispatch();

  const content = [
    {
      label: 'Тест складки (Bootstrap-версия)',
      content: (
        <div className={styles.dataContainer}>
          <div className={styles.data}>
            <FoldTestContainer dataToAnalyze={data}/>
          </div>
        </div>
      )
    },
    {
      label: 'Тест обращения (Bootstrap-версия)',
      content: (
        <>
          Выбор направлений
        </>
      )
    },
    {
      label: 'Тест конгломератов',
      content: (
        <>
          Данные
        </>
      )
    }
  ]

  return (
    <div className={styles.container}>
      <VerticalTabs content={content}/>
    </div>
  );
}

export default PMTestsModalContent;