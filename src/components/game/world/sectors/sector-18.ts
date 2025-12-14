
import * as THREE from 'three';
import { createWardencliffHouse } from '../../models/wardencliff-house';
import type { MutableRefObject } from 'react';

type Sector18Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector18({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector18Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const wardencliffHouse = createWardencliffHouse();
  wardencliffHouse.position.set(cellCenterX, 0, cellCenterZ);
  sectorGroup.add(wardencliffHouse);
  staticCollidersRef.current.push(wardencliffHouse);

  return sectorGroup;
}
