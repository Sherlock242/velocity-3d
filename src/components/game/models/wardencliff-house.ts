
import * as THREE from 'three';

function createWardencliffTower() {
    const towerGroup = new THREE.Group();
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333, // Darker metal
        metalness: 0.9,
        roughness: 0.4,
    });
    
    const towerHeight = 187;
    const baseRadius = 40;
    const topRadius = 8;
    const numLegs = 8;
    const numLevels = 10;
    const legThickness = 1.5;

    // Create main tapered legs and diagonal braces
    for (let i = 0; i < numLevels; i++) {
        const levelY = (i / numLevels) * towerHeight;
        const nextLevelY = ((i + 1) / numLevels) * towerHeight;
        const levelRadius = THREE.MathUtils.lerp(baseRadius, topRadius, i / numLevels);
        const nextLevelRadius = THREE.MathUtils.lerp(baseRadius, topRadius, (i + 1) / numLevels);

        for (let j = 0; j < numLegs; j++) {
            const angle = (j / numLegs) * Math.PI * 2;
            const nextAngle = ((j + 1) / numLegs) * Math.PI * 2;

            // Leg Segment
            const startPos = new THREE.Vector3(Math.cos(angle) * levelRadius, levelY, Math.sin(angle) * levelRadius);
            const endPos = new THREE.Vector3(Math.cos(angle) * nextLevelRadius, nextLevelY, Math.sin(angle) * nextLevelRadius);
            
            const legPath = new THREE.LineCurve3(startPos, endPos);
            const legGeom = new THREE.TubeGeometry(legPath, 1, legThickness, 4, false);
            const leg = new THREE.Mesh(legGeom, metalMaterial);
            towerGroup.add(leg);
            
            // Diagonal Braces (Cross pattern)
            const dBrace1Start = startPos.clone();
            const dBrace1End = new THREE.Vector3(Math.cos(nextAngle) * nextLevelRadius, nextLevelY, Math.sin(nextAngle) * nextLevelRadius);

            const dBrace2Start = new THREE.Vector3(Math.cos(nextAngle) * levelRadius, levelY, Math.sin(nextAngle) * levelRadius);
            const dBrace2End = endPos.clone();
            
            const braces = [
                { start: dBrace1Start, end: dBrace1End },
                { start: dBrace2Start, end: dBrace2End },
            ]

            braces.forEach(braceInfo => {
                const bracePath = new THREE.LineCurve3(braceInfo.start, braceInfo.end);
                const braceGeom = new THREE.TubeGeometry(bracePath, 1, legThickness / 2, 4, false);
                const brace = new THREE.Mesh(braceGeom, metalMaterial);
                towerGroup.add(brace);
            });
        }
    }
    
    return towerGroup;
}


export function createWardencliffHouse() {
    const house = new THREE.Group();

    const brickMaterial = new THREE.MeshStandardMaterial({
        color: 0x9a3e3e, 
        roughness: 0.9,
    });
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
    });
    
    const buildingWidth = 200;
    const buildingHeight = 60;
    const buildingDepth = 150;

    // Main brick building
    const mainBuildingGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
    const mainBuilding = new THREE.Mesh(mainBuildingGeom, brickMaterial);
    mainBuilding.position.y = buildingHeight / 2;
    mainBuilding.castShadow = true;
    house.add(mainBuilding);

    // Flat dark roof
    const roofGeom = new THREE.BoxGeometry(buildingWidth, 4, buildingDepth);
    const roof = new THREE.Mesh(roofGeom, roofMaterial);
    roof.position.y = buildingHeight + 2;
    house.add(roof);

    // Add the tower on top of the roof
    const tower = createWardencliffTower();
    tower.position.y = buildingHeight + 4; // Position it on the roof
    house.add(tower);

    // Add front face details
    const detailMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const details = [
        { s: [2, 4], p: [-80, 15] },
        { s: [2, 4], p: [-65, 15] },
        { s: [2, 4], p: [-50, 15] },
        { s: [8, 3], p: [-30, 15], r: 0.5 },
        { s: [6, 4], p: [-10, 15], r: -0.2 },
        { s: [2, 4], p: [10, 15] },
        { s: [2, 4], p: [25, 15] },
        { s: [2, 4], p: [40, 15] },
    ];

    details.forEach(d => {
        const detailGeom = new THREE.PlaneGeometry(d.s[0], d.s[1]);
        const detailMesh = new THREE.Mesh(detailGeom, detailMaterial);
        detailMesh.position.set(d.p[0], d.p[1], buildingDepth / 2 + 0.1);
        if (d.r) {
            detailMesh.rotation.z = d.r;
        }
        house.add(detailMesh);
    });


    return house;
}
