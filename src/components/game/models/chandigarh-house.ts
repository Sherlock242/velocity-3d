
import * as THREE from 'three';

export function createChandigarhHouse() {
  const house = new THREE.Group();

  const brickMaterial = new THREE.MeshStandardMaterial({
    color: 0x9a3e3e,
    roughness: 0.8,
  });

  // Main building structure
  const mainGeom = new THREE.BoxGeometry(40, 50, 30);
  const mainBuilding = new THREE.Mesh(mainGeom, brickMaterial);
  mainBuilding.position.y = 25;
  house.add(mainBuilding);

  const whiteFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    roughness: 0.7,
  });
  const windowGlassMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.4,
  });

  // T-shaped windows
  function createTWindow(x: number, y: number, z: number) {
    const windowGroup = new THREE.Group();
    windowGroup.position.set(x, y, z);

    // Horizontal part of T
    const hGeom = new THREE.BoxGeometry(10, 2, 2);
    const hMesh = new THREE.Mesh(hGeom, whiteFrameMaterial);
    hMesh.position.y = 3;
    windowGroup.add(hMesh);

    // Vertical part of T
    const vGeom = new THREE.BoxGeometry(2, 8, 2);
    const vMesh = new THREE.Mesh(vGeom, whiteFrameMaterial);
    vMesh.position.y = -1;
    windowGroup.add(vMesh);

    // Glass panes
    const paneGeom = new THREE.BoxGeometry(7, 6, 1);
    const leftPane = new THREE.Mesh(paneGeom, windowGlassMaterial);
    leftPane.position.set(-4.5, -2, -0.5);
    windowGroup.add(leftPane);

    const rightPane = new THREE.Mesh(paneGeom, windowGlassMaterial);
    rightPane.position.set(4.5, -2, -0.5);
    windowGroup.add(rightPane);
    
    return windowGroup;
  }

  const window1 = createTWindow(8, 28, 15.1);
  house.add(window1);

  const window2 = createTWindow(-8, 12, 15.1);
  house.add(window2);
  
  // Single vertical window
  const singleWindowGeom = new THREE.BoxGeometry(1.5, 6, 1);
  const singleWindow = new THREE.Mesh(singleWindowGeom, windowGlassMaterial);
  singleWindow.position.set(-15, 28, 15.1);
  house.add(singleWindow);
  
  const singleWindowFrameTop = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 2), whiteFrameMaterial);
  singleWindowFrameTop.position.set(-15, 31.5, 15.1);
  house.add(singleWindowFrameTop);


  // Brick Latticework (Jali)
  const jaliWidth = 38;
  const jaliHeight = 12;
  const jaliDepth = 2;
  
  // Single white panel behind the jali
  const jaliBackingMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const jaliBackingGeom = new THREE.BoxGeometry(jaliWidth, jaliHeight, 0.5);
  const jaliBackingMesh = new THREE.Mesh(jaliBackingGeom, jaliBackingMaterial);
  jaliBackingMesh.position.set(0, 44, 15 - jaliDepth);
  house.add(jaliBackingMesh);


  // AC Unit
  const acGeom = new THREE.BoxGeometry(4, 3, 2);
  const acMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
  const acUnit = new THREE.Mesh(acGeom, acMaterial);
  acUnit.position.set(2, 20, 15.1);
  house.add(acUnit);

  house.castShadow = true;
  house.receiveShadow = true;

  return house;
}
