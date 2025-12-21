
import * as THREE from 'three';

// Helper function to create a single "chunky" hair clump
function createHairClump(length: number, width: number, material: THREE.Material) {
    const shape = new THREE.Shape();
    // A more tapered, sharp shape
    shape.moveTo(-width / 2, 0);
    shape.quadraticCurveTo(0, length * 0.8, width / 2, 0);
    shape.lineTo(width * 0.4, -length * 0.1);
    shape.quadraticCurveTo(0, length * 0.7, -width * 0.4, -length * 0.1);
    shape.closePath();

    const extrudeSettings = {
        steps: 1,
        depth: width * 0.5,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 1,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const clump = new THREE.Mesh(geometry, material);
    clump.geometry.center(); // Center the geometry for easier rotation
    return clump;
}

export function createHair(headRadius: number, hairMaterial: THREE.Material) {
    const hairGroup = new THREE.Group();

    // Define a "crown" point from which hair flows
    const crownPoint = new THREE.Vector3(0, headRadius * 1.1, -headRadius * 0.5);

    const layers = [
        // Base layer for volume and to cover scalp
        { count: 80, length: 1.8, width: 0.4, radialOffset: 0, verticalOffset: 0, random: 0.2 },
        // Main voluminous layer
        { count: 60, length: 2.2, width: 0.5, radialOffset: 0.1, verticalOffset: -0.1, random: 0.3 },
        // Top messy layer
        { count: 40, length: 2.5, width: 0.6, radialOffset: 0.2, verticalOffset: -0.2, random: 0.4 },
        // Shorter, plainer sides and back
        { count: 100, length: 1.2, width: 0.3, radialOffset: -0.1, verticalOffset: 0.1, random: 0.1, plain: true },
    ];

    layers.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
            const length = layer.length * (1 + (Math.random() - 0.5) * layer.random);
            const width = layer.width * (1 + (Math.random() - 0.5) * layer.random);
            const clump = createHairClump(length, width, hairMaterial);

            const phi = (Math.random() * 0.6 + 0.1) * Math.PI; // Latitude (upper hemisphere)
            const theta = Math.random() * Math.PI * 2; // Longitude

            clump.position.setFromSphericalCoords(headRadius + layer.radialOffset, phi, theta);
            clump.position.y += layer.verticalOffset;
            
            // This is the character's right side (viewer's left)
            const isRightSide = clump.position.x > 0.1;
            
            // This is the back
            const isBack = clump.position.z < -headRadius * 0.3;

            if (layer.plain) {
                // This layer is only for the plain sides and back
                if (!isRightSide && !isBack) continue;
            } else {
                // Main layers should not be on the plain sides/back
                if (isRightSide || isBack) continue;
            }

            // Orient the clump to flow away from the crown
            const direction = clump.position.clone().sub(crownPoint).normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            clump.quaternion.copy(quaternion);

            // Add extra downward rotation for gravity and styling
            let rotX = Math.PI * 0.4; // Base downward rotation

            // If it's a "plain" side/back clump, make it flatter
            if (layer.plain) {
                rotX += 0.3; // More downward rotation to flatten it
            } else {
                 // Add messy variation to the main hair
                rotX += (Math.random() - 0.5) * 0.4;
            }

            // Make the front bangs hang down more
            const isFront = clump.position.z > headRadius * 0.4 && Math.abs(clump.position.x) < headRadius * 0.7;
            if (isFront) {
                rotX += Math.PI * 0.2; // Extra downward rotation for bangs
            }
            
            clump.rotateX(rotX);
            
            hairGroup.add(clump);
        }
    });


    hairGroup.rotation.y = Math.PI; // Orient hair correctly on head

    return hairGroup;
}
