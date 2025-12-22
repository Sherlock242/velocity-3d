
import * as THREE from 'three';
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { MutableRefObject } from 'react';

type Sector4Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  walkableSurfacesRef: MutableRefObject<(THREE.Group | THREE.Mesh)[]>;
  gltfLoader: GLTFLoader;
  forestGroundRef: MutableRefObject<THREE.Mesh | undefined>;
  isSector4LoadedRef: MutableRefObject<boolean>;
};

export function createSector4({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  walkableSurfacesRef,
  gltfLoader,
  forestGroundRef,
  isSector4LoadedRef,
}: Sector4Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  gltfLoader.load(
    '/forest.glb',
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(10, 10, 10);
      model.position.set(cellCenterX, 0, cellCenterZ);

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          if (child.name === 'forest_ground') { 
            forestGroundRef.current = child;
          }
        }
      });
      
      isSector4LoadedRef.current = true;
      sectorGroup.add(model);
    },
    undefined,
    (error) => {
      console.error('An error happened while loading the forest model:', error);
    }
  );

  return sectorGroup;
}
