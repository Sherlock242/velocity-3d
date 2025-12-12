
import * as THREE from 'three';
import { updateTransformerAnimation } from '../models/transformer';
import { TOTAL_GRID_WIDTH, GRID_SIZE, CELL_SIZE } from '@/lib/game-constants';
import type { GameState } from '../core/state';

let previousSector = -1;

export function updateSceneElements(gameState: GameState, delta: number, now: number, scene: THREE.Scene) {
    const {
        fountainWaterJetRef, isTransformingRef, controlModeRef, transformProgressRef,
        playerRef, velocityRef, walkingNpcsRef, tireMarksRef, rampWallsRef
    } = gameState;

    if (fountainWaterJetRef.current) {
        const waterJet = fountainWaterJetRef.current;
        const time = now * 5;
        waterJet.scale.y = Math.sin(time) * 0.5 + 0.5;
        waterJet.position.y = (waterJet.scale.y * 10) / 2 + 8;
    }

    if (isTransformingRef.current) {
        const transformSpeed = 2;
        if (controlModeRef.current === 'person') {
            transformProgressRef.current = Math.min(1, transformProgressRef.current + delta * transformSpeed);
            if (transformProgressRef.current >= 1) isTransformingRef.current = false;
        } else {
            transformProgressRef.current = Math.max(0, transformProgressRef.current - delta * transformSpeed);
            if (transformProgressRef.current <= 0) isTransformingRef.current = false;
        }
    }

    if (playerRef.current) {
        updateTransformerAnimation(
            playerRef.current as THREE.Group & { userData: { parts: any } },
            transformProgressRef.current,
            velocityRef.current.length(),
            now
        );
    }

    walkingNpcsRef.current.forEach(npc => {
        const npcSpeed = 1;
        const walkSpeed = 5;
        const npcParts = npc.userData.parts;
        const walkAmount = Math.sin(now * walkSpeed + npc.uuid.charCodeAt(0));
        npcParts.leftLeg.rotation.x = walkAmount * 0.5;
        npcParts.rightLeg.rotation.x = -walkAmount * 0.5;
        npcParts.leftArm.rotation.x = -walkAmount * 0.4;
        npcParts.rightArm.rotation.x = walkAmount * 0.4;
        const forward = new THREE.Vector3();
        npc.getWorldDirection(forward);
        npc.position.add(forward.multiplyScalar(npcSpeed * delta));
        if (Math.random() < 0.01) npc.rotation.y += (Math.random() - 0.5) * Math.PI / 2;
        const bounds = npc.userData.bounds as THREE.Box2;
        if (!bounds.containsPoint(new THREE.Vector2(npc.position.x, npc.position.z))) {
            npc.rotation.y += Math.PI;
        }
    });

    tireMarksRef.current = tireMarksRef.current.filter(mark => {
        const age = now - mark.createdAt;
        if (age > 2) {
            scene.remove(mark.mesh);
            (mark.mesh.material as THREE.Material).dispose();
            mark.mesh.geometry.dispose();
            return false;
        }
        (mark.mesh.material as THREE.MeshStandardMaterial).opacity = 0.6 * (1 - age / 2);
        return true;
    });

    if (playerRef.current) {
        const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
        const playerGridX = Math.floor((playerRef.current.position.x + halfTotalWidth) / CELL_SIZE);
        const playerGridZ = Math.floor((playerRef.current.position.z + halfTotalWidth) / GRID_SIZE);
        const currentSector = playerGridZ * GRID_SIZE + playerGridX + 1;

        if (currentSector !== previousSector) {
            if (rampWallsRef.current) {
                rampWallsRef.current.visible = currentSector !== 14;
            }
            previousSector = currentSector;
        }
    }
}
