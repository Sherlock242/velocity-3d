
import * as THREE from 'three';

export function createGraveyard() {
    const graveyard = new THREE.Group();
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a }); // Dark grey ground
    const tombstoneMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2d1e }); // Dark brown for dead-looking trees

    // Ground plane
    const groundGeom = new THREE.PlaneGeometry(400, 400);
    const ground = new THREE.Mesh(groundGeom, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    graveyard.add(ground);

    // Tombstones
    const numTombstones = 50;
    for (let i = 0; i < numTombstones; i++) {
        const tombstoneGeom = new THREE.BoxGeometry(4, 6 + Math.random() * 4, 1);
        const tombstone = new THREE.Mesh(tombstoneGeom, tombstoneMaterial);
        const x = (Math.random() - 0.5) * 380;
        const z = (Math.random() - 0.5) * 380;
        tombstone.position.set(x, tombstone.geometry.parameters.height / 2, z);
        tombstone.rotation.y = (Math.random() - 0.5) * 0.2;
        tombstone.castShadow = true;
        graveyard.add(tombstone);
    }
    
    // A few dead-looking trees
    const numTrees = 5;
    for (let i = 0; i < numTrees; i++) {
        const tree = new THREE.Group();
        const trunkHeight = 20 + Math.random() * 10;
        const trunkGeom = new THREE.CylinderGeometry(0.5, 1, trunkHeight, 5);
        const trunk = new THREE.Mesh(trunkGeom, treeMaterial);
        trunk.position.y = trunkHeight / 2;
        tree.add(trunk);
        
        const x = (Math.random() - 0.5) * 350;
        const z = (Math.random() - 0.5) * 350;
        tree.position.set(x, 0, z);
        tree.castShadow = true;
        graveyard.add(tree);
    }

    return graveyard;
}
