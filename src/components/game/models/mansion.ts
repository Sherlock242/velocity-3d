import * as THREE from 'three';

export function createMansion() {
  const mansion = new THREE.Group();
  const mansionMaterial = new THREE.MeshStandardMaterial({ color: 0xe0d7c6 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3a2a });

  // Main building
  const mainBuildingGeom = new THREE.BoxGeometry(80, 40, 50);
  const mainBuilding = new THREE.Mesh(mainBuildingGeom, mansionMaterial);
  mainBuilding.position.y = 20;
  mansion.add(mainBuilding);

  const mainRoofGeom = new THREE.ConeGeometry(60, 20, 4);
  const mainRoof = new THREE.Mesh(mainRoofGeom, roofMaterial);
  mainRoof.position.y = 40 + 10;
  mainRoof.rotation.y = Math.PI / 4;
  mansion.add(mainRoof);

  // Left Wing
  const leftWingGeom = new THREE.BoxGeometry(50, 30, 60);
  const leftWing = new THREE.Mesh(leftWingGeom, mansionMaterial);
  leftWing.position.set(-65, 15, 0);
  mansion.add(leftWing);

  const leftRoofGeom = new THREE.BoxGeometry(50, 2, 60);
  const leftRoof = new THREE.Mesh(leftRoofGeom, roofMaterial);
  leftRoof.position.set(-65, 31, 0);
  mansion.add(leftRoof);

  // Right Wing
  const rightWingGeom = new THREE.BoxGeometry(50, 30, 60);
  const rightWing = new THREE.Mesh(rightWingGeom, mansionMaterial);
  rightWing.position.set(65, 15, 0);
  mansion.add(rightWing);

  const rightRoofGeom = new THREE.BoxGeometry(50, 2, 60);
  const rightRoof = new THREE.Mesh(rightRoofGeom, roofMaterial);
  rightRoof.position.set(65, 31, 0);
  mansion.add(rightRoof);

  // Entrance pillars
  const pillarGeom = new THREE.CylinderGeometry(4, 4, 30, 16);
  const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0xd4c8b0 });
  const pillar1 = new THREE.Mesh(pillarGeom, pillarMaterial);
  pillar1.position.set(-20, 15, 30);
  mansion.add(pillar1);
  const pillar2 = new THREE.Mesh(pillarGeom, pillarMaterial);
  pillar2.position.set(20, 15, 30);
  mansion.add(pillar2);
  
  // Parking Area
  const parkingGeom = new THREE.PlaneGeometry(120, 80);
  const parkingMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const parkingArea = new THREE.Mesh(parkingGeom, parkingMaterial);
  parkingArea.rotation.x = -Math.PI / 2;
  parkingArea.position.y = 0.15;
  parkingArea.position.z = 60; // In front of the pillars
  mansion.add(parkingArea);

  return mansion;
}

    