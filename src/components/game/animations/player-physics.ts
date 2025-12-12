
import * as THREE from 'three';
import { TOTAL_GRID_WIDTH } from '@/lib/game-constants';
import type { GameState } from '../core/state';

export function applyPhysicsAndBoundaries(gameState: GameState, delta: number) {
    const { playerRef, velocityRef, controlModeRef, rampMeshRef, collegeRampMeshRef } = gameState;
    if (!playerRef.current) return;

    const playerHeight = controlModeRef.current === 'car' ? 0.6 : 2.0;
    let onRamp = false;
    const raycaster = new THREE.Raycaster();
    
    // The university ramp was missing from this check, causing gravity to be incorrectly applied.
    const rampObjects = [rampMeshRef.current, collegeRampMeshRef.current, (gameState as any).universityRamp].filter(Boolean) as (THREE.Mesh | THREE.Group)[];

    if (rampObjects.length > 0) {
        raycaster.set(playerRef.current.position.clone().add(new THREE.Vector3(0, 10, 0)), new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObjects(rampObjects, true);
        const validIntersects = intersects.filter(i => i.point.y < playerRef.current!.position.y + 1);
        if (validIntersects.length > 0) {
            const groundY = validIntersects.sort((a, b) => b.point.y - a.point.y)[0].point.y;
            if (playerRef.current.position.y < groundY + playerHeight + 0.5) {
                playerRef.current.position.y = groundY + playerHeight;
                onRamp = true;
            }
        }
    }

    if (!onRamp) {
        if (playerRef.current.position.y > playerHeight) {
            velocityRef.current.y -= 9.8 * delta * 2;
            playerRef.current.position.y += velocityRef.current.y * delta;
        }
        if (playerRef.current.position.y < playerHeight) {
            playerRef.current.position.y = playerHeight;
            velocityRef.current.y = 0;
        }
    } else {
        velocityRef.current.y = 0;
    }

    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
    playerRef.current.position.x = Math.max(-halfTotalWidth, Math.min(halfTotalWidth, playerRef.current.position.x));
    playerRef.current.position.z = Math.max(-halfTotalWidth, Math.min(halfTotalWidth, playerRef.current.position.z));
}
