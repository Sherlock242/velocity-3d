
import * as THREE from 'three';
import { TOTAL_GRID_WIDTH } from '@/lib/game-constants';
import type { GameState } from '../core/state';

export function applyPhysicsAndBoundaries(gameState: GameState, delta: number) {
    const { playerRef, velocityRef, controlModeRef, rampMeshRef, collegeRampMeshRef, universityRamp, tilePlaneRef, staticCollidersRef, walkableSurfacesRef, inputRef, jumpCooldownRef, isSector4LoadedRef, forestGroundRef, groundPlaneRef } = gameState;
    if (!playerRef.current) return false;

    const playerHeight = controlModeRef.current === 'car' ? 0.5 : 3.5;
    let onGround = false;
    let groundY = 0;
    const raycaster = new THREE.Raycaster(playerRef.current.position.clone().add(new THREE.Vector3(0, 10, 0)), new THREE.Vector3(0, -1, 0));
    
    const walkableMeshes = [...walkableSurfacesRef.current];
    if (forestGroundRef.current) {
        walkableMeshes.push(forestGroundRef.current);
    }
    
    const rampObjects: (THREE.Mesh | THREE.Group)[] = [
        rampMeshRef.current, 
        collegeRampMeshRef.current, 
        universityRamp.current, 
        tilePlaneRef.current,
        groundPlaneRef.current,
        ...walkableMeshes
    ].filter(Boolean) as (THREE.Mesh | THREE.Group)[];

    if (rampObjects.length > 0) {
        const intersects = raycaster.intersectObjects(rampObjects, true);
        const validIntersects = intersects.filter(i => i.point.y < playerRef.current!.position.y + 1);
        
        if (validIntersects.length > 0) {
            groundY = validIntersects.sort((a, b) => b.point.y - a.point.y)[0].point.y;
            onGround = true;
        }
    }

    if (!onGround) {
        groundY = 0; // Default ground height if no surface is detected
    }

    // --- Physics Logic ---

    // 1. Handle landing on a surface
    if (onGround && playerRef.current.position.y < groundY + playerHeight + 0.1) {
        playerRef.current.position.y = groundY + playerHeight;
        if (velocityRef.current.y < 0) {
            velocityRef.current.y = 0;
        }
    } 
    // 2. Handle being airborne
    else {
        velocityRef.current.y -= 9.8 * delta * 2; // Apply gravity
        onGround = false;
    }
    
    // 3. Handle jumping
    if (onGround && inputRef.current.jump && jumpCooldownRef.current <= 0 && controlModeRef.current === 'person') {
        velocityRef.current.y = 18;
        jumpCooldownRef.current = 1; // 1 second cooldown
    } else if (jumpCooldownRef.current > 0) {
        jumpCooldownRef.current -= delta;
    }
    
    // 4. Apply final vertical velocity
    playerRef.current.position.y += velocityRef.current.y * delta;
    
    // 5. Check for falling through the world as a fallback
    if (playerRef.current.position.y < groundY + playerHeight) {
        playerRef.current.position.y = groundY + playerHeight;
        velocityRef.current.y = Math.max(0, velocityRef.current.y);
    }


    // --- Boundary Logic ---
    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
    playerRef.current.position.x = Math.max(-halfTotalWidth, Math.min(halfTotalWidth, playerRef.current.position.x));
    playerRef.current.position.z = Math.max(-halfTotalWidth, Math.min(halfTotalWidth, playerRef.current.position.z));

    return onGround;
}
