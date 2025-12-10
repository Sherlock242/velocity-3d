
import * as THREE from 'three';
import type { MutableRefObject } from 'react';

type Sector13Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  emojiFacePartsRef: MutableRefObject<any>;
};

export function createSector13({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  emojiFacePartsRef,
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

  // Face elements
  const faceGroup = new THREE.Group();
  dome.add(faceGroup);
  
  // Position the face slightly forward on the sphere
  faceGroup.position.y = sphereRadius * 0.5;
  faceGroup.lookAt(dome.position.clone().add(new THREE.Vector3(0, sphereRadius * 0.5, sphereRadius)));


  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const eyeRadius = 20;

  // Left Eye
  const leftEye = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius, 32), eyeMaterial);
  leftEye.name = 'leftEye';
  const leftPupil = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius * 0.5, 32), pupilMaterial);
  leftPupil.position.z = 1;
  leftEye.add(leftPupil);
  leftEye.position.set(-50, 20, sphereRadius - 1);
  faceGroup.add(leftEye);

  // Right Eye
  const rightEye = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius, 32), eyeMaterial);
  rightEye.name = 'rightEye';
  const rightPupil = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius * 0.5, 32), pupilMaterial);
  rightPupil.position.z = 1;
  rightEye.add(rightPupil);
  rightEye.position.set(50, 20, sphereRadius - 1);
  faceGroup.add(rightEye);

  // Eyebrows
  const eyebrowMaterial = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
  const eyebrowGeom = new THREE.BoxGeometry(45, 8, 2);

  // Left Eyebrow
  const leftEyebrow = new THREE.Mesh(eyebrowGeom, eyebrowMaterial);
  leftEyebrow.name = 'leftEyebrow';
  leftEyebrow.position.set(-50, 50, sphereRadius - 1);
  leftEyebrow.rotation.z = Math.PI / 8;
  faceGroup.add(leftEyebrow);

  // Right Eyebrow
  const rightEyebrow = new THREE.Mesh(eyebrowGeom, eyebrowMaterial);
  rightEyebrow.name = 'rightEyebrow';
  rightEyebrow.position.set(50, 50, sphereRadius - 1);
  rightEyebrow.rotation.z = -Math.PI / 8;
  faceGroup.add(rightEyebrow);

  // Mouth and Fangs
  const mouthGroup = new THREE.Group();
  mouthGroup.name = 'mouthGroup';
  mouthGroup.position.set(0, -30, sphereRadius - 1);
  faceGroup.add(mouthGroup);
  
  const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const mouthLine = new THREE.Mesh(new THREE.BoxGeometry(20, 3, 2), mouthMaterial);
  mouthGroup.add(mouthLine);

  const fangMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const fangGeom = new THREE.ConeGeometry(4, 10, 8);
  
  // Left Fang
  const leftFang = new THREE.Mesh(fangGeom, fangMaterial);
  leftFang.position.set(-8, -5, 0);
  leftFang.rotation.z = Math.PI;
  mouthGroup.add(leftFang);

  // Right Fang
  const rightFang = new THREE.Mesh(fangGeom, fangMaterial);
  rightFang.position.set(8, -5, 0);
  rightFang.rotation.z = Math.PI;
  mouthGroup.add(rightFang);

  // Lighter spots
  const spotMaterial = new THREE.MeshStandardMaterial({ color: 0xFFF59D, emissive: 0x444400, emissiveIntensity: 0.2 });
  for (let i = 0; i < 20; i++) {
    const spotRadius = Math.random() * 10 + 5;
    const spotGeom = new THREE.CircleGeometry(spotRadius, 16);
    const spot = new THREE.Mesh(spotGeom, spotMaterial);

    const phi = Math.acos(-1 + 2 * Math.random());
    const theta = Math.random() * 2 * Math.PI;
    
    // Ensure spots are on the top hemisphere
    const y = Math.abs(Math.cos(phi) * sphereRadius);
    const radiusAtY = Math.sqrt(sphereRadius * sphereRadius - y * y);
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    spot.position.set(x, y + baseHeight, z);
    spot.lookAt(new THREE.Vector3(0, baseHeight, 0));
    sphereGroup.add(spot);
  }

  sectorGroup.add(sphereGroup);
  staticCollidersRef.current.push(sphereGroup);

  // Store references to face parts for animation
  emojiFacePartsRef.current = {
    leftEye,
    rightEye,
    leftEyebrow,
    rightEyebrow,
    mouthGroup,
  };

  return sectorGroup;
}
