
import * as THREE from 'three';
import { createWalkwayShed } from './walkway-shed';

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

          if(i === 0) {
              const wallSegmentWidthLeft = (width - entranceWidth) / 2 + entranceOffset;
              const wallSegmentWidthRight = (width - entranceWidth) / 2 - entranceOffset;
              
              // Inner red wall
              if(hasEntrance) {
                  const leftInnerWallGeom = new THREE.BoxGeometry(wallSegmentWidthLeft, floorHeight, depth / 2);
                  const leftInnerWall = new THREE.Mesh(leftInnerWallGeom, redMaterial);
                  leftInnerWall.position.x = -(width / 2) + (wallSegmentWidthLeft / 2);
                  leftInnerWall.position.y = floorHeight / 2;
                  leftInnerWall.position.z = -depth / 4;
                  floorGroup.add(leftInnerWall);
                  
                  const rightInnerWallGeom = new THREE.BoxGeometry(wallSegmentWidthRight, floorHeight, depth / 2);
                  const rightInnerWall = new THREE.Mesh(rightInnerWallGeom, redMaterial);
                  rightInnerWall.position.x = (width / 2) - (wallSegmentWidthRight / 2);
                  rightInnerWall.position.y = floorHeight / 2;
                  rightInnerWall.position.z = -depth / 4;
                  floorGroup.add(rightInnerWall);
              } else {
                  const innerWallGeom = new THREE.BoxGeometry(width, floorHeight, depth / 2);
                  const innerWall = new THREE.Mesh(innerWallGeom, redMaterial);
                  innerWall.position.y = floorHeight / 2;
                  innerWall.position.z = -depth / 4;
                  floorGroup.add(innerWall);
              }

          } else {
              // Upper floors: Create the full solid wall
              const wallGeom = new THREE.BoxGeometry(width, floorHeight, depth);
              const mainWall = new THREE.Mesh(wallGeom, redMaterial);
              mainWall.position.y = floorHeight / 2;
              floorGroup.add(mainWall);
          }

          const numPillars = Math.floor(width / 20);
          for (let j = 0; j < numPillars; j++) {
              const xPos = -width/2 + 10 + j * 20;

              // Skip pillars and borders in the entrance gap
              if (hasEntrance && i === 0 && xPos > entranceOffset - entranceWidth / 2 && xPos < entranceOffset + entranceWidth / 2) {
                  continue;
              }

              const pillarGeom = new THREE.BoxGeometry(4, floorHeight, 4);
              const pillar = new THREE.Mesh(pillarGeom, redMaterial);
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

          if (!(hasEntrance && i === 0)) {
            const frontBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 2, 1.2), yellowMaterial);
            frontBorder.position.set(0, floorHeight - 5, depth / 2 + 0.1);
            floorGroup.add(frontBorder);
            const bottomFrontBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 2, 1.2), yellowMaterial);
            bottomFrontBorder.position.set(0, 5, depth / 2 + 0.1);
            floorGroup.add(bottomFrontBorder);
          }
          
          if (!(hasEntrance && i === 0)) {
            const backBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 2, 1.2), yellowMaterial);
            backBorder.position.set(0, floorHeight - 5, -depth / 2 - 0.1);
            floorGroup.add(backBorder);
            const bottomBackBorder = new THREE.Mesh(new THREE.BoxGeometry(width, 2, 1.2), yellowMaterial);
            bottomBackBorder.position.set(0, 5, -depth / 2 - 0.1);
            floorGroup.add(bottomBackBorder);
          }
          
          for (let j = 0; j < numPillars; j++) {
              const xPos = -width/2 + 10 + j * 20;
              if (hasEntrance && i === 0 && xPos > entranceOffset - entranceWidth / 2 && xPos < entranceOffset + entranceWidth / 2) {
                  continue;
              }
              const pillarGeom = new THREE.BoxGeometry(4, floorHeight, 4);
              const pillar = new THREE.Mesh(pillarGeom, redMaterial);
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

  const backWing = createWing(longWingWidth, wingDepth, true, -110);
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

  // --- Courtyard Elements ---
  const courtyard = new THREE.Group();
  courtyard.position.y = 0.1;
  college.add(courtyard);

  // Lawn
  const lawnGeom = new THREE.PlaneGeometry(longWingWidth - wingDepth, shortWingWidth - wingDepth);
  const lawnMaterial = new THREE.MeshStandardMaterial({ color: 0x2e6b34 }); // Darker green
  const lawn = new THREE.Mesh(lawnGeom, lawnMaterial);
  lawn.rotation.x = -Math.PI / 2;
  courtyard.add(lawn);

  // Main Walkway Structure
  const walkwayGroup = new THREE.Group();
  courtyard.add(walkwayGroup);
  
  const rampWidth = 20;
  const rampLength = (shortWingWidth - wingDepth - rampWidth) / 2;

  // Function to create a ramped walkway level
  function createWalkwayLevel(startFloor: number, endFloor: number) {
      const levelGroup = new THREE.Group();
      const startY = startFloor * floorHeight;
      const endY = endFloor * floorHeight;

      const rampGeom = new THREE.BoxGeometry(rampWidth, 0.5, rampLength);
      const floorGeom = new THREE.BoxGeometry(rampWidth, 0.5, rampWidth);
      const walkwayMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });

      // Ramp 1 (from startFloor down to center)
      const ramp1 = new THREE.Mesh(rampGeom, walkwayMaterial);
      ramp1.position.set(0, (startY + endY) / 2, -(rampWidth / 2 + rampLength / 2));
      ramp1.rotation.x = -Math.atan((startY - endY) / rampLength);
      levelGroup.add(ramp1);

      // Center Platform
      const centerPlatform = new THREE.Mesh(floorGeom, walkwayMaterial);
      centerPlatform.position.y = endY;
      levelGroup.add(centerPlatform);
      
      // Ramp 2 (from center down to endFloor)
      const ramp2 = new THREE.Mesh(rampGeom, walkwayMaterial);
      ramp2.position.set(0, (startY + endY) / 2, (rampWidth / 2 + rampLength / 2));
      ramp2.rotation.x = Math.atan((startY - endY) / rampLength);
      levelGroup.add(ramp2);
      
      // Support pillars
      const pillarGeom = new THREE.CylinderGeometry(1, 1, endY, 12);
      const pillarMaterial = new THREE.MeshStandardMaterial({ color: redMaterial.color });
      
      const pillar1 = new THREE.Mesh(pillarGeom, pillarMaterial);
      pillar1.position.set(-rampWidth/2 + 2, endY/2, 0);
      levelGroup.add(pillar1);
      
      const pillar2 = new THREE.Mesh(pillarGeom, pillarMaterial);
      pillar2.position.set(rampWidth/2 - 2, endY/2, 0);
      levelGroup.add(pillar2);

      return levelGroup;
  }
  
  // Create and place the walkway levels
  const walkway3to2 = createWalkwayLevel(3, 2);
  walkwayGroup.add(walkway3to2);

  const walkway4to3 = createWalkwayLevel(4, 3);
  walkwayGroup.add(walkway4to3);

  // Add green shed roof to the top level
  const shed = createWalkwayShed(shortWingWidth - wingDepth, rampWidth, false);
  shed.position.y = 4 * floorHeight;
  walkwayGroup.add(shed);

  // Big circular brick structure
  const bigCircleRadius = 40;
  const bigCircleHeight = 10;
  const bigCircleWallThickness = 2;
  const bigCircleGeom = new THREE.RingGeometry(bigCircleRadius - bigCircleWallThickness, bigCircleRadius, 64);
  const bigCircle = new THREE.Mesh(bigCircleGeom, redMaterial);
  bigCircle.rotation.x = -Math.PI / 2;
  bigCircle.position.set(-100, 0.2, 0);
  courtyard.add(bigCircle);
  
  // Inner grass for big circle
  const innerGrassGeom = new THREE.CircleGeometry(bigCircleRadius - bigCircleWallThickness, 64);
  const innerGrass = new THREE.Mesh(innerGrassGeom, lawnMaterial);
  innerGrass.rotation.x = -Math.PI / 2;
  innerGrass.position.copy(bigCircle.position);
  innerGrass.position.y = 0.15;
  courtyard.add(innerGrass);


  // Smaller beige seating area
  const smallCircleRadius = 15;
  const smallCircleHeight = 3;
  const smallCircleGeom = new THREE.CylinderGeometry(smallCircleRadius, smallCircleRadius, smallCircleHeight, 32);
  const smallCircle = new THREE.Mesh(smallCircleGeom, creamYellowMaterial);
  smallCircle.position.set(100, smallCircleHeight / 2, -50);
  courtyard.add(smallCircle);

  // Trees and bushes
  const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
  const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
  
  // Line of trees
  for (let i = 0; i < 5; i++) {
      const tree = new THREE.Group();
      const trunkGeom = new THREE.CylinderGeometry(1, 1.5, 12, 8);
      const trunk = new THREE.Mesh(trunkGeom, new THREE.MeshStandardMaterial({color: 0x8b4513}));
      trunk.position.y = 6;
      
      const foliageGeom = new THREE.SphereGeometry(10, 16, 8);
      const foliage = new THREE.Mesh(foliageGeom, treeMaterial);
      foliage.position.y = 18;
      
      tree.add(trunk, foliage);
      tree.position.set(160, 0, -80 + i * 40);
      courtyard.add(tree);
  }

  // Path with bushes
  const pathGeom = new THREE.PlaneGeometry(15, 180);
  const pathMaterial = new THREE.MeshStandardMaterial({ color: 0xbbbbbb });
  const path = new THREE.Mesh(pathGeom, pathMaterial);
  path.rotation.x = -Math.PI / 2;
  path.position.set(-160, 0.2, 0);
  courtyard.add(path);
  
  for (let i = 0; i < 8; i++) {
      const bushGeom = new THREE.SphereGeometry(5, 8, 6);
      const bush = new THREE.Mesh(bushGeom, bushMaterial);
      bush.position.set(-175, 2.5, -70 + i * 20);
      courtyard.add(bush);
  }
  
  collegeGroup.add(college);

  collegeGroup.rotation.y = Math.PI;

  collegeGroup.castShadow = true;
  collegeGroup.receiveShadow = true;

  return collegeGroup;
}
