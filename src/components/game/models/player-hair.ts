
import * as THREE from 'three';

// Helper function to create a single "chunky" hair clump, now as a cone
function createHairClump(length: number, width: number, material: THREE.Material) {
    const geometry = new THREE.ConeGeometry(width * 0.5, length, 4, 1);
    const clump = new THREE.Mesh(geometry, material);
    clump.geometry.translate(0, length / 2, 0); // Position pivot at the base
    return clump;
}

export function createHair(headRadius: number, hairMaterial: THREE.Material) {
    const hairGroup = new THREE.Group();
    const allGeometries: THREE.BufferGeometry[] = [];
    
    // Layers are defined to control hair placement, size, and flow
    const layers = [
        // Main volume on top and upper back (previously front)
        { count: 6000, length: 0.35, width: 0.15, yRange: [0.1, 0.8], zRange: [-0.8, 0.6], xRange: [-1.0, 1.0], rotX: 1.2, seed: 1 },
        // Smaller side layer
        { count: 11000, length: 0.18, width: 0.09, yRange: [-0.2, 0.6], zRange: [-0.2, 0.2], xRange: [-0.9, 0.9], rotX: 1.1, seed: 2 },
        // Base layer for back and lower sides (previously back)
        { count: 10000, length: 0.2, width: 0.1, yRange: [-0.8, 0.5], zRange: [-1.0, 0.0], xRange: [-0.85, 0.85], rotX: 1.2, seed: 3 },
    ];

    layers.forEach(layer => {
        let seed = layer.seed;
        const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        for (let i = 0; i < layer.count; i++) {
            const length = layer.length;
            const width = layer.width;
            const clump = createHairClump(length, width, hairMaterial);

            // Position on a sphere
            const pos = new THREE.Vector3(
                (random() - 0.5) * 2,
                (random() - 0.5) * 2,
                (random() - 0.5) * 2
            ).normalize().multiplyScalar(headRadius);
            
            // Constrain to Y, Z, and X ranges to shape the hair
            pos.y = THREE.MathUtils.clamp(pos.y, layer.yRange[0], layer.yRange[1]);
            pos.z = THREE.MathUtils.clamp(pos.z, layer.zRange[0], layer.zRange[1]);
            pos.x = THREE.MathUtils.clamp(pos.x, layer.xRange[0], layer.xRange[1]);

            clump.position.copy(pos);

            // Orient the clump to flow away from the origin
            const direction = clump.position.clone().normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            clump.quaternion.copy(quaternion);

            // Add extra downward rotation for gravity and styling
            let rotX = layer.rotX * Math.PI; 
            rotX += (random() - 0.5) * 0.4; // Randomize flow
            
            clump.rotateX(rotX);
            
            clump.updateMatrix();
            const clonedGeom = clump.geometry.clone();
            clonedGeom.applyMatrix4(clump.matrix);
            allGeometries.push(clonedGeom);
        }
    });

    if (allGeometries.length > 0) {
        const mergedGeometry = mergeGeometries(allGeometries);
        const combinedHairMesh = new THREE.Mesh(mergedGeometry, hairMaterial);
        hairGroup.add(combinedHairMesh);
    }

    hairGroup.rotation.y = Math.PI; // Orient hair correctly on head

    return hairGroup;
}


// A simplified, manual implementation of BufferGeometryUtils.mergeGeometries
function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const mergedGeometry = new THREE.BufferGeometry();

  let totalVertices = 0;
  let totalIndices = 0;
  
  geometries.forEach(geometry => {
    if (geometry.attributes.position) {
        totalVertices += geometry.attributes.position.count;
    }
    if (geometry.index) {
      totalIndices += geometry.index.count;
    } else if (geometry.attributes.position) {
      totalIndices += geometry.attributes.position.count;
    }
  });

  const mergedPositions = new Float32Array(totalVertices * 3);
  const mergedNormals = new Float32Array(totalVertices * 3);
  const mergedUvs = new Float32Array(totalVertices * 2);
  const mergedIndices = totalIndices > 0 ? new Uint32Array(totalIndices) : undefined;

  let vertexOffset = 0;
  let indexOffset = 0;

  geometries.forEach(geometry => {
    if (!geometry.attributes.position) return;

    const positionAttr = geometry.attributes.position;
    mergedPositions.set(positionAttr.array, vertexOffset * 3);

    const normalAttr = geometry.attributes.normal;
    if (normalAttr) {
        mergedNormals.set(normalAttr.array, vertexOffset * 3);
    }
    
    const uvAttr = geometry.attributes.uv;
    if (uvAttr) {
        mergedUvs.set(uvAttr.array, vertexOffset * 2);
    }

    if (geometry.index) {
      const indexAttr = geometry.index;
      for (let i = 0; i < indexAttr.count; i++) {
        mergedIndices![indexOffset + i] = indexAttr.getX(i) + vertexOffset;
      }
      indexOffset += indexAttr.count;
    } else {
        // Handle non-indexed geometries by creating indices
        for (let i = 0; i < positionAttr.count; i++) {
            mergedIndices![indexOffset + i] = vertexOffset + i;
        }
        indexOffset += positionAttr.count;
    }

    vertexOffset += positionAttr.count;
  });

  mergedGeometry.setAttribute('position', new THREE.BufferAttribute(mergedPositions, 3));
  mergedGeometry.setAttribute('normal', new THREE.BufferAttribute(mergedNormals, 3));
  mergedGeometry.setAttribute('uv', new THREE.BufferAttribute(mergedUvs, 2));
  
  if (mergedIndices) {
    mergedGeometry.setIndex(new THREE.BufferAttribute(mergedIndices, 1));
  }
  
  if(totalIndices > 0 && totalIndices < 65535 * 3 && !mergedGeometry.index) {
      // If we don't have an index, we should compute one.
      const indices = [];
      for(let i = 0; i < totalVertices; i+=3) {
          indices.push(i, i+1, i+2);
      }
      mergedGeometry.setIndex(indices);
  }

  mergedGeometry.computeVertexNormals();

  return mergedGeometry;
}
