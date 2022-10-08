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
import ReversalTestContainer from "./ReversalTestContainer/ReversalTestUncontrolledContainer";
import ReversalTestUncontrolledContainer from "./ReversalTestContainer/ReversalTestUncontrolledContainer";
import ReversalTestControlledContainer from "./ReversalTestContainer/ReversalTestControlledContainer";
import ConglomeratesTestContainer from "./ConglomeratesTestContainer";
import { useTranslation } from "react-i18next";

type Props = {
  data: IDirData;
}

const PMTestsModalContent: FC<Props> = ({ data }) => {

  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');
  const dispatch = useAppDispatch();

  const content = [
    {
      label: t("pmtests.foldTest.title"),
      content: (
        <div className={styles.dataContainer}>
          <div className={styles.data}>
            <FoldTestContainer dataToAnalyze={data}/>
          </div>
        </div>
      )
    },
    {
      label: t("pmtests.reverseAutoTest.title"),
      content: (
        <div className={styles.dataContainer}>
          <div className={styles.data}>
            <ReversalTestUncontrolledContainer dataToAnalyze={data}/>
          </div>
        </div>
      )
    },
    {
      label: t("pmtests.reverseTest.title"),
      content: (
        <div className={styles.dataContainer}>
          <div className={styles.data}>
            <ReversalTestControlledContainer/>
          </div>
        </div>
      )
    },
    {
      label: t("pmtests.conglomerateTest.title"),
      content: (
        <div className={styles.dataContainer}>
          <div className={styles.data}>
            <ConglomeratesTestContainer dataToAnalyze={data}/>
          </div>
        </div>
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