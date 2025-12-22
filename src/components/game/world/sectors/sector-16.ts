
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

  const frontHouse = createSimpleHouse();
  // Position it along the road in front of the sector
  const roadZ = cellCenterZ + 500 - ROAD_WIDTH / 2 - 50; // Place it before the next road
  frontHouse.position.set(cellCenterX, 0, roadZ);
  frontHouse.rotation.y = Math.PI;
  sectorGroup.add(frontHouse);
  staticCollidersRef.current.push(frontHouse);


  return sectorGroup;
}
