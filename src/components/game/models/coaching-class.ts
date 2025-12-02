
import * as THREE from 'three';

export function createCoachingClass() {
  const building = new THREE.Group();
  const mainMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.8 }); // Off-White
  const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 }); // Brown
  const blueSignMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff, metalness: 0.2, roughness: 0.5 }); // Blue sign
  const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.5 });

  const buildingWidth = 40;
  const buildingHeight = 25;
  const buildingDepth = 30;
  const borderWidth = 1.5;

  // Main Structure
  const mainGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
  const mainMesh = new THREE.Mesh(mainGeom, mainMaterial);
  mainMesh.position.y = buildingHeight / 2;
  mainMesh.castShadow = true;
  mainMesh.receiveShadow = true;
  building.add(mainMesh);

  // --- Decorative Borders ---
  // Top border
  const topBorderGeom = new THREE.BoxGeometry(buildingWidth + borderWidth, borderWidth, buildingDepth + borderWidth);
  const topBorder = new THREE.Mesh(topBorderGeom, borderMaterial);
  topBorder.position.y = buildingHeight - borderWidth / 2;
  building.add(topBorder);
  
  // Bottom border
  const bottomBorder = topBorder.clone();
  bottomBorder.position.y = borderWidth / 2;
  building.add(bottomBorder);

  // Vertical corner borders
  const sideBorderGeom = new THREE.BoxGeometry(borderWidth, buildingHeight, borderWidth);
  const frontLeftBorder = new THREE.Mesh(sideBorderGeom, borderMaterial);
  frontLeftBorder.position.set(-buildingWidth / 2, buildingHeight / 2, buildingDepth / 2);
  building.add(frontLeftBorder);
  const frontRightBorder = frontLeftBorder.clone();
  frontRightBorder.position.x = buildingWidth / 2;
  building.add(frontRightBorder);
  
  // --- Sign ---
  const signGeom = new THREE.BoxGeometry(25, 6, 0.5);
  const sign = new THREE.Mesh(signGeom, blueSignMaterial);
  sign.position.set(0, buildingHeight - 10, buildingDepth / 2 + 0.3);
  // Add a border to the sign
  const signBorderGeom = new THREE.BoxGeometry(26, 7, 0.5);
  const signBorder = new THREE.Mesh(signBorderGeom, new THREE.MeshStandardMaterial({color: 0xffffff}));
  sign.add(signBorder);
  signBorder.position.z = -0.1;
  building.add(sign);
  
  // --- Door ---
  const doorGeom = new THREE.BoxGeometry(6, 10, 0.5);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(0, 5, buildingDepth / 2 + 0.3);
  // Door frame
  const doorFrameGeom = new THREE.BoxGeometry(7, 11, 0.5);
  const doorFrame = new THREE.Mesh(doorFrameGeom, borderMaterial);
  doorFrame.position.set(0, 5.5, buildingDepth / 2 + 0.1);
  building.add(doorFrame);
  building.add(door);

  // --- Windows ---
  const windowWidth = 8;
  const windowHeight = 6;
  const windowGeom = new THREE.BoxGeometry(windowWidth, windowHeight, 0.5);
  
  const window1 = new THREE.Mesh(windowGeom, glassMaterial);
  window1.position.set(-15, 16, buildingDepth / 2 + 0.3);
  
  const window2 = new THREE.Mesh(windowGeom, glassMaterial);
  window2.position.set(15, 16, buildingDepth / 2 + 0.3);
  
  // Window Frames
  const windowFrameGeom = new THREE.BoxGeometry(windowWidth + 1, windowHeight + 1, 0.5);
  const windowFrameMaterial = new THREE.MeshStandardMaterial({color: 0xaaaaaa});
  
  const frame1 = new THREE.Mesh(windowFrameGeom, windowFrameMaterial);
  frame1.position.set(window1.position.x, window1.position.y, window1.position.z - 0.1);
  
  const frame2 = new THREE.Mesh(windowFrameGeom, windowFrameMaterial);
  frame2.position.set(window2.position.x, window2.position.y, window2.position.z - 0.1);
  
  building.add(window1, window2, frame1, frame2);
  
  // Air Conditioner Unit
  const acGeom = new THREE.BoxGeometry(5, 3, 2.5);
  const acMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3 });
  const acUnit = new THREE.Mesh(acGeom, acMaterial);
  acUnit.position.set(15, 8, buildingDepth/2 + 1);
  // AC fan
  const fanGeom = new THREE.CircleGeometry(1, 8);
  const fanMaterial = new THREE.MeshStandardMaterial({color: 0x333333});
  const fan = new THREE.Mesh(fanGeom, fanMaterial);
  fan.position.z = 1.3;
  acUnit.add(fan);
  building.add(acUnit);

  building.castShadow = true;
  building.receiveShadow = true;

  return building;
}
