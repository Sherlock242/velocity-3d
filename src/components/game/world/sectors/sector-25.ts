
import * as THREE from 'three';
import { CELL_SIZE, ROAD_WIDTH } from '@/lib/game-constants';
import type { MutableRefObject } from 'react';

type Sector25Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

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
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x9a3e3e }); // Red brick color
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

  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Gray road

  // Front Wall (+Z)
  const frontWallSegmentWidth = (plotWidth - gateWidth) / 2;
  const frontWallZ = cellCenterZ + plotDepth / 2 - wallThickness / 2;

  const frontWallLeft = createBrokenBrickWallSegment(frontWallSegmentWidth, wallThickness);
  frontWallLeft.position.set(cellCenterX - gateWidth / 2 - frontWallSegmentWidth / 2, 0, frontWallZ);
  wallGroup.add(frontWallLeft);

  const frontWallRight = createBrokenBrickWallSegment(frontWallSegmentWidth, wallThickness);
  frontWallRight.position.set(cellCenterX + gateWidth / 2 + frontWallSegmentWidth / 2, 0, frontWallZ);
  wallGroup.add(frontWallRight);
  
  const frontRoadGeom = new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_WIDTH);
  const frontRoad = new THREE.Mesh(frontRoadGeom, roadMaterial);
  frontRoad.rotation.x = -Math.PI / 2;
  frontRoad.position.set(cellCenterX, 0.1, cellCenterZ + plotDepth / 2 - ROAD_WIDTH / 2);
  sectorGroup.add(frontRoad);


  // Back Wall (-Z)
  const backWallZ = cellCenterZ - plotDepth / 2 + wallThickness / 2;
  const backWallLeft = createBrokenBrickWallSegment(frontWallSegmentWidth, wallThickness);
  backWallLeft.position.set(cellCenterX - gateWidth / 2 - frontWallSegmentWidth / 2, 0, backWallZ);
  wallGroup.add(backWallLeft);

  const backWallRight = createBrokenBrickWallSegment(frontWallSegmentWidth, wallThickness);
  backWallRight.position.set(cellCenterX + gateWidth / 2 + frontWallSegmentWidth / 2, 0, backWallZ);
  wallGroup.add(backWallRight);
  
  const backRoadGeom = new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_WIDTH);
  const backRoad = new THREE.Mesh(backRoadGeom, roadMaterial);
  backRoad.rotation.x = -Math.PI / 2;
  backRoad.position.set(cellCenterX, 0.1, cellCenterZ - plotDepth / 2 + ROAD_WIDTH / 2);
  sectorGroup.add(backRoad);

  // Left Wall (-X)
  const leftWallSegmentHeight = (plotDepth - gateWidth) / 2;
  const leftWallX = cellCenterX - plotWidth / 2 + wallThickness / 2;
  
  const leftWallTop = createBrokenBrickWallSegment(wallThickness, leftWallSegmentHeight);
  leftWallTop.position.set(leftWallX, 0, cellCenterZ + gateWidth / 2 + leftWallSegmentHeight / 2);
  wallGroup.add(leftWallTop);
  
  const leftWallBottom = createBrokenBrickWallSegment(wallThickness, leftWallSegmentHeight);
  leftWallBottom.position.set(leftWallX, 0, cellCenterZ - gateWidth / 2 - leftWallSegmentHeight / 2);
  wallGroup.add(leftWallBottom);

  const leftRoadGeom = new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_WIDTH);
  const leftRoad = new THREE.Mesh(leftRoadGeom, roadMaterial);
  leftRoad.rotation.x = -Math.PI / 2;
  leftRoad.position.set(cellCenterX - plotWidth / 2 + ROAD_WIDTH/2, 0.1, cellCenterZ);
  sectorGroup.add(leftRoad);


  // Right Wall (+X)
  const rightWallX = cellCenterX + plotWidth / 2 - wallThickness / 2;

  const rightWallTop = createBrokenBrickWallSegment(wallThickness, leftWallSegmentHeight);
  rightWallTop.position.set(rightWallX, 0, cellCenterZ + gateWidth / 2 + leftWallSegmentHeight / 2);
  wallGroup.add(rightWallTop);
  
  const rightWallBottom = createBrokenBrickWallSegment(wallThickness, leftWallSegmentHeight);
  rightWallBottom.position.set(rightWallX, 0, cellCenterZ - gateWidth / 2 - leftWallSegmentHeight / 2);
  wallGroup.add(rightWallBottom);

  const rightRoadGeom = new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_WIDTH);
  const rightRoad = new THREE.Mesh(rightRoadGeom, roadMaterial);
  rightRoad.rotation.x = -Math.PI / 2;
  rightRoad.position.set(cellCenterX + plotWidth / 2 - ROAD_WIDTH / 2, 0.1, cellCenterZ);
  sectorGroup.add(rightRoad);


  sectorGroup.add(wallGroup);
  staticCollidersRef.current.push(wallGroup);


  return sectorGroup;
}
