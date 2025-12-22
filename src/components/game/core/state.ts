
import * as React from 'react';
import * as THREE from 'three';
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { ControlMode, Gear } from '@/lib/types';

export type EmojiFace = {
    faceGroup?: THREE.Group;
    leftEye?: THREE.Mesh;
    rightEye?: THREE.Mesh;
    leftHeart?: THREE.Mesh;
    rightHeart?: THREE.Mesh;
    leftPupil?: THREE.Mesh;
    rightPupil?: THREE.Mesh;
    leftEyebrow?: THREE.Mesh;
    rightEyebrow?: THREE.Mesh;
    mouth?: THREE.Mesh;
};

export type GameState = {
    mountRef: React.RefObject<HTMLDivElement>;
    gameTimeRef: React.MutableRefObject<number>;
    playerRef: React.MutableRefObject<THREE.Group | undefined>;
    velocityRef: React.MutableRefObject<THREE.Vector3>;
    inputRef: React.MutableRefObject<{
        forward: boolean;
        backward: boolean;
        left: boolean;
        right: boolean;
        jump: boolean;
    }>;
    wasOffTrackRef: React.MutableRefObject<boolean>;
    penaltyCheckCooldownRef: React.MutableRefObject<boolean>;
    animationFrameIdRef: React.MutableRefObject<number | undefined>;
    obstacleCarsRef: React.MutableRefObject<THREE.Group[]>;
    tireMarksRef: React.MutableRefObject<{ mesh: THREE.Mesh; createdAt: number }[]>;
    fountainWaterJetRef: React.MutableRefObject<THREE.Mesh | undefined>;
    walkingNpcsRef: React.MutableRefObject<THREE.Group[]>;
    staticCollidersRef: React.MutableRefObject<THREE.Group[]>;
    walkableSurfacesRef: React.MutableRefObject<(THREE.Group | THREE.Mesh)[]>;
    rampMeshRef: React.MutableRefObject<THREE.Mesh | undefined>;
    rampWallsRef: React.MutableRefObject<THREE.Group | undefined>;
    collegeRampMeshRef: React.MutableRefObject<THREE.Group | undefined>;
    universityRamp: React.MutableRefObject<THREE.Mesh | undefined>;
    controlModeRef: React.MutableRefObject<ControlMode>;
    isTransformingRef: React.MutableRefObject<boolean>;
    transformProgressRef: React.MutableRefObject<number>;
    cameraOffsetRef: React.MutableRefObject<THREE.Vector3>;
    audioListenerRef: React.MutableRefObject<THREE.AudioListener | undefined>;
    engineSoundRef: React.MutableRefObject<THREE.Audio | undefined>;
    skidSoundRef: React.MutableRefObject<THREE.Audio | undefined>;
    audioInitializedRef: React.MutableRefObject<boolean>;
    engineOscillatorRef: React.MutableRefObject<OscillatorNode | undefined>;
    gearRef: React.MutableRefObject<Gear>;
    expressionTimerRef: React.MutableRefObject<number>;
    emojiFaceRef: React.MutableRefObject<EmojiFace>;
    faceTargetPositionRef: React.MutableRefObject<THREE.Spherical>;
    currentFacePositionRef: React.MutableRefObject<THREE.Spherical>;
    domeRef: React.MutableRefObject<THREE.Mesh | undefined>;
    faceRotationStepRef: React.MutableRefObject<number>;
    electricSparksRef: React.MutableRefObject<THREE.Line[]>;
    tilePlaneRef: React.MutableRefObject<THREE.Mesh | undefined>;
    jumpCooldownRef: React.MutableRefObject<number>;
    gltfLoaderRef: React.MutableRefObject<GLTFLoader | undefined>;
    forestGroundRef: React.MutableRefObject<THREE.Mesh | undefined>;
    isSector4LoadedRef: React.MutableRefObject<boolean>;
};

export function useGameState(): GameState {
    const mountRef = React.useRef<HTMLDivElement>(null);
    const gameTimeRef = React.useRef(0);
    const playerRef = React.useRef<THREE.Group>();
    const velocityRef = React.useRef(new THREE.Vector3());
    const inputRef = React.useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
    });
    const wasOffTrackRef = React.useRef(false);
    const penaltyCheckCooldownRef = React.useRef(false);
    const animationFrameIdRef = React.useRef<number>();
    const obstacleCarsRef = React.useRef<THREE.Group[]>([]);
    const tireMarksRef = React.useRef<{ mesh: THREE.Mesh; createdAt: number }[]>([]);
    const fountainWaterJetRef = React.useRef<THREE.Mesh>();
    const walkingNpcsRef = React.useRef<THREE.Group[]>([]);
    const staticCollidersRef = React.useRef<THREE.Group[]>([]);
    const walkableSurfacesRef = React.useRef<(THREE.Group | THREE.Mesh)[]>([]);
    const rampMeshRef = React.useRef<THREE.Mesh>();
    const rampWallsRef = React.useRef<THREE.Group>();
    const collegeRampMeshRef = React.useRef<THREE.Group>();
    const universityRamp = React.useRef<THREE.Mesh>();
    const controlModeRef = React.useRef<ControlMode>('car');
    const isTransformingRef = React.useRef(false);
    const transformProgressRef = React.useRef(0);
    const cameraOffsetRef = React.useRef(new THREE.Vector3(0, 2, -6));
    const audioListenerRef = React.useRef<THREE.AudioListener>();
    const engineSoundRef = React.useRef<THREE.Audio>();
    const skidSoundRef = React.useRef<THREE.Audio>();
    const audioInitializedRef = React.useRef(false);
    const engineOscillatorRef = React.useRef<OscillatorNode>();
    const gearRef = React.useRef<Gear>(1);
    const expressionTimerRef = React.useRef(0);
    const emojiFaceRef = React.useRef<EmojiFace>({});
    const faceTargetPositionRef = React.useRef(new THREE.Spherical(200, THREE.MathUtils.degToRad(45), 0));
    const currentFacePositionRef = React.useRef(new THREE.Spherical(200, THREE.MathUtils.degToRad(45), 0));
    const domeRef = React.useRef<THREE.Mesh>();
    const faceRotationStepRef = React.useRef(0);
    const electricSparksRef = React.useRef<THREE.Line[]>([]);
    const tilePlaneRef = React.useRef<THREE.Mesh>();
    const jumpCooldownRef = React.useRef(0);
    const gltfLoaderRef = React.useRef<GLTFLoader>();
    const forestGroundRef = React.useRef<THREE.Mesh>();
    const isSector4LoadedRef = React.useRef(false);


    return {
        mountRef,
        gameTimeRef,
        playerRef,
        velocityRef,
        inputRef,
        wasOffTrackRef,
        penaltyCheckCooldownRef,
        animationFrameIdRef,
        obstacleCarsRef,
        tireMarksRef,
        fountainWaterJetRef,
        walkingNpcsRef,
        staticCollidersRef,
        walkableSurfacesRef,
        rampMeshRef,
        rampWallsRef,
        collegeRampMeshRef,
        universityRamp,
        controlModeRef,
        isTransformingRef,
        transformProgressRef,
        cameraOffsetRef,
        audioListenerRef,
        engineSoundRef,
        skidSoundRef,
        audioInitializedRef,
        engineOscillatorRef,
        gearRef,
        expressionTimerRef,
        emojiFaceRef,
        faceTargetPositionRef,
        currentFacePositionRef,
        domeRef,
        faceRotationStepRef,
        electricSparksRef,
        tilePlaneRef,
        jumpCooldownRef,
        gltfLoaderRef,
        forestGroundRef,
        isSector4LoadedRef,
    };
}
