import * as THREE from 'three';
import type { GameState } from './state';

export function initAudio(gameState: GameState) {
    const { audioListenerRef, audioInitializedRef, engineSoundRef, engineOscillatorRef, skidSoundRef } = gameState;
    if (audioInitializedRef.current) return;
    const listener = audioListenerRef.current;
    if (!listener) return;

    if (listener.context.state === 'suspended') {
        listener.context.resume();
    }
    audioInitializedRef.current = true;

    // Engine sound
    const engineSound = new THREE.Audio(listener);
    const oscillator = listener.context.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 50;
    oscillator.start();
    engineSound.setNodeSource(oscillator);
    engineSound.setVolume(0);
    engineSoundRef.current = engineSound;
    engineOscillatorRef.current = oscillator;

    // Skid sound
    const skidSound = new THREE.Audio(listener);
    const skidNoiseBuffer = listener.context.createBuffer(1, listener.context.sampleRate * 2, listener.context.sampleRate);
    const output = skidNoiseBuffer.getChannelData(0);
    for (let i = 0; i < output.length; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    skidSound.setBuffer(skidNoiseBuffer);
    skidSound.setLoop(true);
    skidSound.setVolume(0);
    skidSound.play();
    skidSoundRef.current = skidSound;
}

export function initAudioOnInteraction(gameState: GameState) {
    const { audioListenerRef, audioInitializedRef } = gameState;
    if (!audioInitializedRef.current && audioListenerRef.current) {
        if (audioListenerRef.current.context.state === 'suspended') {
            audioListenerRef.current.context.resume().then(() => {
                initAudio(gameState);
            });
        } else {
            initAudio(gameState);
        }
    }
}
