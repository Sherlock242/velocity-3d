
import * as THREE from 'three';
import { TOTAL_GRID_WIDTH, GRID_SIZE, CELL_SIZE } from '@/lib/game-constants';
import type { GameState } from '../core/state';

export function updateCameraPosition(gameState: GameState, camera: THREE.PerspectiveCamera, topDownSector: number | null) {
    const { playerRef, controlModeRef, cameraOffsetRef } = gameState;
    if (!playerRef.current) return;
    
    if (topDownSector !== null) {
        const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
        const row = Math.floor((topDownSector - 1) / GRID_SIZE);
        const col = (topDownSector - 1) % GRID_SIZE;
        const sectorCenterX = col * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
        const sectorCenterZ = row * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
        camera.position.set(sectorCenterX, 1200, sectorCenterZ);
        camera.lookAt(sectorCenterX, 0, sectorCenterZ);
    } else {
        const offset = cameraOffsetRef.current.clone();
        if (controlModeRef.current === 'person') offset.set(0, 4, -8);
        else offset.set(0, 2, -6);
        offset.applyQuaternion(playerRef.current.quaternion).add(playerRef.current.position);
        camera.position.copy(offset);
        camera.lookAt(playerRef.current.position);
    }
}
