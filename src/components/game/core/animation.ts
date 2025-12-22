
import * as THREE from 'three';
import { updateEmoji } from '../animations/emoji';
import { updatePlayerMovement } from '../animations/player-movement';
import { handleCollisions } from '../animations/player-collisions';
import { applyPhysicsAndBoundaries } from '../animations/player-physics';
import { checkTrackAndPenalties } from '../animations/track-penalties';
import { updateCameraPosition } from '../animations/camera';
import { updateSceneElements } from '../animations/scene-elements';
import { updateElectricSparks } from '../animations/sparks';
import type { GameState } from './state';

const clock = new THREE.Clock();

export function createAnimationLoop(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    gameState: GameState,
    toast: (options: { title: string; description: string; variant: 'destructive' }) => void,
    setGameData: React.Dispatch<React.SetStateAction<{ speed: number; time: number; carPosition: { x: number; z: number; }; carRotation: number; controlMode: 'car' | 'person'; gear: 1 | 2 | 3; }>>,
    topDownSector: number | null
) {
    const { animationFrameIdRef, playerRef, gameTimeRef, velocityRef, gearRef, electricSparksRef } = gameState;

    let onGround = false;

    const animate = () => {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const now = clock.getElapsedTime();
        gameTimeRef.current += delta;

        updateEmoji(gameState, delta);
        updateElectricSparks(electricSparksRef.current);


        if (playerRef.current) {
            onGround = applyPhysicsAndBoundaries(gameState, delta);
            updatePlayerMovement(gameState, delta, scene, camera, now, onGround);
            handleCollisions(gameState, delta);
            updateCameraPosition(gameState, camera, topDownSector);
            checkTrackAndPenalties(gameState, toast);

            setGameData(prev => ({
                ...prev,
                speed: velocityRef.current.length() * 3.6,
                time: gameTimeRef.current,
                carPosition: { x: playerRef.current!.position.x, z: playerRef.current!.position.z },
                carRotation: playerRef.current!.rotation.y,
                gear: gearRef.current,
            }));
        }

        updateSceneElements(gameState, delta, now, scene);
        renderer.render(scene, camera);
    };
    return animate;
}
