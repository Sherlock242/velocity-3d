
import * as THREE from 'three';

export function createWardencliffTower() {
  const wardencliffGroup = new THREE.Group();

  const brickMaterial = new THREE.MeshStandardMaterial({ color: 0x9a3e3e, roughness: 0.9 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
  const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 });
  const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.4 });

  // --- Base Building ---
  const building = new THREE.Group();
  building.name = 'wardencliffBuilding';
  wardencliffGroup.add(building);

  const buildingWidth = 150;
  const buildingHeight = 25;
  const buildingDepth = 40;

  const mainGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
  const mainBuilding = new THREE.Mesh(mainGeom, brickMaterial);
  mainBuilding.position.y = buildingHeight / 2;
  mainBuilding.castShadow = true;
  building.add(mainBuilding);

  const mainRoofGeom = new THREE.CylinderGeometry(buildingDepth / 2, buildingDepth / 2, buildingWidth, 8);
  const mainRoof = new THREE.Mesh(mainRoofGeom, roofMaterial);
  mainRoof.scale.y = 0.5;
  mainRoof.rotation.x = Math.PI / 2;
  mainRoof.rotation.z = Math.PI / 2;
  mainRoof.position.y = buildingHeight;
  building.add(mainRoof);
  

  // Windows and Doors
  function createWindow() {
    const windowGroup = new THREE.Group();
    const frameGeom = new THREE.BoxGeometry(8, 12, 1);
    const frame = new THREE.Mesh(frameGeom, woodMaterial);
    const glassGeom = new THREE.PlaneGeometry(7, 11);
    const glass = new THREE.Mesh(glassGeom, glassMaterial);
    glass.position.z = 0.6;
    windowGroup.add(frame, glass);
    return windowGroup;
  }

  const numWindows = 8;
  for (let i = 0; i < numWindows; i++) {
    const xPos = -buildingWidth / 2 + 15 + i * 16;
    const window = createWindow();
    if (i > 1 && i < 6) { // Skip for doors and central part
      window.position.set(xPos, 8, buildingDepth / 2 + 0.1);
      building.add(window);
    }
  }

  // Double Door
  const doorGroup = new THREE.Group();
  const leftDoorGeom = new THREE.BoxGeometry(8, 18, 1);
  const leftDoor = new THREE.Mesh(leftDoorGeom, woodMaterial);
  leftDoor.position.x = -4;
  doorGroup.add(leftDoor);
  
  const rightDoor = new THREE.Mesh(leftDoorGeom, woodMaterial);
  rightDoor.position.x = 4;
  doorGroup.add(rightDoor);

  doorGroup.position.set(0, 9, buildingDepth/2);
  building.add(doorGroup);
  
  // Chimney
  const chimneyWidth = 8;
  const chimneyHeight = 40;
  const chimneyGeom = new THREE.BoxGeometry(chimneyWidth, chimneyHeight, chimneyWidth);
  const chimney = new THREE.Mesh(chimneyGeom, brickMaterial);
  chimney.position.set(0, chimneyHeight / 2, -10);
  building.add(chimney);


  // --- Tower ---
  const tower = new THREE.Group();
  tower.name = 'wardencliffTower';
  wardencliffGroup.add(tower);

  const towerHeight = 300;
  const bottomRadius = 50;
  const topRadius = 25;

  const numLegs = 8;
  const legGeom = new THREE.CylinderGeometry(2, 1, towerHeight, 8);

  for (let i = 0; i < numLegs; i++) {
    const angle = (i / numLegs) * Math.PI * 2;
    const leg = new THREE.Mesh(legGeom, metalMaterial);
    leg.position.set(
      Math.cos(angle) * bottomRadius,
      towerHeight / 2,
      Math.sin(angle) * bottomRadius
    );
    leg.lookAt(0, towerHeight / 2, 0);
    leg.rotation.x += Math.PI / 2; // Orient cylinder vertically
    tower.add(leg);
  }

  // Lattice work (simplified)
  const numRings = 10;
  for (let i = 0; i < numRings; i++) {
    const ringY = (i / numRings) * towerHeight;
    const ringRadius = THREE.MathUtils.lerp(bottomRadius, topRadius, i / numRings);
    const ringGeom = new THREE.TorusGeometry(ringRadius, 1, 8, 32);
    const ring = new THREE.Mesh(ringGeom, metalMaterial);
    ring.position.y = ringY;
    ring.rotation.x = Math.PI / 2;
    tower.add(ring);

    // Cross-braces
    const braceGeom = new THREE.CylinderGeometry(1, 1, ringRadius * 1.5, 8);
    for (let j = 0; j < numLegs; j++) {
        const angle = (j / numLegs) * Math.PI * 2 + (i % 2 === 0 ? 0 : Math.PI / numLegs);
        const brace = new THREE.Mesh(braceGeom, metalMaterial);
        brace.position.y = ringY;
        brace.rotation.y = angle;
        brace.rotation.z = (Math.random() - 0.5) * Math.PI;
        tower.add(brace);
    }
  }


  // --- Top Dome ---
  const domeRadius = 35;
  const domeGeom = new THREE.SphereGeometry(domeRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const wireframeGeom = new THREE.WireframeGeometry(domeGeom);
  const wireframe = new THREE.LineSegments(wireframeGeom, new THREE.LineBasicMaterial({ color: 0x666666 }));
  wireframe.position.y = towerHeight;
  tower.add(wireframe);

  const domeBaseGeom = new THREE.CylinderGeometry(domeRadius, domeRadius, 5, 32);
  const domeBase = new THREE.Mesh(domeBaseGeom, metalMaterial);
  domeBase.position.y = towerHeight;
  tower.add(domeBase);

  wardencliffGroup.castShadow = true;
  wardencliffGroup.receiveShadow = true;
  
  return wardencliffGroup;
}
