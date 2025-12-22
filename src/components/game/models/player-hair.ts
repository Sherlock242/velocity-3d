
import * as THREE from 'three';

// Helper function to create a single "chunky" hair clump, now as a cone
function createHairClump(length: number, width: number, material: THREE.Material) {
    const geometry = new THREE.ConeGeometry(width * 0.5, length, 4, 1);
    const clump = new THREE.Mesh(geometry, material);
    clump.geometry.translate(0, length / 2, 0); // Position pivot at the base
    return clump;
}

export function createHair(headRadius: number, hairMaterial: THREE.Material) {
    const hairGroup = new THREE.Group();
    
    // Layers are defined to control hair placement, size, and flow
    const layers = [
        // Base layer for back and lower sides
        { count: 8000, length: 0.2, width: 0.1, yRange: [-0.8, 0.5], zRange: [-1.0, 0.0], xRange: [-0.85, 0.85], rotX: 1.6, seed: 1 },
        // Smaller side layer
        { count: 6000, length: 0.18, width: 0.09, yRange: [-0.2, 0.6], zRange: [-0.2, 0.2], xRange: [-0.9, 0.9], rotX: 1.1, seed: 2 },
        // Main volume on top and upper back
        { count: 10000, length: 0.35, width: 0.15, yRange: [0.1, 0.8], zRange: [-0.8, 0.6], xRange: [-1.0, 1.0], rotX: 1.2, seed: 3 },
    ];

    layers.forEach(layer => {
        let seed = layer.seed;
        const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        for (let i = 0; i < layer.count; i++) {
            const length = layer.length;
            const width = layer.width;
            const clump = createHairClump(length, width, hairMaterial);

            // Position on a sphere
            const pos = new THREE.Vector3(
                (random() - 0.5) * 2,
                (random() - 0.5) * 2,
                (random() - 0.5) * 2
            ).normalize().multiplyScalar(headRadius);
            
            // Constrain to Y, Z, and X ranges to shape the hair
            pos.y = THREE.MathUtils.clamp(pos.y, layer.yRange[0], layer.yRange[1]);
            pos.z = THREE.MathUtils.clamp(pos.z, layer.zRange[0], layer.zRange[1]);
            pos.x = THREE.MathUtils.clamp(pos.x, layer.xRange[0], layer.xRange[1]);

            clump.position.copy(pos);

            // Orient the clump to flow away from the origin
            const direction = clump.position.clone().normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            clump.quaternion.copy(quaternion);

            // Add extra downward rotation for gravity and styling
            let rotX = layer.rotX * Math.PI; 
            rotX += (random() - 0.5) * 0.4; // Randomize flow
            
            clump.rotateX(rotX);
            
            hairGroup.add(clump);
        }
    });


    hairGroup.rotation.y = Math.PI; // Orient hair correctly on head

    return hairGroup;
}


























