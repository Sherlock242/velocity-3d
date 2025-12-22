
import * as THREE from 'three';
import { TOTAL_GRID_WIDTH } from '@/lib/game-constants';
import type { GameState } from '../core/state';

export function applyPhysicsAndBoundaries(gameState: GameState, delta: number) {
    const { playerRef, velocityRef, controlModeRef, rampMeshRef, collegeRampMeshRef, universityRamp, tilePlaneRef, staticCollidersRef, walkableSurfacesRef, inputRef, jumpCooldownRef, isSector4LoadedRef, forestGroundRef } = gameState;
    if (!playerRef.current) return;

    const playerHeight = controlModeRef.current === 'car' ? 2.5 : 3.5;
    let onGround = false;
    let groundY = 0;
    const raycaster = new THREE.Raycaster(playerRef.current.position.clone().add(new THREE.Vector3(0, 10, 0)), new THREE.Vector3(0, -1, 0));
    
    const walkableMeshes = [...walkableSurfacesRef.current];
    if(isSector4LoadedRef && isSector4LoadedRef.current && forestGroundRef.current) {
        walkableMeshes.push(forestGroundRef.current);
    }
    
    const rampObjects: (THREE.Mesh | THREE.Group)[] = [
        rampMeshRef.current, 
        collegeRampMeshRef.current, 
        universityRamp.current, 
        tilePlaneRef.current,
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
        // Use a default ground height if no other surface is detected
        groundY = 0;
    }

    // --- Physics Logic ---

    // 1. Handle landing on a surface
    if (onGround && playerRef.current.position.y < groundY + playerHeight + 0.1) {
        playerRef.current.position.y = groundY + playerHeight;
        if (velocityRef.current.y < 0) {
            velocityRef.current.y = 0;
        }
        if (jumpCooldownRef.current > 0) {
            jumpCooldownRef.current -= delta;
        }
    } 
    // 2. Handle being airborne
    else {
        velocityRef.current.y -= 9.8 * delta * 2; // Apply gravity
        onGround = false; // Ensure onGround is false if airborne
    }
    
    // 3. Handle jumping
    if (onGround && inputRef.current.jump && jumpCooldownRef.current <= 0 && controlModeRef.current === 'person') {
        velocityRef.current.y = 18;
        jumpCooldownRef.current = 1; // 1 second cooldown
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
}
