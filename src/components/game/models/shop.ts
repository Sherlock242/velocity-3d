
import * as THREE from 'three';

export function createShop(color: number) {
    const shop = new THREE.Group();
    const mainMaterial = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, metalness: 0.1 });
    const signMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const shopWidth = 40;
    const shopHeight = 15;
    const shopDepth = 25;

    // Main Structure
    const mainGeom = new THREE.BoxGeometry(shopWidth, shopHeight, shopDepth);
    const mainMesh = new THREE.Mesh(mainGeom, mainMaterial);
    mainMesh.position.y = shopHeight / 2;
    shop.add(mainMesh);

    // Roof Overhang
    const roofGeom = new THREE.BoxGeometry(shopWidth, 2, shopDepth + 5);
    const roof = new THREE.Mesh(roofGeom, roofMaterial);
    roof.position.y = shopHeight;
    roof.position.z = 2.5;
    shop.add(roof);

    // Front Glass Window/Door
    const glassGeom = new THREE.PlaneGeometry(shopWidth * 0.8, shopHeight * 0.7);
    const glass = new THREE.Mesh(glassGeom, glassMaterial);
    glass.position.set(0, shopHeight * 0.45, shopDepth / 2 + 0.1);
    shop.add(glass);

    // Sign
    const signGeom = new THREE.BoxGeometry(shopWidth * 0.5, 4, 1);
    const sign = new THREE.Mesh(signGeom, signMaterial);
    sign.position.set(0, shopHeight - 3, shopDepth / 2 + 0.6);
    shop.add(sign);

    shop.castShadow = true;
    shop.receiveShadow = true;

    return shop;
}

    