import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const createScene = (container: HTMLElement) => {
  // const scene = new THREE.Scene();
  // scene.background = new THREE.Color(0x0000);

  // // Set up the camera
  // const camera = new THREE.PerspectiveCamera(
  //   75,
  //   container.clientWidth / container.clientHeight,
  //   0.9,
  //   1000
  // );

  // camera.position.z = 2;

  // // Set up the renderer
  // const renderer = new THREE.WebGLRenderer({ antialias: true });
  // renderer.setSize(container.clientWidth, container.clientHeight);
  // container.appendChild(renderer.domElement);

  // //Create a PointLight and turn on shadows for the light
  // const light = new THREE.PointLight(0xffffff, 1, 100);
  // scene.add(light);

  // //-----------------------------------------------------------------------
  // // make sphere
  // //-----------------------------------------------------------------------

  // const geometry = new THREE.SphereGeometry(0.997, 90, 90);
  // const material = new THREE.MeshDepthMaterial({ color: 0x3B8C9A });
  // const sphere = new THREE.Mesh(geometry, material);
  // scene.add(sphere);

  // // Set up the controls
  // const controls = new OrbitControls(camera, renderer.domElement);

  // // Animate the scene
  // const animate = () => {
  //   requestAnimationFrame(animate);
  //   light.position.copy(camera.position);
  //   controls.update();
  //   renderer.render(scene, camera);
  // };

  // animate();
};