
import * as THREE from 'three';
import { createKitsuneStatue } from './japanese-temple/kitsune-statue';
import { createNorenCurtain } from './japanese-temple/noren-curtain';
import { createPlaque } from './japanese-temple/plaque';
import { createGreenRailing, createOrangeRailing, createLatticePanel } from './japanese-temple/helpers';
import { createHippedRoof } from './japanese-temple/roof';

// Helper to create detailed Dougong (bracket sets) based on the image
function createDougong(size: number, redMaterial: THREE.Material, goldMaterial: THREE.Material) {
    const dougong = new THREE.Group();

    // Base block (dou)
    const baseBlock = new THREE.Mesh(new THREE.BoxGeometry(size * 0.8, size * 0.3, size * 0.8), redMaterial);
    dougong.add(baseBlock);

    // First level arms (gong)
    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(size * 1.5, size * 0.3, size * 0.5), redMaterial);
    arm1.position.y = size * 0.3;
    dougong.add(arm1);
    
    // Middle supporting block
    const midBlock = new THREE.Mesh(new THREE.BoxGeometry(size * 0.6, size * 0.4, size * 0.6), redMaterial);
    midBlock.position.y = size * 0.6;
    dougong.add(midBlock);
    
    // Second level arms (gong) - connecting to the middle
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(size * 2.0, size * 0.3, size * 0.4), redMaterial);
    arm2.position.y = size * 0.9;
    dougong.add(arm2);
    
    // Top block (dou)
    const topBlock = new THREE.Mesh(new THREE.BoxGeometry(size * 0.7, size * 0.5, size * 0.7), redMaterial);
    topBlock.position.y = size * 1.3;
    dougong.add(topBlock);
    
    // Vertical line passing through
    const verticalLine = new THREE.Mesh(new THREE.BoxGeometry(size * 0.2, size * 1.8, size * 0.2), redMaterial);
    verticalLine.position.y = size * 0.9;
    dougong.add(verticalLine);
    
    return dougong;
}


export function createJapaneseTemple() {
    const templeContainer = new THREE.Group();
    templeContainer.name = 'FushimiInariGatehouse_Container';

    const mainBuilding = new THREE.Group();
    mainBuilding.name = 'FushimiInariGatehouse_MainBuilding';
    
    const walkableGroup = new THREE.Group();
    walkableGroup.name = 'FushimiInariGatehouse_Walkable';

    const vermilionRed = new THREE.MeshStandardMaterial({ color: 0xdc4405, roughness: 0.6 });
    const bracketRedMaterial = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.6 });
    const blackAccent = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.1, roughness: 0.7 });
    const darkBrownRoof = new THREE.MeshStandardMaterial({ color: 0x3f2a1d, roughness: 0.9 });
    const whitePlaster = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const stoneBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x9fa8a3, roughness: 0.9 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.4 });
    const greenLatticeMaterial = new THREE.MeshStandardMaterial({color: 0x2E8B57});
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x966F33 });
    const yellowPanelMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFDD0 });
    const orangeCircleMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });

    // Helper function for the side panels
    function createSidePanel(width: number) {
        const panelHeight = 12.25 * 0.7;
        const panelWidth = width * 0.7;
        const panelGroup = new THREE.Group();

        // Green Fill
        const fillGeom = new THREE.BoxGeometry(panelWidth, panelHeight, 1);
        const fill = new THREE.Mesh(fillGeom, greenLatticeMaterial);
        panelGroup.add(fill);
        
        return panelGroup;
    }


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
    leftStatueBase.position.set(-baseWidth/2 + statueBaseWidth/2, statueBaseHeight/2, baseDepth/2 - 0);
    baseGroup.add(leftStatueBase);
    
    const rightStatueBase = new THREE.Mesh(new THREE.BoxGeometry(statueBaseWidth, statueBaseHeight, statueBaseDepth), stoneBaseMaterial);
    rightStatueBase.position.set(baseWidth/2 - statueBaseWidth/2, statueBaseHeight/2, baseDepth/2 - 0);
    baseGroup.add(rightStatueBase);

    
    // --- Stairs ---
    const stairsGroup = new THREE.Group();
    const stairWidth = 80; // Widened
    const totalStairHeight = baseHeight + secondTierHeight;
    const numStairs = 10;
    const stairHeight = totalStairHeight / numStairs;
    const stairDepth = 3.5;
    const lightGrayMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const darkGrayMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

    for (let i = 0; i < numStairs; i++) {
        const stepGroup = new THREE.Group();
        const bottomPartHeight = stairHeight * 0.6;
        const topPartHeight = stairHeight * 0.4;

        // Bottom light gray part
        const bottomGeom = new THREE.BoxGeometry(stairWidth, bottomPartHeight, stairDepth * (numStairs - i));
        const bottomStep = new THREE.Mesh(bottomGeom, lightGrayMaterial);
        bottomStep.position.y = bottomPartHeight / 2;
        stepGroup.add(bottomStep);

        // Top dark gray part
        const topGeom = new THREE.BoxGeometry(stairWidth * 0.98, topPartHeight, stairDepth * (numStairs - i) * 0.98);
        const topStep = new THREE.Mesh(topGeom, darkGrayMaterial);
        topStep.position.y = bottomPartHeight + topPartHeight / 2;
        stepGroup.add(topStep);
        
        stepGroup.position.y = i * stairHeight;
        stepGroup.position.z = -stairDepth * i / 2;
        stairsGroup.add(stepGroup);
    }
    stairsGroup.position.set(0, 0, (baseDepth + 5) / 2 + stairDepth * numStairs / 2);
    walkableGroup.add(baseGroup, stairsGroup);


    // --- Main Structure ---
    const mainStructureGroup = new THREE.Group();
    mainStructureGroup.position.y = baseHeight + secondTierHeight;
    mainBuilding.add(mainStructureGroup);

    const structureWidth = 120;
    const firstFloorHeight = 35; // Set pillar height to 35
    const outerPillarHeight = 35; // Set pillar height to 35
    const pillarDiameter = 3.5;
    const centerBayWidth = 60;
    const sideBayWidth = (structureWidth - centerBayWidth) / 2;


    // Main Pillars
    const innerPillarGeom = new THREE.CylinderGeometry(pillarDiameter, pillarDiameter, 35, 16);
    const outerPillarGeom = new THREE.CylinderGeometry(pillarDiameter, pillarDiameter, 35, 16);

    const pillarPositions = [
      // Center bay pillars (front are outer)
      { x: -centerBayWidth / 2, z: 15, outer: true, rotation: 0 }, { x: centerBayWidth / 2, z: 15, outer: true, rotation: 0 },
      // Inner pillars are behind the front ones
      { x: -centerBayWidth / 2, z: -15, outer: false, rotation: 0 }, { x: centerBayWidth / 2, z: -15, outer: false, rotation: 0 },

      // Side bay pillars (outer)
      { x: -structureWidth / 2, z: 15, outer: true, rotation: Math.PI / 2 }, { x: -structureWidth / 2, z: -15, outer: true, rotation: Math.PI / 2 },
      { x: structureWidth / 2, z: 15, outer: true, rotation: -Math.PI / 2 }, { x: structureWidth / 2, z: -15, outer: true, rotation: -Math.PI / 2 },
    ];

    pillarPositions.forEach(pos => {
        const isOuter = pos.outer;
        const pillar = new THREE.Mesh(isOuter ? outerPillarGeom : innerPillarGeom, vermilionRed);
        const pillarYPosition = 35 / 2; // isOuter ? outerPillarHeight / 2 : firstFloorHeight / 2;
        pillar.position.set(pos.x, pillarYPosition, pos.z);
        mainStructureGroup.add(pillar);

        const dougong = createDougong(3, bracketRedMaterial, goldMaterial);
        const dougongY = 35;
        dougong.position.set(pos.x, dougongY, pos.z + 5);
        dougong.rotation.y = pos.rotation;
        mainStructureGroup.add(dougong);
    });

    // Green Railing in side bays
    const greenRailingHeight = 12;
    const greenRailing = createGreenRailing(sideBayWidth, greenRailingHeight, greenLatticeMaterial);
    greenRailing.position.set(centerBayWidth/2 + sideBayWidth/2, greenRailingHeight/2, 15);
    mainStructureGroup.add(greenRailing);

    const greenRailing2 = createGreenRailing(sideBayWidth, greenRailingHeight, greenLatticeMaterial);
    greenRailing2.position.set(-(centerBayWidth/2 + sideBayWidth/2), greenRailingHeight/2, 15);
    mainStructureGroup.add(greenRailing2);

    // Thick orange strip over green railing
    const orangeStripGeom = new THREE.BoxGeometry(sideBayWidth, 3, 2);
    const orangeStrip1 = new THREE.Mesh(orangeStripGeom, vermilionRed);
    orangeStrip1.position.set(centerBayWidth / 2 + sideBayWidth / 2, greenRailingHeight - 4.5, 15);
    mainStructureGroup.add(orangeStrip1);

    const orangeStrip2 = new THREE.Mesh(orangeStripGeom, vermilionRed);
    orangeStrip2.position.set(-(centerBayWidth / 2 + sideBayWidth / 2), greenRailingHeight - 4.5, 15);
    mainStructureGroup.add(orangeStrip2);
    
    // Thick orange strip under green railing
    const bottomOrangeStrip1 = new THREE.Mesh(orangeStripGeom, vermilionRed);
    bottomOrangeStrip1.position.set(centerBayWidth / 2 + sideBayWidth / 2, 0, 15);
    mainStructureGroup.add(bottomOrangeStrip1);

    const bottomOrangeStrip2 = new THREE.Mesh(orangeStripGeom, vermilionRed);
    bottomOrangeStrip2.position.set(-(centerBayWidth / 2 + sideBayWidth / 2), 0, 15);
    mainStructureGroup.add(bottomOrangeStrip2);


    // Function to create the brown panel with gray lines
    function createStripedPanel(width: number) {
      const panelGroup = new THREE.Group();
      const panelHeight = 5;
      const panelGeom = new THREE.BoxGeometry(width, panelHeight, 1);
      const panel = new THREE.Mesh(panelGeom, woodMaterial); // Light brown
      panel.position.y = panelHeight / 2;
      panelGroup.add(panel);

      const grayStripeMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
      const stripeHeight = panelHeight;
      const stripeGeom = new THREE.BoxGeometry(0.3, stripeHeight, 1.1);
      for (let i = 0; i < 2; i++) {
        const stripe = new THREE.Mesh(stripeGeom, grayStripeMaterial);
        stripe.position.x = (i - 0.5) * (width / 2); // Positioned at -width/4 and width/4
        stripe.position.y = panelHeight / 2;
        panelGroup.add(stripe);
      }
      return panelGroup;
    }

    const stripedPanelY = greenRailingHeight + 5;
    const stripedPanel1 = createStripedPanel(sideBayWidth);
    stripedPanel1.position.set(centerBayWidth / 2 + sideBayWidth / 2, stripedPanelY, 15);
    mainStructureGroup.add(stripedPanel1);

    const stripedPanel2 = createStripedPanel(sideBayWidth);
    stripedPanel2.position.set(-(centerBayWidth / 2 + sideBayWidth / 2), stripedPanelY, 15);
    mainStructureGroup.add(stripedPanel2);
    
    // Thick orange strip above brown panels
    const orangeStripAboveWoodGeom = new THREE.BoxGeometry(sideBayWidth, 3, 2);
    const orangeStripAbove1 = new THREE.Mesh(orangeStripAboveWoodGeom, vermilionRed);
    orangeStripAbove1.position.set(centerBayWidth / 2 + sideBayWidth / 2, stripedPanelY + 8, 15);
    mainStructureGroup.add(orangeStripAbove1);

    const orangeStripAbove2 = new THREE.Mesh(orangeStripAboveWoodGeom, vermilionRed);
    orangeStripAbove2.position.set(-(centerBayWidth / 2 + sideBayWidth / 2), stripedPanelY + 8, 15);
    mainStructureGroup.add(orangeStripAbove2);

    // --- Noren Curtain ---
    const noren = createNorenCurtain();
    noren.scale.set(0.7, 0.7, 0.7);
    noren.position.set(0, firstFloorHeight - 10, 14);
    mainStructureGroup.add(noren);

    // --- Inner Entrance ---
    const innerEntranceGroup = new THREE.Group();
    const innerPillarHeight = firstFloorHeight * 0.8;
    const innerEntranceWidth = centerBayWidth * 0.5;
    const innerPillarDiameter = 2.5;

    const entrancePillarGeom = new THREE.CylinderGeometry(innerPillarDiameter, innerPillarDiameter, innerPillarHeight, 12);
    const darkOrange = new THREE.MeshStandardMaterial({ color: 0xcc3300 });
    
    const leftInnerPillar = new THREE.Mesh(entrancePillarGeom, darkOrange);
    leftInnerPillar.position.set(-innerEntranceWidth / 2, innerPillarHeight / 2, 0);
    innerEntranceGroup.add(leftInnerPillar);

    const rightInnerPillar = new THREE.Mesh(entrancePillarGeom, darkOrange);
    rightInnerPillar.position.set(innerEntranceWidth / 2, innerPillarHeight / 2, 0);
    innerEntranceGroup.add(rightInnerPillar);

    const innerLintelGeom = new THREE.BoxGeometry(innerEntranceWidth, 3, 3);
    const innerLintel = new THREE.Mesh(innerLintelGeom, darkOrange);
    innerLintel.position.set(0, innerPillarHeight, 0);
    innerEntranceGroup.add(innerLintel);

    innerEntranceGroup.position.z = -2; // Position it inside the main structure
    mainStructureGroup.add(innerEntranceGroup);

    // --- Inner Chamber ---
    const chamberWidth = innerEntranceWidth * 1.2;
    const chamberHeight = innerPillarHeight;
    const chamberDepth = 20;
    const chamberMaterial = new THREE.MeshStandardMaterial({ color: 0x101010, side: THREE.BackSide });
    const chamberGeom = new THREE.BoxGeometry(chamberWidth, chamberHeight, chamberDepth);
    const innerChamber = new THREE.Mesh(chamberGeom, chamberMaterial);
    // Position it behind the entrance opening
    innerChamber.position.set(0, chamberHeight/2, -15 - chamberDepth / 2);
    mainStructureGroup.add(innerChamber);
    
    

    // First Floor Plaster Walls (behind side bays)
    const sideWallGeom = new THREE.BoxGeometry(sideBayWidth, 37, 1);
    const leftSideWall = new THREE.Mesh(sideWallGeom, whitePlaster);
    leftSideWall.position.set(-(centerBayWidth / 2 + sideBayWidth / 2), 37/2, -15);
    mainStructureGroup.add(leftSideWall);
    
    const rightSideWall = new THREE.Mesh(sideWallGeom, whitePlaster);
    rightSideWall.position.set(centerBayWidth / 2 + sideBayWidth / 2, 37/2, -15);
    mainStructureGroup.add(rightSideWall);
    
    // First Floor Plaster Walls (center) - with opening
    const centerWallSideWidth = (centerBayWidth - innerEntranceWidth) / 2;
    const centerWallSideGeom = new THREE.BoxGeometry(centerWallSideWidth, 37, 1);

    const leftCenterWall = new THREE.Mesh(centerWallSideGeom, vermilionRed);
    leftCenterWall.position.set(-(innerEntranceWidth / 2 + centerWallSideWidth / 2), 37/2, -15);
    mainStructureGroup.add(leftCenterWall);

    const rightCenterWall = new THREE.Mesh(centerWallSideGeom, vermilionRed);
    rightCenterWall.position.set(innerEntranceWidth / 2 + centerWallSideWidth / 2, 37/2, -15);
    mainStructureGroup.add(rightCenterWall);
    
    const centerLintelHeight = 37 - innerPillarHeight;
    const centerLintelGeom = new THREE.BoxGeometry(innerEntranceWidth, centerLintelHeight, 1);
    const centerLintel = new THREE.Mesh(centerLintelGeom, vermilionRed);
    centerLintel.position.set(0, innerPillarHeight + centerLintelHeight / 2, -15);
    mainStructureGroup.add(centerLintel);

    // --- Side Walls ---
    const sideWallFullGeom = new THREE.BoxGeometry(1, firstFloorHeight, 30); // Depth is 15 - (-15) = 30
    const leftFullWall = new THREE.Mesh(sideWallFullGeom, whitePlaster);
    leftFullWall.position.set(-structureWidth / 2, firstFloorHeight / 2, 0);
    mainStructureGroup.add(leftFullWall);

    const rightFullWall = new THREE.Mesh(sideWallFullGeom, whitePlaster);
    rightFullWall.position.set(structureWidth / 2, firstFloorHeight / 2, 0);
    mainStructureGroup.add(rightFullWall);


    // First Floor Roof Support
    const simpleRoofSupportGeom = new THREE.BoxGeometry(structureWidth, 1.5, 30);
    const simpleRoofSupport = new THREE.Mesh(simpleRoofSupportGeom, vermilionRed);
    simpleRoofSupport.position.y = firstFloorHeight;
    mainStructureGroup.add(simpleRoofSupport);
    
    // White Box with Red lines
    const stripedBoxHeight = 5;
    const stripedBoxY = simpleRoofSupport.position.y + (1.5 / 2) + (stripedBoxHeight / 2);
    const stripedBox = new THREE.Group();
    stripedBox.position.y = stripedBoxY;
    mainStructureGroup.add(stripedBox);

    const boxGeom = new THREE.BoxGeometry(structureWidth, stripedBoxHeight, 35);
    const boxMesh = new THREE.Mesh(boxGeom, whitePlaster);
    stripedBox.add(boxMesh);

    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 }); // Dark Red
    const hLineGeom = new THREE.BoxGeometry(structureWidth, 0.4, 35.2);
    
    const topHLine3 = new THREE.Mesh(hLineGeom, lineMaterial);
    topHLine3.position.y = 0; // In the middle
    topHLine3.position.z = 0.1;
    stripedBox.add(topHLine3);
    
    for (let i = 0; i < 6; i++) {
        const vLine = new THREE.Mesh(new THREE.BoxGeometry(0.4, stripedBoxHeight, 35.2), lineMaterial);
        vLine.position.x = (i - 2.5) * (structureWidth / 6);
        vLine.position.z = 0.1;
        stripedBox.add(vLine);
    }


    // --- Railing on Golden Roof ---
    const orangeRoofHeight = 1.5;
    const orangeRoofY = stripedBoxY + stripedBoxHeight / 2 + orangeRoofHeight / 2;
    const orangeRoofGeom = new THREE.BoxGeometry(structureWidth + 12, orangeRoofHeight, 55);
    const orangeRoof = new THREE.Mesh(orangeRoofGeom, vermilionRed);
    orangeRoof.position.y = orangeRoofY;
    mainStructureGroup.add(orangeRoof);
    
    // New golden roof layer
    const goldRoofHeight = 1.5;
    const goldRoofY = orangeRoofY + orangeRoofHeight / 2 + goldRoofHeight / 2;
    const goldRoofGeom = new THREE.BoxGeometry(structureWidth + 12.5, goldRoofHeight, 55.5);
    const goldRoof = new THREE.Mesh(goldRoofGeom, goldMaterial);
    goldRoof.position.y = goldRoofY;
    mainStructureGroup.add(goldRoof);

    // --- Railing on Golden Roof ---
    const railingHeight = 4;
    const railingY = goldRoofY + goldRoofHeight / 2;
    
    const frontRailingWidth = structureWidth + 10;
    const sideRailingWidth = 55.5;

    const frontRailing = createOrangeRailing(frontRailingWidth, railingHeight, vermilionRed);
    frontRailing.position.set(0, railingY, sideRailingWidth / 2);
    mainStructureGroup.add(frontRailing);
    
    const backRailing = createOrangeRailing(frontRailingWidth, railingHeight, vermilionRed);
    backRailing.position.set(0, railingY, -sideRailingWidth / 2);
    mainStructureGroup.add(backRailing);
    
    const leftRailing = createOrangeRailing(sideRailingWidth, railingHeight, vermilionRed);
    leftRailing.rotation.y = Math.PI / 2;
    leftRailing.position.set(-frontRailingWidth / 2, railingY, 0);
    mainStructureGroup.add(leftRailing);
    
    const rightRailing = createOrangeRailing(sideRailingWidth, railingHeight, vermilionRed);
    rightRailing.rotation.y = Math.PI / 2;
    rightRailing.position.set(frontRailingWidth / 2, railingY, 0);
    mainStructureGroup.add(rightRailing);
    

    // --- Second Floor ---
    const secondFloorY = orangeRoofY + orangeRoofHeight / 2 + 1.5 / 2;
    const secondFloorGroup = new THREE.Group();
    secondFloorGroup.position.y = secondFloorY;
    mainStructureGroup.add(secondFloorGroup);

    const secondFloorWidth = structureWidth;
    const secondFloorHeight = 30;
    const secondFloorDepth = 20;
    const whiteBlockHeight = 12.25;
    const stripeHeight = 2.5;

    const topWhiteBlockGeom = new THREE.BoxGeometry(secondFloorWidth, whiteBlockHeight, secondFloorDepth);
    const topWhiteBlock = new THREE.Mesh(topWhiteBlockGeom, whitePlaster);
    topWhiteBlock.position.y = whiteBlockHeight / 2 + stripeHeight / 2 + secondFloorHeight / 2;
    secondFloorGroup.add(topWhiteBlock);

    // Add lines to the top white block
    const topHLineGeom = new THREE.BoxGeometry(secondFloorWidth, 0.4, secondFloorDepth + 0.2);
    
    const topHLine1_2 = new THREE.Mesh(topHLineGeom, lineMaterial);
    topHLine1_2.position.y = whiteBlockHeight / 3;
    topHLine1_2.position.z = 0.1;
    topWhiteBlock.add(topHLine1_2);

    const topHLine2_2 = new THREE.Mesh(topHLineGeom, lineMaterial);
    topHLine2_2.position.y = whiteBlockHeight / 6;
    topHLine2_2.position.z = 0.1;
    topWhiteBlock.add(topHLine2_2);

    const topHLine3_2 = new THREE.Mesh(topHLineGeom, lineMaterial);
    topHLine3_2.position.y = 0; // In the middle
    topHLine3_2.position.z = 0.1;
    topWhiteBlock.add(topHLine3_2);


    for (let i = 0; i < 6; i++) {
        const vLine = new THREE.Mesh(new THREE.BoxGeometry(0.4, whiteBlockHeight, secondFloorDepth + 0.2), lineMaterial);
        vLine.position.x = (i - 2.5) * (secondFloorWidth / 6);
        vLine.position.z = 0.1;
        topWhiteBlock.add(vLine);
    }

    const orangeStripe = new THREE.Mesh(new THREE.BoxGeometry(secondFloorWidth, stripeHeight, secondFloorDepth), vermilionRed);
    orangeStripe.position.y = secondFloorHeight / 2;
    secondFloorGroup.add(orangeStripe);

    const bottomWhiteBlock = new THREE.Mesh(new THREE.BoxGeometry(secondFloorWidth, whiteBlockHeight, secondFloorDepth), whitePlaster);
    bottomWhiteBlock.position.y = -whiteBlockHeight / 2 - stripeHeight / 2 + secondFloorHeight / 2;
    secondFloorGroup.add(bottomWhiteBlock);

    // --- Add pillars to the bottom block of the second floor ---
    const secondFloorPillarHeight = whiteBlockHeight;
    const secondFloorPillarDiameter = 2.5;
    const secondFloorPillarGeom = new THREE.CylinderGeometry(secondFloorPillarDiameter, secondFloorPillarDiameter, secondFloorPillarHeight, 12);
    
    const secondFloorPillarPositions = [
        // Center bay (front)
        { x: -centerBayWidth / 2, z: secondFloorDepth / 2 },
        { x: centerBayWidth / 2, z: secondFloorDepth / 2 },
        // Center bay (back)
        { x: -centerBayWidth / 2, z: -secondFloorDepth / 2 },
        { x: centerBayWidth / 2, z: -secondFloorDepth / 2 },
        // Edge pillars
        { x: -secondFloorWidth / 2, z: secondFloorDepth / 2 },
        { x: secondFloorWidth / 2, z: secondFloorDepth / 2 },
    ];

    secondFloorPillarPositions.forEach(pos => {
        const pillar = new THREE.Mesh(secondFloorPillarGeom, vermilionRed);
        pillar.position.set(pos.x, 0, pos.z);
        bottomWhiteBlock.add(pillar);

        const totalBracketHeight = 12;
        const verticalBracketGroup = new THREE.Group();
        verticalBracketGroup.position.set(pos.x, totalBracketHeight / 2, pos.z + 3);

        const bracketSpacing = totalBracketHeight / 2; // Brackets at top, middle, bottom of the line
        
        const verticalLineGeom = new THREE.BoxGeometry(1, totalBracketHeight, 1);
        const verticalLine = new THREE.Mesh(verticalLineGeom, goldMaterial);
        verticalLine.position.y = totalBracketHeight / 2;
        verticalBracketGroup.add(verticalLine);

        for (let i = 0; i < 3; i++) {
            const bracket = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 3), bracketRedMaterial);
            let zPos = 0;
            if (i === 1) { // Middle bracket
                zPos += 2;
            }
            bracket.position.y = i * bracketSpacing;
            bracket.position.z = zPos;
            verticalBracketGroup.add(bracket);
        }
        
        bottomWhiteBlock.add(verticalBracketGroup);
    });

    
    // --- Place new panels on the front sides ---
    const sideBayPillarDistance = (secondFloorWidth / 2) - (centerBayWidth / 2);
    const frontPanelWidth = sideBayPillarDistance - secondFloorPillarDiameter;

    const leftFrontPanel = createSidePanel(frontPanelWidth);
    leftFrontPanel.position.set(-(centerBayWidth / 2 + (sideBayPillarDistance / 2)), 0, secondFloorDepth / 2 + 1);
    leftFrontPanel.rotation.y = Math.PI;
    bottomWhiteBlock.add(leftFrontPanel);
    
    const rightFrontPanel = createSidePanel(frontPanelWidth);
    rightFrontPanel.position.set((centerBayWidth / 2 + (sideBayPillarDistance / 2)), 0, secondFloorDepth / 2 + 1);
    rightFrontPanel.rotation.y = Math.PI;
    bottomWhiteBlock.add(rightFrontPanel);
    

    // Second Floor Entrance
    const secondFloorEntranceGroup = new THREE.Group();
    const secondFloorInnerPillarHeight = whiteBlockHeight * 0.8;
    const secondFloorInnerEntranceWidth = centerBayWidth * 0.5;
    const secondFloorInnerPillarDiameter = 2.0;

    const secondFloorEntrancePillarGeom = new THREE.CylinderGeometry(secondFloorInnerPillarDiameter, secondFloorInnerPillarDiameter, secondFloorInnerPillarHeight, 12);
    
    const secondFloorLeftInnerPillar = new THREE.Mesh(secondFloorEntrancePillarGeom, darkOrange);
    secondFloorLeftInnerPillar.position.set(-secondFloorInnerEntranceWidth / 2, 0, 0);
    secondFloorEntranceGroup.add(secondFloorLeftInnerPillar);

    const secondFloorRightInnerPillar = new THREE.Mesh(secondFloorEntrancePillarGeom, darkOrange);
    secondFloorRightInnerPillar.position.set(secondFloorInnerEntranceWidth / 2, 0, 0);
    secondFloorEntranceGroup.add(secondFloorRightInnerPillar);

    const secondFloorInnerLintelGeom = new THREE.BoxGeometry(secondFloorInnerEntranceWidth, 2, 2);
    const secondFloorInnerLintel = new THREE.Mesh(secondFloorInnerLintelGeom, darkOrange);
    secondFloorInnerLintel.position.set(0, secondFloorInnerPillarHeight / 2, 0);
    secondFloorEntranceGroup.add(secondFloorInnerLintel);
    
    // Decorative Panel with Ovals
    const panelWidth = secondFloorInnerEntranceWidth * 0.8;
    const panelHeight = secondFloorInnerPillarHeight * 0.9;
    const panelGroup = new THREE.Group();
    panelGroup.position.y = - (whiteBlockHeight - panelHeight) / 2;

    const goldenBorderGeom = new THREE.BoxGeometry(panelWidth, panelHeight, 0.5);
    const goldenBorder = new THREE.Mesh(goldenBorderGeom, goldMaterial);
    panelGroup.add(goldenBorder);

    const yellowBackgroundGeom = new THREE.BoxGeometry(panelWidth - 0.5, panelHeight - 0.5, 0.5);
    const yellowBackground = new THREE.Mesh(yellowBackgroundGeom, yellowPanelMaterial);
    yellowBackground.position.z = 0.1;
    panelGroup.add(yellowBackground);

    const ovalRadiusX = panelWidth * 0.15;
    const ovalRadiusY = panelHeight * 0.3;
    const ovalShape = new THREE.Shape();
    ovalShape.absellipse(0, 0, ovalRadiusX, ovalRadiusY, 0, Math.PI * 2, false, 0);
    const ovalGeom = new THREE.ShapeGeometry(ovalShape);
    
    const leftOval = new THREE.Mesh(ovalGeom, vermilionRed);
    leftOval.position.set(-panelWidth * 0.25, 0, 0.7);
    panelGroup.add(leftOval);

    const rightOval = new THREE.Mesh(ovalGeom, vermilionRed);
    rightOval.position.set(panelWidth * 0.25, 0, 0.7);
    panelGroup.add(rightOval);
    
    secondFloorEntranceGroup.add(panelGroup);
    secondFloorEntranceGroup.position.z = secondFloorDepth / 2;
    bottomWhiteBlock.add(secondFloorEntranceGroup);


    // --- Plaque (Gaku) ---
    const plaqueGroup = createPlaque(blackAccent);
    plaqueGroup.position.y = 22;
    plaqueGroup.position.z = secondFloorDepth / 2 + 1; // Place it on the front of the block
    secondFloorGroup.add(plaqueGroup);


    // --- Third Floor ---
    const thirdFloorGroup = new THREE.Group();
    const thirdFloorY = secondFloorY + secondFloorHeight;
    thirdFloorGroup.position.y = thirdFloorY;
    mainStructureGroup.add(thirdFloorGroup);

    const thirdFloorOrangeRoofHeight = 1.5;
    const thirdFloorOrangeRoofGeom = new THREE.BoxGeometry(secondFloorWidth + 2, thirdFloorOrangeRoofHeight, secondFloorDepth + 2);
    const thirdFloorOrangeRoof = new THREE.Mesh(thirdFloorOrangeRoofGeom, vermilionRed);
    thirdFloorOrangeRoof.position.y = thirdFloorOrangeRoofHeight / 2;
    thirdFloorGroup.add(thirdFloorOrangeRoof);

    const thirdFloorWhiteBoxHeight = 10;
    const thirdFloorWhiteBoxY = thirdFloorOrangeRoofHeight + thirdFloorWhiteBoxHeight / 2;
    const thirdFloorWhiteBox = new THREE.Group();
    thirdFloorWhiteBox.position.y = thirdFloorWhiteBoxY;
    thirdFloorGroup.add(thirdFloorWhiteBox);

    const thirdFloorWhiteBoxGeom = new THREE.BoxGeometry(secondFloorWidth, thirdFloorWhiteBoxHeight, secondFloorDepth);
    const thirdFloorWhiteBoxMesh = new THREE.Mesh(thirdFloorWhiteBoxGeom, whitePlaster);
    thirdFloorWhiteBox.add(thirdFloorWhiteBoxMesh);

    const numRedLines = 20;
    const redLineMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
    const redLineGeom = new THREE.BoxGeometry(0.4, thirdFloorWhiteBoxHeight, 0.2);
    for (let i = 0; i < numRedLines; i++) {
        const vLine = new THREE.Mesh(redLineGeom, redLineMaterial);
        vLine.position.x = (i - (numRedLines - 1) / 2) * (secondFloorWidth / numRedLines);
        vLine.position.z = secondFloorDepth / 2 + 0.1;
        thirdFloorWhiteBox.add(vLine);
    }
    const thirdFloorHeight = thirdFloorOrangeRoofHeight + thirdFloorWhiteBoxHeight;

    // --- Main Top Roof ---
    const roofWidth = structureWidth + 40;
    const roofDepth = 80;
    const roofHeight = 20;
    const gabledRoofHeight = 10;
    const gabledRoofDepth = roofWidth - 0.1;

    const topRoof = createHippedRoof({
        width: roofWidth,
        depth: roofDepth,
        height: roofHeight,
        gableHeight: gabledRoofHeight,
        gableDepth: gabledRoofDepth,
        eaveCurve: -4,
        cornerFlick: 8,
        material: darkBrownRoof
    });
    topRoof.rotation.y = Math.PI;
    const topRoofY = thirdFloorY + thirdFloorHeight - 5;
    topRoof.position.y = topRoofY;
    mainStructureGroup.add(topRoof);


    // --- Kitsune Statues ---
    const leftStatue = createKitsuneStatue();
    leftStatue.position.set(-baseWidth/2 + statueBaseWidth/2, statueBaseHeight, baseDepth/2 + 10);
    leftStatue.rotation.y = Math.PI / 6;
    mainBuilding.add(leftStatue);
    
    const rightStatue = createKitsuneStatue();
    rightStatue.position.set(baseWidth/2 - statueBaseWidth/2, statueBaseHeight, baseDepth/2 + 10);
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
    

    

    

    
