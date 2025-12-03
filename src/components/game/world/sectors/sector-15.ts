
import * as THREE from 'three';
import { createMansion } from '../../models/mansion';
import type { MutableRefObject } from 'react';

type Sector15Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector15({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector15Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const mansion = createMansion();
  mansion.position.set(cellCenterX, 0, cellCenterZ);
  mansion.rotation.y = -Math.PI / 2;
  mansion.castShadow = true;
  mansion.receiveShadow = true;
  sectorGroup.add(mansion);
  staticCollidersRef.current.push(mansion);

  return sectorGroup;
}
