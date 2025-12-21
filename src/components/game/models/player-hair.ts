
import * as THREE from 'three';

// Helper function to create a single hair clump
function createHairClump(length: number, width: number, material: THREE.Material) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    // Create a gentle curve for the hair clump
    shape.bezierCurveTo(width / 4, length * 0.5, width / 4, length, 0, length);
    shape.bezierCurveTo(-width / 4, length, -width / 4, length * 0.5, 0, 0);

    const extrudeSettings = {
        steps: 1,
        depth: width * 0.2, // Give clumps some thickness
        bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const clump = new THREE.Mesh(geometry, material);
    clump.geometry.center(); // Center the geometry for easier rotation
    return clump;
}

export function createHair(headRadius: number, hairMaterial: THREE.Material) {
    const hairGroup = new THREE.Group();

    // Define a "crown" point from which hair flows
    const crownPoint = new THREE.Vector3(0, headRadius * 1.2, 0);

    const numLayers = 5;
    const numClumpsPerLayer = 120;

    for (let layer = 0; layer < numLayers; layer++) {
        for (let i = 0; i < numClumpsPerLayer; i++) {
            const progress = i / numClumpsPerLayer;
            
            const length = 1.0 + Math.random() * 0.4 - layer * 0.1;
            const width = 0.2 + Math.random() * 0.1 - layer * 0.02;

            const clump = createHairClump(length, width, hairMaterial);

            // Position clumps in rings flowing from the top
            const phi = (progress * 0.6 + 0.1 + layer * 0.05) * Math.PI; // Latitude
            
            let theta = (i % (10 + layer * 5)) * (Math.PI * 2) / (10 + layer * 5) + (layer * 0.1); // Longitude

            clump.position.setFromSphericalCoords(headRadius + layer * 0.05, phi, theta);
            
            // Part the hair: create a gap at the front
            const isFront = clump.position.z > 0 && Math.abs(clump.position.x) < headRadius * 0.5;
            if (isFront && phi > Math.PI * 0.5) { // Only part the hair that would fall over the face
                continue; // Skip creating clumps in the very front
            }

            // Orient the clump to flow away from the crown
            const direction = clump.position.clone().sub(crownPoint).normalize();
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            clump.quaternion.copy(quaternion);

            // Add extra downward rotation for gravity effect
            let rotX = Math.PI * 0.4 * (1 - progress); 
            
            // Make the bangs hang down more
            if (isFront) {
                rotX += Math.PI * 0.3;
            }
            clump.rotateX(rotX);
            
            hairGroup.add(clump);
        }
    }

    hairGroup.rotation.y = Math.PI; // Orient hair correctly on head

    return hairGroup;
}
