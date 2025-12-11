
import * as THREE from 'three';
import type { MutableRefObject } from 'react';
import type { EmojiFace } from '../../core/state';
import { createHeartShape } from '../../models/shapes';

type Sector13Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  emojiFaceRef: MutableRefObject<EmojiFace>;
  domeRef: MutableRefObject<THREE.Mesh | undefined>;
};

export function createSector13({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  emojiFaceRef,
  domeRef,
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
  domeRef.current = dome;
  
  // Group for all face elements
  const faceGroup = new THREE.Group();
  dome.add(faceGroup);
  
  // Face elements
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const eyebrowMaterial = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
  const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const heartMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x660000 });
  
  const eyeRadius = 20;
  
  // Left Eye
  const leftEye = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius, 32), eyeMaterial);
  leftEye.name = 'leftEye';
  leftEye.position.x = -45;
  const leftPupil = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius * 0.5, 32), pupilMaterial);
  leftPupil.position.z = 1.2; 
  leftPupil.name = 'leftPupil';
  leftEye.add(leftPupil);
  faceGroup.add(leftEye);

  // Right Eye
  const rightEye = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius, 32), eyeMaterial);
  rightEye.name = 'rightEye';
  rightEye.position.x = 45;
  const rightPupil = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius * 0.5, 32), pupilMaterial);
  rightPupil.position.z = 1.2;
  rightPupil.name = 'rightPupil';
  rightEye.add(rightPupil);
  faceGroup.add(rightEye);

  // Eyebrows
  const eyebrowGeom = new THREE.BoxGeometry(45, 8, 2);

  const leftEyebrow = new THREE.Mesh(eyebrowGeom, eyebrowMaterial);
  leftEyebrow.name = 'leftEyebrow';
  leftEyebrow.rotation.z = -Math.PI / 16;
  leftEyebrow.position.set(-45, 35, 1);
  faceGroup.add(leftEyebrow);

  const rightEyebrow = new THREE.Mesh(eyebrowGeom, eyebrowMaterial);
  rightEyebrow.name = 'rightEyebrow';
  rightEyebrow.rotation.z = Math.PI / 16;
  rightEyebrow.position.set(45, 35, 1);
  faceGroup.add(rightEyebrow);

  // Mouth
  const mouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-15, 2, 0), new THREE.Vector3(-7, -1, 0),
    new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(7, -1, 0),
    new THREE.Vector3(15, 2, 0),
  ]);
  const mouthGeometry = new THREE.TubeGeometry(mouthCurve, 20, 0.5, 8, false);
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.name = 'mouth';
  mouth.position.set(0, -30, 2);
  faceGroup.add(mouth);

  // Heart Eyes (initially hidden)
  const heartShape = createHeartShape();
  const heartGeom = new THREE.ExtrudeGeometry(heartShape, { depth: 2, bevelEnabled: false });
  heartGeom.scale(2.5, 2.5, 1);
  heartGeom.center();

  const leftHeart = new THREE.Mesh(heartGeom, heartMaterial);
  leftHeart.position.x = -45;
  leftHeart.visible = false;
  faceGroup.add(leftHeart);

  const rightHeart = new THREE.Mesh(heartGeom.clone(), heartMaterial);
  rightHeart.position.x = 45;
  rightHeart.visible = false;
  faceGroup.add(rightHeart);


  // Lighter spots
  const spotMaterial = new THREE.MeshStandardMaterial({ color: 0xFFF59D, emissive: 0x444400, emissiveIntensity: 0.2 });
  for (let i = 0; i < 20; i++) {
    const spotRadius = Math.random() * 10 + 5;
    const spotGeom = new THREE.CircleGeometry(spotRadius, 16);
    const spot = new THREE.Mesh(spotGeom, spotMaterial);

    const phi = Math.acos(Math.random()); // Even distribution on a hemisphere
    const theta = Math.random() * 2 * Math.PI;

    const positionOnSphere = new THREE.Vector3().setFromSphericalCoords(sphereRadius + 0.1, phi, theta);
    spot.position.copy(positionOnSphere);
    spot.lookAt(new THREE.Vector3(0,0,0)); // Point towards the center of the sphere
    
    // Add spot to the dome itself so it's part of the same local space
    dome.add(spot);
  }

  sectorGroup.add(sphereGroup);
  staticCollidersRef.current.push(sphereGroup);

  emojiFaceRef.current = {
    faceGroup: faceGroup,
    leftEye: leftEye,
    rightEye: rightEye,
    leftHeart: leftHeart,
    rightHeart: rightHeart,
    leftPupil: leftPupil,
    rightPupil: rightPupil,
    leftEyebrow: leftEyebrow,
    rightEyebrow: rightEyebrow,
    mouth: mouth,
  };


  return sectorGroup;
}
