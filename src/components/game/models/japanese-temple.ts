
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


// Helper to create the roof. Changed to a pyramid shape.
function createPyramidRoof(width: number, depth: number, height: number, material: THREE.Material) {
    const geometry = new THREE.ConeGeometry(Math.max(width, depth) / 1.5, height, 4, 1);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = Math.PI / 4;
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
function createGoldRailing(width: number, height: number, goldMaterial: THREE.Material, redMaterial: THREE.Material) {
    const railing = new THREE.Group();
    const postHeight = height;
    const postGeom = new THREE.CylinderGeometry(0.8, 0.8, postHeight, 12);
    const numPosts = 7;

    for (let i = 0; i < numPosts; i++) {
        const post = new THREE.Mesh(postGeom, redMaterial);
        post.position.set(-width / 2 + (i * (width / (numPosts-1))), postHeight / 2, 0);
        
        const goldCap = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 12), goldMaterial);
        goldCap.position.y = postHeight / 2;
        post.add(goldCap);

        railing.add(post);
    }

    const topRailGeom = new THREE.BoxGeometry(width, 1.5, 2);
    const topRail = new THREE.Mesh(topRailGeom, goldMaterial);
    topRail.position.y = postHeight;
    railing.add(topRail);
    
    return railing;
}

function createLatticePanel(width: number, height: number, redMaterial: THREE.Material, whiteMaterial: THREE.Material) {
    const panel = new THREE.Group();
    const frameThickness = 1.5;

    // Frame
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(width, frameThickness, 2), redMaterial);
    topFrame.position.y = height / 2 - frameThickness / 2;
    panel.add(topFrame);
    const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(width, frameThickness, 2), redMaterial);
    bottomFrame.position.y = -height / 2 + frameThickness / 2;
    panel.add(bottomFrame);
    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, height, 2), redMaterial);
    leftFrame.position.x = -width / 2 + frameThickness / 2;
    panel.add(leftFrame);
    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, height, 2), redMaterial);
    rightFrame.position.x = width / 2 - frameThickness / 2;
    panel.add(rightFrame);

    // Lattice
    const latticeGeom = new THREE.BoxGeometry(width - frameThickness * 2, height - frameThickness * 2, 1);
    const lattice = new THREE.Mesh(latticeGeom, whiteMaterial);
    panel.add(lattice);
    
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(width - frameThickness * 2, 0.5, 1.2), redMaterial);
    panel.add(hBar);
    
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.5, height - frameThickness * 2, 1.2), redMaterial);
    panel.add(vBar);

    return panel;
}

// Helper to create the white decorative flags (noren)
function createNorenCurtain() {
    const curtainGroup = new THREE.Group();
    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });

    const curtainWidth = 12;
    const curtainHeight = 15;

    // Main white part
    const mainCurtainGeom = new THREE.PlaneGeometry(curtainWidth, curtainHeight);
    const mainCurtain = new THREE.Mesh(mainCurtainGeom, whiteMaterial);
    curtainGroup.add(mainCurtain);

    // Top black stripe
    const stripeHeight = 3;
    const stripeGeom = new THREE.PlaneGeometry(curtainWidth, stripeHeight);
    const stripe = new THREE.Mesh(stripeGeom, blackMaterial);
    stripe.position.y = curtainHeight / 2 - stripeHeight / 2;
    stripe.position.z = 0.01;
    curtainGroup.add(stripe);

    // Central black circle emblem
    const circleRadius = 2.5;
    const circleGeom = new THREE.CircleGeometry(circleRadius, 32);
    const circle = new THREE.Mesh(circleGeom, blackMaterial);
    circle.position.z = 0.1; // Position slightly in front to avoid z-fighting
    curtainGroup.add(circle);

    return curtainGroup;
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
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x3f2a1d });
    const greyStripeMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });


    // --- Stone Base ---
    const baseGroup = new THREE.Group();
    const baseWidth = 150;
    const baseDepth = 70;
    const baseHeight = 15;

    const mainBaseGeom = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const mainBase = new THREE.Mesh(mainBaseGeom, stoneBaseMaterial);
    mainBase.position.y = baseHeight / 2;
    baseGroup.add(mainBase);
    
    const secondTierHeight = 3;
    const secondTierGeom = new THREE.BoxGeometry(baseWidth + 5, secondTierHeight, baseDepth + 5);
    const secondTier = new THREE.Mesh(secondTierGeom, stoneBaseMaterial);
    secondTier.position.y = baseHeight + secondTierHeight / 2;
    baseGroup.add(secondTier);

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
    
    // --- Stairs ---
    const stairsGroup = new THREE.Group();
    const stairWidth = 40;
    const numStairs = 10;
    const stairHeight = (baseHeight + secondTierHeight) / numStairs;
    const stairDepth = 30 / numStairs;

    for (let i = 0; i < numStairs; i++) {
        const step = new THREE.Mesh(
            new THREE.BoxGeometry(stairWidth, stairHeight, stairDepth),
            stoneBaseMaterial
        );
        step.position.set(0, (i + 0.5) * stairHeight, (i + 0.5) * stairDepth);
        stairsGroup.add(step);
    }
    stairsGroup.position.set(0, - (baseHeight + secondTierHeight) / 2 + 1, baseDepth / 2 + 30);
    stairsGroup.rotation.y = Math.PI;
    baseGroup.add(stairsGroup);


    // --- Main Structure ---
    const mainStructureGroup = new THREE.Group();
    mainStructureGroup.position.y = baseHeight + secondTierHeight;
    mainBuilding.add(mainStructureGroup);

    const structureWidth = 120;
    const firstFloorHeight = 25;
    const pillarDiameter = 4;
    const centerBayWidth = stairWidth + 10;
    const sideBayWidth = (structureWidth - centerBayWidth) / 2;


    // Main Pillars
    const pillarGeom = new THREE.CylinderGeometry(pillarDiameter, pillarDiameter, firstFloorHeight, 16);
    const pillarPositions = [
      // Center bay pillars
      { x: -centerBayWidth / 2, z: 15 }, { x: centerBayWidth / 2, z: 15 },
      { x: -centerBayWidth / 2, z: -15 }, { x: centerBayWidth / 2, z: -15 },

      // Side bay pillars
      { x: -structureWidth / 2, z: 15 }, { x: -structureWidth / 2, z: -15 },
      { x: structureWidth / 2, z: 15 }, { x: structureWidth / 2, z: -15 },
    ];
    pillarPositions.forEach(pos => {
        const pillar = new THREE.Mesh(pillarGeom, vermilionRed);
        pillar.position.set(pos.x, firstFloorHeight / 2, pos.z);
        mainStructureGroup.add(pillar);
    });

    // Add Noren curtains to the main entrance
    const norenPositions = [-16, 0, 16];
    norenPositions.forEach(xPos => {
        const noren = createNorenCurtain();
        noren.position.set(xPos, firstFloorHeight - 8, 16);
        noren.rotation.x = Math.random() * 0.1;
        mainStructureGroup.add(noren);
    });

    // Green Railing in side bays
    const greenRailingHeight = 12;
    const greenRailing = createGreenRailing(sideBayWidth, greenRailingHeight, greenLatticeMaterial);
    greenRailing.position.set(centerBayWidth/2 + sideBayWidth/2, greenRailingHeight/2, 15);
    mainStructureGroup.add(greenRailing);

    const greenRailing2 = createGreenRailing(sideBayWidth, greenRailingHeight, greenLatticeMaterial);
    greenRailing2.position.set(-(centerBayWidth/2 + sideBayWidth/2), greenRailingHeight/2, 15);
    mainStructureGroup.add(greenRailing2);

    // Function to create the brown panel with grey stripes
    function createStripedPanel(width: number) {
      const panelGroup = new THREE.Group();
      const panelHeight = 5;
      const panelGeom = new THREE.BoxGeometry(width, panelHeight, 1);
      const panel = new THREE.Mesh(panelGeom, woodMaterial);
      panel.position.y = panelHeight / 2;
      panelGroup.add(panel);

      const stripeHeight = panelHeight;
      const stripeGeom = new THREE.BoxGeometry(0.3, stripeHeight, 1.1);
      for (let i = 0; i < 3; i++) {
        const stripe = new THREE.Mesh(stripeGeom, greyStripeMaterial);
        stripe.position.x = (i - 1) * (width / 4);
        stripe.position.y = panelHeight / 2;
        panelGroup.add(stripe);
      }
      return panelGroup;
    }

    const stripedPanel1 = createStripedPanel(sideBayWidth);
    stripedPanel1.position.set(centerBayWidth / 2 + sideBayWidth / 2, greenRailingHeight + 2.5, 15);
    mainStructureGroup.add(stripedPanel1);

    const stripedPanel2 = createStripedPanel(sideBayWidth);
    stripedPanel2.position.set(-(centerBayWidth / 2 + sideBayWidth / 2), greenRailingHeight + 2.5, 15);
    mainStructureGroup.add(stripedPanel2);
    
    // First floor center latticework
    const centerLatticePanel = createLatticePanel(centerBayWidth, 15, vermilionRed, whitePlaster);
    centerLatticePanel.position.set(0, firstFloorHeight - 7.5, 15);
    mainStructureGroup.add(centerLatticePanel);

    // First Floor Plaster Walls (behind side bays)
    const sideWallGeom = new THREE.BoxGeometry(sideBayWidth, firstFloorHeight, 1);
    const leftSideWall = new THREE.Mesh(sideWallGeom, whitePlaster);
    leftSideWall.position.set(-(centerBayWidth / 2 + sideBayWidth / 2), firstFloorHeight/2, -14);
    mainStructureGroup.add(leftSideWall);
    
    const rightSideWall = new THREE.Mesh(sideWallGeom, whitePlaster);
    rightSideWall.position.set(centerBayWidth / 2 + sideBayWidth / 2, firstFloorHeight/2, -14);
    mainStructureGroup.add(rightSideWall);
    
    // First Floor Plaster Walls (center)
    const centerWallGeom = new THREE.BoxGeometry(centerBayWidth, firstFloorHeight, 1);
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
        bracket.position.set(-structureWidth/2 + 10 + i * 12.2, firstFloorHeight - 2, 20);
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
    
    // Side plaster walls
    const secondSideWallGeom = new THREE.BoxGeometry( (secondFloorWidth - centerBayWidth) / 2, secondFloorHeight, 30);
    const leftSecondWall = new THREE.Mesh(secondSideWallGeom, whitePlaster);
    leftSecondWall.position.set(-(centerBayWidth / 2 + (secondFloorWidth - centerBayWidth) / 4), secondFloorHeight / 2, 0);
    secondFloorGroup.add(leftSecondWall);
    
    const rightSecondWall = new THREE.Mesh(secondSideWallGeom, whitePlaster);
    rightSecondWall.position.set(centerBayWidth / 2 + (secondFloorWidth - centerBayWidth) / 4, secondFloorHeight / 2, 0);
    secondFloorGroup.add(rightSecondWall);

    // Second story railing
    const railing2 = createGoldRailing(centerBayWidth, 12, goldMaterial, vermilionRed);
    railing2.position.y = 6;
    railing2.position.z = 15;
    secondFloorGroup.add(railing2);

    // Back wall for second floor
    const secondBackWall = new THREE.Mesh(new THREE.BoxGeometry(secondFloorWidth, secondFloorHeight, 1), whitePlaster);
    secondBackWall.position.set(0, secondFloorHeight / 2, -15);
    secondFloorGroup.add(secondBackWall);


    // --- Plaque (Gaku) ---
    const plaqueGroup = new THREE.Group();
    plaqueGroup.position.set(0, secondFloorHeight / 2, 16);

    const ancientGoldMaterial = new THREE.MeshStandardMaterial({
        color: 0xB08D57, // A duller, more ancient gold
        metalness: 0.6,
        roughness: 0.5,
    });
    
    const plaqueFrameWidth = 10;
    const plaqueFrameHeight = 16;

    // Main frame
    const plaqueFrameGeom = new THREE.BoxGeometry(plaqueFrameWidth, plaqueFrameHeight, 1.5);
    const plaqueFrame = new THREE.Mesh(plaqueFrameGeom, ancientGoldMaterial);
    plaqueGroup.add(plaqueFrame);
    
    // Inner black background
    const plaqueBackGeom = new THREE.BoxGeometry(plaqueFrameWidth * 0.7, plaqueFrameHeight * 0.8, 0.5);
    const plaqueBack = new THREE.Mesh(plaqueBackGeom, blackAccent);
    plaqueBack.position.z = 1.0; // Bring it forward so it's inset
    plaqueGroup.add(plaqueBack);

    // Add decorative frame details to suggest ornateness
    const detailWidth = plaqueFrameWidth + 1;
    const detailHeight = plaqueFrameHeight + 1;

    // Top/Bottom details
    const topDetailGeom = new THREE.BoxGeometry(detailWidth, 1, 1);
    const topDetail = new THREE.Mesh(topDetailGeom, ancientGoldMaterial);
    topDetail.position.y = detailHeight / 2;
    topDetail.position.z = 0.5;
    plaqueGroup.add(topDetail);

    const bottomDetail = new THREE.Mesh(topDetailGeom, ancientGoldMaterial);
    bottomDetail.position.y = -detailHeight / 2;
    bottomDetail.position.z = 0.5;
    plaqueGroup.add(bottomDetail);

    // Side details
    const sideDetailGeom = new THREE.BoxGeometry(1, detailHeight, 1);
    const leftDetail = new THREE.Mesh(sideDetailGeom, ancientGoldMaterial);
    leftDetail.position.x = -detailWidth / 2;
    leftDetail.position.z = 0.5;
    plaqueGroup.add(leftDetail);

    const rightDetail = new THREE.Mesh(sideDetailGeom, ancientGoldMaterial);
    rightDetail.position.x = detailWidth / 2;
    rightDetail.position.z = 0.5;
    plaqueGroup.add(rightDetail);

    // Corner decorative elements
    const cornerGeom = new THREE.TorusGeometry(1, 0.4, 8, 4);
    const cornerPositions = [
        { x: -detailWidth / 2, y: detailHeight / 2 },
        { x: detailWidth / 2, y: detailHeight / 2 },
        { x: -detailWidth / 2, y: -detailHeight / 2 },
        { x: detailWidth / 2, y: -detailHeight / 2 },
    ];
    cornerPositions.forEach(pos => {
        const corner = new THREE.Mesh(cornerGeom, ancientGoldMaterial);
        corner.position.set(pos.x, pos.y, 0.5);
        corner.rotation.z = Math.PI / 4;
        plaqueGroup.add(corner);
    });
    plaqueGroup.scale.set(0.9, 0.9, 0.9);
    secondFloorGroup.add(plaqueGroup);


    // --- Main Top Roof ---
    const topRoof = createPyramidRoof(secondFloorWidth + 50, 85, 18, darkBrownRoof);
    topRoof.position.y = secondFloorHeight + 7.5; // Adjusted Y position
    secondFloorGroup.add(topRoof);


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
    rightLantern.position.set(baseWidth/2 + 15, 0, baseDepth / 2 + 25);
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
