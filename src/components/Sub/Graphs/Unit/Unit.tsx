import React, { FC } from "react";
import styles from "./Unit.module.scss";

interface IUnit {
  label: string;
  viewHeight: number;
  viewWidth: number;
}

const Unit: FC<IUnit> = ({ label, viewHeight, viewWidth }) => {
  return (
    <text 
      id='graph-unit' 
      x={`75%`} 
      y={viewHeight - 4} 
      className={styles.unitText}
      fontSize={ '18px' }
    >
      Unit={label}
    </text>
  )
}

export default Unit;