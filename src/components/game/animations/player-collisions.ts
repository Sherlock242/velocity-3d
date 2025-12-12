
import * as THREE from 'three';
import { TOTAL_GRID_WIDTH, CELL_SIZE } from '@/lib/game-constants';
import type { GameState } from '../core/state';

export function handleCollisions(gameState: GameState, delta: number) {
    const { playerRef, velocityRef, staticCollidersRef, obstacleCarsRef, controlModeRef } = gameState;
    if (!playerRef.current) return;

    const playerBox = new THREE.Box3().setFromObject(playerRef.current);
    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;

    obstacleCarsRef.current.forEach((obstacle) => {
        const forward = new THREE.Vector3();
        obstacle.getWorldDirection(forward);
        obstacle.position.add(forward.multiplyScalar(50 * delta));
        if (Math.abs(obstacle.position.x) > halfTotalWidth + CELL_SIZE || Math.abs(obstacle.position.z) > halfTotalWidth + CELL_SIZE) {
            const onVerticalRoad = Math.random() > 0.5;
            const roadIndex = Math.floor(Math.random() * (CELL_SIZE + 1));
            const positionOnRoad = (Math.random() - 0.5) * TOTAL_GRID_WIDTH;
            if (onVerticalRoad) {
                obstacle.position.x = roadIndex * CELL_SIZE - halfTotalWidth;
                obstacle.position.z = positionOnRoad;
                obstacle.rotation.y = Math.random() > 0.5 ? 0 : Math.PI;
            } else {
                obstacle.position.x = positionOnRoad;
                obstacle.position.z = roadIndex * CELL_SIZE - halfTotalWidth;
                obstacle.rotation.y = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
            }
        }
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
        if (playerBox.intersectsBox(obstacleBox)) {
            velocityRef.current.multiplyScalar(0.1);
            const knockback = playerRef.current!.position.clone().sub(obstacle.position).normalize().multiplyScalar(5);
            playerRef.current!.position.add(knockback.multiplyScalar(delta * 60));
        }
    });

    staticCollidersRef.current.forEach((collider) => {
        const colliderBox = new THREE.Box3().setFromObject(collider);
        if (playerBox.intersectsBox(colliderBox)) {
            if (collider.name === 'collegeRamp') {
                 // Don't slow down on the ramp, physics will handle it.
                return;
            }

            const isSpecialBuilding = collider.name.toLowerCase().includes('college') || collider.name === 'LibraryBuilding';
            
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
