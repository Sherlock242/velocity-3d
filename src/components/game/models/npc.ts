
import * as THREE from 'three';

// --- START: Seeded PRNG ---
// A simple pseudo-random number generator to ensure the hair is consistent
let seed = 1;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
// --- END: Seeded PRNG ---


const CLOTHING_COLORS = [
  0x1f77b4, // Muted Blue
  0xff7f0e, // Safety Orange
  0x2ca02c, // Cooked Asparagus Green
  0xd62728, // Brick Red
  0x9467bd, // Muted Purple
  0x8c564b, // Chestnut Brown
  0xe377c2, // Raspberry Pink
  0x7f7f7f, // Middle Gray
  0xbcbd22, // Curry Yellow-Green
  0x17becf, // Blue-Teal
];

const HAIR_COLORS = [
    0x080808, // Black
    0x4a321a, // Brown
    0xb8860b, // Blonde
    0xd62728, // Red
];


export function createNpc(isPlayer = false, gender: 'male' | 'female' = 'male') {
  const character = new THREE.Group();

  // Materials
  const skinTone = 0xffdbac;
  const hairColor = HAIR_COLORS[Math.floor(random() * HAIR_COLORS.length)];
  const shirtColor = CLOTHING_COLORS[Math.floor(random() * CLOTHING_COLORS.length)];
  const pantsColor = CLOTHING_COLORS[Math.floor(random() * CLOTHING_COLORS.length)];
  
  const skinMaterial = new THREE.MeshStandardMaterial({ color: skinTone });
  const hairMaterial = new THREE.MeshPhongMaterial({ color: hairColor, shininess: 5 });
  const shirtMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
  const pantsMaterial = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
  const bootsMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });


  const headHeight = 0.5;
  const torsoHeight = gender === 'male' ? 1.4 : 1.3;
  const legHeight = 1.6;
  const shoeHeight = 0.3;
  const totalLegHeight = legHeight + shoeHeight;
  const neckHeight = 0.2;
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
  
  const hairGroup = new THREE.Group();
  const hairStyle = Math.floor(random() * 3); // 3 different hair styles

  if (hairStyle === 0) { // Spiky hair
    for (let i = 0; i < 50; i++) {
        const hairGeom = new THREE.ConeGeometry(0.1, 0.5, 4);
        const hair = new THREE.Mesh(hairGeom, hairMaterial);
        hair.position.setFromSphericalCoords(
            headRadius * 1.1,
            random() * Math.PI * 0.5,
            random() * Math.PI * 2
        );
        hair.lookAt(face.position);
        hairGroup.add(hair);
    }
  } else if (hairStyle === 1) { // Bob cut
      const hairCapGeom = new THREE.SphereGeometry(headRadius * 1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
      const hairCap = new THREE.Mesh(hairCapGeom, hairMaterial);
      hairGroup.add(hairCap);
  } else { // Long hair
      for (let i = 0; i < 30; i++) {
        const hairGeom = new THREE.BoxGeometry(0.1, 1.5, 0.1);
        const hair = new THREE.Mesh(hairGeom, hairMaterial);
         hair.position.setFromSphericalCoords(
            headRadius,
            Math.PI * 0.5 + (random() - 0.5) * 0.2,
            random() * Math.PI * 2
        );
        hair.position.y -= 0.5;
        hairGroup.add(hair);
      }
  }


  hairGroup.position.y = headHeight/2;
  head.add(hairGroup);

  // Torso
  const torso = new THREE.Group();
  torso.position.y = totalLegHeight + torsoHeight / 2;

  const shoulderWidth = gender === 'male' ? 0.5 : 0.45;
  const waistWidth = gender === 'male' ? 0.35 : 0.3;
  const torsoGeo = new THREE.CylinderGeometry(shoulderWidth, waistWidth, torsoHeight, 8);
  const torsoMesh = new THREE.Mesh(torsoGeo, shirtMaterial);
  torso.add(torsoMesh);
  
  if(gender === 'female') {
      const chestGeom = new THREE.SphereGeometry(0.25, 16, 8);
      const leftChest = new THREE.Mesh(chestGeom, shirtMaterial);
      leftChest.position.set(0.18, 0.2, 0.2);
      const rightChest = new THREE.Mesh(chestGeom, shirtMaterial);
      rightChest.position.set(-0.18, 0.2, 0.2);
      torso.add(leftChest, rightChest);
  }


  // Neck
  const neck = new THREE.Group();
  const neckWidth = 0.18;
  const neckGeo = new THREE.CylinderGeometry(neckWidth * 0.8, neckWidth * 0.8, neckHeight, 8);
  const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
  neck.add(neckMesh);
  neck.position.y = torso.position.y + torsoHeight/2;


  // Legs and Pants
  const legTopRadius = 0.22;
  const legBottomRadius = 0.15;
  const legGeo = new THREE.CylinderGeometry(legTopRadius, legBottomRadius, legHeight, 8);

  const leftLeg = new THREE.Group();
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMaterial);
  leftLeg.add(leftLegMesh);
  leftLeg.position.set(0.22, (legHeight / 2) + shoeHeight, 0);

  const rightLeg = new THREE.Group();
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMaterial);
  rightLeg.add(rightLegMesh);
  rightLeg.position.set(-0.22, (legHeight / 2) + shoeHeight, 0);

  // Shoes
  const shoeGeom = new THREE.BoxGeometry(0.35, shoeHeight, 0.5);
  const leftShoe = new THREE.Mesh(shoeGeom, bootsMaterial);
  leftShoe.position.y = -legHeight/2;
  leftLeg.add(leftShoe);

  const rightShoe = new THREE.Mesh(shoeGeom, bootsMaterial);
  rightShoe.position.y = -legHeight/2;
  rightLeg.add(rightShoe);


  // Arms
  const armLength = 1.3;
  const armRadius = 0.12;

  const leftArmGroup = new THREE.Group();
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius * 0.8, armLength, 8), shirtMaterial);
  leftArm.position.y = -armLength / 2 + 0.1; // Raise arm to embed into shoulder cap
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), skinMaterial);
  leftHand.position.y = -armLength/2;
  leftArm.add(leftHand);
  const leftShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(shoulderWidth * 0.5, 12, 8), shirtMaterial);
  leftShoulderCap.scale.y = 0.6; // Flatten the sphere
  leftShoulderCap.position.y = -0.05; // Lower shoulder cap to overlap torso
  leftArmGroup.add(leftShoulderCap, leftArm);
  leftArmGroup.position.set(shoulderWidth, torso.position.y + torsoHeight/2, 0);


  const rightArmGroup = new THREE.Group();
  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius * 0.8, armLength, 8), shirtMaterial);
  rightArm.position.y = -armLength / 2 + 0.1; // Raise arm to embed into shoulder cap
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), skinMaterial);
  rightHand.position.y = -armLength/2;
  rightArm.add(rightHand);
  const rightShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(shoulderWidth * 0.5, 12, 8), shirtMaterial);
  rightShoulderCap.scale.y = 0.6; // Flatten the sphere
  rightShoulderCap.position.y = -0.05; // Lower shoulder cap to overlap torso
  rightArmGroup.add(rightShoulderCap, rightArm);
  rightArmGroup.position.set(-shoulderWidth, torso.position.y + torsoHeight/2, 0);

  
  character.add(head, torso, neck, leftLeg, rightLeg, leftArmGroup, rightArmGroup);
  // Re-position head to be on top of the neck
  head.position.y = neck.position.y + neckHeight/2 + headHeight/2; 
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
