
import * as THREE from 'three';

// --- START: Seeded PRNG ---
// A simple pseudo-random number generator to ensure the hair is consistent
let seed = 1;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
// --- END: Seeded PRNG ---

// Helper function for sharp, tapered hair clumps with a curve
function createHairClump(size: number, length: number) {
  const geometry = new THREE.BufferGeometry();

  const bladeThickness = size * 0.2;
  const curveFactor = -size * 0.4;

  const vertices = new Float32Array([
    // Base
    -size / 2,
    0,
    -bladeThickness / 2, // 0
    size / 2,
    0,
    -bladeThickness / 2, // 1
    size / 2,
    0,
    bladeThickness / 2, // 2
    -size / 2,
    0,
    bladeThickness / 2, // 3
    // Tip (curved inward)
    curveFactor,
    -length,
    0, // 4
  ]);

  const indices = [
    // Sides
    0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4,
    // Base
    0, 3, 2, 0, 2, 1,
  ];

  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function createHair(headRadius: number, hairMaterial: THREE.Material) {
  const hairGroup = new THREE.Group();

  const hairCapGeom = new THREE.SphereGeometry(
    headRadius,
    32,
    16,
    0, // phiStart
    Math.PI * 2, // phiLength
    0, // thetaStart
    Math.PI // thetaLength - Extend this to cover more of the back
  );
  const hairCap = new THREE.Mesh(hairCapGeom, hairMaterial);
  hairCap.scale.set(1.06, 1.05, 1.06); // Make it fit the head shape
  hairCap.position.y += 0.1;
  hairGroup.add(hairCap);

  // Voluminous, messy top (now only on front/sides)
  const topClumpCount = 120;
  for (let i = 0; i < topClumpCount; i++) {
    const size = random() * 0.2 + 0.25;
    const length = random() * 0.35 + 0.4;
    const clumpGeo = createHairClump(size, length);
    const clump = new THREE.Mesh(clumpGeo, hairMaterial);

    const phi = random() * (Math.PI / 2.0); // Angle from top (0 to 90 degrees)
    // Restrict theta to front and sides (-90 to 90 degrees, or -PI/2 to PI/2)
    const theta = (random() - 0.5) * Math.PI;

    clump.position.setFromSphericalCoords(headRadius * 0.9, phi, theta);

    const lookAtPos = clump.position.clone().multiplyScalar(0.8);
    lookAtPos.y += (random() - 0.4) * 0.3;
    clump.lookAt(lookAtPos);

    hairGroup.add(clump);
  }

  // Long, jagged bangs
  const bangsCount = 25;
  for (let i = 0; i < bangsCount; i++) {
    const size = random() * 0.15 + 0.2;
    const length = random() * 0.3 + 0.5;
    const clumpGeo = createHairClump(size, length);
    const clump = new THREE.Mesh(clumpGeo, hairMaterial);

    const angle = (i / (bangsCount - 1) - 0.5) * (Math.PI / 1.3);

    const phi = Math.PI / 1.9;
    clump.position.setFromSphericalCoords(headRadius * 1.05, phi, angle);
    clump.position.y -= 0.15;

    clump.lookAt(0, -0.4, 0.5);
    clump.rotation.z += (random() - 0.5) * 0.3;

    hairGroup.add(clump);
  }

  // Nape hair to cover the back and break the spherical shape
  const napeClumpCount = 15;
  for (let i = 0; i < napeClumpCount; i++) {
    const size = random() * 0.18 + 0.22;
    const length = random() * 0.5 + 0.6;
    const clumpGeo = createHairClump(size, length);
    const clump = new THREE.Mesh(clumpGeo, hairMaterial);

    // Position these clumps at the back bottom of the head
    const theta = Math.PI + (random() - 0.5) * (Math.PI / 1.5); // Back of the head
    const phi = Math.PI / 1.6; // Lower down on the sphere

    clump.position.setFromSphericalCoords(headRadius * 0.95, phi, theta);
    clump.position.y -= 0.3;

    // Aim them downwards
    clump.lookAt(clump.position.x, clump.position.y - 1, clump.position.z);
    clump.rotation.z += (random() - 0.5) * 0.2;
    clump.rotation.x += (random() - 0.5) * 0.2;

    hairGroup.add(clump);
  }

  return hairGroup;
}
