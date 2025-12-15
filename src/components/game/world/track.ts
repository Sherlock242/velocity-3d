
import * as THREE from 'three';
import {
  TRACK_THEMES,
  GRID_SIZE,
  CELL_SIZE,
  TOTAL_GRID_WIDTH,
  ROAD_WIDTH,
} from '@/lib/game-constants';
import { DOME_WIDTH, DOME_DEPTH, DOME_HEIGHT } from '@/lib/dome-constants';
import type { TrackTheme } from '@/lib/types';
import { createSector1 } from './sectors/sector-1';
import { createSector10 } from './sectors/sector-10';
import { createSector11 } from './sectors/sector-11';
import { createSector13 } from './sectors/sector-13';
import { createSector14 } from './sectors/sector-14';
import { createSector15 } from './sectors/sector-15';
import { createSector18 } from './sectors/sector-18';
import { createSector20 } from './sectors/sector-20';
import { createSector23 } from './sectors/sector-23';
import { createSector24 } from './sectors/sector-24';
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

  for (let j = 0; j < GRID_SIZE; j++) {
    for (let i = 0; i <= GRID_SIZE; i++) {
        const roadOffset = i * CELL_SIZE - halfTotalWidth;

        if (j === 0) { // Only render vertical roads once
            // Vertical roads
            const verticalRoadGeom = new THREE.PlaneGeometry(ROAD_WIDTH, TOTAL_GRID_WIDTH);
            const verticalRoad = new THREE.Mesh(verticalRoadGeom, roadMaterial);
            verticalRoad.rotation.x = -Math.PI / 2;
            verticalRoad.position.y = roadYPosition;
            verticalRoad.position.x = roadOffset;
            verticalRoad.receiveShadow = true;
            gridGroup.add(verticalRoad);

            // Vertical lane markings
            for (let k = -halfTotalWidth; k < halfTotalWidth; k += lineLength + lineGap) {
                const line = new THREE.Mesh(lineGeom, lineMaterial);
                line.position.set(roadOffset, roadYPosition + 0.01, k + lineLength / 2);
                line.rotation.x = -Math.PI / 2;
                gridGroup.add(line);
            }
        }
    }
    
    // Horizontal roads - Don't render road for the last row (dome area)
    if (j < GRID_SIZE - 1) {
        const roadOffset = j * CELL_SIZE - halfTotalWidth;
        const horizontalRoadGeom = new THREE.PlaneGeometry(TOTAL_GRID_WIDTH, ROAD_WIDTH);
        const horizontalRoad = new THREE.Mesh(horizontalRoadGeom, roadMaterial);
        horizontalRoad.rotation.x = -Math.PI / 2;
        horizontalRoad.position.y = roadYPosition;
        horizontalRoad.position.z = roadOffset;
        horizontalRoad.receiveShadow = true;
        gridGroup.add(horizontalRoad);

        // Horizontal lane markings
        for (let k = -halfTotalWidth; k < halfTotalWidth; k += lineLength + lineGap) {
          const line = new THREE.Mesh(lineGeom, lineMaterial);
          line.position.set(k + lineLength / 2, roadYPosition + 0.01, roadOffset);
          line.rotation.x = -Math.PI / 2;
          line.rotation.z = Math.PI / 2;
          gridGroup.add(line);
        }
    }
  }


  // --- Upland Dome ---
  const domeWidth = DOME_WIDTH;
  const domeDepth = DOME_DEPTH;
  const domeHeight = DOME_HEIGHT;
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
  const peakOffsetX = -0.2 * domeWidth; // Shift peak to Sector 22 (20% to the left of center)
  const peakNormalizedX = (peakOffsetX) / halfDomeWidth;


  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    // Only affect top vertices
    if (y > baseHeight) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      // Calculate normalized distances from the center of the dome plane
      let nx = (x) / halfDomeWidth;
      const nz = z / halfDomeDepth;

      // If x is to the left of the peak (in sectors 21, 22), clamp it to the peak's x.
      if (nx <= peakNormalizedX) {
        nx = peakNormalizedX;
      }
      
      const heightXComponent = Math.cos((nx - peakNormalizedX) * (Math.PI / (2 * (1 - Math.abs(peakNormalizedX)))));
      const heightZComponent = Math.cos(nz * Math.PI / 2);

      // Use a cosine-based curve for a smooth dome shape
      const heightOffset = domeHeight * heightXComponent * heightZComponent;
      
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
        case 21:
        case 22:
        case 23:
        case 24:
        case 25:
          // These sectors are on the dome, so we don't add buildings or gates.
          sectorGroup = new THREE.Group();
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
      
      // If the sector is on the dome, adjust individual children instead of the whole group
      if (j === 4 && sectorNumber !== 23 && sectorNumber !== 24 && sectorNumber !== 25) { // Exclude sectors where height is already calculated
        sectorGroup.children.forEach(child => {
          if (child instanceof THREE.Group || child instanceof THREE.Mesh) {
            const childX = child.position.x;
            const childZ = child.position.z;
            
            let nx = (childX - domeCenterX) / halfDomeWidth;
            const nz = (childZ - domeCenterZ) / halfDomeDepth;

            if (nx <= peakNormalizedX) {
              nx = peakNormalizedX;
            }

            const heightXComponent = Math.cos((nx - peakNormalizedX) * (Math.PI / (2 * (1 - Math.abs(peakNormalizedX)))));
            const heightZComponent = Math.cos(nz * Math.PI / 2);
            const yOffset = domeHeight * heightXComponent * heightZComponent;
            
            child.position.y += yOffset;
          }
        });
      }

      gridGroup.add(sectorGroup);
    }
  }

  // --- Torii Gate Tunnel ---
  const startSector25X = (4 * CELL_SIZE - halfTotalWidth) + (CELL_SIZE / 2) - 100;
  const endSector22X = (1 * CELL_SIZE - halfTotalWidth) + (CELL_SIZE / 2);
  const tunnelLength = startSector25X - endSector22X;
  const gateSpacing = 5;
  const numGates = Math.floor(tunnelLength / gateSpacing);


  for (let i = 0; i < numGates; i++) {
      const tunnelProgress = i / (numGates - 1);
      const gateX = THREE.MathUtils.lerp(startSector25X, endSector22X, tunnelProgress);
      const gateZ = domeCenterZ; // Center them on the dome's depth

      let nx = (gateX - domeCenterX) / halfDomeWidth;
      const nz = (gateZ - domeCenterZ) / halfDomeDepth;
      if (nx <= peakNormalizedX) {
        nx = peakNormalizedX;
      }
      const heightXComponent = Math.cos((nx - peakNormalizedX) * (Math.PI / (2 * (1 - Math.abs(peakNormalizedX)))));
      const heightZComponent = Math.cos(nz * Math.PI / 2);
      const yOffset = domeHeight * heightXComponent * heightZComponent;

      const gate = createToriiGate();
      gate.scale.set(0.5, 0.5, 0.5);
      gate.position.set(gateX, yOffset, gateZ);
      gate.rotation.y = Math.PI / 2;
      gridGroup.add(gate);
  }

  // --- Walkable Path under Tunnel ---
  const pathGeom = new THREE.PlaneGeometry(tunnelLength, 90, 100, 1);
  const pathMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const pathMesh = new THREE.Mesh(pathGeom, pathMat);
  pathMesh.position.set(
    endSector22X + tunnelLength / 2,
    0, // Will be adjusted per-vertex
    domeCenterZ
  );
  pathMesh.rotation.x = -Math.PI / 2;
  
  const pathPositions = pathMesh.geometry.attributes.position;
  for (let i = 0; i < pathPositions.count; i++) {
    const localPos = new THREE.Vector3().fromBufferAttribute(pathPositions, i);
    const worldPos = pathMesh.localToWorld(localPos);
    
    let nx = (worldPos.x - domeCenterX) / halfDomeWidth;
    const nz = (worldPos.z - domeCenterZ) / halfDomeDepth;
    if (nx <= peakNormalizedX) {
      nx = peakNormalizedX;
    }
    const heightXComponent = Math.cos((nx - peakNormalizedX) * (Math.PI / (2 * (1 - Math.abs(peakNormalizedX)))));
    const heightZComponent = Math.cos(nz * Math.PI / 2);
    const yOffset = domeHeight * heightXComponent * heightZComponent;
    
    // Set the Z attribute of the vertex in its local space to create height
    pathPositions.setZ(i, yOffset + 0.5); // a bit of offset to prevent z-fighting
  }
  pathPositions.needsUpdate = true;
  pathMesh.geometry.computeVertexNormals();

  gridGroup.add(pathMesh);


  return gridGroup;
}
