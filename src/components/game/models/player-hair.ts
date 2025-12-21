
import * as THREE from 'three';

// Helper function to create a single hair clump
function createHairClump(length: number, width: number, material: THREE.Material) {
    const shape = new THREE.Shape();
    // A more blade-like, tapered shape
    shape.moveTo(0, 0);
    shape.bezierCurveTo(width / 2, length * 0.5, width / 4, length * 0.8, 0, length);
    shape.bezierCurveTo(-width / 4, length * 0.8, -width / 2, length * 0.5, 0, 0);

    const extrudeSettings = {
        steps: 1,
        depth: width * 0.2,
        bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    return new THREE.Mesh(geometry, material);
}

export function createHair(headRadius: number, hairMaterial: THREE.Material) {
    const hairGroup = new THREE.Group();
    hairGroup.rotation.y = Math.PI;

    // Base hair cap for coverage
    const capGeom = new THREE.SphereGeometry(headRadius * 1.01, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
    const hairCap = new THREE.Mesh(capGeom, hairMaterial);
    hairCap.position.y = -0.1;
    hairGroup.add(hairCap);

    const mainClumps = 10;
    const backClumps = 6;
    const sideClumps = 5;
    const bangsClumps = 8;
    
    // --- Back Layer (Undercut) ---
    for (let i = 0; i < backClumps; i++) {
        const clump = createHairClump(0.6, 0.25, hairMaterial);
        // Position these lower and more spread out at the nape
        const angle = Math.PI * 0.85 + (i / (backClumps - 1)) * Math.PI * 0.3;
        
        clump.position.setFromSphericalCoords(headRadius * 0.98, Math.PI / 2 + 0.5, angle);
        clump.lookAt(clump.position.clone().multiplyScalar(1.2));
        clump.rotation.z += (Math.random() - 0.5) * 0.2; // slight random rotation
        clump.rotation.x += -0.7; // point downwards more
        
        hairGroup.add(clump);
    }
    
    // --- Side Layers ---
    for (let i = 0; i < sideClumps; i++) {
        const clump = createHairClump(0.8, 0.3, hairMaterial);
        // Right side
        const angleRight = Math.PI * 1.35 - (i / (sideClumps - 1)) * 0.5;
        clump.position.setFromSphericalCoords(headRadius * 1.0, Math.PI / 2 - 0.1, angleRight);
        clump.lookAt(clump.position.clone().multiplyScalar(1.2));
        clump.rotation.z += 0.3;
        clump.rotation.x -= 0.3;
        hairGroup.add(clump);

        // Left side
        const clumpLeft = createHairClump(0.8, 0.3, hairMaterial);
        const angleLeft = Math.PI * 0.65 + (i / (sideClumps - 1)) * 0.5;
        clumpLeft.position.setFromSphericalCoords(headRadius * 1.0, Math.PI / 2 - 0.1, angleLeft);
        clumpLeft.lookAt(clumpLeft.position.clone().multiplyScalar(1.2));
        clumpLeft.rotation.z -= 0.3;
        clumpLeft.rotation.x -= 0.3;
        hairGroup.add(clumpLeft);
    }

    // --- Top Main Volume (Spikes) ---
    for (let i = 0; i < mainClumps; i++) {
        const clump = createHairClump(1.0, 0.35, hairMaterial);
        
        const angle = (i / (mainClumps-1)) * Math.PI * 1.8 - Math.PI * 0.9;
        const radius = headRadius * (0.4 + Math.random() * 0.5);

        // Position higher up on the head
        clump.position.setFromSphericalCoords(radius, Math.PI / 4.5 + (Math.random() - 0.5) * 0.2, angle);
        
        // Make them point more upwards and outwards
        clump.lookAt(new THREE.Vector3(0, 1.5, 0)); // Point towards a higher point
        clump.rotation.z += (Math.random() - 0.5) * 0.5;
        clump.rotation.x += -0.9 + (Math.random() - 0.5) * 0.3;

        hairGroup.add(clump);
    }

    // --- Bangs ---
    for(let i = 0; i < bangsClumps; i++) {
        const clump = createHairClump(0.9, 0.25, hairMaterial);
        
        // Distribute bangs across the front, concentrated on the character's right
        const angle = Math.PI * 1.7 - (i / (bangsClumps - 1)) * 1.4;
        
        clump.position.setFromSphericalCoords(headRadius * 1.02, Math.PI / 2 - 0.25, angle);
        clump.lookAt(clump.position.clone().multiplyScalar(1.2));
        // Make them sweep to the side and down
        clump.rotation.z += 0.3 + (Math.random() * 0.3); 
        clump.rotation.x -= 0.7;
        hairGroup.add(clump);
    }
    
    // Add one larger sweeping bang for the distinct part
    const bigBang = createHairClump(1.1, 0.4, hairMaterial);
    bigBang.position.setFromSphericalCoords(headRadius * 0.95, Math.PI / 2 - 0.2, Math.PI * 1.75);
    bigBang.lookAt(bigBang.position.clone().multiplyScalar(1.2));
    bigBang.rotation.z += 0.9; // More dramatic sweep
    bigBang.rotation.x -= 0.6;
    hairGroup.add(bigBang);


  return hairGroup;
}
