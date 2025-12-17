
import * as THREE from 'three';

export function createPlaque(blackAccent: THREE.Material) {
    const plaqueGroup = new THREE.Group();
    plaqueGroup.position.set(0, 20 / 2, 16);

    const ancientGoldMaterial = new THREE.MeshStandardMaterial({
        color: 0xB08D57, // A duller, more ancient gold
        metalness: 0.6,
        roughness: 0.5,
    });
    
    const plaqueFrameWidth = 10;
    const plaqueFrameHeight = 12;

    // Main frame
    const plaqueFrameGeom = new THREE.BoxGeometry(plaqueFrameWidth, plaqueFrameHeight, 1.5);
    const plaqueFrame = new THREE.Mesh(plaqueFrameGeom, ancientGoldMaterial);
    plaqueGroup.add(plaqueFrame);
    
    // Inner black background
    const plaqueBackGeom = new THREE.BoxGeometry(plaqueFrameWidth * 0.7, plaqueFrameHeight * 0.8, 0.5);
    const plaqueBack = new THREE.Mesh(plaqueBackGeom, blackAccent);
    plaqueBack.position.z = 1.0; // Bring it forward so it's inset
    plaqueGroup.add(plaqueBack);

    // Add decorative frame details to suggest ornateness
    const detailWidth = plaqueFrameWidth + 1;
    const detailHeight = plaqueFrameHeight + 1;

    // Top/Bottom details
    const topDetailGeom = new THREE.BoxGeometry(detailWidth, 1, 1);
    const topDetail = new THREE.Mesh(topDetailGeom, ancientGoldMaterial);
    topDetail.position.y = detailHeight / 2;
    topDetail.position.z = 0.5;
    plaqueGroup.add(topDetail);

    const bottomDetail = new THREE.Mesh(topDetailGeom, ancientGoldMaterial);
    bottomDetail.position.y = -detailHeight / 2;
    bottomDetail.position.z = 0.5;
    plaqueGroup.add(bottomDetail);

    // Side details
    const sideDetailGeom = new THREE.BoxGeometry(1, detailHeight, 1);
    const leftDetail = new THREE.Mesh(sideDetailGeom, ancientGoldMaterial);
    leftDetail.position.x = -detailWidth / 2;
    leftDetail.position.z = 0.5;
    plaqueGroup.add(leftDetail);

    const rightDetail = new THREE.Mesh(sideDetailGeom, ancientGoldMaterial);
    rightDetail.position.x = detailWidth / 2;
    rightDetail.position.z = 0.5;
    plaqueGroup.add(rightDetail);

    // Corner decorative elements
    const cornerGeom = new THREE.TorusGeometry(1, 0.4, 8, 4);
    const cornerPositions = [
        { x: -detailWidth / 2, y: detailHeight / 2 },
        { x: detailWidth / 2, y: detailHeight / 2 },
        { x: -detailWidth / 2, y: -detailHeight / 2 },
        { x: detailWidth / 2, y: -detailHeight / 2 },
    ];
    cornerPositions.forEach(pos => {
        const corner = new THREE.Mesh(cornerGeom, ancientGoldMaterial);
        corner.position.set(pos.x, pos.y, 0.5);
        corner.rotation.z = Math.PI / 4;
        plaqueGroup.add(corner);
    });

    return plaqueGroup;
}
