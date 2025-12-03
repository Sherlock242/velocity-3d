
import * as THREE from 'three';

export function createClassroomBlock() {
  const block = new THREE.Group();
  block.name = 'ClassroomBlock';

  const blockWidth = 150;
  const blockHeight = 15;
  const blockDepth = 30;

  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xf5f5dc, // Beige
    roughness: 0.8
  });
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // SaddleBrown

  // Main building block
  const mainGeom = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth);
  const mainMesh = new THREE.Mesh(mainGeom, wallMaterial);
  mainMesh.position.y = blockHeight / 2;
  mainMesh.castShadow = true;
  block.add(mainMesh);

  // Series of doors to represent classrooms
  const numClassrooms = 6;
  const doorWidth = 6;
  const doorHeight = 10;
  const spacing = blockWidth / numClassrooms;

  for (let i = 0; i < numClassrooms; i++) {
    const xPos = -blockWidth / 2 + spacing / 2 + i * spacing;
    
    const doorGeom = new THREE.BoxGeometry(doorWidth, doorHeight, 1);
    const door = new THREE.Mesh(doorGeom, doorMaterial);
    door.position.set(xPos, doorHeight / 2, blockDepth / 2 + 0.1);
    block.add(door);
  }

  // Simple roof
  const roofGeom = new THREE.BoxGeometry(blockWidth, 1, blockDepth);
  const roofMaterial = new THREE.MeshStandardMaterial({color: 0x555555});
  const roof = new THREE.Mesh(roofGeom, roofMaterial);
  roof.position.y = blockHeight;
  block.add(roof);

  block.castShadow = true;
  block.receiveShadow = true;

  return block;
}

    