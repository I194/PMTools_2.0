import React, { useState, useRef, useMemo } from "react";
import styles from './DynamicLogo.module.scss';
import * as THREE from 'three'

import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from '@react-three/drei';
import { SphereGeometry } from "three";
import setArc3D from "./SetArc3D";
import Direction from "../../../utils/graphs/classes/Direction";
import SpherePath from "./SpherePath";
import SphericalPoints from "./SphericalPoints";

import { useTheme } from '@mui/material/styles';
import {
  bgColorMain,
  bgColorBlocks,
} from '../../../utils/ThemeConstants';
 
const Sphere = (props: JSX.IntrinsicElements['mesh'] & {themeMode: 'dark' | 'light'}) => {

  const ref = useRef<THREE.Mesh>(null!);

  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  const [sphereRadius, setSphereRadius] = useState(2);

  useFrame((state, delta) => (ref.current.rotation.y += 0.001));

  const pointsRaw: Array<{lat: number, lon: number}> = [
    {lat: -17.1, lon: 301.4},
    {lat: -17.2, lon: 297.6},
    {lat: -16.8, lon: 298.0},
    {lat: -16.1, lon: 299.2},
    {lat: -16.5, lon: 300.1},
    {lat: -15.5, lon: 299.1},
    {lat: -17.6, lon: 299.9},
    {lat: -14.4, lon: 300.1},
    {lat: -19.0, lon: 307.0},
    {lat: -17.0, lon: 301.7},
    {lat: -17.4, lon: 308.9},
    {lat: -11.2, lon: 314.3},
    {lat: -1.5, lon: 347.0},
    {lat: 17.8, lon: 344.9},
    {lat: 17.5, lon: 30.0},
  ];
  const points: Array<THREE.Vector3> = pointsRaw.map(({lat, lon}) => {
    const direction = new Direction(lat, lon, 1);
    const point = new THREE.Vector3(...direction.toCartesian().toArray()).normalize().multiplyScalar(sphereRadius);
    return point;
  });

  // dec as lat and inc as lon
  const path: Array<{start: Direction, end: Direction}> = [];
  for (let pointIndex = 0; pointIndex < pointsRaw.length - 1; pointIndex++) {
    path.push({
      start: new Direction(pointsRaw[pointIndex].lat, pointsRaw[pointIndex].lon, 1),
      end: new Direction(pointsRaw[pointIndex + 1].lat, pointsRaw[pointIndex + 1].lon, 1),
    });
  };

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 2 : 1.42}
      rotation={[0, Math.PI * 1.25, 0]}
      // onPointerOver={(event) => hover(true)}
      // onPointerOut={(event) => hover(false)}
    >
      <sphereGeometry args={[2, 72, 36]}/>
      <meshLambertMaterial color={props.themeMode === 'dark' ? '#323232' : '#90caf9'} wireframe />
      <SpherePath path={path} sphereRadius={sphereRadius} color='#119dff' lineWidth={1}/>
      <SphericalPoints points={points} size={0.2} color='#FF9101'/>
      <OrbitControls 
        minDistance={2}
        maxDistance={8}
        enablePan={false}
        enableZoom={false}
      />
    </mesh>
  );
}


const DynamicLogo = () => {
  
  const theme = useTheme();
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Sphere position={[0, 0, 0]} themeMode={theme.palette.mode}/>
    </Canvas>
  );
};
 
export default DynamicLogo;