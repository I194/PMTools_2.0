import React, { FC } from "react";
import styles from "./CoordinateSystem.module.scss";
import { useAppSelector } from '../../../../services/store/hooks';

interface ICoordinateSystem {
  left?: number;
  top?: number;
};

const CoordinateSystem: FC<ICoordinateSystem> = ({ left=0, top=0 }) => {

  const { reference } = useAppSelector(state => state.pcaPageReducer);

  return (
    <text 
      id='graph-reference' 
      x={15 + left} 
      y={40 + top} 
      textAnchor='start'
      className={styles.coordinateSystem}
      fontSize={ '18px' }
      fontWeight={600}
    >
      { reference }
    </text>
  );
};

export default CoordinateSystem;
