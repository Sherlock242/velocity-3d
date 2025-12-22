
import * as THREE from 'three';
import { TOTAL_GRID_WIDTH, CELL_SIZE } from '@/lib/game-constants';
import type { GameState } from '../core/state';

export function handleCollisions(gameState: GameState, delta: number) {
    const { playerRef, velocityRef, staticCollidersRef, obstacleCarsRef, controlModeRef } = gameState;
    if (!playerRef.current) return;

    const playerBox = new THREE.Box3().setFromObject(playerRef.current);
    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;

    // Obstacle cars logic removed
    obstacleCarsRef.current = [];

    staticCollidersRef.current.forEach((collider) => {
        const colliderBox = new THREE.Box3().setFromObject(collider);
        if (playerBox.intersectsBox(colliderBox)) {
            if (collider.name === 'collegeRamp') {
                 // Don't slow down on the ramp, physics will handle it.
                return;
            }

            const isSpecialBuilding = collider.name.toLowerCase().includes('college') || collider.name === 'LibraryBuilding';
            
            // If the collider is part of the forest, only slow down, don't push.
            if (collider.userData.isForest) {
                velocityRef.current.multiplyScalar(0.9);
                return;
            }

            if (collider.parent?.name === 'compoundWall') {
                velocityRef.current.multiplyScalar(0);
                const intersection = new THREE.Box3();
                intersection.copy(playerBox).intersect(colliderBox);
                const penetration = new THREE.Vector3();
                penetration.subVectors(intersection.max, intersection.min);
                const moveDirection = new THREE.Vector3();
                if (penetration.x < penetration.z) {
                    moveDirection.x = playerRef.current!.position.x > collider.position.x ? penetration.x : -penetration.x;
                } else {
                    moveDirection.z = playerRef.current!.position.z > collider.position.z ? penetration.z : -penetration.z;
                }
                playerRef.current!.position.add(moveDirection);
                return;
            }

            let slowdown = 0.1;
            if (isSpecialBuilding && controlModeRef.current === 'car') {
                slowdown = 0.5;
            }
            velocityRef.current.multiplyScalar(slowdown);

            if (!isSpecialBuilding) {
                const intersection = new THREE.Box3();
                intersection.copy(playerBox).intersect(colliderBox);
                const penetration = new THREE.Vector3();
                penetration.subVectors(intersection.max, intersection.min);
                const moveDirection = new THREE.Vector3();
                if (penetration.x < penetration.z) {
                    moveDirection.x = playerRef.current!.position.x > collider.position.x ? penetration.x : -penetration.x;
                } else {
                    moveDirection.z = playerRef.current!.position.z > collider.position.z ? penetration.z : -penetration.z;
                }
                playerRef.current!.position.add(moveDirection);
            }
        }
    });
}
