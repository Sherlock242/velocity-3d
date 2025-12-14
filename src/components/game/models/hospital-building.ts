
import * as THREE from 'three';

export function createHospitalBuilding() {
  const hospital = new THREE.Group();
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xe5e5e5 });
  const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x1e90ff }); // DodgerBlue
  const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xafeeee, transparent: true, opacity: 0.7 }); // PaleTurquoise

  const mainWidth = 100;
  const mainHeight = 60;
  const mainDepth = 50;

  // Main Building Block
  const mainGeom = new THREE.BoxGeometry(mainWidth, mainHeight, mainDepth);
  const mainBuilding = new THREE.Mesh(mainGeom, whiteMaterial);
  mainBuilding.position.y = mainHeight / 2;
  hospital.add(mainBuilding);

  // Blue vertical stripes
  const numStripes = 10;
  for (let i = 0; i < numStripes; i++) {
    const stripeGeom = new THREE.BoxGeometry(2, mainHeight, 1);
    const stripe = new THREE.Mesh(stripeGeom, blueMaterial);
    const xPos = -mainWidth / 2 + (i + 0.5) * (mainWidth / numStripes);
    stripe.position.set(xPos, mainHeight / 2, mainDepth / 2 + 0.1);
    hospital.add(stripe);
  }

  // Entrance
  const entranceWidth = 20;
  const entranceHeight = 15;
  const entranceGeom = new THREE.BoxGeometry(entranceWidth, entranceHeight, 5);
  const entrance = new THREE.Mesh(entranceGeom, blueMaterial);
  entrance.position.set(0, entranceHeight / 2, mainDepth / 2 + 2.5);
  hospital.add(entrance);
  
  // Hospital Sign (Red Cross)
  const crossGroup = new THREE.Group();
  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const hBarGeom = new THREE.BoxGeometry(10, 3, 1);
  const vBarGeom = new THREE.BoxGeometry(3, 10, 1);
  const hBar = new THREE.Mesh(hBarGeom, redMaterial);
  const vBar = new THREE.Mesh(vBarGeom, redMaterial);
  crossGroup.add(hBar, vBar);
  crossGroup.position.set(0, mainHeight - 10, mainDepth / 2 + 0.6);
  hospital.add(crossGroup);
  
  hospital.castShadow = true;
  hospital.receiveShadow = true;

  return hospital;
}
