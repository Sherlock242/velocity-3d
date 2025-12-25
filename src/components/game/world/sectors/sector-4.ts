
import * as THREE from 'three';
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { MutableRefObject } from 'react';
import { createSimpleHouse } from '../../models/simple-house';

type Sector4Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  walkableSurfacesRef: MutableRefObject<(THREE.Group | THREE.Mesh)[]>;
  gltfLoader: GLTFLoader;
  isSector4LoadedRef: React.MutableRefObject<boolean>;
  forestGroundRef: React.MutableRefObject<THREE.Mesh | undefined>;
};

export function createSector4({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  walkableSurfacesRef,
  gltfLoader,
  isSector4LoadedRef,
  forestGroundRef,
}: Sector4Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  gltfLoader.load(
    '/forest.glb',
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(10, 10, 10);
      model.position.set(cellCenterX, 0, cellCenterZ);

      const ground = model.getObjectByName('forest_ground') as THREE.Mesh;
      if (ground) {
          forestGroundRef.current = ground;
          isSector4LoadedRef.current = true;
      }
      
      sectorGroup.add(model);
    },
    undefined,
    (error) => {
      console.error('An error happened while loading the forest model:', error);
    }
  );

  const house = createSimpleHouse();
  house.position.set(cellCenterX, 0, cellCenterZ);
  sectorGroup.add(house);
  staticCollidersRef.current.push(house);

  return sectorGroup;
}
