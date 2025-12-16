
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

// Helper to create detailed Dougong (bracket sets)
function createDougong(size: number) {
    const dougong = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({color: 0xdc4405}); // Vermilion Red

    const mainArm = new THREE.Mesh(new THREE.BoxGeometry(size, size*0.2, size*0.2), mat);
    dougong.add(mainArm);

    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(size*0.2, size*0.2, size), mat);
    dougong.add(crossArm);

    // First layer block
    const block1 = new THREE.Mesh(new THREE.BoxGeometry(size*0.3, size*0.3, size*0.3), mat);
    block1.position.y = size * 0.25;
    dougong.add(block1);

    // Second layer arms
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(size * 0.8, size * 0.15, size * 0.15), mat);
    arm2.position.y = size * 0.45;
    dougong.add(arm2);
    
    const arm3 = new THREE.Mesh(new THREE.BoxGeometry(size * 0.15, size * 0.15, size * 0.8), mat);
    arm3.position.y = size * 0.45;
    dougong.add(arm3);
    
    // Top block
    const block2 = new THREE.Mesh(new THREE.BoxGeometry(size*0.4, size*0.2, size*0.4), mat);
    block2.position.y = size * 0.6;
    dougong.add(block2);
    
    return dougong;
}

function createGreenRailing(width: number, height: number, material: THREE.Material) {
    const railing = new THREE.Group();
    const frameThickness = 1;

    // Create frame
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(width, frameThickness, 1), material);
    topFrame.position.y = height / 2 - frameThickness / 2;
    railing.add(topFrame);

    const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(width, frameThickness, 1), material);
    bottomFrame.position.y = -height / 2 + frameThickness / 2;
    railing.add(bottomFrame);

    // Create dense vertical bars
    const numBarsV = 20; // Increased for density
    const barGeom = new THREE.BoxGeometry(0.5, height, 0.5);
    for (let i = 0; i < numBarsV; i++) {
        const vBar = new THREE.Mesh(barGeom, material);
        vBar.position.x = -width / 2 + (i + 0.5) * (width / numBarsV);
        railing.add(vBar);
    }

    return railing;
}

// Helper to create the gold railing
function createGoldRailing(width: number, depth: number, material: THREE.Material) {
    const railing = new THREE.Group();
    const railHeight = 4;
    const railThickness = 0.5;

    const postGeom = new THREE.CylinderGeometry(railThickness, railThickness, railHeight, 8);
    
    const numPostsX = Math.floor(width / 8);
    const numPostsZ = Math.floor(depth / 8);

    // Front Rail
    for (let i = 0; i <= numPostsX; i++) {
        const post = new THREE.Mesh(postGeom, material);
        post.position.set(-width/2 + i * (width/numPostsX), railHeight/2, depth/2);
        railing.add(post);
    }
    const frontRailGeom = new THREE.BoxGeometry(width, railThickness, railThickness);
    const frontTopRail = new THREE.Mesh(frontRailGeom, material);
    frontTopRail.position.set(0, railHeight, depth/2);
    railing.add(frontTopRail);

    // Back Rail
    for (let i = 0; i <= numPostsX; i++) {
        const post = new THREE.Mesh(postGeom, material);
        post.position.set(-width/2 + i * (width/numPostsX), railHeight/2, -depth/2);
        railing.add(post);
    }
    const backTopRail = new THREE.Mesh(frontRailGeom, material);
    backTopRail.position.set(0, railHeight, -depth/2);
    railing.add(backTopRail);
    
    // Left Rail
    for (let i = 1; i < numPostsZ; i++) {
        const post = new THREE.Mesh(postGeom, material);
        post.position.set(-width/2, railHeight/2, -depth/2 + i * (depth/numPostsZ));
        railing.add(post);
    }
    const sideRailGeom = new THREE.BoxGeometry(railThickness, railThickness, depth);
    const leftTopRail = new THREE.Mesh(sideRailGeom, material);
    leftTopRail.position.set(-width/2, railHeight, 0);
    railing.add(leftTopRail);

    // Right Rail
    for (let i = 1; i < numPostsZ; i++) {
        const post = new THREE.Mesh(postGeom, material);
        post.position.set(width/2, railHeight/2, -depth/2 + i * (depth/numPostsZ));
        railing.add(post);
    }
    const rightTopRail = new THREE.Mesh(sideRailGeom, material);
    rightTopRail.position.set(width/2, railHeight, 0);
    railing.add(rightTopRail);


    return railing;
}

export function createJapaneseTemple() {
    const templeContainer = new THREE.Group();
    templeContainer.name = 'FushimiInariGatehouse_Container';

    const mainBuilding = new THREE.Group();
    mainBuilding.name = 'FushimiInariGatehouse_MainBuilding';
    
    const walkableGroup = new THREE.Group();
    walkableGroup.name = 'FushimiInariGatehouse_Walkable';

    const vermilionRed = new THREE.MeshStandardMaterial({ color: 0xdc4405, roughness: 0.6 });
    const blackAccent = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.1, roughness: 0.7 });
    const darkBrownRoof = new THREE.MeshStandardMaterial({ color: 0x3f2a1d, roughness: 0.9 });
    const whitePlaster = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.8 });
    const stoneBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x9fa8a3, roughness: 0.9 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.4 });
    const greenLatticeMaterial = new THREE.MeshStandardMaterial({color: 0x2E8B57});
    const darkBrownStairMaterial = new THREE.MeshStandardMaterial({ color: 0x3f2a1d, roughness: 0.8 });


    // --- Stone Base ---
    const baseGroup = new THREE.Group();
    const baseWidth = 150;
    const baseDepth = 70;
    const baseHeight = 15;

    const mainBaseGeom = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const mainBase = new THREE.Mesh(mainBaseGeom, stoneBaseMaterial);
    mainBase.position.y = baseHeight / 2;
    baseGroup.add(mainBase);

    // Tiered bases for statues
    const statueBaseWidth = 25;
    const statueBaseHeight = 18;
    const statueBaseDepth = 25;
    const leftStatueBase = new THREE.Mesh(new THREE.BoxGeometry(statueBaseWidth, statueBaseHeight, statueBaseDepth), stoneBaseMaterial);
    leftStatueBase.position.set(-baseWidth/2 + statueBaseWidth/2, statueBaseHeight/2, baseDepth/2 - 20);
    baseGroup.add(leftStatueBase);
    
    const rightStatueBase = new THREE.Mesh(new THREE.BoxGeometry(statueBaseWidth, statueBaseHeight, statueBaseDepth), stoneBaseMaterial);
    rightStatueBase.position.set(baseWidth/2 - statueBaseWidth/2, statueBaseHeight/2, baseDepth/2 - 20);
    baseGroup.add(rightStatueBase);

    walkableGroup.add(baseGroup);

    // --- Main Structure ---
    const mainStructureGroup = new THREE.Group();
    mainStructureGroup.position.y = baseHeight;
    mainBuilding.add(mainStructureGroup);

    const structureWidth = 120;
    const firstFloorHeight = 25;
    const pillarDiameter = 4;
    const stairWidth = 40;
    const bayWidth = (structureWidth - (stairWidth + pillarDiameter * 2)) / 2;


    // Main Pillars
    const pillarGeom = new THREE.CylinderGeometry(pillarDiameter, pillarDiameter, firstFloorHeight, 16);
    const pillarPositions = [
      { x: -stairWidth / 2 - pillarDiameter, z: 15 }, { x: stairWidth / 2 + pillarDiameter, z: 15 },
      { x: -stairWidth / 2 - pillarDiameter, z: -15 }, { x: stairWidth / 2 + pillarDiameter, z: -15 },

      { x: -structureWidth / 2 + pillarDiameter, z: 15 }, { x: -structureWidth / 2 + pillarDiameter, z: -15 },
      { x: structureWidth / 2 - pillarDiameter, z: 15 }, { x: structureWidth / 2 - pillarDiameter, z: -15 },
    ];
    pillarPositions.forEach(pos => {
        const pillar = new THREE.Mesh(pillarGeom, vermilionRed);
        pillar.position.set(pos.x, firstFloorHeight / 2, pos.z);
        mainStructureGroup.add(pillar);
    });

    // Green Railing in side bays
    const sideBayWidth = bayWidth - pillarDiameter * 2;
    const greenRailingHeight = 12;
    const greenRailing = createGreenRailing(sideBayWidth, greenRailingHeight, greenLatticeMaterial);
    greenRailing.position.set(stairWidth / 2 + pillarDiameter + sideBayWidth / 2, greenRailingHeight / 2, 15);
    mainStructureGroup.add(greenRailing);

    const greenRailing2 = createGreenRailing(sideBayWidth, greenRailingHeight, greenLatticeMaterial);
    greenRailing2.position.set(-(stairWidth / 2 + pillarDiameter + sideBayWidth / 2), greenRailingHeight / 2, 15);
    mainStructureGroup.add(greenRailing2);

    // First Floor Plaster Walls (behind side bays)
    const sideWallGeom = new THREE.BoxGeometry(sideBayWidth, firstFloorHeight, 1);
    const leftSideWall = new THREE.Mesh(sideWallGeom, whitePlaster);
    leftSideWall.position.set(-(stairWidth / 2 + pillarDiameter + sideBayWidth / 2), firstFloorHeight/2, -14);
    mainStructureGroup.add(leftSideWall);
    
    const rightSideWall = new THREE.Mesh(sideWallGeom, whitePlaster);
    rightSideWall.position.set(stairWidth / 2 + pillarDiameter + sideBayWidth / 2, firstFloorHeight/2, -14);
    mainStructureGroup.add(rightSideWall);
    
    // First Floor Plaster Walls (center)
    const centerWallGeom = new THREE.BoxGeometry(stairWidth + pillarDiameter*2, firstFloorHeight, 1);
    const centerWall = new THREE.Mesh(centerWallGeom, whitePlaster);
    centerWall.position.set(0, firstFloorHeight/2, -14);
    mainStructureGroup.add(centerWall);


    // First Floor Roof Support & Brackets
    const lowerRoofSupportGeom = new THREE.BoxGeometry(structureWidth, 8, 40);
    const lowerRoofSupport = new THREE.Mesh(lowerRoofSupportGeom, vermilionRed);
    lowerRoofSupport.position.y = firstFloorHeight;
    mainStructureGroup.add(lowerRoofSupport);
    
    // Intricate brackets (detailed)
    for(let i = 0; i < 10; i++) {
        const bracket = createDougong(5);
        bracket.position.set(-structureWidth/2 + 10 + i * 12.2, firstFloorHeight + 2, 20);
        mainStructureGroup.add(bracket);
        const bracket2 = bracket.clone();
        bracket2.position.z = -20;
        mainStructureGroup.add(bracket2);
    }


    // --- Second Floor ---
    const secondFloorY = firstFloorHeight + 8;
    const secondFloorGroup = new THREE.Group();
    secondFloorGroup.position.y = secondFloorY;
    mainStructureGroup.add(secondFloorGroup);

    const secondFloorWidth = 90;
    const secondFloorHeight = 20;

    // White plaster walls with red frame
    const upperWallGeom = new THREE.BoxGeometry(secondFloorWidth, secondFloorHeight, 30);
    const upperWall = new THREE.Mesh(upperWallGeom, vermilionRed);
    upperWall.position.y = secondFloorHeight / 2;
    secondFloorGroup.add(upperWall);
    
    const upperFrameGeom = new THREE.BoxGeometry(secondFloorWidth + 2, secondFloorHeight, 32);
    const upperFrame = new THREE.Mesh(upperFrameGeom, vermilionRed);
    upperFrame.position.y = secondFloorHeight / 2;
    secondFloorGroup.add(upperFrame);

    // Second story railing
    const railing2 = createGoldRailing(secondFloorWidth + 2, 32, goldMaterial);
    railing2.position.y = secondFloorHeight;
    secondFloorGroup.add(railing2);


    // --- Main Top Roof ---
    const topRoof = createCurvedRoof(secondFloorWidth + 20, 55, 15, darkBrownRoof);
    topRoof.position.y = secondFloorHeight + 4;
    secondFloorGroup.add(topRoof);
    
    // Black decorative ridge on top roof
    const ridgeGeom = new THREE.BoxGeometry(40, 4, 4);
    const ridge = new THREE.Mesh(ridgeGeom, blackAccent);
    ridge.position.y = secondFloorHeight + 15 + 4;
    secondFloorGroup.add(ridge);

    // Gold end-caps on ridge
    const endCapGeom = new THREE.BoxGeometry(6, 6, 6);
    const leftCap = new THREE.Mesh(endCapGeom, goldMaterial);
    leftCap.position.set(-22, secondFloorHeight + 15 + 4, 0);
    secondFloorGroup.add(leftCap);
    const rightCap = new THREE.Mesh(endCapGeom, goldMaterial);
    rightCap.position.set(22, secondFloorHeight + 15 + 4, 0);
    secondFloorGroup.add(rightCap);

    // --- Plaque (Gaku) ---
    const plaqueGroup = new THREE.Group();
    plaqueGroup.position.set(0, secondFloorHeight - 8, 16); // Position on 2nd floor facade
    plaqueGroup.rotation.y = Math.PI / 2; // Rotate it 90 degrees
    
    const plaqueBackGeom = new THREE.BoxGeometry(18, 10, 1);
    const plaqueBack = new THREE.Mesh(plaqueBackGeom, blackAccent);
    plaqueGroup.add(plaqueBack);

    const plaqueFrameGeom = new THREE.BoxGeometry(20, 12, 1.2);
    const plaqueFrame = new THREE.Mesh(plaqueFrameGeom, goldMaterial);
    plaqueFrame.position.z = -0.2;
    plaqueGroup.add(plaqueFrame);
    
    secondFloorGroup.add(plaqueGroup);

    // --- Kitsune Statues ---
    const leftStatue = createKitsuneStatue();
    leftStatue.position.set(-baseWidth/2 + statueBaseWidth/2, statueBaseHeight, baseDepth/2 - 20);
    leftStatue.rotation.y = Math.PI / 6;
    mainBuilding.add(leftStatue);
    
    const rightStatue = createKitsuneStatue();
    rightStatue.position.set(baseWidth/2 - statueBaseWidth/2, statueBaseHeight, baseDepth/2 - 20);
    rightStatue.rotation.y = -Math.PI / 6;
    mainBuilding.add(rightStatue);
    
    // --- Side Lanterns ---
    function createLantern() {
        const lanternGroup = new THREE.Group();
        const tealRoofMaterial = new THREE.MeshStandardMaterial({ color: 0x008080 }); // Teal color

        const postGeom = new THREE.BoxGeometry(4, 25, 4);
        const post = new THREE.Mesh(postGeom, vermilionRed);
        post.position.y = 12.5;
        lanternGroup.add(post);
        
        const lightGeom = new THREE.BoxGeometry(8, 10, 8);
        const light = new THREE.Mesh(lightGeom, new THREE.MeshStandardMaterial({color: 0xfffde8, emissive: 0xffa500, emissiveIntensity: 0.5}));
        light.position.y = 20;
        lanternGroup.add(light);
        
        const lanternRoofGeom = new THREE.ConeGeometry(8, 8, 4);
        const lanternRoof = new THREE.Mesh(lanternRoofGeom, tealRoofMaterial);
        lanternRoof.position.y = 25 + 4; // On top of the light
        lanternRoof.rotation.y = Math.PI / 4;
        lanternGroup.add(lanternRoof);

        const roofTopGeom = new THREE.BoxGeometry(10, 2, 10);
        const roofTop = new THREE.Mesh(roofTopGeom, blackAccent);
        roofTop.position.y = 25;
        lanternGroup.add(roofTop);

        return lanternGroup;
    }
    
    const leftLantern = createLantern();
    leftLantern.position.set(-baseWidth/2 - 15, 0, baseDepth / 2 + 25);
    mainBuilding.add(leftLantern);

    const rightLantern = createLantern();
    rightLantern.position.set(baseWidth/2 - 15, 0, baseDepth / 2 + 25);
    mainBuilding.add(rightLantern);


    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    mainBuilding.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    templeContainer.add(mainBuilding, walkableGroup);

    return { templeContainer, mainBuilding, walkableGroup };
}
