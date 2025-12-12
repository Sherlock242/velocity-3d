
import * as THREE from 'three';
import type { GameState, EmojiFace } from '../core/state';

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

export function updateEmoji(gameState: GameState, delta: number) {
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
