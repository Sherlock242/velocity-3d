
import * as THREE from 'three';
import { createCollegeBuilding } from '../../models/college-building';
import { createOpenCollegeBuilding } from '../../models/open-college-building';
import { createScoutsBuilding } from '../../models/scouts-building';
import { createWalkwayShed } from '../../models/walkway-shed';
import type { MutableRefObject } from 'react';

type Sector10Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  collegeRampMeshRef: MutableRefObject<THREE.Group | undefined>;
};

export function createSector10({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  collegeRampMeshRef,
}: Sector10Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const campusContainer = new THREE.Group();
  campusContainer.position.set(cellCenterX, 0, cellCenterZ);
  campusContainer.rotation.y = Math.PI;

  const plotWidth = 480;
  const plotDepth = 480;

  // --- Compound Wall ---
  const wallGroup = new THREE.Group();
  wallGroup.name = 'compoundWall';
  const wallHeight = 30;
  const wallThickness = 5;
  const gateWidth = 40;

  function createWallSegment(width: number, depth: number) {
    const segment = new THREE.Group();
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White color
    const redBorderMaterial = new THREE.MeshStandardMaterial({ color: 0x9a3e3e });
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

    return segment;
  }

  const gateUpwardShift = 100;

  // Front wall (-Z)
  const frontWallZ = -plotDepth / 2;
  const frontWallLeftSegmentWidth = (plotWidth / 2) - (gateWidth / 2) + gateUpwardShift;
  const frontWallRightSegmentWidth = plotWidth - frontWallLeftSegmentWidth - gateWidth;

  const frontWallLeft = createWallSegment(frontWallLeftSegmentWidth, wallThickness);
  frontWallLeft.position.set(-(plotWidth / 2) + (frontWallLeftSegmentWidth / 2), 0, frontWallZ);
  wallGroup.add(frontWallLeft);

  const frontWallRight = createWallSegment(frontWallRightSegmentWidth, wallThickness);
  frontWallRight.position.set((plotWidth / 2) - (frontWallRightSegmentWidth / 2), 0, frontWallZ);
  wallGroup.add(frontWallRight);

  // Back wall (+Z)
  const backWall = createWallSegment(plotWidth, wallThickness);
  backWall.position.z = plotDepth / 2;
  wallGroup.add(backWall);

  // Right wall (+X)
  const rightWall = createWallSegment(wallThickness, plotDepth);
  rightWall.position.x = plotWidth / 2;
  wallGroup.add(rightWall);

  // Left wall (-X)
  const leftWall = createWallSegment(wallThickness, plotDepth);
  leftWall.position.x = -plotWidth / 2;
  wallGroup.add(leftWall);

  campusContainer.add(wallGroup);
  wallGroup.children.forEach(wall => staticCollidersRef.current.push(wall as THREE.Group));

  // --- Roads and Paths ---
  const darkRoadMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const pathMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });

  const gateXPosition = gateUpwardShift;
  const entranceRoadWidth = 25;

  const entranceRoadLength = 240;
  const entranceRoadGeom = new THREE.PlaneGeometry(entranceRoadWidth, entranceRoadLength);
  const entranceRoad = new THREE.Mesh(entranceRoadGeom, darkRoadMaterial);
  entranceRoad.rotation.x = -Math.PI / 2;
  entranceRoad.position.set(gateXPosition, 0.14, frontWallZ + entranceRoadLength / 2);
  campusContainer.add(entranceRoad);

  // New wall to the right of the road
  const innerWallLength = 340;
  const innerWall = createWallSegment(wallThickness, innerWallLength);
  innerWall.position.set(gateXPosition + entranceRoadWidth / 2 + wallThickness / 2 + 15, 0, frontWallZ + innerWallLength / 2);
  campusContainer.add(innerWall);
  staticCollidersRef.current.push(innerWall);


  // Walkable Path to College
  const pathWidth = 15;
  const shedPathToCollegeLength = 97;
  const walkwayPathToCollegeLength = 137;
  const shedCorridorLength = 40;


  const pathToCollegeZ = frontWallZ + entranceRoadLength - pathWidth / 2 - 7 + 10;
  const pathToCollegeShedX = gateXPosition - (shedPathToCollegeLength / 2) - 12.5;
  const pathToCollegeWalkwayX = gateXPosition - (walkwayPathToCollegeLength / 2) - 12.5;

  
  const pathToCollegeGeom = new THREE.PlaneGeometry(walkwayPathToCollegeLength, pathWidth);
  const pathToCollege = new THREE.Mesh(pathToCollegeGeom, pathMaterial);
  pathToCollege.rotation.x = -Math.PI / 2;
  pathToCollege.position.set(pathToCollegeWalkwayX, 0.15, pathToCollegeZ);
  campusContainer.add(pathToCollege);
  
  const corridorShedX = pathToCollegeShedX - (shedPathToCollegeLength / 2) - (pathWidth / 2);
  const corridorShedZ = (frontWallZ + entranceRoadLength - pathWidth / 2 - 7) - pathWidth - (shedCorridorLength / 2) + 22;

  const corridorGeom = new THREE.PlaneGeometry(pathWidth, shedCorridorLength);
  const corridor = new THREE.Mesh(corridorGeom, pathMaterial);
  corridor.rotation.x = -Math.PI / 2;
  corridor.position.set(corridorShedX, 0.15, corridorShedZ);
  campusContainer.add(corridor);

  // --- Sheds for Walkways ---
  const pathToCollegeShed = createWalkwayShed(shedPathToCollegeLength, pathWidth);
  pathToCollegeShed.position.set(pathToCollegeShedX, 0, pathToCollegeZ);
  pathToCollegeShed.rotation.y = Math.PI / 2;
  campusContainer.add(pathToCollegeShed);

  const corridorShed = createWalkwayShed(shedCorridorLength, pathWidth);
  corridorShed.position.set(corridorShedX, 0, corridorShedZ - 2);
  campusContainer.add(corridorShed);


  // --- College Building ---
  const collegeBuilding = createCollegeBuilding();
  collegeBuilding.scale.set(0.6, 0.6, 0.6);
  collegeBuilding.position.set(-80, 0, -120);
  campusContainer.add(collegeBuilding);
  
  const collegeBuildingForCollision = collegeBuilding.getObjectByName('collegeBuilding');
  if (collegeBuildingForCollision) {
      staticCollidersRef.current.push(collegeBuildingForCollision as THREE.Group);
  }

  // Find the ramp and pass its mesh reference up
  const collegeRampObject = collegeBuilding.getObjectByName('collegeRamp');
  if (collegeRampObject instanceof THREE.Group) {
      collegeRampMeshRef.current = collegeRampObject;
      collegeRampObject.updateWorldMatrix(true, true);
  }

  // --- Water Tank Structure ---
  const waterTankStructure = new THREE.Group();
  waterTankStructure.name = 'waterTankStructure';

  const brownBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 }); // SaddleBrown
  const blackTankMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });

  const baseRadius = 15;
  const baseHeight = 10;
  const baseGeom = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 32);
  const baseCylinder = new THREE.Mesh(baseGeom, brownBaseMaterial);
  baseCylinder.position.y = baseHeight / 2;
  baseCylinder.castShadow = true;
  waterTankStructure.add(baseCylinder);

  const tankRadius = 6;
  const tankHeight = 8;
  const tankGeom = new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 24);

  const tank1 = new THREE.Mesh(tankGeom, blackTankMaterial);
  tank1.position.set(-tankRadius * 0.8, baseHeight + tankHeight / 2, 0);
  tank1.castShadow = true;
  waterTankStructure.add(tank1);

  const tank2 = new THREE.Mesh(tankGeom, blackTankMaterial);
  tank2.position.set(tankRadius * 0.8, baseHeight + tankHeight / 2, 0);
  tank2.castShadow = true;
  waterTankStructure.add(tank2);

  // Position it within the red college courtyard area
  const collegeMainBuilding = collegeBuilding.getObjectByName('collegeBuilding');
  if (collegeMainBuilding) {
    waterTankStructure.position.set(-80, 0, 0);
    collegeMainBuilding.add(waterTankStructure);
    staticCollidersRef.current.push(waterTankStructure);
  }


  // --- Open College Building ---
  const openCollegeBuilding = createOpenCollegeBuilding();
  openCollegeBuilding.scale.set(0.6, 0.6, 0.6);
  openCollegeBuilding.position.set(-120, 0, 120); // Bottom-left corner
  openCollegeBuilding.rotation.y = Math.PI;
  campusContainer.add(openCollegeBuilding);
  staticCollidersRef.current.push(openCollegeBuilding);

  // --- Scouts Building ---
  const scoutsBuilding = createScoutsBuilding();
  scoutsBuilding.scale.set(1.0, 1.0, 1.0);
  // Position it in the bottom right
  scoutsBuilding.position.set(70, 0, 195);
  scoutsBuilding.rotation.y = Math.PI;
  campusContainer.add(scoutsBuilding);
  staticCollidersRef.current.push(scoutsBuilding);

  sectorGroup.add(campusContainer);

  return sectorGroup;
}
