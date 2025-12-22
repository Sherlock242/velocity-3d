
import * as THREE from 'three';

export function createIndustrialBuilding() {
  const building = new THREE.Group();
  const concreteMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 });
  const metalRoofMaterial = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.5, roughness: 0.7 });
  const brickMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // SaddleBrown

  const bodyWidth = 120;
  const bodyHeight = 40;
  const bodyDepth = 80;

  // Main warehouse body
  const bodyGeom = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
  const body = new THREE.Mesh(bodyGeom, concreteMaterial);
  body.position.y = bodyHeight / 2;
  body.castShadow = false;
  body.receiveShadow = false;
  building.add(body);

  // Corrugated-style roof
  const roofGeom = new THREE.BoxGeometry(bodyWidth, 2, bodyDepth);
  const roof = new THREE.Mesh(roofGeom, metalRoofMaterial);
  roof.position.y = bodyHeight + 1;
  roof.castShadow = false;
  roof.receiveShadow = false;
  building.add(roof);

  // Loading bay door
  const doorGeom = new THREE.BoxGeometry(20, 25, 1);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(0, 12.5, bodyDepth / 2 + 0.1);
  building.add(door);
  
  // Smokestack
  const stackHeight = 80;
  const stackRadius = 5;
  const stackGeom = new THREE.CylinderGeometry(stackRadius, stackRadius, stackHeight, 16);
  const stack = new THREE.Mesh(stackGeom, brickMaterial);
  stack.position.set(-bodyWidth / 2 + 15, stackHeight / 2, -bodyDepth / 2 + 15);
  stack.castShadow = false;
  stack.receiveShadow = false;
  building.add(stack);
  
  // Top ring on smokestack
  const ringGeom = new THREE.CylinderGeometry(stackRadius + 1, stackRadius + 1, 3, 16);
  const ring = new THREE.Mesh(ringGeom, metalRoofMaterial);
  ring.position.y = stackHeight - 1.5;
  stack.add(ring);
  
  building.castShadow = false;
  building.receiveShadow = false;
  
  return building;
}
