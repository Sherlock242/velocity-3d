
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
  const creamYellowMaterial = new THREE.MeshStandardMaterial({ color: 0xfffdd0, roughness: 0.8 });

  function createLattice(width: number, height: number) {
    const latticeGroup = new THREE.Group();

    // The main red lattice with holes
    const latticeShape = new THREE.Shape();
    latticeShape.moveTo(-width / 2, -height / 2);
    latticeShape.lineTo(width / 2, -height / 2);
    latticeShape.lineTo(width / 2, height / 2);
    latticeShape.lineTo(-width / 2, height / 2);
    latticeShape.lineTo(-width / 2, -height / 2);

    const holeSize = 1.5;
    const holeSpacingX = 4;
    const holeSpacingY = 2.5;
    const numHolesX = Math.floor(width / holeSpacingX);
    const numHolesY = Math.floor(height / holeSpacingY);

    for (let i = 0; i < numHolesY; i++) {
      for (let j = 0; j < numHolesX; j++) {
        const holePath = new THREE.Path();
        const x = -width / 2 + (j + 0.5) * holeSpacingX;
        const y = -height / 2 + (i + 0.5) * holeSpacingY;
        holePath.moveTo(x - holeSize / 2, y - holeSize / 2);
        holePath.lineTo(x + holeSize / 2, y - holeSize / 2);
        holePath.lineTo(x + holeSize / 2, y + holeSize / 2);
        holePath.lineTo(x - holeSize / 2, y + holeSize / 2);
        holePath.closePath();
        latticeShape.holes.push(holePath);
      }
    }

    const extrudeSettings = { depth: 1, bevelEnabled: false };
    const latticeGeometry = new THREE.ExtrudeGeometry(latticeShape, extrudeSettings);
    const latticeMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000, side: THREE.DoubleSide });
    const latticeMesh = new THREE.Mesh(latticeGeometry, latticeMaterial);
    latticeMesh.position.z = 0.5; // Move lattice forward
    latticeGroup.add(latticeMesh);

    // Yellow backplate for the holes
    const backplateGeom = new THREE.BoxGeometry(width, height, 1);
    const backplate = new THREE.Mesh(backplateGeom, yellowMaterial);
    // Position it behind the lattice
    latticeGroup.add(backplate);

    return latticeGroup;
  }

  function createWing(width: number, depth: number, hasEntrance = false, entranceOffset = 0) {
      const wing = new THREE.Group();
      wing.name = 'collegeWing';

      const entranceWidth = 40;

      for (let i = 0; i < numFloors; i++) {
          const yPos = i * floorHeight;
          const floorGroup = new THREE.Group();
          floorGroup.position.y = yPos;

          if(hasEntrance && i === 0) {
              const wallSegmentWidthLeft = (width - entranceWidth) / 2 + entranceOffset;
              const wallSegmentWidthRight = (width - entranceWidth) / 2 - entranceOffset;
              
              const leftWallGeom = new THREE.BoxGeometry(wallSegmentWidthLeft, floorHeight, depth / 2);
              const leftWall = new THREE.Mesh(leftWallGeom, redMaterial);
              leftWall.position.x = -(width / 2) + (wallSegmentWidthLeft / 2);
              leftWall.position.y = floorHeight / 2;
              leftWall.position.z = -depth / 4;
              floorGroup.add(leftWall);

              const rightWallGeom = new THREE.BoxGeometry(wallSegmentWidthRight, floorHeight, depth / 2);
              const rightWall = new THREE.Mesh(rightWallGeom, redMaterial);
              rightWall.position.x = (width / 2) - (wallSegmentWidthRight / 2);
              rightWall.position.y = floorHeight / 2;
              rightWall.position.z = -depth / 4;
              floorGroup.add(rightWall);

              const lintelGeom = new THREE.BoxGeometry(entranceWidth, 5, depth);
              const lintel = new THREE.Mesh(lintelGeom, redMaterial);
              lintel.position.y = floorHeight - 2.5; 
              lintel.position.x = entranceOffset;
              floorGroup.add(lintel);

              const pillarHeight = floorHeight - 5; 
              const pillarGeom = new THREE.BoxGeometry(4, pillarHeight, 4);

              const leftPillar = new THREE.Mesh(pillarGeom, redMaterial);
              leftPillar.position.set(-entranceWidth / 2 + 2 + entranceOffset, pillarHeight / 2, depth / 2);
              floorGroup.add(leftPillar);
              
              const rightPillar = new THREE.Mesh(pillarGeom, redMaterial);
              rightPillar.position.set(entranceWidth / 2 - 2 + entranceOffset, pillarHeight / 2, depth / 2);
              floorGroup.add(rightPillar);

              const corridorGeom = new THREE.PlaneGeometry(width, depth);
              const corridorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
              const corridor = new THREE.Mesh(corridorGeom, corridorMaterial);
              corridor.rotation.x = -Math.PI / 2;
              corridor.position.y = 0.2;
              floorGroup.add(corridor);

          } else {
            if (i === 0) {
                // Ground floor: Only create inner half of the wall
                const innerWallGeom = new THREE.BoxGeometry(width, floorHeight, depth / 2);
                const innerWall = new THREE.Mesh(innerWallGeom, redMaterial);
                innerWall.position.y = floorHeight / 2;
                innerWall.position.z = -depth / 4; // Position it as the inner half
                floorGroup.add(innerWall);

                const outerWallGeom = new THREE.BoxGeometry(width, floorHeight, depth / 2);
                const outerWall = new THREE.Mesh(outerWallGeom, creamYellowMaterial);
                outerWall.position.y = floorHeight / 2;
                outerWall.position.z = depth / 4;
                floorGroup.add(outerWall);

                // Add corridor floor
                const corridorGeom = new THREE.PlaneGeometry(width, depth);
                const corridorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
                const corridor = new THREE.Mesh(corridorGeom, corridorMaterial);
                corridor.rotation.x = -Math.PI / 2;
                corridor.position.y = 0.2;
                floorGroup.add(corridor);

            } else {
                // Upper floors: Create the full solid wall
                const wallGeom = new THREE.BoxGeometry(width, floorHeight, depth);
                const mainWall = new THREE.Mesh(wallGeom, redMaterial);
                mainWall.position.y = floorHeight / 2;
                floorGroup.add(mainWall);
            }
          }

          const frontBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 2, 1.2), yellowMaterial);
          frontBorder.position.set(0, floorHeight - 5, depth / 2 + 0.1);
          floorGroup.add(frontBorder);

          const bottomFrontBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 2, 1.2), yellowMaterial);
          bottomFrontBorder.position.set(0, 5, depth / 2 + 0.1);
          floorGroup.add(bottomFrontBorder);
          
          const numPillars = Math.floor(width / 20);
          for (let j = 0; j < numPillars; j++) {
              const pillarGeom = new THREE.BoxGeometry(4, floorHeight, 4);
              const pillar = new THREE.Mesh(pillarGeom, redMaterial);
              const xPos = -width/2 + 10 + j * 20;
              pillar.position.set(xPos, floorHeight / 2, depth / 2 + 2);
              floorGroup.add(pillar);

              // Add latticework between pillars on upper floors
              if (i > 0 && j < numPillars -1) {
                  const nextPillarXPos = -width/2 + 10 + (j + 1) * 20;
                  const latticeWidth = nextPillarXPos - xPos - 4;
                  const latticeHeight = floorHeight * 0.4;
                  const lattice = createLattice(latticeWidth, latticeHeight);
                  lattice.position.set(xPos + 2 + latticeWidth / 2, floorHeight / 2, depth / 2 + 2);
                  floorGroup.add(lattice);
              }
          }
          
          const backBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 2, 1.2), yellowMaterial);
          backBorder.position.set(0, floorHeight - 5, -depth / 2 - 0.1);
          floorGroup.add(backBorder);

          const bottomBackBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 2, 1.2), yellowMaterial);
          bottomBackBorder.position.set(0, 5, -depth / 2 - 0.1);
          floorGroup.add(bottomBackBorder);
          
          for (let j = 0; j < numPillars; j++) {
              const pillarGeom = new THREE.BoxGeometry(4, floorHeight, 4);
              const pillar = new THREE.Mesh(pillarGeom, redMaterial);
              const xPos = -width/2 + 10 + j * 20;
              pillar.position.set(xPos, floorHeight / 2, -depth / 2 - 2);
              floorGroup.add(pillar);

               // Add latticework between pillars on upper floors (back side)
               if (i > 0 && j < numPillars -1) {
                const nextPillarXPos = -width/2 + 10 + (j + 1) * 20;
                const latticeWidth = nextPillarXPos - xPos - 4;
                const latticeHeight = floorHeight * 0.4;
                const lattice = createLattice(latticeWidth, latticeHeight);
                lattice.position.set(xPos + 2 + latticeWidth / 2, floorHeight / 2, -depth / 2 - 2);
                floorGroup.add(lattice);
            }
          }
          wing.add(floorGroup);
      }
      return wing;
  }
  
  const college = new THREE.Group();
  college.name = 'collegeBuilding';

  const backWing = createWing(longWingWidth, wingDepth, true, -130);
  backWing.position.z = -shortWingWidth / 2;
  backWing.name = 'backWing';
  college.add(backWing);
  
  const frontWing = createWing(longWingWidth, wingDepth, false);
  frontWing.position.z = shortWingWidth / 2;
  frontWing.rotation.y = Math.PI; // Flipped
  frontWing.name = 'frontWing';
  college.add(frontWing);

  const leftWing = createWing(shortWingWidth, wingDepth);
  leftWing.position.x = -longWingWidth / 2;
  leftWing.rotation.y = Math.PI / 2;
  leftWing.name = 'leftWing';
  college.add(leftWing);
  
  const rightWing = createWing(shortWingWidth, wingDepth);
  rightWing.position.x = longWingWidth / 2;
  rightWing.rotation.y = -Math.PI / 2;
  rightWing.name = 'rightWing';
  college.add(rightWing);

  const hutGeom = new THREE.CylinderGeometry(15, 15, 10, 8);
  const hutMaterial = new THREE.MeshStandardMaterial({color: 0x9a3e3e});
  const hut = new THREE.Mesh(hutGeom, hutMaterial);
  hut.position.y = 5;
  hut.position.z = 0;
  college.add(hut);
  
  collegeGroup.add(college);

  collegeGroup.rotation.y = Math.PI;

  collegeGroup.castShadow = true;
  collegeGroup.receiveShadow = true;

  return collegeGroup;
}
