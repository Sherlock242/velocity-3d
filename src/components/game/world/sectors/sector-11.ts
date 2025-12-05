
import * as THREE from 'three';
import { createOpenCollegeBuilding } from '../../models/open-college-building';
import type { MutableRefObject } from 'react';

type Sector11Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector11({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector11Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const openCollege = createOpenCollegeBuilding();
  openCollege.position.set(cellCenterX, 0, cellCenterZ);
  sectorGroup.add(openCollege);
  staticCollidersRef.current.push(openCollege);

  return sectorGroup;
}
