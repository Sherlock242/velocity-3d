
import * as THREE from 'three';
import { createSimpleHouse } from '../../models/simple-house';
import type { MutableRefObject } from 'react';

type Sector16Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector16({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector16Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const house1 = createSimpleHouse();
  house1.position.set(cellCenterX - 50, 0, cellCenterZ - 50);
  sectorGroup.add(house1);
  staticCollidersRef.current.push(house1);

  const house2 = createSimpleHouse();
  house2.position.set(cellCenterX + 50, 0, cellCenterZ + 50);
  house2.rotation.y = Math.PI / 2;
  sectorGroup.add(house2);
  staticCollidersRef.current.push(house2);

  return sectorGroup;
}
