
import * as THREE from 'three';

export function createGurudwara() {
  const gurudwara = new THREE.Group();
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.4 });

  // Main building base
  const baseWidth = 50;
  const baseHeight = 30;
  const baseDepth = 50;
  const baseGeom = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
  const base = new THREE.Mesh(baseGeom, whiteMaterial);
  base.position.y = baseHeight / 2;
  gurudwara.add(base);

  // Main Dome
  const domeRadius = 20;
  const domeGeom = new THREE.SphereGeometry(domeRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeom, whiteMaterial);
  dome.position.y = baseHeight;
  gurudwara.add(dome);

  // Golden top of the dome (kalash)
  const kalashGeom = new THREE.ConeGeometry(3, 8, 16);
  const kalash = new THREE.Mesh(kalashGeom, goldMaterial);
  kalash.position.y = baseHeight + domeRadius;
  gurudwara.add(kalash);
  
  // Four corner towers
  const towerHeight = 20;
  const towerRadius = 5;
  const towerGeom = new THREE.CylinderGeometry(towerRadius, towerRadius, towerHeight, 16);
  const towerDomeGeom = new THREE.SphereGeometry(towerRadius, 16, 8, 0, Math.PI * 2, 0, Math.PI/2);
  
  const towerPositions = [
    { x: baseWidth / 2, z: baseDepth / 2 },
    { x: -baseWidth / 2, z: baseDepth / 2 },
    { x: baseWidth / 2, z: -baseDepth / 2 },
    { x: -baseWidth / 2, z: -baseDepth / 2 },
  ];

  towerPositions.forEach(pos => {
    const tower = new THREE.Mesh(towerGeom, whiteMaterial);
    tower.position.set(pos.x, towerHeight / 2, pos.z);
    gurudwara.add(tower);
    
    const towerDome = new THREE.Mesh(towerDomeGeom, whiteMaterial);
    towerDome.position.set(pos.x, towerHeight, pos.z);
    gurudwara.add(towerDome);

    const towerKalash = new THREE.Mesh(new THREE.ConeGeometry(1, 3, 8), goldMaterial);
    towerKalash.position.set(pos.x, towerHeight + towerRadius, pos.z);
    gurudwara.add(towerKalash);
  });

  // Entrance Arch
  const archShape = new THREE.Shape();
  const archWidth = 20;
  const archHeight = 15;
  archShape.moveTo(-archWidth / 2, 0);
  archShape.absarc(0, archHeight / 2, archWidth / 2, Math.PI, Math.PI * 2, false);
  archShape.lineTo(archWidth / 2, 0);
  archShape.lineTo(-archWidth / 2, 0);

  const extrudeSettings = { depth: 2, bevelEnabled: false };
  const archGeom = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
  const arch = new THREE.Mesh(archGeom, whiteMaterial);
  arch.position.set(0, 0, baseDepth / 2);
  gurudwara.add(arch);

  gurudwara.castShadow = true;
  gurudwara.receiveShadow = true;

  return gurudwara;
}
