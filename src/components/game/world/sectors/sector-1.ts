
import * as THREE from 'three';
import { createRockGarden } from '../../models/rock-garden';
import type { MutableRefObject } from 'react';

type Sector1Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector1({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector1Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const rockGarden = createRockGarden();
  rockGarden.position.set(cellCenterX, 0, cellCenterZ);
  sectorGroup.add(rockGarden);
  staticCollidersRef.current.push(rockGarden);

  return sectorGroup;
}
