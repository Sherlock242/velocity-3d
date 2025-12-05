
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

  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xab4747, roughness: 0.8 });
  const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.7 });
  const darkGrayMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  
  const college = new THREE.Group();
  college.name = 'collegeBuilding';

  const walkableRampGroup = new THREE.Group();
  walkableRampGroup.name = 'collegeRamp';

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
    const latticeMaterial = new THREE.MeshStandardMaterial({ color: 0xab4747, side: THREE.DoubleSide });
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

          // Add visible dark gray floor plane
          const visibleFloorPlaneGeom = new THREE.PlaneGeometry(width, depth);
          const visibleFloorPlane = new THREE.Mesh(visibleFloorPlaneGeom, darkGrayMaterial);
          visibleFloorPlane.rotation.x = -Math.PI / 2;
          visibleFloorPlane.position.y = 0.15; // Slightly above ground/floor level
          floorGroup.add(visibleFloorPlane);
          
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
          
          floorGroup.updateMatrixWorld(true);
          const floorPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(width, depth),
            new THREE.MeshBasicMaterial({ visible: false })
          );
          floorPlane.rotation.x = -Math.PI / 2;
          floorPlane.position.y = 0.1;
          floorPlane.applyMatrix4(floorGroup.matrixWorld);
          walkableRampGroup.add(floorPlane);

      }

      return wing;
  }

  function createRailing(length: number) {
    const railingGroup = new THREE.Group();
    const railingMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const pillarHeight = 12;
    const pillarRadius = 0.25;
    const numPillars = Math.floor(length / 10) + 1;

    for (let i = 0; i < numPillars; i++) {
        const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight),
            railingMaterial
        );
        pillar.position.z = -length / 2 + i * (length / (numPillars - 1));
        pillar.position.y = pillarHeight / 2;
        railingGroup.add(pillar);
    }
    const topRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, length),
        railingMaterial
    );
    topRail.position.y = pillarHeight;
    railingGroup.add(topRail);

    return railingGroup;
}
  

  const backWing = createWing(longWingWidth, wingDepth, true, -110);
  backWing.position.z = -shortWingWidth / 2;
  backWing.name = 'backWing';
  college.add(backWing);
  
  const frontWing = createWing(longWingWidth, wingDepth, false, 0);
  frontWing.position.z = shortWingWidth / 2;
  frontWing.rotation.y = Math.PI; // Flipped
  frontWing.name = 'frontWing';
  college.add(frontWing);

  const leftWing = createWing(shortWingWidth, wingDepth, false, 0);
  leftWing.position.x = -longWingWidth / 2;
  leftWing.rotation.y = Math.PI / 2;
  leftWing.name = 'leftWing';
  college.add(leftWing);
  
  const rightWing = createWing(shortWingWidth, wingDepth, false, 0);
  rightWing.position.x = longWingWidth / 2;
  rightWing.rotation.y = -Math.PI / 2;
  rightWing.name = 'rightWing';
  college.add(rightWing);

  college.updateMatrixWorld(true);

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
  
  // Make lawn walkable
  const walkableLawn = lawn.clone();
  walkableLawn.material = new THREE.MeshStandardMaterial({color: 0x888888, visible: false});
  walkableLawn.position.y = 0.1;
  walkableRampGroup.add(walkableLawn);


  // --- RAMP ---
  const rampGroup = new THREE.Group();
  const rampMaterial = new THREE.MeshStandardMaterial({ color: 0xfafad2, side: THREE.DoubleSide });
  
  const rampWidth = 40;
  const rampThickness = 2;
  const rampRise = floorHeight;
  const platformWidth = 100;
  const platformDepth = 30;
  
  const rampLength = shortWingWidth - wingDepth; // Extend ramp length

  // Ramp from ground to 1st floor
  const ramp1Geom = new THREE.BoxGeometry(rampWidth, rampThickness, rampLength);
  const ramp1 = new THREE.Mesh(ramp1Geom, rampMaterial);
  ramp1.position.y = rampRise / 2;
  ramp1.position.z = (shortWingWidth - wingDepth) / 2 - rampLength / 2;
  ramp1.rotation.x = -Math.atan(rampRise / rampLength);
  const leftRailing1 = createRailing(rampLength);
  leftRailing1.position.x = -rampWidth / 2;
  ramp1.add(leftRailing1);
  const rightRailing1 = createRailing(rampLength);
  rightRailing1.position.x = rampWidth / 2;
  ramp1.add(rightRailing1);
  
  // Platform on the 1st floor
  const platform1 = new THREE.Mesh(new THREE.BoxGeometry(platformWidth, rampThickness, platformDepth), rampMaterial);
  platform1.position.y = rampRise;
  platform1.position.x = (platformWidth - rampWidth) / 2;
  platform1.position.z = shortWingWidth / 2; // Position inside the wall

  // Ramp from 1st to 2nd floor
  const ramp2Geom = new THREE.BoxGeometry(rampWidth, rampThickness, rampLength);
  const ramp2 = new THREE.Mesh(ramp2Geom, rampMaterial);
  ramp2.position.y = rampRise + rampRise / 2;
  ramp2.position.x = platformWidth - rampWidth;
  ramp2.position.z = platform1.position.z - rampLength / 2 - platformDepth / 2;
  ramp2.rotation.x = Math.atan(rampRise / rampLength);
  const leftRailing2 = createRailing(rampLength);
  leftRailing2.position.x = -rampWidth / 2;
  ramp2.add(leftRailing2);
  const rightRailing2 = createRailing(rampLength);
  rightRailing2.position.x = rampWidth / 2;
  ramp2.add(rightRailing2);

  // Platform on the 2nd floor
  const platform2 = new THREE.Mesh(new THREE.BoxGeometry(platformWidth, rampThickness, platformDepth), rampMaterial);
  platform2.position.y = rampRise * 2;
  platform2.position.x = platform1.position.x;
  platform2.position.z = platform1.position.z - rampLength - platformDepth;

  // Ramp from 2nd to 3rd floor (extended to front wing)
  const ramp3Length = rampLength + 30;
  const ramp3Geom = new THREE.BoxGeometry(rampWidth, rampThickness, ramp3Length);
  const ramp3 = new THREE.Mesh(ramp3Geom, rampMaterial);
  ramp3.position.y = rampRise * 2.3; // Midpoint for 3rd floor ramp
  ramp3.position.x = platform2.position.x - 30;
  ramp3.position.z = platform2.position.z + ramp3Length / 2;

  ramp3.rotation.x = -Math.atan(rampRise / ramp3Length);
  const leftRailing3 = createRailing(ramp3Length);
  leftRailing3.position.x = -rampWidth / 2;
  ramp3.add(leftRailing3);
  const rightRailing3 = createRailing(ramp3Length);
  rightRailing3.position.x = rampWidth / 2;
  ramp3.add(rightRailing3);

  // Shed for the 3rd ramp
  const ramp3Shed = createWalkwayShed(ramp3Length, rampWidth, true);
  ramp3Shed.position.copy(ramp3.position);
  ramp3Shed.position.y += 10; // Adjust height to be above the ramp
  ramp3Shed.rotation.copy(ramp3.rotation);
  ramp3Shed.rotation.y = Math.PI; // Correct orientation


  
  walkableRampGroup.add(ramp1, platform1, ramp2, platform2, ramp3);
  
  rampGroup.add(ramp3Shed);
  rampGroup.position.set(0, 0.2, 0); 
  courtyard.add(rampGroup);

  collegeGroup.add(college, walkableRampGroup);

  collegeGroup.rotation.y = Math.PI;

  collegeGroup.castShadow = true;
  collegeGroup.receiveShadow = true;

  return collegeGroup;
}
