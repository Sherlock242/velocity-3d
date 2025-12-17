
import * as THREE from 'three';

// Helper to create the roof.
export function createHippedRoof(material: THREE.Material, width: number, depth: number, height: number) {
    const roofGeometry = new THREE.BufferGeometry();
    
    const isWide = width > depth;
    const ridgeLength = isWide ? width - depth : depth - width;
    const halfW = width / 2;
    const halfD = depth / 2;
    const halfRidge = ridgeLength / 2;

    const vertices = new Float32Array(isWide ? [
        // Base vertices (bottom of the roof)
        -halfW, 0, -halfD,  // 0: back-left
         halfW, 0, -halfD,  // 1: back-right
         halfW, 0,  halfD,  // 2: front-right
        -halfW, 0,  halfD,  // 3: front-left

        // Ridge vertices (top of the roof)
        -halfRidge, height, 0,  // 4: left-top
         halfRidge, height, 0   // 5: right-top
    ] : [
        // Base vertices
        -halfW, 0, -halfD,  // 0
         halfW, 0, -halfD,  // 1
         halfW, 0,  halfD,  // 2
        -halfW, 0,  halfD,  // 3

        // Ridge vertices
        0, height, -halfRidge,  // 4
        0, height,  halfRidge   // 5
    ]);

    const indices = isWide ? [
        // Front face (trapezoid)
        3, 2, 5,   3, 5, 4,
        // Back face (trapezoid)
        1, 0, 4,   1, 4, 5,
        // Left end (triangle)
        0, 3, 4,
        // Right end (triangle)
        2, 1, 5
    ] : [
        // Right face
        2, 1, 5,  1, 4, 5,
        // Left face
        0, 3, 5,  0, 5, 4,
        // Front end
        3, 2, 5,
        // Back end
        1, 0, 4
    ];

    roofGeometry.setIndex(indices);
    roofGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    roofGeometry.computeVertexNormals(); 

    const roofMesh = new THREE.Mesh(roofGeometry, material);
    return roofMesh;
}
