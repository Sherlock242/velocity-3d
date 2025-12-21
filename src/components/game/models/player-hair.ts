
import * as THREE from 'three';

// Helper function to create a single hair clump
function createHairClump(length: number, width: number, material: THREE.Material) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(width / 3, length * 0.4, width / 4, length * 0.8, 0, length);
    shape.bezierCurveTo(-width / 4, length * 0.8, -width / 3, length * 0.4, 0, 0);

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

    const clumps: {
      length: number;
      width: number;
      radius: number;
      phi: number;
      theta: number;
      rotX: number;
      rotY: number;
      rotZ: number;
    }[] = [];

    // --- Spiky Layer ---
    for (let i = 0; i < 250; i++) { // Increased count for full coverage
        clumps.push({
            length: Math.random() * 0.4 + 0.5, // Randomized spike length
            width: 0.15,
            radius: headRadius * (0.8 + Math.random() * 0.2), // Place spikes over the surface
            phi: Math.random() * (Math.PI / 2), // Top hemisphere
            theta: Math.random() * Math.PI * 2, // All around the head
            rotX: -1.0 + (Math.random() - 0.5) * 0.8, // Varying upward angle
            rotY: (Math.random() - 0.5) * 0.5,
            rotZ: (Math.random() - 0.5) * 1.5, // Varying side tilt
        });
    }

    // --- Create and position all clumps ---
    clumps.forEach(c => {
        const clump = createHairClump(c.length, c.width, hairMaterial);
        clump.position.setFromSphericalCoords(c.radius, c.phi, c.theta);
        
        // Orient clump to point away from the center
        const lookAtTarget = clump.position.clone().multiplyScalar(0.5);
        clump.lookAt(lookAtTarget);

        // Apply additional rotations for styling
        clump.rotation.x += c.rotX;
        clump.rotation.y += c.rotY;
        clump.rotation.z += c.rotZ;

        hairGroup.add(clump);
    });

    hairGroup.rotation.y = Math.PI; // Orient hair correctly on head

    return hairGroup;
}
