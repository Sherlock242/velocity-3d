
import * as THREE from 'three';

export function createGurudwara() {
  const gurudwara = new THREE.Group();
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.4 });
  const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x56a0d3, transparent: true, opacity: 0.7 });

  // --- Sarovar (Pool of Nectar) ---
  const sarovarSize = 120;
  const sarovarDepth = 5;
  const sarovarGeom = new THREE.BoxGeometry(sarovarSize, sarovarDepth, sarovarSize);
  const sarovarWater = new THREE.Mesh(sarovarGeom, waterMaterial);
  sarovarWater.position.y = -sarovarDepth / 2;
  gurudwara.add(sarovarWater);
  
  // Sarovar Border (Parikrama)
  const parikramaWidth = 10;
  const parikramaGeom = new THREE.BoxGeometry(sarovarSize + parikramaWidth * 2, 1, sarovarSize + parikramaWidth * 2);
  const parikrama = new THREE.Mesh(parikramaGeom, whiteMaterial);
  parikrama.position.y = 0.5;
  parikrama.receiveShadow = true;
  gurudwara.add(parikrama);

  // Main building group (to be placed in the center of the sarovar)
  const mainBuildingGroup = new THREE.Group();
  gurudwara.add(mainBuildingGroup);

  // Main building base
  const baseWidth = 50;
  const baseHeight = 30;
  const baseDepth = 50;
  const baseGeom = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
  const base = new THREE.Mesh(baseGeom, whiteMaterial);
  base.position.y = baseHeight / 2;
  base.castShadow = true;
  mainBuildingGroup.add(base);

  // --- Main Dome (Ribbed) ---
  const domeRadius = 18;
  const domeSegments = 32;
  const domeGeom = new THREE.SphereGeometry(domeRadius, domeSegments, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeom, goldMaterial);
  dome.position.y = baseHeight;
  mainBuildingGroup.add(dome);

  // Ribs on the dome
  const ribGeom = new THREE.CylinderGeometry(0.5, 0.5, domeRadius, 8);
  const ribMaterial = new THREE.MeshStandardMaterial({color: 0xf5f5f5});
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const rib = new THREE.Mesh(ribGeom, ribMaterial);
    rib.position.y = baseHeight + domeRadius * 0.45;
    rib.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.cos(angle), 0.9, Math.sin(angle)).normalize());
    mainBuildingGroup.add(rib);
  }

  // Golden top of the dome (kalash)
  const kalashBaseGeom = new THREE.CylinderGeometry(domeRadius * 0.8, domeRadius, 3, 32);
  const kalashBase = new THREE.Mesh(kalashBaseGeom, whiteMaterial);
  kalashBase.position.y = baseHeight + 1.5;
  mainBuildingGroup.add(kalashBase);
  
  const kalashGeom = new THREE.ConeGeometry(4, 10, 16);
  const kalash = new THREE.Mesh(kalashGeom, goldMaterial);
  kalash.position.y = baseHeight + domeRadius + 4;
  mainBuildingGroup.add(kalash);
  
  // --- Four corner chhatris (towers) ---
  const towerHeight = 18;
  const towerRadius = 4;
  
  const towerPositions = [
    { x: baseWidth / 2, z: baseDepth / 2 },
    { x: -baseWidth / 2, z: baseDepth / 2 },
    { x: baseWidth / 2, z: -baseDepth / 2 },
    { x: -baseWidth / 2, z: -baseDepth / 2 },
  ];

  towerPositions.forEach(pos => {
    const chhatri = new THREE.Group();
    // 4 pillars for each chhatri
    const pillarHeight = towerHeight;
    const pillarRadius = 0.5;
    const pillarGeom = new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight, 8);
    for(let i = 0; i < 4; i++) {
        const angle = i * Math.PI / 2 + Math.PI / 4;
        const pillar = new THREE.Mesh(pillarGeom, whiteMaterial);
        pillar.position.set(Math.cos(angle) * towerRadius, pillarHeight/2, Math.sin(angle) * towerRadius);
        chhatri.add(pillar);
    }
    
    const towerDomeGeom = new THREE.SphereGeometry(towerRadius, 16, 8, 0, Math.PI * 2, 0, Math.PI/2);
    const towerDome = new THREE.Mesh(towerDomeGeom, goldMaterial);
    towerDome.position.set(0, towerHeight, 0);
    chhatri.add(towerDome);

    const towerKalash = new THREE.Mesh(new THREE.ConeGeometry(1, 3, 8), goldMaterial);
    towerKalash.position.set(0, towerHeight + towerRadius, 0);
    chhatri.add(towerKalash);

    chhatri.position.set(pos.x, baseHeight, pos.z);
    mainBuildingGroup.add(chhatri);
  });

  // --- Entrance Archways ---
  const archWidth = 15;
  const archHeight = 20;
  const createArch = () => {
      const archGroup = new THREE.Group();
      const archShape = new THREE.Shape();
      archShape.moveTo(-archWidth / 2, 0);
      archShape.absarc(0, 0, archWidth / 2, Math.PI, 0, false);
      archShape.lineTo(archWidth / 2, -archHeight);
      archShape.lineTo(-archWidth / 2, -archHeight);
      archShape.closePath();

      const extrudeSettings = { depth: 2, bevelEnabled: false };
      const archGeom = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
      const archMesh = new THREE.Mesh(archGeom, whiteMaterial);
      archGroup.add(archMesh);
      
      const goldTrimGeom = new THREE.TorusGeometry(archWidth / 2, 0.5, 16, 32, Math.PI);
      const goldTrim = new THREE.Mesh(goldTrimGeom, goldMaterial);
      goldTrim.rotation.z = Math.PI;
      archGroup.add(goldTrim);
      
      return archGroup;
  }

  const frontArch = createArch();
  frontArch.position.set(0, archHeight, baseDepth / 2 + 1);
  mainBuildingGroup.add(frontArch);
  
  const backArch = createArch();
  backArch.position.set(0, archHeight, -baseDepth / 2 - 1);
  backArch.rotation.y = Math.PI;
  mainBuildingGroup.add(backArch);
  
  const leftArch = createArch();
  leftArch.position.set(-baseWidth / 2 - 1, archHeight, 0);
  leftArch.rotation.y = -Math.PI / 2;
  mainBuildingGroup.add(leftArch);
  
  const rightArch = createArch();
  rightArch.position.set(baseWidth / 2 + 1, archHeight, 0);
  rightArch.rotation.y = Math.PI / 2;
  mainBuildingGroup.add(rightArch);
  
  // Bridge to the entrance
  const bridgeWidth = 10;
  const bridgeLength = (sarovarSize / 2) - (baseWidth / 2);
  const bridgeGeom = new THREE.BoxGeometry(bridgeWidth, 2, bridgeLength);
  const bridge = new THREE.Mesh(bridgeGeom, whiteMaterial);
  bridge.position.set(-(baseWidth/2 + bridgeLength / 2), 1, 0);
  bridge.rotation.y = Math.PI / 2;
  bridge.receiveShadow = true;
  gurudwara.add(bridge);


  gurudwara.castShadow = true;
  gurudwara.receiveShadow = true;

  return gurudwara;
}
