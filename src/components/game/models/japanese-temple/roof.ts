
import * as THREE from 'three';

type HippedRoofProps = {
    width: number;
    depth: number;
    height: number;
    gableHeight: number;
    gableDepth: number;
    eaveCurve: number;
    cornerFlick: number;
    material: THREE.Material;
};

// Helper to create the roof.
export function createHippedRoof({
    width,
    depth,
    height,
    gableHeight,
    gableDepth,
    eaveCurve,
    cornerFlick,
    material,
}: HippedRoofProps) {
    
    const roofGeometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    let vertIndex = 0;

    const halfW = width / 2;
    const halfD = depth / 2;
    const gabledHalfD = gableDepth / 2;
    const hipRun = halfD; 
    const gabledHipRun = (depth - gableDepth) / 2;

    const ridgeStartX = -(width / 2 - gabledHipRun);
    const ridgeEndX = (width / 2 - gabledHipRun);
    const ridgeY = height + gableHeight;

    const segments = 20;

    // --- Generate Vertices ---

    // Function to apply eave curve and corner flick
    const applyCurve = (x: number, z: number, y: number) => {
        const progressX = Math.abs(x) / halfW;
        const progressZ = Math.abs(z) / halfD;
        
        let yOffset = 0;
        
        // Apply main eave curve based on z-position
        yOffset += Math.pow(progressZ, 2) * eaveCurve;
        
        // Apply corner flick based on both x and z
        const cornerProgress = Math.min(1, (progressX + progressZ) / 1.5);
        yOffset += Math.pow(cornerProgress, 4) * cornerFlick;
        
        return y + yOffset;
    };
    
    // Bottom (eave) vertices
    const eaveVerts = [];
    for (let i = 0; i <= segments; i++) { // Front
        const x = -halfW + (width * i / segments);
        const y = applyCurve(x, halfD, 0);
        eaveVerts.push(new THREE.Vector3(x, y, halfD));
    }
    for (let i = 0; i <= segments; i++) { // Back
        const x = -halfW + (width * i / segments);
        const y = applyCurve(x, -halfD, 0);
        eaveVerts.push(new THREE.Vector3(x, y, -halfD));
    }
     for (let i = 1; i < segments; i++) { // Right
        const z = -halfD + (depth * i / segments);
        const y = applyCurve(halfW, z, 0);
        eaveVerts.push(new THREE.Vector3(halfW, y, z));
    }
    for (let i = 1; i < segments; i++) { // Left
        const z = -halfD + (depth * i / segments);
        const y = applyCurve(-halfW, z, 0);
        eaveVerts.push(new THREE.Vector3(-halfW, y, z));
    }
    eaveVerts.forEach(v => vertices.push(v.x, v.y, v.z));
    const eaveVertCount = eaveVerts.length;

    // --- Gabled Roof Vertices ---
    const gableRidgeStart = new THREE.Vector3(ridgeStartX, ridgeY, 0);
    const gableRidgeEnd = new THREE.Vector3(ridgeEndX, ridgeY, 0);
    
    const gablePeakFront = new THREE.Vector3(0, height + gableHeight, gabledHalfD);
    const gablePeakBack = new THREE.Vector3(0, height + gableHeight, -gabledHalfD);
    
    const gableEaveFrontLeft = new THREE.Vector3(ridgeStartX, height, gabledHalfD);
    const gableEaveFrontRight = new THREE.Vector3(ridgeEndX, height, gabledHalfD);
    const gableEaveBackLeft = new THREE.Vector3(ridgeStartX, height, -gabledHalfD);
    const gableEaveBackRight = new THREE.Vector3(ridgeEndX, height, -gabledHalfD);

    const gabledVerts = [
        gableRidgeStart, gableRidgeEnd,
        gablePeakFront, gablePeakBack,
        gableEaveFrontLeft, gableEaveFrontRight,
        gableEaveBackLeft, gableEaveBackRight
    ];
    gabledVerts.forEach(v => vertices.push(v.x, v.y, v.z));
    const gableStartIdx = eaveVertCount;


    // --- Generate Faces ---
    
    // Hip roof faces (connecting eaves to gable eaves)
    const gfl = gableStartIdx + 4; // gableEaveFrontLeft
    const gfr = gableStartIdx + 5; // gableEaveFrontRight
    const gbl = gableStartIdx + 6; // gableEaveBackLeft
    const gbr = gableStartIdx + 7; // gableEaveBackRight

    // Front Hip Face
    for(let i=0; i<segments; i++) {
        indices.push(i, gfl, i + 1);
        indices.push(i + 1, gfl, gfr);
    }
    
    // Back Hip Face
    const backStartIndex = segments + 1;
     for(let i=0; i<segments; i++) {
        indices.push(backStartIndex + i, backStartIndex + i + 1, gbl);
        indices.push(backStartIndex + i + 1, gbr, gbl);
    }

    // Gable roof faces
    const grs = gableStartIdx + 0; // gableRidgeStart
    const gre = gableStartIdx + 1; // gableRidgeEnd
    
    // Front gable
    indices.push(gfl, gfr, gre);
    indices.push(gfl, gre, grs);
    
    // Back gable
    indices.push(gbr, gbl, grs);
    indices.push(gbr, grs, gre);

    // Hip ends (Triangles)
    const leftEaveStart = eaveVerts.findIndex(v => v.x === -halfW && v.z === halfD);
    const leftEaveEnd = eaveVerts.findIndex(v => v.x === -halfW && v.z === -halfD);
    
    if(leftEaveStart !== -1 && leftEaveEnd !== -1) {
       indices.push(leftEaveStart, leftEaveEnd, gbl);
       indices.push(leftEaveStart, gbl, gfl);
    }

    const rightEaveStart = eaveVerts.findIndex(v => v.x === halfW && v.z === halfD);
    const rightEaveEnd = eaveVerts.findIndex(v => v.x === halfW && v.z === -halfD);
    if(rightEaveStart !== -1 && rightEaveEnd !== -1) {
        indices.push(rightEaveStart, gbr, rightEaveEnd);
        indices.push(rightEaveStart, gfr, gbr);
    }

    // Create faces by connecting segments of the eaves to the corresponding gabled eave points
    // This part is complex and requires careful indexing based on how eaveVerts was constructed.
    // A simplified approach for now:
    // We assume the eave vertices are ordered front, back, right, left
    const frontEaves = eaveVerts.slice(0, segments + 1);
    const backEaves = eaveVerts.slice(segments + 1, (segments + 1) * 2);
    
    // Stitch front eaves to gable eaves
    for (let i = 0; i < segments; i++) {
        const xProg = i / segments;
        const targetX = -halfW + width * xProg;
        if(targetX >= ridgeStartX && targetX <= ridgeEndX) {
            indices.push(i, i + 1, gfr);
            indices.push(i, gfr, gfl);
        } else if (targetX < ridgeStartX) {
            indices.push(i, i + 1, gfl);
        } else { // targetX > ridgeEndX
            indices.push(i, i + 1, gfr);
        }
    }
     // Stitch back eaves to gable eaves
    for (let i = 0; i < segments; i++) {
        const xProg = i / segments;
        const targetX = -halfW + width * xProg;
        const backIdx = backStartIndex + i;
        if(targetX >= ridgeStartX && targetX <= ridgeEndX) {
            indices.push(backIdx + 1, backIdx, gbl);
            indices.push(backIdx + 1, gbl, gbr);
        } else if (targetX < ridgeStartX) {
            indices.push(backIdx + 1, backIdx, gbl);
        } else { // targetX > ridgeEndX
            indices.push(backIdx + 1, backIdx, gbr);
        }
    }


    roofGeometry.setIndex(indices);
    roofGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    roofGeometry.computeVertexNormals();

    const roofMesh = new THREE.Mesh(roofGeometry, material);
    return roofMesh;
}
