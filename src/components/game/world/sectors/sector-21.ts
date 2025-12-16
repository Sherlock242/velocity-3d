
import * as THREE from 'three';
import type { MutableRefObject } from 'react';
import { createJapaneseTemple } from '../../models/japanese-temple';
import { createToriiGate } from '../../models/torii-gate';
import { CELL_SIZE } from '@/lib/game-constants';
import { DOME_HEIGHT } from '@/lib/dome-constants';

type Sector21Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  rampMeshRef: MutableRefObject<THREE.Mesh | undefined>;
};

export function createSector21({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  rampMeshRef,
}: Sector21Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  // Add the temple
  const { templeContainer, mainBuilding, walkableGroup } = createJapaneseTemple();
  templeContainer.scale.set(1.5, 1.5, 1.5);
  templeContainer.position.set(cellCenterX, 0, cellCenterZ);
  templeContainer.rotation.y = Math.PI / 2;
  sectorGroup.add(templeContainer);
  
  // Add the entrance gate to the right side
  const entranceGate = createToriiGate();
  entranceGate.scale.set(1.2, 1.2, 1.2);
  entranceGate.position.set(cellCenterX + CELL_SIZE / 2 - 100, 0, cellCenterZ);
  entranceGate.rotation.y = -Math.PI / 2;
  sectorGroup.add(entranceGate);

  return sectorGroup;
}
