
import * as THREE from 'three';
import { createTransformer } from '../models/transformer';
import { createObstacleCar } from '../models/obstacle-car';
import { createGridAndScenery } from '../world/track';
import { TOTAL_GRID_WIDTH, NUM_OBSTACLES, GRID_SIZE, CELL_SIZE, ROAD_WIDTH } from '@/lib/game-constants';
import type { TrackTheme } from '@/lib/types';
import type { GameState } from '../core/state';

export function createWorld(scene: THREE.Scene, theme: TrackTheme, gameState: GameState) {
    const { playerRef, obstacleCarsRef } = gameState;

    // Player
    const transformer = createTransformer();
    
    // Set starting position to Sector 25
    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
    const sectorIndex = 24; // Sector 25 is index 24
    const i = sectorIndex % GRID_SIZE;
    const j = Math.floor(sectorIndex / GRID_SIZE);

    const cellCenterX = i * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
    const cellCenterZ = j * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
    
    // Calculate Y position on the dome for the player
    const domeHeight = 150;
    const domeWidth = TOTAL_GRID_WIDTH;
    const domeDepth = CELL_SIZE;
    const domeCenterZ = (4 * CELL_SIZE - halfTotalWidth) + domeDepth / 2;
    
    let nx = (cellCenterX) / (domeWidth / 2);
    const nz = (cellCenterZ - domeCenterZ) / (domeDepth / 2);

    const peakOffsetX = -0.2 * domeWidth;
    const peakNormalizedX = peakOffsetX / (domeWidth / 2);

    if (nx <= peakNormalizedX) {
      nx = peakNormalizedX;
    }

    const heightXComponent = Math.cos((nx - peakNormalizedX) * (Math.PI / (2 * (1 - Math.abs(peakNormalizedX)))));
    const heightZComponent = Math.cos(nz * Math.PI / 2);
    const yOffset = domeHeight * heightXComponent * heightZComponent;

    transformer.position.x = cellCenterX;
    transformer.position.z = cellCenterZ;
    transformer.position.y = yOffset;
    transformer.rotation.y = Math.PI / 2; // Face towards the peak
    
    scene.add(transformer);
    playerRef.current = transformer;

    // Obstacles
    for (let i = 0; i < NUM_OBSTACLES; i++) {
        const obstacle = createObstacleCar();
        const onVerticalRoad = Math.random() > 0.5;
        const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
        const positionOnRoad = (Math.random() - 0.5) * TOTAL_GRID_WIDTH;
        const halfGrid = TOTAL_GRID_WIDTH / 2;

        if (onVerticalRoad) {
            obstacle.position.x = roadIndex * CELL_SIZE - halfGrid;
            obstacle.position.z = positionOnRoad;
            obstacle.rotation.y = Math.random() > 0.5 ? 0 : Math.PI;
        } else {
            obstacle.position.x = positionOnRoad;
            obstacle.position.z = roadIndex * CELL_SIZE - halfGrid;
            obstacle.rotation.y = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
        }
        scene.add(obstacle);
        obstacleCarsRef.current.push(obstacle);
    }

    // Grid, Scenery, and Buildings
    const gridGroup = createGridAndScenery(theme, gameState);
    scene.add(gridGroup);

    const waterJet = gridGroup.getObjectByName('fountainWaterJet');
    if (waterJet instanceof THREE.Mesh) {
        gameState.fountainWaterJetRef.current = waterJet;
    }
}
