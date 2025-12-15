
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

  const toriiGate = createToriiGate();
  toriiGate.position.set(cellCenterX, 0, cellCenterZ);
  toriiGate.scale.set(2, 1.8, 2);
  toriiGate.rotation.y = Math.PI / 2;
  sectorGroup.add(toriiGate);
  staticCollidersRef.current.push(toriiGate);


  return sectorGroup;
}
