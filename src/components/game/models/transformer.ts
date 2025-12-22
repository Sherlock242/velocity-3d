import * as THREE from 'three';
import { createPlayerCharacter } from './player-character';
import { createLamborghini } from './player-car';

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
      
      const torsoHeight = 1.8;
      const legHeight = 2.8;
      const shoeHeight = 0.3;
      const totalLegHeight = legHeight + shoeHeight;


      const torsoCarPos = carChassis.position.clone().set(0, 1, 0);
      const torsoPersonPos = new THREE.Vector3(0, 0, 0); // Torso is root of person model
      personParts.torso.position.lerpVectors(torsoCarPos, torsoPersonPos.clone().setY(totalLegHeight + torsoHeight / 2), p);

      const headCarPos = torsoCarPos.clone().setY(2);
      const neckHeight = 0.3;
      const headHeight = 0.5;
      const headPersonPos = new THREE.Vector3(0, totalLegHeight + torsoHeight + neckHeight + headHeight, 0);
      personParts.head.position.lerpVectors(headCarPos, headPersonPos, p);

      // Arms
      const lArmCarPos = new THREE.Vector3(0.5, 1, 0.5);
      const shoulderHeight = torsoHeight * 0.45;
      const shoulderWidth = 0.7;
      const armYOffset = -0.15;
      const lArmPersonPos = new THREE.Vector3(shoulderWidth, totalLegHeight + torsoHeight / 2 + shoulderHeight + armYOffset, 0);
      personParts.leftArm.position.lerpVectors(lArmCarPos, lArmPersonPos, p);

      const rArmCarPos = new THREE.Vector3(-0.5, 1, 0.5);
      const rArmPersonPos = new THREE.Vector3(-shoulderWidth, totalLegHeight + torsoHeight / 2 + shoulderHeight + armYOffset, 0);
      personParts.rightArm.position.lerpVectors(rArmCarPos, rArmPersonPos, p);

      // Legs from back wheels
      const carWheels = carModel.userData.parts.wheels;
      const lLegCarPos = carWheels[2].position.clone();
      const waistWidth = 0.22;
      const lLegPersonPos = new THREE.Vector3(waistWidth, legHeight / 2 + shoeHeight, 0);
      personParts.leftLeg.position.lerpVectors(lLegCarPos, lLegPersonPos, p);

      const rLegCarPos = carWheels[3].position.clone();
      const rLegPersonPos = new THREE.Vector3(-waistWidth, legHeight / 2 + shoeHeight, 0);
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
