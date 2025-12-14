
import * as THREE from 'three';

function createWardencliffTower() {
    const towerGroup = new THREE.Group();
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333, // Darker metal
        metalness: 0.9,
        roughness: 0.4,
    });
    
    const towerHeight = 187;
    const baseRadius = 30;
    const topRadius = 10;
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

    // --- Tower Top Dome ---
    const domeRadius = 20;
    const platformRadius = 22;
    const platformHeight = 4;

    // Supporting platform
    const platformGeom = new THREE.CylinderGeometry(platformRadius, platformRadius, platformHeight, 32);
    const platform = new THREE.Mesh(platformGeom, metalMaterial);
    platform.position.y = towerHeight;
    towerGroup.add(platform);
    
    // --- Create a lattice dome ---
    const domeGroup = new THREE.Group();
    domeGroup.position.y = towerHeight + platformHeight / 2;

    const braceRadius = 0.5;
    const verticalSegments = 12;
    const horizontalSegments = 8;

    // Vertical Ribs
    for (let i = 0; i < verticalSegments; i++) {
        const angle = (i / verticalSegments) * Math.PI * 2;
        
        const curvePoints = [];
        for (let j = 0; j <= horizontalSegments; j++) {
            const phi = (j / horizontalSegments) * (Math.PI / 2); // 0 to 90 degrees
            const x = Math.cos(phi) * domeRadius * Math.cos(angle);
            const y = Math.sin(phi) * domeRadius;
            const z = Math.cos(phi) * domeRadius * Math.sin(angle);
            curvePoints.push(new THREE.Vector3(x, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const tubeGeom = new THREE.TubeGeometry(curve, 16, braceRadius, 5, false);
        const rib = new THREE.Mesh(tubeGeom, metalMaterial);
        domeGroup.add(rib);
    }
    
    // Horizontal Rings
    for (let i = 1; i <= horizontalSegments; i++) {
        const phi = (i / horizontalSegments) * (Math.PI / 2);
        const ringRadius = Math.cos(phi) * domeRadius;
        const ringY = Math.sin(phi) * domeRadius;

        if (ringRadius > 0) {
            const ringGeom = new THREE.TorusGeometry(ringRadius, braceRadius, 8, 32);
            const ring = new THREE.Mesh(ringGeom, metalMaterial);
            ring.position.y = ringY;
            ring.rotation.x = Math.PI / 2;
            domeGroup.add(ring);
        }
    }
    
    towerGroup.add(domeGroup);


    // Small sphere on top
    const topSphereGeom = new THREE.SphereGeometry(2, 16, 8);
    const topSphere = new THREE.Mesh(topSphereGeom, metalMaterial);
    topSphere.position.y = towerHeight + platformHeight / 2 + domeRadius;
    towerGroup.add(topSphere);
    
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

    // --- A-Frame Roof ---
    const roofAngle = Math.PI / 6; 
    const roofLength = buildingDepth;
    const roofPanelWidth = (buildingWidth / 2) / Math.cos(roofAngle);
    const roofPanelGeom = new THREE.BoxGeometry(roofPanelWidth, 4, roofLength);

    const roofPeakY = buildingHeight + Math.sin(roofAngle) * (buildingWidth / 2);

    const leftRoofPanel = new THREE.Mesh(roofPanelGeom, roofMaterial);
    leftRoofPanel.rotation.z = roofAngle;
    leftRoofPanel.position.set(-buildingWidth / 4, roofPeakY - roofPanelWidth * Math.sin(roofAngle) / 2, 0);
    house.add(leftRoofPanel);

    const rightRoofPanel = new THREE.Mesh(roofPanelGeom, roofMaterial);
    rightRoofPanel.rotation.z = -roofAngle;
    rightRoofPanel.position.set(buildingWidth / 4, roofPeakY - roofPanelWidth * Math.sin(roofAngle) / 2, 0);
    house.add(rightRoofPanel);

    // --- Gable Ends ---
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-buildingWidth / 2, buildingHeight);
    gableShape.lineTo(buildingWidth / 2, buildingHeight);
    gableShape.lineTo(0, roofPeakY + 2);
    gableShape.closePath();

    const extrudeSettings = { depth: 2, bevelEnabled: false };
    const gableGeom = new THREE.ExtrudeGeometry(gableShape, extrudeSettings);
    
    const frontGable = new THREE.Mesh(gableGeom, roofMaterial);
    frontGable.position.z = buildingDepth / 2 - 1;
    house.add(frontGable);
    
    const backGable = new THREE.Mesh(gableGeom, roofMaterial);
    backGable.position.z = -buildingDepth / 2 - 1;
    house.add(backGable);


    // Add the tower on top of the roof
    const towerYOffset = roofPeakY + 4;
    const tower = createWardencliffTower();
    tower.position.y = towerYOffset;
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
