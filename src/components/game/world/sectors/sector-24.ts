
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

  const gate = createToriiGate();
  gate.position.set(cellCenterX, 50, cellCenterZ); // Added y-offset to elevate the gate
  gate.rotation.y = Math.PI / 2;
  sectorGroup.add(gate);
  // Not adding to colliders so player can pass through
  // staticCollidersRef.current.push(gate);

  return sectorGroup;
}
