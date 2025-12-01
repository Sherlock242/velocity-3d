
import * as THREE from 'three';

// This file creates a "Transformer" model that can switch between a car and a person.

function createLegoPerson() {
  const legoPerson = new THREE.Group();

  const headGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Yellow
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 3.2; // Adjusted for taller body
  head.visible = false; // Hide the head

  const torsoGeo = new THREE.BoxGeometry(1.2, 1.5, 0.6); // Slightly shorter torso
  const torsoMat = new THREE.MeshStandardMaterial({ color: 0x111111 }); // Black Hoodie
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 2.8; // Adjusted position

  // Hood up over the head
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x080808 }); // Different black for hair
  const hoodGeo = new THREE.BoxGeometry(1, 1, 1);
  const hood = new THREE.Mesh(hoodGeo, hairMat);
  hood.position.set(0, 3.3, 0); // Position where the head was, adjusted for new height
  legoPerson.add(hood);


  const armGeo = new THREE.BoxGeometry(0.3, 1.1, 0.3); // Adjusted arm length
  const armMat = new THREE.MeshStandardMaterial({ color: 0x111111 }); // Black sleeves
  
  const handGeo = new THREE.BoxGeometry(0.3, 0.2, 0.3);
  const handMat = new THREE.MeshStandardMaterial({ color: 0xffdbac }); // Skin tone

  const leftArmGroup = new THREE.Group();
  const leftArm = new THREE.Mesh(armGeo, armMat);
  const leftHand = new THREE.Mesh(handGeo, handMat);
  leftHand.position.y = -0.65; // Position at the end of the sleeve
  leftArmGroup.add(leftArm);
  leftArmGroup.add(leftHand);
  leftArmGroup.position.set(0.75, 3.1, 0); // Adjusted y-position
  legoPerson.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  const rightArm = new THREE.Mesh(armGeo, armMat);
  const rightHand = new THREE.Mesh(handGeo, handMat);
  rightHand.position.y = -0.65;
  rightArmGroup.add(rightArm);
  rightArmGroup.add(rightHand);
  rightArmGroup.position.set(-0.75, 3.1, 0);
  legoPerson.add(rightArmGroup);


  // --- LEGS & SHOES ---
  const legHeight = 1.8; // Taller legs
  const shoeHeight = 0.2;
  
  const legGeo = new THREE.BoxGeometry(0.5, legHeight, 0.5);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x0055aa }); // Blue Jeans

  // Left Leg
  const leftLeg = new THREE.Group();
  const leftLegMesh = new THREE.Mesh(legGeo, legMat);
  leftLeg.add(leftLegMesh);
  leftLeg.position.set(0.3, (legHeight / 2) + shoeHeight, 0);

  // Right Leg
  const rightLeg = new THREE.Group();
  const rightLegMesh = new THREE.Mesh(legGeo, legMat);
  rightLeg.add(rightLegMesh);
  rightLeg.position.set(-0.3, (legHeight / 2) + shoeHeight, 0);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.5, shoeHeight, 0.6); // a bit longer
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White

  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.y = (-legHeight / 2);
  leftShoe.position.z = 0.05; // a bit forward
  leftLeg.add(leftShoe);

  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.y = (-legHeight / 2);
  rightShoe.position.z = 0.05; // a bit forward
  rightLeg.add(rightShoe);


  legoPerson.add(head, torso, leftLeg, rightLeg);
  
  legoPerson.userData.parts = {
      head: hood, // The hood is now the "head" for animation purposes
      torso,
      leftArm: leftArmGroup,
      rightArm: rightArmGroup,
      leftLeg,
      rightLeg,
  };

  return legoPerson;
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
  const personModel = createLegoPerson();
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
      
      const torsoCarPos = carChassis.position.clone().set(0, 1, 0);
      const torsoPersonPos = new THREE.Vector3(0, 2.8, 0); // Use new position
      personParts.torso.position.lerpVectors(torsoCarPos, torsoPersonPos, p);

      const headCarPos = torsoCarPos.clone().setY(2);
      const headPersonPos = new THREE.Vector3(0, 3.3, 0); // Use new position
      personParts.head.position.lerpVectors(headCarPos, headPersonPos, p);
      
      // Arms
      const lArmCarPos = new THREE.Vector3(0.5, 1, 0.5);
      const lArmPersonPos = new THREE.Vector3(0.75, 3.1, 0); // Use new position
      personParts.leftArm.position.lerpVectors(lArmCarPos, lArmPersonPos, p);

      const rArmCarPos = new THREE.Vector3(-0.5, 1, 0.5);
      const rArmPersonPos = new THREE.Vector3(-0.75, 3.1, 0); // Use new position
      personParts.rightArm.position.lerpVectors(rArmCarPos, rArmPersonPos, p);
      
      // Legs from back wheels
      const carWheels = carModel.userData.parts.wheels;
      const lLegCarPos = carWheels[2].position.clone();
      const lLegPersonPos = new THREE.Vector3(0.3, 1.1, 0); // Use new position
      personParts.leftLeg.position.lerpVectors(lLegCarPos, lLegPersonPos, p);
      
      const rLegCarPos = carWheels[3].position.clone();
      const rLegPersonPos = new THREE.Vector3(-0.3, 1.1, 0); // Use new position
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
