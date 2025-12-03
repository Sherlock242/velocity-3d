
import * as THREE from 'three';

export function createCollegeBuilding() {
  const building = new THREE.Group();
  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.7 });
  const yellowBorderMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.6 });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0xadd8e6,
    transparent: true,
    opacity: 0.6,
    metalness: 0.2,
    roughness: 0.3
  });

  const buildingWidth = 200;
  const buildingHeight = 60;
  const buildingDepth = 40;
  const borderWidth = 2;
  const floorHeight = 15;

  // Main Structure
  const mainGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
  const mainMesh = new THREE.Mesh(mainGeom, redMaterial);
  mainMesh.position.y = buildingHeight / 2;
  mainMesh.castShadow = true;
  building.add(mainMesh);

  // Yellow Borders
  // Top and Bottom
  const horizontalBorderGeom = new THREE.BoxGeometry(buildingWidth + borderWidth, borderWidth, buildingDepth + borderWidth);
  const topBorder = new THREE.Mesh(horizontalBorderGeom, yellowBorderMaterial);
  topBorder.position.y = buildingHeight + borderWidth / 2;
  building.add(topBorder);
  const bottomBorder = new THREE.Mesh(horizontalBorderGeom, yellowBorderMaterial);
  bottomBorder.position.y = -borderWidth/2;
  building.add(bottomBorder);

  // Vertical Corners
  const verticalBorderGeom = new THREE.BoxGeometry(borderWidth, buildingHeight + borderWidth, borderWidth);
  const frontLeftBorder = new THREE.Mesh(verticalBorderGeom, yellowBorderMaterial);
  frontLeftBorder.position.set(-buildingWidth / 2, buildingHeight / 2, buildingDepth / 2);
  building.add(frontLeftBorder);
  const frontRightBorder = frontLeftBorder.clone();
  frontRightBorder.position.x = buildingWidth / 2;
  building.add(frontRightBorder);
  const backLeftBorder = frontLeftBorder.clone();
  backLeftBorder.position.z = -buildingDepth / 2;
  building.add(backLeftBorder);
  const backRightBorder = frontRightBorder.clone();
  backRightBorder.position.z = -buildingDepth / 2;
  building.add(backRightBorder);


  // Windows
  const numFloors = Math.floor(buildingHeight / floorHeight);
  const numWindows = 10;
  const windowSpacing = buildingWidth / (numWindows + 1);
  const windowWidth = windowSpacing * 0.7;
  const windowHeight = floorHeight * 0.6;

  for (let floor = 0; floor < numFloors; floor++) {
    const yPos = floor * floorHeight + floorHeight / 2;
    for (let i = 0; i < numWindows; i++) {
      const xPos = -buildingWidth / 2 + (i + 1) * windowSpacing;
      
      const windowGeom = new THREE.PlaneGeometry(windowWidth, windowHeight);
      const window = new THREE.Mesh(windowGeom, glassMaterial);
      window.position.set(xPos, yPos, buildingDepth / 2 + 0.1);
      building.add(window);
    }
  }

  // Central Entrance
  const entranceWidth = 20;
  const entranceHeight = floorHeight * 1.5;
  const entranceGeom = new THREE.BoxGeometry(entranceWidth, entranceHeight, 5);
  const entrance = new THREE.Mesh(entranceGeom, yellowBorderMaterial);
  entrance.position.set(0, entranceHeight / 2, buildingDepth / 2);
  building.add(entrance);

  const doorGeom = new THREE.PlaneGeometry(12, entranceHeight - 4);
  const doorMaterial = new THREE.MeshStandardMaterial({color: 0x333333});
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(0, entranceHeight/2, buildingDepth/2 + 2.6);
  building.add(door);


  building.castShadow = true;
  building.receiveShadow = true;

  return building;
}

    