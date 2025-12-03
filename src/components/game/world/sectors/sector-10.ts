
import * as THREE from 'three';
import { createCollegeBuilding } from '../../models/college-building';
import { createOpenCollegeBuilding } from '../../models/open-college-building';
import { createScoutsBuilding } from '../../models/scouts-building';
import type { MutableRefObject } from 'react';

type Sector10Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
};

export function createSector10({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
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
  const wallHeight = 15;
  const wallThickness = 5;
  const gateWidth = 40;

  function createWallSegment(width: number, depth: number) {
    const segment = new THREE.Group();
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White color
    const redBorderMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
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
  entranceRoad.position.set(gateXPosition, 0.15, frontWallZ + entranceRoadLength / 2);
  campusContainer.add(entranceRoad);

  // New wall to the right of the road
  const innerWall = createWallSegment(wallThickness, entranceRoadLength);
  innerWall.position.set(gateXPosition + entranceRoadWidth / 2 + wallThickness / 2, 0, frontWallZ + entranceRoadLength / 2);
  campusContainer.add(innerWall);
  staticCollidersRef.current.push(innerWall);


  // Walkable Path to College
  const pathWidth = 15;
  const pathToCollegeLength = 100;
  const pathToCollegeGeom = new THREE.PlaneGeometry(pathToCollegeLength, pathWidth);
  const pathToCollege = new THREE.Mesh(pathToCollegeGeom, pathMaterial);
  pathToCollege.rotation.x = -Math.PI / 2;
  pathToCollege.position.set(gateXPosition - (pathToCollegeLength / 2), 0.15, frontWallZ + entranceRoadLength - pathWidth / 2);
  campusContainer.add(pathToCollege);
  
  const corridorLength = 50;
  const corridorGeom = new THREE.PlaneGeometry(pathWidth, corridorLength);
  const corridor = new THREE.Mesh(corridorGeom, pathMaterial);
  corridor.rotation.x = -Math.PI / 2;
  corridor.position.set(gateXPosition - pathToCollegeLength, 0.15, frontWallZ + entranceRoadLength - pathWidth - (corridorLength / 2) );
  campusContainer.add(corridor);


  // --- College Building ---
  const college = createCollegeBuilding();
  college.scale.set(0.6, 0.6, 0.6);
  college.position.set(-80, 0, -120);
  campusContainer.add(college);
  const mainBuilding = college.getObjectByName('collegeBuilding');
  if (mainBuilding) {
    mainBuilding.children.forEach(child => staticCollidersRef.current.push(child as THREE.Group));
  }

  // --- Open College Building ---
  const openCollegeBuilding = createOpenCollegeBuilding();
  openCollegeBuilding.scale.set(0.6, 0.6, 0.6);
  openCollegeBuilding.position.set(-120, 0, 120); // Bottom-left corner
  openCollegeBuilding.rotation.y = Math.PI / 2;
  campusContainer.add(openCollegeBuilding);
  const openMainBuilding = openCollegeBuilding.getObjectByName('openCollegeBuilding');
  if (openMainBuilding) {
    openMainBuilding.children.forEach(child => staticCollidersRef.current.push(child as THREE.Group));
  }

  // --- Scouts Building ---
  const scoutsBuilding = createScoutsBuilding();
  scoutsBuilding.scale.set(1.0, 1.0, 1.0);
  // Position it in the bottom right
  scoutsBuilding.position.set(100, 0, 200);
  scoutsBuilding.rotation.y = Math.PI;
  campusContainer.add(scoutsBuilding);
  staticCollidersRef.current.push(scoutsBuilding);


  sectorGroup.add(campusContainer);

  return sectorGroup;
}
