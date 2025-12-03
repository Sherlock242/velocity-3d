
import * as THREE from 'three';

export function createCollegeBuilding() {
  const collegeGroup = new THREE.Group();

  const longWingWidth = 400;
  const shortWingWidth = 250;
  const wingDepth = 30;
  const numFloors = 4;
  const floorHeight = 15;
  const totalHeight = numFloors * floorHeight;

  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.8 });
  const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.7 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9 });
  
  function createWing(width: number, depth: number) {
      const wing = new THREE.Group();

      for (let i = 0; i < numFloors; i++) {
          const yPos = i * floorHeight;

          // Floor base
          const floorGeom = new THREE.PlaneGeometry(width, depth);
          const floor = new THREE.Mesh(floorGeom, floorMaterial);
          floor.rotation.x = -Math.PI / 2;
          floor.position.set(0, yPos, 0);
          wing.add(floor);

          // Back wall
          const wallGeom = new THREE.BoxGeometry(width, floorHeight, 1);
          const wall = new THREE.Mesh(wallGeom, redMaterial);
          wall.position.set(0, yPos + floorHeight / 2, -depth / 2);
          wing.add(wall);
          
          // Yellow border below windows
          const borderGeom = new THREE.BoxGeometry(width, 1, 1.2);
          const border = new THREE.Mesh(borderGeom, yellowMaterial);
          border.position.set(0, yPos + floorHeight - 5, -depth / 2 + 1);
          wing.add(border);

          // Pillars
          const pillarGeom = new THREE.BoxGeometry(4, floorHeight, 4);
          const numPillars = Math.floor(width / 20);
          for (let j = 0; j < numPillars; j++) {
              const pillar = new THREE.Mesh(pillarGeom, redMaterial);
              const xPos = -width/2 + 10 + j * 20;
              pillar.position.set(xPos, yPos + floorHeight / 2, depth / 2 - 5);
              wing.add(pillar);
          }
      }
      return wing;
  }
  
  const courtyardWidth = longWingWidth - wingDepth * 2;
  const courtyardDepth = shortWingWidth - wingDepth * 2;
  
  const college = new THREE.Group();

  // Back Wing (long)
  const backWing = createWing(longWingWidth, wingDepth);
  backWing.position.z = -shortWingWidth / 2;
  college.add(backWing);
  
  // Front Wing (long)
  const frontWing = createWing(longWingWidth, wingDepth);
  frontWing.position.z = shortWingWidth / 2;
  frontWing.rotation.y = Math.PI;
  college.add(frontWing);

  // Left Wing (short)
  const leftWing = createWing(shortWingWidth, wingDepth);
  leftWing.position.x = -longWingWidth / 2;
  leftWing.rotation.y = Math.PI / 2;
  college.add(leftWing);
  
  // Right Wing (short)
  const rightWing = createWing(shortWingWidth, wingDepth);
  rightWing.position.x = longWingWidth / 2;
  rightWing.rotation.y = -Math.PI / 2;
  college.add(rightWing);

  // Courtyard Ground
  const groundGeom = new THREE.PlaneGeometry(courtyardWidth, courtyardDepth);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x55903c });
  const ground = new THREE.Mesh(groundGeom, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.1;
  college.add(ground);

  // Small structure in courtyard
  const hutGeom = new THREE.CylinderGeometry(15, 15, 10, 8);
  const hutMaterial = new THREE.MeshStandardMaterial({color: 0x9a3e3e});
  const hut = new THREE.Mesh(hutGeom, hutMaterial);
  hut.position.y = 5;
  hut.position.z = 0;
  college.add(hut);
  
  collegeGroup.add(college);


  // --- Compound Wall ---
  const wallGroup = new THREE.Group();
  const plotWidth = longWingWidth + 100;
  const plotDepth = shortWingWidth + 100;
  const wallHeight = 15;
  const wallThickness = 5;
  const gateWidth = 40;
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.8 });

  function createWallSegment(width: number, depth: number) {
      const wallGeom = new THREE.BoxGeometry(width, wallHeight, depth);
      const wallMesh = new THREE.Mesh(wallGeom, wallMaterial);
      wallMesh.position.y = wallHeight / 2;
      return wallMesh;
  }
  
  // Back wall
  const backWall = createWallSegment(plotWidth, wallThickness);
  backWall.position.z = -plotDepth / 2;
  wallGroup.add(backWall);

  // Side walls
  const leftWall = createWallSegment(wallThickness, plotDepth);
  leftWall.position.x = -plotWidth / 2;
  wallGroup.add(leftWall);
  
  const rightWall = createWallSegment(wallThickness, plotDepth);
  rightWall.position.x = plotWidth / 2;
  wallGroup.add(rightWall);

  // Front wall (with gate)
  const frontWallSegmentWidth = (plotWidth - gateWidth) / 2;
  const frontWallLeft = createWallSegment(frontWallSegmentWidth, wallThickness);
  frontWallLeft.position.x = -(gateWidth / 2 + frontWallSegmentWidth / 2);
  frontWallLeft.position.z = plotDepth / 2;
  wallGroup.add(frontWallLeft);

  const frontWallRight = createWallSegment(frontWallSegmentWidth, wallThickness);
  frontWallRight.position.x = (gateWidth / 2 + frontWallSegmentWidth / 2);
  frontWallRight.position.z = plotDepth / 2;
  wallGroup.add(frontWallRight);
  
  collegeGroup.add(wallGroup);


  collegeGroup.castShadow = true;
  collegeGroup.receiveShadow = true;

  return collegeGroup;
}
