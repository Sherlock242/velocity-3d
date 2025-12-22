
import * as THREE from 'three';
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { MutableRefObject } from 'react';

type Sector4Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  walkableSurfacesRef: MutableRefObject<(THREE.Group | THREE.Mesh)[]>;
  gltfLoader: GLTFLoader;
};

export function createSector4({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  walkableSurfacesRef,
  gltfLoader,
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
          // Tag each mesh as part of the forest for the collision handler
          child.userData.isForest = true; 
          staticCollidersRef.current.push(child as any);
        }
      });
      
      // The entire model is added as a walkable surface for the ramp/raycaster logic.
      walkableSurfacesRef.current.push(model);
      sectorGroup.add(model);
    },
    undefined,
    (error) => {
      console.error('An error happened while loading the forest model:', error);
    }
  );

  return sectorGroup;
}
