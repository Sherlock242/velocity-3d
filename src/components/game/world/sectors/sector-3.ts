import * as THREE from 'three';
import { createSimpleHouse } from '../../models/simple-house';
import type { MutableRefObject } from 'react';

type Sector3Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector3({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector3Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const house = createSimpleHouse();
  house.position.set(cellCenterX, 0, cellCenterZ);
  sectorGroup.add(house);
  staticCollidersRef.current.push(house);

  return sectorGroup;
}
