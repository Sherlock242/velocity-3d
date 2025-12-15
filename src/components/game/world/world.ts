
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
    
    // Set starting position to Sector 20's main road
    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
    const sectorIndex = 19; // Sector 20 is index 19
    const i = sectorIndex % GRID_SIZE; // col = 4
    const j = Math.floor(sectorIndex / GRID_SIZE); // row = 3

    const cellCenterX = i * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
    // Position on the road in front of the sector
    const roadZ = (j * CELL_SIZE) - halfTotalWidth - (ROAD_WIDTH / 2);

    transformer.position.x = cellCenterX;
    transformer.position.z = roadZ;
    transformer.rotation.y = Math.PI; // Face towards the dome
    
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
