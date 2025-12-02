
import * as THREE from 'three';

export function createDepartmentBuilding() {
  const building = new THREE.Group();

  const buildingHeight = 50; // Increased height for two stories
  const buildingWidth = 150;
  const buildingDepth = 40;
  const entranceHeight = 12;

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

  const numWindowsPerSide = 5;
  const entranceWidth = 20; // Space for the entrance
  const totalWindowSpace = buildingWidth - entranceWidth;
  const windowSectionWidth = totalWindowSpace / 2;
  const windowWidth = (windowSectionWidth / numWindowsPerSide) * 0.8;
  const windowSpacing = windowSectionWidth / numWindowsPerSide;
  const windowHeight = 8;
  const windowStories = [buildingHeight * 0.25, buildingHeight * 0.75]; // Y positions for windows on both floors

  for (const yPos of windowStories) {
    // Left side windows
    for (let i = 0; i < numWindowsPerSide; i++) {
      const windowGeom = new THREE.BoxGeometry(windowWidth, windowHeight, 1);
      const xPos = -buildingWidth / 2 + (i + 0.5) * windowSpacing;

      const frontWindow = new THREE.Mesh(windowGeom, windowMaterial);
      frontWindow.position.set(xPos, yPos, buildingDepth / 2 + 0.1);
      building.add(frontWindow);

      const backWindow = new THREE.Mesh(windowGeom, windowMaterial);
      backWindow.position.set(xPos, yPos, -buildingDepth / 2 - 0.1);
      building.add(backWindow);
    }

    // Right side windows
    for (let i = 0; i < numWindowsPerSide; i++) {
      const windowGeom = new THREE.BoxGeometry(windowWidth, windowHeight, 1);
      const xPos = buildingWidth / 2 - (i + 0.5) * windowSpacing;

      const frontWindow = new THREE.Mesh(windowGeom, windowMaterial);
      frontWindow.position.set(xPos, yPos, buildingDepth / 2 + 0.1);
      building.add(frontWindow);

      const backWindow = new THREE.Mesh(windowGeom, windowMaterial);
      backWindow.position.set(xPos, yPos, -buildingDepth / 2 - 0.1);
      building.add(backWindow);
    }
  }

  // Add Entrance
  const entranceGeom = new THREE.BoxGeometry(10, entranceHeight, 2);
  const entranceMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
  });
  const entrance = new THREE.Mesh(entranceGeom, entranceMaterial);
  entrance.position.set(0, entranceHeight / 2, buildingDepth / 2);
  building.add(entrance);

  const doorGeom = new THREE.PlaneGeometry(6, 10);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.8,
  });
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(0, 0, 1.01); // Position it relative to the entrance, slightly forward
  entrance.add(door);

  return building;
}
