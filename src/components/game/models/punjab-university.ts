import * as THREE from 'three';

export function createPunjabUniversity() {
  const library = new THREE.Group();

  const concreteMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.8,
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x6fa8dc, // A more distinct blue for the glass
    roughness: 0.3,
    metalness: 0.2,
    transparent: true,
    opacity: 0.7,
  });

  const mainRadius = 80;
  const topRadius = 85;
  const floorHeight = 15;
  const finHeight = floorHeight * 0.8;
  const numFins = 48;

  // --- Layered construction for accuracy ---

  // Layer 0: Ground Floor (Solid Cylinder)
  const groundFloorY = 0;
  const groundFloorGeom = new THREE.CylinderGeometry(mainRadius, mainRadius, floorHeight, 64);
  const groundFloor = new THREE.Mesh(groundFloorGeom, concreteMaterial);
  groundFloor.position.y = groundFloorY + floorHeight / 2;
  library.add(groundFloor);
  
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
        const finX = Math.sin(angle) * (mainRadius - 1);
        const finZ = Math.cos(angle) * (mainRadius - 1);
        fin.position.set(finX, yPos + floorHeight / 2, finZ);
        fin.lookAt(0, yPos + floorHeight / 2, 0);
        library.add(fin);

        // Windows
        const windowGeom = new THREE.PlaneGeometry(Math.PI * 2 * (mainRadius-4) / numFins, finHeight * 0.9);
        const window = new THREE.Mesh(windowGeom, glassMaterial);
        const windowX = Math.sin(angle) * (mainRadius - 4);
        const windowZ = Math.cos(angle) * (mainRadius - 4);
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
    
    // Fins
    const finGeom = new THREE.BoxGeometry(2, finHeight, 4);
    const fin = new THREE.Mesh(finGeom, concreteMaterial);
    const finX = Math.sin(angle) * (topRadius - 1);
    const finZ = Math.cos(angle) * (topRadius - 1);
    fin.position.set(finX, floor3Y + floorHeight/2, finZ);
    fin.lookAt(0, floor3Y + floorHeight/2, 0);
    library.add(fin);

    // Windows
    const windowGeom = new THREE.PlaneGeometry(Math.PI * 2 * (topRadius-4) / numFins, finHeight * 0.9);
    const window = new THREE.Mesh(windowGeom, glassMaterial);
    const windowX = Math.sin(angle) * (topRadius-4);
    const windowZ = Math.cos(angle) * (topRadius-4);
    window.position.set(windowX, floor3Y + floorHeight/2, windowZ);
    window.lookAt(0, floor3Y + floorHeight/2, 0);
    library.add(window);
  }


  // Layer 4: Top-most solid cylinder
  const topCylinderY = floor3Y + floorHeight;
  const topCylinderGeom = new THREE.CylinderGeometry(topRadius, topRadius, floorHeight * 0.75, 64);
  const topCylinder = new THREE.Mesh(topCylinderGeom, concreteMaterial);
  topCylinder.position.y = topCylinderY + (floorHeight*0.75)/2;
  library.add(topCylinder);


  // --- Spiral Ramp ---
  const rampGroup = new THREE.Group();
  const rampRadius = mainRadius + 10;
  const rampWidth = 20;
  const rampHeight = floorHeight * 4; // Total height of the ramp
  const rampSegments = 256;
  const rampStartAngle = Math.PI * 0.5;
  const rampAngleSweep = Math.PI * 2.5; // Controls how many times it wraps

  class CustomSpiralCurve extends THREE.Curve<THREE.Vector3> {
    scale: number;
    constructor(scale = 1) {
      super();
      this.scale = scale;
    }
  
    getPoint(t: number): THREE.Vector3 {
      const angle = rampStartAngle + t * rampAngleSweep;
      const x = Math.cos(angle) * rampRadius;
      const y = t * rampHeight;
      const z = Math.sin(angle) * rampRadius;
      return new THREE.Vector3(x, y, z).multiplyScalar(this.scale);
    }
  }

  const rampPath = new CustomSpiralCurve(1);

  const rampGeometry = new THREE.TubeGeometry(rampPath, rampSegments, rampWidth / 2, 8, false);
  const rampMesh = new THREE.Mesh(rampGeometry, concreteMaterial);
  rampGroup.add(rampMesh);

  library.add(rampGroup);


  // Balcony section that cuts into the ramp
  const balcony = new THREE.Group();
  const balconyFloorGeom = new THREE.BoxGeometry(30, 2, 40);
  const balconyFloor = new THREE.Mesh(balconyFloorGeom, concreteMaterial);
  balconyFloor.position.set(mainRadius-15, floorHeight * 2, 20);
  balcony.add(balconyFloor);

  const balconyWallGeom = new THREE.BoxGeometry(30, 8, 2);
  const balconyWall = new THREE.Mesh(balconyWallGeom, concreteMaterial);
  balconyWall.position.set(mainRadius - 15, floorHeight * 2 + 4, 40);
  balcony.add(balconyWall);

  library.add(balcony);

  library.scale.set(1.5, 1.5, 1.5);
  return library;
}
