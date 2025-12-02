import * as THREE from 'three';

export function createPunjabUniversity() {
  const university = new THREE.Group();

  const brickMaterial = new THREE.MeshStandardMaterial({
    color: 0x9a3e3e,
    roughness: 0.9,
  });
  const concreteMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    roughness: 0.8,
  });
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x4682b4,
    transparent: true,
    opacity: 0.7,
  });

  // --- Gandhi Bhawan (Lotus Building) ---
  const gandhiBhawan = new THREE.Group();
  gandhiBhawan.position.set(-80, 0, 0);

  // Pool
  const poolGeom = new THREE.CylinderGeometry(50, 50, 2, 32);
  const pool = new THREE.Mesh(poolGeom, concreteMaterial);
  pool.position.y = 1;
  gandhiBhawan.add(pool);

  const waterGeom = new THREE.CylinderGeometry(48, 48, 1.5, 32);
  const water = new THREE.Mesh(waterGeom, waterMaterial);
  water.position.y = 1.25;
  gandhiBhawan.add(water);

  // Lotus Petals
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0);
  petalShape.bezierCurveTo(10, 30, 20, 50, 0, 80);
  petalShape.bezierCurveTo(-20, 50, -10, 30, 0, 0);

  const extrudeSettings = { depth: 4, bevelEnabled: false };
  const petalGeom = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);

  const petalMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 3; i++) {
    const petal = new THREE.Mesh(petalGeom, petalMaterial);
    petal.rotation.y = (i * Math.PI * 2) / 3;
    petal.rotation.x = -Math.PI / 6;
    petal.position.y = 2;
    gandhiBhawan.add(petal);
  }
  university.add(gandhiBhawan);

  // --- Main Admin/Library Building ---
  const mainBuilding = new THREE.Group();
  mainBuilding.position.set(150, 0, 0);

  // Main block
  const mainBlockGeom = new THREE.BoxGeometry(100, 30, 40);
  const mainBlock = new THREE.Mesh(mainBlockGeom, brickMaterial);
  mainBlock.position.y = 15;
  mainBuilding.add(mainBlock);

  // Tower
  const towerHeight = 100;
  const towerGeom = new THREE.BoxGeometry(30, towerHeight, 30);
  const tower = new THREE.Mesh(towerGeom, brickMaterial);
  tower.position.set(-30, towerHeight / 2, 0);
  mainBuilding.add(tower);

  // Tower top
  const towerTopGeom = new THREE.BoxGeometry(35, 5, 35);
  const towerTop = new THREE.Mesh(towerTopGeom, concreteMaterial);
  towerTop.position.set(-30, towerHeight + 2.5, 0);
  mainBuilding.add(towerTop);

  // Windows on tower
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  for (let i = 0; i < 8; i++) {
    const windowGeom = new THREE.BoxGeometry(20, 1.5, 1);
    const window = new THREE.Mesh(windowGeom, windowMaterial);
    window.position.set(-30, 15 + i * 10, 15.1);
    mainBuilding.add(window);
  }

  // Jali (Latticework) on main building
  const jaliWidth = 90;
  const jaliHeight = 20;
  const jaliShape = new THREE.Shape();
  jaliShape.moveTo(-jaliWidth / 2, -jaliHeight / 2);
  jaliShape.lineTo(jaliWidth / 2, -jaliHeight / 2);
  jaliShape.lineTo(jaliWidth / 2, jaliHeight / 2);
  jaliShape.lineTo(-jaliWidth / 2, jaliHeight / 2);
  jaliShape.lineTo(-jaliWidth / 2, -jaliHeight / 2);

  const holeSize = 4;
  for (let y = -jaliHeight / 2 + 5; y < jaliHeight / 2; y += 10) {
    for (let x = -jaliWidth / 2 + 5; x < jaliWidth / 2; x += 10) {
      const holePath = new THREE.Path();
      holePath.absarc(x, y, holeSize / 2, 0, Math.PI * 2, false);
      jaliShape.holes.push(holePath);
    }
  }

  const jaliExtrudeSettings = { depth: 2, bevelEnabled: false };
  const jaliGeometry = new THREE.ExtrudeGeometry(
    jaliShape,
    jaliExtrudeSettings
  );
  const jaliMesh = new THREE.Mesh(jaliGeometry, concreteMaterial);
  jaliMesh.position.set(0, 20, 20.1);
  mainBuilding.add(jaliMesh);

  university.add(mainBuilding);
  return university;
}
