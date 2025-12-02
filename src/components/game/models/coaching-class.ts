
import * as THREE from 'three';

export function createCoachingClass() {
  const building = new THREE.Group();
  const mainMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White
  const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown

  const buildingWidth = 40;
  const buildingHeight = 25;
  const buildingDepth = 30;
  const borderWidth = 2;

  // Main Structure
  const mainGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
  const mainMesh = new THREE.Mesh(mainGeom, mainMaterial);
  mainMesh.position.y = buildingHeight / 2;
  building.add(mainMesh);

  // Brown Borders
  // Top border
  const topBorderGeom = new THREE.BoxGeometry(buildingWidth + borderWidth / 2, borderWidth, buildingDepth + borderWidth / 2);
  const topBorder = new THREE.Mesh(topBorderGeom, borderMaterial);
  topBorder.position.y = buildingHeight + borderWidth / 2;
  building.add(topBorder);

  // Side borders (vertical)
  const sideBorderGeom = new THREE.BoxGeometry(borderWidth, buildingHeight, borderWidth);
  
  const frontLeftBorder = new THREE.Mesh(sideBorderGeom, borderMaterial);
  frontLeftBorder.position.set(-buildingWidth / 2, buildingHeight / 2, buildingDepth / 2);
  building.add(frontLeftBorder);

  const frontRightBorder = new THREE.Mesh(sideBorderGeom, borderMaterial);
  frontRightBorder.position.set(buildingWidth / 2, buildingHeight / 2, buildingDepth / 2);
  building.add(frontRightBorder);

  // Sign
  const signMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Blue sign
  const signGeom = new THREE.BoxGeometry(20, 5, 0.5);
  const sign = new THREE.Mesh(signGeom, signMaterial);
  sign.position.set(0, buildingHeight - 8, buildingDepth / 2 + 0.3);
  building.add(sign);
  
  // Simple Door and Windows
  const doorGeom = new THREE.BoxGeometry(6, 10, 1);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(0, 5, buildingDepth / 2 + 0.1);
  building.add(door);

  const windowGeom = new THREE.BoxGeometry(8, 6, 1);
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xadd8e6 });
  const window1 = new THREE.Mesh(windowGeom, windowMaterial);
  window1.position.set(-15, 15, buildingDepth / 2 + 0.1);
  building.add(window1);
  
  const window2 = new THREE.Mesh(windowGeom, windowMaterial);
  window2.position.set(15, 15, buildingDepth / 2 + 0.1);
  building.add(window2);

  building.castShadow = true;
  building.receiveShadow = true;

  return building;
}
