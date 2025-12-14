
import * as THREE from 'three';

// Helper to create a procedural brick texture
function createBrickTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    if (!context) {
        return null;
    }

    const brickColors = ['#9a3e3e', '#A0522D', '#654321']; // Mason Red, Light Brown, Dark Brown
    const mortarColor = '#cccccc'; // Light grey
    const brickHeight = 32;
    const brickWidth = 64;
    const mortarThickness = 4;

    context.fillStyle = mortarColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row * brickHeight < canvas.height; row++) {
        const isStaggered = row % 2 === 1;
        for (let col = 0; col * brickWidth < canvas.width + (isStaggered ? brickWidth / 2 : 0); col++) {
            context.fillStyle = brickColors[Math.floor(Math.random() * brickColors.length)];
            let offsetX = 0;
            if (isStaggered) {
                offsetX = -brickWidth / 2;
            }
            context.fillRect(
                col * brickWidth + offsetX,
                row * brickHeight,
                brickWidth - mortarThickness,
                brickHeight - mortarThickness
            );
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 8); // Repeat texture for smaller bricks
    return texture;
}

// Function to create the detailed arched window from the image
function createArchedWindow() {
    const windowGroup = new THREE.Group();

    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
    const frameWidth = 10;
    const frameHeight = 15;
    const frameDepth = 1;
    const paneThickness = 0.2;

    // --- Main Rectangular Frame ---
    const mainFrameGeom = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
    const mainFrame = new THREE.Mesh(mainFrameGeom, frameMaterial);
    windowGroup.add(mainFrame);

    // Main window glass
    const mainGlassGeom = new THREE.BoxGeometry(frameWidth - 1, frameHeight - 1, frameDepth * 0.5);
    const mainGlass = new THREE.Mesh(mainGlassGeom, glassMaterial);
    mainGlass.position.z = 0.3;
    windowGroup.add(mainGlass);

    // --- Rectangular Panes (Mullions) ---
    const numHorizontal = 5;
    for (let i = 1; i < numHorizontal; i++) {
        const hPaneGeom = new THREE.BoxGeometry(frameWidth - 1, paneThickness, paneThickness);
        const hPane = new THREE.Mesh(hPaneGeom, frameMaterial);
        hPane.position.y = - (frameHeight / 2) + (i * (frameHeight / numHorizontal)) + 0.5;
        hPane.position.z = 0.5;
        windowGroup.add(hPane);
    }
    
    const numVertical = 3;
    for (let i = 1; i < numVertical; i++) {
        const vPaneGeom = new THREE.BoxGeometry(paneThickness, frameHeight - 1, paneThickness);
        const vPane = new THREE.Mesh(vPaneGeom, frameMaterial);
        vPane.position.x = - (frameWidth / 2) + (i * (frameWidth / numVertical)) + 0.5;
        vPane.position.z = 0.5;
        windowGroup.add(vPane);
    }

    // --- Arched Top ---
    const archRadius = frameWidth / 2;
    const archShape = new THREE.Shape();
    archShape.moveTo(-archRadius, 0);
    archShape.absarc(0, 0, archRadius, Math.PI, 0, false);
    
    const extrudeSettings = { depth: frameDepth, bevelEnabled: false };
    const archGeom = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
    const archFrame = new THREE.Mesh(archGeom, frameMaterial);
    archFrame.position.y = frameHeight / 2;
    windowGroup.add(archFrame);

    // Arch glass
    const archGlassGeom = new THREE.ShapeGeometry(archShape);
    const archGlass = new THREE.Mesh(archGlassGeom, glassMaterial);
    archGlass.position.y = frameHeight / 2;
    archGlass.position.z = 0.5;
    windowGroup.add(archGlass);

    // --- Arch Panes ---
    const centerPaneGeom = new THREE.BoxGeometry(paneThickness, archRadius, paneThickness);
    const centerPane = new THREE.Mesh(centerPaneGeom, frameMaterial);
    centerPane.position.y = frameHeight / 2 + archRadius / 2;
    centerPane.position.z = 0.5;
    windowGroup.add(centerPane);

    const numArchPanes = 3;
    for (let i = 0; i < numArchPanes; i++) {
        const angle = (Math.PI / (numArchPanes + 1)) * (i + 1);
        const paneLength = archRadius;
        const paneGeom = new THREE.BoxGeometry(paneThickness, paneLength, paneThickness);
        const pane = new THREE.Mesh(paneGeom, frameMaterial);
        pane.position.y = frameHeight / 2;
        pane.position.z = 0.5;
        pane.rotation.z = Math.PI / 2 - angle;
        pane.position.x = Math.cos(angle) * (paneLength / 2);
        pane.position.y += Math.sin(angle) * (paneLength / 2);
        windowGroup.add(pane);
    }

    return windowGroup;
}


export function createWardencliffHouse() {
    const house = new THREE.Group();

    const brickTexture = createBrickTexture();
    const brickMaterial = brickTexture 
        ? new THREE.MeshStandardMaterial({ map: brickTexture, roughness: 0.9 })
        : new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 }); // Fallback color

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

    // --- Central Pavilion Projection ---
    const pavilionWidth = 25;
    const pavilionDepth = 3;
    const pavilionGeom = new THREE.BoxGeometry(pavilionWidth, buildingHeight, pavilionDepth);
    const pavilion = new THREE.Mesh(pavilionGeom, brickMaterial);
    pavilion.position.set(0, 2 + buildingHeight / 2, buildingDepth / 2 + pavilionDepth / 2);
    house.add(pavilion);

    
    // --- Entrance Doors ---
    const doorHeight = 18;
    const doorWidth = 7;
    const doorY = 2 + doorHeight / 2;
    const doorZ = buildingDepth / 2 + pavilionDepth + 0.1;
    
    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 1), woodMaterial);
    leftDoor.position.set(-doorWidth / 2 - 0.5, doorY, doorZ);
    house.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 1), woodMaterial);
    rightDoor.position.set(doorWidth / 2 + 0.5, doorY, doorZ);
    house.add(rightDoor);

    // --- Hipped Roof ---
    function createHippedRoof(width: number, depth: number, height: number) {
        const roofGeometry = new THREE.BufferGeometry();
        
        const topWidth = Math.max(0, width - 2 * height);
        const topDepth = Math.max(0, depth - 2 * height);

        const vertices = new Float32Array([
            // Bottom rectangle vertices
            -width / 2, 0, -depth / 2,  // 0
             width / 2, 0, -depth / 2,  // 1
             width / 2, 0,  depth / 2,  // 2
            -width / 2, 0,  depth / 2,  // 3

            // Top rectangle vertices
            -topWidth / 2, height, -topDepth / 2, // 4
             topWidth / 2, height, -topDepth / 2, // 5
             topWidth / 2, height,  topDepth / 2, // 6
            -topWidth / 2, height,  topDepth / 2  // 7
        ]);

        const indices = [
            // Side faces (trapezoids)
            0, 1, 5,  0, 5, 4, // Back face
            1, 2, 6,  1, 6, 5, // Right face
            2, 3, 7,  2, 7, 6, // Front face
            3, 0, 4,  3, 4, 7, // Left face

            // Top face (rectangle)
            4, 5, 6,  4, 6, 7
        ];

        roofGeometry.setIndex(indices);
        roofGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        roofGeometry.computeVertexNormals();

        const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
        return roofMesh;
    }
    
    const roofY = 2 + buildingHeight;
    const roofHeight = 20;

    const mainRoof = createHippedRoof(buildingWidth + 2, buildingDepth + 2, roofHeight);
    mainRoof.position.y = roofY;
    house.add(mainRoof);
    
    // --- Dormer (Mini House) on Roof ---
    const dormerY = roofY + roofHeight;
    const dormerWidth = 40;
    const dormerHeight = 10;
    const dormerDepth = 12;

    const dormerWall = new THREE.Mesh(
        new THREE.BoxGeometry(dormerWidth, dormerHeight, dormerDepth),
        brickMaterial
    );
    dormerWall.position.set(0, dormerY - dormerHeight / 2, 10);
    house.add(dormerWall);
    
    const dormerRoof = createHippedRoof(dormerWidth + 2, dormerDepth + 2, 6);
    dormerRoof.position.set(0, dormerY, 10);
    house.add(dormerRoof);
    
    const dormerWindows = [-15, 0, 15];
    dormerWindows.forEach(xPos => {
        const windowGeom = new THREE.BoxGeometry(4, 4, 1);
        const windowMaterial = new THREE.MeshStandardMaterial({color: 0x222222});
        const window = new THREE.Mesh(windowGeom, windowMaterial);
        window.position.set(xPos, dormerY - dormerHeight / 2, 10 + dormerDepth / 2 + 0.1);
        house.add(window);
    });

    // --- Place new windows on the main facade ---
    const facadeWindowPositions = [-70, -40, 40, 70];
    facadeWindowPositions.forEach(xPos => {
        const window = createArchedWindow();
        window.position.set(xPos, 18, buildingDepth / 2 + 1);
        house.add(window);
    });


    // --- Roof Vents ---
    const ventGeom = new THREE.BoxGeometry(8, 4, 10);
    const ventMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const vent1 = new THREE.Mesh(ventGeom, ventMaterial);
    vent1.position.set(40, dormerY - 2, 0);
    house.add(vent1);
    const vent2 = new THREE.Mesh(ventGeom, ventMaterial);
    vent2.position.set(-40, dormerY - 2, 0);
    house.add(vent2);
    
    // --- Tower ---
    const tower = createWardencliffTower();
    tower.position.set(0, dormerY - 10, -100); 
    house.add(tower);

    // --- Chimney ---
    const chimneyWidth = 10;
    const chimneyHeight = 35;
    const chimneyDepth = 8;
    const chimneyGeom = new THREE.BoxGeometry(chimneyWidth, chimneyHeight, chimneyDepth);
    const chimney = new THREE.Mesh(chimneyGeom, brickMaterial);
    
    chimney.position.set(0, dormerY + 6 + chimneyHeight / 2, 10); 
    house.add(chimney);
    
    const chimneyTopGeom = new THREE.BoxGeometry(chimneyWidth + 2, 3, chimneyDepth + 2);
    const chimneyTop = new THREE.Mesh(chimneyTopGeom, roofMaterial);
    chimneyTop.position.y = chimneyHeight / 2 + 1.5;
    chimney.add(chimneyTop);
    
    house.castShadow = true;
    house.receiveShadow = true;
    return house;
}


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

            const startPos = new THREE.Vector3(Math.cos(angle) * levelRadius, levelY, Math.sin(angle) * levelRadius);
            const endPos = new THREE.Vector3(Math.cos(angle) * nextLevelRadius, nextLevelY, Math.sin(angle) * nextLevelRadius);
            
            const legPath = new THREE.LineCurve3(startPos, endPos);
            const legGeom = new THREE.TubeGeometry(legPath, 1, legThickness, 4, false);
            const leg = new THREE.Mesh(legGeom, metalMaterial);
            towerGroup.add(leg);
            
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

    const domeRadius = 20;
    const platformRadius = 22;
    const platformHeight = 4;

    const platformGeom = new THREE.CylinderGeometry(platformRadius, platformRadius, platformHeight, 32);
    const platform = new THREE.Mesh(platformGeom, metalMaterial);
    platform.position.y = towerHeight;
    towerGroup.add(platform);
    
    const domeGroup = new THREE.Group();
    domeGroup.position.y = towerHeight + platformHeight / 2;

    const braceRadius = 0.5;
    const verticalSegments = 12;
    const horizontalSegments = 8;

    for (let i = 0; i < verticalSegments; i++) {
        const angle = (i / verticalSegments) * Math.PI * 2;
        
        const curvePoints = [];
        for (let j = 0; j <= horizontalSegments; j++) {
            const phi = (j / horizontalSegments) * (Math.PI / 2);
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

    const topSphereGeom = new THREE.SphereGeometry(2, 16, 8);
    const topSphere = new THREE.Mesh(topSphereGeom, metalMaterial);
    topSphere.position.y = towerHeight + platformHeight / 2 + domeRadius;
    towerGroup.add(topSphere);
    
    return towerGroup;
}
