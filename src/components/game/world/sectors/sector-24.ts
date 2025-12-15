
import * as THREE from 'three';
import { createToriiGate } from '../../models/torii-gate';
import type { MutableRefObject } from 'react';

type Sector24Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector24({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector24Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  // This sector is now empty. The gate has been moved to sector 23.

  return sectorGroup;
}
