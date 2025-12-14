
import * as THREE from 'three';

export function createWardencliffHouse() {
    const house = new THREE.Group();

    const brickMaterial = new THREE.MeshStandardMaterial({ color: 0x9a3e3e, roughness: 0.9 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const windowFrameMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true, opacity: 0.8 });

    const buildingWidth = 200;
    const buildingHeight = 35;
    const buildingDepth = 50;

    // --- Helper function for Arched Windows ---
    function createArchedWindow(width: number, height: number, position: THREE.Vector3) {
        const windowGroup = new THREE.Group();
        windowGroup.position.copy(position);

        // Main Arch
        const archShape = new THREE.Shape();
        const archRadius = width / 2;
        archShape.moveTo(-archRadius, 0);
        archShape.absarc(0, 0, archRadius, Math.PI, 0, false);
        archShape.lineTo(archRadius, -height);
        archShape.lineTo(-archRadius, -height);
        archShape.closePath();

        const frameGeom = new THREE.ExtrudeGeometry(archShape, { depth: 1, bevelEnabled: false });
        const frame = new THREE.Mesh(frameGeom, windowFrameMaterial);
        frame.position.y = height;
        windowGroup.add(frame);
        
        // Glass Pane
        const glassGeom = new THREE.ShapeGeometry(archShape);
        const glass = new THREE.Mesh(glassGeom, glassMaterial);
        glass.position.set(0, height, 0.5);
        windowGroup.add(glass);

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
    const windowY = 2 + buildingHeight * 0.4;
    const windowZ = buildingDepth / 2 + 0.1;
    for (let i = 0; i < 5; i++) {
        const rightWindow = createArchedWindow(12, 10, new THREE.Vector3(30 + i * 25, windowY, windowZ));
        house.add(rightWindow);

        const leftWindow = createArchedWindow(12, 10, new THREE.Vector3(-30 - i * 25, windowY, windowZ));
        house.add(leftWindow);
    }
    
    // --- Entrance Doors ---
    const doorHeight = 18;
    const doorWidth = 7;
    const doorY = 2 + doorHeight / 2;
    const doorZ = buildingDepth / 2 + 0.1;
    
    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 1), woodMaterial);
    leftDoor.position.set(-doorWidth / 2 - 0.5, doorY, doorZ);
    house.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 1), woodMaterial);
    rightDoor.position.set(doorWidth / 2 + 0.5, doorY, doorZ);
    house.add(rightDoor);

    // Fanlight above doors
    const fanlight = createArchedWindow(doorWidth * 2 + 1, 6, new THREE.Vector3(0, doorY + doorHeight/2, doorZ));
    house.add(fanlight);


    // --- Hipped Roof ---
    function createHippedRoof(width: number, depth: number, height: number) {
        const roofGeometry = new THREE.BufferGeometry();
        
        const topWidth = width - height;
        const topDepth = depth - height;

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
    
    // --- Chimney ---
    const chimneyWidth = 12;
    const chimneyHeight = 40;
    const chimneyDepth = 10;
    const chimneyGeom = new THREE.BoxGeometry(chimneyWidth, chimneyHeight, chimneyDepth);
    const chimney = new THREE.Mesh(chimneyGeom, brickMaterial);
    chimney.position.set(0, roofY + chimneyHeight/2 - 5, 0); 
    house.add(chimney);
    
    const chimneyTopGeom = new THREE.BoxGeometry(chimneyWidth + 2, 3, chimneyDepth + 2);
    const chimneyTop = new THREE.Mesh(chimneyTopGeom, roofMaterial);
    chimneyTop.position.y = chimneyHeight/2 + 1.5;
    chimney.add(chimneyTop);
    
    // --- Tower ---
    const tower = createWardencliffTower();
    tower.position.y = roofY + roofHeight;
    house.add(tower);

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
