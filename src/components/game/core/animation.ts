
import * as THREE from 'three';
import { handleAssessPenalty } from '@/app/actions';
import { updateTransformerAnimation } from '../models/transformer';
import {
  TOTAL_GRID_WIDTH,
  GRID_SIZE,
  CELL_SIZE,
  ROAD_WIDTH,
  GEAR_MAX_SPEEDS,
} from '@/lib/game-constants';
import type { GameState, EmojiFace } from './state';

let currentSteerAngle = 0;
let previousSector = -1;

const tireMarkGeometry = new THREE.PlaneGeometry(0.3, 1);
const tireMarkMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.6,
});
tireMarkMaterial.polygonOffset = true;
tireMarkMaterial.polygonOffsetFactor = -1;
const clock = new THREE.Clock();

// --- EMOJI EXPRESSION LOGIC ---
const EXPRESSION_INTERVAL = 3; // seconds
let currentExpression = 'neutral';
let blinkState = {
    isBlinking: false,
    progress: 0,
    direction: 1,
};
let winkState = {
    isWinking: false,
    progress: 0,
    direction: 1,
    eye: 'left' as 'left' | 'right',
};

const neutralMouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-15, 2, 0), new THREE.Vector3(-7, -1, 0),
    new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(7, -1, 0),
    new THREE.Vector3(15, 2, 0),
]);

const happyMouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-18, -1, 0), new THREE.Vector3(-9, 6, 0),
    new THREE.Vector3(0, 7, 0), new THREE.Vector3(9, 6, 0),
    new THREE.Vector3(18, -1, 0),
]);

const sadMouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-18, 5, 0), new THREE.Vector3(-9, -5, 0),
    new THREE.Vector3(0, -6, 0), new THREE.Vector3(9, -5, 0),
    new THREE.Vector3(18, 5, 0),
]);

const surprisedMouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-6, -4, 0), new THREE.Vector3(0, 6, 0),
    new THREE.Vector3(6, -4, 0), new THREE.Vector3(0, -7, 0),
    new THREE.Vector3(-6, -4, 0)
]);

function setMouthCurve(mouth: THREE.Mesh, curve: THREE.CatmullRomCurve3) {
    const mouthGeometry = new THREE.TubeGeometry(curve, 20, 0.5, 8, false);
    mouth.geometry.dispose();
    mouth.geometry = mouthGeometry;
}

function setEyesVisibility(face: EmojiFace, visible: boolean) {
    if (face.leftEye) face.leftEye.visible = visible;
    if (face.rightEye) face.rightEye.visible = visible;
}

function setHeartsVisibility(face: EmojiFace, visible: boolean) {
    if (face.leftHeart) face.leftHeart.visible = visible;
    if (face.rightHeart) face.rightHeart.visible = visible;
}

function setHappyExpression(face: EmojiFace) {
    if (!face.leftEyebrow || !face.rightEyebrow || !face.mouth) return;
    setEyesVisibility(face, true);
    setHeartsVisibility(face, false);
    face.leftEyebrow.rotation.z = -Math.PI / 8;
    face.rightEyebrow.rotation.z = Math.PI / 8;
    setMouthCurve(face.mouth, happyMouthCurve);
    currentExpression = 'happy';
}

function setSadExpression(face: EmojiFace) {
    if (!face.leftEyebrow || !face.rightEyebrow || !face.mouth) return;
    setEyesVisibility(face, true);
    setHeartsVisibility(face, false);
    face.leftEyebrow.rotation.z = Math.PI / 10;
    face.rightEyebrow.rotation.z = -Math.PI / 10;
    setMouthCurve(face.mouth, sadMouthCurve);
    currentExpression = 'sad';
}

function setSurprisedExpression(face: EmojiFace) {
    if (!face.leftEyebrow || !face.rightEyebrow || !face.mouth) return;
    setEyesVisibility(face, true);
    setHeartsVisibility(face, false);
    face.leftEyebrow.rotation.z = -Math.PI / 6;
    face.rightEyebrow.rotation.z = Math.PI / 6;
    setMouthCurve(face.mouth, surprisedMouthCurve);
    currentExpression = 'surprised';
}

function setNeutralExpression(face: EmojiFace) {
    if (!face.leftEyebrow || !face.rightEyebrow || !face.mouth) return;
    setEyesVisibility(face, true);
    setHeartsVisibility(face, false);
    face.leftEyebrow.rotation.z = -Math.PI / 16;
    face.rightEyebrow.rotation.z = Math.PI / 16;
    setMouthCurve(face.mouth, neutralMouthCurve);
    currentExpression = 'neutral';
}

function setLoveStruckExpression(face: EmojiFace) {
    if (!face.leftEyebrow || !face.rightEyebrow || !face.mouth) return;
    setEyesVisibility(face, false);
    setHeartsVisibility(face, true);
    // Eyebrows raised in adoration
    face.leftEyebrow.rotation.z = -Math.PI / 8;
    face.rightEyebrow.rotation.z = Math.PI / 8;
    // Slightly open mouth
    setMouthCurve(face.mouth, surprisedMouthCurve);
    currentExpression = 'loveStruck';
}

function triggerBlink(face: EmojiFace) {
    if (!blinkState.isBlinking) {
        blinkState.isBlinking = true;
        blinkState.progress = 0;
        blinkState.direction = 1;
    }
}

function triggerWink(face: EmojiFace) {
    if (!winkState.isWinking) {
        winkState.isWinking = true;
        winkState.progress = 0;
        winkState.direction = 1;
        winkState.eye = Math.random() > 0.5 ? 'left' : 'right';
    }
}

function updateBlink(face: EmojiFace, delta: number) {
    if (!blinkState.isBlinking || !face.leftEye || !face.rightEye) return;

    const blinkSpeed = 10;
    blinkState.progress += blinkSpeed * delta * blinkState.direction;

    if (blinkState.progress >= 1) {
        blinkState.progress = 1;
        blinkState.direction = -1; // Start opening
    }

    if (blinkState.progress <= 0 && blinkState.direction === -1) {
        blinkState.progress = 0;
        blinkState.isBlinking = false; // Blink finished
    }

    const scaleY = 1 - blinkState.progress;
    face.leftEye.scale.y = scaleY;
    face.rightEye.scale.y = scaleY;
}

function updateWink(face: EmojiFace, delta: number) {
    if (!winkState.isWinking || !face.leftEye || !face.rightEye) return;
    
    const winkSpeed = 8;
    winkState.progress += winkSpeed * delta * winkState.direction;

    if (winkState.progress >= 1) {
        winkState.progress = 1;
        winkState.direction = -1;
    }

    if (winkState.progress <= 0 && winkState.direction === -1) {
        winkState.progress = 0;
        winkState.isWinking = false;
        if(winkState.eye === 'left' && face.leftEye) face.leftEye.scale.y = 1;
        if(winkState.eye === 'right' && face.rightEye) face.rightEye.scale.y = 1;
        return;
    }

    const scaleY = 1 - winkState.progress;
    const eyeToAnimate = winkState.eye === 'left' ? face.leftEye : face.rightEye;
    if (eyeToAnimate) {
        eyeToAnimate.scale.y = scaleY;
    }
}

function updateFaceMovement(gameState: GameState, delta: number) {
    const { emojiFaceRef, faceTargetPositionRef, currentFacePositionRef, domeRef } = gameState;
    const { faceGroup, leftPupil, rightPupil } = emojiFaceRef.current;

    if (!faceGroup || !leftPupil || !rightPupil || !domeRef.current) return;

    const lerpFactor = delta * 0.5;
    currentFacePositionRef.current.phi = THREE.MathUtils.lerp(currentFacePositionRef.current.phi, faceTargetPositionRef.current.phi, lerpFactor);
    currentFacePositionRef.current.theta = THREE.MathUtils.lerp(currentFacePositionRef.current.theta, faceTargetPositionRef.current.theta, lerpFactor);

    const position = new THREE.Vector3().setFromSpherical(currentFacePositionRef.current);
    faceGroup.position.copy(position);
    faceGroup.lookAt(faceGroup.position.clone().multiplyScalar(1.1).add(domeRef.current.position));

    const pupilMovementRange = 5;
    const targetWorldPosition = new THREE.Vector3().setFromSpherical(faceTargetPositionRef.current);
    const localTargetPosition = faceGroup.worldToLocal(targetWorldPosition);
    const direction = localTargetPosition.normalize();

    leftPupil.position.x = direction.x * pupilMovementRange;
    leftPupil.position.y = direction.y * pupilMovementRange;
    rightPupil.position.x = direction.x * pupilMovementRange;
    rightPupil.position.y = direction.y * pupilMovementRange;
}

function updateEmoji(gameState: GameState, delta: number) {
    const { emojiFaceRef, expressionTimerRef, faceTargetPositionRef } = gameState;

    if (!emojiFaceRef.current.faceGroup) return;
    
    updateBlink(emojiFaceRef.current, delta);
    updateWink(emojiFaceRef.current, delta);
    updateFaceMovement(gameState, delta);

    expressionTimerRef.current += delta;
    if (expressionTimerRef.current > EXPRESSION_INTERVAL) {
        expressionTimerRef.current = 0;
        
        faceTargetPositionRef.current.theta = (Math.random() - 0.5) * Math.PI; 
        
        const verticalAngleCenter = THREE.MathUtils.degToRad(70);
        const verticalAngleRange = THREE.MathUtils.degToRad(40);
        faceTargetPositionRef.current.phi = verticalAngleCenter + (Math.random() - 0.5) * verticalAngleRange;

        const expressions = ['happy', 'sad', 'surprised', 'blink', 'neutral', 'wink', 'loveStruck'];
        const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];

        if (randomExpression !== currentExpression) {
            switch (randomExpression) {
                case 'happy': setHappyExpression(emojiFaceRef.current); break;
                case 'sad': setSadExpression(emojiFaceRef.current); break;
                case 'surprised': setSurprisedExpression(emojiFaceRef.current); break;
                case 'loveStruck': setLoveStruckExpression(emojiFaceRef.current); break;
                case 'blink': triggerBlink(emojiFaceRef.current); break;
                case 'wink': triggerWink(emojiFaceRef.current); break;
                default: setNeutralExpression(emojiFaceRef.current); break;
            }
        }
    }
}

function updatePlayerMovement(gameState: GameState, delta: number, scene: THREE.Scene, now: number) {
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

function handleCollisions(gameState: GameState, delta: number) {
    const { playerRef, velocityRef, staticCollidersRef, obstacleCarsRef, controlModeRef } = gameState;
    if (!playerRef.current) return;

    const playerBox = new THREE.Box3().setFromObject(playerRef.current);
    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;

    obstacleCarsRef.current.forEach((obstacle) => {
        const forward = new THREE.Vector3();
        obstacle.getWorldDirection(forward);
        obstacle.position.add(forward.multiplyScalar(50 * delta));
        if (Math.abs(obstacle.position.x) > halfTotalWidth + CELL_SIZE || Math.abs(obstacle.position.z) > halfTotalWidth + CELL_SIZE) {
            const onVerticalRoad = Math.random() > 0.5;
            const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
            const positionOnRoad = (Math.random() - 0.5) * TOTAL_GRID_WIDTH;
            if (onVerticalRoad) {
                obstacle.position.x = roadIndex * CELL_SIZE - halfTotalWidth;
                obstacle.position.z = positionOnRoad;
                obstacle.rotation.y = Math.random() > 0.5 ? 0 : Math.PI;
            } else {
                obstacle.position.x = positionOnRoad;
                obstacle.position.z = roadIndex * CELL_SIZE - halfTotalWidth;
                obstacle.rotation.y = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
            }
        }
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
        if (playerBox.intersectsBox(obstacleBox)) {
            velocityRef.current.multiplyScalar(0.1);
            const knockback = playerRef.current!.position.clone().sub(obstacle.position).normalize().multiplyScalar(5);
            playerRef.current!.position.add(knockback.multiplyScalar(delta * 60));
        }
    });

    staticCollidersRef.current.forEach((collider) => {
        const colliderBox = new THREE.Box3().setFromObject(collider);
        if (playerBox.intersectsBox(colliderBox)) {
            const isSpecialBuilding = collider.name.toLowerCase().includes('college') || collider.name === 'LibraryBuilding';
            
            if (collider.parent?.name === 'compoundWall' || collider.name === 'collegeRamp') {
                velocityRef.current.multiplyScalar(0);
                const intersection = new THREE.Box3();
                intersection.copy(playerBox).intersect(colliderBox);
                const penetration = new THREE.Vector3();
                penetration.subVectors(intersection.max, intersection.min);
                const moveDirection = new THREE.Vector3();
                if (penetration.x < penetration.z) {
                    moveDirection.x = playerRef.current!.position.x > collider.position.x ? penetration.x : -penetration.x;
                } else {
                    moveDirection.z = playerRef.current!.position.z > collider.position.z ? penetration.z : -penetration.z;
                }
                playerRef.current!.position.add(moveDirection);
                return;
            }

            let slowdown = 0.1;
            if (isSpecialBuilding && controlModeRef.current === 'car') {
                slowdown = 0.5;
            }
            velocityRef.current.multiplyScalar(slowdown);

            if (!isSpecialBuilding) {
                const knockback = playerRef.current!.position.clone().sub(collider.position).normalize().multiplyScalar(5);
                playerRef.current!.position.add(knockback.multiplyScalar(delta * 60));
            }
        }
    });
}

function applyPhysicsAndBoundaries(gameState: GameState, delta: number) {
    const { playerRef, velocityRef, controlModeRef, rampMeshRef, collegeRampMeshRef } = gameState;
    if (!playerRef.current) return;

    const playerHeight = controlModeRef.current === 'car' ? 0.6 : 2.0;
    let onRamp = false;
    const raycaster = new THREE.Raycaster();
    const rampObjects = [rampMeshRef.current, collegeRampMeshRef.current].filter(Boolean) as (THREE.Mesh | THREE.Group)[];

    if (rampObjects.length > 0) {
        raycaster.set(playerRef.current.position.clone().add(new THREE.Vector3(0, 10, 0)), new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObjects(rampObjects, true);
        const validIntersects = intersects.filter(i => i.point.y < playerRef.current!.position.y + 1);
        if (validIntersects.length > 0) {
            const groundY = validIntersects.sort((a, b) => b.point.y - a.point.y)[0].point.y;
            if (playerRef.current.position.y < groundY + playerHeight + 0.5) {
                playerRef.current.position.y = groundY + playerHeight;
                onRamp = true;
            }
        }
    }

    if (!onRamp) {
        if (playerRef.current.position.y > playerHeight) {
            velocityRef.current.y -= 9.8 * delta * 2;
            playerRef.current.position.y += velocityRef.current.y * delta;
        }
        if (playerRef.current.position.y < playerHeight) {
            playerRef.current.position.y = playerHeight;
            velocityRef.current.y = 0;
        }
    } else {
        velocityRef.current.y = 0;
    }

    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
    playerRef.current.position.x = Math.max(-halfTotalWidth, Math.min(halfTotalWidth, playerRef.current.position.x));
    playerRef.current.position.z = Math.max(-halfTotalWidth, Math.min(halfTotalWidth, playerRef.current.position.z));
}


function updateCameraPosition(gameState: GameState, camera: THREE.PerspectiveCamera, topDownSector: number | null) {
    const { playerRef, controlModeRef, cameraOffsetRef } = gameState;
    if (!playerRef.current) return;
    
    if (topDownSector !== null) {
        const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
        const row = Math.floor((topDownSector - 1) / GRID_SIZE);
        const col = (topDownSector - 1) % GRID_SIZE;
        const sectorCenterX = col * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
        const sectorCenterZ = row * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
        camera.position.set(sectorCenterX, 1200, sectorCenterZ);
        camera.lookAt(sectorCenterX, 0, sectorCenterZ);
    } else {
        const offset = cameraOffsetRef.current.clone();
        if (controlModeRef.current === 'person') offset.set(0, 4, -8);
        else offset.set(0, 2, -6);
        offset.applyQuaternion(playerRef.current.quaternion).add(playerRef.current.position);
        camera.position.copy(offset);
        camera.lookAt(playerRef.current.position);
    }
}

function updateSceneElements(gameState: GameState, delta: number, now: number, scene: THREE.Scene) {
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

function checkTrackAndPenalties(gameState: GameState, toast: (options: { title: string; description: string; variant: 'destructive' }) => void) {
    const { playerRef, velocityRef, wasOffTrackRef, penaltyCheckCooldownRef, gameTimeRef } = gameState;
    if (!playerRef.current) return;
    
    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
    const currentRoadXIndex = Math.round((playerRef.current.position.x + halfTotalWidth) / CELL_SIZE);
    const currentRoadZIndex = Math.round((playerRef.current.position.z + halfTotalWidth) / CELL_SIZE);
    const nearestRoadX = currentRoadXIndex * CELL_SIZE - halfTotalWidth;
    const nearestRoadZ = currentRoadZIndex * CELL_SIZE - halfTotalWidth;
    const onHorizontalRoad = Math.abs(playerRef.current.position.z - nearestRoadZ) < ROAD_WIDTH / 2;
    const onVerticalRoad = Math.abs(playerRef.current.position.x - nearestRoadX) < ROAD_WIDTH / 2;
    const isOffTrack = !(onHorizontalRoad || onVerticalRoad);

    if (isOffTrack) {
        wasOffTrackRef.current = true;
        velocityRef.current.multiplyScalar(0.95);
    }
    if (!isOffTrack && wasOffTrackRef.current && !penaltyCheckCooldownRef.current) {
        wasOffTrackRef.current = false;
        penaltyCheckCooldownRef.current = true;
        setTimeout(() => (penaltyCheckCooldownRef.current = false), 5000);

        handleAssessPenalty({
            lapTime: gameTimeRef.current,
            trackPosition: 'Player went off-road and returned.',
            speed: velocityRef.current.length() * 3.6,
        }).then((result) => {
            if (result.penalty) {
                toast({
                    title: 'Penalty Assessed!',
                    description: `${result.penalty} - ${result.reason}`,
                    variant: 'destructive',
                });
            }
        });
    }
}


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
