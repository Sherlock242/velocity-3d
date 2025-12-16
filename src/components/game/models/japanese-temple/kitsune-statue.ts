
import * as THREE from 'three';

// Helper function to create the Kitsune (fox) statues
export function createKitsuneStatue() {
    const statueGroup = new THREE.Group();
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x8c92ac, roughness: 0.8 });
    const redBibMaterial = new THREE.MeshStandardMaterial({ color: 0xcc2222 });

    // Body
    const bodyGeom = new THREE.CylinderGeometry(1.5, 1, 6, 8);
    const body = new THREE.Mesh(bodyGeom, stoneMaterial);
    body.position.y = 3;
    statueGroup.add(body);

    // Head
    const headGeom = new THREE.SphereGeometry(2, 8, 6);
    const head = new THREE.Mesh(headGeom, stoneMaterial);
    head.position.y = 7;
    statueGroup.add(head);

    // Snout
    const snoutGeom = new THREE.ConeGeometry(1, 2, 8);
    const snout = new THREE.Mesh(snoutGeom, stoneMaterial);
    snout.position.set(0, 7, 2.5);
    snout.rotation.x = Math.PI / 2;
    statueGroup.add(snout);

    // Ears
    const earGeom = new THREE.ConeGeometry(0.8, 2, 4);
    const leftEar = new THREE.Mesh(earGeom, stoneMaterial);
    leftEar.position.set(-1.5, 8.5, 0);
    leftEar.rotation.z = -Math.PI / 8;
    statueGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeom, stoneMaterial);
    rightEar.position.set(1.5, 8.5, 0);
    rightEar.rotation.z = Math.PI / 8;
    statueGroup.add(rightEar);

    // Tail
    const tailShape = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 4, 3),
        new THREE.Vector3(0.5, 7, 1),
    ]);
    const tailGeom = new THREE.TubeGeometry(tailShape, 8, 1, 6, false);
    const tail = new THREE.Mesh(tailGeom, stoneMaterial);
    tail.position.set(0, 0, -2);
    tail.rotation.x = -Math.PI / 12;
    statueGroup.add(tail);

    // Red Bib
    const bibGeom = new THREE.CylinderGeometry(2.1, 2.1, 1.5, 8, 1, false, Math.PI * 0.2, Math.PI * 0.6);
    const bib = new THREE.Mesh(bibGeom, redBibMaterial);
    bib.position.y = 5.5;
    bib.rotation.y = -Math.PI/2 - (Math.PI * 0.4);
    statueGroup.add(bib);


    return statueGroup;
}
