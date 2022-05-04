import React, { useState, useRef, useMemo } from "react";
import styles from './DynamicLogo.module.scss';
import * as THREE from 'three'

import { useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Point, Points } from '@react-three/drei';
import setArc3D from "./SetArc3D";
import Direction from "../../../utils/graphs/classes/Direction";

type Props = {
  points: Array<THREE.Vector3>;
  size: number;
  color: string;
};

const SphericalPoints = (props: JSX.IntrinsicElements['mesh'] & Props) => {

  const ref = useRef<THREE.Mesh>(null!);
  const { points, size, color } = props;



  return (
    <mesh
      {...props}
      ref={ref}
    >
      {
        points.map((point, index) => (
          <mesh
            {...props}
            ref={ref}
            position={point}
          >
            <sphereGeometry 
              args={[size / 10, 72, 36]}
            />
            <meshLambertMaterial color={color} />
          </mesh>
        ))
      }
    </mesh>
  );
}

export default SphericalPoints;
