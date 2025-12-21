
import * as THREE from 'three';
import { createHair } from './player-hair';

export function createPlayerCharacter(
  isPlayer = false,
  gender: 'male' | 'female' = 'male'
) {
  const character = new THREE.Group();

  // Materials
  const skinTone = 0xffdbac;
  const shirtColor = 0x222a4d;
  const pantsColor = 0x1a1a1a;
  const beltColor = 0x5d4037;
  const metalColor = 0x9e9e9e;
  const pauldronColor = 0x6d4c41;

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
  const pauldronMaterial = new THREE.MeshStandardMaterial({
    color: pauldronColor,
    roughness: 0.8,
  });
  const bootsMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.8,
  });

  const headHeight = 0.5;
  const torsoHeight = 1.8;
  const legHeight = 2.0;
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
  hair.position.y = headHeight/2 - 0.1;
  head.add(hair);

  // Torso and Shirt with hexagonal shape
  const torso = new THREE.Group();
  torso.position.y = totalLegHeight + torsoHeight / 2;

  const shoulderWidth = 0.55;
  const waistWidth = 0.4;
  const backDepth = -0.2;
  const chestDepth = 0.2;
  const shoulderHeight = torsoHeight * 0.4;
  const trapeziusHeight = torsoHeight * 0.5;
  const neckWidth = 0.2;
  const neckDepth = 0.1;

  const torsoShape = new THREE.Shape();
  // Start from bottom center
  torsoShape.moveTo(-waistWidth, -torsoHeight / 2); // 0 Bottom left
  torsoShape.lineTo(waistWidth, -torsoHeight / 2); // 1 Bottom right
  torsoShape.lineTo(shoulderWidth, shoulderHeight); // 2 Right shoulder
  torsoShape.lineTo(neckWidth, trapeziusHeight); // 3 Right neck point
  torsoShape.lineTo(-neckWidth, trapeziusHeight); // 4 Left neck point
  torsoShape.lineTo(-shoulderWidth, shoulderHeight); // 5 Left shoulder
  torsoShape.closePath();

  const extrudePath = new THREE.Shape();
  extrudePath.moveTo(0, backDepth);
  extrudePath.lineTo(0, chestDepth - neckDepth);
  extrudePath.lineTo(0, chestDepth); // Tapered front
  extrudePath.lineTo(0, chestDepth - neckDepth);

  const torsoExtrudeSettings = {
    steps: 2,
    depth: chestDepth - backDepth,
    bevelEnabled: false,
  };

  const torsoGeo = new THREE.ExtrudeGeometry(torsoShape, torsoExtrudeSettings);
  torsoGeo.translate(0, 0, backDepth); // Center the depth
  const torsoMesh = new THREE.Mesh(torsoGeo, shirtMaterial);
  torso.add(torsoMesh);

  // Open Shirt Collar
  const collarVNeck = new THREE.Shape();
  collarVNeck.moveTo(-0.15, torsoHeight / 2);
  collarVNeck.lineTo(0, torsoHeight / 2 - 0.3);
  collarVNeck.lineTo(0.15, torsoHeight / 2);
  collarVNeck.closePath();
  const collarVNeckGeom = new THREE.ShapeGeometry(collarVNeck);
  const collarVNeckMesh = new THREE.Mesh(collarVNeckGeom, skinMaterial);
  collarVNeckMesh.position.z = chestDepth + 0.01; // Bring it forward from the chest
  torso.add(collarVNeckMesh);

  const leftLapel = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.35, 0.1),
    shirtMaterial
  );
  leftLapel.position.set(-0.2, torsoHeight / 2 - 0.15, chestDepth + 0.02);
  leftLapel.rotation.z = Math.PI / 8;
  torso.add(leftLapel);

  const rightLapel = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.35, 0.1),
    shirtMaterial
  );
  rightLapel.position.set(0.2, torsoHeight / 2 - 0.15, chestDepth + 0.02);
  rightLapel.rotation.z = -Math.PI / 8;
  torso.add(rightLapel);

  // Neck
  const neck = new THREE.Group();
  const neckGeo = new THREE.CylinderGeometry(
    neckWidth * 0.8,
    neckWidth * 0.8,
    neckHeight,
    8
  );
  const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
  neck.add(neckMesh);
  // Position neck on top of the torso's neck flat
  neck.position.y = totalLegHeight + torsoHeight / 2 + trapeziusHeight;
  
  // Add lateral collar pieces
  const collarPieceGeo = new THREE.BoxGeometry(0.1, neckHeight, 0.25);
  const leftCollarPiece = new THREE.Mesh(collarPieceGeo, shirtMaterial);
  leftCollarPiece.position.x = -neckWidth;
  neck.add(leftCollarPiece);
  
  const rightCollarPiece = new THREE.Mesh(collarPieceGeo, shirtMaterial);
  rightCollarPiece.position.x = neckWidth;
  neck.add(rightCollarPiece);

  // Add back collar piece
  const backCollarPieceGeom = new THREE.BoxGeometry(neckWidth * 2, neckHeight, 0.1);
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
  const armLength = 1.6;
  const armRadius = 0.18;
  const forearmRadius = 0.16;
  const upperArmLength = armLength * 0.6;
  const forearmLength = armLength * 0.4;
  
  // Left Arm (rolled up sleeve)
  const leftArmGroup = new THREE.Group();
  
  const leftUpperArm = new THREE.Mesh(
    new THREE.CylinderGeometry(armRadius, armRadius, upperArmLength, 8),
    shirtMaterial
  );
  leftUpperArm.position.y = -upperArmLength / 2;

  const leftForearm = new THREE.Mesh(
    new THREE.CylinderGeometry(forearmRadius, forearmRadius, forearmLength, 8),
    skinMaterial
  );
  // Position forearm at the end of the upper arm
  leftForearm.position.y = -upperArmLength / 2 - forearmLength / 2;
  leftForearm.rotation.z = Math.PI / 12; // Slight bend
  leftForearm.rotation.y = -Math.PI / 6; // Turn hand outwards

  const leftHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.3, 0.1),
    skinMaterial
  );
  // Position hand at the end of the forearm
  leftHand.position.y = -forearmLength / 2 - 0.15;
  leftHand.rotation.z = Math.PI / 8;

  leftForearm.add(leftHand); // Attach hand to forearm
  leftUpperArm.add(leftForearm); // Attach forearm to upper arm
  leftArmGroup.add(leftUpperArm);
  leftArmGroup.position.set(shoulderWidth, torso.position.y + shoulderHeight, 0);
  leftArmGroup.rotation.z = Math.PI / 16;
  
  // Left shoulder cap
  const leftShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(shoulderWidth * 0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), shirtMaterial);
  leftShoulderCap.scale.y = 0.6;
  leftShoulderCap.position.y = 0.1;
  leftShoulderCap.rotation.z = -Math.PI / 16;
  leftArmGroup.add(leftShoulderCap);


  // Right Arm (with armor)
  const rightArmGroup = new THREE.Group();
  
  const rightArm = new THREE.Mesh(
    new THREE.CylinderGeometry(armRadius, armRadius, armLength, 8),
    shirtMaterial
  );
  rightArm.position.y = -armLength / 2;

  const rightHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.3, 0.1),
    skinMaterial
  );
  rightHand.position.y = -armLength / 2 - 0.15;
  rightArm.add(rightHand);
  
  const rightShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(shoulderWidth * 0.5, 12, 8), pauldronMaterial);
  rightShoulderCap.scale.y = 0.6; // Flatten the sphere
  rightShoulderCap.position.y = 0.05; // Lower the cap to overlap the torso

  rightArmGroup.add(rightShoulderCap, rightArm);
  rightArmGroup.position.set(-shoulderWidth, torso.position.y + shoulderHeight, 0);
  rightArmGroup.rotation.z = -Math.PI / 16;

  // Pauldron (Shoulder armor) is now the shoulder cap
  const bracerGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.6, 8);
  const bracer = new THREE.Mesh(bracerGeo, metalMaterial);
  bracer.position.y = -0.3;
  rightArm.add(bracer);

  // Belt & Holster
  const beltGroup = new THREE.Group();
  beltGroup.position.y = totalLegHeight;
  const beltGeo = new THREE.BoxGeometry(
    waistWidth * 2 + 0.05,
    0.25,
    chestDepth - backDepth + 0.05
  );
  const belt = new THREE.Mesh(beltGeo, beltMaterial);
  beltGroup.add(belt);

  const buckleGeo = new THREE.BoxGeometry(0.2, 0.3, 0.1);
  const buckle = new THREE.Mesh(buckleGeo, metalMaterial);
  buckle.position.z = chestDepth + 0.05;
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
  hangingStrap.position.set(waistWidth - 0.1, -0.3, chestDepth);
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
  head.position.y = neck.position.y + neckHeight / 2 + headHeight / 2 + 0.35;
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
