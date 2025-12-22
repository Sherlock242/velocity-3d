
import * as THREE from 'three';
import type { GameState } from '../core/state';
import { updateCarMovement } from './car-movement';
import { updatePersonMovement } from './person-movement';
import { updateTransformerAnimation } from '../models/transformer';

export function updatePlayerMovement(
  gameState: GameState,
  delta: number,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  now: number,
  onGround: boolean,
) {
  const { controlModeRef, isTransformingRef, transformProgressRef, playerRef, velocityRef } = gameState;

  if (!playerRef.current) return;

  if (controlModeRef.current === 'car') {
    updateCarMovement(gameState, delta, scene, now);
  } else if (controlModeRef.current === 'person') {
    updatePersonMovement(gameState, delta, camera);
  }

  // Always update the transformer animation, regardless of control mode,
  // to handle the transformation itself.
  if (playerRef.current) {
    updateTransformerAnimation(
        playerRef.current,
        transformProgressRef.current,
        velocityRef.current.length(),
        now,
        onGround
    );
  }
}
