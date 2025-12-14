
import * as THREE from 'three';

function createWardencliffTower() {
    const towerGroup = new THREE.Group();
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.8,
        roughness: 0.5,
    });
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x222222,
        wireframe: true,
    });


    const towerHeight = 180;
    const baseRadius = 80;
    const topRadius = 40;
    const numLegs = 8;
    const numLevels = 8;

    // Create main tapered legs and diagonal braces
    for (let i = 0; i < numLevels; i++) {
        const levelY = (i / numLevels) * towerHeight;
        const nextLevelY = ((i + 1) / numLevels) * towerHeight;
        const levelRadius = THREE.MathUtils.lerp(baseRadius, topRadius, i / numLevels);
        const nextLevelRadius = THREE.MathUtils.lerp(baseRadius, topRadius, (i + 1) / numLevels);
        const segmentHeight = nextLevelY - levelY;
        const legThickness = 1.5;

        for (let j = 0; j < numLegs; j++) {
            const angle = (j / numLegs) * Math.PI * 2;
            const nextAngle = ((j + 1) / numLegs) * Math.PI * 2;

            // Leg Segment
            const startPos = new THREE.Vector3(Math.cos(angle) * levelRadius, levelY, Math.sin(angle) * levelRadius);
            const endPos = new THREE.Vector3(Math.cos(angle) * nextLevelRadius, nextLevelY, Math.sin(angle) * nextLevelRadius);
            
            const legPath = new THREE.LineCurve3(startPos, endPos);
            const legGeom = new THREE.TubeGeometry(legPath, 1, legThickness, 6, false);
            const leg = new THREE.Mesh(legGeom, metalMaterial);
            towerGroup.add(leg);

            // Diagonal Braces
            const dBraceStart = startPos;
            const dBraceEnd = new THREE.Vector3(Math.cos(nextAngle) * nextLevelRadius, nextLevelY, Math.sin(nextAngle) * nextLevelRadius);
            const dBraceDist = dBraceStart.distanceTo(dBraceEnd);
            const dBraceGeom = new THREE.BoxGeometry(dBraceDist, 0.8, 0.8);
            const dBrace = new THREE.Mesh(dBraceGeom, metalMaterial);
            dBrace.position.lerpVectors(dBraceStart, dBraceEnd, 0.5);
            dBrace.lookAt(dBraceEnd);
            towerGroup.add(dBrace);
            
            const dBrace2Start = new THREE.Vector3(Math.cos(nextAngle) * levelRadius, levelY, Math.sin(nextAngle) * levelRadius);
            const dBrace2End = endPos;
            const dBrace2Dist = dBrace2Start.distanceTo(dBrace2End);
            const dBrace2Geom = new THREE.BoxGeometry(dBrace2Dist, 0.8, 0.8);
            const dBrace2 = new THREE.Mesh(dBrace2Geom, metalMaterial);
            dBrace2.position.lerpVectors(dBrace2Start, dBrace2End, 0.5);
            dBrace2.lookAt(dBrace2End);
            towerGroup.add(dBrace2);
        }
        
        // Horizontal Ring Brace for the next level
        const ringRadius = THREE.MathUtils.lerp(baseRadius, topRadius, (i + 1) / numLevels) - legThickness;
        const ringGeom = new THREE.TorusGeometry(ringRadius, 1, 8, numLegs * 2);
        const ring = new THREE.Mesh(ringGeom, metalMaterial);
        ring.position.y = nextLevelY;
        ring.rotation.x = Math.PI / 2;
        towerGroup.add(ring);
    }
    
    // Top platform
    const platformRadius = 60;
    const platformGeom = new THREE.CylinderGeometry(platformRadius, platformRadius, 4, 32);
    const platform = new THREE.Mesh(platformGeom, metalMaterial);
    platform.position.y = towerHeight + 2;
    towerGroup.add(platform);

    // Dome
    const domeRadius = 55;
    const domeGeom = new THREE.SphereGeometry(domeRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeWireframe = new THREE.Mesh(domeGeom, wireframeMaterial);
    domeWireframe.position.y = towerHeight + 4;
    towerGroup.add(domeWireframe);


    return towerGroup;
}


export function createWardencliffHouse() {
    const house = new THREE.Group();

    const brickMaterial = new THREE.MeshStandardMaterial({
        color: 0x944C3C, // A reddish-brown brick color
        roughness: 0.9,
    });
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
    });
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x66402A,
    });
    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.1,
        roughness: 0.2,
    });
    const concreteMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
    });

    const buildingWidth = 250;
    const buildingHeight = 35;
    const buildingDepth = 50;

    // Base concrete slab
    const baseGeom = new THREE.BoxGeometry(buildingWidth + 4, 3, buildingDepth + 4);
    const base = new THREE.Mesh(baseGeom, concreteMaterial);
    base.position.y = 1.5;
    house.add(base);

    // Main brick building
    const mainBuildingGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
    const mainBuilding = new THREE.Mesh(mainBuildingGeom, brickMaterial);
    mainBuilding.position.y = buildingHeight / 2 + 3;
    mainBuilding.castShadow = true;
    house.add(mainBuilding);

    // --- Roof ---
    const mainRoofGeom = new THREE.BoxGeometry(buildingWidth, 4, buildingDepth);
    const mainRoof = new THREE.Mesh(mainRoofGeom, roofMaterial);
    mainRoof.position.y = buildingHeight + 3 + 2;
    house.add(mainRoof);
    
    const centralRoofWidth = 80;
    const centralRoofHeight = 10;
    const centralRoofGeom = new THREE.BoxGeometry(centralRoofWidth, centralRoofHeight, buildingDepth * 0.8);
    const centralRoof = new THREE.Mesh(centralRoofGeom, roofMaterial);
    centralRoof.position.y = buildingHeight + 3 + centralRoofHeight/2;
    house.add(centralRoof);

    // Function to create an arched window
    function createArchedWindow(width: number, height: number, segments: number) {
        const windowGroup = new THREE.Group();
        const archRadius = width / 2;

        // Glass
        const windowShape = new THREE.Shape();
        windowShape.moveTo(-width / 2, 0);
        windowShape.absarc(0, height - archRadius, archRadius, Math.PI, 0, false);
        windowShape.lineTo(width / 2, 0);
        windowShape.closePath();

        const windowGeom = new THREE.ShapeGeometry(windowShape);
        const windowPane = new THREE.Mesh(windowGeom, glassMaterial);
        windowGroup.add(windowPane);

        // Vertical Bars
        for (let i = 1; i < segments; i++) {
            const barGeom = new THREE.BoxGeometry(0.2, height, 0.1);
            const bar = new THREE.Mesh(barGeom, woodMaterial);
            bar.position.x = -width / 2 + i * (width / segments);
            windowGroup.add(bar);
        }
        
        // Horizontal Bars
        const numHBars = 4;
        for (let i = 1; i <= numHBars; i++) {
            const barGeom = new THREE.BoxGeometry(width, 0.2, 0.1);
            const bar = new THREE.Mesh(barGeom, woodMaterial);
            bar.position.y = i * (height / (numHBars + 1));
            windowGroup.add(bar);
        }

        return windowGroup;
    }

    // Windows
    const numWindows = 8;
    const windowHeight = 20;
    const windowWidth = 12;
    const windowSpacing = (buildingWidth - 40) / numWindows;

    for (let i = 0; i < numWindows; i++) {
        const window = createArchedWindow(windowWidth, windowHeight, 4);
        const xPos = -buildingWidth / 2 + 20 + i * windowSpacing + windowWidth / 2;
        window.position.set(xPos, 5, buildingDepth / 2 + 0.1);
        house.add(window);
    }
    
    // Central Door
    const doorWidth = 20;
    const doorHeight = 25;
    const door = createArchedWindow(doorWidth, doorHeight, 6);
    door.position.set(0, 5, buildingDepth / 2 + 0.1);
    house.add(door);

    // Roof dormer windows
    function createDormerWindow() {
        const dormer = new THREE.Group();
        const dormerBody = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 6), roofMaterial);
        dormer.add(dormerBody);

        const dormerWindow = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 0.2), glassMaterial);
        dormerWindow.position.z = 3.1;
        dormerBody.add(dormerWindow);
        return dormer;
    }
    const numDormers = 4;
    for (let i = 0; i < numDormers; i++) {
        const dormer = createDormerWindow();
        const xPos = -centralRoofWidth / 2 + 15 + i * 20;
        dormer.position.set(xPos, buildingHeight + 3 + centralRoofHeight + 4, 0);
        house.add(dormer);
    }

    // Chimney
    const chimneyHeight = 20;
    const chimneyGeom = new THREE.BoxGeometry(10, chimneyHeight, 8);
    const chimney = new THREE.Mesh(chimneyGeom, brickMaterial);
    chimney.position.set(0, buildingHeight + 3 + centralRoofHeight + chimneyHeight/2, -buildingDepth / 4);
    house.add(chimney);

    // Add the tower
    const tower = createWardencliffTower();
    tower.position.y = buildingHeight + 3; // Position it on the roof
    house.add(tower);

    return house;
}
