
import * as THREE from 'three';
import {
  TRACK_THEMES,
  GRID_SIZE,
  CELL_SIZE,
  TOTAL_GRID_WIDTH,
  ROAD_WIDTH,
} from '@/lib/game-constants';
import type { TrackTheme } from '@/lib/types';
import { createSector1 } from './sectors/sector-1';
import { createSector10 } from './sectors/sector-10';
import { createSector11 } from './sectors/sector-11';
import { createSector13 } from './sectors/sector-13';
import { createSector14 } from './sectors/sector-14';
import { createSector15 } from './sectors/sector-15';
import { createSector18 } from './sectors/sector-18';
import { createSector20 } from './sectors/sector-20';
import { createSector24 } from './sectors/sector-24';
import { createSector25 } from './sectors/sector-25';
import { createGenericSector } from './sectors/generic-sector';
import type { GameState } from '../core/state';
import { createToriiGate } from '../models/torii-gate';

export function createGridAndScenery(
  theme: TrackTheme,
  gameState: GameState
) {
  const { walkingNpcsRef, staticCollidersRef, rampMeshRef, rampWallsRef, collegeRampMeshRef, emojiFaceRef, domeRef, universityRamp, electricSparksRef } = gameState;
  
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
  const roadYPosition = 0.2; // Elevated road position

  for (let i = 0; i <= GRID_SIZE; i++) {
    const roadOffset = i * CELL_SIZE - halfTotalWidth;

    // Do not render the last horizontal road (between row 4 and 5)
    if (i === GRID_SIZE) {
        // Vertical roads still need to be full length
        const verticalRoadGeom = new THREE.PlaneGeometry(ROAD_WIDTH, TOTAL_GRID_WIDTH);
        const verticalRoad = new THREE.Mesh(verticalRoadGeom, roadMaterial);
        verticalRoad.rotation.x = -Math.PI / 2;
        verticalRoad.position.y = roadYPosition;
        verticalRoad.position.x = roadOffset;
        verticalRoad.receiveShadow = true;
        gridGroup.add(verticalRoad);
    } else {
        // Vertical roads
        const verticalRoadGeom = new THREE.PlaneGeometry(ROAD_WIDTH, TOTAL_GRID_WIDTH);
        const verticalRoad = new THREE.Mesh(verticalRoadGeom, roadMaterial);
        verticalRoad.rotation.x = -Math.PI / 2;
        verticalRoad.position.y = roadYPosition;
        verticalRoad.position.x = roadOffset;
        verticalRoad.receiveShadow = true;
        gridGroup.add(verticalRoad);

        // Vertical lane markings
        for (let j = -halfTotalWidth; j < halfTotalWidth; j += lineLength + lineGap) {
          const line = new THREE.Mesh(lineGeom, lineMaterial);
          line.position.set(roadOffset, roadYPosition + 0.01, j + lineLength / 2);
          line.rotation.x = -Math.PI / 2;
          gridGroup.add(line);
        }

        // Horizontal roads - Don't render road for the last row (dome area)
        if (i < GRID_SIZE -1) {
          const horizontalRoadGeom = new THREE.PlaneGeometry(TOTAL_GRID_WIDTH, ROAD_WIDTH);
          const horizontalRoad = new THREE.Mesh(horizontalRoadGeom, roadMaterial);
          horizontalRoad.rotation.x = -Math.PI / 2;
          horizontalRoad.position.y = roadYPosition;
          horizontalRoad.position.z = roadOffset;
          horizontalRoad.receiveShadow = true;
          gridGroup.add(horizontalRoad);

          // Horizontal lane markings
          for (let j = -halfTotalWidth; j < halfTotalWidth; j += lineLength + lineGap) {
            const line = new THREE.Mesh(lineGeom, lineMaterial);
            line.position.set(j + lineLength / 2, roadYPosition + 0.01, roadOffset);
            line.rotation.x = -Math.PI / 2;
            line.rotation.z = Math.PI / 2;
            gridGroup.add(line);
          }
        }
    }
  }

  // --- Upland Dome ---
  const domeWidth = TOTAL_GRID_WIDTH; // Span all 5 cells
  const domeDepth = CELL_SIZE; // Span 1 cell deep
  const domeHeight = 150;
  const segments = 100;

  const domeGeometry = new THREE.BoxGeometry(domeWidth, domeHeight, domeDepth, segments, 1, segments);
  const rampMaterial = new THREE.MeshStandardMaterial({
    color: TRACK_THEMES[theme].ground,
    side: THREE.DoubleSide,
  });
  const dome = new THREE.Mesh(domeGeometry, rampMaterial);

  const startRow = 4; // row for 21-25
  const domeCenterX = 0; // Centered on the grid's X-axis
  const domeCenterZ = (startRow * CELL_SIZE - halfTotalWidth) + domeDepth / 2;
  
  dome.position.set(domeCenterX, 0, domeCenterZ);
  
  const positions = dome.geometry.attributes.position;
  const halfDomeWidth = domeWidth / 2;
  const halfDomeDepth = domeDepth / 2;
  const baseHeight = dome.position.y - domeHeight / 2;

  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    // Only affect top vertices
    if (y > baseHeight) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      // Calculate normalized distances from the center of the dome plane
      const nx = x / halfDomeWidth;
      const nz = z / halfDomeDepth;

      // Use a cosine-based curve for a smooth dome shape
      const heightOffset = domeHeight * Math.cos(nx * Math.PI / 2) * Math.cos(nz * Math.PI / 2);
      
      // Apply the height offset to the Y attribute of the vertex
      positions.setY(i, baseHeight + heightOffset);
    }
  }
  positions.needsUpdate = true;
  dome.geometry.computeVertexNormals();

  dome.position.y = roadYPosition + (domeHeight / 2) + 0.01;
  gridGroup.add(dome);
  rampMeshRef.current = dome; // Make it collidable

  // Add scenery
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const cellCenterX = i * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
      const cellCenterZ = j * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
      const sectorNumber = j * GRID_SIZE + i + 1;

      let sectorGroup: THREE.Group;
      
      let sectorYOffset = 0;

      // Check if the sector is part of the dome area
      if (j === 4) { // Sectors 21, 22, 23, 24, 25 are in row 4
          const nx = (cellCenterX - domeCenterX) / halfDomeWidth;
          const ny = (cellCenterZ - domeCenterZ) / halfDomeDepth;
          sectorYOffset = domeHeight * Math.cos(nx * Math.PI / 2) * Math.cos(ny * Math.PI / 2);
      }
      
      switch (sectorNumber) {
        case 1:
          sectorGroup = createSector1({ cellCenterX, cellCenterZ, staticCollidersRef, walkingNpcsRef });
          break;
        case 10:
          sectorGroup = createSector10({ cellCenterX, cellCenterZ, staticCollidersRef, collegeRampMeshRef });
          break;
        case 11:
          sectorGroup = createSector11({ cellCenterX, cellCenterZ, staticCollidersRef });
          break;
        case 13:
          sectorGroup = createSector13({ cellCenterX, cellCenterZ, staticCollidersRef, emojiFaceRef, domeRef });
          break;
        case 14:
          sectorGroup = createSector14({ cellCenterX, cellCenterZ, staticCollidersRef, rampMeshRef, rampWallsRef, universityRamp });
          break;
        case 15:
          sectorGroup = createSector15({ cellCenterX, cellCenterZ, staticCollidersRef });
          break;
        case 18:
          sectorGroup = createSector18({ cellCenterX, cellCenterZ, staticCollidersRef, electricSparksRef });
          break;
        case 20:
          sectorGroup = createSector20({ cellCenterX, cellCenterZ, staticCollidersRef });
          break;
        case 23: // Now part of the dome
          sectorGroup = new THREE.Group();
          const toriiGate = createToriiGate();
          toriiGate.position.set(cellCenterX, 0, cellCenterZ);
          toriiGate.scale.set(2, 1.8, 2);
          toriiGate.rotation.y = Math.PI / 2;
          sectorGroup.add(toriiGate);
          staticCollidersRef.current.push(toriiGate);
          break;
        case 24:
           sectorGroup = createSector24({ cellCenterX, cellCenterZ, staticCollidersRef });
           break;
        case 25:
          sectorGroup = createSector25({ cellCenterX, cellCenterZ, staticCollidersRef });
          break;
        default:
          sectorGroup = createGenericSector({
            theme,
            cellCenterX,
            cellCenterZ,
            walkingNpcsRef,
          });
          break;
      }
      
      if (j === 4) { // If the sector is on the dome
        sectorGroup.position.y = sectorYOffset; // Apply the calculated Y-offset to the whole group
      }

      gridGroup.add(sectorGroup);
    }
  }

  return gridGroup;
}
