
import * as THREE from 'three';

// Helper to create the white decorative flags (noren)
export function createNorenCurtain() {
    const norenGroup = new THREE.Group();
    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });

    const totalWidth = 36;
    const panelWidth = 12;
    const panelHeight = 15;
    const numPanels = 3;
    const panelSpacing = 0; // No space between panels

    // Top black connecting bar
    const barHeight = 2.5;
    const barGeom = new THREE.BoxGeometry(totalWidth, barHeight, 0.2);
    const bar = new THREE.Mesh(barGeom, blackMaterial);
    bar.position.y = panelHeight / 2 - barHeight / 2;
    bar.position.z = 0.1;
    norenGroup.add(bar);

    for (let i = 0; i < numPanels; i++) {
        const panelGroup = new THREE.Group();
        const xPos = -totalWidth / 2 + panelWidth / 2 + i * (panelWidth + panelSpacing);
        
        // Main white panel
        const panelGeom = new THREE.PlaneGeometry(panelWidth, panelHeight);
        const panel = new THREE.Mesh(panelGeom, whiteMaterial);
        panelGroup.add(panel);

        // Black circle emblem
        const circleRadius = 2.0;
        const circleGeom = new THREE.CircleGeometry(circleRadius, 32);
        const circle = new THREE.Mesh(circleGeom, blackMaterial);
        circle.position.z = 0.1; // Position slightly in front to avoid z-fighting
        panelGroup.add(circle);
        
        panelGroup.position.x = xPos;
        norenGroup.add(panelGroup);
    }


    return norenGroup;
}
