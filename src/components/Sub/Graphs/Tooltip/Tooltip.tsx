import React, { FC } from "react";
import { createPortal } from "react-dom";
import { TooltipDot } from "../../../../utils/graphs/types";
import styles from './Tooltip.module.scss';

export interface ITooltip {
  position: {left: number, top: number};
  isVisible: boolean;
  data?: TooltipDot;
}

const Tooltip: FC<ITooltip> = ({ position, isVisible, data }) => {

  const parsedText = (text: TooltipDot) => {
    const res = [];
    let prop: keyof TooltipDot;
    for (prop in text) {
      res.push(
        <span><b>{prop}</b>{`: ${text[prop]}`}</span>
      );
    };
    return res;
  }

  return createPortal(
    (
      <>
        {
          isVisible &&
          <div 
            className={styles.tooltip} 
            style={{
              left: position.left + 24, 
              top: position.top - 24,
              position: 'absolute'
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