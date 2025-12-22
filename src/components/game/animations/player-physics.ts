
import * as THREE from 'three';
import { TOTAL_GRID_WIDTH } from '@/lib/game-constants';
import type { GameState } from '../core/state';

export function applyPhysicsAndBoundaries(gameState: GameState, delta: number) {
    const { playerRef, velocityRef, controlModeRef, rampMeshRef, collegeRampMeshRef, universityRamp, tilePlaneRef, staticCollidersRef, walkableSurfacesRef, inputRef, jumpCooldownRef, forestGroundRef } = gameState;
    if (!playerRef.current) return;

    const playerHeight = controlModeRef.current === 'car' ? 2.5 : 3.5;
    let onRamp = false;
    let onGround = false;
    const raycaster = new THREE.Raycaster();
    
    // The university ramp was missing from this check, causing gravity to be incorrectly applied.
    const rampObjects = [
        rampMeshRef.current, 
        collegeRampMeshRef.current, 
        universityRamp.current, 
        tilePlaneRef.current,
        forestGroundRef.current,
        ...walkableSurfacesRef.current
    ].filter(Boolean) as (THREE.Mesh | THREE.Group)[];

    if (rampObjects.length > 0) {
        raycaster.set(playerRef.current.position.clone().add(new THREE.Vector3(0, 10, 0)), new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObjects(rampObjects, true);
        const validIntersects = intersects.filter(i => i.point.y < playerRef.current!.position.y + 1);
        if (validIntersects.length > 0) {
            const groundY = validIntersects.sort((a, b) => b.point.y - a.point.y)[0].point.y;
            if (playerRef.current.position.y < groundY + playerHeight + 0.5) {
                playerRef.current.position.y = groundY + playerHeight;
                onRamp = true;
                onGround = true;
            }
        }
    }

    if (!onRamp) {
        if (playerRef.current.position.y > playerHeight) {
            velocityRef.current.y -= 9.8 * delta * 2;
        } else {
             playerRef.current.position.y = playerHeight;
             velocityRef.current.y = Math.max(0, velocityRef.current.y);
             onGround = true;
        }

        // Safeguard to ensure player is always above the main dome
        if (rampMeshRef.current) {
            raycaster.set(playerRef.current.position.clone().add(new THREE.Vector3(0, 10, 0)), new THREE.Vector3(0, -1, 0));
            const domeIntersects = raycaster.intersectObject(rampMeshRef.current);
            if (domeIntersects.length > 0) {
                const domeGroundY = domeIntersects[0].point.y;
                if (playerRef.current.position.y < domeGroundY + playerHeight) {
                    playerRef.current.position.y = domeGroundY + playerHeight;
                    velocityRef.current.y = 0; // Stop any downward velocity
                    onGround = true;
                }
            }
        }
    } else {
        velocityRef.current.y = 0;
        onGround = true; // If on a ramp, we are on the ground
    }

    if (jumpCooldownRef.current > 0) {
        jumpCooldownRef.current -= delta;
    }

    if (inputRef.current.jump && onGround && jumpCooldownRef.current <= 0 && controlModeRef.current === 'person') {
        velocityRef.current.y = 18;
        jumpCooldownRef.current = 1; // 1 second cooldown
    }

    // Apply vertical velocity from jumping
    playerRef.current.position.y += velocityRef.current.y * delta;


    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
    playerRef.current.position.x = Math.max(-halfTotalWidth, Math.min(halfTotalWidth, playerRef.current.position.x));
    playerRef.current.position.z = Math.max(-halfTotalWidth, Math.min(halfTotalWidth, playerRef.current.position.z));
}
