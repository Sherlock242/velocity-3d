
import * as THREE from 'three';

export function createSatsangBuilding() {
  const building = new THREE.Group();
  const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Yellow

  const buildingWidth = 100; // Horizontal
  const buildingHeight = 20;
  const buildingDepth = 40;

  // Main Structure
  const mainGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
  const mainMesh = new THREE.Mesh(mainGeom, yellowMaterial);
  mainMesh.position.y = buildingHeight / 2;
  building.add(mainMesh);

  // Roof overhang
  const roofGeom = new THREE.BoxGeometry(buildingWidth + 5, 2, buildingDepth + 5);
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown roof
  const roof = new THREE.Mesh(roofGeom, roofMaterial);
  roof.position.y = buildingHeight + 1;
  building.add(roof);

  // Multiple Entrances
  const doorGeom = new THREE.BoxGeometry(8, 12, 1);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });

  const doorPositions = [-30, 0, 30];
  doorPositions.forEach(xPos => {
    const door = new THREE.Mesh(doorGeom, doorMaterial);
    door.position.set(xPos, 6, buildingDepth / 2 + 0.1);
    building.add(door);
  });
  
  // Long windows
  const windowGeom = new THREE.BoxGeometry(15, 8, 1);
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xadd8e6 });
  
  const windowPositions = [-15, 15];
  windowPositions.forEach(xPos => {
    const window = new THREE.Mesh(windowGeom, windowMaterial);
    window.position.set(xPos, 12, buildingDepth / 2 + 0.1);
    building.add(window);
  });

  building.castShadow = true;
  building.receiveShadow = true;

  return building;
}
