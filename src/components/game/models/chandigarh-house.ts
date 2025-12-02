
import * as THREE from 'three';

export function createChandigarhHouse() {
  const house = new THREE.Group();

  const brickMaterial = new THREE.MeshStandardMaterial({
    color: 0x9a3e3e,
    roughness: 0.8,
  });

  const whiteFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    roughness: 0.7,
  });
  const windowGlassMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.4,
  });
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x332211,
    roughness: 0.9,
  });

  // --- Main Structure ---
  const mainBuildingWidth = 60;
  const mainBuildingHeight = 50;
  const mainBuildingDepth = 30;

  const mainGeom = new THREE.BoxGeometry(
    mainBuildingWidth,
    mainBuildingHeight,
    mainBuildingDepth
  );
  const mainBuilding = new THREE.Mesh(mainGeom, brickMaterial);
  mainBuilding.position.y = mainBuildingHeight / 2;
  house.add(mainBuilding);

  // --- Recessed Entrance on the right ---
  const entranceWidth = 15;
  const entranceHeight = 12;
  const entranceDepth = 10;
  const entranceGeom = new THREE.BoxGeometry(
    entranceWidth,
    entranceHeight,
    entranceDepth
  );
  // Using CSG-like approach by "subtracting" with a separate mesh
  const entranceCutout = new THREE.Mesh(
    entranceGeom,
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  ); // This won't be visible, it just carves space
  entranceCutout.position.set(
    mainBuildingWidth / 2 - entranceWidth / 2 - 5,
    entranceHeight / 2,
    mainBuildingDepth / 2 + 1
  );

  const whiteEntranceFrameGeom = new THREE.BoxGeometry(
    entranceWidth,
    entranceHeight,
    1
  );
  const whiteEntranceFrame = new THREE.Mesh(
    whiteEntranceFrameGeom,
    whiteFrameMaterial
  );
  whiteEntranceFrame.position.set(
    mainBuildingWidth / 2 - entranceWidth / 2 - 5,
    entranceHeight / 2,
    mainBuildingDepth / 2 - entranceDepth + 1
  );
  house.add(whiteEntranceFrame);

  // Door inside the recess
  const doorGeom = new THREE.BoxGeometry(6, 9, 0.5);
  const door = new THREE.Mesh(doorGeom, doorMaterial);
  door.position.set(
    mainBuildingWidth / 2 - entranceWidth / 2 - 5,
    4.5,
    mainBuildingDepth / 2 - entranceDepth + 1.2
  );
  house.add(door);

  // --- Windows ---

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

  const window1 = createTWindow(0, 28, mainBuildingDepth / 2 + 0.1);
  house.add(window1);

  const window2 = createTWindow(-20, 12, mainBuildingDepth / 2 + 0.1);
  house.add(window2);

  // Single vertical window
  const singleWindowGeom = new THREE.BoxGeometry(1.5, 6, 1);
  const singleWindow = new THREE.Mesh(singleWindowGeom, windowGlassMaterial);
  singleWindow.position.set(-25, 28, mainBuildingDepth / 2 + 0.1);
  house.add(singleWindow);

  const singleWindowFrameTop = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.5, 2),
    whiteFrameMaterial
  );
  singleWindowFrameTop.position.set(-25, 31.5, mainBuildingDepth / 2 + 0.1);
  house.add(singleWindowFrameTop);

  // --- Brick Latticework (Jali) with Cut Holes ---
  const jaliWidth = 20;
  const jaliHeight = 12;
  const jaliDepth = 2;

  const jaliShape = new THREE.Shape();
  jaliShape.moveTo(-jaliWidth / 2, -jaliHeight / 2);
  jaliShape.lineTo(jaliWidth / 2, -jaliHeight / 2);
  jaliShape.lineTo(jaliWidth / 2, jaliHeight / 2);
  jaliShape.lineTo(-jaliWidth / 2, jaliHeight / 2);
  jaliShape.lineTo(-jaliWidth / 2, -jaliHeight / 2);

  const holeSize = 1.5;
  const holeSpacing = 2.5;
  const numHolesX = 7;
  const numHolesY = 4;

  for (let i = 0; i < numHolesY; i++) {
    for (let j = 0; j < numHolesX; j++) {
      const holePath = new THREE.Path();
      const x = -jaliWidth / 2 + (j + 1) * holeSpacing - holeSize / 2;
      const y = -jaliHeight / 2 + (i + 1) * holeSpacing - holeSize / 2;
      holePath.moveTo(x, y);
      holePath.lineTo(x + holeSize, y);
      holePath.lineTo(x + holeSize, y + holeSize);
      holePath.lineTo(x, y + holeSize);
      holePath.lineTo(x, y);
      jaliShape.holes.push(holePath);
    }
  }

  const extrudeSettings = { depth: jaliDepth, bevelEnabled: false };
  const jaliGeometry = new THREE.ExtrudeGeometry(jaliShape, extrudeSettings);

  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const jaliMesh = new THREE.Mesh(jaliGeometry, [brickMaterial, whiteMaterial]);
  jaliMesh.position.set(
    -19,
    mainBuildingHeight - jaliHeight / 2,
    mainBuildingDepth / 2 - jaliDepth / 2 + 0.1
  );
  jaliMesh.castShadow = true;
  house.add(jaliMesh);

  // Right side plain brick part
  const plainPartGeom = new THREE.BoxGeometry(20, 12, 2);
  const plainPartMesh = new THREE.Mesh(plainPartGeom, brickMaterial);
  plainPartMesh.position.set(
    0,
    mainBuildingHeight - jaliHeight / 2,
    mainBuildingDepth / 2 - 1
  );
  house.add(plainPartMesh);

  // AC Unit
  const acGeom = new THREE.BoxGeometry(4, 3, 2);
  const acMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
  const acUnit = new THREE.Mesh(acGeom, acMaterial);
  acUnit.position.set(10, 20, mainBuildingDepth / 2 + 0.1);
  house.add(acUnit);

  // --- Right side door and holes ---
  const holeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const hole1Geom = new THREE.BoxGeometry(10, 6, 1);
  const hole1 = new THREE.Mesh(hole1Geom, holeMaterial);
  hole1.position.set(20, 35, mainBuildingDepth / 2 + 0.5);
  house.add(hole1);

  const hole2Geom = new THREE.BoxGeometry(10, 6, 1);
  const hole2 = new THREE.Mesh(hole2Geom, holeMaterial);
  hole2.position.set(20, 25, mainBuildingDepth / 2 + 0.5);
  house.add(hole2);

  const rightDoorGeom = new THREE.BoxGeometry(8, 12, 1);
  const rightDoor = new THREE.Mesh(rightDoorGeom, doorMaterial);
  rightDoor.position.set(20, 6, mainBuildingDepth / 2 + 0.5);
  house.add(rightDoor);

  house.castShadow = true;
  house.receiveShadow = true;

  return house;
}
