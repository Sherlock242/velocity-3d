
import * as THREE from 'three';

export function createSimpleHouse() {
    const house = new THREE.Group();
    
    // Random color for the house body
    const bodyColor = new THREE.Color(Math.random() * 0xffffff);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.8 });

    // Contrasting color for the roof
    const roofColor = new THREE.Color(Math.random() * 0xffffff);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: roofColor });

    const houseWidth = 20 + Math.random() * 10;
    const houseHeight = 15 + Math.random() * 5;
    const houseDepth = 20 + Math.random() * 10;

    // Body
    const bodyGeom = new THREE.BoxGeometry(houseWidth, houseHeight, houseDepth);
    const body = new THREE.Mesh(bodyGeom, bodyMaterial);
    body.position.y = houseHeight / 2;
    body.castShadow = true;
    house.add(body);

    // Roof (Pyramid)
    const roofGeom = new THREE.ConeGeometry(houseWidth * 0.7, 10, 4);
    const roof = new THREE.Mesh(roofGeom, roofMaterial);
    roof.position.y = houseHeight + 5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Door
    const doorGeom = new THREE.BoxGeometry(4, 8, 1);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
    const door = new THREE.Mesh(doorGeom, doorMaterial);
    door.position.set(0, 4, houseDepth / 2 + 0.1);
    house.add(door);

    house.castShadow = true;
    house.receiveShadow = true;
    
    return house;
}
