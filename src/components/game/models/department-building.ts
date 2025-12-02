
import * as THREE from 'three';

export function createDepartmentBuilding() {
  const building = new THREE.Group();

  const buildingHeight = 25;
  const buildingWidth = 150;
  const buildingDepth = 40;

  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc, // Light grey concrete
    roughness: 0.8,
  });

  const buildingGeom = new THREE.BoxGeometry(
    buildingWidth,
    buildingHeight,
    buildingDepth
  );
  const mainBuilding = new THREE.Mesh(buildingGeom, buildingMaterial);
  mainBuilding.position.y = buildingHeight / 2;
  mainBuilding.castShadow = true;
  building.add(mainBuilding);

  // Add windows
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0.9,
    roughness: 0.1,
  });

  const numWindows = 10;
  const windowWidth = (buildingWidth - 40) / numWindows;
  const windowHeight = 8;
  const windowSpacing = windowWidth * 1.1;

  for (let i = 0; i < numWindows; i++) {
    const windowGeom = new THREE.BoxGeometry(windowWidth * 0.9, windowHeight, 1);
    
    // Skip the middle for the entrance
    const positionIndex = i < numWindows / 2 ? i : i + 1;
    const xPos = - (buildingWidth / 2) + 20 + positionIndex * windowSpacing;
    
    // Front windows
    const frontWindow = new THREE.Mesh(windowGeom, windowMaterial);
    frontWindow.position.set(xPos, buildingHeight * 0.6, buildingDepth / 2 + 0.1);
    building.add(frontWindow);
    
    // Back windows
    const backWindow = new THREE.Mesh(windowGeom, windowMaterial);
    backWindow.position.set(xPos, buildingHeight * 0.6, -buildingDepth / 2 - 0.1);
    building.add(backWindow);
  }
  
  // Add Entrance
  const entranceWidth = 10;
  const entranceHeight = 15;
  const entranceGeom = new THREE.BoxGeometry(entranceWidth, entranceHeight, 2);
  const entranceMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
  });
  const entrance = new THREE.Mesh(entranceGeom, entranceMaterial);
  entrance.position.set(0, entranceHeight / 2, buildingDepth / 2);
  building.add(entrance);
  
  const doorGeom = new THREE.PlaneGeometry(6, 10);
  const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.8
  });
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(0, 5, buildingDepth / 2 + 1.1);
  entrance.add(door);


  return building;
}
