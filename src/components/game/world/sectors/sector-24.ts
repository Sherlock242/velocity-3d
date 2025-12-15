
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

  // This sector is now the start of the ramp.
  // Add a torii gate as the entrance to the ramp.
  const toriiGate = createToriiGate();
  toriiGate.position.set(cellCenterX, 0, cellCenterZ - 200);
  toriiGate.scale.set(2, 1.8, 2);
  toriiGate.rotation.y = Math.PI/2;
  sectorGroup.add(toriiGate);
  staticCollidersRef.current.push(toriiGate);


  return sectorGroup;
}
