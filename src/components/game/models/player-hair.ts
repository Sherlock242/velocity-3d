
import * as THREE from 'three';

// Helper function to create a single "chunky" hair clump
function createHairClump(length: number, width: number, material: THREE.Material) {
    const shape = new THREE.Shape();
    // A more stylized, tapered clump
    shape.moveTo(-width / 2, 0);
    shape.quadraticCurveTo(0, length, width / 2, 0);
    shape.quadraticCurveTo(0, -length * 0.2, -width / 2, 0);

    const extrudeSettings = {
        steps: 1,
        depth: width * 0.6,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 1,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const clump = new THREE.Mesh(geometry, material);
    clump.geometry.center();
    return clump;
}

export function createHair(headRadius: number, hairMaterial: THREE.Material) {
    const hairGroup = new THREE.Group();
    
    // Layers are defined to control hair placement, size, and flow
    const layers = [
        // Merged and expanded base layer for full, random coverage on sides and back
        { count: 1800, length: 0.2, width: 0.1, yRange: [-0.6, 0.3], zRange: [-1.0, 0.2], xRange: [-1.0, 1.0], rotX: 1.0 },
        // Main volume on top and upper back
        { count: 150, length: 0.35, width: 0.15, yRange: [0.1, 0.8], zRange: [-0.8, 0.6], xRange: [-1.0, 1.0], rotX: 1.2 },
    ];

    layers.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
            const length = layer.length * (1 + (Math.random() - 0.5) * 0.3);
            const width = layer.width * (1 + (Math.random() - 0.5) * 0.3);
            const clump = createHairClump(length, width, hairMaterial);

            // Position on a sphere
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(headRadius);
            
            // Constrain to Y, Z, and X ranges to shape the hair
            pos.y = THREE.MathUtils.clamp(pos.y, layer.yRange[0], layer.yRange[1]);
            pos.z = THREE.MathUtils.clamp(pos.z, layer.zRange[0], layer.zRange[1]);
            pos.x = THREE.MathUtils.clamp(pos.x, layer.xRange[0], layer.xRange[1]);

            clump.position.copy(pos);

            // Orient the clump to flow away from the origin
            const direction = clump.position.clone().normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), direction);
            clump.quaternion.copy(quaternion);

            // Add extra downward rotation for gravity and styling
            let rotX = layer.rotX * Math.PI; 
            rotX += (Math.random() - 0.5) * 0.4; // Randomize flow
            
            clump.rotateX(rotX);
            
            hairGroup.add(clump);
        }
    });


    hairGroup.rotation.y = Math.PI; // Orient hair correctly on head

    return hairGroup;
}
