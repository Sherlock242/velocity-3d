import * as THREE from 'three';

export function createPunjabUniversity() {
  const library = new THREE.Group();

  const concreteMaterial = new THREE.MeshStandardMaterial({
    color: 0xbbbbbb, // Realistic concrete grey
    roughness: 0.8,
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x87ceeb, // Light Sky Blue
    roughness: 0.2,
    metalness: 0.5,
    transparent: true,
    opacity: 0.7,
  });
  const rampMaterial = new THREE.MeshStandardMaterial({
    color: 0xb0b0b0, // A slightly darker gray for the ramp
    roughness: 0.8,
  });
  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x4d6a8b, // Blue color for the fins
    roughness: 0.7,
  });
  const dividerMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa, // Slightly different grey for dividers
    roughness: 0.8,
  });

  const mainRadius = 80;
  const topRadius = 85;
  const floorHeight = 15;
  const finHeight = floorHeight * 0.8;
  const numFins = 48;
  const dividerHeight = 2;
  const dividerRadius = mainRadius + 1;
  const topDividerRadius = topRadius + 1;


  // --- Layered construction for accuracy ---
  let currentY = 0;

  // Function to create a floor with fins, windows, and a divider above it
  function createFloor(yPos: number, radius: number, isTopFloor = false) {
    const floorGroup = new THREE.Group();

    // The main cylinder of the floor
    const floorGeom = new THREE.CylinderGeometry(radius, radius, floorHeight, 64);
    const floor = new THREE.Mesh(floorGeom, concreteMaterial);
    floor.position.y = yPos + floorHeight / 2;
    floorGroup.add(floor);

    // Fins and windows for the floor
    for (let j = 0; j < numFins; j++) {
        const angle = (j / numFins) * Math.PI * 2;
        
        // Fins
        const finGeom = new THREE.BoxGeometry(2, finHeight, 6);
        const fin = new THREE.Mesh(finGeom, finMaterial);
        const finX = Math.sin(angle) * (radius - 1);
        const finZ = Math.cos(angle) * (radius - 1);
        fin.position.set(finX, yPos + floorHeight / 2, finZ);
        fin.lookAt(0, yPos + floorHeight / 2, 0);
        floorGroup.add(fin);

        // Windows
        const windowGeom = new THREE.PlaneGeometry(Math.PI * 2 * (radius-4) / numFins, finHeight * 0.9);
        const window = new THREE.Mesh(windowGeom, glassMaterial);
        const windowX = Math.sin(angle) * (radius - 4);
        const windowZ = Math.cos(angle) * (radius - 4);
        window.position.set(windowX, yPos + floorHeight / 2, windowZ);
        window.lookAt(0, yPos + floorHeight / 2, 0);
        floorGroup.add(window);
    }

    // Divider slab on top of the floor
    const currentDividerRadius = isTopFloor ? topDividerRadius : dividerRadius;
    const dividerGeom = new THREE.CylinderGeometry(currentDividerRadius, currentDividerRadius, dividerHeight, 64);
    const divider = new THREE.Mesh(dividerGeom, dividerMaterial);
    divider.position.y = yPos + floorHeight + dividerHeight / 2;
    floorGroup.add(divider);

    return floorGroup;
  }
  
  // Create 3 main floors
  for (let i = 0; i < 3; i++) {
    const floor = createFloor(currentY, mainRadius);
    library.add(floor);
    currentY += floorHeight + dividerHeight;
  }
  
  // Layer 3: Overhanging Top Floor
  const topFloor = createFloor(currentY, topRadius, true);
  library.add(topFloor);
  currentY += floorHeight + dividerHeight;

  // Layer 4: Top-most solid cylinder (Roof structure)
  const topCylinderGeom = new THREE.CylinderGeometry(topRadius, topRadius, floorHeight * 0.5, 64);
  const topCylinder = new THREE.Mesh(topCylinderGeom, concreteMaterial);
  topCylinder.position.y = currentY + (floorHeight*0.5)/2;
  library.add(topCylinder);


  // --- Spiral Ramp ---
  const rampRadius = mainRadius + 10;
  const rampWidth = 20;
  const rampWallHeight = 8;
  const rampTotalHeight = (floorHeight + dividerHeight) * 3; // Ramp goes up to floor 3
  const rampSegments = 256;
  const rampStartAngle = Math.PI * 0.5;
  const rampAngleSweep = Math.PI * 2.25;

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
    extrudePath: rampPath
  };

  const rampGeometry = new THREE.ExtrudeGeometry(rampShape, extrudeSettings);
  const rampMesh = new THREE.Mesh(rampGeometry, rampMaterial);
  library.add(rampMesh);


  // Balcony section that cuts into the ramp
  const balcony = new THREE.Group();
  const balconyFloorY = (floorHeight + dividerHeight) * 1 + floorHeight / 2;
  const balconyFloorGeom = new THREE.BoxGeometry(30, 2, 40);
  const balconyFloor = new THREE.Mesh(balconyFloorGeom, concreteMaterial);
  balconyFloor.position.set(mainRadius-15, balconyFloorY + 5, 20);
  balcony.add(balconyFloor);

  const balconyWallGeom = new THREE.BoxGeometry(30, 8, 2);
  const balconyWall = new THREE.Mesh(balconyWallGeom, concreteMaterial);
  balconyWall.position.set(mainRadius - 15, balconyFloorY + 9, 40);
  balcony.add(balconyWall);

  library.add(balcony);

  library.scale.set(1.5, 1.5, 1.5);
  return library;
}
