import * as React from 'react';
import * as THREE from 'three';

export type ControlMode = 'car' | 'person';

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
    }>;
    wasOffTrackRef: React.MutableRefObject<boolean>;
    penaltyCheckCooldownRef: React.MutableRefObject<boolean>;
    animationFrameIdRef: React.MutableRefObject<number | undefined>;
    obstacleCarsRef: React.MutableRefObject<THREE.Group[]>;
    tireMarksRef: React.MutableRefObject<{ mesh: THREE.Mesh; createdAt: number }[]>;
    fountainWaterJetRef: React.MutableRefObject<THREE.Mesh | undefined>;
    walkingNpcsRef: React.MutableRefObject<THREE.Group[]>;
    staticCollidersRef: React.MutableRefObject<THREE.Group[]>;
    rampMeshRef: React.MutableRefObject<THREE.Mesh | undefined>;
    rampWallsRef: React.MutableRefObject<THREE.Group | undefined>;
    collegeRampMeshRef: React.MutableRefObject<THREE.Mesh | undefined>;
    controlModeRef: React.MutableRefObject<ControlMode>;
    isTransformingRef: React.MutableRefObject<boolean>;
    transformProgressRef: React.MutableRefObject<number>;
    cameraOffsetRef: React.MutableRefObject<THREE.Vector3>;
    audioListenerRef: React.MutableRefObject<THREE.AudioListener | undefined>;
    engineSoundRef: React.MutableRefObject<THREE.Audio | undefined>;
    skidSoundRef: React.MutableRefObject<THREE.Audio | undefined>;
    audioInitializedRef: React.MutableRefObject<boolean>;
    engineOscillatorRef: React.MutableRefObject<OscillatorNode | undefined>;
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
    });
    const wasOffTrackRef = React.useRef(false);
    const penaltyCheckCooldownRef = React.useRef(false);
    const animationFrameIdRef = React.useRef<number>();
    const obstacleCarsRef = React.useRef<THREE.Group[]>([]);
    const tireMarksRef = React.useRef<{ mesh: THREE.Mesh; createdAt: number }[]>([]);
    const fountainWaterJetRef = React.useRef<THREE.Mesh>();
    const walkingNpcsRef = React.useRef<THREE.Group[]>([]);
    const staticCollidersRef = React.useRef<THREE.Group[]>([]);
    const rampMeshRef = React.useRef<THREE.Mesh>();
    const rampWallsRef = React.useRef<THREE.Group>();
    const collegeRampMeshRef = React.useRef<THREE.Mesh>();
    const controlModeRef = React.useRef<ControlMode>('car');
    const isTransformingRef = React.useRef(false);
    const transformProgressRef = React.useRef(0);
    const cameraOffsetRef = React.useRef(new THREE.Vector3(0, 2, -6));
    const audioListenerRef = React.useRef<THREE.AudioListener>();
    const engineSoundRef = React.useRef<THREE.Audio>();
    const skidSoundRef = React.useRef<THREE.Audio>();
    const audioInitializedRef = React.useRef(false);
    const engineOscillatorRef = React.useRef<OscillatorNode>();

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
        rampMeshRef,
        rampWallsRef,
        collegeRampMeshRef,
        controlModeRef,
        isTransformingRef,
        transformProgressRef,
        cameraOffsetRef,
        audioListenerRef,
        engineSoundRef,
        skidSoundRef,
        audioInitializedRef,
        engineOscillatorRef,
    };
}
