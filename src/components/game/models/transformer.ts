import * as THREE from 'three';

// This file creates a "Transformer" model that can switch between a car and a person.

function createLegoPerson() {
  const legoPerson = new THREE.Group();

  const headGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Yellow
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.9;

  const torsoGeo = new THREE.BoxGeometry(1.2, 1, 0.6);
  const torsoMat = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 1.2;

  const armGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
  const armMat = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Yellow
  
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(0.75, 1.4, 0);

  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(-0.75, 1.4, 0);

  const legGeo = new THREE.BoxGeometry(0.5, 0.8, 0.5);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Blue

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
    color: 0xffd700, // Yellow
    metalness: 0.8,
    roughness: 0.2,
  });

  // Main chassis
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.2, 4.5),
    bodyMaterial
  );
  body.position.y = 0.6;
  car.add(body);

  const chassisShape = new THREE.Shape();
  chassisShape.moveTo(-2.2, 0);
  chassisShape.lineTo(2.2, 0);
  chassisShape.lineTo(2.2, 0.8);
  chassisShape.lineTo(1.8, 1.2);
  chassisShape.lineTo(-1.8, 1.2);
  chassisShape.lineTo(-2.2, 0.8);
  chassisShape.lineTo(-2.2, 0);

  const extrudeSettings = { depth: 4.5, bevelEnabled: false };
  const chassisGeom = new THREE.ExtrudeGeometry(chassisShape, extrudeSettings);
  const chassis = new THREE.Mesh(chassisGeom, bodyMaterial);
  car.add(chassis);
  chassis.castShadow = true;

  // Windshield
  const windshieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.7
  });
  const windshieldGeom = new THREE.PlaneGeometry(1.6, 0.8);
  const windshield = new THREE.Mesh(windshieldGeom, windshieldMaterial);
  windshield.position.set(0, 1.2, 0.6);
  windshield.rotation.x = -Math.PI / 8;
  car.add(windshield);


  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  
  const frontLeftWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontLeftWheel.position.set(1.2, 0.4, 1.8);
  car.add(frontLeftWheel);

  const frontRightWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontRightWheel.position.set(-1.2, 0.4, 1.8);
  car.add(frontRightWheel);
  
  const backLeftWheel = new THREE.Mesh(wheelGeo, wheelMat);
  backLeftWheel.position.set(1.2, 0.4, -1.8);
  car.add(backLeftWheel);

  const backRightWheel = new THREE.Mesh(wheelGeo, wheelMat);
  backRightWheel.position.set(-1.2, 0.4, -1.8);
  car.add(backRightWheel);
  
  const wheels = [frontLeftWheel, frontRightWheel, backLeftWheel, backRightWheel];
  wheels.forEach(w => w.castShadow = true);

  car.userData.parts = {
      chassis,
      windshield,
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
      const torsoPersonPos = new THREE.Vector3(0, 1.2, 0);
      personParts.torso.position.lerpVectors(torsoCarPos, torsoPersonPos, p);

      const headCarPos = torsoCarPos.clone().setY(2);
      const headPersonPos = new THREE.Vector3(0, 2.2, 0);
      personParts.head.position.lerpVectors(headCarPos, headPersonPos, p);
      
      // Arms
      const lArmCarPos = new THREE.Vector3(0.5, 1, 0.5);
      const lArmPersonPos = new THREE.Vector3(0.75, 1.4, 0);
      personParts.leftArm.position.lerpVectors(lArmCarPos, lArmPersonPos, p);

      const rArmCarPos = new THREE.Vector3(-0.5, 1, 0.5);
      const rArmPersonPos = new THREE.Vector3(-0.75, 1.4, 0);
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
