
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

  const bladeThickness = size * 0.2; // Make it much thinner
  const curveFactor = -size * 0.4; // How much the tip curves inward

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

  // Create the clean, tapered undercut for the back
  const hairCapGeom = new THREE.SphereGeometry(
    headRadius, 
    32, 
    16,
    0, // phiStart
    Math.PI * 2, // phiLength
    0, // thetaStart
    Math.PI / 1.5 // thetaLength - not a full sphere, leaves forehead open
  );
  const hairCap = new THREE.Mesh(hairCapGeom, hairMaterial);
  hairCap.scale.set(1.06, 1.05, 1.06); // Make it fit the head shape
  hairCap.rotation.x = Math.PI / 8; // Tilt it forward slightly
  hairCap.position.y += 0.1;
  hairGroup.add(hairCap);

  // Voluminous, messy top
  const topClumpCount = 120; // Increased density
  for (let i = 0; i < topClumpCount; i++) {
    const size = random() * 0.2 + 0.25; // Slightly larger base
    const length = random() * 0.35 + 0.4;
    const clumpGeo = createHairClump(size, length);
    const clump = new THREE.Mesh(clumpGeo, hairMaterial);

    // Distribute around the top/front of the head
    const phi = random() * (Math.PI / 2.0); // Angle from top (0 to 90 degrees)
    const theta = random() * Math.PI * 2; // Angle around

    clump.position.setFromSphericalCoords(headRadius * 0.9, phi, theta);

    // Point the clump outward with some randomness
    const lookAtPos = clump.position.clone().multiplyScalar(0.8);
    lookAtPos.y += (random() - 0.4) * 0.3; // Add vertical variation, lean forward slightly
    clump.lookAt(lookAtPos);

    hairGroup.add(clump);
  }

  // Long, jagged bangs
  const bangsCount = 25; // Increased density
  for (let i = 0; i < bangsCount; i++) {
    const size = random() * 0.15 + 0.2;
    const length = random() * 0.3 + 0.5; // Longer bangs
    const clumpGeo = createHairClump(size, length);
    const clump = new THREE.Mesh(clumpGeo, hairMaterial);

    const angle = (i / (bangsCount - 1) - 0.5) * (Math.PI / 1.3); // Spread across the front

    // Position them lower on the forehead
    const phi = Math.PI / 1.9;
    clump.position.setFromSphericalCoords(headRadius * 1.05, phi, angle);
    clump.position.y -= 0.15;

    clump.lookAt(0, -0.4, 0.5); // Aim more sharply down and forward
    clump.rotation.z += (random() - 0.5) * 0.3; // Add jaggedness

    hairGroup.add(clump);
  }

  return hairGroup;
}
