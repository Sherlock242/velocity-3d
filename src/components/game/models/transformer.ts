import * as THREE from 'three';

// This file creates a "Transformer" model that can switch between a car and a person.

function createLegoPerson() {
  const legoPerson = new THREE.Group();

  const headGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Yellow
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.9;

  const torsoGeo = new THREE.BoxGeometry(1.2, 1, 0.6);
  const torsoMat = new THREE.MeshStandardMaterial({ color: 0x0055ff }); // Blue
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 1.2;

  const armGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
  const armMat = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Yellow
  
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(0.75, 1.4, 0);

  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(-0.75, 1.4, 0);

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
    color: 0x0055ff, // Blue
    metalness: 0.8,
    roughness: 0.2,
  });

  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.5, roughness: 0.5 });
  const windshieldMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true, opacity: 0.7 });


  // Main Body
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-1.1, 0.2);
  bodyShape.lineTo(-1.2, 0.8);
  bodyShape.lineTo(-1.1, 1.4);
  bodyShape.lineTo(1.1, 1.4);
  bodyShape.lineTo(1.2, 0.8);
  bodyShape.lineTo(1.1, 0.2);
  bodyShape.lineTo(-1.1, 0.2);

  const extrudeSettings = {
    steps: 1,
    depth: 4.5,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2
  };
  const bodyGeom = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  const mainBody = new THREE.Mesh(bodyGeom, bodyMaterial);
  mainBody.rotation.x = -Math.PI / 2;
  mainBody.position.set(0, 0, 2.25);
  mainBody.castShadow = true;
  car.add(mainBody);

  // Front Bumper
  const frontBumperGeom = new THREE.BoxGeometry(2.4, 0.3, 0.5);
  const frontBumper = new THREE.Mesh(frontBumperGeom, blackMaterial);
  frontBumper.position.set(0, 0.4, 2.1);
  car.add(frontBumper);

  // Hood
  const hoodGeom = new THREE.PlaneGeometry(2, 1.5);
  const hood = new THREE.Mesh(hoodGeom, bodyMaterial);
  hood.position.set(0, 0.75, 1.2);
  hood.rotation.x = -Math.PI / 2.5;
  car.add(hood);

  // Windshield
  const windshieldGeom = new THREE.PlaneGeometry(1.9, 1.2);
  const windshield = new THREE.Mesh(windshieldGeom, windshieldMaterial);
  windshield.position.set(0, 1.25, 0.1);
  windshield.rotation.x = -Math.PI / 4;
  car.add(windshield);
  
  // Roof
  const roofGeom = new THREE.PlaneGeometry(1.9, 1.5);
  const roof = new THREE.Mesh(roofGeom, bodyMaterial);
  roof.position.set(0, 1.6, -0.8);
  car.add(roof);

  // Rear
  const rearGeom = new THREE.PlaneGeometry(2.2, 1);
  const rear = new THREE.Mesh(rearGeom, bodyMaterial);
  rear.position.set(0, 1.2, -2.2);
  rear.rotation.x = Math.PI / 2.2;
  car.add(rear);

  // Spoiler
  const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.4), blackMaterial);
  spoilerWing.position.set(0, 1.5, -2.2);
  car.add(spoilerWing);
  const spoilerSupport1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.1), blackMaterial);
  spoilerSupport1.position.set(-0.8, 1.35, -2.2);
  car.add(spoilerSupport1);
  const spoilerSupport2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.1), blackMaterial);
  spoilerSupport2.position.set(0.8, 1.35, -2.2);
  car.add(spoilerSupport2);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 32);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  
  const frontLeftWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontLeftWheel.position.set(1.2, 0.45, 1.8);
  car.add(frontLeftWheel);

  const frontRightWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontRightWheel.position.set(-1.2, 0.45, 1.8);
  car.add(frontRightWheel);
  
  const backLeftWheel = new THREE.Mesh(wheelGeo, wheelMat);
  backLeftWheel.position.set(1.2, 0.45, -1.8);
  car.add(backLeftWheel);

  const backRightWheel = new THREE.Mesh(wheelGeo, wheelMat);
  backRightWheel.position.set(-1.2, 0.45, -1.8);
  car.add(backRightWheel);
  
  const wheels = [frontLeftWheel, frontRightWheel, backLeftWheel, backRightWheel];
  wheels.forEach(w => w.castShadow = true);

  car.userData.parts = {
      chassis: mainBody,
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
