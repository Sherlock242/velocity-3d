
import * as THREE from 'three';
import { GEAR_MAX_SPEEDS } from '@/lib/game-constants';
import type { GameState } from '../core/state';

let currentSteerAngle = 0;
const tireMarkGeometry = new THREE.PlaneGeometry(0.3, 1);
const tireMarkMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.6,
});
tireMarkMaterial.polygonOffset = true;
tireMarkMaterial.polygonOffsetFactor = -1;

export function updatePlayerMovement(gameState: GameState, delta: number, scene: THREE.Scene, now: number) {
    const {
        playerRef, controlModeRef, isTransformingRef, inputRef, velocityRef,
        gearRef, audioInitializedRef, engineSoundRef, skidSoundRef,
        engineOscillatorRef, tireMarksRef
    } = gameState;

    if (!playerRef.current || isTransformingRef.current) return;

    if (controlModeRef.current === 'car') {
        const maxSpeed = GEAR_MAX_SPEEDS[gearRef.current];
        const acceleration = 30;
        const baseTurnSpeed = 2.5;
        const slideFactor = 0.05;

        let targetSteerDirection = 0;
        if (inputRef.current.left) targetSteerDirection = 1;
        if (inputRef.current.right) targetSteerDirection = -1;

        currentSteerAngle += (targetSteerDirection - currentSteerAngle) * 0.1;

        const currentSpeed = velocityRef.current.length();
        const speedRatioForTurning = Math.min(1, currentSpeed / maxSpeed);
        const turnSpeed = baseTurnSpeed * (1 - speedRatioForTurning * 0.7);

        if (currentSpeed > 0.1) {
            playerRef.current.rotation.y += currentSteerAngle * turnSpeed * delta;
        }

        const forward = new THREE.Vector3();
        playerRef.current.getWorldDirection(forward);

        let moveDirection = 0;
        if (inputRef.current.forward) moveDirection = 1;
        if (inputRef.current.backward) moveDirection = -1;

        if (moveDirection > 0) {
            velocityRef.current.add(forward.clone().multiplyScalar(acceleration * moveDirection * delta));
        } else if (moveDirection < 0) {
            velocityRef.current.add(forward.clone().multiplyScalar(acceleration * moveDirection * delta));
        }

        const desiredVelocity = forward.clone().multiplyScalar(velocityRef.current.length());
        velocityRef.current.lerp(desiredVelocity, slideFactor);

        velocityRef.current.multiplyScalar(moveDirection === 0 ? 0.9 : 0.99);

        if (velocityRef.current.length() > maxSpeed) {
            velocityRef.current.normalize().multiplyScalar(maxSpeed);
        }

        playerRef.current.position.add(velocityRef.current.clone().multiplyScalar(delta));

        const speedRatio = velocityRef.current.length() / maxSpeed;
        const steerRatio = Math.abs(currentSteerAngle);
        const isDrifting = speedRatio > 0.2 && steerRatio > 0.5;

        if (audioInitializedRef.current && engineSoundRef.current && skidSoundRef.current && engineOscillatorRef.current) {
            engineSoundRef.current.setVolume(speedRatio * 0.1);
            engineOscillatorRef.current.frequency.setTargetAtTime(50 + speedRatio * 150, engineSoundRef.current.context.currentTime, 0.01);
            skidSoundRef.current.setVolume(isDrifting ? speedRatio * steerRatio * 0.2 : 0);
        }

        const wheels = playerRef.current.userData.parts.wheels as THREE.Mesh[];
        if (wheels) {
            if (isDrifting && wheels.length >= 4) {
                const rearLeftWheel = wheels[2];
                const rearRightWheel = wheels[3];
                const rearLeftPos = new THREE.Vector3();
                rearLeftWheel.getWorldPosition(rearLeftPos);
                const rearRightPos = new THREE.Vector3();
                rearRightWheel.getWorldPosition(rearRightPos);

                [rearLeftPos, rearRightPos].forEach(pos => {
                    const tireMark = new THREE.Mesh(tireMarkGeometry, tireMarkMaterial.clone());
                    tireMark.position.copy(pos).setY(0.13);
                    tireMark.quaternion.copy(playerRef.current!.quaternion);
                    tireMark.rotateX(-Math.PI / 2);
                    scene.add(tireMark);
                    tireMarksRef.current.push({ mesh: tireMark, createdAt: now });
                });
            }

            const wheelRotationSpeed = velocityRef.current.length() * delta * 2;
            wheels.forEach(wheel => wheel.rotation.x -= wheelRotationSpeed);
            wheels[0].rotation.y = wheels[1].rotation.y = currentSteerAngle * 0.4;
        }

    } else if (controlModeRef.current === 'person') {
        const personMoveSpeed = 50;
        const personTurnSpeed = 3;
        const maxPersonSpeed = 50 / 3.6;
        velocityRef.current.multiplyScalar(0.95);

        const forward = new THREE.Vector3();
        playerRef.current.getWorldDirection(forward);
        if (inputRef.current.forward) velocityRef.current.add(forward.multiplyScalar(personMoveSpeed * delta));
        if (inputRef.current.backward) velocityRef.current.add(forward.multiplyScalar(-personMoveSpeed * delta * 0.5));
        if (inputRef.current.left) playerRef.current.rotation.y += personTurnSpeed * delta;
        if (inputRef.current.right) playerRef.current.rotation.y -= personTurnSpeed * delta;

        if (velocityRef.current.length() > maxPersonSpeed) {
            velocityRef.current.normalize().multiplyScalar(maxPersonSpeed);
        }
        playerRef.current.position.add(velocityRef.current.clone().multiplyScalar(delta));

        if (audioInitializedRef.current && engineSoundRef.current && skidSoundRef.current) {
            engineSoundRef.current.setVolume(0);
            skidSoundRef.current.setVolume(0);
        }
    }
}
