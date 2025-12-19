
import * as THREE from 'three';
import type { MutableRefObject } from 'react';
import { createJapaneseTemple } from '../../models/japanese-temple';
import { createToriiGate } from '../../models/torii-gate';
import { createLantern } from '../../models/japanese-temple/lantern';
import { CELL_SIZE } from '@/lib/game-constants';
import { DOME_HEIGHT } from '@/lib/dome-constants';

type Sector21Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  walkableSurfacesRef: React.MutableRefObject<(THREE.Group | THREE.Mesh)[]>;
  rampMeshRef: MutableRefObject<THREE.Mesh | undefined>;
};

export function createSector21({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  walkableSurfacesRef,
  rampMeshRef,
}: Sector21Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  // Add the temple
  const { templeContainer, mainBuilding, walkableGroup } = createJapaneseTemple();
  const templeScale = 1.5;
  templeContainer.scale.set(templeScale, templeScale, templeScale);
  templeContainer.position.set(cellCenterX, 0, cellCenterZ);
  templeContainer.rotation.y = Math.PI / 2;
  sectorGroup.add(templeContainer);
  walkableSurfacesRef.current.push(walkableGroup);

  // --- Add Lanterns to the Sector ---
  const vermilionRed = new THREE.MeshStandardMaterial({ color: 0xdc4405, roughness: 0.6 });
  const blackAccent = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.1, roughness: 0.7 });

  const templeBaseWidth = 150 * templeScale;
  const templeBaseDepth = 70 * templeScale;

  // Since the temple is rotated, width and depth are swapped for positioning
  const leftLantern = createLantern(vermilionRed, blackAccent);
  leftLantern.position.set(
    cellCenterX + 120,
    0,
    cellCenterZ - 60
  );
  leftLantern.rotation.y = -Math.PI / 2;
  sectorGroup.add(leftLantern);

  const rightLantern = createLantern(vermilionRed, blackAccent);
  rightLantern.position.set(
    cellCenterX + 120,
    0,
    cellCenterZ + 60
  );
  rightLantern.rotation.y = -Math.PI / 2;
  sectorGroup.add(rightLantern);
  
  // Add the entrance gate to the right side
  const entranceGate = createToriiGate();
  entranceGate.scale.set(1.2, 1.2, 1.2);
  entranceGate.position.set(cellCenterX + CELL_SIZE / 2 - 100, 0, cellCenterZ);
  entranceGate.rotation.y = -Math.PI / 2;
  sectorGroup.add(entranceGate);

  return sectorGroup;
}
