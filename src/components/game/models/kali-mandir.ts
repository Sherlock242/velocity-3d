
import * as THREE from 'three';

export function createKaliMandir() {
  const mandir = new THREE.Group();
  const pinkMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.6 }); // Hot Pink
  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xdc143c, metalness: 0.5 }); // Crimson Red for flag

  // Base platform
  const platformWidth = 40;
  const platformHeight = 4;
  const platformDepth = 30;
  const platformGeom = new THREE.BoxGeometry(platformWidth, platformHeight, platformDepth);
  const platform = new THREE.Mesh(platformGeom, pinkMaterial);
  platform.position.y = platformHeight / 2;
  mandir.add(platform);

  // Main structure (Garbhagriha)
  const mainWidth = 25;
  const mainHeight = 20;
  const mainDepth = 25;
  const mainGeom = new THREE.BoxGeometry(mainWidth, mainHeight, mainDepth);
  const mainStructure = new THREE.Mesh(mainGeom, pinkMaterial);
  mainStructure.position.y = platformHeight + mainHeight / 2;
  mandir.add(mainStructure);

  // Shikhara (Tower)
  const shikhara = new THREE.Group();
  let currentHeight = platformHeight + mainHeight;
  let currentWidth = mainWidth * 0.8;
  const numTiers = 4;

  for (let i = 0; i < numTiers; i++) {
    const tierHeight = 10 - i * 2;
    const tierGeom = new THREE.ConeGeometry(currentWidth / 2, tierHeight, 16);
    const tier = new THREE.Mesh(tierGeom, pinkMaterial);
    tier.position.y = currentHeight + tierHeight / 2;
    shikhara.add(tier);
    currentHeight += tierHeight;
    currentWidth *= 0.7;
  }
  
  // Amalaka (Top circular piece)
  const amalakaGeom = new THREE.CylinderGeometry(currentWidth, currentWidth, 2, 16);
  const amalaka = new THREE.Mesh(amalakaGeom, pinkMaterial);
  amalaka.position.y = currentHeight + 1;
  shikhara.add(amalaka);

  // Kalasha (Finial)
  const kalashaGeom = new THREE.ConeGeometry(1, 4, 8);
  const kalasha = new THREE.Mesh(kalashaGeom, redMaterial);
  kalasha.position.y = currentHeight + 3;
  shikhara.add(kalasha);

  mandir.add(shikhara);

  // Flag
  const flagPoleGeom = new THREE.CylinderGeometry(0.5, 0.5, 30, 8);
  const flagPole = new THREE.Mesh(flagPoleGeom, new THREE.MeshStandardMaterial({color: 0x333333}));
  flagPole.position.set(0, currentHeight + 15, 0);
  mandir.add(flagPole);
  
  const flagGeom = new THREE.PlaneGeometry(8, 5);
  const flag = new THREE.Mesh(flagGeom, redMaterial);
  flag.position.set(4, currentHeight + 27, 0);
  flagPole.add(flag);

  // Entrance
  const doorGeom = new THREE.BoxGeometry(8, 12, 1);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(0, platformHeight + 6, mainDepth / 2 + 0.1);
  mandir.add(door);

  mandir.castShadow = true;
  mandir.receiveShadow = true;

  return mandir;
}
