
import * as THREE from 'three';

export function createSatsangBuilding() {
  const building = new THREE.Group();
  const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, roughness: 0.7 }); // Yellow
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown roof
  const whitePillarMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 });

  const buildingWidth = 100; // Horizontal
  const buildingHeight = 20;
  const buildingDepth = 40;

  // Main Structure
  const mainGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
  const mainMesh = new THREE.Mesh(mainGeom, yellowMaterial);
  mainMesh.position.y = buildingHeight / 2;
  mainMesh.castShadow = true;
  building.add(mainMesh);

  // Roof overhang
  const roofGeom = new THREE.BoxGeometry(buildingWidth + 10, 4, buildingDepth + 10);
  const roof = new THREE.Mesh(roofGeom, roofMaterial);
  roof.position.y = buildingHeight + 2;
  roof.castShadow = true;
  building.add(roof);

  // --- Pillars along the front ---
  const numPillars = 8;
  const pillarSpacing = buildingWidth / (numPillars - 1);
  const pillarGeom = new THREE.CylinderGeometry(1.5, 1.5, buildingHeight, 16);
  
  for (let i = 0; i < numPillars; i++) {
    const pillar = new THREE.Mesh(pillarGeom, whitePillarMaterial);
    const xPos = -buildingWidth / 2 + i * pillarSpacing;
    pillar.position.set(xPos, buildingHeight / 2, buildingDepth / 2 + 2);
    pillar.castShadow = true;
    building.add(pillar);
  }

  // --- Entrances between pillars ---
  const doorGeom = new THREE.BoxGeometry(8, 15, 1);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });

  const doorPositions = [-35, 0, 35];
  doorPositions.forEach(xPos => {
    const door = new THREE.Mesh(doorGeom, doorMaterial);
    door.position.set(xPos, 7.5, buildingDepth / 2 + 0.1);
    building.add(door);
  });
  
  // --- Long windows between doors ---
  const windowGeom = new THREE.BoxGeometry(18, 10, 1);
  
  const windowPositions = [-17.5, 17.5];
  windowPositions.forEach(xPos => {
    const window = new THREE.Mesh(windowGeom, glassMaterial);
    window.position.set(xPos, 12, buildingDepth / 2 + 0.1);
    building.add(window);
  });

  // Add a sign on the roof
  const signGeom = new THREE.BoxGeometry(40, 8, 1);
  const signMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const sign = new THREE.Mesh(signGeom, signMaterial);
  sign.position.set(0, buildingHeight + 6, 0);
  building.add(sign);
  
  building.castShadow = true;
  building.receiveShadow = true;

  return building;
}
