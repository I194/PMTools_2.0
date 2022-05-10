import * as THREE from 'three'

const setArc3D = (
  pointStart: THREE.Vector3, 
  pointEnd: THREE.Vector3, 
  smoothness: number, 
  color: string, 
  clockWise: boolean,
) => {
  // calculate normal
  var cb = new THREE.Vector3(),
    ab = new THREE.Vector3(),
    normal = new THREE.Vector3();
  cb.subVectors(new THREE.Vector3(), pointEnd);
  ab.subVectors(pointStart, pointEnd);
  cb.cross(ab);
  normal.copy(cb).normalize();

  // get angle between vectors
  var angle = pointStart.angleTo(pointEnd);
  if (clockWise) angle = angle - Math.PI * 2;
  var angleDelta = angle / (smoothness - 1);

  //var geometry = new THREE.Geometry();
  var pts = [];
  for (var i = 0; i < smoothness; i++) {
    pts.push(pointStart.clone().applyAxisAngle(normal, angleDelta * i))
  }
  // var geometry = new THREE.BufferGeometry().setFromPoints(pts);

  return pts;

  // var arc = new THREE.Line(geometry, new THREE.LineBasicMaterial({
  //   color: color
  // }));

  // return arc;
};

export default setArc3D;