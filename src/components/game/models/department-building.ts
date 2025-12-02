
import * as THREE from 'three';

function createTextSprite(text: string) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return new THREE.Sprite();

  const fontSize = 80;
  context.font = `bold ${fontSize}px Arial`;

  const textMetrics = context.measureText(text);
  canvas.width = textMetrics.width;
  canvas.height = fontSize * 1.2;

  context.font = `bold ${fontSize}px Arial`;
  context.fillStyle = 'rgba(0, 0, 0, 0.7)';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);

  const aspectRatio = canvas.width / canvas.height;
  sprite.scale.set(50 * aspectRatio, 50, 1);
  return sprite;
}

export function createDepartmentBuilding(name: string) {
  const building = new THREE.Group();

  const buildingHeight = 25;
  const buildingWidth = 150;
  const buildingDepth = 40;

  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc, // Light grey concrete
    roughness: 0.8,
  });

  const buildingGeom = new THREE.BoxGeometry(
    buildingWidth,
    buildingHeight,
    buildingDepth
  );
  const mainBuilding = new THREE.Mesh(buildingGeom, buildingMaterial);
  mainBuilding.position.y = buildingHeight / 2;
  mainBuilding.castShadow = true;
  building.add(mainBuilding);

  // Add windows
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x88aaff,
    emissive: 0x3366cc,
    emissiveIntensity: 0.2,
  });
  const windowGeom = new THREE.BoxGeometry(buildingWidth - 10, 8, 1);
  const frontWindows = new THREE.Mesh(windowGeom, windowMaterial);
  frontWindows.position.set(0, buildingHeight * 0.6, buildingDepth / 2 + 0.1);
  building.add(frontWindows);

  const backWindows = new THREE.Mesh(windowGeom, windowMaterial);
  backWindows.position.set(0, buildingHeight * 0.6, -buildingDepth / 2 - 0.1);
  building.add(backWindows);

  const departmentName = createTextSprite(name);
  departmentName.position.set(0, buildingHeight + 15, 0);
  building.add(departmentName);

  return building;
}
