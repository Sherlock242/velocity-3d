
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
  const hairMaterial = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.6 });
  const shirtMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
  const pantsMaterial = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
  const beltMaterial = new THREE.MeshStandardMaterial({ color: beltColor });
  const metalMaterial = new THREE.MeshStandardMaterial({ metalness: 0.5, roughness: 0.5 });
  const pauldronMaterial = new THREE.MeshStandardMaterial({ color: pauldronColor, roughness: 0.8 });
  const bootsMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });


  const headHeight = 0.5;
  const torsoHeight = 1.2;
  const legHeight = 1.4;
  const shoeHeight = 0.2;
  const totalLegHeight = legHeight + shoeHeight;
  const neckHeight = 0.2;
  const headRadius = 0.4;
  
  // Base position to align with old model's center
  const yOffset = totalLegHeight + torsoHeight / 2;

  // Head
  const head = new THREE.Group();
  head.position.y = totalLegHeight + torsoHeight + neckHeight + headHeight / 2;
  
  const faceGeo = new THREE.SphereGeometry(headRadius, 16, 12);
  const face = new THREE.Mesh(faceGeo, skinMaterial);
  face.scale.y = 1.2; // Elongate for anime style
  head.add(face);
  
  // Spiky Hair
  const hairGroup = new THREE.Group();
  const numLayers = 3;
  const spikesPerLayer = 10;
  
  for (let layer = 0; layer < numLayers; layer++) {
      for (let i = 0; i < spikesPerLayer; i++) {
          const spikeHeight = Math.random() * 0.4 + 0.4;
          const spikeRadius = Math.random() * 0.1 + 0.08;
          const spikeGeo = new THREE.ConeGeometry(spikeRadius, spikeHeight, 5);
          const spike = new THREE.Mesh(spikeGeo, hairMaterial);
          
          const angle = (i / spikesPerLayer) * Math.PI * 2 + (layer * 0.3);
          const radius = headRadius * (0.9 + layer * 0.1);
          
          spike.position.set(
              Math.cos(angle) * radius,
              (layer * 0.1) + Math.random() * 0.1,
              Math.sin(angle) * radius
          );
          
          spike.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.8;
          spike.rotation.y = Math.random() * Math.PI;
          spike.rotation.z = Math.random() * Math.PI;
          
          hairGroup.add(spike);
      }
  }

  // Fringe/Bangs
  const numBangs = 5;
  for (let i = 0; i < numBangs; i++) {
      const spikeHeight = Math.random() * 0.4 + 0.5;
      const spikeRadius = Math.random() * 0.1 + 0.05;
      const spikeGeo = new THREE.ConeGeometry(spikeRadius, spikeHeight, 4);
      const spike = new THREE.Mesh(spikeGeo, hairMaterial);
      
      const x = (i - (numBangs - 1) / 2) * 0.15;
      const y = -0.1 - Math.random() * 0.1;
      const z = headRadius * 0.9;
      
      spike.position.set(x, y, z);
      spike.rotation.x = -Math.PI / 6 - Math.random() * 0.2;
      hairGroup.add(spike);
  }

  hairGroup.position.y = headHeight/2 - 0.1;
  head.add(hairGroup);

  // Torso and Shirt
  const torso = new THREE.Group();
  torso.position.y = totalLegHeight + torsoHeight / 2;
  const torsoGeo = new THREE.BoxGeometry(1.0, torsoHeight, 0.5);
  const torsoMesh = new THREE.Mesh(torsoGeo, shirtMaterial);
  torso.add(torsoMesh);

  // Shirt collar
  const collarGeo = new THREE.BoxGeometry(0.8, 0.2, 0.6);
  const collar = new THREE.Mesh(collarGeo, shirtMaterial);
  collar.position.y = torsoHeight / 2 - 0.05;
  torso.add(collar);

  // Neck
  const neck = new THREE.Group();
  neck.position.y = totalLegHeight + torsoHeight + neckHeight / 2;
  const neckGeo = new THREE.CylinderGeometry(0.2, 0.2, neckHeight, 8);
  const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
  neck.add(neckMesh);


  // Legs and Pants
  const legGeo = new THREE.BoxGeometry(0.4, legHeight, 0.4);

  const leftLeg = new THREE.Group();
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMaterial);
  leftLeg.add(leftLegMesh);
  leftLeg.position.set(0.3, (legHeight / 2) + shoeHeight, 0);

  const rightLeg = new THREE.Group();
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMaterial);
  rightLeg.add(rightLegMesh);
  rightLeg.position.set(-0.3, (legHeight / 2) + shoeHeight, 0);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.4, shoeHeight, 0.6);
  const leftShoe = new THREE.Mesh(shoeGeo, bootsMaterial);
  leftShoe.position.y = (-legHeight / 2);
  leftShoe.position.z = 0.05;
  leftLeg.add(leftShoe);

  const rightShoe = new THREE.Mesh(shoeGeo, bootsMaterial);
  rightShoe.position.y = (-legHeight / 2);
  rightShoe.position.z = 0.05;
  rightLeg.add(rightShoe);


  // Arms
  const armLength = 1.1;
  const armGeo = new THREE.BoxGeometry(0.3, armLength, 0.3);
  
  // Left Arm
  const leftArmGroup = new THREE.Group();
  const leftArm = new THREE.Mesh(armGeo, shirtMaterial);
  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), skinMaterial);
  leftHand.position.y = -armLength / 2 - 0.1;
  leftArm.add(leftHand);
  leftArmGroup.add(leftArm);
  leftArmGroup.position.set(0.65, torso.position.y - 0.1, 0);

  // Right Arm (with armor)
  const rightArmGroup = new THREE.Group();
  const rightArm = new THREE.Mesh(armGeo, shirtMaterial);
  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), skinMaterial);
  rightHand.position.y = -armLength / 2 - 0.1;
  rightArm.add(rightHand);
  rightArmGroup.add(rightArm);
  rightArmGroup.position.set(-0.65, torso.position.y - 0.1, 0);
  
  // Pauldron (Shoulder armor)
  const pauldronGeo = new THREE.BoxGeometry(0.4, 0.3, 0.4);
  const pauldron = new THREE.Mesh(pauldronGeo, pauldronMaterial);
  pauldron.position.y = armLength / 2 - 0.1;
  rightArm.add(pauldron);
  
  // Bracer (Forearm armor)
  const bracerGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.6, 8);
  const bracer = new THREE.Mesh(bracerGeo, metalMaterial);
  bracer.position.y = -0.1;
  rightArm.add(bracer);

  // Belt & Holster
  const beltGroup = new THREE.Group();
  beltGroup.position.y = totalLegHeight;
  const beltGeo = new THREE.BoxGeometry(1.05, 0.2, 0.55);
  const belt = new THREE.Mesh(beltGeo, beltMaterial);
  beltGroup.add(belt);
  
  const buckleGeo = new THREE.BoxGeometry(0.2, 0.25, 0.1);
  const buckle = new THREE.Mesh(buckleGeo, metalMaterial);
  buckle.position.z = 0.3;
  belt.add(buckle);

  const holsterGeo = new THREE.BoxGeometry(0.15, 0.3, 0.3);
  const holster = new THREE.Mesh(holsterGeo, beltMaterial);
  holster.position.set(-0.5, 0, 0);
  holster.rotation.z = Math.PI / 6;
  beltGroup.add(holster);
  
  // Sword hilt
  const hiltGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
  const hilt = new THREE.Mesh(hiltGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
  hilt.position.y = 0.2;
  hilt.rotation.x = Math.PI / 4;
  holster.add(hilt);


  character.add(head, torso, neck, leftLeg, rightLeg, leftArmGroup, rightArmGroup, beltGroup);

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

  // Animate Lego Person parts based on car's state if we are transforming into person
  if (p > 0) {
      const carChassis = carModel.userData.parts.chassis;
      const personParts = personModel.userData.parts;

      const legHeight = 1.4;
      const shoeHeight = 0.2;
      const torsoHeight = 1.2;
      const totalLegHeight = legHeight + shoeHeight;
      const neckHeight = 0.2;
      const headHeight = 0.5;


      const torsoCarPos = carChassis.position.clone().set(0, 1, 0);
      const torsoPersonPos = new THREE.Vector3(0, totalLegHeight + torsoHeight / 2, 0);
      personParts.torso.position.lerpVectors(torsoCarPos, torsoPersonPos, p);

      const headCarPos = torsoCarPos.clone().setY(2);
      const headPersonPos = new THREE.Vector3(0, totalLegHeight + torsoHeight + neckHeight + headHeight / 2, 0);
      personParts.head.position.lerpVectors(headCarPos, headPersonPos, p);

      // Arms
      const lArmCarPos = new THREE.Vector3(0.5, 1, 0.5);
      const lArmPersonPos = new THREE.Vector3(0.75, torsoPersonPos.y, 0);
      personParts.leftArm.position.lerpVectors(lArmCarPos, lArmPersonPos, p);

      const rArmCarPos = new THREE.Vector3(-0.5, 1, 0.5);
      const rArmPersonPos = new THREE.Vector3(-0.75, torsoPersonPos.y, 0);
      personParts.rightArm.position.lerpVectors(rArmCarPos, rArmPersonPos, p);

      // Legs from back wheels
      const carWheels = carModel.userData.parts.wheels;
      const lLegCarPos = carWheels[2].position.clone();
      const lLegPersonPos = new THREE.Vector3(0.3, (legHeight / 2) + shoeHeight, 0);
      personParts.leftLeg.position.lerpVectors(lLegCarPos, lLegPersonPos, p);

      const rLegCarPos = carWheels[3].position.clone();
      const rLegPersonPos = new THREE.Vector3(-0.3, (legHeight / 2) + shoeHeight, 0);
      personParts.rightLeg.position.lerpVectors(rLegCarPos, rLegPersonPos, p);

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

    