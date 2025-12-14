
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
    const windowFrameMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

    const buildingWidth = 200;
    const buildingHeight = 35;
    const buildingDepth = 50;

    // Helper to create an arched window
    function createArchedWindow(width: number, height: number, depth: number) {
        const windowGroup = new THREE.Group();
        const frameWidth = 0.5;
        const windowPaneMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.1 });

        // Main rectangular part of the window
        const mainHeight = height * 0.7;
        const mainFrame = new THREE.Mesh(new THREE.BoxGeometry(width, mainHeight, depth), windowFrameMaterial);
        windowGroup.add(mainFrame);

        // Arched top part
        const archShape = new THREE.Shape();
        archShape.moveTo(-width/2, 0);
        archShape.absarc(0, 0, width/2, Math.PI, 0, false);
        const archGeom = new THREE.ExtrudeGeometry(archShape, { depth: depth, bevelEnabled: false });
        const archFrame = new THREE.Mesh(archGeom, windowFrameMaterial);
        archFrame.position.y = mainHeight / 2;
        windowGroup.add(archFrame);

        // Glass Pane (slightly smaller and inset)
        const paneWidth = width - frameWidth * 2;
        const paneMainHeight = mainHeight - frameWidth * 2;
        const mainPane = new THREE.Mesh(new THREE.BoxGeometry(paneWidth, paneMainHeight, depth * 0.5), windowPaneMaterial);
        mainPane.position.y = -frameWidth;
        windowGroup.add(mainPane);
        
        const archPaneShape = new THREE.Shape();
        archPaneShape.moveTo(-paneWidth/2, 0);
        archPaneShape.absarc(0, 0, paneWidth/2, Math.PI, 0, false);
        const archPaneGeom = new THREE.ExtrudeGeometry(archPaneShape, { depth: depth * 0.5, bevelEnabled: false });
        const archPane = new THREE.Mesh(archPaneGeom, windowPaneMaterial);
        archPane.position.y = paneMainHeight / 2;
        windowGroup.add(archPane);

        return windowGroup;
    }

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
    const windowWidth = 12;
    const windowHeight = 20;
    const windowY = 2 + windowHeight / 2 + 2;
    const windowZ = buildingDepth / 2;
    
    // 4 windows on each side of the entrance
    for(let i = 0; i < 4; i++) {
        const rightWindow = createArchedWindow(windowWidth, windowHeight, 2);
        rightWindow.position.set(25 + i * (windowWidth + 8), windowY, windowZ);
        house.add(rightWindow);

        const leftWindow = createArchedWindow(windowWidth, windowHeight, 2);
        leftWindow.position.set(-25 - i * (windowWidth + 8), windowY, windowZ);
        house.add(leftWindow);
    }
    
    // --- Entrance Pavilion ---
    const pavilionWidth = 20;
    const pavilionHeight = buildingHeight;
    const pavilionDepth = 8;
    
    const pavilionGeom = new THREE.BoxGeometry(pavilionWidth, pavilionHeight, pavilionDepth);
    const pavilion = new THREE.Mesh(pavilionGeom, brickMaterial);
    pavilion.position.set(0, 2 + pavilionHeight/2, windowZ + pavilionDepth / 2);
    house.add(pavilion);

    // Entrance Doors
    const doorHeight = 18;
    const doorWidth = 7;
    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 1), woodMaterial);
    leftDoor.position.set(-doorWidth / 2 - 0.5, 2 + doorHeight / 2, windowZ + pavilionDepth - 0.5);
    house.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 1), woodMaterial);
    rightDoor.position.set(doorWidth / 2 + 0.5, 2 + doorHeight / 2, windowZ + pavilionDepth - 0.5);
    house.add(rightDoor);
    
    // Fanlight window above door
    const fanlight = createArchedWindow(doorWidth * 2, 8, 2);
    fanlight.position.set(0, 2 + doorHeight + 4, windowZ + pavilionDepth - 1);
    house.add(fanlight);

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
    gableShape.lineTo(-buildingDepth / 2, 0);
    
    const gableGeom = new THREE.ExtrudeGeometry(gableShape, { depth: 4, bevelEnabled: false });
    
    const frontGable = new THREE.Mesh(gableGeom, brickMaterial);
    frontGable.position.set(buildingWidth/2 -2, roofY, 0);
    frontGable.rotation.y = Math.PI / 2;
    house.add(frontGable);

    const backGable = new THREE.Mesh(gableGeom, brickMaterial);
    backGable.position.set(-buildingWidth/2 + 2, roofY, 0);
    backGable.rotation.y = -Math.PI / 2;
    house.add(backGable);


    // Pavilion Roof
    const pavRoofRise = 10;
    const pavRoofAngle = Math.atan(pavRoofRise / (pavilionDepth/2));
    const pavRoofPanelLength = Math.sqrt(Math.pow(pavRoofRise, 2) + Math.pow(pavilionDepth / 2, 2));
    const pavRoofPanelGeom = new THREE.BoxGeometry(pavilionWidth, 2, pavRoofPanelLength);
    
    const pavLeftRoof = new THREE.Mesh(pavRoofPanelGeom, roofMaterial);
    pavLeftRoof.position.set(0, roofY + pavRoofRise / 2, windowZ + pavilionDepth / 2 - pavilionDepth / 4);
    pavLeftRoof.rotation.x = pavRoofAngle;
    house.add(pavLeftRoof);
    
    const pavRightRoof = new THREE.Mesh(pavRoofPanelGeom, roofMaterial);
    pavRightRoof.position.set(0, roofY + pavRoofRise / 2, windowZ + pavilionDepth / 2 + pavilionDepth / 4);
    pavRightRoof.rotation.x = -pavRoofAngle;
    house.add(pavRightRoof);
    
    const pavGableShape = new THREE.Shape();
    pavGableShape.moveTo(-pavilionDepth/2, 0);
    pavGableShape.lineTo(pavilionDepth/2, 0);
    pavGableShape.lineTo(0, pavRoofRise);
    pavGableShape.lineTo(-pavilionDepth/2, 0);
    
    const pavGableGeom = new THREE.ShapeGeometry(pavGableShape);
    const pavFrontGable = new THREE.Mesh(pavGableGeom, brickMaterial);
    pavFrontGable.position.set(pavilionWidth / 2, roofY, windowZ + pavilionDepth/2);
    pavFrontGable.rotation.y = Math.PI / 2;
    house.add(pavFrontGable);
    
    const pavBackGable = new THREE.Mesh(pavGableGeom, brickMaterial);
    pavBackGable.position.set(-pavilionWidth / 2, roofY, windowZ + pavilionDepth/2);
    pavBackGable.rotation.y = -Math.PI/2;
    house.add(pavBackGable);
    
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
