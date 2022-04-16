import React, { FC } from "react";
import styles from './Tooltip.module.scss';
import { createPortal } from "react-dom";
import { TooltipDot } from "../../../../utils/graphs/types";
import { useTheme } from '@mui/material/styles';
import { primaryColor, textColorInverted } from '../../../../utils/ThemeConstants';

export interface ITooltip {
  position: {left: number, top: number};
  isVisible: boolean;
  data?: TooltipDot;
  bgColor?: string;
  textColor?: string;
}

const Tooltip: FC<ITooltip> = ({ position, isVisible, data, bgColor, textColor }) => {

  const theme = useTheme();

  const parsedText = (text: TooltipDot) => {
    const res = [];
    let prop: keyof TooltipDot;
    for (prop in text) {
      res.push(
        <span key={prop}>
          {
            prop === 'title' 
              ? text[prop]
              : <><b>{prop}</b>: {text[prop]}</>
          }
        </span>
      );
    };
    return res;
  };

  const isWindowWidthBorder = (left: number) => {
    return (Math.abs(window.innerWidth - left) <= 128) || (Math.abs(left - window.innerWidth) <= 128);
  }
  const isWindowHeightBorder = (top: number) => {
    return (Math.abs(window.innerHeight - top) <= 128) || (Math.abs(top - window.innerHeight) <= 128);
  }

  return createPortal(
    (
      <>
        {
          isVisible &&
          <div 
            className={styles.tooltip} 
            style={{
              position: 'absolute',
              left: isWindowWidthBorder(position.left) ? position.left - 88 : position.left + 24, 
              top: isWindowHeightBorder(position.top) ? position.top - 88 : position.top - 24, 
              backgroundColor: bgColor ? bgColor : primaryColor(theme.palette.mode),
              color: textColor ? textColor : textColorInverted(theme.palette.mode),
              zIndex: 10000,
            }}
          >
            {
              data && 
              parsedText(data)
            }
          </div>
        }
      </>
    ), document.getElementById("tooltip-root")!
  );
}

export default Tooltip;