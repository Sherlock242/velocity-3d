
import * as THREE from 'three';

// Helper to create the white decorative flags (noren)
export function createNorenCurtain() {
    const norenGroup = new THREE.Group();
    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
    const redMaterial = new THREE.MeshStandardMaterial({ color: 0xdc4405, side: THREE.DoubleSide });

    const totalWidth = 36;
    const panelWidth = 11;
    const panelHeight = 20;
    const numPanels = 3;
    const panelSpacing = 1.5;
    const redLineWidth = 0.2;
    const redLineInset = 0.5;

    const fullWidthWithSpacing = totalWidth + (numPanels - 1) * panelSpacing;

    for (let i = 0; i < numPanels; i++) {
        const panelGroup = new THREE.Group();
        const xPos = -fullWidthWithSpacing / 2 + panelWidth / 2 + i * (panelWidth + panelSpacing);
        panelGroup.position.x = xPos;

        // Main white panel
        const panelGeom = new THREE.PlaneGeometry(panelWidth, panelHeight);
        const panel = new THREE.Mesh(panelGeom, whiteMaterial);
        panelGroup.add(panel);

        // Black circle emblem
        const circleRadius = 2.5;
        const circleGeom = new THREE.CircleGeometry(circleRadius, 32);
        const circle = new THREE.Mesh(circleGeom, blackMaterial);
        circle.position.z = 0.1; // Position slightly in front to avoid z-fighting
        panelGroup.add(circle);
        
        // Left red vertical line
        const leftRedLineGeom = new THREE.BoxGeometry(redLineWidth, panelHeight, 0.1);
        const leftRedLine = new THREE.Mesh(leftRedLineGeom, redMaterial);
        leftRedLine.position.x = -panelWidth / 2 + redLineInset + redLineWidth / 2; // Inset from the edge
        leftRedLine.position.z = 0.05;
        panelGroup.add(leftRedLine);

        // Right red vertical line
        const rightRedLineGeom = new THREE.BoxGeometry(redLineWidth, panelHeight, 0.1);
        const rightRedLine = new THREE.Mesh(rightRedLineGeom, redMaterial);
        rightRedLine.position.x = panelWidth / 2 - redLineInset - redLineWidth / 2; // Inset from the edge
        rightRedLine.position.z = 0.05;
        panelGroup.add(rightRedLine);

        norenGroup.add(panelGroup);
    }


    return norenGroup;
}
