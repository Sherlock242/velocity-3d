
import * as THREE from 'three';

export function createMansion() {
  const mansion = new THREE.Group();
  const mansionMaterial = new THREE.MeshStandardMaterial({ color: 0xe0d7c6 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3a2a });
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 });
  const windowMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xadd8e6, 
    metalness: 0.9, 
    roughness: 0.1,
    envMapIntensity: 0.9
  });

  // Main building
  const mainBuildingGeom = new THREE.BoxGeometry(80, 40, 50);
  const mainBuilding = new THREE.Mesh(mainBuildingGeom, mansionMaterial);
  mainBuilding.position.y = 20;
  mansion.add(mainBuilding);

  const mainRoofGeom = new THREE.ConeGeometry(60, 20, 4);
  const mainRoof = new THREE.Mesh(mainRoofGeom, roofMaterial);
  mainRoof.position.y = 40 + 10;
  mainRoof.rotation.y = Math.PI / 4;
  mansion.add(mainRoof);

  // Main Door
  const mainDoorGeom = new THREE.BoxGeometry(18, 25, 1);
  const mainDoor = new THREE.Mesh(mainDoorGeom, doorMaterial);
  mainDoor.position.set(0, 12.5, 25.1);
  mansion.add(mainDoor);

  // Helper function to create windows
  const createWindow = (width: number, height: number) => {
    const windowGroup = new THREE.Group();
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const frameThickness = 0.5;
    
    const glass = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.2), windowMaterial);
    windowGroup.add(glass);

    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(width + frameThickness, frameThickness, 0.4), frameMaterial);
    topFrame.position.y = height / 2 + frameThickness / 2;
    windowGroup.add(topFrame);
    
    const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(width + frameThickness, frameThickness, 0.4), frameMaterial);
    bottomFrame.position.y = -height / 2 - frameThickness / 2;
    windowGroup.add(bottomFrame);

    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, height + frameThickness, 0.4), frameMaterial);
    leftFrame.position.x = -width / 2 - frameThickness / 2;
    windowGroup.add(leftFrame);

    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, height + frameThickness, 0.4), frameMaterial);
    rightFrame.position.x = width / 2 + frameThickness / 2;
    windowGroup.add(rightFrame);

    // Cross-frame
    const horizontalBar = new THREE.Mesh(new THREE.BoxGeometry(width, frameThickness, 0.4), frameMaterial);
    windowGroup.add(horizontalBar);
    
    const verticalBar = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, height, 0.4), frameMaterial);
    windowGroup.add(verticalBar);

    return windowGroup;
  }

  // Add windows to the main building
  const window1 = createWindow(8, 12);
  window1.position.set(-25, 25, 25.1);
  mansion.add(window1);

  const window2 = createWindow(8, 12);
  window2.position.set(25, 25, 25.1);
  mansion.add(window2);
  
  // Left Wing
  const leftWingGeom = new THREE.BoxGeometry(50, 30, 60);
  const leftWing = new THREE.Mesh(leftWingGeom, mansionMaterial);
  leftWing.position.set(-65, 15, 0);
  mansion.add(leftWing);

  const leftRoofGeom = new THREE.BoxGeometry(50, 2, 60);
  const leftRoof = new THREE.Mesh(leftRoofGeom, roofMaterial);
  leftRoof.position.set(-65, 31, 0);
  mansion.add(leftRoof);

  // Windows on Left Wing - Front
  for(let i = 0; i < 5; i++) {
    const window = createWindow(6, 10);
    window.position.set(-40.1, 18, 24 + i * -12);
    window.rotation.y = Math.PI / 2; // Rotate to face outwards
    mansion.add(window);
  }
  
  // Windows on Left Wing - Side
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            const window = createWindow(6, 10);
            window.position.set(-65, 10 + j * 12, 20 + i * -40);
            mansion.add(window);
        }
    }


  // Right Wing
  const rightWingGeom = new THREE.BoxGeometry(50, 30, 60);
  const rightWing = new THREE.Mesh(rightWingGeom, mansionMaterial);
  rightWing.position.set(65, 15, 0);
  mansion.add(rightWing);

  const rightRoofGeom = new THREE.BoxGeometry(50, 2, 60);
  const rightRoof = new THREE.Mesh(rightRoofGeom, roofMaterial);
  rightRoof.position.set(65, 31, 0);
  mansion.add(rightRoof);

  // Windows on Right Wing - Front
  for(let i = 0; i < 5; i++) {
    const window = createWindow(6, 10);
    window.position.set(40.1, 18, 24 + i * -12);
    window.rotation.y = -Math.PI / 2; // Rotate to face outwards
    mansion.add(window);
  }
  
  // Windows on Right Wing - Side
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            const window = createWindow(6, 10);
            window.position.set(65, 10 + j * 12, 20 + i * -40);
            mansion.add(window);
        }
    }

  // Entrance pillars
  const pillarGeom = new THREE.CylinderGeometry(4, 4, 30, 16);
  const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0xd4c8b0 });
  const pillar1 = new THREE.Mesh(pillarGeom, pillarMaterial);
  pillar1.position.set(-20, 15, 30);
  mansion.add(pillar1);
  const pillar2 = new THREE.Mesh(pillarGeom, pillarMaterial);
  pillar2.position.set(20, 15, 30);
  mansion.add(pillar2);
  
  // Parking Area
  const parkingGeom = new THREE.PlaneGeometry(120, 80);
  const parkingMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const parkingArea = new THREE.Mesh(parkingGeom, parkingMaterial);
  parkingArea.rotation.x = -Math.PI / 2;
  parkingArea.position.y = 0.15;
  parkingArea.position.z = 60; // In front of the pillars
  mansion.add(parkingArea);

  return mansion;
}
