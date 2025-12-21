
import * as THREE from 'three';

// Helper function to create a single hair clump
function createHairClump(length: number, width: number, material: THREE.Material) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(width / 2, length * 0.2);
    shape.lineTo(0, length);
    shape.lineTo(-width / 2, length * 0.2);
    shape.closePath();

    const extrudeSettings = {
        steps: 1,
        depth: width * 0.2,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 1,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    return new THREE.Mesh(geometry, material);
}

export function createHair(headRadius: number, hairMaterial: THREE.Material) {
    const hairGroup = new THREE.Group();
    hairGroup.rotation.y = Math.PI;

    // Base hair cap
    const capGeom = new THREE.SphereGeometry(headRadius * 1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
    const hairCap = new THREE.Mesh(capGeom, hairMaterial);
    hairCap.position.y = -0.1;
    hairGroup.add(hairCap);

    const mainClumps = 12;
    const backClumps = 8;
    const sideClumps = 6;
    const bangsClumps = 10;
    
    // --- Back Layer ---
    for (let i = 0; i < backClumps; i++) {
        const clump = createHairClump(0.8, 0.3, hairMaterial);
        const angle = Math.PI * 0.7 + (i / (backClumps - 1)) * Math.PI * 0.6;
        
        clump.position.setFromSphericalCoords(headRadius * 1.0, Math.PI / 2 + 0.2, angle);
        clump.lookAt(clump.position.clone().multiplyScalar(1.2));
        clump.rotation.z += (Math.random() - 0.5) * 0.2;
        clump.rotation.x += -0.5;
        
        hairGroup.add(clump);
    }
    
    // --- Side Layers ---
    for (let i = 0; i < sideClumps; i++) {
        const clump = createHairClump(1.0, 0.35, hairMaterial);
        // Right side
        const angleRight = Math.PI * 1.4 - (i / (sideClumps - 1)) * 0.6;
        clump.position.setFromSphericalCoords(headRadius * 1.02, Math.PI / 2 - 0.1, angleRight);
        clump.lookAt(clump.position.clone().multiplyScalar(1.2));
        clump.rotation.z += 0.3;
        clump.rotation.x -= 0.3;
        hairGroup.add(clump);

        // Left side
        const clumpLeft = createHairClump(1.0, 0.35, hairMaterial);
        const angleLeft = Math.PI * 0.6 + (i / (sideClumps - 1)) * 0.6;
        clumpLeft.position.setFromSphericalCoords(headRadius * 1.02, Math.PI / 2 - 0.1, angleLeft);
        clumpLeft.lookAt(clumpLeft.position.clone().multiplyScalar(1.2));
        clumpLeft.rotation.z -= 0.3;
        clumpLeft.rotation.x -= 0.3;
        hairGroup.add(clumpLeft);
    }

    // --- Top Main Volume ---
    for (let i = 0; i < mainClumps; i++) {
        const clump = createHairClump(1.2, 0.4, hairMaterial);
        
        const angle = (i / (mainClumps-1)) * Math.PI * 1.6 - Math.PI * 0.8;
        const radius = headRadius * (0.5 + Math.random() * 0.5);

        clump.position.setFromSphericalCoords(radius, Math.PI / 4 + (Math.random() - 0.5) * 0.3, angle);
        
        clump.lookAt(new THREE.Vector3(0, 0, 0));
        clump.rotation.z += (Math.random() - 0.5) * 0.5;
        clump.rotation.x += -0.8 + (Math.random() - 0.5) * 0.3;

        hairGroup.add(clump);
    }

    // --- Bangs ---
    for(let i = 0; i < bangsClumps; i++) {
        const clump = createHairClump(1.0, 0.3, hairMaterial);
        
        // Asymmetric part
        const angle = Math.PI * 1.65 - (i / (bangsClumps - 1)) * 1.3;
        
        clump.position.setFromSphericalCoords(headRadius * 1.0, Math.PI / 2 - 0.3, angle);
        clump.lookAt(clump.position.clone().multiplyScalar(1.2));
        clump.rotation.z += 0.2 + (Math.random() * 0.3); // More sideways
        clump.rotation.x -= 0.6; // More downwards
        hairGroup.add(clump);
    }
    
    // Add one larger sweeping bang
    const bigBang = createHairClump(1.3, 0.5, hairMaterial);
    bigBang.position.setFromSphericalCoords(headRadius * 0.9, Math.PI / 2 - 0.1, Math.PI * 1.8);
    bigBang.lookAt(bigBang.position.clone().multiplyScalar(1.2));
    bigBang.rotation.z += 0.8;
    bigBang.rotation.x -= 0.5;
    hairGroup.add(bigBang);


  return hairGroup;
}
