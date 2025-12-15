

import * as THREE from 'three';

// Helper to create a procedural brick texture
function createBrickTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    if (!context) {
        return null;
    }

    const brickColors = ['#8a3324', '#654321']; // Reddish-brown and dark brown
    const mortarColor = '#8c8c8c';
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
    texture.repeat.set(16, 8);
    return texture;
}

// Function to create the detailed arched window from the image
function createArchedWindow() {
    const windowGroup = new THREE.Group();

    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const blackGlassMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const frameWidth = 10;
    const frameHeight = 15;
    const frameDepth = -1;
    const paneThickness = 0.2;

    // --- Main Rectangular Frame ---
    const mainFrameGeom = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
    const mainFrame = new THREE.Mesh(mainFrameGeom, whiteMaterial);
    windowGroup.add(mainFrame);

    // Main window glass
    const mainGlassGeom = new THREE.BoxGeometry(frameWidth - 1, frameHeight - 1, frameDepth * 0.5);
    const mainGlass = new THREE.Mesh(mainGlassGeom, blackGlassMaterial);
    mainGlass.position.z = 0.4;
    windowGroup.add(mainGlass);

    // --- Rectangular Panes (Mullions) ---
    const numHorizontal = 5;
    for (let i = 1; i < numHorizontal; i++) {
        const hPaneGeom = new THREE.BoxGeometry(frameWidth - 1, paneThickness, paneThickness);
        const hPane = new THREE.Mesh(hPaneGeom, whiteMaterial);
        hPane.position.y = - (frameHeight / 2) + (i * (frameHeight / numHorizontal)) + 0.5;
        hPane.position.z = 0.6;
        windowGroup.add(hPane);
    }
    
    const numVertical = 3;
    for (let i = 1; i < numVertical; i++) {
        const vPaneGeom = new THREE.BoxGeometry(paneThickness, frameHeight - 1, paneThickness);
        const vPane = new THREE.Mesh(vPaneGeom, whiteMaterial);
        vPane.position.x = - (frameWidth / 2) + (i * (frameWidth / numVertical)) + 0.5;
        vPane.position.z = 0.6;
        windowGroup.add(vPane);
    }

    // --- Arched Top ---
    const archRadius = frameWidth / 2;
    const archShape = new THREE.Shape();
    archShape.moveTo(-archRadius, 0);
    archShape.absarc(0, 0, archRadius, Math.PI, 0, true);
    
    const extrudeSettings = { depth: frameDepth, bevelEnabled: false };
    const archGeom = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
    const archFrame = new THREE.Mesh(archGeom, blackMaterial);
    archFrame.position.y = frameHeight / 2;
    windowGroup.add(archFrame);

    // Arch glass
    const archGlassGeom = new THREE.ShapeGeometry(archShape);
    const archGlass = new THREE.Mesh(archGeom, blackGlassMaterial);
    archGlass.position.y = frameHeight / 2;
    archGlass.position.z = 0.5;
    windowGroup.add(archGlass);

    // --- Arch Panes ---
    const centerPaneGeom = new THREE.BoxGeometry(paneThickness, archRadius, paneThickness);
    const centerPane = new THREE.Mesh(centerPaneGeom, whiteMaterial);
    centerPane.position.y = frameHeight / 2 + archRadius / 2;
    centerPane.position.z = 0.6;
    windowGroup.add(centerPane);

    const numArchPanes = 3;
    for (let i = 0; i < numArchPanes; i++) {
        const angle = (Math.PI / (numArchPanes + 1)) * (i + 1);
        const paneLength = archRadius;
        const paneGeom = new THREE.BoxGeometry(paneThickness, paneLength, paneThickness);
        const pane = new THREE.Mesh(paneGeom, whiteMaterial);
        pane.position.y = frameHeight / 2;
        pane.position.z = 0.6;
        pane.rotation.z = Math.PI / 2 - angle;
        pane.position.x += Math.cos(angle) * (paneLength / 2);
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
        : new THREE.MeshStandardMaterial({ color: '#8B4513', roughness: 0.9 }); // Fallback color

    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

    const buildingWidth = 300;
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
    const entranceGroup = new THREE.Group();
    house.add(entranceGroup);
    
    const doorFrameWidth = 18;
    const doorFrameHeight = 22;
    const doorFrameGeom = new THREE.BoxGeometry(doorFrameWidth, doorFrameHeight, 2);
    const doorFrameMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const doorFrame = new THREE.Mesh(doorFrameGeom, doorFrameMaterial);
    doorFrame.position.set(0, 2 + doorFrameHeight / 2, buildingDepth / 2 + pavilionDepth + 1);
    entranceGroup.add(doorFrame);

    const doorHeight = 18;
    const doorWidth = 7;
    const doorY = 2 + doorFrameHeight / 2 - (doorFrameHeight - doorHeight) / 2;
    const doorZ = buildingDepth / 2 + pavilionDepth + 3;

    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 1), woodMaterial);
    leftDoor.position.set(-doorWidth / 2, doorY, doorZ);
    entranceGroup.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 1), woodMaterial);
    rightDoor.position.set(doorWidth / 2, doorY, doorZ);
    entranceGroup.add(rightDoor);

    // Arched window above door
    const transomRadius = (doorWidth * 2) * 0.7;
    const transomShape = new THREE.Shape();
    transomShape.moveTo(-transomRadius, 0);
    transomShape.absarc(0, 0, transomRadius, Math.PI, 0, true);
    const transomGeom = new THREE.ShapeGeometry(transomShape);
    const transomGlassMaterial = new THREE.MeshLambertMaterial({color: 0x000000});
    const transomGlass = new THREE.Mesh(transomGeom, transomGlassMaterial);
    transomGlass.position.set(0, 2 + doorHeight + 2, doorZ + 0.5);
    entranceGroup.add(transomGlass);
    
    // Transom Panes
    const numTransomPanes = 5;
    for (let i = 0; i < numTransomPanes; i++) {
        const angle = (Math.PI / (numTransomPanes + 1)) * (i + 1);
        const paneLength = transomRadius;
        const paneGeom = new THREE.BoxGeometry(0.2, paneLength, 0.2);
        const pane = new THREE.Mesh(paneGeom, doorFrameMaterial);
        pane.position.set(0, 2 + doorHeight + 2, doorZ + 0.6);
        pane.rotation.z = Math.PI / 2 - angle;
        pane.position.x += Math.cos(angle) * (paneLength / 2);
        pane.position.y += Math.sin(angle) * (paneLength / 2);
        entranceGroup.add(pane);
    }
    entranceGroup.position.z += 1.0;


    // --- Hipped Roof ---
    function createHippedRoof(width: number, depth: number, height: number) {
        const roofGeometry = new THREE.BufferGeometry();
        
        const ridgeLength = width > depth ? width - depth : 0;
        const halfW = width / 2;
        const halfD = depth / 2;
        const halfRidge = ridgeLength / 2;

        const vertices = new Float32Array([
            // Base vertices (bottom of the roof)
            -halfW, 0, -halfD,  // 0: back-left
             halfW, 0, -halfD,  // 1: back-right
             halfW, 0,  halfD,  // 2: front-right
            -halfW, 0,  halfD,  // 3: front-left

            // Ridge vertices (top of the roof)
            -halfRidge, height, 0,  // 4: left-top
             halfRidge, height, 0   // 5: right-top
        ]);

        const indices = [
            // Front face (trapezoid)
            3, 2, 5,   3, 5, 4,
            // Back face (trapezoid)
            1, 0, 4,   1, 4, 5,
            // Left end (triangle)
            0, 3, 4,
            // Right end (triangle)
            2, 1, 5
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
    
    const pavilionRoof = createHippedRoof(pavilionWidth + 2, pavilionDepth + 2, 5);
    pavilionRoof.position.y = roofY;
    pavilionRoof.position.z = buildingDepth / 2 + pavilionDepth / 2;
    house.add(pavilionRoof);

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
    const facadeWindowPositions = [-120, -80, -40, 40, 80, 120];
    facadeWindowPositions.forEach(xPos => {
        const window = createArchedWindow();
        window.position.set(xPos, 18, buildingDepth / 2 + 1);
        house.add(window);
    });


    // --- Roof Vents ---
    const ventGeom = new THREE.BoxGeometry(8, 4, 10);
    const ventMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const vent1 = new THREE.Mesh(ventGeom, ventMaterial);
    vent1.position.set(100, dormerY - 2, 0);
    house.add(vent1);
    const vent2 = new THREE.Mesh(ventGeom, ventMaterial);
    vent2.position.set(-100, dormerY - 2, 0);
    house.add(vent2);
    
    // --- Tower ---
    const tower = createWardencliffTower();
    tower.position.set(0, 0, -150); 
    house.add(tower);
    
    // --- Parking Area for Tower ---
    const parkingRadius = 90;
    const parkingGeom = new THREE.CylinderGeometry(parkingRadius, parkingRadius, 1, 32);
    const parkingMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const parkingArea = new THREE.Mesh(parkingGeom, parkingMaterial);
    parkingArea.position.set(0, 0.5, -150);
    house.add(parkingArea);


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
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.4,
    });
    
    const towerHeight = 187;
    const baseRadius = 80;
    const topRadius = 25;
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

    const domeRadius = 50;
    const platformRadius = 40; // Platform is smaller than the dome
    const platformHeight = 4;
    const platformMaterial = new THREE.MeshStandardMaterial({color: 0x111111, metalness: 0.8, roughness: 0.3});

    const platformGeom = new THREE.CylinderGeometry(platformRadius, platformRadius, platformHeight, 32);
    const platform = new THREE.Mesh(platformGeom, platformMaterial);
    platform.position.y = towerHeight;
    towerGroup.add(platform);
    
    const domeGroup = new THREE.Group();
    domeGroup.position.y = towerHeight; // Dome starts from the platform level

    const braceRadius = 0.5;
    const verticalSegments = 12;
    const horizontalSegments = 8;

    for (let i = 0; i < verticalSegments; i++) {
        const angle = (i / verticalSegments) * Math.PI * 2;
        
        const curvePoints = [];
        for (let j = 0; j <= horizontalSegments; j++) {
            const phi = (j / horizontalSegments) * (Math.PI / 2);
            let radius = domeRadius;
            if (j === 0) radius = platformRadius; // Start from platform edge

            const x = Math.cos(phi) * radius * Math.cos(angle);
            const y = Math.sin(phi) * domeRadius;
            const z = Math.cos(phi) * radius * Math.sin(angle);
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
    topSphere.name = 'wardencliffTopSphere';
    topSphere.position.y = towerHeight + domeRadius;
    towerGroup.add(topSphere);
    
    return towerGroup;
}








