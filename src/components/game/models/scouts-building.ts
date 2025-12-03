
import * as THREE from 'three';

export function createScoutsBuilding() {
  const building = new THREE.Group();

  const blueMaterial = new THREE.MeshStandardMaterial({
    color: 0x0077ff, // A strong blue color
    metalness: 0.9,
    roughness: 0.1,
  });

  const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
  });

  const buildingWidth = 80;
  const buildingHeight = 50;
  const buildingDepth = 40;

  // Main blue mirror-like structure
  const mainGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
  const mainMesh = new THREE.Mesh(mainGeom, blueMaterial);
  mainMesh.position.y = buildingHeight / 2;
  mainMesh.castShadow = true;
  building.add(mainMesh);

  // White base
  const baseHeight = 4;
  const baseGeom = new THREE.BoxGeometry(buildingWidth + 5, baseHeight, buildingDepth + 5);
  const base = new THREE.Mesh(baseGeom, whiteMaterial);
  base.position.y = baseHeight / 2;
  building.add(base);

  // Bring main building up to sit on the base
  mainMesh.position.y = baseHeight + buildingHeight / 2;

  // Entrance
  const entranceGeom = new THREE.BoxGeometry(15, 20, 2);
  const entrance = new THREE.Mesh(entranceGeom, whiteMaterial);
  entrance.position.set(0, baseHeight + 10, buildingDepth / 2 + 2);
  building.add(entrance);

  // Add "Scouts and Guides" text placeholder
  const signGeom = new THREE.BoxGeometry(40, 6, 1);
  const signMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const sign = new THREE.Mesh(signGeom, signMaterial);
  sign.position.set(0, baseHeight + buildingHeight - 10, buildingDepth / 2 + 0.6);
  building.add(sign);

  building.castShadow = true;
  building.receiveShadow = true;

  return building;
}
