
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
    
    const creamMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFDD0, roughness: 0.8 });

    // Plain oval back section
    const backHairGeom = new THREE.SphereGeometry(headRadius * 1.05, 32, 16, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55);
    const backHair = new THREE.Mesh(backHairGeom, creamMaterial);
    backHair.scale.z = 0.7; // make it more oval
    backHair.position.y = -0.1;
    backHair.position.z = -0.1;
    hairGroup.add(backHair);


    const layers = [
        // Base layer for volume
        { count: 50, length: 1.8, width: 0.4, radialOffset: 0, verticalOffset: 0, random: 0.2 },
        // Main voluminous layer
        { count: 40, length: 2.2, width: 0.5, radialOffset: 0.1, verticalOffset: -0.1, random: 0.3 },
        // Top messy layer
        { count: 30, length: 2.5, width: 0.6, radialOffset: 0.2, verticalOffset: -0.2, random: 0.4 },
        // Bangs layer
        { count: 20, length: 2.0, width: 0.4, radialOffset: 0.1, verticalOffset: -0.2, random: 0.2, bangs: true },
    ];

    layers.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
            const length = layer.length * (1 + (Math.random() - 0.5) * layer.random);
            const width = layer.width * (1 + (Math.random() - 0.5) * layer.random);
            const clump = createHairClump(length, width, hairMaterial);

            // Restrict placement to front, top, and sides
            const phi = (Math.random() * 0.45 + 0.1) * Math.PI; // Upper hemisphere, avoiding the very top and back
            let theta = Math.random() * Math.PI * 1.4 - (Math.PI * 0.2); // Longitude (front and sides)

            const isRightSide = Math.random() > 0.4; // create a part

            if (isRightSide) {
                // Character's right side (viewer's left), shorter hair, swept back
                theta = Math.random() * Math.PI * 0.4 - (Math.PI * 0.2); // Less angle range
            } else {
                // Character's left side (viewer's right), longer hair, falls forward
                theta = Math.random() * Math.PI * 1.0 + (Math.PI * 0.1);
            }


            clump.position.setFromSphericalCoords(headRadius + layer.radialOffset, phi, theta);
            clump.position.y += layer.verticalOffset;
            
            const isBack = clump.position.z < -headRadius * 0.5;
            if(isBack) continue;

            // Orient the clump to flow away from the crown
            const direction = clump.position.clone().normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            clump.quaternion.copy(quaternion);

            // Add extra downward rotation for gravity and styling
            let rotX = Math.PI * 0.4; // Base downward rotation
            rotX += (Math.random() - 0.5) * 0.4;

            // Make the front bangs hang down more
            const isFront = clump.position.z > headRadius * 0.6 && Math.abs(clump.position.x) < headRadius * 0.8 && !isRightSide;
            if (layer.bangs || isFront) {
                rotX += Math.PI * 0.25; // Extra downward rotation for bangs
            }
            
            clump.rotateX(rotX);
            
            hairGroup.add(clump);
        }
    });


    hairGroup.rotation.y = Math.PI; // Orient hair correctly on head

    return hairGroup;
}
