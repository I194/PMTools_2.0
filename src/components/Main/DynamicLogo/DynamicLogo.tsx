import React, { useState, useRef, useMemo } from "react";
import styles from './DynamicLogo.module.scss';
import * as THREE from 'three'

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from '@react-three/drei';
 
const Sphere = (props: JSX.IntrinsicElements['mesh']) => {

  const ref = useRef<THREE.Mesh>(null!);

  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  useFrame((state, delta) => (ref.current.rotation.y += 0.001));

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 2 : 1}
      // onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}>
      <sphereGeometry args={[2, 32, 16]}/>
      <meshLambertMaterial color={hovered ? '#ce93d8' : '#90caf9'} wireframe />
      <OrbitControls 
        minDistance={4}
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