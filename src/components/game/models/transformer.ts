import * as THREE from 'three';

// This file creates a "Transformer" model that can switch between a car and a person.

function createLegoPerson() {
  const legoPerson = new THREE.Group();

  const headGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Yellow
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.2;

  const torsoGeo = new THREE.BoxGeometry(1.2, 1, 0.6);
  const torsoMat = new THREE.MeshStandardMaterial({ color: 0xcc0000 }); // Red
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 1.4;

  const armGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
  const armMat = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Yellow
  
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(0.75, 1.6, 0);

  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(-0.75, 1.6, 0);

  const legGeo = new THREE.BoxGeometry(0.5, 0.8, 0.5);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 }); // Dark Grey

  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(0.3, 0.4, 0);

  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(-0.3, 0.4, 0);

  legoPerson.add(head, torso, leftArm, rightArm, leftLeg, rightLeg);
  
  legoPerson.userData.parts = {
      head,
      torso,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
  };

  return legoPerson;
}

function createLamborghini() {
  const car = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xcc0000, // Red
    metalness: 0.8,
    roughness: 0.3,
  });
  
  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

  const bodyWidth = 2.2;
  const bodyHeight = 0.6;
  const bodyLength = 4.8;

  // Main body
  const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength),
    bodyMaterial
  );
  carBody.position.y = bodyHeight / 2;
  carBody.castShadow = true;
  car.add(carBody);

  // Cabin
  const cabinWidth = 1.5;
  const cabinHeight = 0.5;
  const cabinLength = 1.8;
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength),
    glassMaterial
  );
  cabin.position.y = bodyHeight + cabinHeight / 2;
  cabin.position.z = -0.5;
  car.add(cabin);

  // Spoiler
  const spoilerWingWidth = bodyWidth * 1.25;
  const spoilerWing = new THREE.Mesh(
    new THREE.BoxGeometry(spoilerWingWidth, 0.08, 0.4),
    blackMaterial
  );
  spoilerWing.position.set(0, bodyHeight + 0.3, -bodyLength / 2 + 0.2);
  spoilerWing.castShadow = true;
  car.add(spoilerWing);
  const spoilerSupportGeom = new THREE.BoxGeometry(0.1, 0.2, 0.1);
  const spoilerSupport1 = new THREE.Mesh(spoilerSupportGeom, blackMaterial);
  spoilerSupport1.position.set(-0.7, bodyHeight + 0.1, -bodyLength / 2 + 0.2);
  car.add(spoilerSupport1);
  const spoilerSupport2 = new THREE.Mesh(spoilerSupportGeom, blackMaterial);
  spoilerSupport2.position.set(0.7, bodyHeight + 0.1, -bodyLength / 2 + 0.2);
  car.add(spoilerSupport2);

  // Tail Light
  const tailLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 2,
  });
  const tailLightGeom = new THREE.BoxGeometry(bodyWidth * 0.9, 0.15, 0.05);
  const tailLights = new THREE.Mesh(tailLightGeom, tailLightMaterial);
  tailLights.position.set(0, bodyHeight * 0.6, -bodyLength / 2 - 0.02);
  car.add(tailLights);
  
  // Side Mirrors
  const mirrorGeom = new THREE.BoxGeometry(0.1, 0.15, 0.3);
  const leftMirror = new THREE.Mesh(mirrorGeom, blackMaterial);
  leftMirror.position.set(bodyWidth / 2, bodyHeight + 0.1, 0.5);
  car.add(leftMirror);
  const rightMirror = new THREE.Mesh(mirrorGeom, blackMaterial);
  rightMirror.position.set(-bodyWidth / 2, bodyHeight + 0.1, 0.5);
  car.add(rightMirror);
  
  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  
  const frontWheelOffset = bodyLength / 2 - 0.8;
  const backWheelOffset = -bodyLength / 2 + 0.8;
  const wheelXOffset = bodyWidth / 2 + 0.05;

  const frontLeftWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontLeftWheel.position.set(wheelXOffset, 0.4, frontWheelOffset);
  car.add(frontLeftWheel);

  const frontRightWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontRightWheel.position.set(-wheelXOffset, 0.4, frontWheelOffset);
  car.add(frontRightWheel);
  
  const backLeftWheel = new THREE.Mesh(wheelGeo, wheelMat);
  backLeftWheel.position.set(wheelXOffset, 0.4, backWheelOffset);
  car.add(backLeftWheel);

  const backRightWheel = new THREE.Mesh(wheelGeo, wheelMat);
  backRightWheel.position.set(-wheelXOffset, 0.4, backWheelOffset);
  car.add(backRightWheel);
  
  const wheels = [frontLeftWheel, frontRightWheel, backLeftWheel, backRightWheel];
  wheels.forEach(w => w.castShadow = true);

  car.userData.parts = {
      chassis: carBody,
      cabin: cabin,
      wheels,
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

export function updateTransformerAnimation(transformer: THREE.Group, progress: number) {
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
      const torsoPersonPos = new THREE.Vector3(0, 1.4, 0);
      personParts.torso.position.lerpVectors(torsoCarPos, torsoPersonPos, p);

      const headCarPos = torsoCarPos.clone().setY(2);
      const headPersonPos = new THREE.Vector3(0, 2.2, 0);
      personParts.head.position.lerpVectors(headCarPos, headPersonPos, p);
      
      // Arms
      const lArmCarPos = new THREE.Vector3(0.5, 1, 0.5);
      const lArmPersonPos = new THREE.Vector3(0.75, 1.6, 0);
      personParts.leftArm.position.lerpVectors(lArmCarPos, lArmPersonPos, p);

      const rArmCarPos = new THREE.Vector3(-0.5, 1, 0.5);
      const rArmPersonPos = new THREE.Vector3(-0.75, 1.6, 0);
      personParts.rightArm.position.lerpVectors(rArmCarPos, rArmPersonPos, p);
      
      // Legs from back wheels
      const carWheels = carModel.userData.parts.wheels;
      const lLegCarPos = carWheels[2].position.clone();
      const lLegPersonPos = new THREE.Vector3(0.3, 0.4, 0);
      personParts.leftLeg.position.lerpVectors(lLegCarPos, lLegPersonPos, p);
      
      const rLegCarPos = carWheels[3].position.clone();
      const rLegPersonPos = new THREE.Vector3(-0.3, 0.4, 0);
      personParts.rightLeg.position.lerpVectors(rLegCarPos, rLegPersonPos, p);

      // Simple walk animation for person
      const walkSpeed = 10;
      personParts.leftLeg.rotation.x = Math.sin(transformer.position.z * walkSpeed) * 0.5 * p;
      personParts.rightLeg.rotation.x = -Math.sin(transformer.position.z * walkSpeed) * 0.5 * p;
      personParts.leftArm.rotation.x = -Math.sin(transformer.position.z * walkSpeed) * 0.4 * p;
      personParts.rightArm.rotation.x = Math.sin(transformer.position.z * walkSpeed) * 0.4 * p;
  }
}
