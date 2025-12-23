import * as THREE from 'three';
import { createSimpleHouse } from '../../models/simple-house';
import type { MutableRefObject } from 'react';
import { ROAD_WIDTH } from '@/lib/game-constants';

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

  const house = createSimpleHouse();
  house.position.set(cellCenterX, 0, cellCenterZ);
  sectorGroup.add(house);
  staticCollidersRef.current.push(house);

  return sectorGroup;
}
