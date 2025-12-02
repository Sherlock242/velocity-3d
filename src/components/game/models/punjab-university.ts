
import * as THREE from 'three';

export function createPunjabUniversity() {
  const library = new THREE.Group();
  library.name = 'LibraryBuilding';

  const concreteMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa, // Darker grey
    roughness: 0.8,
  });
  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x4d6a8b, // Blue color for fins
    roughness: 0.7,
  });
  const bottomFloorGlassMaterial = new THREE.MeshStandardMaterial({
    color: 0x4d6a8b,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.7,
  });
  const dividerMaterial = new THREE.MeshStandardMaterial({
    color: 0xbbbbbb,
    roughness: 0.8,
  });
  const mullionMaterial = new THREE.MeshStandardMaterial({
    color: 0xbbbbbb,
    roughness: 0.8,
  });
  const brownBaseMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513, // SaddleBrown
    roughness: 0.9,
  });

  const mainRadius = 80;
  const topRadius = 85;
  const floorHeight = 25; // Increased from 15
  const finHeight = floorHeight * 0.8;
  const numFins = 48; // For upper floors
  const numMullions = 24; // For lower floors
  const dividerHeight = 2;
  const dividerRadius = mainRadius + 1;
  const topDividerRadius = topRadius + 1;

  let currentY = 0;

  // Function to create a floor
  function createFloor(
    yPos: number,
    radius: number,
    isTopFloor = false,
    hasFins = true
  ) {
    const floorGroup = new THREE.Group();

    const floorGeom = new THREE.CylinderGeometry(radius, radius, floorHeight, 64);
    const floor = new THREE.Mesh(floorGeom, concreteMaterial);
    floor.position.y = yPos + floorHeight / 2;
    floorGroup.add(floor);

    if (hasFins) {
      // Upper floors with blue fins
      for (let j = 0; j < numFins; j++) {
        const angle = (j / numFins) * Math.PI * 2;

        const finGeom = new THREE.BoxGeometry(2, finHeight, 6);
        const fin = new THREE.Mesh(finGeom, finMaterial);
        const finX = Math.sin(angle) * (radius - 1);
        const finZ = Math.cos(angle) * (radius - 1);
        fin.position.set(finX, yPos + floorHeight / 2, finZ);
        fin.lookAt(0, yPos + floorHeight / 2, 0);
        floorGroup.add(fin);

        const windowGeom = new THREE.PlaneGeometry(
          (Math.PI * 2 * (radius - 4)) / numFins,
          finHeight * 0.9
        );
        const window = new THREE.Mesh(windowGeom, bottomFloorGlassMaterial);
        const windowX = Math.sin(angle) * (radius - 4);
        const windowZ = Math.cos(angle) * (radius - 4);
        window.position.set(windowX, yPos + floorHeight / 2, windowZ);
        window.lookAt(0, yPos + floorHeight / 2, 0);
        floorGroup.add(window);
      }
    } else {
      // Lower floors with concrete mullions
      for (let j = 0; j < numMullions; j++) {
        const angle = (j / numMullions) * Math.PI * 2;

        // Concrete Mullion (Divider)
        const mullionGeom = new THREE.BoxGeometry(3, floorHeight, 4);
        const mullion = new THREE.Mesh(mullionGeom, mullionMaterial);
        const mullionX = Math.sin(angle) * radius;
        const mullionZ = Math.cos(angle) * radius;
        mullion.position.set(mullionX, yPos + floorHeight / 2, mullionZ);
        mullion.lookAt(0, yPos + floorHeight / 2, 0);
        floorGroup.add(mullion);

        // Larger Glass Panes - push them forward slightly
        const windowAngle = ((j + 0.5) / numMullions) * Math.PI * 2;
        const windowWidth = (Math.PI * 2 * radius) / numMullions - 3; // Subtract mullion width
        const windowHeight = floorHeight * 0.95;
        const windowRadius = radius + 2.1; // Place it slightly outside the mullions to prevent z-fighting

        const windowGeom = new THREE.PlaneGeometry(windowWidth, windowHeight);
        const window = new THREE.Mesh(windowGeom, bottomFloorGlassMaterial);

        const windowX = Math.sin(windowAngle) * windowRadius;
        const windowZ = Math.cos(windowAngle) * windowRadius;

        window.position.set(windowX, yPos + floorHeight / 2, windowZ);
        // Make the window face outwards from the center
        window.lookAt(
          window.position.x * 2,
          yPos + floorHeight / 2,
          window.position.z * 2
        );
        floorGroup.add(window);
      }
    }

    const currentDividerRadius = isTopFloor
      ? topDividerRadius
      : dividerRadius;
    const dividerGeom = new THREE.CylinderGeometry(
      currentDividerRadius,
      currentDividerRadius,
      dividerHeight,
      64
    );
    const divider = new THREE.Mesh(dividerGeom, dividerMaterial);
    divider.position.y = yPos + floorHeight + dividerHeight / 2;
    floorGroup.add(divider);

    return floorGroup;
  }

  // Create the 4 floors
  const floor1 = createFloor(currentY, mainRadius, false, false);
  library.add(floor1);
  currentY += floorHeight + dividerHeight;

  const floor2 = createFloor(currentY, mainRadius, false, false);
  library.add(floor2);
  currentY += floorHeight + dividerHeight;

  const floor3 = createFloor(currentY, mainRadius, false, true);
  library.add(floor3);
  currentY += floorHeight + dividerHeight;

  const topFloor = createFloor(currentY, topRadius, true, true);
  library.add(topFloor);
  currentY += floorHeight + dividerHeight;

  // Top-most solid cylinder (Roof structure)
  const topCylinderGeom = new THREE.CylinderGeometry(
    topRadius,
    topRadius,
    floorHeight * 0.5,
    64
  );
  const topCylinder = new THREE.Mesh(topCylinderGeom, concreteMaterial);
  topCylinder.position.y = currentY + (floorHeight * 0.5) / 2;
  library.add(topCylinder);

  // --- Base ---
  const baseHeight = 5; // Made slimmer
  const baseRadius = topRadius + 5; // Slightly wider than the top floor
  const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 64);
  const baseMesh = new THREE.Mesh(baseGeometry, brownBaseMaterial);
  baseMesh.position.y = baseHeight / 2;
  library.add(baseMesh); // Add base to the library building collider

  // Position original library on top of the base
  library.position.y = 0; // The base is now part of the library itself

  // --- Ramp and Walkable Surfaces Group ---
  const walkableGroup = new THREE.Group();
  walkableGroup.name = 'WalkableRamp';


  // --- Spiral Ramp ---
  const rampRadius = mainRadius + 10;
  const rampWidth = 20;
  const rampWallHeight = 8;
  const rampTotalHeight = (floorHeight + dividerHeight) * 4;
  const rampSegments = 256;
  const rampStartAngle = Math.PI * 0.5;
  const rampAngleSweep = Math.PI * 3.5; 

  class CustomSpiralCurve extends THREE.Curve<THREE.Vector3> {
    scale: number;
    taper: boolean;

    constructor(scale = 1, taper = false) {
      super();
      this.scale = scale;
      this.taper = taper;
    }

    getPoint(t: number): THREE.Vector3 {
      const angle = rampStartAngle + t * rampAngleSweep;
      const x = Math.cos(angle) * rampRadius;
      
      let y = t * rampTotalHeight;
      const taperEnd = 0.1; // Taper over the first 10% of the ramp
      const taperStart = 0.9; // Taper down over the last 10%
      if (this.taper) {
          if (t < taperEnd) {
              const taperFactor = t / taperEnd;
              y = taperFactor * (taperEnd * rampTotalHeight);
          } else if (t > taperStart) {
              const taperFactor = (1 - t) / taperEnd; // Same as taperEnd since (1-taperStart) = taperEnd
              y = rampTotalHeight - (taperFactor * (taperEnd * rampTotalHeight));
          }
      }
      
      const z = Math.sin(angle) * rampRadius;
      return new THREE.Vector3(x, y, z).multiplyScalar(this.scale);
    }
  }

  const rampPath = new CustomSpiralCurve(1, true);
  const rampVertices = [];
  const rampFaces = [];
  const segments = 128;
  const wallHeight = 4;
  const rampHalfWidth = rampWidth / 2;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = rampPath.getPoint(t);
    const tangent = rampPath.getTangent(t).normalize();
    const normal = new THREE.Vector3(0, 1, 0); // Simplified normal
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
  
    // Tapering logic for wall height
    let currentWallHeight = wallHeight;
    const taperLength = 0.1; // Taper over 10% of the ramp at start and end
    if (t < taperLength) {
      currentWallHeight = THREE.MathUtils.lerp(0, wallHeight, t / taperLength);
    } else if (t > 1 - taperLength) {
      currentWallHeight = THREE.MathUtils.lerp(0, wallHeight, (1 - t) / taperLength);
    }
  
    // Inner wall top/bottom
    const innerBottom = point.clone().add(binormal.clone().multiplyScalar(-rampHalfWidth));
    const innerTop = innerBottom.clone().add(normal.clone().multiplyScalar(currentWallHeight));
  
    // Outer wall top/bottom
    const outerBottom = point.clone().add(binormal.clone().multiplyScalar(rampHalfWidth));
    const outerTop = outerBottom.clone().add(normal.clone().multiplyScalar(currentWallHeight));
  
    // Road surface points
    const roadInner = innerBottom.clone();
    const roadOuter = outerBottom.clone();
  
    rampVertices.push(
      innerBottom, innerTop, outerBottom, outerTop, roadInner, roadOuter
    );
  
    if (i > 0) {
      const base = (i - 1) * 6;
      // Indices for one segment of the ramp walls and road
      // Outer wall
      rampFaces.push(base + 3, base + 2, base + 8); // tri 1
      rampFaces.push(base + 3, base + 8, base + 9); // tri 2
      // Inner wall
      rampFaces.push(base + 0, base + 1, base + 7);
      rampFaces.push(base + 0, base + 7, base + 6);
      // Road surface
      rampFaces.push(base + 4, base + 5, base + 11);
      rampFaces.push(base + 4, base + 11, base + 10);
    }
  }
  
  const rampGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(rampVertices.length * 3);
  for (let i = 0; i < rampVertices.length; i++) {
    positions[i * 3] = rampVertices[i].x;
    positions[i * 3 + 1] = rampVertices[i].y;
    positions[i * 3 + 2] = rampVertices[i].z;
  }
  
  rampGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  rampGeometry.setIndex(rampFaces);
  rampGeometry.computeVertexNormals();

  const rampMesh = new THREE.Mesh(rampGeometry, concreteMaterial);
  rampMesh.material.side = THREE.DoubleSide; // Make ramp visible from all angles
  rampMesh.name = 'universityRamp';
  
  walkableGroup.add(rampMesh);

  // --- Landing Platform ---
  const landingRadius = rampWidth / 2;
  const landingGeom = new THREE.CircleGeometry(landingRadius, 32);
  const landingPlatform = new THREE.Mesh(landingGeom, concreteMaterial);
  
  const endPoint = rampPath.getPoint(1);
  landingPlatform.position.copy(endPoint);

  // Rotate to align with ramp end
  const tangent = rampPath.getTangent(1).normalize();
  
  const landingAngle = Math.atan2(tangent.x, tangent.z);
  
  landingPlatform.rotation.x = -Math.PI / 2; // Lay it flat
  landingPlatform.rotation.z = -landingAngle + Math.PI / 2;

  walkableGroup.add(landingPlatform);


  const universityWithBase = new THREE.Group();
  universityWithBase.add(library, walkableGroup);
  universityWithBase.scale.set(1.5, 1.5, 1.5);
  
  return { university: universityWithBase, library, walkableGroup };
}
