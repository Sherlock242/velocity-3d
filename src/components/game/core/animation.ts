
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
import type { GameState } from './state';

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

export function createAnimationLoop(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    gameState: GameState,
    toast: (options: { title: string; description: string; variant: 'destructive' }) => void,
    setGameData: React.Dispatch<React.SetStateAction<{ speed: number; time: number; carPosition: { x: number; z: number; }; carRotation: number; controlMode: 'car' | 'person'; gear: 1 | 2 | 3; }>>,
    topDownSector: number | null
) {
    const {
        animationFrameIdRef, playerRef, gameTimeRef, fountainWaterJetRef,
        isTransformingRef, controlModeRef, transformProgressRef, velocityRef,
        walkingNpcsRef, inputRef, audioInitializedRef, engineSoundRef,
        skidSoundRef, engineOscillatorRef, tireMarksRef, rampMeshRef,
        collegeRampMeshRef, rampWallsRef, wasOffTrackRef, penaltyCheckCooldownRef,
        staticCollidersRef, obstacleCarsRef, cameraOffsetRef, gearRef
    } = gameState;

    const animate = () => {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        const player = playerRef.current;
        const delta = clock.getDelta();
        const now = clock.getElapsedTime();
        gameTimeRef.current += delta;

        // Fountain animation
        if (fountainWaterJetRef.current) {
            const waterJet = fountainWaterJetRef.current;
            const time = now * 5;
            waterJet.scale.y = Math.sin(time) * 0.5 + 0.5;
            waterJet.position.y = (waterJet.scale.y * 10) / 2 + 8;
        }

        // Handle transformation animation
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

        if (player) {
            updateTransformerAnimation(
                player as THREE.Group & { userData: { parts: any } },
                transformProgressRef.current,
                velocityRef.current.length(),
                now
            );
        }

        // NPC walking
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

            if (Math.random() < 0.01) {
                npc.rotation.y += (Math.random() - 0.5) * Math.PI / 2;
            }

            const bounds = npc.userData.bounds as THREE.Box2;
            if (!bounds.containsPoint(new THREE.Vector2(npc.position.x, npc.position.z))) {
                npc.rotation.y += Math.PI;
            }
        });

        if (player && controlModeRef.current === 'car' && !isTransformingRef.current) {
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
                player.rotation.y += currentSteerAngle * turnSpeed * delta;
            }

            const forward = new THREE.Vector3();
            player.getWorldDirection(forward);

            let moveDirection = 0;
            if (inputRef.current.forward) moveDirection = 1;
            if (inputRef.current.backward) moveDirection = -1;

            if (moveDirection > 0) {
                const accelerationVector = forward.clone().multiplyScalar(acceleration * moveDirection * delta);
                velocityRef.current.add(accelerationVector);
            } else if (moveDirection < 0) {
                 const accelerationVector = forward.clone().multiplyScalar(acceleration * moveDirection * delta);
                velocityRef.current.add(accelerationVector);
            }
            
            const desiredVelocity = forward.clone().multiplyScalar(velocityRef.current.length());
            velocityRef.current.lerp(desiredVelocity, slideFactor);

            // Apply conditional friction
            if (moveDirection === 0) {
              velocityRef.current.multiplyScalar(0.9); // Higher friction when not accelerating
            } else {
              velocityRef.current.multiplyScalar(0.99); // Lower friction when accelerating
            }
            
            if (velocityRef.current.length() > maxSpeed) {
                velocityRef.current.normalize().multiplyScalar(maxSpeed);
            }

            player.position.add(velocityRef.current.clone().multiplyScalar(delta));

            const speedRatio = velocityRef.current.length() / maxSpeed;
            const steerRatio = Math.abs(currentSteerAngle);
            const isDrifting = speedRatio > 0.2 && steerRatio > 0.5;

            if (audioInitializedRef.current && engineSoundRef.current && skidSoundRef.current && engineOscillatorRef.current) {
                engineSoundRef.current.setVolume(speedRatio * 0.1);
                engineOscillatorRef.current.frequency.setTargetAtTime(50 + speedRatio * 150, engineSoundRef.current.context.currentTime, 0.01);
                skidSoundRef.current.setVolume(isDrifting ? speedRatio * steerRatio * 0.2 : 0);
            }

            const wheels = player.userData.parts.wheels as THREE.Mesh[];

            if (isDrifting && wheels && wheels.length >= 4) {
                const rearLeftWheel = wheels[2];
                const rearRightWheel = wheels[3];
            
                const rearLeftPos = new THREE.Vector3();
                rearLeftWheel.getWorldPosition(rearLeftPos);
            
                const rearRightPos = new THREE.Vector3();
                rearRightWheel.getWorldPosition(rearRightPos);
            
                const markPositions = [rearLeftPos, rearRightPos];
            
                markPositions.forEach(pos => {
                    const tireMark = new THREE.Mesh(tireMarkGeometry, tireMarkMaterial.clone());
                    tireMark.position.copy(pos).setY(0.13);
                    tireMark.quaternion.copy(player.quaternion);
                    tireMark.rotateX(-Math.PI / 2);
                    scene.add(tireMark);
                    tireMarksRef.current.push({ mesh: tireMark, createdAt: now });
                });
            }

            const wheelRotationSpeed = velocityRef.current.length() * delta * 2;
            wheels.forEach((wheel: THREE.Mesh) => wheel.rotation.x -= wheelRotationSpeed);
            wheels[0].rotation.y = wheels[1].rotation.y = currentSteerAngle * 0.4;

        } else if (player && controlModeRef.current === 'person' && !isTransformingRef.current) {
            const personMoveSpeed = 50;
            const personTurnSpeed = 3;
            const maxPersonSpeed = 50 / 3.6;
            velocityRef.current.multiplyScalar(0.95);

            const forward = new THREE.Vector3();
            player.getWorldDirection(forward);
            if (inputRef.current.forward) velocityRef.current.add(forward.multiplyScalar(personMoveSpeed * delta));
            if (inputRef.current.backward) velocityRef.current.add(forward.multiplyScalar(-personMoveSpeed * delta * 0.5));
            if (inputRef.current.left) player.rotation.y += personTurnSpeed * delta;
            if (inputRef.current.right) player.rotation.y -= personTurnSpeed * delta;

            if (velocityRef.current.length() > maxPersonSpeed) {
                velocityRef.current.normalize().multiplyScalar(maxPersonSpeed);
            }
            player.position.add(velocityRef.current.clone().multiplyScalar(delta));

            if (audioInitializedRef.current && engineSoundRef.current && skidSoundRef.current) {
                engineSoundRef.current.setVolume(0);
                skidSoundRef.current.setVolume(0);
            }
        }

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

        if (player) {
            const playerHeight = controlModeRef.current === 'car' ? 0.6 : 2.0;
            let onRamp = false;
            const raycaster = new THREE.Raycaster();
            
            const rampObjects = [rampMeshRef.current, collegeRampMeshRef.current].filter(Boolean) as (THREE.Mesh | THREE.Group)[];

            if (rampObjects.length > 0) {
                raycaster.set(player.position.clone().add(new THREE.Vector3(0, 10, 0)), new THREE.Vector3(0, -1, 0));
                const intersects = raycaster.intersectObjects(rampObjects, true);

                // Find the highest valid ground beneath the player
                const validIntersects = intersects.filter(i => i.point.y < player.position.y + 1);
                if (validIntersects.length > 0) {
                    const closestIntersect = validIntersects.sort((a, b) => b.point.y - a.point.y)[0];
                    const groundY = closestIntersect.point.y;
                    if (player.position.y < groundY + playerHeight + 0.5) {
                        player.position.y = groundY + playerHeight;
                        onRamp = true;
                    }
                }
            }

            if (!onRamp) {
                if (player.position.y > playerHeight) {
                    velocityRef.current.y -= 9.8 * delta * 2;
                    player.position.y += velocityRef.current.y * delta;
                }
                if (player.position.y < playerHeight) {
                    player.position.y = playerHeight;
                    velocityRef.current.y = 0;
                }
            } else {
                velocityRef.current.y = 0;
            }

            const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
            const playerGridX = Math.floor((player.position.x + halfTotalWidth) / CELL_SIZE);
            const playerGridZ = Math.floor((player.position.z + halfTotalWidth) / CELL_SIZE);
            const currentSector = playerGridZ * GRID_SIZE + playerGridX + 1;

            if (currentSector !== previousSector) {
                if (rampWallsRef.current) {
                    rampWallsRef.current.visible = currentSector !== 14;
                }
                previousSector = currentSector;
            }

            player.position.x = Math.max(-halfTotalWidth, Math.min(halfTotalWidth, player.position.x));
            player.position.z = Math.max(-halfTotalWidth, Math.min(halfTotalWidth, player.position.z));

            if (topDownSector !== null) {
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
                offset.applyQuaternion(player.quaternion).add(player.position);
                camera.position.copy(offset);
                camera.lookAt(player.position);
            }

            const playerBox = new THREE.Box3().setFromObject(player);

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
                    const knockback = player.position.clone().sub(obstacle.position).normalize().multiplyScalar(5);
                    player.position.add(knockback.multiplyScalar(delta * 60));
                }
            });

            staticCollidersRef.current.forEach((collider) => {
                if (collider.name === 'collegeRamp') return;
                const colliderBox = new THREE.Box3().setFromObject(collider);
                if (playerBox.intersectsBox(colliderBox)) {
                    const isSpecialBuilding = collider.name.toLowerCase().includes('college') || collider.name === 'LibraryBuilding';
                    const isCompoundWall = collider.name === 'compoundWall';
                    
                    if (isCompoundWall) {
                        velocityRef.current.multiplyScalar(0); // Stop movement completely
                    } else {
                         let slowdown = 0.1;
                        if (isSpecialBuilding) {
                            if (controlModeRef.current === 'car') slowdown = 0.5;
                        }
                        velocityRef.current.multiplyScalar(slowdown);

                        if (!isSpecialBuilding) {
                            const knockback = player.position.clone().sub(collider.position).normalize().multiplyScalar(5);
                            player.position.add(knockback.multiplyScalar(delta * 60));
                        }
                    }
                }
            });

            const currentRoadXIndex = Math.round((player.position.x + halfTotalWidth) / CELL_SIZE);
            const currentRoadZIndex = Math.round((player.position.z + halfTotalWidth) / CELL_SIZE);
            const nearestRoadX = currentRoadXIndex * CELL_SIZE - halfTotalWidth;
            const nearestRoadZ = currentRoadZIndex * CELL_SIZE - halfTotalWidth;
            const onHorizontalRoad = Math.abs(player.position.z - nearestRoadZ) < ROAD_WIDTH / 2;
            const onVerticalRoad = Math.abs(player.position.x - nearestRoadX) < ROAD_WIDTH / 2;
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

            setGameData(prev => ({
                ...prev,
                speed: velocityRef.current.length() * 3.6,
                time: gameTimeRef.current,
                carPosition: { x: player.position.x, z: player.position.z },
                carRotation: player.rotation.y,
                gear: gearRef.current,
            }));
        }

        renderer.render(scene, camera);
    };
    return animate;
}
