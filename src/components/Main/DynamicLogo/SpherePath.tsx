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
};

const SpherePath = (props: JSX.IntrinsicElements['mesh'] & Props) => {

  const ref = useRef<THREE.Mesh>(null!);
  const sphereRadius = props.sphereRadius;

  const arcs = useMemo(() => {
    return props.path.map((directions) => {
      console.log(directions, directions.end.toCartesian().toArray())
      const pointStart = new THREE.Vector3(...directions.start.toCartesian().toArray()).normalize().multiplyScalar(sphereRadius);
      const pointEnd = new THREE.Vector3(...directions.end.toCartesian().toArray()).normalize().multiplyScalar(sphereRadius);
      return setArc3D(pointStart, pointEnd, 50, "lime", false);
    });
  }, [props.path, sphereRadius]);

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
              color='lime'
              linewidth={2}
              alphaWrite={undefined}
            />
          );
        })
      }
    </mesh>
  );
}

export default SpherePath;
