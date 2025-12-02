
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

function createTextSprite(text: string) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return new THREE.Sprite();

  const fontSize = 80;
  context.font = `bold ${fontSize}px Arial`;

  const textMetrics = context.measureText(text);
  canvas.width = textMetrics.width;
  canvas.height = fontSize * 1.2;

  // Re-apply font settings after canvas resize
  context.font = `bold ${fontSize}px Arial`;
  context.fillStyle = 'rgba(255, 255, 255, 0.8)';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);

  const aspectRatio = canvas.width / canvas.height;
  sprite.scale.set(80 * aspectRatio, 80, 1);

  return sprite;
}

export function createGridAndScenery(
  theme: TrackTheme,
  walkingNpcsRef: MutableRefObject<THREE.Group[]>,
  staticCollidersRef: MutableRefObject<THREE.Group[]>
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
        // Main University Library
        const university = createPunjabUniversity();
        university.position.set(cellCenterX, 0, cellCenterZ);
        university.rotation.y = -Math.PI / 2;
        gridGroup.add(university);
        staticCollidersRef.current.push(university);

        // Department Buildings
        const departments = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
        departments.forEach((dept, index) => {
          const deptBuilding = createDepartmentBuilding();
          const angle = (index / departments.length) * Math.PI * 2;
          const x = cellCenterX + Math.cos(angle) * 350;
          const z = cellCenterZ + Math.sin(angle) * 350;
          deptBuilding.position.set(x, 0, z);
          deptBuilding.lookAt(university.position);
          gridGroup.add(deptBuilding);
          staticCollidersRef.current.push(deptBuilding);
        });

        // Corner Government Houses
        const cornerOffset = CELL_SIZE / 2 - 100;
        const corners = [
            { x: cellCenterX - cornerOffset, z: cellCenterZ - cornerOffset },
            { x: cellCenterX + cornerOffset, z: cellCenterZ - cornerOffset },
            { x: cellCenterX - cornerOffset, z: cellCenterZ + cornerOffset },
            { x: cellCenterX + cornerOffset, z: cellCenterZ + cornerOffset },
        ];
        corners.forEach(corner => {
            const house = createGovtHouse();
            house.position.set(corner.x, 0, corner.z);
            gridGroup.add(house);
            staticCollidersRef.current.push(house);
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
        continue;
      }
      
      if (sectorNumber === 20) { // Sector 20 for Chandigarh Houses
         const numHousesPerRow = 5;
         const numRows = 7; // 1 front row + 6 behind
         const houseSpacing = 120;
         const rowSpacing = 150;
         
         const startX = cellCenterX + (CELL_SIZE / 2) - ROAD_WIDTH / 2 - 50;
         const startZ = cellCenterZ - ((numHousesPerRow - 1) / 2) * houseSpacing;

         for (let row = 0; row < numRows; row++) {
          for (let col = 0; col < numHousesPerRow; col++) {
              const house = createChandigarhHouse();
              const x = startX - row * rowSpacing;
              const z = startZ + col * houseSpacing;
              house.position.set(x, 0, z);
              house.rotation.y = -Math.PI / 2;
              gridGroup.add(house);
          }
        }
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
      const sectorLabel = createTextSprite(sectorNumber.toString());

      const x = j * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
      const z = i * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;

      sectorLabel.position.set(x, 50, z);
      gridGroup.add(sectorLabel);
    }
  }

  return gridGroup;
}
