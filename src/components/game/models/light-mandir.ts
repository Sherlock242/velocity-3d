
import * as THREE from 'three';

export function createLightMandir() {
  const mandir = new THREE.Group();
  const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffff99, roughness: 0.6 }); // Light Yellow
  const pinkBorderMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.5 }); // Light Pink
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7, roughness: 0.4 });

  const baseWidth = 35;
  const baseHeight = 15;
  const baseDepth = 25;
  const borderWidth = 1.5;

  // Main structure
  const baseGeom = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
  const baseMesh = new THREE.Mesh(baseGeom, yellowMaterial);
  baseMesh.position.y = baseHeight / 2;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  mandir.add(baseMesh);

  // Pink Borders
  const topBorderGeom = new THREE.BoxGeometry(baseWidth + borderWidth, borderWidth, baseDepth + borderWidth);
  const topBorder = new THREE.Mesh(topBorderGeom, pinkBorderMaterial);
  topBorder.position.y = baseHeight + borderWidth / 2;
  mandir.add(topBorder);

  // --- Main Shikhara (Tower) ---
  const towerBaseHeight = 15;
  const towerBaseGeom = new THREE.BoxGeometry(baseWidth * 0.6, towerBaseHeight, baseDepth * 0.6);
  const towerBase = new THREE.Mesh(towerBaseGeom, yellowMaterial);
  towerBase.position.y = baseHeight + towerBaseHeight / 2;
  towerBase.castShadow = true;
  mandir.add(towerBase);
  
  // Tiered roof for the tower
  const numTiers = 3;
  let currentTierY = baseHeight + towerBaseHeight;
  let currentTierWidth = baseWidth * 0.35;
  
  for (let i = 0; i < numTiers; i++) {
    const tierHeight = 4 - i;
    const tierGeom = new THREE.ConeGeometry(currentTierWidth, tierHeight, 4);
    const tier = new THREE.Mesh(tierGeom, pinkBorderMaterial);
    tier.position.y = currentTierY + tierHeight / 2;
    tier.rotation.y = Math.PI / 4;
    mandir.add(tier);
    currentTierY += tierHeight;
    currentTierWidth *= 0.7;
  }
  
  // Kalash (top finial)
  const kalashGeom = new THREE.ConeGeometry(1, 4, 8);
  const kalash = new THREE.Mesh(kalashGeom, goldMaterial);
  kalash.position.y = currentTierY + 2;
  mandir.add(kalash);

  // --- Entrance Porch ---
  const porchWidth = 15;
  const porchHeight = 12;
  const porchDepth = 10;
  const porch = new THREE.Group();
  porch.position.set(0, 0, baseDepth / 2);

  // Porch Roof
  const porchRoofGeom = new THREE.BoxGeometry(porchWidth, 1.5, porchDepth);
  const porchRoof = new THREE.Mesh(porchRoofGeom, pinkBorderMaterial);
  porchRoof.position.y = porchHeight;
  porch.add(porchRoof);

  // Porch Pillars
  const pillarGeom = new THREE.CylinderGeometry(0.8, 0.8, porchHeight, 12);
  const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0xffe4b5 }); // Moccasin color
  
  const pillar1 = new THREE.Mesh(pillarGeom, pillarMaterial);
  pillar1.position.set(-porchWidth/2 + 1, porchHeight/2, porchDepth - 1);
  porch.add(pillar1);
  
  const pillar2 = new THREE.Mesh(pillarGeom, pillarMaterial);
  pillar2.position.set(porchWidth/2 - 1, porchHeight/2, porchDepth - 1);
  porch.add(pillar2);
  
  mandir.add(porch);

  // Door
  const doorGeom = new THREE.BoxGeometry(6, 10, 1);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(0, 5, baseDepth / 2 + 0.1);
  mandir.add(door);

  mandir.castShadow = true;
  mandir.receiveShadow = true;

  return mandir;
}
