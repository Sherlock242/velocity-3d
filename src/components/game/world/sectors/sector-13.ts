
import * as THREE from 'three';
import type { MutableRefObject } from 'react';

type Sector13Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector13({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector13Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const sphereGroup = new THREE.Group();
  sphereGroup.position.set(cellCenterX, 0, cellCenterZ);

  const sphereRadius = 200;

  // Base
  const baseHeight = 30;
  const baseRadius = sphereRadius + 10;
  const baseGeom = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 64);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const base = new THREE.Mesh(baseGeom, baseMaterial);
  base.position.y = baseHeight / 2;
  sphereGroup.add(base);

  // Yellow Dome
  const domeGeom = new THREE.SphereGeometry(sphereRadius, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFEB3B, emissive: 0x888800, emissiveIntensity: 0.3 });
  const dome = new THREE.Mesh(domeGeom, domeMaterial);
  dome.position.y = baseHeight;
  sphereGroup.add(dome);

  // Face elements will be added directly to the dome
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const eyebrowMaterial = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
  const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

  const eyeRadius = 20;

  // Function to place an object on the sphere's surface
  const placeOnSphere = (object: THREE.Object3D, lat: number, lon: number) => {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon);
    const position = new THREE.Vector3().setFromSphericalCoords(sphereRadius, phi, theta);
    object.position.copy(position);
    object.lookAt(object.position.clone().multiplyScalar(1.1));
    dome.add(object);
  };

  // Left Eye
  const leftEye = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius, 32), eyeMaterial);
  const leftPupil = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius * 0.5, 32), pupilMaterial);
  leftPupil.position.z = 0.1;
  leftEye.add(leftPupil);
  placeOnSphere(leftEye, 30, -15);

  // Right Eye
  const rightEye = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius, 32), eyeMaterial);
  const rightPupil = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius * 0.5, 32), pupilMaterial);
  rightPupil.position.z = 0.1;
  rightEye.add(rightPupil);
  placeOnSphere(rightEye, 30, 15);

  // Eyebrows
  const eyebrowGeom = new THREE.BoxGeometry(45, 8, 2);

  const leftEyebrow = new THREE.Mesh(eyebrowGeom, eyebrowMaterial);
  leftEyebrow.rotation.z = -Math.PI / 16;
  placeOnSphere(leftEyebrow, 45, -16);

  const rightEyebrow = new THREE.Mesh(eyebrowGeom, eyebrowMaterial);
  rightEyebrow.rotation.z = Math.PI / 16;
  placeOnSphere(rightEyebrow, 45, 16);

  // Mouth
  const mouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-40, 0, 0),
    new THREE.Vector3(-20, -10, 0),
    new THREE.Vector3(0, -12, 0),
    new THREE.Vector3(20, -10, 0),
    new THREE.Vector3(40, 0, 0),
  ]);
  const mouthGeometry = new THREE.TubeGeometry(mouthCurve, 20, 3, 8, false);
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  // Manually place and rotate the mouth
  const mouthPosition = new THREE.Vector3();
  const lat = 15, lon = 0; // Raised the latitude from 0 to 15
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon);
  mouthPosition.setFromSphericalCoords(sphereRadius, phi, theta);
  mouth.position.copy(mouthPosition);
  mouth.lookAt(mouth.position.clone().multiplyScalar(1.1));
  dome.add(mouth);

  // Lighter spots
  const spotMaterial = new THREE.MeshStandardMaterial({ color: 0xFFF59D, emissive: 0x444400, emissiveIntensity: 0.2 });
  for (let i = 0; i < 20; i++) {
    const spotRadius = Math.random() * 10 + 5;
    const spotGeom = new THREE.CircleGeometry(spotRadius, 16);
    const spot = new THREE.Mesh(spotGeom, spotMaterial);

    const phi = Math.acos(Math.random()); // Even distribution on a hemisphere
    const theta = Math.random() * 2 * Math.PI;

    spot.position.setFromSphericalCoords(sphereRadius + 0.1, phi, theta);
    spot.position.y += baseHeight;
    spot.lookAt(dome.position);
    sphereGroup.add(spot);
  }

  sectorGroup.add(sphereGroup);
  staticCollidersRef.current.push(sphereGroup);

  return sectorGroup;
}
