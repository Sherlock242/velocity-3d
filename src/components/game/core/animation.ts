
import * as THREE from 'three';
import { updateEmoji } from '../animations/emoji';
import { updatePlayerMovement } from '../animations/player-movement';
import { handleCollisions } from '../animations/player-collisions';
import { applyPhysicsAndBoundaries } from '../animations/player-physics';
import { checkTrackAndPenalties } from '../animations/track-penalties';
import { updateCameraPosition } from '../animations/camera';
import { updateSceneElements } from '../animations/scene-elements';
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
    const { animationFrameIdRef, playerRef, gameTimeRef, velocityRef, gearRef } = gameState;

    const animate = () => {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const now = clock.getElapsedTime();
        gameTimeRef.current += delta;

        updateEmoji(gameState, delta);
        updateSceneElements(gameState, delta, now, scene);

        if (playerRef.current) {
            updatePlayerMovement(gameState, delta, scene, now);
            applyPhysicsAndBoundaries(gameState, delta);
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

        renderer.render(scene, camera);
    };
    return animate;
}
