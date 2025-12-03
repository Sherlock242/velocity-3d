
import * as THREE from 'three';

export function createCollegeBuilding() {
  const collegeGroup = new THREE.Group();
  collegeGroup.name = 'collegeBuildingWrapper';

  const longWingWidth = 400;
  const shortWingWidth = 250;
  const wingDepth = 30;
  const numFloors = 4;
  const floorHeight = 30;

  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.8 });
  const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.7 });
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x55903c });

  function createWing(width: number, depth: number) {
      const wing = new THREE.Group();

      for (let i = 0; i < numFloors; i++) {
          const yPos = i * floorHeight;
          const floorGroup = new THREE.Group();
          floorGroup.position.y = yPos;

          // Solid walls for front and back
          const wallGeom = new THREE.BoxGeometry(width, floorHeight, depth);
          const mainWall = new THREE.Mesh(wallGeom, redMaterial);
          mainWall.position.y = floorHeight / 2;
          floorGroup.add(mainWall);

          // Details for the front-facing (courtyard) side
          const frontBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 1, 1.2), yellowMaterial);
          frontBorder.position.set(0, floorHeight - 5, depth / 2 + 0.1);
          floorGroup.add(frontBorder);
          
          const numPillars = Math.floor(width / 20);
          for (let j = 0; j < numPillars; j++) {
              const pillarGeom = new THREE.BoxGeometry(4, floorHeight, 4);
              const pillar = new THREE.Mesh(pillarGeom, yellowMaterial);
              const xPos = -width/2 + 10 + j * 20;
              pillar.position.set(xPos, floorHeight / 2, depth / 2 + 2);
              floorGroup.add(pillar);
          }
          
          // Details for the back-facing (exterior) side
          const backBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 1, 1.2), yellowMaterial);
          backBorder.position.set(0, floorHeight - 5, -depth / 2 - 0.1);
          floorGroup.add(backBorder);
          
          for (let j = 0; j < numPillars; j++) {
              const pillarGeom = new THREE.BoxGeometry(4, floorHeight, 4);
              const pillar = new THREE.Mesh(pillarGeom, yellowMaterial);
              const xPos = -width/2 + 10 + j * 20;
              pillar.position.set(xPos, floorHeight / 2, -depth / 2 - 2);
              floorGroup.add(pillar);
          }
          wing.add(floorGroup);
      }
      return wing;
  }
  
  const courtyardWidth = longWingWidth - wingDepth * 2;
  const courtyardDepth = shortWingWidth - wingDepth * 2;
  
  const college = new THREE.Group();
  college.name = 'collegeBuilding';

  // Back Wing (long)
  const backWing = createWing(longWingWidth, wingDepth);
  backWing.position.z = -shortWingWidth / 2;
  backWing.name = 'backWing';
  college.add(backWing);
  
  // Front Wing (long)
  const frontWing = createWing(longWingWidth, wingDepth);
  frontWing.position.z = shortWingWidth / 2;
  frontWing.name = 'frontWing';
  college.add(frontWing);

  // Left Wing (short)
  const leftWing = createWing(shortWingWidth, wingDepth);
  leftWing.position.x = -longWingWidth / 2;
  leftWing.rotation.y = Math.PI / 2;
  leftWing.name = 'leftWing';
  college.add(leftWing);
  
  // Right Wing (short)
  const rightWing = createWing(shortWingWidth, wingDepth);
  rightWing.position.x = longWingWidth / 2;
  rightWing.rotation.y = -Math.PI / 2;
  rightWing.name = 'rightWing';
  college.add(rightWing);

  // Courtyard Ground
  const groundGeom = new THREE.PlaneGeometry(courtyardWidth, courtyardDepth);
  const ground = new THREE.Mesh(groundGeom, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.1;
  college.add(ground);

  // Small structure in courtyard
  const hutGeom = new THREE.CylinderGeometry(15, 15, 10, 8);
  const hutMaterial = new THREE.MeshStandardMaterial({color: 0x9a3e3e});
  const hut = new THREE.Mesh(hutGeom, hutMaterial);
  hut.position.y = 5;
  hut.position.z = 0;
  college.add(hut);
  
  collegeGroup.add(college);


  // --- Compound Wall ---
  const wallGroup = new THREE.Group();
  wallGroup.name = 'compoundWall';
  const plotWidth = longWingWidth + 100;
  const plotDepth = shortWingWidth + 100;
  const wallHeight = 15;
  const wallThickness = 5;
  const gateWidth = 40;
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White color
  const redBorderMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000 }); // Red for top border

  function createWallSegment(width: number, depth: number) {
    const segment = new THREE.Group();
    const mainWallHeight = wallHeight * 0.9;
    const borderHeight = wallHeight * 0.1;

    const mainWallGeom = new THREE.BoxGeometry(width, mainWallHeight, depth);
    const mainWall = new THREE.Mesh(mainWallGeom, wallMaterial);
    mainWall.position.y = mainWallHeight / 2;
    segment.add(mainWall);

    const topBorderGeom = new THREE.BoxGeometry(width, borderHeight, depth);
    const topBorder = new THREE.Mesh(topBorderGeom, redBorderMaterial);
    topBorder.position.y = mainWallHeight + borderHeight / 2;
    segment.add(topBorder);

    // Add pillars on top of the border
    const pillarGeom = new THREE.CylinderGeometry(2, 2, 4, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
    const numPillars = Math.floor(width > depth ? width / 30 : depth / 30);

    for(let i = 0; i < numPillars; i++) {
        const pillar = new THREE.Mesh(pillarGeom, pillarMaterial);
        const pillarPos = - (width > depth ? width : depth) / 2 + (i + 0.5) * ((width > depth ? width : depth) / numPillars);
        if (width > depth) {
            pillar.position.set(pillarPos, wallHeight + 2, 0);
        } else {
            pillar.position.set(0, wallHeight + 2, pillarPos);
        }
        segment.add(pillar);
    }
    
    return segment;
  }
  
  // Back wall
  const backWall = createWallSegment(plotWidth, wallThickness);
  backWall.position.z = -plotDepth / 2;
  wallGroup.add(backWall);

  // Side walls
  const leftWall = createWallSegment(wallThickness, plotDepth);
  leftWall.position.x = -plotWidth / 2;
  wallGroup.add(leftWall);
  
  const rightWall = createWallSegment(wallThickness, plotDepth);
  rightWall.position.x = plotWidth / 2;
  wallGroup.add(rightWall);

  // Front wall (with gate)
  const frontWallSegmentWidth = (plotWidth - gateWidth) / 2;
  const frontWallLeft = createWallSegment(frontWallSegmentWidth, wallThickness);
  frontWallLeft.position.x = -(gateWidth / 2 + frontWallSegmentWidth / 2);
  frontWallLeft.position.z = plotDepth / 2;
  wallGroup.add(frontWallLeft);

  const frontWallRight = createWallSegment(frontWallSegmentWidth, wallThickness);
  frontWallRight.position.x = (gateWidth / 2 + frontWallSegmentWidth / 2);
  frontWallRight.position.z = plotDepth / 2;
  wallGroup.add(frontWallRight);
  
  collegeGroup.add(wallGroup);

  // Rotate the entire college group to face the correct direction
  collegeGroup.rotation.y = Math.PI;

  collegeGroup.castShadow = true;
  collegeGroup.receiveShadow = true;

  return collegeGroup;
}
