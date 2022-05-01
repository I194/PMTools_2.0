import React, { useState, useRef, useMemo } from "react";
import styles from './DynamicLogo.module.scss';
import * as THREE from 'three'

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from '@react-three/drei';
import { SphereGeometry } from "three";
import setArc3D from "./SetArc3D";
import Direction from "../../../utils/graphs/classes/Direction";
import SpherePath from "./SpherePath";
 
const Sphere = (props: JSX.IntrinsicElements['mesh']) => {

  const ref = useRef<THREE.Mesh>(null!);

  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  const [sphereRadius, setSphereRadius] = useState(2);

  useFrame((state, delta) => (ref.current.rotation.y += 0.001));

  const points: Array<{lat: number, lon: number}> = [
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

  // dec as lat and inc as lon
  const path: Array<{start: Direction, end: Direction}> = [];
  for (let pointIndex = 0; pointIndex < points.length - 1; pointIndex++) {
    path.push({
      start: new Direction(points[pointIndex].lat, points[pointIndex].lon, 1),
      end: new Direction(points[pointIndex + 1].lat, points[pointIndex + 1].lon, 1),
    });
  };

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 2 : 1}
      // onPointerOver={(event) => hover(true)}
      // onPointerOut={(event) => hover(false)}
    >
      <sphereGeometry args={[2, 72, 36]}/>
      <meshLambertMaterial color={hovered ? '#ce93d8' : '#90caf9'} wireframe />
      <SpherePath path={path} sphereRadius={sphereRadius} color='#119dff' lineWidth={1}/>
      <OrbitControls 
        minDistance={2}
        maxDistance={8}
        enablePan={false}
      />
    </mesh>
  );
}


const DynamicLogo = () => {
  const [color, colorChange] = useState("blue"); // Состояние отвечает за цвет квадрата
 
  // Handler служит для того, чтобы
  const colorChangeHandler = () => {
    // Просто поочерёдно меняем цвет с серого на синий и с синего на белый
    colorChange((prevColor) => (prevColor === "white" ? "blue" : "white"));
  };
 
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Sphere position={[0, 0, 0]} />
    </Canvas>
  );
};
 
export default DynamicLogo;