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

function createTextSprite(text: string) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return new THREE.Sprite();

  const fontSize = 100;
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
  sprite.scale.set(100 * aspectRatio, 100, 1);

  return sprite;
}

export function createGridAndScenery(theme: TrackTheme) {
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
  const sceneryColors = TRACK_THEMES[theme].scenery;
  for (let i = 0; i < (GRID_SIZE + 1) * (GRID_SIZE + 1) * 4; i++) {
    const cellX = Math.floor(Math.random() * GRID_SIZE);
    const cellZ = Math.floor(Math.random() * GRID_SIZE);

    const sectorNumber = cellZ * GRID_SIZE + cellX + 1;
    if (sectorNumber === 15) {
      continue; // Skip placing random buildings in Sector 15
    }

    const cellCenterX = cellX * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
    const cellCenterZ = cellZ * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;

    const x =
      cellCenterX + (Math.random() - 0.5) * (CELL_SIZE - ROAD_WIDTH);
    const z =
      cellCenterZ + (Math.random() - 0.5) * (CELL_SIZE - ROAD_WIDTH);

    let sceneryObject: THREE.Group | THREE.Mesh;

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

  // Create a mansion in Sector 15
  const mansion = createMansion();
  const sector15CellX = 4;
  const sector15CellZ = 2;
  const sector15X = sector15CellX * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
  const sector15Z = sector15CellZ * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
  mansion.position.set(sector15X, 0, sector15Z);
  mansion.castShadow = true;
  mansion.receiveShadow = true;
  gridGroup.add(mansion);

  return gridGroup;
}
