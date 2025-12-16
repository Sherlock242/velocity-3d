
import * as THREE from 'three';

// Helper function to create the Kitsune (fox) statues
function createKitsuneStatue() {
    const statueGroup = new THREE.Group();
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x8c92ac, roughness: 0.8 });
    const redBibMaterial = new THREE.MeshStandardMaterial({ color: 0xcc2222 });

    // Body
    const bodyGeom = new THREE.CylinderGeometry(1.5, 1, 6, 8);
    const body = new THREE.Mesh(bodyGeom, stoneMaterial);
    body.position.y = 3;
    statueGroup.add(body);

    // Head
    const headGeom = new THREE.SphereGeometry(2, 8, 6);
    const head = new THREE.Mesh(headGeom, stoneMaterial);
    head.position.y = 7;
    statueGroup.add(head);

    // Snout
    const snoutGeom = new THREE.ConeGeometry(1, 2, 8);
    const snout = new THREE.Mesh(snoutGeom, stoneMaterial);
    snout.position.set(0, 7, 2.5);
    snout.rotation.x = Math.PI / 2;
    statueGroup.add(snout);

    // Ears
    const earGeom = new THREE.ConeGeometry(0.8, 2, 4);
    const leftEar = new THREE.Mesh(earGeom, stoneMaterial);
    leftEar.position.set(-1.5, 8.5, 0);
    leftEar.rotation.z = -Math.PI / 8;
    statueGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeom, stoneMaterial);
    rightEar.position.set(1.5, 8.5, 0);
    rightEar.rotation.z = Math.PI / 8;
    statueGroup.add(rightEar);

    // Tail
    const tailShape = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 4, 3),
        new THREE.Vector3(0.5, 7, 1),
    ]);
    const tailGeom = new THREE.TubeGeometry(tailShape, 8, 1, 6, false);
    const tail = new THREE.Mesh(tailGeom, stoneMaterial);
    tail.position.set(0, 0, -2);
    tail.rotation.x = -Math.PI / 12;
    statueGroup.add(tail);

    // Red Bib
    const bibGeom = new THREE.CylinderGeometry(2.1, 2.1, 1.5, 8, 1, false, Math.PI * 0.2, Math.PI * 0.6);
    const bib = new THREE.Mesh(bibGeom, redBibMaterial);
    bib.position.y = 5.5;
    bib.rotation.y = -Math.PI/2 - (Math.PI * 0.4);
    statueGroup.add(bib);


    return statueGroup;
}


// Helper to create the curved roof (Irimoya-zukuri style)
function createCurvedRoof(width: number, depth: number, height: number, material: THREE.Material) {
    const shape = new THREE.Shape();
    const curveHeight = height * 0.6;
    const midWidth = width * 0.95;

    shape.moveTo(-width / 2, 0);
    shape.quadraticCurveTo(-midWidth/2, curveHeight, 0, curveHeight * 1.1);
    shape.quadraticCurveTo(midWidth/2, curveHeight, width / 2, 0);
    shape.lineTo(width / 2, -height * 0.4);
    shape.lineTo(-width / 2, -height * 0.4);
    shape.closePath();

    const extrudeSettings = { depth: depth, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -depth/2);
    
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

// Helper to create Dougong (bracket sets)
function createDougong(size: number) {
    const dougong = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({color: 0xffffff}); // White

    const mainArm = new THREE.Mesh(new THREE.BoxGeometry(size, size*0.2, size*0.2), mat);
    dougong.add(mainArm);

    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(size*0.2, size*0.2, size), mat);
    dougong.add(crossArm);

    const smallBlock = new THREE.Mesh(new THREE.BoxGeometry(size*0.3, size*0.3, size*0.3), mat);
    smallBlock.position.y = size * 0.25;
    dougong.add(smallBlock);
    
    return dougong;
}

export function createJapaneseTemple() {
    const temple = new THREE.Group();
    temple.name = 'FushimiInariGatehouse';

    const vermilionRed = new THREE.MeshStandardMaterial({ color: 0xdc4405, roughness: 0.6 });
    const blackAccent = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.1, roughness: 0.7 });
    const darkBrownRoof = new THREE.MeshStandardMaterial({ color: 0x3f2a1d, roughness: 0.9 });
    const whitePlaster = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.8 });
    const stoneBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x9fa8a3, roughness: 0.9 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.4 });
    const greenLatticeMaterial = new THREE.MeshStandardMaterial({color: 0x2E8B57});


    // --- Stone Base and Stairs ---
    const baseGroup = new THREE.Group();
    const baseWidth = 150;
    const baseDepth = 70;
    const baseHeight = 15;

    const mainBaseGeom = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const mainBase = new THREE.Mesh(mainBaseGeom, stoneBaseMaterial);
    mainBase.position.y = baseHeight / 2;
    baseGroup.add(mainBase);

    // Staircase
    const stairWidth = 40;
    const numSteps = 15;
    const stepHeight = baseHeight / numSteps;
    const stepDepth = 2.5;

    for (let i = 0; i < numSteps; i++) {
        const singleStepGeom = new THREE.BoxGeometry(stairWidth, stepHeight, stepDepth);
        const step = new THREE.Mesh(singleStepGeom, stoneBaseMaterial);
        step.position.set(
            0,
            (stepHeight / 2) + (i * stepHeight),
            (baseDepth / 2) + (stepDepth / 2) + (i * stepDepth)
        );
        baseGroup.add(step);
    }
    
    // Tiered bases for statues
    const statueBaseWidth = 25;
    const statueBaseHeight = 18;
    const statueBaseDepth = 25;
    const leftStatueBase = new THREE.Mesh(new THREE.BoxGeometry(statueBaseWidth, statueBaseHeight, statueBaseDepth), stoneBaseMaterial);
    leftStatueBase.position.set(-stairWidth/2 - statueBaseWidth/2, statueBaseHeight/2, baseDepth/2 - 20);
    baseGroup.add(leftStatueBase);
    
    const rightStatueBase = new THREE.Mesh(new THREE.BoxGeometry(statueBaseWidth, statueBaseHeight, statueBaseDepth), stoneBaseMaterial);
    rightStatueBase.position.set(stairWidth/2 + statueBaseWidth/2, statueBaseHeight/2, baseDepth/2 - 20);
    baseGroup.add(rightStatueBase);

    temple.add(baseGroup);

    // --- Main Structure ---
    const mainStructureGroup = new THREE.Group();
    mainStructureGroup.position.y = baseHeight;
    temple.add(mainStructureGroup);

    const structureWidth = 120;
    const firstFloorHeight = 25;
    const pillarDiameter = 4;

    // Main Pillars
    const pillarGeom = new THREE.CylinderGeometry(pillarDiameter, pillarDiameter, firstFloorHeight, 16);
    const pillarPositions = [
        { x: -structureWidth / 2.2, z: -15 }, { x: structureWidth / 2.2, z: -15 },
        { x: -structureWidth / 2.2, z: 15 }, { x: structureWidth / 2.2, z: 15 },
        { x: -20, z: -15 }, { x: 20, z: -15 },
        { x: -20, z: 15 }, { x: 20, z: 15 },
    ];
    pillarPositions.forEach(pos => {
        const pillar = new THREE.Mesh(pillarGeom, vermilionRed);
        pillar.position.set(pos.x, firstFloorHeight / 2, pos.z);
        mainStructureGroup.add(pillar);
    });

    // First Floor Plaster Walls
    const wallGeom = new THREE.BoxGeometry(structureWidth, firstFloorHeight, 1);
    const wall1 = new THREE.Mesh(wallGeom, whitePlaster);
    wall1.position.set(0, firstFloorHeight/2, -14);
    mainStructureGroup.add(wall1);
    const wall2 = new THREE.Mesh(wallGeom, whitePlaster);
    wall2.position.set(0, firstFloorHeight/2, 14);
    mainStructureGroup.add(wall2);
    

    // First Floor Roof Support & Brackets
    const lowerRoofSupportGeom = new THREE.BoxGeometry(structureWidth, 8, 40);
    const lowerRoofSupport = new THREE.Mesh(lowerRoofSupportGeom, vermilionRed);
    lowerRoofSupport.position.y = firstFloorHeight;
    mainStructureGroup.add(lowerRoofSupport);
    
    // Intricate brackets (simplified)
    for(let i = 0; i < 10; i++) {
        const bracket = createDougong(5);
        bracket.position.set(-structureWidth/2 + 10 + i * 12, firstFloorHeight + 2, 20);
        mainStructureGroup.add(bracket);
        const bracket2 = bracket.clone();
        bracket2.position.z = -20;
        mainStructureGroup.add(bracket2);
    }


    // --- First Roof ---
    const firstRoof = createCurvedRoof(structureWidth + 20, 60, 10, darkBrownRoof);
    firstRoof.position.y = firstFloorHeight + 8;
    mainStructureGroup.add(firstRoof);

    // --- Second Floor ---
    const secondFloorY = firstFloorHeight + 12;
    const secondFloorGroup = new THREE.Group();
    secondFloorGroup.position.y = secondFloorY;
    mainStructureGroup.add(secondFloorGroup);

    const secondFloorWidth = 90;
    const secondFloorHeight = 20;

    // White plaster walls with red frame
    const upperWallGeom = new THREE.BoxGeometry(secondFloorWidth, secondFloorHeight, 30);
    const upperWall = new THREE.Mesh(upperWallGeom, whitePlaster);
    upperWall.position.y = secondFloorHeight / 2;
    secondFloorGroup.add(upperWall);
    
    const upperFrameGeom = new THREE.BoxGeometry(secondFloorWidth + 2, secondFloorHeight, 32);
    const upperFrame = new THREE.Mesh(upperFrameGeom, vermilionRed);
    upperFrame.position.y = secondFloorHeight / 2;
    secondFloorGroup.add(upperFrame);


    // --- Main Top Roof ---
    const topRoof = createCurvedRoof(secondFloorWidth + 20, 55, 15, darkBrownRoof);
    topRoof.position.y = secondFloorHeight;
    secondFloorGroup.add(topRoof);
    
    // Black decorative ridge on top roof
    const ridgeGeom = new THREE.BoxGeometry(40, 4, 4);
    const ridge = new THREE.Mesh(ridgeGeom, blackAccent);
    ridge.position.y = secondFloorHeight + 15;
    secondFloorGroup.add(ridge);

    // Gold end-caps on ridge
    const endCapGeom = new THREE.BoxGeometry(6, 6, 6);
    const leftCap = new THREE.Mesh(endCapGeom, goldMaterial);
    leftCap.position.set(-22, secondFloorHeight + 15, 0);
    secondFloorGroup.add(leftCap);
    const rightCap = new THREE.Mesh(endCapGeom, goldMaterial);
    rightCap.position.set(22, secondFloorHeight + 15, 0);
    secondFloorGroup.add(rightCap);

    // --- Plaque (Gaku) ---
    const plaqueGroup = new THREE.Group();
    plaqueGroup.position.set(0, firstFloorHeight - 5, 21);
    
    const plaqueBackGeom = new THREE.BoxGeometry(18, 10, 1);
    const plaqueBack = new THREE.Mesh(plaqueBackGeom, blackAccent);
    plaqueGroup.add(plaqueBack);

    const plaqueFrameGeom = new THREE.BoxGeometry(20, 12, 1.2);
    const plaqueFrame = new THREE.Mesh(plaqueFrameGeom, goldMaterial);
    plaqueFrame.position.z = -0.2;
    plaqueGroup.add(plaqueFrame);
    
    mainStructureGroup.add(plaqueGroup);

    // --- Green Lattice Doors ---
    const latticeDoorGeom = new THREE.BoxGeometry(10, firstFloorHeight * 0.8, 1);
    const leftDoor = new THREE.Mesh(latticeDoorGeom, greenLatticeMaterial);
    leftDoor.position.set(-stairWidth/2 - 5, firstFloorHeight * 0.4, 15);
    mainStructureGroup.add(leftDoor);

    const rightDoor = new THREE.Mesh(latticeDoorGeom, greenLatticeMaterial);
    rightDoor.position.set(stairWidth/2 + 5, firstFloorHeight * 0.4, 15);
    mainStructureGroup.add(rightDoor);

    // --- Kitsune Statues ---
    const leftStatue = createKitsuneStatue();
    leftStatue.position.set(-stairWidth/2 - statueBaseWidth/2, statueBaseHeight, baseDepth/2 - 20);
    leftStatue.rotation.y = Math.PI / 6;
    baseGroup.add(leftStatue);
    
    const rightStatue = createKitsuneStatue();
    rightStatue.position.set(stairWidth/2 + statueBaseWidth/2, statueBaseHeight, baseDepth/2 - 20);
    rightStatue.rotation.y = -Math.PI / 6;
    baseGroup.add(rightStatue);
    
    // --- Side Lanterns ---
    function createLantern() {
        const lanternGroup = new THREE.Group();
        const postGeom = new THREE.BoxGeometry(4, 25, 4);
        const post = new THREE.Mesh(postGeom, vermilionRed);
        post.position.y = 12.5;
        lanternGroup.add(post);

        const topGeom = new THREE.BoxGeometry(12, 3, 12);
        const top = new THREE.Mesh(topGeom, darkBrownRoof);
        top.position.y = 28;
        lanternGroup.add(top);

        const lightGeom = new THREE.BoxGeometry(8, 10, 8);
        const light = new THREE.Mesh(lightGeom, new THREE.MeshStandardMaterial({color: 0xfffde8, emissive: 0xffa500, emissiveIntensity: 0.5}));
        light.position.y = 20;
        lanternGroup.add(light);
        
        return lanternGroup;
    }
    
    const leftLantern = createLantern();
    leftLantern.position.set(-stairWidth, 0, baseDepth / 2 + 30);
    baseGroup.add(leftLantern);

    const rightLantern = createLantern();
    rightLantern.position.set(stairWidth, 0, baseDepth / 2 + 30);
    baseGroup.add(rightLantern);


    temple.castShadow = true;
    temple.receiveShadow = true;
    temple.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    return temple;
}
