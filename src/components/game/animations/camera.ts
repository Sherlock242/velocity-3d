
import * as THREE from 'three';
import { TOTAL_GRID_WIDTH, GRID_SIZE, CELL_SIZE } from '@/lib/game-constants';
import type { GameState } from '../core/state';

export function updateCameraPosition(gameState: GameState, camera: THREE.PerspectiveCamera, topDownSector: number | null) {
    const { playerRef, controlModeRef, cameraOrbitRef, isCameraManuallyControlledRef, inputRef, velocityRef } = gameState;
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
        const { radius } = cameraOrbitRef.current;
        let { phi, theta } = cameraOrbitRef.current;
        
        let lookAtTarget = playerRef.current.position.clone();
        
        let combinedTheta = theta;
        if (controlModeRef.current === 'car') {
            const isMoving = inputRef.current.forward || inputRef.current.backward;
            const carSpeed = velocityRef.current.length();
            
            if (!isCameraManuallyControlledRef.current && (isMoving || carSpeed > 0.1)) {
                const defaultTheta = Math.atan2(gameState.cameraOffsetRef.current.x, gameState.cameraOffsetRef.current.z);
                const defaultPhi = Math.acos(gameState.cameraOffsetRef.current.y / gameState.cameraOffsetRef.current.length());
                
                // Smoothly interpolate back to default angles
                cameraOrbitRef.current.theta = THREE.MathUtils.lerp(theta, defaultTheta, 0.05);
                cameraOrbitRef.current.phi = THREE.MathUtils.lerp(phi, defaultPhi, 0.05);
            }
            combinedTheta = cameraOrbitRef.current.theta + playerRef.current.rotation.y;

        } else { // person mode
             combinedTheta = theta;
        }

        const offset = new THREE.Vector3().setFromSphericalCoords(radius, cameraOrbitRef.current.phi, combinedTheta);
        
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
