
import * as THREE from 'three';
import { createWardencliffTower } from '../../models/wardencliff-tower';
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

  const tower = createWardencliffTower();
  tower.position.set(cellCenterX, 0, cellCenterZ);
  sectorGroup.add(tower);
  staticCollidersRef.current.push(tower);

  return sectorGroup;
}
