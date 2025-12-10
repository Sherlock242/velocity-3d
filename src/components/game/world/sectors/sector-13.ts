
import * as THREE from 'three';
import type { MutableRefObject } from 'react';
import type { EmojiFace } from '../../core/state';

type Sector13Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  emojiFaceRef: MutableRefObject<EmojiFace>;
};

export function createSector13({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  emojiFaceRef,
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
  const domeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFEB3B, metalness: 0, roughness: 0.2 });
  const dome = new THREE.Mesh(domeGeom, domeMaterial);
  dome.position.y = baseHeight;
  sphereGroup.add(dome);
  
  // Add a light to create a highlight
  const pointLight = new THREE.PointLight(0xffffff, 2, 300);
  
  
  // Face elements will be added directly to the dome
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const eyebrowMaterial = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
  const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  
  const eyeRadius = 20;
  
  // Function to place an object on the sphere's surface
  function placeOnSphere(object: THREE.Object3D, lat: number, lon: number, radiusOffset = 0) {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      const position = new THREE.Vector3().setFromSphericalCoords(sphereRadius + radiusOffset, phi, theta);
      object.position.copy(position);
      object.lookAt(object.position.clone().multiplyScalar(1.1));
      dome.add(object);
  };
  
  placeOnSphere(pointLight, 15, 0); // Position it like a "nose"

  // Left Eye
  const leftEye = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius, 32), eyeMaterial);
  leftEye.name = 'leftEye';
  const leftPupil = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius * 0.5, 32), pupilMaterial);
  leftPupil.position.z = 1; 
  leftPupil.name = 'leftPupil';
  leftEye.add(leftPupil);
  placeOnSphere(leftEye, 30, -15, 0.1);

  // Right Eye
  const rightEye = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius, 32), eyeMaterial);
  rightEye.name = 'rightEye';
  const rightPupil = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius * 0.5, 32), pupilMaterial);
  rightPupil.position.z = 1;
  rightPupil.name = 'rightPupil';
  rightEye.add(rightPupil);
  placeOnSphere(rightEye, 30, 15, 0.1);

  // Eyebrows
  const eyebrowGeom = new THREE.BoxGeometry(45, 8, 2);

  const leftEyebrow = new THREE.Mesh(eyebrowGeom, eyebrowMaterial);
  leftEyebrow.name = 'leftEyebrow';
  leftEyebrow.rotation.z = -Math.PI / 16;
  placeOnSphere(leftEyebrow, 45, -16, 1);

  const rightEyebrow = new THREE.Mesh(eyebrowGeom, eyebrowMaterial);
  rightEyebrow.name = 'rightEyebrow';
  rightEyebrow.rotation.z = Math.PI / 16;
  placeOnSphere(rightEyebrow, 45, 16, 1);

  // Mouth
  const mouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-30, 0, 0), new THREE.Vector3(-15, -8, 0),
    new THREE.Vector3(0, -10, 0), new THREE.Vector3(15, -8, 0),
    new THREE.Vector3(30, 0, 0),
  ]);
  const mouthGeometry = new THREE.TubeGeometry(mouthCurve, 20, 3, 8, false);
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.name = 'mouth';
  placeOnSphere(mouth, 15, 0, 2);

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

  emojiFaceRef.current = {
    leftEye: dome.getObjectByName('leftEye') as THREE.Mesh,
    rightEye: dome.getObjectByName('rightEye') as THREE.Mesh,
    leftPupil: dome.getObjectByName('leftPupil') as THREE.Mesh,
    rightPupil: dome.getObjectByName('rightPupil') as THREE.Mesh,
    leftEyebrow: dome.getObjectByName('leftEyebrow') as THREE.Mesh,
    rightEyebrow: dome.getObjectByName('rightEyebrow') as THREE.Mesh,
    mouth: dome.getObjectByName('mouth') as THREE.Mesh,
    originalPositions: {
        leftEyebrow: leftEyebrow.position.clone(),
        rightEyebrow: rightEyebrow.position.clone(),
        mouth: mouth.position.clone(),
    }
  };


  return sectorGroup;
}
