import * as THREE from 'three';

export function createPunjabUniversity() {
  const library = new THREE.Group();

  const concreteMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa, // Darker grey
    roughness: 0.8,
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x4d6a8b, // Light Blue
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.5,
  });
  const bottomFloorGlassMaterial = new THREE.MeshBasicMaterial({
    color: 0x4d6a8b, // Simple, pure blue. Not affected by lighting.
  });
  const rampMaterial = new THREE.MeshStandardMaterial({
    color: 0xb0b0b0,
    roughness: 0.8,
  });
  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x4d6a8b, // Blue color for fins
    roughness: 0.7,
  });
  const dividerMaterial = new THREE.MeshStandardMaterial({
    color: 0xbbbbbb,
    roughness: 0.8,
  });
  const mullionMaterial = new THREE.MeshStandardMaterial({
    color: 0xbbbbbb,
    roughness: 0.8,
  });

  const mainRadius = 80;
  const topRadius = 85;
  const floorHeight = 15;
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
        const window = new THREE.Mesh(windowGeom, glassMaterial);
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

        // Larger Glass Panes
        const windowAngle = ((j + 0.5) / numMullions) * Math.PI * 2;
        const windowWidth = (Math.PI * 2 * radius) / numMullions - 3; // Subtract mullion width
        const windowHeight = floorHeight * 0.95;
        const windowRadius = radius + 0.1; // Place it slightly outside the mullions

        const windowGeom = new THREE.PlaneGeometry(windowWidth, windowHeight);
        const window = new THREE.Mesh(windowGeom, bottomFloorGlassMaterial);

        const windowX = Math.sin(windowAngle) * windowRadius;
        const windowZ = Math.cos(windowAngle) * windowRadius;
        
        window.position.set(windowX, yPos + floorHeight / 2, windowZ);
        // Make the window face outwards from the center
        window.lookAt(
          mullion.position.x * 2,
          yPos + floorHeight / 2,
          mullion.position.z * 2
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

  // --- Spiral Ramp ---
  const rampRadius = mainRadius + 10;
  const rampWidth = 20;
  const rampWallHeight = 8;
  const rampTotalHeight = (floorHeight + dividerHeight) * 4;
  const rampSegments = 256;
  const rampStartAngle = Math.PI * 0.5;
  const rampAngleSweep = Math.PI * 2.5;

  class CustomSpiralCurve extends THREE.Curve<THREE.Vector3> {
    scale: number;
    constructor(scale = 1) {
      super();
      this.scale = scale;
    }

    getPoint(t: number): THREE.Vector3 {
      const angle = rampStartAngle + t * rampAngleSweep;
      const x = Math.cos(angle) * rampRadius;
      const y = t * rampTotalHeight;
      const z = Math.sin(angle) * rampRadius;
      return new THREE.Vector3(x, y, z).multiplyScalar(this.scale);
    }
  }

  const rampPath = new CustomSpiralCurve(1);

  const rampShape = new THREE.Shape();
  const halfWidth = rampWidth / 2;
  rampShape.moveTo(-halfWidth, 0);
  rampShape.lineTo(halfWidth, 0);
  rampShape.lineTo(halfWidth, rampWallHeight);
  rampShape.lineTo(-halfWidth, rampWallHeight);
  rampShape.lineTo(-halfWidth, 0);

  const extrudeSettings = {
    steps: rampSegments,
    extrudePath: rampPath,
  };

  const rampGeometry = new THREE.ExtrudeGeometry(rampShape, extrudeSettings);
  const rampMesh = new THREE.Mesh(rampGeometry, rampMaterial);
  library.add(rampMesh);

  // Balcony section
  const balcony = new THREE.Group();
  const balconyFloorY = (floorHeight + dividerHeight) * 1 + floorHeight / 2;
  const balconyFloorGeom = new THREE.BoxGeometry(30, 2, 40);
  const balconyFloor = new THREE.Mesh(balconyFloorGeom, concreteMaterial);
  balconyFloor.position.set(mainRadius - 15, balconyFloorY + 5, 20);
  balcony.add(balconyFloor);

  const balconyWallGeom = new THREE.BoxGeometry(30, 8, 2);
  const balconyWall = new THREE.Mesh(balconyWallGeom, concreteMaterial);
  balconyWall.position.set(mainRadius - 15, balconyFloorY + 9, 40);
  balcony.add(balconyWall);

  library.add(balcony);

  library.scale.set(1.5, 1.5, 1.5);
  return library;
}
