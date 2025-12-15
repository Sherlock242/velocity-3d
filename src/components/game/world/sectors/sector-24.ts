import * as THREE from 'three';
import type { MutableRefObject } from 'react';

type Sector24Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector24({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector24Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  // The gate is now created in track.ts to calculate its height correctly on the dome.

  return sectorGroup;
}
