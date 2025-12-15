
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

// Function to create the tile texture
function createTileMaterial() {
  const textureSize = 512;
  const canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;
  const context = canvas.getContext('2d');

  if (!context) return new THREE.MeshStandardMaterial({ color: 0xcccccc });

  // Base color
  context.fillStyle = '#EAE8E1'; // Light sandy color
  context.fillRect(0, 0, textureSize, textureSize);

  // Add subtle color variations
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * textureSize;
    const y = Math.random() * textureSize;
    const radius = Math.random() * 2;
    const color = Math.random() > 0.5 ? '#F0EEE6' : '#DCDAD0';
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  
  const colorTexture = new THREE.CanvasTexture(canvas);
  colorTexture.wrapS = THREE.RepeatWrapping;
  colorTexture.wrapT = THREE.RepeatWrapping;
  colorTexture.repeat.set(20, 20);

  // Normal map for dimples
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = textureSize;
  normalCanvas.height = textureSize;
  const normalContext = normalCanvas.getContext('2d');
  
  if (!normalContext) return new THREE.MeshStandardMaterial({ map: colorTexture });
  
  normalContext.fillStyle = 'rgb(128, 128, 255)'; // Neutral normal color
  normalContext.fillRect(0, 0, textureSize, textureSize);
  
  for (let i = 0; i < 4000; i++) {
      const x = Math.random() * textureSize;
      const y = Math.random() * textureSize;
      const radius = Math.random() * 3 + 1;
      
      const angle = Math.random() * Math.PI * 2;
      const nx = Math.cos(angle) * 127 + 128;
      const ny = Math.sin(angle) * 127 + 128;

      const grad = normalContext.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgb(${nx}, ${ny}, 255)`);
      grad.addColorStop(1, 'rgb(128, 128, 255)');
      
      normalContext.fillStyle = grad;
      normalContext.beginPath();
      normalContext.arc(x, y, radius, 0, Math.PI * 2);
      normalContext.fill();
  }

  const normalTexture = new THREE.CanvasTexture(normalCanvas);
  normalTexture.wrapS = THREE.RepeatWrapping;
  normalTexture.wrapT = THREE.RepeatWrapping;
  normalTexture.repeat.set(20, 20);

  return new THREE.MeshStandardMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    roughness: 0.8,
    metalness: 0.1,
  });
}

// Function to create railings
function createRailing(length: number) {
  const railingGroup = new THREE.Group();
  const railingMaterial = new THREE.MeshStandardMaterial({ color: 0xff4500 });
  const pillarHeight = 8;
  const pillarRadius = 0.5;
  const numPillars = Math.floor(length / 20) + 1;

  for (let i = 0; i < numPillars; i++) {
      const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight),
          railingMaterial
      );
      pillar.position.x = -length / 2 + i * (length / (numPillars - 1));
      pillar.position.y = pillarHeight / 2;
      railingGroup.add(pillar);
  }
  const topRail = new THREE.Mesh(
      new THREE.BoxGeometry(length, 0.5, 0.5),
      railingMaterial
  );
  topRail.position.y = pillarHeight;
  railingGroup.add(topRail);

  return railingGroup;
}


export function createGridAndScenery(
  theme: TrackTheme,
  gameState: GameState
) {
  const { walkingNpcsRef, staticCollidersRef, rampMeshRef, rampWallsRef, collegeRampMeshRef, emojiFaceRef, domeRef, universityRamp, electricSparksRef, tilePlaneRef } = gameState;
  
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
  const roadYPosition = 0.4; // Elevated road position

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

  // --- Tiled Platform on Dome ---
  const flatTopWidth = ((peakNormalizedX - -1) * halfDomeWidth); 
  const tilePlaneGeom = new THREE.PlaneGeometry(flatTopWidth, domeDepth);
  const tileMaterial = createTileMaterial();
  const tilePlane = new THREE.Mesh(tilePlaneGeom, tileMaterial);
  tilePlane.rotation.x = -Math.PI / 2;

  // Calculate position for the tiled plane
  const tilePlaneX = domeCenterX - halfDomeWidth + flatTopWidth / 2;
  const tilePlaneY = roadYPosition + domeHeight + 0.2; // Adjusted to prevent z-fighting
  const tilePlaneZ = domeCenterZ;
  
  tilePlane.position.set(tilePlaneX, tilePlaneY, tilePlaneZ);
  gridGroup.add(tilePlane);
  tilePlaneRef.current = tilePlane;
  
  // --- Orange Railings for Tiled Area ---
  const railingY = tilePlaneY + 4; // y position of the railings
  const railingOffset = 0.5;

  const topRailing = createRailing(flatTopWidth);
  topRailing.position.set(tilePlaneX, railingY, tilePlaneZ + domeDepth / 2 - railingOffset);
  gridGroup.add(topRailing);

  const bottomRailing = createRailing(flatTopWidth);
  bottomRailing.position.set(tilePlaneX, railingY, tilePlaneZ - domeDepth / 2 + railingOffset);
  gridGroup.add(bottomRailing);

  const leftRailing = createRailing(domeDepth);
  leftRailing.rotation.y = Math.PI / 2;
  leftRailing.position.set(tilePlaneX - flatTopWidth / 2 + railingOffset, railingY, tilePlaneZ);
  gridGroup.add(leftRailing);
  
  const rightRailing = createRailing(domeDepth);
  rightRailing.rotation.y = Math.PI / 2;
  rightRailing.position.set(tilePlaneX + flatTopWidth / 2 - railingOffset, railingY, tilePlaneZ);
  gridGroup.add(rightRailing);


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
          // These sectors are on the dome, so we don't add buildings or gates.
          sectorGroup = new THREE.Group();
          break;
        case 23:
          sectorGroup = createSector23({ cellCenterX, cellCenterZ, staticCollidersRef });
          break;
        case 24:
          sectorGroup = createSector24({ cellCenterX, cellCenterZ, staticCollidersRef });
          break;
        case 25:
          // Sector 25 is also on the dome. Its gate is handled in the tunnel loop.
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
  const startSector25X = (4 * CELL_SIZE - halfTotalWidth) + (CELL_SIZE / 2);
  const endSector22X = (1 * CELL_SIZE - halfTotalWidth) + (CELL_SIZE / 2);
  const tunnelLength = startSector25X - endSector22X;
  const gateSpacing = 40;
  const numGates = Math.floor(tunnelLength / gateSpacing);
  
  // Define Sector 24 boundaries
  const sector24Index = 3;
  const sector24StartX = sector24Index * CELL_SIZE - halfTotalWidth;
  const sector24EndX = sector24StartX + CELL_SIZE;


  for (let i = 0; i < numGates; i++) {
      const tunnelProgress = i / (numGates - 1);
      const gateX = THREE.MathUtils.lerp(startSector25X, endSector22X, tunnelProgress);
      const gateZ = domeCenterZ; // Center them on the dome's depth
      
      let yOffset: number;
      
      // Check if the gate is within Sector 24
      if (gateX >= sector24StartX && gateX < sector24EndX) {
          yOffset = 1;
      } else {
        // Calculate height based on dome geometry for other gates
        let nx = (gateX - domeCenterX) / halfDomeWidth;
        const nz = (gateZ - domeCenterZ) / halfDomeDepth;
        if (nx <= peakNormalizedX) {
            nx = peakNormalizedX;
        }
        const heightXComponent = Math.cos((nx - peakNormalizedX) * (Math.PI / (2 * (1 - Math.abs(peakNormalizedX)))));
        const heightZComponent = Math.cos(nz * Math.PI / 2);
        yOffset = domeHeight * heightXComponent * heightZComponent;
      }

      const gate = createToriiGate();
      gate.position.set(gateX, yOffset, gateZ);
      gate.rotation.y = Math.PI / 2;
      gridGroup.add(gate);
  }

  // --- Road under Tunnel ---
  const roadUnderTunnelGeom = new THREE.BufferGeometry();
  const roadUnderTunnelMat = new THREE.MeshStandardMaterial({ color: 0x444444, side: THREE.DoubleSide });
  
  const roadSegments = 50;
  const vertices = [];
  const indices = [];
  const halfRoadWidth = ROAD_WIDTH / 2;

  for (let i = 0; i <= roadSegments; i++) {
    const progress = i / roadSegments;
    const roadX = THREE.MathUtils.lerp(startSector25X, endSector22X, progress);
    const roadZ = domeCenterZ;

    let yOffset;
    if (roadX >= sector24StartX && roadX < sector24EndX) {
        yOffset = 1;
    } else {
        let nx = (roadX - domeCenterX) / halfDomeWidth;
        const nz = (roadZ - domeCenterZ) / halfDomeDepth;
        if (nx <= peakNormalizedX) {
            nx = peakNormalizedX;
        }
        const heightXComponent = Math.cos((nx - peakNormalizedX) * (Math.PI / (2 * (1 - Math.abs(peakNormalizedX)))));
        const heightZComponent = Math.cos(nz * Math.PI / 2);
        yOffset = domeHeight * heightXComponent * heightZComponent;
    }
    
    const height = yOffset + roadYPosition + 0.1;

    // Add vertices for the left and right side of the road segment
    vertices.push(roadX, height, roadZ - halfRoadWidth); // right vertex
    vertices.push(roadX, height, roadZ + halfRoadWidth); // left vertex

    // Create faces
    if (i < roadSegments) {
        const i2 = i * 2;
        indices.push(i2, i2 + 1, i2 + 3);
        indices.push(i2, i2 + 3, i2 + 2);
    }
  }

  roadUnderTunnelGeom.setIndex(indices);
  roadUnderTunnelGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  roadUnderTunnelGeom.computeVertexNormals();
  
  const roadUnderTunnelMesh = new THREE.Mesh(roadUnderTunnelGeom, roadUnderTunnelMat);
  roadUnderTunnelMesh.receiveShadow = true;
  gridGroup.add(roadUnderTunnelMesh);


  return gridGroup;
}

    