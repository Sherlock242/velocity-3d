import * as THREE from 'three';

export function createPunjabUniversity() {
  const library = new THREE.Group();

  const concreteMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.8,
  });
  const darkConcreteMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    roughness: 0.9,
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x88aacc,
    roughness: 0.3,
    metalness: 0.2,
  });

  const mainRadius = 80;
  const topRadius = 85;
  const numFloors = 4;
  const floorHeight = 15;
  const finHeight = floorHeight * 0.8;
  const numFins = 48;

  // Create floors
  for (let i = 0; i < numFloors; i++) {
    const yPos = i * floorHeight;
    const floorRadius = i === numFloors - 1 ? topRadius : mainRadius;

    // Main floor band
    const floorGeom = new THREE.CylinderGeometry(
      floorRadius,
      floorRadius,
      floorHeight,
      64
    );
    const floor = new THREE.Mesh(floorGeom, concreteMaterial);
    floor.position.y = yPos + floorHeight / 2;
    library.add(floor);

    // Create fins and windows for each floor
    if (i > 0 && i < numFloors - 1) {
      // No fins/windows on the ground or top-most band
      for (let j = 0; j < numFins; j++) {
        const angle = (j / numFins) * Math.PI * 2;
        const x = Math.sin(angle) * (mainRadius - 5);
        const z = Math.cos(angle) * (mainRadius - 5);

        // Fins
        const finGeom = new THREE.BoxGeometry(2, finHeight, 6);
        const fin = new THREE.Mesh(finGeom, concreteMaterial);
        fin.position.set(x, yPos + floorHeight / 2, z);
        fin.lookAt(0, yPos + floorHeight / 2, 0);
        library.add(fin);

        // Windows (behind fins)
        const windowGeom = new THREE.BoxGeometry(4, finHeight * 0.9, 1);
        const window = new THREE.Mesh(windowGeom, glassMaterial);
        // Position them slightly inside the fins
        const windowX = Math.sin(angle) * (mainRadius - 8);
        const windowZ = Math.cos(angle) * (mainRadius - 8);
        window.position.set(windowX, yPos + floorHeight / 2, windowZ);
        window.lookAt(0, yPos + floorHeight / 2, 0);
        library.add(window);
      }
    }
  }

  // Add top cylinder
  const topCylinderHeight = 15;
  const topCylinderRadius = 40;
  const topCylinderGeom = new THREE.CylinderGeometry(
    topCylinderRadius,
    topCylinderRadius,
    topCylinderHeight,
    64
  );
  const topCylinder = new THREE.Mesh(topCylinderGeom, darkConcreteMaterial);
  topCylinder.position.y = numFloors * floorHeight + topCylinderHeight / 2;
  library.add(topCylinder);

  // Ground floor columns
  const numColumns = 12;
  for (let i = 0; i < numColumns; i++) {
    const angle = (i / numColumns) * Math.PI * 2;
    const x = Math.sin(angle) * (mainRadius * 0.9);
    const z = Math.cos(angle) * (mainRadius * 0.9);
    const columnGeom = new THREE.CylinderGeometry(4, 4, floorHeight, 16);
    const column = new THREE.Mesh(columnGeom, darkConcreteMaterial);
    column.position.set(x, floorHeight / 2, z);
    library.add(column);
  }

  // Spiral Ramp
  const rampRadius = mainRadius + 20;
  const rampWidth = 20;
  const rampHeight = floorHeight * 2;
  const rampSegments = 64;
  const rampAngle = Math.PI * 1.5; // 3/4 circle

  const rampPoints = [];
  for (let i = 0; i <= rampSegments; i++) {
    const ratio = i / rampSegments;
    const angle = ratio * rampAngle;
    const x = Math.cos(angle) * (rampRadius - (ratio * rampWidth) / 2);
    const y = ratio * rampHeight + floorHeight; // Start from the second floor
    const z = Math.sin(angle) * (rampRadius - (ratio * rampWidth) / 2);
    rampPoints.push(new THREE.Vector3(x, y, z));
  }
  const rampCurve = new THREE.CatmullRomCurve3(rampPoints);
  const rampGeom = new THREE.TubeGeometry(
    rampCurve,
    rampSegments,
    rampWidth,
    8,
    false
  );
  const rampMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  const rampMesh = new THREE.Mesh(rampGeom, rampMaterial);
  // Flatten the tube to make it look like a ramp
  rampMesh.scale.y = 0.1;
  rampMesh.position.y += 3;
  library.add(rampMesh);

  // Balcony section that cuts into the ramp
  const balcony = new THREE.Group();
  const balconyFloorGeom = new THREE.BoxGeometry(40, 2, 20);
  const balconyFloor = new THREE.Mesh(balconyFloorGeom, darkConcreteMaterial);
  balconyFloor.position.set(mainRadius - 10, floorHeight * 2, 0);
  balcony.add(balconyFloor);

  const balconyWallGeom = new THREE.BoxGeometry(2, 10, 20);
  const balconyWall = new THREE.Mesh(balconyWallGeom, concreteMaterial);
  balconyWall.position.set(mainRadius - 20, floorHeight * 2 + 5, 0);
  balcony.add(balconyWall);

  library.add(balcony);

  library.scale.set(1.5, 1.5, 1.5);
  return library;
}
