import * as THREE from 'three';

// This file creates a "Transformer" model that can switch between a car and a person.

// Helper function to create a box with a specific color
function createBox(width: number, height: number, depth: number, color: THREE.ColorRepresentation) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

export function createTransformer() {
  const transformer = new THREE.Group();
  transformer.position.y = 0.5;

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xb72121,
    metalness: 0.9,
    roughness: 0.2,
  });

  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0x3333ff });

  // --- Parts Definition ---
  // Car Parts that become Robot Parts
  const chassis = createBox(2.2, 0.7, 4.5, 0xb72121); // Car body becomes robot torso
  chassis.position.y = 0.6;
  chassis.castShadow = true;

  const cabin = createBox(1.6, 0.8, 1.8, 0x2cd7e2); // Car cabin becomes part of the back
  cabin.material.transparent = true;
  cabin.material.opacity = 0.6;
  cabin.position.y = 1.3;
  cabin.position.z = -0.5;

  // Wheels become feet and shoulder pads
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

  const frontLeftWheel = new THREE.Mesh(wheelGeo.clone(), wheelMat.clone());
  frontLeftWheel.position.set(1.25, 0.4, 1.6);
  const frontRightWheel = new THREE.Mesh(wheelGeo.clone(), wheelMat.clone());
  frontRightWheel.position.set(-1.25, 0.4, 1.6);
  const backLeftWheel = new THREE.Mesh(wheelGeo.clone(), wheelMat.clone());
  backLeftWheel.position.set(1.25, 0.4, -1.6);
  const backRightWheel = new THREE.Mesh(wheelGeo.clone(), wheelMat.clone());
  backRightWheel.position.set(-1.25, 0.4, -1.6);
  
  const wheels = [frontLeftWheel, frontRightWheel, backLeftWheel, backRightWheel];
  wheels.forEach(w => w.castShadow = true);

  // Robot-only parts (hidden in car mode)
  const head = createBox(0.6, 0.6, 0.6, 0x3333ff);
  head.visible = false;

  const upperArmLeft = createBox(0.4, 1.2, 0.4, 0x990000);
  const upperArmRight = createBox(0.4, 1.2, 0.4, 0x990000);
  upperArmLeft.visible = false;
  upperArmRight.visible = false;
  
  const lowerArmLeft = createBox(0.35, 1, 0.35, 0xcccccc);
  const lowerArmRight = createBox(0.35, 1, 0.35, 0xcccccc);
  lowerArmLeft.visible = false;
  lowerArmRight.visible = false;
  
  const upperLegLeft = createBox(0.5, 1.5, 0.5, 0x990000);
  const upperLegRight = createBox(0.5, 1.5, 0.5, 0x990000);
  upperLegLeft.visible = false;
  upperLegRight.visible = false;

  // --- Assembly ---
  const parts = {
    chassis, cabin,
    frontLeftWheel, frontRightWheel, backLeftWheel, backRightWheel,
    wheels, // Keep the array for easy access
    head,
    upperArmLeft, upperArmRight,
    lowerArmLeft, lowerArmRight,
    upperLegLeft, upperLegRight
  };
  
  Object.values(parts).forEach(part => {
    if (Array.isArray(part)) {
        part.forEach(p => transformer.add(p));
    } else {
        transformer.add(part);
    }
  });

  // Store parts in userData for the animation function to access
  transformer.userData.parts = parts;

  return transformer;
}

export function updateTransformerAnimation(transformer: THREE.Group & { userData: { parts: any } }, progress: number) {
  const parts = transformer.userData.parts;
  const p = THREE.MathUtils.clamp(progress, 0, 1); // Ensure progress is between 0 and 1

  // --- Visibility ---
  const isPerson = p > 0.5;
  parts.head.visible = isPerson;
  parts.upperArmLeft.visible = isPerson;
  parts.upperArmRight.visible = isPerson;
  parts.lowerArmLeft.visible = isPerson;
  parts.lowerArmRight.visible = isPerson;
  parts.upperLegLeft.visible = isPerson;
  parts.upperLegRight.visible = isPerson;

  // --- Animate Parts ---
  
  // Chassis (Torso)
  const chassisCarPos = new THREE.Vector3(0, 0.6, 0);
  const chassisPersonPos = new THREE.Vector3(0, 2.5, 0);
  parts.chassis.position.lerpVectors(chassisCarPos, chassisPersonPos, p);
  parts.chassis.rotation.x = THREE.MathUtils.lerp(0, -Math.PI / 12, p);


  // Cabin (Backpack)
  const cabinCarPos = new THREE.Vector3(0, 1.3, -0.5);
  const cabinPersonPos = new THREE.Vector3(0, 2.8, -0.8);
  parts.cabin.position.lerpVectors(cabinCarPos, cabinPersonPos, p);
  parts.cabin.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 6, p);

  // Head
  const headCarPos = new THREE.Vector3(0, 1.5, 1.5);
  const headPersonPos = new THREE.Vector3(0, 3.8, 0);
  parts.head.position.lerpVectors(headCarPos, headPersonPos, p);

  // Back Wheels (Legs/Feet)
  const bLWheelCar = new THREE.Vector3(1.25, 0.4, -1.6);
  const bLWheelPerson = new THREE.Vector3(0.5, 0.4, 0);
  parts.backLeftWheel.position.lerpVectors(bLWheelCar, bLWheelPerson, p);
  parts.backLeftWheel.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 2, p);
  
  const bRWheelCar = new THREE.Vector3(-1.25, 0.4, -1.6);
  const bRWheelPerson = new THREE.Vector3(-0.5, 0.4, 0);
  parts.backRightWheel.position.lerpVectors(bRWheelCar, bRWheelPerson, p);
  parts.backRightWheel.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 2, p);

  // Upper Legs
  parts.upperLegLeft.position.lerpVectors(new THREE.Vector3(0.5, 0.8, -1), new THREE.Vector3(0.5, 1.5, 0), p);
  parts.upperLegRight.position.lerpVectors(new THREE.Vector3(-0.5, 0.8, -1), new THREE.Vector3(-0.5, 1.5, 0), p);
  
  // Front Wheels (Shoulders)
  const fLWheelCar = new THREE.Vector3(1.25, 0.4, 1.6);
  const fLWheelPerson = new THREE.Vector3(1.5, 3.2, 0);
  parts.frontLeftWheel.position.lerpVectors(fLWheelCar, fLWheelPerson, p);
  parts.frontLeftWheel.rotation.z = THREE.MathUtils.lerp(0, Math.PI / 2, p);

  const fRWheelCar = new THREE.Vector3(-1.25, 0.4, 1.6);
  const fRWheelPerson = new THREE.Vector3(-1.5, 3.2, 0);
  parts.frontRightWheel.position.lerpVectors(fRWheelCar, fRWheelPerson, p);
  parts.frontRightWheel.rotation.z = THREE.MathUtils.lerp(0, -Math.PI / 2, p);

  // Arms
  // Upper
  parts.upperArmLeft.position.lerpVectors(new THREE.Vector3(0.8, 1, 1), new THREE.Vector3(1.1, 2.5, 0), p);
  parts.upperArmRight.position.lerpVectors(new THREE.Vector3(-0.8, 1, 1), new THREE.Vector3(-1.1, 2.5, 0), p);
  // Lower
  parts.lowerArmLeft.position.lerpVectors(new THREE.Vector3(0.8, 0.5, 1), new THREE.Vector3(1.1, 1.5, 0), p);
  parts.lowerArmRight.position.lerpVectors(new THREE.Vector3(-0.8, 0.5, 1), new THREE.Vector3(-1.1, 1.5, 0), p);
}

    