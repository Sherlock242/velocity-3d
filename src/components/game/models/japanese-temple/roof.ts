
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

    const halfW = width / 2;
    const halfD = depth / 2;
    
    // The shorter ridge on top of the gable
    const gableRidgeLength = width - gableDepth;
    const halfGableRidge = gableRidgeLength / 2;

    // The points for the gable ends
    const gableEaveLength = width - depth; // The base of the triangular gable
    const halfGableEave = gableEaveLength / 2;

    // --- Define Vertices ---

    // Function to apply eave curve
    const applyCurve = (x: number, z: number) => {
        const progressX = Math.abs(x) / halfW;
        const progressZ = Math.abs(z) / halfD;
        const cornerProgress = Math.min(1, (progressX + progressZ) / 1.5);
        return Math.pow(cornerProgress, 2) * eaveCurve;
    };

    // 0-3: Eave corners
    vertices.push(-halfW, applyCurve(-halfW, halfD), halfD); // 0 Front-Left
    vertices.push(halfW, applyCurve(halfW, halfD), halfD);   // 1 Front-Right
    vertices.push(halfW, applyCurve(halfW, -halfD), -halfD);  // 2 Back-Right
    vertices.push(-halfW, applyCurve(-halfW, -halfD), -halfD); // 3 Back-Left

    // 4-5: Gable ridge (top-most ridge)
    vertices.push(-halfGableRidge, height + gableHeight, 0); // 4 Ridge-Left
    vertices.push(halfGableRidge, height + gableHeight, 0);  // 5 Ridge-Right

    // 6-9: Gable eaves (where gable meets main roof)
    vertices.push(-halfGableEave, height, halfD); // 6 Gable-Eave-Front-Left
    vertices.push(halfGableEave, height, halfD);  // 7 Gable-Eave-Front-Right
    vertices.push(halfGableEave, height, -halfD); // 8 Gable-Eave-Back-Right
    vertices.push(-halfGableEave, height, -halfD); // 9 Gable-Eave-Back-Left

    // --- Define Faces (Indices) ---

    // Front Slope (Trapezoid)
    indices.push(0, 1, 7);
    indices.push(0, 7, 6);

    // Back Slope (Trapezoid)
    indices.push(2, 3, 9);
    indices.push(2, 9, 8);

    // Left Hip (Triangle)
    indices.push(3, 0, 6);
    indices.push(3, 6, 9);

    // Right Hip (Triangle)
    indices.push(1, 2, 8);
    indices.push(1, 8, 7);

    // Gable Front (Triangle)
    indices.push(6, 7, 5);
    indices.push(6, 5, 4);

    // Gable Back (Triangle)
    indices.push(8, 9, 4);
    indices.push(8, 4, 5);


    roofGeometry.setIndex(indices);
    roofGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    roofGeometry.computeVertexNormals();

    const roofMesh = new THREE.Mesh(roofGeometry, material);
    return roofMesh;
}
