import React, { useMemo} from "react";
import styles from './DynamicLogo.module.scss';
import * as THREE from 'three'

import Word from "./Word";

const Coordinates = () => {

  //source: https://codesandbox.io/s/yup2o?file=/src/App.js:145-205

  const directions = ['N', 'E', 'S', 'W'];
  const count = 4;
  const radius = 2.2;

  const words: Array<[THREE.Vector3, string]> = useMemo(() => {
    const spherical = new THREE.Spherical();
    const phiSpan = Math.PI / 2;
    const thetaSpan = Math.PI;
    const temp = directions.map((direction, i) => {
      const word: [THREE.Vector3, string] = [
        new THREE.Vector3().setFromSpherical(spherical.set(radius, phiSpan * i, thetaSpan * (i % 2))), 
        direction
      ];
      return word;
    });
    return temp;
  }, [count, radius]);

  return words.map(([pos, word], index) => <Word key={index} position={pos} children={word} />);
}

export default Coordinates;  