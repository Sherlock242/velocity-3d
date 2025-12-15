import * as THREE from 'three';

// Function to create a texture with vertical text
function createTextTexture(
  text: string,
  pillarColor: THREE.Color,
  textColor: string,
  width: number,
  height: number
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  // Fill background with pillar color to avoid seams
  context.fillStyle = `#${pillarColor.getHexString()}`;
  context.fillRect(0, 0, width, height);

  // Set text properties
  const fontSize = width * 0.8;
  context.font = `bold ${fontSize}px sans-serif`;
  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Draw text character by character vertically
  const characters = text.split('');
  const charHeight = height / characters.length;
  for (let i = 0; i < characters.length; i++) {
    context.fillText(characters[i], width / 2, charHeight * (i + 0.5));
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createToriiGate() {
  const torii = new THREE.Group();

  const orangeMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4500, // Bright orange-red
    roughness: 0.6,
  });

  const blackMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, // Near-black
    roughness: 0.5,
  });

  const pillarRadius = 8;
  const pillarHeight = 100;
  const pillarDistance = 90;

  // --- Create Textures ---
  const text1 = '平成二十三年二月吉日建之';
  const text2 = '名古屋市 マリオングループ';
  const pillarColor = orangeMaterial.color;
  const textColor = '#000000';

  const texture1 = createTextTexture(text1, pillarColor, textColor, 128, 1024);
  const texture2 = createTextTexture(text2, pillarColor, textColor, 128, 1024);

  // --- Vertical Pillars ---
  const pillarGeom = new THREE.CylinderGeometry(
    pillarRadius,
    pillarRadius * 0.9,
    pillarHeight,
    16
  );

  // Create two materials: one with text, one without
  const pillarMaterialWithText1 = orangeMaterial.clone();
  if (texture1) {
    pillarMaterialWithText1.map = texture1;
  }

  const pillarMaterialWithText2 = orangeMaterial.clone();
  if (texture2) {
    pillarMaterialWithText2.map = texture2;
  }

  const leftPillar = new THREE.Mesh(pillarGeom, pillarMaterialWithText1);
  leftPillar.position.set(-pillarDistance / 2, pillarHeight / 2, 0);
  torii.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeom, pillarMaterialWithText2);
  rightPillar.position.set(pillarDistance / 2, pillarHeight / 2, 0);
  torii.add(rightPillar);

  // Base for pillars
  const baseGeom = new THREE.CylinderGeometry(
    pillarRadius + 1,
    pillarRadius + 2,
    8,
    16
  );
  const leftBase = new THREE.Mesh(baseGeom, blackMaterial);
  leftBase.position.set(-pillarDistance / 2, 4, 0);
  torii.add(leftBase);

  const rightBase = new THREE.Mesh(baseGeom, blackMaterial);
  rightBase.position.set(pillarDistance / 2, 4, 0);
  torii.add(rightBase);

  // --- Horizontal Beams ---

  // Top beam (Kasagi) with upward curve
  const kasagiLength = pillarDistance + 60;
  const kasagiHeight = 10;
  const kasagiDepth = 10;

  const kasagiShape = new THREE.Shape();
  const halfLength = kasagiLength / 2;
  kasagiShape.moveTo(-halfLength, 0);
  kasagiShape.quadraticCurveTo(0, kasagiHeight / 2, halfLength, 0);
  kasagiShape.lineTo(halfLength, -kasagiHeight);
  kasagiShape.quadraticCurveTo(0, -kasagiHeight / 2, -halfLength, -kasagiHeight);
  kasagiShape.closePath();

  const kasagiExtrudeSettings = { depth: kasagiDepth, bevelEnabled: false };
  const kasagiGeom = new THREE.ExtrudeGeometry(
    kasagiShape,
    kasagiExtrudeSettings
  );

  const kasagi = new THREE.Mesh(kasagiGeom, blackMaterial);
  kasagi.position.set(0, pillarHeight, -kasagiDepth / 2);
  torii.add(kasagi);

  // Second beam (Nuki)
  const nukiWidth = pillarDistance + 10;
  const nukiHeight = 8;
  const nukiDepth = 8;
  const nukiGeom = new THREE.BoxGeometry(nukiWidth, nukiHeight, nukiDepth);
  const nuki = new THREE.Mesh(nukiGeom, orangeMaterial);
  nuki.position.set(0, pillarHeight - 30, 0);
  torii.add(nuki);

  // Small center piece (Gakuzuka)
  const gakuzukaGeom = new THREE.BoxGeometry(15, 12, 10);
  const gakuzuka = new THREE.Mesh(gakuzukaGeom, orangeMaterial);
  gakuzuka.position.y = pillarHeight - 12;
  torii.add(gakuzuka);

  torii.castShadow = true;
  torii.receiveShadow = true;

  return torii;
}
