
import * as THREE from 'three';
import type { MutableRefObject } from 'react';
import { createJapaneseTemple } from '../../models/japanese-temple';
import { createToriiGate } from '../../models/torii-gate';

type Sector21Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector21({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector21Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  // Add the temple
  const temple = createJapaneseTemple();
  temple.scale.set(1.5, 1.5, 1.5);
  temple.position.set(cellCenterX, 1, cellCenterZ - 100);
  temple.rotation.y = Math.PI / 2;
  sectorGroup.add(temple);
  staticCollidersRef.current.push(temple);

  // Add the entrance gate
  const entranceGate = createToriiGate();
  entranceGate.scale.set(1.2, 1.2, 1.2);
  entranceGate.position.set(cellCenterX, 1, cellCenterZ + 150);
  entranceGate.rotation.y = Math.PI / 2;
  sectorGroup.add(entranceGate);
  staticCollidersRef.current.push(entranceGate);

  return sectorGroup;
}
