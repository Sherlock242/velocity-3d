
import * as THREE from 'three';

function createWardencliffTower() {
    const towerGroup = new THREE.Group();
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
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

    const brickMaterial = new THREE.MeshStandardMaterial({ color: 0x9a3e3e, roughness: 0.9 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

    const buildingWidth = 200;
    const buildingHeight = 35;
    const buildingDepth = 50;

    // --- Main Building ---
    const baseGeom = new THREE.BoxGeometry(buildingWidth, 2, buildingDepth + 4);
    const base = new THREE.Mesh(baseGeom, baseMaterial);
    base.position.y = 1;
    house.add(base);

    const mainWallGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
    const mainWall = new THREE.Mesh(mainWallGeom, brickMaterial);
    mainWall.position.y = 2 + buildingHeight / 2;
    house.add(mainWall);
    
    // --- Windows ---
    const windowMaterial = new THREE.MeshStandardMaterial({color: 0x111111});
    const windowWidth = 12;
    const windowHeight = 10;
    const windowY = 2 + buildingHeight * 0.4;
    const windowZ = buildingDepth / 2 + 0.1;
    
    for(let i = 0; i < 5; i++) {
        const rightWindow = new THREE.Mesh(new THREE.BoxGeometry(windowWidth, windowHeight, 1), windowMaterial);
        rightWindow.position.set(25 + i * (windowWidth + 12), windowY, windowZ);
        house.add(rightWindow);

        const leftWindow = new THREE.Mesh(new THREE.BoxGeometry(windowWidth, windowHeight, 1), windowMaterial);
        leftWindow.position.set(-25 - i * (windowWidth + 12), windowY, windowZ);
        house.add(leftWindow);
    }
    
    // --- Entrance Doors ---
    const doorHeight = 18;
    const doorWidth = 7;
    const doorY = 2 + doorHeight / 2;
    const doorZ = buildingDepth/2 + 0.1;
    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 1), woodMaterial);
    leftDoor.position.set(-doorWidth / 2 - 0.5, doorY, doorZ);
    house.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 1), woodMaterial);
    rightDoor.position.set(doorWidth / 2 + 0.5, doorY, doorZ);
    house.add(rightDoor);

    // --- A-Frame Roof ---
    const roofY = 2 + buildingHeight;
    const roofRise = 40;
    const roofAngle = Math.atan(roofRise / (buildingDepth / 2));
    const roofPanelLength = Math.sqrt(Math.pow(roofRise, 2) + Math.pow(buildingDepth / 2, 2));

    const roofPanelGeom = new THREE.BoxGeometry(buildingWidth, 4, roofPanelLength);

    const leftRoofPanel = new THREE.Mesh(roofPanelGeom, roofMaterial);
    leftRoofPanel.position.set(0, roofY + roofRise / 2, -buildingDepth / 4);
    leftRoofPanel.rotation.x = roofAngle;
    house.add(leftRoofPanel);

    const rightRoofPanel = new THREE.Mesh(roofPanelGeom, roofMaterial);
    rightRoofPanel.position.set(0, roofY + roofRise / 2, buildingDepth / 4);
    rightRoofPanel.rotation.x = -roofAngle;
    house.add(rightRoofPanel);
    
    // Gable ends
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-buildingDepth / 2, 0);
    gableShape.lineTo(buildingDepth / 2, 0);
    gableShape.lineTo(0, roofRise);
    gableShape.closePath();
    
    const gableGeom = new THREE.ExtrudeGeometry(gableShape, { depth: 4, bevelEnabled: false });
    
    const frontGable = new THREE.Mesh(gableGeom, brickMaterial);
    frontGable.position.set(buildingWidth/2 - 2, roofY, 0);
    frontGable.rotation.y = Math.PI / 2;
    house.add(frontGable);

    const backGable = new THREE.Mesh(gableGeom, brickMaterial);
    backGable.position.set(-buildingWidth/2 + 2, roofY, 0);
    backGable.rotation.y = -Math.PI / 2;
    house.add(backGable);
    
    // --- Chimney ---
    const chimneyWidth = 12;
    const chimneyHeight = 50; // Taller chimney
    const chimneyDepth = 10;
    const chimneyGeom = new THREE.BoxGeometry(chimneyWidth, chimneyHeight, chimneyDepth);
    const chimney = new THREE.Mesh(chimneyGeom, brickMaterial);
    chimney.position.set(0, roofY + chimneyHeight/2 - 15, 0); // Lowered to intersect roof
    house.add(chimney);
    
    // Chimney Top
    const chimneyTopGeom = new THREE.BoxGeometry(chimneyWidth + 2, 3, chimneyDepth + 2);
    const chimneyTop = new THREE.Mesh(chimneyTopGeom, roofMaterial);
    chimneyTop.position.y = chimneyHeight/2 + 1.5;
    chimney.add(chimneyTop);


    // Add the tower on top of the house
    const tower = createWardencliffTower();
    tower.position.y = roofY + roofRise;
    house.add(tower);

    house.castShadow = true;
    house.receiveShadow = true;

    return house;
}

    