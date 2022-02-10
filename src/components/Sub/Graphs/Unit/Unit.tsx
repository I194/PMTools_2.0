import React, { FC } from "react";
import styles from "./Unit.module.scss";

interface IUnit {
  label: string;
  viewHeight: number;
  viewWidth: number;
}

const Unit: FC<IUnit> = ({ label, viewHeight, viewWidth }) => {
  return (
    <text id='graph-unit' x={viewWidth - 150} y={viewHeight - 10} className={styles.unitText}>
      Unit={label}
    </text>
  )
}

export default Unit;