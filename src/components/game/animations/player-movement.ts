
import * as THREE from 'three';
import type { GameState } from '../core/state';
import { updateCarMovement } from './car-movement';
import { updatePersonMovement } from './person-movement';

export function updatePlayerMovement(
  gameState: GameState,
  delta: number,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  now: number
) {
  const { controlModeRef, isTransformingRef } = gameState;

  if (!gameState.playerRef.current || isTransformingRef.current) return;

  if (controlModeRef.current === 'car') {
    updateCarMovement(gameState, delta, scene, now);
  } else if (controlModeRef.current === 'person') {
    updatePersonMovement(gameState, delta, camera);
  }
}
