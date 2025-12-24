
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
  const torsoHeight = 1.9;
  const upperLegHeight = 1.4;
  const lowerLegHeight = 1.4;
  const legHeight = upperLegHeight + lowerLegHeight;
  const shoeHeight = 0.3;
  const totalLegHeight = legHeight + shoeHeight;
  const neckHeight = 0.3;
  const headRadius = 0.45;
  
  const lobbyYOffset = isLobby ? 0.2 : 0;

  const upperBody = new THREE.Group();
  upperBody.position.y = totalLegHeight + lobbyYOffset;


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
  torso.position.y = torsoHeight / 2;

  const shoulderWidth = isLobby ? 0.7 : 0.65;
  const waistWidth = 0.4;
  const shoulderY = torsoHeight / 2 - 0.2; // Y position of the shoulder peak
  const neckY = torsoHeight / 2;
  const neckWidth = 0.2;
  const armRadius = 0.18;
  const torsoDepth = armRadius * 2;

  const torsoShape = new THREE.Shape();
  const curveHandleOffset = 0.2;
  
  // Start from bottom-left
  torsoShape.moveTo(-waistWidth, -torsoHeight / 2);
  
  // Bottom edge
  torsoShape.lineTo(waistWidth, -torsoHeight / 2);
  
  // Right side curve (waist to shoulder)
  torsoShape.quadraticCurveTo(
    waistWidth + curveHandleOffset, -torsoHeight / 4,
    shoulderWidth, shoulderY
  );
  
  // Right shoulder to neck
  torsoShape.lineTo(neckWidth, neckY);
  
  // Curved neckline
  torsoShape.quadraticCurveTo(0, neckY - 0.1, -neckWidth, neckY);
  
  // Left shoulder to neck
  torsoShape.lineTo(-shoulderWidth, shoulderY);
  
  // Left side curve (shoulder to waist)
  torsoShape.quadraticCurveTo(
    -waistWidth - curveHandleOffset, -torsoHeight / 4,
    -waistWidth, -torsoHeight / 2
  );
  

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
  neck.position.y = torsoHeight;
  
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

  // --- Legs ---
  const legTopRadius = 0.25;
  const legBottomRadius = 0.18;
  const kneeRadius = 0.2;

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


  const createLeg = () => {
    const legGroup = new THREE.Group();
    const upperLeg = new THREE.Group();
    const lowerLeg = new THREE.Group();

    const upperLegGeo = new THREE.CylinderGeometry(legTopRadius, kneeRadius, upperLegHeight, 8);
    const upperLegMesh = new THREE.Mesh(upperLegGeo, pantsMaterial);
    upperLegMesh.position.y = -upperLegHeight / 2;
    upperLeg.add(upperLegMesh);

    const kneeGeo = new THREE.SphereGeometry(kneeRadius, 8, 6);
    const kneeMesh = new THREE.Mesh(kneeGeo, pantsMaterial);
    lowerLeg.add(kneeMesh);

    const lowerLegGeo = new THREE.CylinderGeometry(kneeRadius, legBottomRadius, lowerLegHeight, 8);
    const lowerLegMesh = new THREE.Mesh(lowerLegGeo, pantsMaterial);
    lowerLegMesh.position.y = -lowerLegHeight / 2;
    lowerLeg.add(lowerLegMesh);
    
    // Attach boot to lower leg
    const boot = createBoot();
    boot.position.y = -lowerLegHeight;
    lowerLeg.add(boot);
    
    lowerLeg.position.y = -upperLegHeight;

    upperLeg.add(lowerLeg);
    legGroup.add(upperLeg);
    legGroup.userData = { upperLeg, lowerLeg };
    return legGroup;
  }

  const legXPosition = isLobby ? 0.25 : 0.22;
  const leftLeg = createLeg();
  leftLeg.position.set(legXPosition, 0, 0);
  
  const rightLeg = createLeg();
  rightLeg.position.set(-legXPosition, 0, 0);


  // --- Arms ---
  const upperArmHeight = 1.0;
  const lowerArmHeight = 0.8;
  const armLength = upperArmHeight + lowerArmHeight;
  const elbowRadius = 0.15;
  const armTopRadius = 0.18;
  const armBottomRadius = 0.14;
  const armYOffset = -0.30;

  const createArm = (isLeft: boolean) => {
    const armGroup = new THREE.Group();
    const upperArm = new THREE.Group();
    const lowerArm = new THREE.Group();

    // Add a sphere for the shoulder cap
    const shoulderCapGeo = new THREE.SphereGeometry(armTopRadius, 8, 6);
    const shoulderCap = new THREE.Mesh(shoulderCapGeo, shirtMaterial);
    shoulderCap.position.y = 0; // Position at the top of the arm
    upperArm.add(shoulderCap);

    const upperArmGeo = new THREE.CylinderGeometry(armTopRadius, elbowRadius, upperArmHeight, 8);
    const upperArmMesh = new THREE.Mesh(upperArmGeo, shirtMaterial);
    upperArmMesh.position.y = -upperArmHeight / 2;
    upperArm.add(upperArmMesh);

    const elbowGeo = new THREE.SphereGeometry(elbowRadius, 8, 6);
    const elbowMesh = new THREE.Mesh(elbowGeo, skinMaterial);
    lowerArm.add(elbowMesh);

    const lowerArmGeo = new THREE.CylinderGeometry(elbowRadius, armBottomRadius, lowerArmHeight, 8);
    const lowerArmMesh = new THREE.Mesh(lowerArmGeo, skinMaterial);
    lowerArmMesh.position.y = -lowerArmHeight / 2;
    lowerArm.add(lowerArmMesh);

    const hand = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.3, 0.1),
      skinMaterial
    );
    hand.position.y = -lowerArmHeight - 0.15;
    hand.rotation.z = isLeft ? Math.PI / 8 : -Math.PI / 8;
    lowerArm.add(hand);

    lowerArm.position.y = -upperArmHeight;

    upperArm.add(lowerArm);
    armGroup.add(upperArm);
    armGroup.userData = { upperArm, lowerArm };
    return armGroup;
  }
  
  const leftArmGroup = createArm(true);
  leftArmGroup.position.set(shoulderWidth, torsoHeight + armYOffset, 0);
  leftArmGroup.rotation.z = Math.PI / 16;
  
  const rightArmGroup = createArm(false);
  rightArmGroup.position.set(-shoulderWidth, torsoHeight + armYOffset, 0);
  rightArmGroup.rotation.z = -Math.PI / 16;

  // Belt
  const beltGroup = new THREE.Group();
  beltGroup.position.y = 0; // Position relative to upperBody
  const beltGeo = new THREE.BoxGeometry(
    waistWidth * 2 + 0.05,
    0.25,
    torsoDepth + 0.16
  );
  const belt = new THREE.Mesh(beltGeo, beltMaterial);
  beltGroup.add(belt);

  const buckleGeo = new THREE.BoxGeometry(0.2, 0.3, 0.1);
  const buckle = new THREE.Mesh(buckleGeo, metalMaterial);
  buckle.position.z = torsoDepth/2 + 0.05;
  belt.add(buckle);

  upperBody.add(head, torso, neck, leftArmGroup, rightArmGroup, beltGroup, leftLeg, rightLeg);
  
  character.add(
    upperBody
  );
  // Re-position head to be on top of the neck
  head.position.y = neck.position.y + neckHeight / 2 + headHeight / 2 + 0.2;
  head.rotation.y = Math.PI; // Rotate head to face forward
  character.position.y = -totalLegHeight; // Center the model vertically

  character.userData.parts = {
    head: head,
    torso: torso,
    upperBody: upperBody,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup,
    leftLeg: leftLeg,
    rightLeg: rightLeg,
    upperLeftArm: leftArmGroup.userData.upperArm,
    lowerLeftArm: leftArmGroup.userData.lowerArm,
    upperRightArm: rightArmGroup.userData.upperArm,
    lowerRightArm: rightArmGroup.userData.lowerArm,
  };

  return character;
}
