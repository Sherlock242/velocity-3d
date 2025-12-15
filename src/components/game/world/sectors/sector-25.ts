
import * as THREE from 'three';
import { CELL_SIZE, ROAD_WIDTH } from '@/lib/game-constants';
import type { MutableRefObject } from 'react';
import { createToriiGate } from '../../models/torii-gate';

type Sector25Props = {
    cellCenterX: number;
    cellCenterZ: number;
    staticCollidersRef: MutableRefObject<THREE.Group[]>;
};


export function createSector25({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector25Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  // The gate for the start/finish line
  const gate = createToriiGate();
  gate.position.set(cellCenterX, 50, cellCenterZ); // Added y-offset to elevate the gate
  gate.rotation.y = Math.PI / 2;
  sectorGroup.add(gate);
  // Not adding to colliders so player can pass through
  // staticCollidersRef.current.push(gate);


  return sectorGroup;
}
