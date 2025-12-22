import * as THREE from 'three';

export function createBuilding(colors: THREE.Color[]) {
  const building = new THREE.Group();

  const buildingHeight = Math.random() * 100 + 40;
  const buildingWidth = Math.random() * 40 + 20;
  const buildingDepth = Math.random() * 40 + 20;

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: randomColor,
  });

  const buildingGeom = new THREE.BoxGeometry(
    buildingWidth,
    buildingHeight,
    buildingDepth
  );
  const mainBuilding = new THREE.Mesh(buildingGeom, buildingMaterial);
  mainBuilding.position.y = buildingHeight / 2;
  mainBuilding.castShadow = false;
  mainBuilding.receiveShadow = false;
  building.add(mainBuilding);

  // Add windows
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x99ccff,
    emissive: 0x99ccff,
    emissiveIntensity: 0.3,
  });
  const windowGeom = new THREE.BoxGeometry(2, 2, 0.5);

  const floorHeight = 5;
  const numFloors = Math.floor(buildingHeight / floorHeight);
  const windowsPerSide = Math.floor(buildingWidth / 5);

  for (let i = 0; i < numFloors; i++) {
    for (let j = 0; j < windowsPerSide; j++) {
      // Front windows
      const window = new THREE.Mesh(windowGeom, windowMaterial);
      const xPos =
        -buildingWidth / 2 + (j + 0.5) * (buildingWidth / windowsPerSide);
      const yPos = (i + 0.5) * floorHeight;
      window.position.set(xPos, yPos, buildingDepth / 2 + 0.01);
      building.add(window);
    }
  }

  return building;
}
