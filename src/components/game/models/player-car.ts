import * as THREE from 'three';

export function createLamborghini() {
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
