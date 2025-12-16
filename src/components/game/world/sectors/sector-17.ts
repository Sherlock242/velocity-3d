
import * as THREE from 'three';
import { createSimpleHouse } from '../../models/simple-house';
import type { MutableRefObject } from 'react';

type Sector17Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector17({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector17Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const house = createSimpleHouse();
  house.position.set(cellCenterX, 0, cellCenterZ);
  sectorGroup.add(house);
  staticCollidersRef.current.push(house);

  return sectorGroup;
}
