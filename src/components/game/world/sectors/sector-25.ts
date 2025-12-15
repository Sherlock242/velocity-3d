
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

  // Gate creation is now handled in track.ts to ensure correct height on the dome.


  return sectorGroup;
}
