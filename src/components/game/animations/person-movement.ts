
import * as THREE from 'three';
import type { GameState } from '../core/state';

export function updatePersonMovement(gameState: GameState, delta: number, camera: THREE.PerspectiveCamera) {
    const {
        playerRef, inputRef, velocityRef,
        audioInitializedRef, engineSoundRef, skidSoundRef
    } = gameState;

    if (!playerRef.current) return;

    const personTurnSpeed = 8;
    const maxPersonSpeed = 19.44; // 70 km/h in m/s

    // Get camera direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(camera.up, cameraDirection).negate();
    
    let moveDirection = new THREE.Vector3();
    if (inputRef.current.forward) {
        moveDirection.add(cameraDirection);
    }
    if (inputRef.current.backward) {
        moveDirection.sub(cameraDirection);
    }
    if (inputRef.current.left) {
        moveDirection.add(cameraRight);
    }
    if (inputRef.current.right) {
        moveDirection.sub(cameraRight);
    }

    if (moveDirection.lengthSq() > 0) {
        moveDirection.normalize();
        
        // Rotate player to face movement direction
        const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
        
        // Smoothly interpolate rotation
        let currentRotation = playerRef.current.rotation.y;
        let deltaRotation = targetRotation - currentRotation;

        // Handle wrapping around PI
        if (deltaRotation > Math.PI) deltaRotation -= Math.PI * 2;
        if (deltaRotation < -Math.PI) deltaRotation += Math.PI * 2;

        playerRef.current.rotation.y += deltaRotation * personTurnSpeed * delta;

        // Set velocity based on movement direction
        velocityRef.current.copy(moveDirection).multiplyScalar(maxPersonSpeed);

    } else {
        velocityRef.current.set(0, 0, 0);
    }

    playerRef.current.position.add(velocityRef.current.clone().multiplyScalar(delta));

    if (audioInitializedRef.current && engineSoundRef.current && skidSoundRef.current) {
        engineSoundRef.current.setVolume(0);
        skidSoundRef.current.setVolume(0);
    }
}
