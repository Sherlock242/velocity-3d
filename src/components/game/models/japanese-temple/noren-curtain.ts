
import * as THREE from 'three';

// Helper to create the white decorative flags (noren)
export function createNorenCurtain() {
    const curtainGroup = new THREE.Group();
    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });

    const curtainWidth = 12;
    const curtainHeight = 15;

    // Main white part
    const mainCurtainGeom = new THREE.PlaneGeometry(curtainWidth, curtainHeight);
    const mainCurtain = new THREE.Mesh(mainCurtainGeom, whiteMaterial);
    curtainGroup.add(mainCurtain);

    // Top black stripe
    const stripeHeight = 3;
    const stripeGeom = new THREE.PlaneGeometry(curtainWidth, stripeHeight);
    const stripe = new THREE.Mesh(stripeGeom, blackMaterial);
    stripe.position.y = curtainHeight / 2 - stripeHeight / 2;
    stripe.position.z = 0.01;
    curtainGroup.add(stripe);

    // Central black circle emblem
    const circleRadius = 2.0;
    const circleGeom = new THREE.CircleGeometry(circleRadius, 32);
    const circle = new THREE.Mesh(circleGeom, blackMaterial);
    circle.position.z = 0.1; // Position slightly in front to avoid z-fighting
    curtainGroup.add(circle);

    return curtainGroup;
}
