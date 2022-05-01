import React, { useState, useRef, useMemo } from "react";
import styles from './DynamicLogo.module.scss';
import * as THREE from 'three'

import { useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from '@react-three/drei';
import setArc3D from "./SetArc3D";
import Direction from "../../../utils/graphs/classes/Direction";

type Props = {
  path: Array<{start: Direction, end: Direction}>;
  sphereRadius: number;
  color: string;
  lineWidth?: number;
};

const SpherePath = (props: JSX.IntrinsicElements['mesh'] & Props) => {

  const ref = useRef<THREE.Mesh>(null!);
  const { path, sphereRadius, color, lineWidth }= props;

  const arcs = useMemo(() => {
    return path.map((directions) => {
      // dec as lat and inc as lon
      const pointStart = new THREE.Vector3(...directions.start.toCartesian().toArray()).normalize().multiplyScalar(sphereRadius);
      const pointEnd = new THREE.Vector3(...directions.end.toCartesian().toArray()).normalize().multiplyScalar(sphereRadius);
      return setArc3D(pointStart, pointEnd, 50, "lime", false);
    });
  }, [path, sphereRadius]);

  return (
    <mesh
      {...props}
      ref={ref}
    >
      {
        arcs.map((arc, index) => {
          return (
            <Line
              key={index}
              points={arc}
              color={color}
              linewidth={lineWidth || 2}
              alphaWrite={undefined}
            />
          );
        })
      }
    </mesh>
  );
}

export default SpherePath;
