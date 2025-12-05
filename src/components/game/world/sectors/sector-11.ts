
import * as THREE from 'three';
import { createOpenCollegeBuilding } from '../../models/open-college-building';
import { createPalmTree } from '../../models/palm-tree';
import type { MutableRefObject } from 'react';

type Sector11Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector11({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector11Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const openCollege = createOpenCollegeBuilding();
  openCollege.position.set(cellCenterX, 0, cellCenterZ);
  sectorGroup.add(openCollege);
  staticCollidersRef.current.push(openCollege);

  // Add palm trees to the courtyard
  const numTreesPerRow = 6;
  const treeSpacing = 40;
  const rowSpacing = 80;
  const startZ = cellCenterZ - ((numTreesPerRow - 1) * treeSpacing) / 2;

  // Left Row
  for (let i = 0; i < numTreesPerRow; i++) {
    const tree = createPalmTree();
    const z = startZ + i * treeSpacing;
    tree.position.set(cellCenterX - rowSpacing / 2, 0, z);
    sectorGroup.add(tree);
    staticCollidersRef.current.push(tree);
  }

  // Right Row
  for (let i = 0; i < numTreesPerRow; i++) {
    const tree = createPalmTree();
    const z = startZ + i * treeSpacing;
    tree.position.set(cellCenterX + rowSpacing / 2, 0, z);
    sectorGroup.add(tree);
    staticCollidersRef.current.push(tree);
  }

  return sectorGroup;
}
