
import * as THREE from 'three';
import type { MutableRefObject } from 'react';

type Sector23Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector23({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector23Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  // This sector is part of the ramp. You can add scenery on the sides.
  // Gate creation is now handled in track.ts to ensure correct height on the dome.

  return sectorGroup;
}
