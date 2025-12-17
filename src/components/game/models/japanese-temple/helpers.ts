
import * as THREE from 'three';

// Helper to create detailed Dougong (bracket sets)
export function createDougong(size: number, redMaterial: THREE.Material, goldMaterial: THREE.Material) {
    const dougong = new THREE.Group();

    const goldPlate = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.7, size * 0.7, 0.5, 32), goldMaterial);
    goldPlate.rotation.x = Math.PI / 2;
    goldPlate.position.z = 1; // Position it behind the bracket
    dougong.add(goldPlate);

    const mainArm = new THREE.Mesh(new THREE.BoxGeometry(size, size*0.4, size*0.4), redMaterial);
    dougong.add(mainArm);

    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(size*0.4, size*0.4, size), redMaterial);
    dougong.add(crossArm);

    // First layer block
    const block1 = new THREE.Mesh(new THREE.BoxGeometry(size*0.5, size*0.4, size*0.5), redMaterial);
    block1.position.y = size * 0.4;
    dougong.add(block1);

    // Second layer arms
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(size * 1.2, size * 0.35, size * 0.35), redMaterial);
    arm2.position.y = size * 0.7;
    dougong.add(arm2);
    
    const arm3 = new THREE.Mesh(new THREE.BoxGeometry(size * 0.35, size * 0.35, size * 1.2), redMaterial);
    arm3.position.y = size * 0.7;
    dougong.add(arm3);
    
    // Top block
    const block2 = new THREE.Mesh(new THREE.BoxGeometry(size*0.6, size*0.3, size*0.6), redMaterial);
    block2.position.y = size * 0.9;
    dougong.add(block2);
    
    return dougong;
}

export function createGreenRailing(width: number, height: number, material: THREE.Material) {
    const railing = new THREE.Group();
    const frameThickness = 1;

    // Create frame
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(width, frameThickness, 1), material);
    topFrame.position.y = height / 2 - frameThickness / 2;
    railing.add(topFrame);

    const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(width, frameThickness, 1), material);
    bottomFrame.position.y = -height / 2 + frameThickness / 2;
    railing.add(bottomFrame);

    // Create dense vertical bars
    const numBarsV = 20; // Increased for density
    const barGeom = new THREE.BoxGeometry(0.5, height, 0.5);
    for (let i = 0; i < numBarsV; i++) {
        const vBar = new THREE.Mesh(barGeom, material);
        vBar.position.x = -width / 2 + (i + 0.5) * (width / numBarsV);
        railing.add(vBar);
    }

    return railing;
}

// Helper to create the orange railing
export function createOrangeRailing(width: number, height: number, material: THREE.Material) {
    const railing = new THREE.Group();
    const postHeight = height;
    const numPosts = 15;

    const baseRailGeom = new THREE.BoxGeometry(width, 1.5, 2);
    const baseRail = new THREE.Mesh(baseRailGeom, material);
    baseRail.position.y = 0.75;
    railing.add(baseRail);

    const postGeom = new THREE.CylinderGeometry(0.5, 0.5, postHeight, 8);
    for (let i = 0; i < numPosts; i++) {
        const post = new THREE.Mesh(postGeom, material);
        post.position.set(-width / 2 + (i * (width / (numPosts - 1))), postHeight / 2 + 1.5, 0);
        railing.add(post);
    }

    const topRailGeom = new THREE.BoxGeometry(width, 1.5, 2);
    const topRail = new THREE.Mesh(topRailGeom, material);
    topRail.position.y = postHeight + 1.5;
    railing.add(topRail);
    
    return railing;
}

export function createLatticePanel(width: number, height: number, redMaterial: THREE.Material, whiteMaterial: THREE.Material) {
    const panel = new THREE.Group();
    const frameThickness = 1.5;

    // Frame
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(width, frameThickness, 2), redMaterial);
    topFrame.position.y = height / 2 - frameThickness / 2;
    panel.add(topFrame);
    const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(width, frameThickness, 2), redMaterial);
    bottomFrame.position.y = -height / 2 + frameThickness / 2;
    panel.add(bottomFrame);
    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, height, 2), redMaterial);
    leftFrame.position.x = -width / 2 + frameThickness / 2;
    panel.add(leftFrame);
    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, height, 2), redMaterial);
    rightFrame.position.x = width / 2 - frameThickness / 2;
    panel.add(rightFrame);

    // Lattice
    const latticeGeom = new THREE.BoxGeometry(width - frameThickness * 2, height - frameThickness * 2, 1);
    const lattice = new THREE.Mesh(latticeGeom, whiteMaterial);
    panel.add(lattice);
    
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(width - frameThickness * 2, 0.5, 1.2), redMaterial);
    panel.add(hBar);
    
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.5, height - frameThickness * 2, 1.2), redMaterial);
    panel.add(vBar);

    return panel;
}
