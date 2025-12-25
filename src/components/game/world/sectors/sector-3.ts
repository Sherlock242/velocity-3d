import * as THREE from 'three';
import { createSimpleHouse } from '../../models/simple-house';
import type { MutableRefObject } from 'react';
import { ROAD_WIDTH } from '@/lib/game-constants';

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

  const house2 = createSimpleHouse();
  house2.position.set(cellCenterX + ROAD_WIDTH * 2, 0, cellCenterZ - ROAD_WIDTH);
  house2.rotation.y = Math.PI / 3;
  sectorGroup.add(house2);
  staticCollidersRef.current.push(house2);

  return sectorGroup;
}
