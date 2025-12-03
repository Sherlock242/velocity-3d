
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
import { createDepartmentBuilding } from '../models/department-building';
import { createGurudwara } from '../models/gurudwara';
import { createKaliMandir } from '../models/kali-mandir';
import { createCoachingClass } from '../models/coaching-class';
import { createSatsangBuilding } from '../models/satsang-building';
import { createLightMandir } from '../models/light-mandir';
import { createGovtHouse } from '../models/govt-house';
import { createCollegeBuilding } from '../models/college-building';
import { createShop } from '../models/shop';
import { createClassroomBlock } from '../models/classroom-block';

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

      if (sectorNumber === 10) {
        const campusContainer = new THREE.Group();
        campusContainer.position.set(cellCenterX, 0, cellCenterZ);
        campusContainer.rotation.y = Math.PI;

        const plotWidth = 480;
        const plotDepth = 480;

        // --- Compound Wall ---
        const wallGroup = new THREE.Group();
        wallGroup.name = 'compoundWall';
        const wallHeight = 15;
        const wallThickness = 5;
        const gateWidth = 40;
        
        function createWallSegment(width: number, depth: number) {
          const segment = new THREE.Group();
          const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White color
          const redBorderMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
          const mainWallHeight = wallHeight * 0.9;
          const borderHeight = wallHeight * 0.1;

          const mainWallGeom = new THREE.BoxGeometry(width, mainWallHeight, depth);
          const mainWall = new THREE.Mesh(mainWallGeom, wallMaterial);
          mainWall.position.y = mainWallHeight / 2;
          segment.add(mainWall);

          const topBorderGeom = new THREE.BoxGeometry(width, borderHeight, depth);
          const topBorder = new THREE.Mesh(topBorderGeom, redBorderMaterial);
          topBorder.position.y = mainWallHeight + borderHeight / 2;
          segment.add(topBorder);
          
          return segment;
        }
        
        const gateUpwardShift = 100;

        // Front wall (-Z)
        const frontWallZ = -plotDepth / 2;
        const frontWallLeftSegmentWidth = (plotWidth / 2) - (gateWidth / 2) + gateUpwardShift;
        const frontWallRightSegmentWidth = plotWidth - frontWallLeftSegmentWidth - gateWidth;
        
        const frontWallLeft = createWallSegment(frontWallLeftSegmentWidth, wallThickness);
        frontWallLeft.position.set(-(plotWidth / 2) + (frontWallLeftSegmentWidth / 2), 0, frontWallZ);
        wallGroup.add(frontWallLeft);
        
        const frontWallRight = createWallSegment(frontWallRightSegmentWidth, wallThickness);
        frontWallRight.position.set((plotWidth / 2) - (frontWallRightSegmentWidth / 2), 0, frontWallZ);
        wallGroup.add(frontWallRight);

        // Back wall (+Z)
        const backWall = createWallSegment(plotWidth, wallThickness);
        backWall.position.z = plotDepth / 2;
        wallGroup.add(backWall);

        // Right wall (+X)
        const rightWall = createWallSegment(wallThickness, plotDepth);
        rightWall.position.x = plotWidth / 2;
        wallGroup.add(rightWall);
        
        // Left wall (-X)
        const leftWall = createWallSegment(wallThickness, plotDepth);
        leftWall.position.x = -plotWidth / 2;
        wallGroup.add(leftWall);

        campusContainer.add(wallGroup);
        wallGroup.children.forEach(wall => staticCollidersRef.current.push(wall as THREE.Group));

        // --- Roads and Paths ---
        const darkRoadMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const pathMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        
        const gateXPosition = gateUpwardShift;

        const entranceRoadLength = 240;
        const entranceRoadGeom = new THREE.PlaneGeometry(25, entranceRoadLength);
        const entranceRoad = new THREE.Mesh(entranceRoadGeom, darkRoadMaterial);
        entranceRoad.rotation.x = -Math.PI / 2;
        entranceRoad.position.set(gateXPosition, 0.15, frontWallZ + entranceRoadLength / 2);
        campusContainer.add(entranceRoad);
        
        // Walkable Path to College (Horizontal)
        const pathToCollegeLength = 150;
        const pathToCollegeGeom = new THREE.PlaneGeometry(pathToCollegeLength + gateXPosition, 15);
        const pathToCollege = new THREE.Mesh(pathToCollegeGeom, pathMaterial);
        pathToCollege.rotation.x = -Math.PI / 2;
        pathToCollege.position.set((gateXPosition - pathToCollegeLength) / 2, 0.15, frontWallZ + entranceRoadLength - 7.5);
        campusContainer.add(pathToCollege);
        
        // --- College Building ---
        const college = createCollegeBuilding();
        college.scale.set(0.6, 0.6, 0.6);
        college.position.set(-80, 0, -120);
        campusContainer.add(college);
        const mainBuilding = college.getObjectByName('collegeBuilding');
        if (mainBuilding) {
            mainBuilding.children.forEach(child => staticCollidersRef.current.push(child as THREE.Group));
        }
        
        // --- Classroom Block ---
        const classroomBlock = createClassroomBlock();
        classroomBlock.scale.set(0.8, 0.8, 0.8);
        classroomBlock.position.set(-140, 0, 190); // Bottom-left corner
        campusContainer.add(classroomBlock);
        staticCollidersRef.current.push(classroomBlock);
        

        gridGroup.add(campusContainer);

        continue;
      }

      if (sectorNumber === 14) {
        // --- University Campus ---

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


        gridGroup.add(innerRoadGroup);

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
            gridGroup.add(deptBuilding);
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
            gridGroup.add(path);
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

        gridGroup.add(wallGroup);
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
            gridGroup.add(connRoad);
        });

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
