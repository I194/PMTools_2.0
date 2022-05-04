import React, { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import styles from './DynamicLogo.module.scss';
import * as THREE from 'three'

import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from '@react-three/drei'

type Props = {
  position?: THREE.Vector3,
  fontColor?: string,
  hoverFontColor?: string,
}

const Word: FC<Props> = ({ children, position, fontColor='#fff', hoverFontColor='#123' }) => {

  const color = new THREE.Color();
  const fontProps = { fontSize: 0.5, letterSpacing: -0.05, lineHeight: 1, 'material-toneMapped': false };
  const ref = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const over = (e: any) => (e.stopPropagation(), setHovered(true));
  const out = () => setHovered(false);

  // Change the mouse cursor on hover
  useEffect(() => {
    if (hovered) document.body.style.cursor = 'pointer';
    return () => {document.body.style.cursor = 'auto'};
  }, [hovered]);
  
  // Tie component to the render-loop
  useFrame(({ camera }) => {
    // Make text face the camera
    ref.current.quaternion.copy(camera.quaternion);
    // Animate font color
    ref.current.material.color.lerp(color.set(hovered ? hoverFontColor : fontColor), 0.1);
  });

  return <Text ref={ref} onPointerOver={over} onPointerOut={out} {...fontProps} position={position} children={children} />
}

export default Word;  