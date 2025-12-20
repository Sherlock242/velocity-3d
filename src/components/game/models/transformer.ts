
import * as THREE from 'three';

// This file creates a "Transformer" model that can switch between a car and a person.

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


export function createPlayerCharacter(isPlayer = false, gender: 'male' | 'female' = 'male') {
  const character = new THREE.Group();

  // Materials
  const skinTone = 0xffdbac;
  const hairColor = 0x111111;
  const shirtColor = 0x222a4d;
  const pantsColor = 0x1a1a1a;
  const beltColor = 0x5d4037;
  const metalColor = 0x9e9e9e;
  const pauldronColor = 0x6d4c41;

  const skinMaterial = new THREE.MeshStandardMaterial({ color: skinTone });
  const hairMaterial = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });
  const shirtMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
  const pantsMaterial = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
  const beltMaterial = new THREE.MeshStandardMaterial({ color: beltColor });
  const metalMaterial = new THREE.MeshStandardMaterial({ color: metalColor, metalness: 0.5, roughness: 0.5 });
  const pauldronMaterial = new THREE.MeshStandardMaterial({ color: pauldronColor, roughness: 0.8 });
  const bootsMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });


  const headHeight = 0.5;
  const torsoHeight = 1.4; // Taller
  const legHeight = 1.6; // Taller
  const shoeHeight = 0.3; // Proportionate shoes
  const totalLegHeight = legHeight + shoeHeight;
  const neckHeight = 0.2;
  const headRadius = 0.4;
  
  // Head
  const head = new THREE.Group();
  
  const faceGeo = new THREE.SphereGeometry(headRadius, 16, 12);
  // Elongate and narrow the face
  faceGeo.scale(0.85, 1.15, 0.85);
  const face = new THREE.Mesh(faceGeo, skinMaterial);
  head.add(face);
  
  // Shaggy Hair
  const hairGroup = new THREE.Group();
  const numLayers = 4;
  const spikesPerLayer = 12;
  
  for (let layer = 0; layer < numLayers; layer++) {
      for (let i = 0; i < spikesPerLayer; i++) {
          const spikeHeight = Math.random() * 0.5 + 0.3;
          const spikeRadius = Math.random() * 0.08 + 0.04;
          const spikeGeo = new THREE.ConeGeometry(spikeRadius, spikeHeight, 4);
          const spike = new THREE.Mesh(spikeGeo, hairMaterial);
          
          const angle = (i / spikesPerLayer) * Math.PI * 2 + (layer * 0.3);
          const radius = headRadius * (0.85 + layer * 0.15);
          
          spike.position.set(
              Math.cos(angle) * radius * 0.9,
              (layer * 0.05) + Math.random() * 0.15,
              Math.sin(angle) * radius * 0.9
          );
          
          spike.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 1.2;
          spike.rotation.y = Math.random() * Math.PI;
          spike.rotation.z = (Math.random() - 0.5) * 0.5;
          
          hairGroup.add(spike);
      }
  }

  // Fringe/Bangs
  const numBangs = 7;
  for (let i = 0; i < numBangs; i++) {
      const spikeHeight = Math.random() * 0.4 + 0.4;
      const spikeRadius = Math.random() * 0.08 + 0.04;
      const spikeGeo = new THREE.ConeGeometry(spikeRadius, spikeHeight, 4);
      const spike = new THREE.Mesh(spikeGeo, hairMaterial);
      
      const x = (i - (numBangs - 1) / 2) * 0.12;
      const y = -0.15 - Math.random() * 0.1;
      const z = headRadius * 0.85;
      
      spike.position.set(x, y, z);
      spike.rotation.x = -Math.PI / 4 - Math.random() * 0.3;
      hairGroup.add(spike);
  }

  hairGroup.position.y = headHeight/2 - 0.2;
  head.add(hairGroup);

  // Torso and Shirt with waist taper
  const torso = new THREE.Group();
  torso.position.y = totalLegHeight + torsoHeight / 2;
  const torsoGeo = new THREE.BoxGeometry(0.9, torsoHeight, 0.45);
  // Add waist taper
  const positions = torsoGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      if (Math.abs(y) < torsoHeight * 0.1) { // Middle section
          positions.setX(i, positions.getX(i) * 0.9);
      }
  }
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
  collarVNeckMesh.position.z = 0.23; // Bring it forward
  torso.add(collarVNeckMesh);

  const leftLapel = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.1), shirtMaterial);
  leftLapel.position.set(-0.2, torsoHeight / 2 - 0.15, 0.24);
  leftLapel.rotation.z = Math.PI / 8;
  torso.add(leftLapel);

  const rightLapel = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.1), shirtMaterial);
  rightLapel.position.set(0.2, torsoHeight / 2 - 0.15, 0.24);
  rightLapel.rotation.z = -Math.PI / 8;
  torso.add(rightLapel);


  // Neck
  const neck = new THREE.Group();
  const neckGeo = new THREE.CylinderGeometry(0.18, 0.18, neckHeight, 8);
  const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
  neck.add(neckMesh);
  neck.position.y = totalLegHeight + torsoHeight;


  // Legs and Pants (Tapered)
  const legTopRadius = 0.22;
  const legBottomRadius = 0.18;
  const legGeo = new THREE.CylinderGeometry(legBottomRadius, legTopRadius, legHeight, 8);

  const leftLeg = new THREE.Group();
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMaterial);
  leftLeg.add(leftLegMesh);
  leftLeg.position.set(0.25, (legHeight / 2) + shoeHeight, 0);

  const rightLeg = new THREE.Group();
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMaterial);
  rightLeg.add(rightLegMesh);
  rightLeg.position.set(-0.25, (legHeight / 2) + shoeHeight, 0);

  // Shoes/Boots
  const shoeGeo = new THREE.BoxGeometry(0.38, shoeHeight, 0.5);
  const leftShoe = new THREE.Mesh(shoeGeo, bootsMaterial);
  leftShoe.position.y = (-legHeight / 2) - (shoeHeight / 2);
  leftShoe.position.z = 0.05;
  leftLeg.add(leftShoe);

  const rightShoe = new THREE.Mesh(shoeGeo, bootsMaterial);
  rightShoe.position.y = (-legHeight / 2) - (shoeHeight / 2);
  rightShoe.position.z = 0.05;
  rightLeg.add(rightShoe);


  // Arms (Slimmer)
  const armLength = 1.3;
  const armRadius = 0.15;
  const forearmRadius = 0.14;
  const upperArmLength = armLength * 0.5;
  const forearmLength = armLength * 0.5;
  
  // Left Arm (rolled up sleeve)
  const leftArmGroup = new THREE.Group();
  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius, upperArmLength, 8), shirtMaterial);
  leftUpperArm.position.y = -upperArmLength / 2;
  
  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(forearmRadius, forearmRadius, forearmLength, 8), skinMaterial);
  // Position forearm at the end of the upper arm
  leftForearm.position.y = -upperArmLength / 2 - forearmLength / 2;
  
  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.1), skinMaterial);
  // Position hand at the end of the forearm
  leftHand.position.y = -forearmLength / 2 - 0.15;

  leftForearm.add(leftHand); // Attach hand to forearm
  leftUpperArm.add(leftForearm); // Attach forearm to upper arm
  leftArmGroup.add(leftUpperArm);
  leftArmGroup.position.set(0.6, torso.position.y + torsoHeight / 2, 0);


  // Right Arm (with armor)
  const rightArmGroup = new THREE.Group();
  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius, armLength, 8), shirtMaterial);
  rightArm.position.y = -armLength / 2;
  
  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.1), skinMaterial);
  rightHand.position.y = -armLength / 2 - 0.15;
  rightArm.add(rightHand);
  
  rightArmGroup.add(rightArm);
  rightArmGroup.position.set(-0.6, torso.position.y + torsoHeight/2, 0);
  
  // Pauldron (Shoulder armor)
  const pauldronGeo = new THREE.BoxGeometry(0.4, 0.5, 0.45);
  const pauldron = new THREE.Mesh(pauldronGeo, pauldronMaterial);
  pauldron.position.y = armLength/2 - 0.15;
  rightArm.add(pauldron);
  
  // Bracer (Forearm armor)
  const bracerGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.6, 8);
  const bracer = new THREE.Mesh(bracerGeo, metalMaterial);
  bracer.position.y = -0.3;
  rightArm.add(bracer);

  // Belt & Holster
  const beltGroup = new THREE.Group();
  beltGroup.position.y = totalLegHeight;
  const beltGeo = new THREE.BoxGeometry(0.95, 0.25, 0.5);
  const belt = new THREE.Mesh(beltGeo, beltMaterial);
  beltGroup.add(belt);
  
  const buckleGeo = new THREE.BoxGeometry(0.2, 0.3, 0.1);
  const buckle = new THREE.Mesh(buckleGeo, metalMaterial);
  buckle.position.z = 0.25;
  belt.add(buckle);

  const holsterGeo = new THREE.BoxGeometry(0.15, 0.4, 0.3);
  const holster = new THREE.Mesh(holsterGeo, beltMaterial);
  holster.position.set(-0.45, -0.1, 0);
  holster.rotation.z = Math.PI / 8;
  beltGroup.add(holster);

  const hangingStrap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), beltMaterial);
  hangingStrap.position.set(0.3, -0.3, 0.25);
  hangingStrap.rotation.z = -Math.PI / 16;
  belt.add(hangingStrap);
  
  // Sword hilt
  const hiltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6);
  const hilt = new THREE.Mesh(hiltGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
  hilt.position.y = 0.2;
  hilt.rotation.x = Math.PI / 4;
  holster.add(hilt);


  character.add(head, torso, neck, leftLeg, rightLeg, leftArmGroup, rightArmGroup, beltGroup);
  // Re-position head to be on top of the neck
  head.position.y = neck.position.y + neckHeight/2 + headHeight/2; 
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

function createLamborghini() {
  const car = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x990000, // Player's distinctive red color
    metalness: 0.8,
    roughness: 0.3,
  });

  const bodyWidth = 2.2;
  const bodyLength = 4.5;
  const bodyHeight = 1.2;

  // Main body
  const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(bodyWidth, bodyHeight * 0.5, bodyLength),
    bodyMaterial
  );
  carBody.position.y = bodyHeight * 0.25;
  carBody.castShadow = true;
  car.add(carBody);

  // Cabin
  const windshieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0.8,
    roughness: 0.1,
    transparent: true,
    opacity: 0.6,
  });
  const cabinGeom = new THREE.BoxGeometry(
    bodyWidth * 0.7,
    bodyHeight * 0.4,
    bodyLength * 0.4
  );
  const cabin = new THREE.Mesh(cabinGeom, windshieldMaterial);
  cabin.position.y = bodyHeight * 0.6;
  cabin.position.z = -bodyLength * 0.1;
  car.add(cabin);

    // Spoiler
  const spoilerMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
  });
  const spoilerWingGeom = new THREE.BoxGeometry(bodyWidth * 1.1, 0.05, 0.3);
  const spoilerWing = new THREE.Mesh(spoilerWingGeom, spoilerMaterial);
  spoilerWing.position.set(0, bodyHeight * 0.5 + 0.2, -bodyLength / 2 - 0.1);
  spoilerWing.castShadow = true;
  car.add(spoilerWing);

  const spoilerSupportGeom = new THREE.BoxGeometry(0.1, 0.2, 0.1);
  const spoilerSupport1 = new THREE.Mesh(
    spoilerSupportGeom,
    spoilerMaterial
  );
  spoilerSupport1.position.set(
    -bodyWidth / 3,
    bodyHeight * 0.5 + 0.1,
    -bodyLength / 2 - 0.1
  );
  spoilerSupport1.castShadow = true;
  car.add(spoilerSupport1);

  const spoilerSupport2 = new THREE.Mesh(
    spoilerSupportGeom,
    spoilerMaterial
  );
  spoilerSupport2.position.set(
    bodyWidth / 3,
    bodyHeight * 0.5 + 0.1,
    -bodyLength / 2 - 0.1
  );
  spoilerSupport2.castShadow = true;
  car.add(spoilerSupport2);

    // Side Mirrors
  const mirrorMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.5,
  });
  const mirrorShape = new THREE.BoxGeometry(0.15, 0.15, 0.3);
  const leftMirror = new THREE.Mesh(mirrorShape, mirrorMaterial);
  leftMirror.position.set(
    -bodyWidth / 2 - 0.1,
    bodyHeight * 0.6,
    bodyLength / 2 - 1.5
  );
  leftMirror.rotation.y = -Math.PI / 8;
  car.add(leftMirror);

  const rightMirror = new THREE.Mesh(mirrorShape, mirrorMaterial);
  rightMirror.position.set(
    bodyWidth / 2 + 0.1,
    bodyHeight * 0.6,
    bodyLength / 2 - 1.5
  );
  rightMirror.rotation.y = Math.PI / 8;
  car.add(rightMirror);

    // Tail Lights
  const tailLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
  });
  const tailLightGeom = new THREE.BoxGeometry(bodyWidth * 0.8, 0.1, 0.05);
  const tailLights = new THREE.Mesh(tailLightGeom, tailLightMaterial);
  tailLights.position.set(0, bodyHeight * 0.4, -bodyLength / 2 - 0.02);
  car.add(tailLights);

    // Headlights
  const headLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffeeaa,
    emissiveIntensity: 0.5,
  });
  const headLightGeom = new THREE.BoxGeometry(0.6, 0.05, 0.1);
  const leftHeadLight = new THREE.Mesh(headLightGeom, headLightMaterial);
  leftHeadLight.position.set(
    -bodyWidth / 3,
    bodyHeight * 0.2,
    bodyLength / 2 - 0.05
  );
  leftHeadLight.rotation.y = -Math.PI / 16;
  car.add(leftHeadLight);

  const rightHeadLight = new THREE.Mesh(headLightGeom, headLightMaterial);
  rightHeadLight.position.set(
    bodyWidth / 3,
    bodyHeight * 0.2,
    bodyLength / 2 - 0.05
  );
  rightHeadLight.rotation.y = Math.PI / 16;
  car.add(rightHeadLight);

  // Wheels
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.8,
  });
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  wheelGeometry.rotateZ(Math.PI / 2);

  const wheelPositions = [
    // Front wheels
    new THREE.Vector3(bodyWidth / 2 + 0.15, 0.2, bodyLength / 2 - 1),
    new THREE.Vector3(-(bodyWidth / 2 + 0.15), 0.2, bodyLength / 2 - 1),
    // Back wheels
    new THREE.Vector3(bodyWidth / 2 + 0.15, 0.2, -bodyLength / 2 + 1),
    new THREE.Vector3(-(bodyWidth / 2 + 0.15), 0.2, -bodyLength / 2 + 1),
  ];

  const wheels = wheelPositions.map((pos) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.copy(pos);
    wheel.castShadow = true;
    car.add(wheel);
    return wheel;
  });

  car.userData.parts = {
      chassis: carBody,
      cabin: cabin,
      wheels: wheels,
  };

  return car;
}


export function createTransformer() {
  const transformer = new THREE.Group();
  transformer.position.y = 0.5;

  const carModel = createLamborghini();
  const personModel = createPlayerCharacter(true, 'male'); // isPlayer = true
  personModel.visible = false; // Start as car

  transformer.add(carModel);
  transformer.add(personModel);

  // Store parts in userData for the animation function to access
  transformer.userData.carModel = carModel;
  transformer.userData.personModel = personModel;
  // For wheel rotation in car mode
  transformer.userData.parts = { wheels: carModel.userData.parts.wheels };


  return transformer;
}

export function updateTransformerAnimation(
  transformer: THREE.Group,
  progress: number,
  speed: number,
  time: number
) {
  const carModel = transformer.userData.carModel as THREE.Group;
  const personModel = transformer.userData.personModel as THREE.Group;

  const p = THREE.MathUtils.clamp(progress, 0, 1);

  // Visibility logic
  const isPersonVisible = p > 0.5;
  if (personModel.visible !== isPersonVisible) {
      personModel.visible = isPersonVisible;
  }
  if (carModel.visible === isPersonVisible) {
      carModel.visible = !isPersonVisible;
  }

  // Animate Person parts based on car's state if we are transforming into person
  if (p > 0) {
      const carChassis = carModel.userData.parts.chassis;
      const personParts = personModel.userData.parts;
      
      const torsoHeight = 1.4;
      const legHeight = 1.6;
      const shoeHeight = 0.3;
      const totalLegHeight = legHeight + shoeHeight;


      const torsoCarPos = carChassis.position.clone().set(0, 1, 0);
      const torsoPersonPos = new THREE.Vector3(0, 0, 0); // Torso is root of person model
      personParts.torso.position.lerpVectors(torsoCarPos, torsoPersonPos.clone().setY(totalLegHeight + torsoHeight / 2), p);

      const headCarPos = torsoCarPos.clone().setY(2);
      const neckHeight = 0.2;
      const headHeight = 0.5;
      const headPersonPos = new THREE.Vector3(0, totalLegHeight + torsoHeight + neckHeight + headHeight / 2, 0);
      personParts.head.position.lerpVectors(headCarPos, headPersonPos, p);

      // Arms
      const lArmCarPos = new THREE.Vector3(0.5, 1, 0.5);
      const lArmPersonPos = new THREE.Vector3(0.6, totalLegHeight + torsoHeight, 0);
      personParts.leftArm.position.lerpVectors(lArmCarPos, lArmPersonPos, p);

      const rArmCarPos = new THREE.Vector3(-0.5, 1, 0.5);
      const rArmPersonPos = new THREE.Vector3(-0.6, totalLegHeight + torsoHeight, 0);
      personParts.rightArm.position.lerpVectors(rArmCarPos, rArmPersonPos, p);

      // Legs from back wheels
      const carWheels = carModel.userData.parts.wheels;
      const lLegCarPos = carWheels[2].position.clone();
      const lLegPersonPos = new THREE.Vector3(0.25, legHeight / 2 + shoeHeight, 0);
      personParts.leftLeg.position.lerpVectors(lLegCarPos, lLegPersonPos, p);

      const rLegCarPos = carWheels[3].position.clone();
      const rLegPersonPos = new THREE.Vector3(-0.25, legHeight / 2 + shoeHeight, 0);
      personParts.rightLeg.position.lerpVectors(rLegCarPos, rLegPersonPos, p);
      
      personModel.position.y = THREE.MathUtils.lerp(0, -totalLegHeight, p);


      // Simple walk animation for person, only when fully transformed and moving
      if (p >= 1 && speed > 0.1) {
        const walkSpeed = 10;
        const walkAmount = Math.sin(time * walkSpeed);
        personParts.leftLeg.rotation.x = walkAmount * 0.5;
        personParts.rightLeg.rotation.x = -walkAmount * 0.5;
        personParts.leftArm.rotation.x = -walkAmount * 0.4;
        personParts.rightArm.rotation.x = walkAmount * 0.4;
      } else {
        // Return to neutral position if not walking
        personParts.leftLeg.rotation.x = 0;
        personParts.rightLeg.rotation.x = 0;
        personParts.leftArm.rotation.x = 0;
        personParts.rightArm.rotation.x = 0;
      }
  }
}
