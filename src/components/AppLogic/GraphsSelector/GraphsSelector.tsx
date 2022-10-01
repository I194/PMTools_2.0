import React, { FC, useEffect, useState } from "react";
import styles from './GraphsSelector.module.scss';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { ZijdIcon } from "../../../assets/icons";
import { useAppDispatch, useAppSelector } from "../../../services/store/hooks";
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from "react-responsive";

import { DefaultResponsiveButton } from "../../Sub/Buttons";
import { GraphPMD } from "../../../utils/GlobalTypes";
import { setLargeGraph } from "../../../services/reducers/pcaPage";

const GraphSelector = () => {

  const theme = useTheme();
  const dispatch = useAppDispatch();

  const onClick = (graphToShow: GraphPMD) => {
    dispatch(setLargeGraph(graphToShow));
  }

  return (
    <>
      <div className={styles.buttons}>
        <DefaultResponsiveButton
          // icon={<ZijdIcon color={'primary'}/>}
          icon={'ZJD'}
          text={'ZJD'}
          onClick={() => onClick(0)}
        />
        <DefaultResponsiveButton
          // icon={<HelpOutlineOutlinedIcon />}
          icon={'STR'}
          text={'STR'}
          onClick={() => onClick(1)}
        />
        <DefaultResponsiveButton
          // icon={<HelpOutlineOutlinedIcon />}
          icon={'RMG'}
          text={'RMG'}
          onClick={() => onClick(2)}
        />
      </div>
    </>
  )
}

export default GraphSelector;
