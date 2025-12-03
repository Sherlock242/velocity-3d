
import * as THREE from 'three';

export function createClassroomBlock() {
  const building = new THREE.Group();
  building.name = 'ClassroomBlock';

  const blockWidth = 200; // Increased length
  const floorHeight = 15;
  const blockDepth = 30;
  const numFloors = 4; // 4-story building

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5dc, // Beige
    roughness: 0.8,
  });
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // SaddleBrown
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });

  for (let f = 0; f < numFloors; f++) {
    const yPos = f * floorHeight;
    const floorGroup = new THREE.Group();
    floorGroup.position.y = yPos;

    // Main building block for the floor
    const mainGeom = new THREE.BoxGeometry(blockWidth, floorHeight, blockDepth);
    const mainMesh = new THREE.Mesh(mainGeom, wallMaterial);
    mainMesh.position.y = floorHeight / 2;
    mainMesh.castShadow = true;
    floorGroup.add(mainMesh);

    // Series of doors to represent classrooms
    const numClassrooms = 8; // Increased doors for longer building
    const doorWidth = 6;
    const doorHeight = 10;
    const spacing = blockWidth / numClassrooms;

    for (let i = 0; i < numClassrooms; i++) {
      const xPos = -blockWidth / 2 + spacing / 2 + i * spacing;

      const doorGeom = new THREE.BoxGeometry(doorWidth, doorHeight, 1);
      const door = new THREE.Mesh(doorGeom, doorMaterial);
      door.position.set(xPos, doorHeight / 2, blockDepth / 2 + 0.1);
      floorGroup.add(door);
    }
    
    building.add(floorGroup);
  }

  // Simple roof on top
  const roofGeom = new THREE.BoxGeometry(blockWidth, 1, blockDepth);
  const roof = new THREE.Mesh(roofGeom, roofMaterial);
  roof.position.y = numFloors * floorHeight;
  building.add(roof);

  building.castShadow = true;
  building.receiveShadow = true;

  return building;
}
