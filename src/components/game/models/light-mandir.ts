
import * as THREE from 'three';

export function createLightMandir() {
  const mandir = new THREE.Group();
  const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffff99 }); // Light Yellow
  const pinkBorderMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1 }); // Light Pink

  const baseWidth = 35;
  const baseHeight = 20;
  const baseDepth = 25;
  const borderWidth = 1.5;

  // Main structure
  const baseGeom = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
  const baseMesh = new THREE.Mesh(baseGeom, yellowMaterial);
  baseMesh.position.y = baseHeight / 2;
  mandir.add(baseMesh);

  // Pink Borders
  // Top border
  const topBorderGeom = new THREE.BoxGeometry(baseWidth + borderWidth, borderWidth, baseDepth + borderWidth);
  const topBorder = new THREE.Mesh(topBorderGeom, pinkBorderMaterial);
  topBorder.position.y = baseHeight + borderWidth / 2;
  mandir.add(topBorder);

  // Simple tower
  const towerHeight = 15;
  const towerGeom = new THREE.BoxGeometry(baseWidth * 0.5, towerHeight, baseDepth * 0.5);
  const tower = new THREE.Mesh(towerGeom, yellowMaterial);
  tower.position.y = baseHeight + towerHeight / 2;
  mandir.add(tower);
  
  // Pink roof for the tower
  const towerRoofGeom = new THREE.ConeGeometry(baseWidth * 0.3, 8, 4);
  const towerRoof = new THREE.Mesh(towerRoofGeom, pinkBorderMaterial);
  towerRoof.position.y = baseHeight + towerHeight + 4;
  towerRoof.rotation.y = Math.PI / 4;
  mandir.add(towerRoof);


  // Door
  const doorGeom = new THREE.BoxGeometry(6, 10, 1);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(0, 5, baseDepth / 2 + 0.1);
  mandir.add(door);

  mandir.castShadow = true;
  mandir.receiveShadow = true;

  return mandir;
}
