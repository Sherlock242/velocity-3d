
import * as THREE from 'three';
import type { GameState } from '../core/state';

export function updatePersonMovement(gameState: GameState, delta: number, camera: THREE.PerspectiveCamera) {
    const {
        playerRef, inputRef, velocityRef,
        audioInitializedRef, engineSoundRef, skidSoundRef
    } = gameState;

    if (!playerRef.current) return;

    const personTurnSpeed = 2.5;
    const maxPersonSpeed = 19.44; // 70 km/h in m/s

    const forward = new THREE.Vector3();
    playerRef.current.getWorldDirection(forward);
    
    let targetVelocity = new THREE.Vector3();

    if (inputRef.current.forward) {
        targetVelocity = forward.clone().multiplyScalar(maxPersonSpeed);
    } else if (input.current.backward) {
        targetVelocity = forward.clone().multiplyScalar(-maxPersonSpeed * 0.5);
    } else {
        targetVelocity.set(0, 0, 0);
    }
    
    velocityRef.current.copy(targetVelocity);

    if (inputRef.current.left) playerRef.current.rotation.y += personTurnSpeed * delta;
    if (inputRef.current.right) playerRef.current.rotation.y -= personTurnSpeed * delta;

    playerRef.current.position.add(velocityRef.current.clone().multiplyScalar(delta));

    if (audioInitializedRef.current && engineSoundRef.current && skidSoundRef.current) {
        engineSoundRef.current.setVolume(0);
        skidSoundRef.current.setVolume(0);
    }
}
