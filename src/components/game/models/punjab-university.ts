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
  const floorHeight = 15;
  const finHeight = floorHeight * 0.8;
  const numFins = 48;

  // --- Layered construction for accuracy ---

  // Layer 0: Ground Floor (Columns)
  const groundFloorY = 0;
  const numColumns = 12;
  for (let i = 0; i < numColumns; i++) {
    const angle = (i / numColumns) * Math.PI * 2;
    const x = Math.sin(angle) * (mainRadius * 0.9);
    const z = Math.cos(angle) * (mainRadius * 0.9);
    const columnGeom = new THREE.CylinderGeometry(4, 4, floorHeight, 16);
    const column = new THREE.Mesh(columnGeom, darkConcreteMaterial);
    column.position.set(x, groundFloorY + floorHeight / 2, z);
    library.add(column);
  }

  // Layer 1: First main floor
  const floor1Y = groundFloorY + floorHeight;
  const floor1Geom = new THREE.CylinderGeometry(mainRadius, mainRadius, floorHeight, 64);
  const floor1 = new THREE.Mesh(floor1Geom, concreteMaterial);
  floor1.position.y = floor1Y + floorHeight / 2;
  library.add(floor1);

  // Layer 2: Second main floor (with ramp/balcony)
  const floor2Y = floor1Y + floorHeight;
  const floor2Geom = new THREE.CylinderGeometry(mainRadius, mainRadius, floorHeight, 64);
  const floor2 = new THREE.Mesh(floor2Geom, concreteMaterial);
  floor2.position.y = floor2Y + floorHeight / 2;
  library.add(floor2);
  
  // Fins and windows for the two main floors
  [floor1Y, floor2Y].forEach(yPos => {
     for (let j = 0; j < numFins; j++) {
        const angle = (j / numFins) * Math.PI * 2;
        
        // Fins
        const finGeom = new THREE.BoxGeometry(2, finHeight, 6);
        const fin = new THREE.Mesh(finGeom, concreteMaterial);
        const finX = Math.sin(angle) * (mainRadius - 5);
        const finZ = Math.cos(angle) * (mainRadius - 5);
        fin.position.set(finX, yPos + floorHeight / 2, finZ);
        fin.lookAt(0, yPos + floorHeight / 2, 0);
        library.add(fin);

        // Windows
        const windowGeom = new THREE.BoxGeometry(4, finHeight * 0.9, 1);
        const window = new THREE.Mesh(windowGeom, glassMaterial);
        const windowX = Math.sin(angle) * (mainRadius - 8);
        const windowZ = Math.cos(angle) * (mainRadius - 8);
        window.position.set(windowX, yPos + floorHeight / 2, windowZ);
        window.lookAt(0, yPos + floorHeight / 2, 0);
        library.add(window);
      }
  });


  // Layer 3: Overhanging Top Floor
  const floor3Y = floor2Y + floorHeight;
  const floor3Geom = new THREE.CylinderGeometry(topRadius, topRadius, floorHeight, 64);
  const floor3 = new THREE.Mesh(floor3Geom, concreteMaterial);
  floor3.position.y = floor3Y + floorHeight/2;
  library.add(floor3);
  
  // Fins for top floor
  for (let j = 0; j < numFins; j++) {
    const angle = (j / numFins) * Math.PI * 2;
    const finX = Math.sin(angle) * (topRadius - 5);
    const finZ = Math.cos(angle) * (topRadius - 5);

    const finGeom = new THREE.BoxGeometry(2, finHeight, 4);
    const fin = new THREE.Mesh(finGeom, concreteMaterial);
    fin.position.set(finX, floor3Y + floorHeight/2, finZ);
    fin.lookAt(0, floor3Y + floorHeight/2, 0);
    library.add(fin);
  }


  // Layer 4: Top-most cylinder
  const topCylinderY = floor3Y + floorHeight;
  const topCylinderGeom = new THREE.CylinderGeometry(topRadius, topRadius, floorHeight * 0.75, 64);
  const topCylinder = new THREE.Mesh(topCylinderGeom, darkConcreteMaterial);
  topCylinder.position.y = topCylinderY + (floorHeight*0.75)/2;
  library.add(topCylinder);


  // Spiral Ramp
  const rampRadius = mainRadius;
  const rampWidth = 20;
  const rampHeight = floorHeight; 
  const rampSegments = 64;
  const rampAngle = Math.PI * 1.5;

  const rampPoints = [];
  for (let i = 0; i <= rampSegments; i++) {
    const ratio = i / rampSegments;
    const angle = ratio * rampAngle;
    const x = Math.cos(angle) * (rampRadius + rampWidth/2);
    const y = ratio * rampHeight + floorHeight * 1.5; // Starts from floor 1, ends at floor 2
    const z = Math.sin(angle) * (rampRadius + rampWidth/2);
    rampPoints.push(new THREE.Vector3(x, y, z));
  }
  const rampCurve = new THREE.CatmullRomCurve3(rampPoints);
  const rampGeom = new THREE.TubeGeometry(rampCurve, rampSegments, rampWidth, 8, false);
  const rampMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  const rampMesh = new THREE.Mesh(rampGeom, rampMaterial);
  rampMesh.scale.y = 0.1; // Flatten tube to ramp
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
