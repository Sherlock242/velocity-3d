import * as THREE from 'three';
import { createRockGarden } from '../../models/rock-garden';
import { createNpc } from '../../models/npc';
import type { MutableRefObject } from 'react';

type Sector1Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  walkingNpcsRef: MutableRefObject<THREE.Group[]>;
};

export function createSector1({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  walkingNpcsRef,
}: Sector1Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const rockGarden = createRockGarden();
  rockGarden.position.set(cellCenterX, 0, cellCenterZ);
  sectorGroup.add(rockGarden);
  staticCollidersRef.current.push(rockGarden);

  // Add NPCs to the pathways in the Rock Garden
  const npcPositions = [
    { x: -50, z: 50 },
    { x: 0, z: 0 },
    { x: 50, z: -50 },
    { x: 20, z: -20 },
    { x: -30, z: 40 },
    { x: -10, z: 80 },
  ];

  npcPositions.forEach(pos => {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const npc = createNpc(false, gender);
    npc.scale.set(1.5,1.5,1.5);
    npc.position.set(cellCenterX + pos.x, 1, cellCenterZ + pos.z);
    npc.rotation.y = Math.random() * Math.PI * 2;
    
    // Define simple bounds for walking
    const bounds = new THREE.Box2(
        new THREE.Vector2(cellCenterX - 140, cellCenterZ - 140),
        new THREE.Vector2(cellCenterX + 140, cellCenterZ + 140)
    );
    npc.userData.bounds = bounds;

    sectorGroup.add(npc);
    walkingNpcsRef.current.push(npc);
  });


  return sectorGroup;
}
