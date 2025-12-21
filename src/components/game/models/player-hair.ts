
import * as THREE from 'three';

// Helper function to create a single hair clump
function createHairClump(length: number, width: number, material: THREE.Material) {
    const shape = new THREE.Shape();
    // A more blade-like, tapered shape
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

    // --- Base Layer for Coverage ---
    for (let i = 0; i < 150; i++) {
        const phi = Math.PI / 2 - 0.2 + (Math.random() * 1.0);
        const isBack = phi > 1.8;
        clumps.push({
            length: isBack ? 0.3 : 0.5,
            width: 0.2,
            radius: headRadius * 0.98,
            phi: phi,
            theta: Math.random() * Math.PI * 2,
            rotX: -0.6,
            rotY: 0,
            rotZ: (Math.random() - 0.5) * 0.4
        });
    }

    // --- Mid Layer for Volume ---
    for (let i = 0; i < 100; i++) {
        clumps.push({
            length: Math.random() * 0.2 + 0.6,
            width: 0.18,
            radius: headRadius * 1.0,
            phi: Math.PI / 2 + (Math.random() - 0.5) * 1.2,
            theta: Math.random() * Math.PI * 2,
            rotX: -0.7, rotY: 0, rotZ: (Math.random() - 0.5) * 0.5
        });
    }

    // --- Top Messy Spikes ---
    for (let i = 0; i < 50; i++) {
        clumps.push({
            length: Math.random() * 0.3 + 0.7,
            width: 0.2,
            radius: headRadius * (0.4 + Math.random() * 0.6),
            phi: Math.PI / 4 + Math.random() * 0.4,
            theta: (Math.random() - 0.5) * Math.PI * 2,
            rotX: -1.0 + (Math.random() - 0.5) * 0.5,
            rotY: (Math.random() - 0.5) * 0.3,
            rotZ: (Math.random() - 0.5) * 1.0
        });
    }
    
    // --- Sideburns and Side Hair ---
    for (let i = 0; i < 10; i++) {
        // Left Side
        clumps.push({
            length: 0.6, width: 0.12, radius: headRadius * 1.0,
            phi: Math.PI / 2 + 0.3, theta: Math.PI * 0.6 + (Math.random() - 0.5) * 0.2,
            rotX: -0.3, rotY: 0.2, rotZ: -0.8
        });
        // Right Side
        clumps.push({
            length: 0.6, width: 0.12, radius: headRadius * 1.0,
            phi: Math.PI / 2 + 0.3, theta: -Math.PI * 0.6 + (Math.random() - 0.5) * 0.2,
            rotX: -0.3, rotY: -0.2, rotZ: 0.8
        });
    }


    // --- Bangs Layer (more defined) ---
    // Right side of part (longer)
    for (let i = 0; i < 8; i++) {
        clumps.push({
            length: 0.8, width: 0.15, radius: headRadius,
            phi: Math.PI / 2 - 0.45, theta: Math.PI * 1.6 - i * 0.12,
            rotX: -0.2, rotY: 0.1, rotZ: 0.6
        });
    }
    // Left side of part (shorter)
    for (let i = 0; i < 5; i++) {
        clumps.push({
            length: 0.7, width: 0.14, radius: headRadius,
            phi: Math.PI / 2 - 0.45, theta: Math.PI * 1.7 + i * 0.1,
            rotX: -0.1, rotY: -0.1, rotZ: -0.5
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
