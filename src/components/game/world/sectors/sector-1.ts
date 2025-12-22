import * as THREE from 'three';
import { createRockGarden } from '../../models/rock-garden';
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

  // NPCs removed from this sector
  walkingNpcsRef.current = walkingNpcsRef.current.filter(npc => {
    // This is a simple way to remove them, assuming they are added here.
    // A more robust way would be to not add them at all.
    const distance = npc.position.distanceTo(new THREE.Vector3(cellCenterX, 0, cellCenterZ));
    return distance > 200; // Keep NPCs outside this sector's approximate radius
  });


  return sectorGroup;
}
