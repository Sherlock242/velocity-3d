import * as THREE from 'three';

export function createToriiGate() {
  const torii = new THREE.Group();

  const orangeMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4500, // Bright orange-red
    roughness: 0.6,
  });

  const blackMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, // Near-black
    roughness: 0.5,
  });

  const pillarRadius = 8;
  const pillarHeight = 100;
  const pillarDistance = 90;

  // --- Vertical Pillars ---
  const pillarGeom = new THREE.CylinderGeometry(
    pillarRadius,
    pillarRadius * 0.9,
    pillarHeight,
    16
  );

  const leftPillar = new THREE.Mesh(pillarGeom, orangeMaterial);
  leftPillar.position.set(-pillarDistance / 2, pillarHeight / 2, 0);
  torii.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeom, orangeMaterial);
  rightPillar.position.set(pillarDistance / 2, pillarHeight / 2, 0);
  torii.add(rightPillar);
  
  // Base for pillars
  const baseGeom = new THREE.CylinderGeometry(pillarRadius + 1, pillarRadius + 2, 8, 16);
  const leftBase = new THREE.Mesh(baseGeom, blackMaterial);
  leftBase.position.set(-pillarDistance / 2, 4, 0);
  torii.add(leftBase);
  
  const rightBase = new THREE.Mesh(baseGeom, blackMaterial);
  rightBase.position.set(pillarDistance / 2, 4, 0);
  torii.add(rightBase);


  // --- Horizontal Beams ---

  // Top beam (Kasagi) with upward curve
  const kasagiLength = pillarDistance + 60;
  const kasagiHeight = 10;
  const kasagiDepth = 10;

  const kasagiShape = new THREE.Shape();
  const halfLength = kasagiLength / 2;
  kasagiShape.moveTo(-halfLength, 0);
  kasagiShape.quadraticCurveTo(0, kasagiHeight / 2, halfLength, 0);
  kasagiShape.lineTo(halfLength, -kasagiHeight);
  kasagiShape.quadraticCurveTo(0, -kasagiHeight/2, -halfLength, -kasagiHeight);
  kasagiShape.closePath();
  
  const kasagiExtrudeSettings = { depth: kasagiDepth, bevelEnabled: false };
  const kasagiGeom = new THREE.ExtrudeGeometry(kasagiShape, kasagiExtrudeSettings);
  
  const kasagi = new THREE.Mesh(kasagiGeom, blackMaterial);
  kasagi.position.set(0, pillarHeight + kasagiHeight, -kasagiDepth / 2);
  torii.add(kasagi);

  // Second beam (Nuki)
  const nukiWidth = pillarDistance + 10;
  const nukiHeight = 8;
  const nukiDepth = 8;
  const nukiGeom = new THREE.BoxGeometry(nukiWidth, nukiHeight, nukiDepth);
  const nuki = new THREE.Mesh(nukiGeom, orangeMaterial);
  nuki.position.set(0, pillarHeight - 30, 0);
  torii.add(nuki);

  // Small center piece (Gakuzuka)
  const gakuzukaGeom = new THREE.BoxGeometry(15, 12, 10);
  const gakuzuka = new THREE.Mesh(gakuzukaGeom, orangeMaterial);
  gakuzuka.position.y = pillarHeight - 12;
  torii.add(gakuzuka);

  torii.castShadow = true;
  torii.receiveShadow = true;

  return torii;
}
