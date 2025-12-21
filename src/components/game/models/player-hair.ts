
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
        depth: width * 0.3, // Give clumps some thickness
        bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const clump = new THREE.Mesh(geometry, material);
    clump.geometry.center(); // Center the geometry for easier rotation
    return clump;
}

export function createHair(headRadius: number, hairMaterial: THREE.Material) {
    const hairGroup = new THREE.Group();

    // --- Base Hair Cap for coverage ---
    const capGeom = new THREE.SphereGeometry(headRadius * 1.01, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.5);
    const hairCap = new THREE.Mesh(capGeom, hairMaterial);
    hairCap.position.y = -0.1;
    hairCap.rotation.x = 0.1; // Tilt slightly forward
    hairGroup.add(hairCap);

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

    // --- Back Layer ---
    for (let i = 0; i < 15; i++) {
        clumps.push({
            length: Math.random() * 0.5 + 0.6,
            width: 0.25,
            radius: headRadius * 1.0,
            phi: Math.PI / 2 + Math.random() * 0.4,
            theta: Math.PI * 0.7 + Math.random() * Math.PI * 0.6,
            rotX: -0.5 - Math.random() * 0.3, rotY: 0, rotZ: (Math.random() - 0.5) * 0.2
        });
    }

    // --- Side Layers (swept back) ---
     for (let i = 0; i < 10; i++) {
        // Left Side
        clumps.push({
            length: Math.random() * 0.4 + 0.8,
            width: 0.3,
            radius: headRadius * 1.0,
            phi: Math.PI / 2 - 0.1 + Math.random() * 0.2,
            theta: Math.PI * 0.5 + Math.random() * 0.5,
            rotX: -0.3, rotY: 0, rotZ: -0.8 - Math.random() * 0.3
        });
        // Right Side
        clumps.push({
            length: Math.random() * 0.4 + 0.8,
            width: 0.3,
            radius: headRadius * 1.0,
            phi: Math.PI / 2 - 0.1 + Math.random() * 0.2,
            theta: -Math.PI * 0.5 - Math.random() * 0.5,
            rotX: -0.3, rotY: 0, rotZ: 0.8 + Math.random() * 0.3
        });
    }

    // --- Top Messy Layer ---
    for (let i = 0; i < 20; i++) {
        clumps.push({
            length: Math.random() * 0.4 + 0.9,
            width: 0.4,
            radius: headRadius * (0.3 + Math.random() * 0.7),
            phi: Math.PI / 4 + Math.random() * 0.3,
            theta: (Math.random() - 0.5) * Math.PI * 1.8,
            rotX: -0.9 + (Math.random() - 0.5) * 0.4, rotY: 0, rotZ: (Math.random() - 0.5) * 0.8
        });
    }

    // --- Bangs Layer ---
    for (let i = 0; i < 12; i++) {
        const theta = Math.PI * 1.8 - (i / 11) * 1.6; // Angle for bangs
        clumps.push({
            length: Math.random() * 0.3 + 0.8,
            width: 0.3,
            radius: headRadius * 1.0,
            phi: Math.PI / 2 - 0.35,
            theta: theta,
            rotX: -0.8, rotY: 0, rotZ: 0.3 + Math.random() * 0.3
        });
    }

    // --- Create and position all clumps ---
    clumps.forEach(c => {
        const clump = createHairClump(c.length, c.width, hairMaterial);
        clump.position.setFromSphericalCoords(c.radius, c.phi, c.theta);
        clump.lookAt(0, 0, 0);

        clump.rotation.x += c.rotX;
        clump.rotation.y += c.rotY;
        clump.rotation.z += c.rotZ;

        hairGroup.add(clump);
    });

    hairGroup.rotation.y = Math.PI; // Orient hair correctly on head

    return hairGroup;
}
