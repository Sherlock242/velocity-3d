
import * as THREE from 'three';

export function createPalmTree() {
  const tree = new THREE.Group();

  // Trunk
  const trunkHeight = 60;
  const trunkRadius = 1.5;
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x966F33, roughness: 0.9 });
  const trunkGeom = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 12);
  const trunk = new THREE.Mesh(trunkGeom, trunkMaterial);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  tree.add(trunk);

  // Fronds (Leaves)
  const frondMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, side: THREE.DoubleSide });
  const numFronds = 12;

  for (let i = 0; i < numFronds; i++) {
    const frondGeom = new THREE.PlaneGeometry(25, 4, 1, 3);
    
    // Create a curve
    const positions = frondGeom.attributes.position;
    for (let j = 0; j < positions.count; j++) {
      const y = positions.getY(j);
      const x = positions.getX(j);
      positions.setY(j, y - (x * x) / 20);
    }
    positions.needsUpdate = true;

    const frond = new THREE.Mesh(frondGeom, frondMaterial);
    
    const angle = (i / numFronds) * Math.PI * 2;
    const tilt = Math.PI / 4 + (Math.random() * 0.2);

    frond.rotation.y = angle;
    frond.rotation.z = tilt;
    
    frond.position.set(
      Math.sin(angle) * 3,
      trunkHeight - 2,
      Math.cos(angle) * 3
    );
    
    frond.castShadow = true;
    tree.add(frond);
  }

  return tree;
}
