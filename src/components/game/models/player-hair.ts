
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
    
    // Layers defined from bottom to top
    const layers = [
        // Sides and Back - shorter and flatter
        { count: 60, length: 0.6, width: 0.15, radialOffset: 0.0, yRange: [-0.5, 0.2], zRange: [-1.0, 0.2] },
        // Main volume layer
        { count: 50, length: 1.0, width: 0.2, radialOffset: 0.1, yRange: [-0.2, 0.6], zRange: [-0.8, 1.0] },
        // Top messy layer - Reduced length and width
        { count: 40, length: 0.8, width: 0.18, radialOffset: 0.2, yRange: [0.3, 1.0], zRange: [-0.5, 1.0] },
    ];

    layers.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
            const length = layer.length * (1 + (Math.random() - 0.5) * 0.2);
            const width = layer.width * (1 + (Math.random() - 0.5) * 0.2);
            const clump = createHairClump(length, width, hairMaterial);

            // Position on a sphere
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(headRadius + layer.radialOffset);
            
            // Constrain to Y and Z ranges to shape the hair
            pos.y = THREE.MathUtils.clamp(pos.y, layer.yRange[0], layer.yRange[1]);
            pos.z = THREE.MathUtils.clamp(pos.z, layer.zRange[0], layer.zRange[1]);
            
            clump.position.copy(pos);

            // Orient the clump to flow away from the origin
            const direction = clump.position.clone().normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            clump.quaternion.copy(quaternion);

            // Add extra downward rotation for gravity and styling
            let rotX = Math.PI * 0.8; 
            rotX += (Math.random() - 0.5) * 0.3; // Randomize flow

            clump.rotateX(rotX);
            
            hairGroup.add(clump);
        }
    });


    hairGroup.rotation.y = Math.PI; // Orient hair correctly on head

    return hairGroup;
}
