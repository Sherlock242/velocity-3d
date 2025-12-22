
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
  const fontSize = width * 0.4;
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
  
  const pillarMaterialWithText1 = orangeMaterial.clone();
  if (texture1) {
    pillarMaterialWithText1.map = texture1;
  }

  const pillarMaterialWithText2 = orangeMaterial.clone();
  if (texture2) {
    pillarMaterialWithText2.map = texture2;
  }

  // --- Geometries ---
  const geometriesToMergeOrange = [];
  const geometriesToMergeBlack = [];
  
  // Nuki (second beam)
  const nukiGeom = new THREE.BoxGeometry(pillarDistance + 10, 8, 8);
  nukiGeom.translate(0, pillarHeight - 30, 0);
  geometriesToMergeOrange.push(nukiGeom);

  // Gakuzuka (center piece)
  const gakuzukaGeom = new THREE.BoxGeometry(15, 12, 10);
  gakuzukaGeom.translate(0, pillarHeight - 12, 0);
  geometriesToMergeOrange.push(gakuzukaGeom);

  // Kasagi (top beam)
  const kasagiLength = pillarDistance + 60;
  const kasagiHeight = 10;
  const kasagiDepth = 10;
  const kasagiShape = new THREE.Shape();
  kasagiShape.moveTo(-kasagiLength / 2, 0);
  kasagiShape.quadraticCurveTo(0, kasagiHeight / 2, kasagiLength / 2, 0);
  kasagiShape.lineTo(kasagiLength / 2, -kasagiHeight);
  kasagiShape.quadraticCurveTo(0, -kasagiHeight / 2, -kasagiLength / 2, -kasagiHeight);
  kasagiShape.closePath();
  const kasagiExtrudeSettings = { depth: kasagiDepth, bevelEnabled: false };
  const kasagiGeom = new THREE.ExtrudeGeometry(kasagiShape, kasagiExtrudeSettings);
  kasagiGeom.translate(0, pillarHeight, -kasagiDepth / 2);
  geometriesToMergeBlack.push(kasagiGeom.toNonIndexed());
  
  // Bases
  const baseGeom = new THREE.CylinderGeometry(pillarRadius + 1, pillarRadius + 2, 8, 16);
  const leftBaseGeom = baseGeom.clone().translate(-pillarDistance / 2, 4, 0);
  const rightBaseGeom = baseGeom.clone().translate(pillarDistance / 2, 4, 0);
  geometriesToMergeBlack.push(leftBaseGeom.toNonIndexed(), rightBaseGeom.toNonIndexed());

  // --- Create final merged meshes ---
  const torii = new THREE.Group();

  const orangeMergedGeom = mergeGeometries(geometriesToMergeOrange);
  const orangeMesh = new THREE.Mesh(orangeMergedGeom, orangeMaterial);
  torii.add(orangeMesh);
  
  const blackMergedGeom = mergeGeometries(geometriesToMergeBlack);
  const blackMesh = new THREE.Mesh(blackMergedGeom, blackMaterial);
  torii.add(blackMesh);

  // Pillars are separate meshes to allow for unique textures
  const pillarGeom = new THREE.CylinderGeometry(pillarRadius, pillarRadius * 0.9, pillarHeight, 16);
  
  const leftPillar = new THREE.Mesh(pillarGeom, pillarMaterialWithText1);
  leftPillar.position.set(-pillarDistance / 2, pillarHeight / 2, 0);
  torii.add(leftPillar);
  
  const rightPillar = new THREE.Mesh(pillarGeom, pillarMaterialWithText2);
  rightPillar.position.set(pillarDistance / 2, pillarHeight / 2, 0);
  torii.add(rightPillar);

  torii.castShadow = false;
  torii.receiveShadow = false;

  return torii;
}
