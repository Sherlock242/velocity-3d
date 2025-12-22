
import * as THREE from 'three';

export function createSchoolBuilding() {
  const school = new THREE.Group();
  const brickMaterial = new THREE.MeshStandardMaterial({ color: 0x9a3e3e, roughness: 0.9 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xadd8e6 }); // LightBlue

  const mainWidth = 120;
  const mainHeight = 30;
  const mainDepth = 60;

  // Main Building Block
  const mainGeom = new THREE.BoxGeometry(mainWidth, mainHeight, mainDepth);
  const mainBuilding = new THREE.Mesh(mainGeom, brickMaterial);
  mainBuilding.position.y = mainHeight / 2;
  school.add(mainBuilding);
  
  // Roof
  const roofGeom = new THREE.BoxGeometry(mainWidth + 5, 4, mainDepth + 5);
  const roof = new THREE.Mesh(roofGeom, roofMaterial);
  roof.position.y = mainHeight + 2;
  school.add(roof);

  // Entrance
  const entranceWidth = 20;
  const entranceHeight = 25;
  const entranceGeom = new THREE.BoxGeometry(entranceWidth, entranceHeight, 5);
  const entranceMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 }); // Brown
  const entrance = new THREE.Mesh(entranceGeom, entranceMaterial);
  entrance.position.set(0, entranceHeight / 2, mainDepth / 2 + 2.5);
  school.add(entrance);

  // Windows
  const windowWidth = 10;
  const windowHeight = 12;
  const windowGeom = new THREE.BoxGeometry(windowWidth, windowHeight, 1);
  
  const windowPositions = [-40, -20, 20, 40];
  windowPositions.forEach(xPos => {
      const window = new THREE.Mesh(windowGeom, windowMaterial);
      window.position.set(xPos, 15, mainDepth / 2 + 0.1);
      school.add(window);
  });
  
  school.castShadow = false;
  school.receiveShadow = false;

  return school;
}
