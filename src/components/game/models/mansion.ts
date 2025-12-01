
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

  // Add windows to the main building front
  const windowPositionsFront = [
    { x: -25, y: 15 }, { x: 25, y: 15 },
  ];
  windowPositionsFront.forEach(pos => {
    const window = createWindow(8, 10);
    window.position.set(pos.x, pos.y, 25.1);
    mansion.add(window);
  });

  // Add windows to main building sides
  for(let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const windowLeft = createWindow(8, 10);
      windowLeft.position.set(-40.1, 15 + j * 15, 10 + i * -20);
      windowLeft.rotation.y = Math.PI / 2;
      mansion.add(windowLeft);

      const windowRight = createWindow(8, 10);
      windowRight.position.set(40.1, 15 + j * 15, 10 + i * -20);
      windowRight.rotation.y = -Math.PI / 2;
      mansion.add(windowRight);
    }
  }
  
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
  for (let i = 0; i < 2; i++) {
    const window = createWindow(6, 10);
    window.position.set(-55 - i * 20, 15, 30.1);
    mansion.add(window);
  }
  
  // Windows on Left Wing - Side
  for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
          const window = createWindow(6, 10);
          window.position.set(-90.1, 10 + j * 12, -20 + i * 20);
          window.rotation.y = Math.PI / 2;
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
  for (let i = 0; i < 2; i++) {
    const window = createWindow(6, 10);
    window.position.set(55 + i * 20, 15, 30.1);
    mansion.add(window);
  }
  
  // Windows on Right Wing - Side
  for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
          const window = createWindow(6, 10);
          window.position.set(90.1, 10 + j * 12, -20 + i * 20);
          window.rotation.y = -Math.PI / 2;
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
  const parkingGeom = new THREE.PlaneGeometry(180, 100);
  const parkingMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const parkingArea = new THREE.Mesh(parkingGeom, parkingMaterial);
  parkingArea.rotation.x = -Math.PI / 2;
  parkingArea.position.y = 0.15;
  parkingArea.position.z = 80;
  mansion.add(parkingArea);

  // Outer Wall
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // SaddleBrown color
  const wallHeight = 10;
  const wallThickness = 2;
  const wallLength = 80;

  // Left wall
  const leftWallGeom = new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);
  const leftWall = new THREE.Mesh(leftWallGeom, wallMaterial);
  leftWall.position.set(-50, wallHeight / 2, 130);
  mansion.add(leftWall);

  // Right wall
  const rightWall = new THREE.Mesh(leftWallGeom, wallMaterial);
  rightWall.position.set(50, wallHeight / 2, 130);
  mansion.add(rightWall);

  // Entrance Pillars for outer wall
  const entrancePillarGeom = new THREE.BoxGeometry(5, wallHeight + 2, 5);
  const entrancePillar1 = new THREE.Mesh(entrancePillarGeom, pillarMaterial);
  entrancePillar1.position.set(-10, (wallHeight + 2) / 2, 130);
  mansion.add(entrancePillar1);
  const entrancePillar2 = new THREE.Mesh(entrancePillarGeom, pillarMaterial);
  entrancePillar2.position.set(10, (wallHeight + 2) / 2, 130);
  mansion.add(entrancePillar2);


  // Fountain
  const fountain = new THREE.Group();
  const fountainMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5 });
  const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x4682B4, transparent: true, opacity: 0.7 });

  const baseGeom = new THREE.CylinderGeometry(15, 15, 2, 32);
  const base = new THREE.Mesh(baseGeom, fountainMaterial);
  base.position.y = 1;
  fountain.add(base);

  const baseWaterGeom = new THREE.CylinderGeometry(14.5, 14.5, 1.5, 32);
  const baseWater = new THREE.Mesh(baseWaterGeom, waterMaterial);
  baseWater.position.y = 1.25;
  fountain.add(baseWater);

  const tier1Geom = new THREE.CylinderGeometry(8, 8, 4, 32);
  const tier1 = new THREE.Mesh(tier1Geom, fountainMaterial);
  tier1.position.y = 3;
  fountain.add(tier1);

  const tier2Geom = new THREE.CylinderGeometry(4, 4, 3, 32);
  const tier2 = new THREE.Mesh(tier2Geom, fountainMaterial);
  tier2.position.y = 6;
  fountain.add(tier2);

  fountain.position.z = 80;
  mansion.add(fountain);


  return mansion;
}
