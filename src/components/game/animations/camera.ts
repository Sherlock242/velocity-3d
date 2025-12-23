
import * as THREE from 'three';
import { TOTAL_GRID_WIDTH, GRID_SIZE, CELL_SIZE } from '@/lib/game-constants';
import type { GameState } from '../core/state';

export function updateCameraPosition(gameState: GameState, camera: THREE.PerspectiveCamera, topDownSector: number | null) {
    const { playerRef, controlModeRef, cameraOrbitRef } = gameState;
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
        const { radius, phi, theta } = cameraOrbitRef.current;
        
        let lookAtTarget = playerRef.current.position.clone();
        
        let combinedTheta = theta;
        if (controlModeRef.current === 'car') {
            combinedTheta = theta + playerRef.current.rotation.y;
        } else {
            combinedTheta = theta + Math.PI / 2;
        }

        const offset = new THREE.Vector3().setFromSphericalCoords(radius, phi, combinedTheta);
        
        if (controlModeRef.current === 'person') {
            const personModel = playerRef.current.userData.personModel as THREE.Group;
            if (personModel && personModel.userData.parts.head) {
                const head = personModel.userData.parts.head as THREE.Group;
                const headPosition = new THREE.Vector3();
                head.getWorldPosition(headPosition);
                lookAtTarget = headPosition;
            } else {
                // Fallback if head is not available
                lookAtTarget.y += 4;
            }
        }
        camera.position.copy(lookAtTarget).add(offset);
        
        camera.lookAt(lookAtTarget);
    }
}
