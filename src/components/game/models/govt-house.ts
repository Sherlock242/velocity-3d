
import * as THREE from 'three';

export function createGovtHouse() {
  const house = new THREE.Group();

  const mainBuildingHeight = 20;
  const mainBuildingWidth = 40;
  const mainBuildingDepth = 30;

  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0xcb4154, // Red color
    roughness: 0.9,
  });

  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555, // Dark grey roof
  });

  // Main building
  const buildingGeom = new THREE.BoxGeometry(
    mainBuildingWidth,
    mainBuildingHeight,
    mainBuildingDepth
  );
  const mainBuilding = new THREE.Mesh(buildingGeom, buildingMaterial);
  mainBuilding.position.y = mainBuildingHeight / 2;
  house.add(mainBuilding);

  // Roof
  const roofGeom = new THREE.BoxGeometry(
    mainBuildingWidth + 4,
    2,
    mainBuildingDepth + 4
  );
  const roof = new THREE.Mesh(roofGeom, roofMaterial);
  roof.position.y = mainBuildingHeight + 1;
  house.add(roof);

  // Simple door
  const doorGeom = new THREE.BoxGeometry(6, 10, 1);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(0, 5, mainBuildingDepth / 2 + 0.1);
  house.add(door);

  // Simple windows
  const windowGeom = new THREE.BoxGeometry(5, 5, 1);
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });

  const window1 = new THREE.Mesh(windowGeom, windowMaterial);
  window1.position.set(-12, 12, mainBuildingDepth / 2 + 0.1);
  house.add(window1);

  const window2 = new THREE.Mesh(windowGeom, windowMaterial);
  window2.position.set(12, 12, mainBuildingDepth / 2 + 0.1);
  house.add(window2);
  
  house.castShadow = true;
  house.receiveShadow = true;

  return house;
}
