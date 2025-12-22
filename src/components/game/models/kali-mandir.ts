
import * as THREE from 'three';

export function createKaliMandir() {
  const mandir = new THREE.Group();
  const pinkMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.6 }); // Hot Pink
  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xdc143c, metalness: 0.5 }); // Crimson Red
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.4 });

  // Base platform with steps
  const platformWidth = 40;
  const platformHeight = 4;
  const platformDepth = 30;
  const numSteps = 3;
  const stepHeight = platformHeight / numSteps;

  for (let i = 0; i < numSteps; i++) {
    const stepWidth = platformWidth + (numSteps - 1 - i) * 4;
    const stepDepth = platformDepth + (numSteps - 1 - i) * 4;
    const stepGeom = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const step = new THREE.Mesh(stepGeom, pinkMaterial);
    step.position.y = stepHeight / 2 + i * stepHeight;
    step.receiveShadow = false;
    mandir.add(step);
  }

  // Main structure (Garbhagriha)
  const mainWidth = 25;
  const mainHeight = 20;
  const mainDepth = 25;
  const mainGeom = new THREE.BoxGeometry(mainWidth, mainHeight, mainDepth);
  const mainStructure = new THREE.Mesh(mainGeom, pinkMaterial);
  mainStructure.position.y = platformHeight + mainHeight / 2;
  mainStructure.castShadow = false;
  mandir.add(mainStructure);

  // Shikhara (Tower)
  const shikhara = new THREE.Group();
  let currentHeight = platformHeight + mainHeight;
  let currentWidth = mainWidth * 0.8;
  const numTiers = 5;

  for (let i = 0; i < numTiers; i++) {
    const tierHeight = 8 - i * 1.5;
    const tierGeom = new THREE.ConeGeometry(currentWidth / 2, tierHeight, 16);
    const tier = new THREE.Mesh(tierGeom, pinkMaterial);
    tier.position.y = currentHeight + tierHeight / 2;
    // Add decorative bands
    const bandGeom = new THREE.TorusGeometry(currentWidth / 2 * 0.8, 0.3, 8, 32);
    const band = new THREE.Mesh(bandGeom, redMaterial);
    band.position.y = currentHeight + tierHeight * 0.2;
    band.rotation.x = Math.PI / 2;
    shikhara.add(band);
    
    shikhara.add(tier);
    currentHeight += tierHeight;
    currentWidth *= 0.7;
  }
  
  // Amalaka (Top circular piece)
  const amalakaGeom = new THREE.CylinderGeometry(currentWidth, currentWidth, 2, 16);
  const amalaka = new THREE.Mesh(amalakaGeom, goldMaterial);
  amalaka.position.y = currentHeight + 1;
  shikhara.add(amalaka);

  // Kalasha (Finial)
  const kalashaGeom = new THREE.ConeGeometry(1, 4, 8);
  const kalasha = new THREE.Mesh(kalashaGeom, goldMaterial);
  kalasha.position.y = currentHeight + 3;
  shikhara.add(kalasha);

  mandir.add(shikhara);

  // Flag
  const flagPoleGeom = new THREE.CylinderGeometry(0.3, 0.3, 25, 8);
  const flagPole = new THREE.Mesh(flagPoleGeom, new THREE.MeshStandardMaterial({color: 0x555555}));
  flagPole.position.set(0, currentHeight + 12, 0);
  mandir.add(flagPole);
  
  const flagGeom = new THREE.PlaneGeometry(8, 5);
  const flag = new THREE.Mesh(flagGeom, redMaterial);
  flag.position.set(4.5, 22, 0); // attached to top of pole
  flagPole.add(flag);

  // Entrance
  const doorGeom = new THREE.BoxGeometry(8, 12, 2);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(0, platformHeight + 6, mainDepth / 2 - 1);
  mandir.add(door);
  
  // Decorative Arch over door
  const archGeom = new THREE.TorusGeometry(5, 1, 16, 16, Math.PI);
  const arch = new THREE.Mesh(archGeom, goldMaterial);
  arch.position.set(0, platformHeight + 12, mainDepth / 2);
  arch.rotation.z = Math.PI;
  mandir.add(arch);

  mandir.castShadow = false;
  mandir.receiveShadow = false;

  return mandir;
}
