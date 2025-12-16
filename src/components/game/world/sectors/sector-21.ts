
import * as THREE from 'three';
import type { MutableRefObject } from 'react';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createJapaneseTemple } from '../../models/japanese-temple';
import { createToriiGate } from '../../models/torii-gate';
import { CELL_SIZE } from '@/lib/game-constants';

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
  templeContainer.position.set(cellCenterX, 2, cellCenterZ);
  templeContainer.rotation.y = Math.PI / 2;
  sectorGroup.add(templeContainer);
  
  // The main building itself is a static collider
  staticCollidersRef.current.push(mainBuilding);

  // Process the walkable group for ramp physics
  const geometries: THREE.BufferGeometry[] = [];
  walkableGroup.updateMatrixWorld(true);
  walkableGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
          const geom = child.geometry.clone();
          // Apply the world matrix of the child and its container to get the correct world position
          geom.applyMatrix4(child.matrixWorld);
          geometries.push(geom);
      }
  });

  if (geometries.length > 0) {
      const mergedGeometry = mergeGeometries(geometries, false);
      
      // The merged geometry is already in world coordinates, so we don't need to apply the container's matrix again.
      const walkableMesh = new THREE.Mesh(mergedGeometry, new THREE.MeshBasicMaterial({ visible: false, wireframe: true }));
      
      // Assign the world-transformed mesh directly to the rampMeshRef.
      rampMeshRef.current = walkableMesh;
  }


  // Add the entrance gate to the right side
  const entranceGate = createToriiGate();
  entranceGate.scale.set(1.2, 1.2, 1.2);
  entranceGate.position.set(cellCenterX + CELL_SIZE / 2 - 100, 1, cellCenterZ);
  entranceGate.rotation.y = -Math.PI / 2;
  sectorGroup.add(entranceGate);
  staticCollidersRef.current.push(entranceGate);

  return sectorGroup;
}
