
import * as THREE from 'three';

export function createCollegeBuilding() {
  const college = new THREE.Group();

  const wingWidth = 250;
  const wingDepth = 30;
  const numFloors = 4;
  const floorHeight = 15;
  const totalHeight = numFloors * floorHeight;

  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.8 });
  const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.7 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9 });
  
  function createWing(width: number, depth: number) {
      const wing = new THREE.Group();

      for (let i = 0; i < numFloors; i++) {
          const yPos = i * floorHeight;

          // Floor base
          const floorGeom = new THREE.PlaneGeometry(width, depth);
          const floor = new THREE.Mesh(floorGeom, floorMaterial);
          floor.rotation.x = -Math.PI / 2;
          floor.position.set(0, yPos, 0);
          wing.add(floor);

          // Back wall
          const wallGeom = new THREE.BoxGeometry(width, floorHeight, 1);
          const wall = new THREE.Mesh(wallGeom, redMaterial);
          wall.position.set(0, yPos + floorHeight / 2, -depth / 2);
          wing.add(wall);
          
          // Yellow border below windows
          const borderGeom = new THREE.BoxGeometry(width, 1, 1.2);
          const border = new THREE.Mesh(borderGeom, yellowMaterial);
          border.position.set(0, yPos + floorHeight - 5, -depth / 2 + 1);
          wing.add(border);

          // Pillars
          const pillarGeom = new THREE.BoxGeometry(4, floorHeight, 4);
          const numPillars = Math.floor(width / 20);
          for (let j = 0; j < numPillars; j++) {
              const pillar = new THREE.Mesh(pillarGeom, redMaterial);
              const xPos = -width/2 + 10 + j * 20;
              pillar.position.set(xPos, yPos + floorHeight / 2, depth / 2 - 5);
              wing.add(pillar);
          }
      }
      return wing;
  }

  const courtyardSize = wingWidth - wingDepth * 2;

  // Back Wing
  const backWing = createWing(wingWidth, wingDepth);
  backWing.position.z = -courtyardSize / 2 - wingDepth / 2;
  college.add(backWing);
  
  // Front Wing
  const frontWing = createWing(wingWidth, wingDepth);
  frontWing.position.z = courtyardSize / 2 + wingDepth / 2;
  frontWing.rotation.y = Math.PI;
  college.add(frontWing);

  // Left Wing
  const leftWing = createWing(courtyardSize + wingDepth*2, wingDepth);
  leftWing.position.x = -wingWidth / 2 + wingDepth / 2;
  leftWing.rotation.y = Math.PI / 2;
  college.add(leftWing);
  
  // Right Wing
  const rightWing = createWing(courtyardSize + wingDepth*2, wingDepth);
  rightWing.position.x = wingWidth / 2 - wingDepth / 2;
  rightWing.rotation.y = -Math.PI / 2;
  college.add(rightWing);

  // Courtyard Ground
  const groundGeom = new THREE.PlaneGeometry(courtyardSize, courtyardSize);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x55903c });
  const ground = new THREE.Mesh(groundGeom, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.1;
  college.add(ground);

  // Small structure in courtyard
  const hutGeom = new THREE.CylinderGeometry(15, 15, 10, 8);
  const hutMaterial = new THREE.MeshStandardMaterial({color: 0x9a3e3e});
  const hut = new THREE.Mesh(hutGeom, hutMaterial);
  hut.position.y = 5;
  hut.position.z = -50;
  college.add(hut);

  college.castShadow = true;
  college.receiveShadow = true;

  return college;
}
