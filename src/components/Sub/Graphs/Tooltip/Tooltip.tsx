import React, { FC } from "react";
import { createPortal } from "react-dom";
import styles from './Tooltip.module.scss';

export interface ITooltip {
  position: {left: number, top: number};
  isVisible: boolean;
  dot: any; // !!! Пропиши тип dot
}

const Tooltip: FC<ITooltip> = ({ position, isVisible, dot,  }) => {

  return createPortal(
    (
      <>
        {
          isVisible &&
          <div 
            className={styles.tooltip} 
            style={{
              left: position.left + 24, 
              top: position.top - 24
            }}
          >
            <span>{dot.id}</span>
            <span>{dot.text}</span>
            <span>x: {dot.x}</span>
            <span>y: {dot.y}</span>
            <span>inc: {dot.inc}</span>
            <span>dec: {dot.dec}</span>
          </div>
        }
      </>
    ), document.getElementById("tooltip-root")!
  );
}

export default Tooltip;