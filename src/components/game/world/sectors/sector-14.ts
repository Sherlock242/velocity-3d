
import * as THREE from 'three';
import { createPunjabUniversity } from '../../models/punjab-university';
import { createDepartmentBuilding } from '../../models/department-building';
import { CELL_SIZE, ROAD_WIDTH } from '@/lib/game-constants';
import type { MutableRefObject } from 'react';

type Sector14Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  rampMeshRef: MutableRefObject<THREE.Mesh | undefined>;
  rampWallsRef: MutableRefObject<THREE.Group | undefined>;
  universityRamp: MutableRefObject<THREE.Mesh | undefined>;
};

export function createSector14({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  rampMeshRef,
  rampWallsRef,
  universityRamp,
}: Sector14Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  // Main University Library
  const { university, library, walkableGroup, rampWalls: walls } = createPunjabUniversity();
  university.position.set(cellCenterX, 0, cellCenterZ);
  university.rotation.y = -Math.PI / 2;
  sectorGroup.add(university);
  
  if (walls) {
    rampWallsRef.current = walls;
  }

  // Add only the building part to colliders
  if (library) {
    staticCollidersRef.current.push(library);
  }
  
  const rampMesh = walkableGroup.getObjectByName('universityRamp') as THREE.Mesh;
  if (rampMesh) {
    universityRamp.current = rampMesh;
  }
  
  // --- Department Connecting Roads ---
  const innerRoadGroup = new THREE.Group();
  const innerRoadMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const darkGrayRoadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const campusRoadWidth = 50;
  const ringRoadOffset = 250; 

  const ringRoadSize = ringRoadOffset * 2 - campusRoadWidth;
  const horizontalRoadGeom = new THREE.PlaneGeometry(ringRoadSize, campusRoadWidth);
  const verticalRoadGeom = new THREE.PlaneGeometry(campusRoadWidth, ringRoadSize + campusRoadWidth);

  // Top Road
  const topRoad = new THREE.Mesh(horizontalRoadGeom, innerRoadMaterial);
  topRoad.rotation.x = -Math.PI / 2;
  topRoad.position.set(cellCenterX, 0.1, cellCenterZ + ringRoadOffset);
  innerRoadGroup.add(topRoad);

  // Bottom Road
  const bottomRoad = new THREE.Mesh(horizontalRoadGeom, innerRoadMaterial);
  bottomRoad.rotation.x = -Math.PI / 2;
  bottomRoad.position.set(cellCenterX, 0.1, cellCenterZ - ringRoadOffset);
  innerRoadGroup.add(bottomRoad);

  // Left Road
  const leftRoad = new THREE.Mesh(verticalRoadGeom, innerRoadMaterial);
  leftRoad.rotation.x = -Math.PI / 2;
  leftRoad.position.set(cellCenterX - ringRoadOffset, 0.1, cellCenterZ);
  innerRoadGroup.add(leftRoad);

  // Right Road
  const rightRoad = new THREE.Mesh(verticalRoadGeom, innerRoadMaterial);
  rightRoad.rotation.x = -Math.PI / 2;
  rightRoad.position.set(cellCenterX + ringRoadOffset, 0.1, cellCenterZ);
  innerRoadGroup.add(rightRoad);
  
  // Road Corners
  const cornerGeom = new THREE.PlaneGeometry(campusRoadWidth, campusRoadWidth);
  const cornerPositions = [
      { x: cellCenterX - ringRoadOffset, z: cellCenterZ - ringRoadOffset },
      { x: cellCenterX + ringRoadOffset, z: cellCenterZ - ringRoadOffset },
      { x: cellCenterX - ringRoadOffset, z: cellCenterZ + ringRoadOffset },
      { x: cellCenterX + ringRoadOffset, z: cellCenterZ + ringRoadOffset },
  ];
  cornerPositions.forEach(pos => {
      const corner = new THREE.Mesh(cornerGeom, innerRoadMaterial);
      corner.rotation.x = -Math.PI / 2;
      corner.position.set(pos.x, 0.1, pos.z);
      innerRoadGroup.add(corner);
  });

  sectorGroup.add(innerRoadGroup);

  // --- Department Buildings ---
  const buildingOffset = 420;
  const pathWidth = 15;
  const pathLength = buildingOffset - ringRoadOffset - campusRoadWidth / 2;
  
  const buildingSpacing = 250;

  const deptPositions = [
      // Back wall (-Z) - 2 buildings
      { x: cellCenterX - buildingSpacing, z: cellCenterZ - buildingOffset, rot: 0 },
      { x: cellCenterX + buildingSpacing, z: cellCenterZ - buildingOffset, rot: 0 },
      // Front wall (+Z) - 2 buildings
      { x: cellCenterX - buildingSpacing, z: cellCenterZ + buildingOffset, rot: Math.PI },
      { x: cellCenterX + buildingSpacing, z: cellCenterZ + buildingOffset, rot: Math.PI },
      // Left wall (-X) - 2 buildings
      { x: cellCenterX - buildingOffset, z: cellCenterZ - buildingSpacing, rot: Math.PI / 2 },
      { x: cellCenterX - buildingOffset, z: cellCenterZ + buildingSpacing, rot: Math.PI / 2 },
      // Right wall (+X) - 2 buildings
      { x: cellCenterX + buildingOffset, z: cellCenterZ - buildingSpacing, rot: -Math.PI / 2 },
      { x: cellCenterX + buildingOffset, z: cellCenterZ + buildingSpacing, rot: -Math.PI / 2 },
  ];

  deptPositions.forEach(pos => {
      const deptBuilding = createDepartmentBuilding();
      deptBuilding.position.set(pos.x, 0, pos.z);
      deptBuilding.rotation.y = pos.rot;
      sectorGroup.add(deptBuilding);
      staticCollidersRef.current.push(deptBuilding);
      
      // Add connecting dark gray path
      const pathGeom = new THREE.PlaneGeometry(pathWidth, pathLength);
      const path = new THREE.Mesh(pathGeom, darkGrayRoadMaterial);
      path.rotation.x = -Math.PI/2;
      
      const pathOffset = ringRoadOffset + campusRoadWidth/2 + pathLength / 2;
      let pathX = pos.x;
      let pathZ = pos.z;
      let pathRotation = 0;

      if(pos.rot === 0) { // Back wall
           pathZ = cellCenterZ - pathOffset;
      } else if (pos.rot === Math.PI) { // Front wall
           pathZ = cellCenterZ + pathOffset;
      } else if (pos.rot === Math.PI / 2) { // Left wall
          pathX = cellCenterX - pathOffset;
          pathZ = pos.z;
          pathRotation = Math.PI / 2;
      } else { // Right wall
          pathX = cellCenterX + pathOffset;
          pathZ = pos.z;
          pathRotation = Math.PI / 2;
      }
      path.position.set(pathX, 0.12, pathZ);
      path.rotation.z = pathRotation;
      sectorGroup.add(path);
  });

  // --- Sector 14 Boundary Walls ---
  const wallGroup = new THREE.Group();
  const wallHeight = 20;
  const wallThickness = 10;
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcb4154 }); // Red color

  const gateWidth = 80;
  const halfCell = CELL_SIZE / 2;
  const outerEdge = halfCell - ROAD_WIDTH / 2;
  const sideWallLen = CELL_SIZE - ROAD_WIDTH;
  const wallSegmentLen = (sideWallLen - gateWidth) / 2;
  const segmentOffset = gateWidth / 2 + wallSegmentLen / 2;
  const wallPosition = outerEdge - wallThickness / 2;

  function createWallSegment(width: number, depth: number) {
    const segment = new THREE.Group();
    const mainWallGeom = new THREE.BoxGeometry(width, wallHeight, depth);
    const mainWall = new THREE.Mesh(mainWallGeom, wallMaterial);
    mainWall.position.y = wallHeight / 2;
    segment.add(mainWall);
    return segment;
  }

  // Front Wall (+Z)
  const frontWallLeft = createWallSegment(wallSegmentLen, wallThickness);
  frontWallLeft.position.set(cellCenterX - segmentOffset, 0, cellCenterZ + wallPosition);
  wallGroup.add(frontWallLeft);
  const frontWallRight = createWallSegment(wallSegmentLen, wallThickness);
  frontWallRight.position.set(cellCenterX + segmentOffset, 0, cellCenterZ + wallPosition);
  wallGroup.add(frontWallRight);

  // Back Wall (-Z)
  const backWallLeft = createWallSegment(wallSegmentLen, wallThickness);
  backWallLeft.position.set(cellCenterX - segmentOffset, 0, cellCenterZ - wallPosition);
  wallGroup.add(backWallLeft);
  const backWallRight = createWallSegment(wallSegmentLen, wallThickness);
  backWallRight.position.set(cellCenterX + segmentOffset, 0, cellCenterZ - wallPosition);
  wallGroup.add(backWallRight);

  // Left Wall (-X)
  const leftWallTop = createWallSegment(wallThickness, wallSegmentLen);
  leftWallTop.position.set(cellCenterX - wallPosition, 0, cellCenterZ + segmentOffset);
  wallGroup.add(leftWallTop);
  const leftWallBottom = createWallSegment(wallThickness, wallSegmentLen);
  leftWallBottom.position.set(cellCenterX - wallPosition, 0, cellCenterZ - segmentOffset);
  wallGroup.add(leftWallBottom);

  // Right Wall (+X)
  const rightWallTop = createWallSegment(wallThickness, wallSegmentLen);
  rightWallTop.position.set(cellCenterX + wallPosition, 0, cellCenterZ + segmentOffset);
  wallGroup.add(rightWallTop);
  const rightWallBottom = createWallSegment(wallThickness, wallSegmentLen);
  rightWallBottom.position.set(cellCenterX + wallPosition, 0, cellCenterZ - segmentOffset);
  wallGroup.add(rightWallBottom);

  sectorGroup.add(wallGroup);
  wallGroup.children.forEach(wall => staticCollidersRef.current.push(wall as THREE.Group));

  // --- Connect main roads to campus roads ---
  const connectionRoadLength = (halfCell - ROAD_WIDTH / 2) - (ringRoadOffset + campusRoadWidth / 2);
  const connectionRoadWidth = ROAD_WIDTH;

  const connectionPositions = [
      { x: cellCenterX, z: cellCenterZ + ringRoadOffset + campusRoadWidth / 2 + connectionRoadLength / 2, len: connectionRoadLength, rot: 0 }, // Top
      { x: cellCenterX, z: cellCenterZ - ringRoadOffset - campusRoadWidth / 2 - connectionRoadLength / 2, len: connectionRoadLength, rot: 0 }, // Bottom
      { x: cellCenterX + ringRoadOffset + campusRoadWidth / 2 + connectionRoadLength / 2, z: cellCenterZ, len: connectionRoadLength, rot: Math.PI / 2 }, // Right
      { x: cellCenterX - ringRoadOffset - campusRoadWidth / 2 - connectionRoadLength / 2, z: cellCenterZ, len: connectionRoadLength, rot: Math.PI / 2 } // Left
  ];

  connectionPositions.forEach(pos => {
      const connRoadGeom = new THREE.PlaneGeometry(connectionRoadWidth, pos.len);
      const connRoad = new THREE.Mesh(connRoadGeom, innerRoadMaterial);
      connRoad.rotation.x = -Math.PI / 2;
      connRoad.rotation.z = pos.rot;
      connRoad.position.set(pos.x, 0.1, pos.z);
      sectorGroup.add(connRoad);
  });

  return sectorGroup;
}
