
import * as THREE from 'three';
import { createHair } from './player-hair';

export function createPlayerCharacter(
  isPlayer = false,
  gender: 'male' | 'female' = 'male',
  isLobby = false
) {
  const character = new THREE.Group();

  // Materials
  const skinTone = 0xffdbac;
  const shirtColor = 0x222a4d;
  const pantsColor = 0x1a1a1a;
  const beltColor = 0x5d4037;
  const metalColor = 0x9e9e9e;

  const skinMaterial = new THREE.MeshStandardMaterial({ color: skinTone });
  const shirtMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
  const pantsMaterial = new THREE.MeshStandardMaterial({
    color: pantsColor,
    roughness: 0.7,
  });
  const beltMaterial = new THREE.MeshStandardMaterial({ color: beltColor });
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: metalColor,
    metalness: 0.5,
    roughness: 0.5,
  });
  const bootsMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.8,
  });

  const headHeight = 0.5;
  const torsoHeight = 1.8;
  const legHeight = 2.8;
  const shoeHeight = 0.3;
  const totalLegHeight = legHeight + shoeHeight;
  const neckHeight = 0.3;
  const headRadius = 0.45;

  // Head
  const head = new THREE.Group();

  const faceGeo = new THREE.SphereGeometry(headRadius, 32, 16);
  // Elongate and narrow the face, taper the chin
  const positions = faceGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    // Apply overall scaling for a less round head
    positions.setX(i, positions.getX(i) * 0.85);
    positions.setZ(i, positions.getZ(i) * 0.85);
    positions.setY(i, positions.getY(i) * 1.15);

    // Taper the chin (for y < 0)
    if (y < 0) {
      // As y goes from 0 down to -radius, scaleFactor goes from 1 down to ~0.7
      const scaleFactor = 1 + (y / headRadius) * 0.3;
      positions.setX(i, positions.getX(i) * scaleFactor);
      positions.setZ(i, positions.getZ(i) * scaleFactor);
    }
  }
  positions.needsUpdate = true;
  faceGeo.computeVertexNormals();

  const face = new THREE.Mesh(faceGeo, skinMaterial);
  head.add(face);

  // Hair
  const hairMaterial = new THREE.MeshPhongMaterial({ color: 0x080808, shininess: 5 });
  const hair = createHair(headRadius, hairMaterial);
  hair.position.y = headHeight/2 - 0.2;
  head.add(hair);

  // Torso and Shirt with integrated shoulders
  const torso = new THREE.Group();
  torso.position.y = totalLegHeight + torsoHeight / 2;

  const shoulderWidth = isLobby ? 0.7 : 0.55; // Wider in lobby, closer in game
  const waistWidth = 0.4;
  const shoulderY = torsoHeight / 2 - 0.2; // Y position of the shoulder peak
  const neckY = torsoHeight / 2;
  const neckWidth = 0.2;
  const armRadius = 0.18;
  const torsoDepth = armRadius * 2;

  const torsoShape = new THREE.Shape();
  // Start from bottom center
  torsoShape.moveTo(-waistWidth, -torsoHeight / 2); // Bottom left
  torsoShape.lineTo(waistWidth, -torsoHeight / 2); // Bottom right
  torsoShape.lineTo(shoulderWidth, shoulderY); // Right shoulder point
  torsoShape.lineTo(neckWidth, neckY); // Right neck point
  
  // Curved neckline
  torsoShape.quadraticCurveTo(0, neckY - 0.1, -neckWidth, neckY); // Curve instead of straight line

  torsoShape.lineTo(-shoulderWidth, shoulderY); // Left shoulder point
  torsoShape.closePath();

  const torsoExtrudeSettings = {
    steps: 1,
    depth: torsoDepth,
    bevelEnabled: false,
  };

  const torsoGeo = new THREE.ExtrudeGeometry(torsoShape, torsoExtrudeSettings);
  torsoGeo.translate(0, 0, -torsoDepth / 2); // Center the depth
  
  const torsoMesh = new THREE.Mesh(torsoGeo, shirtMaterial);

  torso.add(torsoMesh);


  // Open Shirt Collar
  const collarVNeck = new THREE.Shape();
  collarVNeck.moveTo(-0.1, torsoHeight / 2);
  collarVNeck.lineTo(0, torsoHeight / 2 - 0.3);
  collarVNeck.lineTo(0.1, torsoHeight / 2);
  collarVNeck.closePath();
  const collarVNeckGeom = new THREE.ShapeGeometry(collarVNeck);
  const collarVNeckMesh = new THREE.Mesh(collarVNeckGeom, skinMaterial);
  collarVNeckMesh.position.z = torsoDepth/2 + 0.01; // Bring it forward from the chest
  torso.add(collarVNeckMesh);

  const leftLapel = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.35, 0.1),
    shirtMaterial
  );
  leftLapel.position.set(-0.2, torsoHeight / 2 - 0.15, torsoDepth/2 + 0.02);
  leftLapel.rotation.z = Math.PI / 8;
  torso.add(leftLapel);

  const rightLapel = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.35, 0.1),
    shirtMaterial
  );
  rightLapel.position.set(0.2, torsoHeight / 2 - 0.15, torsoDepth/2 + 0.02);
  rightLapel.rotation.z = -Math.PI / 8;
  torso.add(rightLapel);

  // Neck
  const neck = new THREE.Group();
  const neckGeoWidth = 0.18;
  const neckGeo = new THREE.CylinderGeometry(
    neckGeoWidth,
    neckGeoWidth * 0.8,
    neckHeight,
    8
  );

  // Add a curve to the neck
  const neckPositions = neckGeo.attributes.position;
  for (let i = 0; i < neckPositions.count; i++) {
    const y = neckPositions.getY(i);
    // Apply a sine wave curve along the height of the neck
    const curveFactor = Math.sin((y / neckHeight) * Math.PI);
    neckPositions.setX(i, neckPositions.getX(i) * (1 - curveFactor * 0.1));
    neckPositions.setZ(i, neckPositions.getZ(i) * (1 - curveFactor * 0.1));
  }
  neckPositions.needsUpdate = true;
  neckGeo.computeVertexNormals();
  
  const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
  neck.add(neckMesh);
  // Position neck on top of the torso's neck flat
  neck.position.y = totalLegHeight + torsoHeight;
  
  // Add lateral collar pieces
  const collarPieceGeo = new THREE.BoxGeometry(0.1, neckHeight, 0.25);
  const leftCollarPiece = new THREE.Mesh(collarPieceGeo, shirtMaterial);
  leftCollarPiece.position.x = -neckGeoWidth;
  neck.add(leftCollarPiece);
  
  const rightCollarPiece = new THREE.Mesh(collarPieceGeo, shirtMaterial);
  rightCollarPiece.position.x = neckGeoWidth;
  neck.add(rightCollarPiece);

  // Add back collar piece
  const backCollarPieceGeom = new THREE.BoxGeometry(neckGeoWidth * 2, neckHeight, 0.1);
  const backCollarPiece = new THREE.Mesh(backCollarPieceGeom, shirtMaterial);
  backCollarPiece.position.z = -0.15;
  neck.add(backCollarPiece);


  // Legs and Pants (Tapered)
  const legTopRadius = 0.25;
  const legBottomRadius = 0.18;
  const legGeo = new THREE.CylinderGeometry(
    legTopRadius,
    legBottomRadius,
    legHeight,
    8
  );

  const leftLeg = new THREE.Group();
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMaterial);
  leftLeg.add(leftLegMesh);
  leftLeg.position.set(0.22, legHeight / 2 + shoeHeight, 0);

  const rightLeg = new THREE.Group();
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMaterial);
  rightLeg.add(rightLegMesh);
  rightLeg.position.set(-0.22, legHeight / 2 + shoeHeight, 0);

  // Helper function to create a boot
  const createBoot = () => {
    const bootGroup = new THREE.Group();
    const soleHeight = 0.1;
    const mainBootHeight = shoeHeight - soleHeight;

    // Main boot shape
    const bootBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, mainBootHeight, 0.4),
      bootsMaterial
    );
    bootBody.position.y = mainBootHeight / 2;

    // Rounded toe
    const toe = new THREE.Mesh(
      new THREE.SphereGeometry(0.175, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      bootsMaterial
    );
    toe.position.set(0, 0, 0.2); // Position at the front
    toe.rotation.x = Math.PI / 2;
    bootBody.add(toe);

    bootGroup.add(bootBody);

    // Sole
    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, soleHeight, 0.55),
      bootsMaterial
    );
    sole.position.y = -mainBootHeight / 2 - soleHeight / 2;
    bootBody.add(sole);

    // Laces (simple representation)
    const laceMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
    for (let i = 0; i < 5; i++) {
      const lace = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.02, 0.02),
        laceMaterial
      );
      lace.position.set(0, i * 0.05 - 0.05, 0.18);
      bootBody.add(lace);
    }

    return bootGroup;
  };

  const leftBoot = createBoot();
  leftBoot.position.y = -legHeight / 2;
  leftLeg.add(leftBoot);

  const rightBoot = createBoot();
  rightBoot.position.y = -legHeight / 2;
  rightLeg.add(rightBoot);

  // Arms (Slimmer)
  const armLength = 1.3;
  const armYOffset = -0.15; // Lower the arms slightly
  
  const shoulderCapGeom = new THREE.SphereGeometry(0.2, 16, 8);
  shoulderCapGeom.scale(1, 0.6, 1); // Flatten the sphere to make a cap
  
  // Left Arm (rolled up sleeve)
  const leftArmGroup = new THREE.Group();
  
  const leftArm = new THREE.Mesh(
    new THREE.CylinderGeometry(armRadius, armRadius * 0.9, armLength, 8),
    shirtMaterial
  );
  leftArm.position.y = -armLength / 2;

  const leftHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.3, 0.1),
    skinMaterial
  );
  // Position hand at the end of the forearm
  leftHand.position.y = -armLength / 2 - 0.15;
  leftHand.rotation.z = Math.PI / 8;

  const leftShoulderCap = new THREE.Mesh(shoulderCapGeom, shirtMaterial);
  leftShoulderCap.position.y = 0.1;
  leftArmGroup.add(leftShoulderCap);

  leftArm.add(leftHand); // Attach hand to forearm
  leftArmGroup.add(leftArm);


  leftArmGroup.position.set(shoulderWidth, torso.position.y + shoulderY + armYOffset, 0);
  leftArmGroup.rotation.z = Math.PI / 16;
  
  // Right Arm (with armor)
  const rightArmGroup = new THREE.Group();
  
  const rightArm = new THREE.Mesh(
    new THREE.CylinderGeometry(armRadius, armRadius * 0.9, armLength, 8),
    shirtMaterial
  );
  rightArm.position.y = -armLength / 2;

  const rightHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.3, 0.1),
    skinMaterial
  );
  rightHand.position.y = -armLength / 2 - 0.15;
  rightArm.add(rightHand);
  
  rightArmGroup.add(rightArm);
  
  const rightShoulderCap = new THREE.Mesh(shoulderCapGeom, shirtMaterial);
  rightShoulderCap.position.y = 0.1;
  rightArmGroup.add(rightShoulderCap);

  rightArmGroup.position.set(-shoulderWidth, torso.position.y + shoulderY + armYOffset, 0);
  rightArmGroup.rotation.z = -Math.PI / 16;

  // Belt & Holster
  const beltGroup = new THREE.Group();
  beltGroup.position.y = totalLegHeight;
  const beltGeo = new THREE.BoxGeometry(
    waistWidth * 2 + 0.05,
    0.25,
    torsoDepth + 0.05
  );
  const belt = new THREE.Mesh(beltGeo, beltMaterial);
  beltGroup.add(belt);

  const buckleGeo = new THREE.BoxGeometry(0.2, 0.3, 0.1);
  const buckle = new THREE.Mesh(buckleGeo, metalMaterial);
  buckle.position.z = torsoDepth/2 + 0.05;
  belt.add(buckle);

  const holsterGeo = new THREE.BoxGeometry(0.15, 0.4, 0.3);
  const holster = new THREE.Mesh(holsterGeo, beltMaterial);
  holster.position.set(-(waistWidth + 0.05), -0.1, 0);
  holster.rotation.z = Math.PI / 8;
  beltGroup.add(holster);

  const hangingStrap = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.5, 0.08),
    beltMaterial
  );
  hangingStrap.position.set(waistWidth - 0.1, -0.3, torsoDepth/2);
  hangingStrap.rotation.z = -Math.PI / 16;
  belt.add(hangingStrap);

  // Sword hilt
  const hiltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6);
  const hilt = new THREE.Mesh(
    hiltGeo,
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  hilt.position.y = 0.2;
  hilt.rotation.x = Math.PI / 4;
  holster.add(hilt);

  character.add(
    head,
    torso,
    neck,
    leftLeg,
    rightLeg,
    leftArmGroup,
    rightArmGroup,
    beltGroup
  );
  // Re-position head to be on top of the neck
  head.position.y = neck.position.y + neckHeight / 2 + headHeight / 2 + 0.2;
  head.rotation.y = Math.PI; // Rotate head to face forward
  character.position.y = -totalLegHeight; // Center the model vertically

  character.userData.parts = {
    head: head,
    torso: torso,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup,
    leftLeg: leftLeg,
    rightLeg: rightLeg,
  };

  return character;
}
