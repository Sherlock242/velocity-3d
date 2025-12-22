import * as THREE from 'three';
import { createBuilding } from '../../models/building';
import { TRACK_THEMES, CELL_SIZE, ROAD_WIDTH } from '@/lib/game-constants';
import type { TrackTheme } from '@/lib/types';
import type { MutableRefObject } from 'react';

type GenericSectorProps = {
  theme: TrackTheme;
  cellCenterX: number;
  cellCenterZ: number;
  walkingNpcsRef: MutableRefObject<THREE.Group[]>;
};

export function createGenericSector({
  theme,
  cellCenterX,
  cellCenterZ,
  walkingNpcsRef,
}: GenericSectorProps): THREE.Group {
  const sectorGroup = new THREE.Group();

  // Add random scenery
  for (let k = 0; k < 4; k++) {
    const x = cellCenterX + (Math.random() - 0.5) * (CELL_SIZE - ROAD_WIDTH);
    const z = cellCenterZ + (Math.random() - 0.5) * (CELL_SIZE - ROAD_WIDTH);

    let sceneryObject: THREE.Group | THREE.Mesh;
    const sceneryColors = TRACK_THEMES[theme].scenery;

    if (theme === 'Forest') {
      const treeHeight = Math.random() * 20 + 10;
      const treeRadius = treeHeight / 8;
      const sceneryGeometry = new THREE.ConeGeometry(treeRadius, treeHeight, 8);
      const randomColor =
        sceneryColors[Math.floor(Math.random() * sceneryColors.length)];
      const sceneryMaterial = new THREE.MeshStandardMaterial({
        color: randomColor,
      });
      sceneryObject = new THREE.Mesh(sceneryGeometry, sceneryMaterial);
      sceneryObject.position.set(x, treeHeight / 2, z);
    } else if (theme === 'Desert') {
      const duneSize = Math.random() * 15 + 5;
      const sceneryGeometry = new THREE.ConeGeometry(duneSize, duneSize / 2, 4); // Pyramid shape
      const randomColor =
        sceneryColors[Math.floor(Math.random() * sceneryColors.length)];
      const sceneryMaterial = new THREE.MeshStandardMaterial({
        color: randomColor,
      });
      sceneryObject = new THREE.Mesh(sceneryGeometry, sceneryMaterial);
      sceneryObject.position.set(x, duneSize / 4, z);
    } else {
      // City
      const building = createBuilding(sceneryColors);
      sceneryObject = building;
      sceneryObject.position.set(x, 0, z);
    }

    sceneryObject.castShadow = false;
    sceneryObject.receiveShadow = false;
    sectorGroup.add(sceneryObject);
  }

  // NPCs are removed from generic sectors
  walkingNpcsRef.current = [];

  return sectorGroup;
}
