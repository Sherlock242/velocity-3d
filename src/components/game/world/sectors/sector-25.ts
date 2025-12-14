
import * as THREE from 'three';
import { CELL_SIZE, ROAD_WIDTH } from '@/lib/game-constants';
import type { MutableRefObject } from 'react';
import { createGraveyard } from '../../models/graveyard';
import { createSimpleHouse } from '../../models/simple-house';
import { createIndustrialBuilding } from '../../models/industrial-building';
import { createSchoolBuilding } from '../../models/school-building';
import { createHospitalBuilding } from '../../models/hospital-building';

type Sector25Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

// Helper function to create a procedural brick texture
function createBrickTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  const brickColor = '#9a3e3e';
  const mortarColor = '#888888';
  const brickHeight = 32;
  const brickWidth = 64;
  const mortarThickness = 4;

  // Fill background with mortar color
  context.fillStyle = mortarColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = brickColor;

  for (let row = 0; row * brickHeight < canvas.height; row++) {
    for (let col = 0; col * brickWidth < canvas.width; col++) {
      let offsetX = 0;
      if (row % 2 === 1) {
        offsetX = -brickWidth / 2;
      }
      context.fillRect(
        (col * brickWidth) + offsetX,
        row * brickHeight,
        brickWidth - mortarThickness,
        brickHeight - mortarThickness
      );
    }
    // Draw wrapped-around brick for staggered rows
    if (row % 2 === 1) {
        context.fillRect(
            canvas.width - (brickWidth/2),
            row * brickHeight,
            brickWidth - mortarThickness,
            brickHeight - mortarThickness
        );
    }
  }


  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 5); // Adjust repeat to control brick size on the wall
  
  return texture;
}


export function createSector25({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector25Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const plotWidth = CELL_SIZE - ROAD_WIDTH;
  const plotDepth = CELL_SIZE - ROAD_WIDTH;

  const wallGroup = new THREE.Group();
  wallGroup.name = 'compoundWall';
  const wallHeight = 15;
  const wallThickness = 8;
  const wallSegmentHeight = wallHeight * 0.8;
  const gateWidth = 80;

  function createBrokenBrickWallSegment(width: number, depth: number) {
    const segment = new THREE.Group();
    const brickTexture = createBrickTexture();
    const wallMaterial = new THREE.MeshStandardMaterial({
        map: brickTexture,
        color: 0xffffff, // Use white to not tint the texture
      }); 

    const mainWallGeom = new THREE.BoxGeometry(width, wallSegmentHeight, depth);
    const mainWall = new THREE.Mesh(mainWallGeom, wallMaterial);
    mainWall.position.y = wallSegmentHeight / 2;
    segment.add(mainWall);

    // Add "broken" top bricks
    const numBricks = Math.floor(width / 10);
    for (let i = 0; i < numBricks; i++) {
        if(Math.random() < 0.3) continue; // Skip some bricks for a more broken look
        const brickHeight = wallHeight - wallSegmentHeight;
        const brickGeom = new THREE.BoxGeometry(10, brickHeight, depth);
        const brick = new THREE.Mesh(brickGeom, wallMaterial);
        brick.position.set(
            -width / 2 + i * 10 + 5,
            wallSegmentHeight + (Math.random() * brickHeight / 2),
            (Math.random() - 0.5) * 2
        );
        brick.rotation.y = (Math.random() - 0.5) * 0.1;
        segment.add(brick);
    }
    return segment;
  }
  
  // Add a gray ground plane for the whole sector to cover the default green grass
  const sectorGroundGeom = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE);
  const sectorGroundMat = new THREE.MeshStandardMaterial({ color: 0x404040 }); // Dark gray
  const sectorGround = new THREE.Mesh(sectorGroundGeom, sectorGroundMat);
  sectorGround.rotation.x = -Math.PI / 2;
  sectorGround.position.set(cellCenterX, 0.05, cellCenterZ); // Slightly above default ground
  sectorGround.receiveShadow = true;
  sectorGroup.add(sectorGround);


  // --- Roads ---
  // Vertical Road (North-South)
  const verticalRoadGeom = new THREE.PlaneGeometry(ROAD_WIDTH, plotDepth);
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Gray road
  const verticalRoad = new THREE.Mesh(verticalRoadGeom, roadMaterial);
  verticalRoad.rotation.x = -Math.PI / 2;
  verticalRoad.position.set(cellCenterX, 0.1, cellCenterZ);
  sectorGroup.add(verticalRoad);

  // Horizontal Road (East-West)
  const horizontalRoadGeom = new THREE.PlaneGeometry(plotWidth, ROAD_WIDTH);
  const horizontalRoad = new THREE.Mesh(horizontalRoadGeom, roadMaterial);
  horizontalRoad.rotation.x = -Math.PI / 2;
  horizontalRoad.position.set(cellCenterX, 0.1, cellCenterZ);
  sectorGroup.add(horizontalRoad);


  // --- Walls ---
  // Front Wall (+Z)
  const frontWallSegmentWidth = (plotWidth - gateWidth) / 2;
  const frontWallZ = cellCenterZ + plotDepth / 2 - wallThickness / 2;

  const frontWallLeft = createBrokenBrickWallSegment(frontWallSegmentWidth, wallThickness);
  frontWallLeft.position.set(cellCenterX - gateWidth / 2 - frontWallSegmentWidth / 2, 0, frontWallZ);
  wallGroup.add(frontWallLeft);

  const frontWallRight = createBrokenBrickWallSegment(frontWallSegmentWidth, wallThickness);
  frontWallRight.position.set(cellCenterX + gateWidth / 2 + frontWallSegmentWidth / 2, 0, frontWallZ);
  wallGroup.add(frontWallRight);

  // Back Wall (-Z)
  const backWallZ = cellCenterZ - plotDepth / 2 + wallThickness / 2;
  const backWallLeft = createBrokenBrickWallSegment(frontWallSegmentWidth, wallThickness);
  backWallLeft.position.set(cellCenterX - gateWidth / 2 - frontWallSegmentWidth / 2, 0, backWallZ);
  wallGroup.add(backWallLeft);

  const backWallRight = createBrokenBrickWallSegment(frontWallSegmentWidth, wallThickness);
  backWallRight.position.set(cellCenterX + gateWidth / 2 + frontWallSegmentWidth / 2, 0, backWallZ);
  wallGroup.add(backWallRight);

  // Left Wall (-X)
  const leftWallSegmentHeight = (plotDepth - gateWidth) / 2;
  const leftWallX = cellCenterX - plotWidth / 2 + wallThickness / 2;
  
  const leftWallTop = createBrokenBrickWallSegment(wallThickness, leftWallSegmentHeight);
  leftWallTop.position.set(leftWallX, 0, cellCenterZ + gateWidth / 2 + leftWallSegmentHeight / 2);
  wallGroup.add(leftWallTop);
  
  const leftWallBottom = createBrokenBrickWallSegment(wallThickness, leftWallSegmentHeight);
  leftWallBottom.position.set(leftWallX, 0, cellCenterZ - gateWidth / 2 - leftWallSegmentHeight / 2);
  wallGroup.add(leftWallBottom);

  // Right Wall (+X)
  const rightWallX = cellCenterX + plotWidth / 2 - wallThickness / 2;

  const rightWallTop = createBrokenBrickWallSegment(wallThickness, leftWallSegmentHeight);
  rightWallTop.position.set(rightWallX, 0, cellCenterZ + gateWidth / 2 + leftWallSegmentHeight / 2);
  wallGroup.add(rightWallTop);
  
  const rightWallBottom = createBrokenBrickWallSegment(wallThickness, leftWallSegmentHeight);
  rightWallBottom.position.set(rightWallX, 0, cellCenterZ - gateWidth / 2 - leftWallSegmentHeight / 2);
  wallGroup.add(rightWallBottom);

  sectorGroup.add(wallGroup);
  // staticCollidersRef.current.push(wallGroup);

  // --- Statue ---
  const statueGroup = new THREE.Group();
  statueGroup.position.set(cellCenterX, 0, cellCenterZ);

  // Pedestal
  const pedestalHeight = 5;
  const pedestalGeom = new THREE.CylinderGeometry(15, 18, pedestalHeight, 16);
  const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const pedestal = new THREE.Mesh(pedestalGeom, pedestalMaterial);
  pedestal.position.y = pedestalHeight / 2;
  statueGroup.add(pedestal);

  // Statue Object
  const statueGeom = new THREE.SphereGeometry(10, 32, 16);
  const statueMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.3 });
  const statue = new THREE.Mesh(statueGeom, statueMaterial);
  statue.position.y = pedestalHeight + 10;
  statueGroup.add(statue);
  
  sectorGroup.add(statueGroup);
  // staticCollidersRef.current.push(statueGroup);

  // --- Quadrant Content ---
  const quadrantSize = (CELL_SIZE - ROAD_WIDTH) / 2;
  const quadrantOffset = quadrantSize / 2 + ROAD_WIDTH / 2;

  // Quadrant 1: Top-Left (Graveyard)
  const graveyard = createGraveyard();
  graveyard.position.set(cellCenterX - quadrantOffset, 0, cellCenterZ - quadrantOffset);
  sectorGroup.add(graveyard);
  // staticCollidersRef.current.push(graveyard);

  // Quadrant 2: Top-Right (Residential)
  const residentialArea = new THREE.Group();
  residentialArea.position.set(cellCenterX + quadrantOffset, 0, cellCenterZ - quadrantOffset);
  for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
          const house = createSimpleHouse();
          const x = (i - 2) * 80;
          const z = (j - 2) * 80;
          house.position.set(x, 0, z);
          house.rotation.y = (Math.random() - 0.5) * Math.PI;
          residentialArea.add(house);
          // staticCollidersRef.current.push(house);
      }
  }
  sectorGroup.add(residentialArea);
  
  // Quadrant 3: Bottom-Left (Industrial)
  const industrialArea = new THREE.Group();
  industrialArea.position.set(cellCenterX - quadrantOffset, 0, cellCenterZ + quadrantOffset);
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
        const building = createIndustrialBuilding();
        const x = (i - 0.5) * 200;
        const z = (j - 0.5) * 200;
        building.position.set(x, 0, z);
        building.rotation.y = Math.random() * Math.PI * 2;
        industrialArea.add(building);
        // staticCollidersRef.current.push(building);
    }
  }
  sectorGroup.add(industrialArea);

  // Quadrant 4: Bottom-Right (School & Hospital)
  const publicServicesArea = new THREE.Group();
  publicServicesArea.position.set(cellCenterX + quadrantOffset, 0, cellCenterZ + quadrantOffset);
  
  const school = createSchoolBuilding();
  school.position.set(-100, 0, 0);
  publicServicesArea.add(school);
  // staticCollidersRef.current.push(school);
  
  const hospital = createHospitalBuilding();
  hospital.position.set(100, 0, 0);
  publicServicesArea.add(hospital);
  // staticCollidersRef.current.push(hospital);

  sectorGroup.add(publicServicesArea);


  return sectorGroup;
}
