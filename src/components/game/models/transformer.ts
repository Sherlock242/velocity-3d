
import * as THREE from 'three';
import { createPlayerCharacter } from './player-character';
import { createLamborghini } from './player-car';

export function createTransformer() {
  const transformer = new THREE.Group();
  transformer.position.y = 0.5;

  const carModel = createLamborghini();
  const personModel = createPlayerCharacter(true, 'male', false); // isPlayer = true, isLobby = false
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
  time: number,
  onGround: boolean,
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
      personParts.torso.position.lerpVectors(torsoCarPos, torsoPersonPos.clone().setY(torsoHeight / 2), p);
      personParts.upperBody.position.y = THREE.MathUtils.lerp(0, totalLegHeight, p);


      const headCarPos = torsoCarPos.clone().setY(2);
      const neckHeight = 0.3;
      const headHeight = 0.5;
      const neckY = torsoHeight;
      const headPersonPos = new THREE.Vector3(0, neckY + neckHeight / 2 + headHeight / 2 + 0.2, 0);
      personParts.head.position.lerpVectors(headCarPos, headPersonPos, p);

      // Arms
      const lArmCarPos = new THREE.Vector3(0.5, 1, 0.5);
      const shoulderHeight = torsoHeight * 0.45;
      const shoulderWidth = 0.55; // Use the in-game shoulder width
      const armYOffset = -0.15;
      const lArmPersonPos = new THREE.Vector3(shoulderWidth, torsoHeight + armYOffset, 0);
      personParts.leftArm.position.lerpVectors(lArmCarPos, lArmPersonPos, p);

      const rArmCarPos = new THREE.Vector3(-0.5, 1, 0.5);
      const rArmPersonPos = new THREE.Vector3(-shoulderWidth, torsoHeight + armYOffset, 0);
      personParts.rightArm.position.lerpVectors(rArmCarPos, rArmPersonPos, p);

      // Legs from back wheels
      const carWheels = carModel.userData.parts.wheels;
      const lLegCarPos = carWheels[2].position.clone();
      const waistWidth = 0.22;
      const lLegPersonPos = new THREE.Vector3(waistWidth, legHeight + shoeHeight, 0);
      personParts.leftLeg.position.lerpVectors(lLegCarPos, lLegPersonPos, p);

      const rLegCarPos = carWheels[3].position.clone();
      const rLegPersonPos = new THREE.Vector3(-waistWidth, legHeight + shoeHeight, 0);
      personParts.rightLeg.position.lerpVectors(rLegCarPos, rLegPersonPos, p);
      
      personModel.position.y = THREE.MathUtils.lerp(0, -totalLegHeight, p);

      if (p >= 1) { // Only animate if fully transformed
        const leftLegParts = personParts.leftLeg.userData;
        const rightLegParts = personParts.rightLeg.userData;
        const leftArmParts = personParts.leftArm.userData;
        const rightArmParts = personParts.rightArm.userData;

        if (onGround) {
          if (speed > 0.1) {
            // Walking/Running animation
            const isRunning = speed > 20; // Greater than walking speed (70kmh is ~19.4 m/s)
            const animSpeed = isRunning ? 15 : 10;
            const animAmount = Math.sin(time * animSpeed);
            
            const legSwing = isRunning ? 1.0 : 0.5;
            const armSwing = isRunning ? 1.2 : 0.4;
            const kneeBend = isRunning ? 1.4 : 0.7;
            const torsoLean = isRunning ? 0.2 : 0;

            personParts.upperBody.rotation.x = torsoLean;
            personParts.upperBody.position.y = totalLegHeight - torsoLean * 2.5;


            // Leg animation
            leftLegParts.upperLeg.rotation.x = animAmount * legSwing;
            leftLegParts.upperLeg.rotation.z = 0;
            leftLegParts.lowerLeg.rotation.x = Math.max(0, Math.sin(time * animSpeed + Math.PI/2) * kneeBend);
            leftLegParts.lowerLeg.rotation.z = 0;
            
            rightLegParts.upperLeg.rotation.x = -animAmount * legSwing;
            rightLegParts.upperLeg.rotation.z = 0;
            rightLegParts.lowerLeg.rotation.x = Math.max(0, Math.sin(time * animSpeed - Math.PI/2) * kneeBend);
            rightLegParts.lowerLeg.rotation.z = 0;

            // Arm animation with more bend, based on reference
            leftArmParts.upperArm.rotation.x = -animAmount * armSwing;
            leftArmParts.lowerArm.rotation.x = -kneeBend * 0.8; // Bend elbow
            rightArmParts.upperArm.rotation.x = animAmount * armSwing;
            rightArmParts.lowerArm.rotation.x = -kneeBend * 0.8; // Bend elbow

          } else {
            // Idle on ground
            personParts.upperBody.rotation.x = 0;
            personParts.upperBody.position.y = totalLegHeight;
            leftLegParts.upperLeg.rotation.x = 0;
            leftLegParts.upperLeg.rotation.z = 0;
            leftLegParts.lowerLeg.rotation.x = 0;
            leftLegParts.lowerLeg.rotation.z = 0;
            rightLegParts.upperLeg.rotation.x = 0;
            rightLegParts.upperLeg.rotation.z = 0;
            rightLegParts.lowerLeg.rotation.x = 0;
            rightLegParts.lowerLeg.rotation.z = 0;
            
            leftArmParts.upperArm.rotation.x = 0;
            leftArmParts.lowerArm.rotation.x = 0;
            rightArmParts.upperArm.rotation.x = 0;
            rightArmParts.lowerArm.rotation.x = 0;
          }
        } else {
          // Jumping animation
          personParts.upperBody.rotation.x = 0;
          personParts.upperBody.position.y = totalLegHeight;
          leftLegParts.upperLeg.rotation.x = -0.4; // Knees bent up
          leftLegParts.lowerLeg.rotation.x = 0.8; // Lower leg bent back
          rightLegParts.upperLeg.rotation.x = -0.4;
          rightLegParts.lowerLeg.rotation.x = 0.8;

          // Apply rotation on Z-axis for outward/inward movement
          leftLegParts.upperLeg.rotation.z = 0.2; // upper leg outward
          leftLegParts.lowerLeg.rotation.z = -0.2;  // lower leg inward
          rightLegParts.upperLeg.rotation.z = -0.2; // upper leg outward
          rightLegParts.lowerLeg.rotation.z = 0.2; // lower leg inward
          
          leftArmParts.upperArm.rotation.x = 0.5;
          leftArmParts.lowerArm.rotation.x = -0.5;
          rightArmParts.upperArm.rotation.x = 0.5;
          rightArmParts.lowerArm.rotation.x = -0.5;
        }
      }
  }
}
