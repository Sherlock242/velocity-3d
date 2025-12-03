
import * as THREE from 'three';
import {
  TRACK_THEMES,
  GRID_SIZE,
  CELL_SIZE,
  TOTAL_GRID_WIDTH,
  ROAD_WIDTH,
} from '@/lib/game-constants';
import type { TrackTheme } from '@/lib/types';
import { createMansion } from '../models/mansion';
import { createBuilding } from '../models/building';
import { createChandigarhHouse } from '../models/chandigarh-house';
import { createLegoPerson } from '../models/transformer';
import type { MutableRefObject } from 'react';
import { createPunjabUniversity } from '../models/punjab-university';
import { createGovtHouse } from '../models/govt-house';
import { createDepartmentBuilding } from '../models/department-building';
import { createGurudwara } from '../models/gurudwara';
import { createKaliMandir } from '../models/kali-mandir';
import { createCoachingClass } from '../models/coaching-class';
import { createSatsangBuilding } from '../models/satsang-building';
import { createLightMandir } from '../models/light-mandir';

export function createGridAndScenery(
  theme: TrackTheme,
  walkingNpcsRef: MutableRefObject<THREE.Group[]>,
  staticCollidersRef: MutableRefObject<THREE.Group[]>,
  rampMeshRef: MutableRefObject<THREE.Mesh | undefined>,
  rampWallsRef: MutableRefObject<THREE.Group | undefined>
) {
  const gridGroup = new THREE.Group();
  const halfTotalWidth = TOTAL_GRID_WIDTH / 2;

  // Ground
  const groundGeometry = new THREE.PlaneGeometry(
    TOTAL_GRID_WIDTH + CELL_SIZE,
    TOTAL_GRID_WIDTH + CELL_SIZE
  );
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: TRACK_THEMES[theme].ground,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  gridGroup.add(ground);

  // Roads
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const lineLength = 5;
  const lineGap = 10;
  const lineWidth = 0.5;
  const lineGeom = new THREE.PlaneGeometry(lineWidth, lineLength);

  for (let i = 0; i <= GRID_SIZE; i++) {
    const roadOffset = i * CELL_SIZE - halfTotalWidth;

    // Vertical roads
    const verticalRoadGeom = new THREE.PlaneGeometry(
      ROAD_WIDTH,
      TOTAL_GRID_WIDTH
    );
    const verticalRoad = new THREE.Mesh(verticalRoadGeom, roadMaterial);
    verticalRoad.rotation.x = -Math.PI / 2;
    verticalRoad.position.y = 0.11;
    verticalRoad.position.x = roadOffset;
    verticalRoad.receiveShadow = true;
    gridGroup.add(verticalRoad);

    // Vertical lane markings
    for (
      let j = -halfTotalWidth;
      j < halfTotalWidth;
      j += lineLength + lineGap
    ) {
      const line = new THREE.Mesh(lineGeom, lineMaterial);
      line.position.set(roadOffset, 0.12, j + lineLength / 2);
      line.rotation.x = -Math.PI / 2;
      gridGroup.add(line);
    }

    // Horizontal roads
    const horizontalRoadGeom = new THREE.PlaneGeometry(
      TOTAL_GRID_WIDTH,
      ROAD_WIDTH
    );
    const horizontalRoad = new THREE.Mesh(
      horizontalRoadGeom,
      roadMaterial
    );
    horizontalRoad.rotation.x = -Math.PI / 2;
    horizontalRoad.position.y = 0.11;
    horizontalRoad.position.z = roadOffset;
    horizontalRoad.receiveShadow = true;
    gridGroup.add(horizontalRoad);

    // Horizontal lane markings
    for (
      let j = -halfTotalWidth;
      j < halfTotalWidth;
      j += lineLength + lineGap
    ) {
      const line = new THREE.Mesh(lineGeom, lineMaterial);
      line.position.set(j + lineLength / 2, 0.12, roadOffset);
      line.rotation.x = -Math.PI / 2;
      line.rotation.z = Math.PI / 2;
      gridGroup.add(line);
    }
  }

  // Add scenery
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const cellCenterX = i * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
      const cellCenterZ = j * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
      const sectorNumber = j * GRID_SIZE + i + 1;

      if (sectorNumber === 14) {
        // --- University Campus ---
        const campusRoadMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });

        // Main University Library
        const { university, library, walkableGroup, rampWalls: walls } = createPunjabUniversity();
        university.position.set(cellCenterX, 0, cellCenterZ);
        university.rotation.y = -Math.PI / 2;
        gridGroup.add(university);
        
        if (walls) {
            rampWallsRef.current = walls;
        }

        // Add only the building part to colliders
        if (library) {
            staticCollidersRef.current.push(library);
        }
        
        const rampMesh = walkableGroup.getObjectByName('universityRamp') as THREE.Mesh;
        if (rampMesh) {
            rampMeshRef.current = rampMesh;
        }

        // Department Buildings in arcs
        const departments = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Art', 'Music'];
        const arcRadius = 350;
        const totalAngle = Math.PI * 0.8; // Spread over 144 degrees
        const numDeptsPerSide = Math.ceil(departments.length / 2);

        // Left Arc
        for (let k = 0; k < numDeptsPerSide; k++) {
            const angle = (k / (numDeptsPerSide - 1) - 0.5) * totalAngle + Math.PI;
            const buildingX = cellCenterX + Math.cos(angle) * arcRadius;
            const buildingZ = cellCenterZ + Math.sin(angle) * arcRadius;
            
            const deptBuilding = createDepartmentBuilding();
            deptBuilding.position.set(buildingX, 0, buildingZ);
            deptBuilding.rotation.y = angle + Math.PI / 2;

            gridGroup.add(deptBuilding);
            staticCollidersRef.current.push(deptBuilding);
        }
        
        // Right Arc
        for (let k = 0; k < numDeptsPerSide; k++) {
            const angle = (k / (numDeptsPerSide - 1) - 0.5) * totalAngle;
            const buildingX = cellCenterX + Math.cos(angle) * arcRadius;
            const buildingZ = cellCenterZ + Math.sin(angle) * arcRadius;

            const deptBuilding = createDepartmentBuilding();
            deptBuilding.position.set(buildingX, 0, buildingZ);
            deptBuilding.rotation.y = angle - Math.PI / 2;
            
            gridGroup.add(deptBuilding);
            staticCollidersRef.current.push(deptBuilding);
        }


        // Corner Government Houses
        const houseOffset = CELL_SIZE / 2 - 100;
        const housePositions = [
            { x: cellCenterX - houseOffset, z: cellCenterZ - houseOffset, rot: Math.PI / 4 },
            { x: cellCenterX + houseOffset, z: cellCenterZ - houseOffset, rot: -Math.PI / 4  },
            { x: cellCenterX - houseOffset, z: cellCenterZ + houseOffset, rot: 3 * Math.PI / 4  },
            { x: cellCenterX + houseOffset, z: cellCenterZ + houseOffset, rot: -3 * Math.PI / 4 },
        ];
        housePositions.forEach(pos => {
            const house = createGovtHouse();
            house.position.set(pos.x, 0, pos.z);
            house.rotation.y = pos.rot;
            gridGroup.add(house);
            staticCollidersRef.current.push(house);
        });
        
        // --- Sector 14 Boundary Walls ---
        const wallGroup = new THREE.Group();
        const wallHeight = 20;
        const wallThickness = 10;
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcb4154 }); // Red color

        const gateWidth = 80;
        const halfCell = CELL_SIZE / 2;
        const boundaryOffset = halfCell - ROAD_WIDTH / 2;
        const wallSegmentLen = (CELL_SIZE - ROAD_WIDTH - gateWidth) / 2;

        function createWallSegment(width: number, depth: number) {
          const segment = new THREE.Group();
          const mainWallGeom = new THREE.BoxGeometry(width, wallHeight, depth);
          const mainWall = new THREE.Mesh(mainWallGeom, wallMaterial);
          mainWall.position.y = wallHeight / 2;
          segment.add(mainWall);
          return segment;
        }
        
        const outerEdge = halfCell - ROAD_WIDTH / 2;
        const segmentLength = (CELL_SIZE - ROAD_WIDTH - gateWidth) / 2;
        const halfSegment = segmentLength / 2;

        // Front Wall (+Z)
        const frontWallLeft = createWallSegment(segmentLength, wallThickness);
        frontWallLeft.position.set(cellCenterX - (gateWidth / 2 + halfSegment), 0, cellCenterZ + outerEdge);
        wallGroup.add(frontWallLeft);
        const frontWallRight = createWallSegment(segmentLength, wallThickness);
        frontWallRight.position.set(cellCenterX + (gateWidth / 2 + halfSegment), 0, cellCenterZ + outerEdge);
        wallGroup.add(frontWallRight);
        
        // Back Wall (-Z)
        const backWallLeft = createWallSegment(segmentLength, wallThickness);
        backWallLeft.position.set(cellCenterX - (gateWidth / 2 + halfSegment), 0, cellCenterZ - outerEdge);
        wallGroup.add(backWallLeft);
        const backWallRight = createWallSegment(segmentLength, wallThickness);
        backWallRight.position.set(cellCenterX + (gateWidth / 2 + halfSegment), 0, cellCenterZ - outerEdge);
        wallGroup.add(backWallRight);

        // Left Wall (-X)
        const leftWallTop = createWallSegment(wallThickness, segmentLength);
        leftWallTop.position.set(cellCenterX - outerEdge, 0, cellCenterZ - (gateWidth / 2 + halfSegment));
        wallGroup.add(leftWallTop);
        const leftWallBottom = createWallSegment(wallThickness, segmentLength);
        leftWallBottom.position.set(cellCenterX - outerEdge, 0, cellCenterZ + (gateWidth / 2 + halfSegment));
        wallGroup.add(leftWallBottom);
        
        // Right Wall (+X)
        const rightWallTop = createWallSegment(wallThickness, segmentLength);
        rightWallTop.position.set(cellCenterX + outerEdge, 0, cellCenterZ - (gateWidth / 2 + halfSegment));
        wallGroup.add(rightWallTop);
        const rightWallBottom = createWallSegment(wallThickness, segmentLength);
        rightWallBottom.position.set(cellCenterX + outerEdge, 0, cellCenterZ + (gateWidth / 2 + halfSegment));
        wallGroup.add(rightWallBottom);

        gridGroup.add(wallGroup);
        wallGroup.children.forEach(wall => staticCollidersRef.current.push(wall as THREE.Group));

        continue;
      }

      if (sectorNumber === 15) { // Sector 15 for Mansion
        const mansion = createMansion();
        mansion.position.set(cellCenterX, 0, cellCenterZ);
        mansion.rotation.y = -Math.PI / 2;
        mansion.castShadow = true;
        mansion.receiveShadow = true;
        gridGroup.add(mansion);
        staticCollidersRef.current.push(mansion);
        continue;
      }
      
      if (sectorNumber === 20) {
        // --- HOUSES IN TOP-RIGHT ---
        const numHousesPerRow = 5;
        const numRows = 5;
        const houseSpacing = 120;
        const rowSpacing = 150;
        const startX = cellCenterX + (CELL_SIZE / 2) - (numRows * rowSpacing);
        const startZ = cellCenterZ - (CELL_SIZE / 2) + rowSpacing;

        for (let row = 0; row < numRows; row++) {
          for (let col = 0; col < numHousesPerRow; col++) {
            const house = createChandigarhHouse();
            const x = startX + row * rowSpacing;
            const z = startZ + col * houseSpacing;
            house.position.set(x, 0, z);
            house.rotation.y = -Math.PI / 2;
            gridGroup.add(house);
            staticCollidersRef.current.push(house);
          }
        }

        // --- SPECIAL BUILDINGS IN TOP-LEFT (VERTICALLY) ---
        let currentZ = cellCenterZ - (CELL_SIZE / 2) + 150;
        const specialBuildingX = cellCenterX - (CELL_SIZE / 2) + 100;
        const specialBuildingSpacing = 200;

        const lightMandir = createLightMandir();
        lightMandir.position.set(specialBuildingX, 0, currentZ);
        lightMandir.rotation.y = -Math.PI / 2;
        gridGroup.add(lightMandir);
        staticCollidersRef.current.push(lightMandir);
        currentZ += specialBuildingSpacing;

        const satsangBuilding = createSatsangBuilding();
        satsangBuilding.position.set(specialBuildingX, 0, currentZ);
        satsangBuilding.rotation.y = -Math.PI / 2;
        gridGroup.add(satsangBuilding);
        staticCollidersRef.current.push(satsangBuilding);
        currentZ += specialBuildingSpacing;

        const kaliMandir = createKaliMandir();
        kaliMandir.position.set(specialBuildingX, 0, currentZ);
        kaliMandir.rotation.y = -Math.PI / 2;
        gridGroup.add(kaliMandir);
        staticCollidersRef.current.push(kaliMandir);
        currentZ += specialBuildingSpacing;

        const gurudwara = createGurudwara();
        gurudwara.position.set(specialBuildingX, 0, currentZ);
        gurudwara.rotation.y = -Math.PI / 2;
        gridGroup.add(gurudwara);
        staticCollidersRef.current.push(gurudwara);
        currentZ += specialBuildingSpacing;

        const coachingClass = createCoachingClass();
        coachingClass.position.set(specialBuildingX, 0, currentZ);
        coachingClass.rotation.y = -Math.PI / 2;
        gridGroup.add(coachingClass);
        staticCollidersRef.current.push(coachingClass);

        continue;
      }

      // Add random scenery for other sectors
      for (let k = 0; k < 4; k++) {
        const x = cellCenterX + (Math.random() - 0.5) * (CELL_SIZE - ROAD_WIDTH);
        const z = cellCenterZ + (Math.random() - 0.5) * (CELL_SIZE - ROAD_WIDTH);
        
        let sceneryObject: THREE.Group | THREE.Mesh;
        const sceneryColors = TRACK_THEMES[theme].scenery;
        
        if (theme === 'Forest') {
          const treeHeight = Math.random() * 20 + 10;
          const treeRadius = treeHeight / 8;
          const sceneryGeometry = new THREE.ConeGeometry(treeRadius, treeHeight, 8);
          const randomColor =
          sceneryColors[Math.floor(Math.random() * sceneryColors.length)];
          const sceneryMaterial = new THREE.MeshStandardMaterial({
            color: randomColor,
          });
          sceneryObject = new THREE.Mesh(sceneryGeometry, sceneryMaterial);
          sceneryObject.position.set(x, treeHeight / 2, z);
        } else if (theme === 'Desert') {
          const duneSize = Math.random() * 15 + 5;
          const sceneryGeometry = new THREE.ConeGeometry(duneSize, duneSize / 2, 4); // Pyramid shape
          const randomColor =
          sceneryColors[Math.floor(Math.random() * sceneryColors.length)];
          const sceneryMaterial = new THREE.MeshStandardMaterial({
            color: randomColor,
          });
          sceneryObject = new THREE.Mesh(sceneryGeometry, sceneryMaterial);
          sceneryObject.position.set(x, duneSize / 4, z);
        } else {
          // City
          const building = createBuilding(sceneryColors);
          sceneryObject = building;
          sceneryObject.position.set(x, 0, z);
        }
    
        sceneryObject.castShadow = true;
        gridGroup.add(sceneryObject);
      }

      // Add NPCs in city theme
      if (theme === 'City') {
        const numNpcs = 5;
        for (let k = 0; k < numNpcs; k++) {
          const gender = Math.random() > 0.5 ? 'male' : 'female';
          const npc = createLegoPerson(false, gender);
          npc.scale.set(1.5, 1.5, 1.5);
          const safeArea = (CELL_SIZE - ROAD_WIDTH) / 2 - 20; // Stay away from roads
          const x = cellCenterX + (Math.random() - 0.5) * safeArea;
          const z = cellCenterZ + (Math.random() - 0.5) * safeArea;
          npc.position.set(x, 0, z);
          npc.rotation.y = Math.random() * Math.PI * 2;
          
          const halfCell = CELL_SIZE / 2;
          const sidewalkPadding = ROAD_WIDTH / 2 + 5;
          const bounds = new THREE.Box2(
              new THREE.Vector2(cellCenterX - halfCell + sidewalkPadding, cellCenterZ - halfCell + sidewalkPadding),
              new THREE.Vector2(cellCenterX + halfCell - sidewalkPadding, cellCenterZ + halfCell - sidewalkPadding)
          );
          npc.userData.bounds = bounds;

          gridGroup.add(npc);
          walkingNpcsRef.current.push(npc);
        }
      }

    }
  }

  // Add sector numbers
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const sectorNumber = i * GRID_SIZE + j + 1;

      const x = j * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
      const z = i * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;

    }
  }

  return gridGroup;
}

    