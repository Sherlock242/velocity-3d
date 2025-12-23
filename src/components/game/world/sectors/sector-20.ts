
import * as THREE from 'three';
import { createChandigarhHouse } from '../../models/chandigarh-house';
import { createLightMandir } from '../../models/light-mandir';
import { createSatsangBuilding } from '../../models/satsang-building';
import { createKaliMandir } from '../../models/kali-mandir';
import { createGurudwara } from '../../models/gurudwara';
import { createCoachingClass } from '../../models/coaching-class';
import { CELL_SIZE } from '@/lib/game-constants';
import type { MutableRefObject } from 'react';

type Sector20Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector20({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
}: Sector20Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  // --- HOUSES IN TOP-RIGHT ---
  const numHousesPerRow = 5;
  const numRows = 5;
  const houseSpacing = 120;
  const rowSpacing = 150;
  const startX = cellCenterX + (CELL_SIZE / 2) - (numRows * rowSpacing);
  const startZ = cellCenterZ - (CELL_SIZE / 2) + rowSpacing;

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numHousesPerRow; col++) {
      const house = createChandigarhHouse();
      const x = startX + row * rowSpacing;
      const z = startZ + col * houseSpacing;
      house.position.set(x, 0, z);
      house.rotation.y = 0;
      sectorGroup.add(house);
      staticCollidersRef.current.push(house);
    }
  }

  // --- SPECIAL BUILDINGS IN TOP-LEFT (VERTICALLY) ---
  let currentZ = cellCenterZ - (CELL_SIZE / 2) + 150;
  const specialBuildingX = cellCenterX - (CELL_SIZE / 2) + 100;
  const specialBuildingSpacing = 200;

  const lightMandir = createLightMandir();
  lightMandir.position.set(specialBuildingX, 0, currentZ);
  lightMandir.rotation.y = -Math.PI / 2;
  sectorGroup.add(lightMandir);
  staticCollidersRef.current.push(lightMandir);
  currentZ += specialBuildingSpacing;

  const satsangBuilding = createSatsangBuilding();
  satsangBuilding.position.set(specialBuildingX, 0, currentZ);
  satsangBuilding.rotation.y = -Math.PI / 2;
  sectorGroup.add(satsangBuilding);
  staticCollidersRef.current.push(satsangBuilding);
  currentZ += specialBuildingSpacing;

  const kaliMandir = createKaliMandir();
  kaliMandir.position.set(specialBuildingX, 0, currentZ);
  kaliMandir.rotation.y = -Math.PI / 2;
  sectorGroup.add(kaliMandir);
  staticCollidersRef.current.push(kaliMandir);
  currentZ += specialBuildingSpacing;

  const gurudwara = createGurudwara();
  gurudwara.position.set(specialBuildingX, 0, currentZ);
  gurudwara.rotation.y = -Math.PI / 2;
  sectorGroup.add(gurudwara);
  staticCollidersRef.current.push(gurudwara);
  currentZ += specialBuildingSpacing;

  const coachingClass = createCoachingClass();
  coachingClass.position.set(specialBuildingX, 0, currentZ);
  coachingClass.rotation.y = -Math.PI / 2;
  sectorGroup.add(coachingClass);
  staticCollidersRef.current.push(coachingClass);

  return sectorGroup;
}
