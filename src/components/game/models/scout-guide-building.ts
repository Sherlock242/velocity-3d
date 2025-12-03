
import * as THREE from 'three';

export function createScoutGuideBuilding() {
  const building = new THREE.Group();
  building.name = 'ScoutGuideBuilding';

  const buildingWidth = 50;
  const buildingHeight = 30;
  const buildingDepth = 40;

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x00008b, // Dark Blue
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  });

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeeeee, // Light grey/white frame
  });

  // Main glass structure
  const mainGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
  const mainMesh = new THREE.Mesh(mainGeom, glassMaterial);
  mainMesh.position.y = buildingHeight / 2;
  building.add(mainMesh);

  // Frame around the building
  const frameThickness = 1.5;

  // Vertical Edges
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2;
    const x = Math.cos(angle) * (buildingWidth / 2);
    const z = Math.sin(angle) * (buildingDepth / 2);
    
    const edgeGeom = new THREE.BoxGeometry(frameThickness, buildingHeight, frameThickness);
    const edge = new THREE.Mesh(edgeGeom, frameMaterial);
    edge.position.set(x, buildingHeight / 2, z);
    building.add(edge);
  }
  
  // Top and Bottom Edges
  const topFrameGeom = new THREE.BoxGeometry(buildingWidth + frameThickness, frameThickness, buildingDepth + frameThickness);
  const topFrame = new THREE.Mesh(topFrameGeom, frameMaterial);
  topFrame.position.y = buildingHeight;
  building.add(topFrame);
  
  const bottomFrame = topFrame.clone();
  bottomFrame.position.y = 0;
  building.add(bottomFrame);

  building.castShadow = true;
  building.receiveShadow = true;

  return building;
}

    