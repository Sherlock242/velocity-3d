
import * as THREE from 'three';
import { createKitsuneStatue } from './japanese-temple/kitsune-statue';
import { createNorenCurtain } from './japanese-temple/noren-curtain';
import { createPlaque } from './japanese-temple/plaque';
import { createDougong, createGreenRailing, createOrangeRailing, createLatticePanel, createHippedRoof } from './japanese-temple/helpers';

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
    const whitePlaster = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const stoneBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x9fa8a3, roughness: 0.9 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.4 });
    const greenLatticeMaterial = new THREE.MeshStandardMaterial({color: 0x2E8B57});
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x3f2a1d });
    const darkOrange = new THREE.MeshStandardMaterial({ color: 0xcc3300 });


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
    const stairWidth = 40;
    const totalStairHeight = baseHeight + secondTierHeight;
    const numStairs = 10;
    const stairHeight = totalStairHeight / numStairs;
    const stairDepth = 4.5;
    const stairMaterial = new THREE.MeshStandardMaterial({ color: 0xfffdd0 });

    for (let i = 0; i < numStairs; i++) {
        const step = new THREE.Mesh(
            new THREE.BoxGeometry(stairWidth, stairHeight, stairDepth * (numStairs - i)),
            stairMaterial
        );
        step.position.y = stairHeight / 2 + i * stairHeight;
        step.position.z = -stairDepth * i / 2;
        stairsGroup.add(step);
    }
    stairsGroup.position.set(0, 0, (baseDepth + 5) / 2 + stairDepth * numStairs / 2);
    walkableGroup.add(baseGroup, stairsGroup);


    // --- Main Structure ---
    const mainStructureGroup = new THREE.Group();
    mainStructureGroup.position.y = baseHeight + secondTierHeight;
    mainBuilding.add(mainStructureGroup);

    const structureWidth = 120;
    const firstFloorHeight = 32;
    const outerPillarHeight = 35;
    const pillarDiameter = 3.5;
    const centerBayWidth = stairWidth + 10;
    const sideBayWidth = (structureWidth - centerBayWidth) / 2;


    // Main Pillars
    const innerPillarGeom = new THREE.CylinderGeometry(pillarDiameter, pillarDiameter, firstFloorHeight, 16);
    const outerPillarGeom = new THREE.CylinderGeometry(pillarDiameter, pillarDiameter, outerPillarHeight, 16);

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
        const pillarYPosition = isOuter ? outerPillarHeight / 2 : firstFloorHeight / 2;
        pillar.position.set(pos.x, pillarYPosition, pos.z);
        mainStructureGroup.add(pillar);

        const dougong = createDougong(5, vermilionRed, goldMaterial);
        dougong.position.set(pos.x, (isOuter ? outerPillarHeight : firstFloorHeight) + 1.5, pos.z + (isOuter ? 2 : 0));
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


    // Function to create the brown panel with red stripes
    function createStripedPanel(width: number) {
      const panelGroup = new THREE.Group();
      const panelHeight = 5;
      const panelGeom = new THREE.BoxGeometry(width, panelHeight, 1);
      const panel = new THREE.Mesh(panelGeom, woodMaterial);
      panel.position.y = panelHeight / 2;
      panelGroup.add(panel);

      const redStripeMaterial = vermilionRed;
      const stripeHeight = panelHeight;
      const stripeGeom = new THREE.BoxGeometry(0.3, stripeHeight, 1.1);
      for (let i = 0; i < 3; i++) {
        const stripe = new THREE.Mesh(stripeGeom, redStripeMaterial);
        stripe.position.x = (i - 1) * (width / 4);
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

    innerEntranceGroup.position.z = -5; // Position it inside the main structure
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
    const sideWallGeom = new THREE.BoxGeometry(sideBayWidth, firstFloorHeight, 1);
    const leftSideWall = new THREE.Mesh(sideWallGeom, whitePlaster);
    leftSideWall.position.set(-(centerBayWidth / 2 + sideBayWidth / 2), firstFloorHeight/2, -15);
    mainStructureGroup.add(leftSideWall);
    
    const rightSideWall = new THREE.Mesh(sideWallGeom, whitePlaster);
    rightSideWall.position.set(centerBayWidth / 2 + sideBayWidth / 2, firstFloorHeight/2, -15);
    mainStructureGroup.add(rightSideWall);
    
    // First Floor Plaster Walls (center) - with opening
    const centerWallSideWidth = (centerBayWidth - innerEntranceWidth) / 2;
    const centerWallSideGeom = new THREE.BoxGeometry(centerWallSideWidth, firstFloorHeight, 1);

    const leftCenterWall = new THREE.Mesh(centerWallSideGeom, vermilionRed);
    leftCenterWall.position.set(-(innerEntranceWidth / 2 + centerWallSideWidth / 2), firstFloorHeight/2, -15);
    mainStructureGroup.add(leftCenterWall);

    const rightCenterWall = new THREE.Mesh(centerWallSideGeom, vermilionRed);
    rightCenterWall.position.set(innerEntranceWidth / 2 + centerWallSideWidth / 2, firstFloorHeight/2, -15);
    mainStructureGroup.add(rightCenterWall);
    
    const centerLintelHeight = firstFloorHeight - innerPillarHeight;
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
    simpleRoofSupport.position.y = firstFloorHeight + 2.25;
    mainStructureGroup.add(simpleRoofSupport);
    
    // White Box with Red lines
    const stripedBoxHeight = 5;
    const stripedBoxY = firstFloorHeight + 3 + stripedBoxHeight / 2; // 32 + 3 + 2.5 = 37.5
    const stripedBox = new THREE.Group();
    stripedBox.position.y = stripedBoxY;
    mainStructureGroup.add(stripedBox);

    const boxGeom = new THREE.BoxGeometry(structureWidth, stripedBoxHeight, 35);
    const boxMesh = new THREE.Mesh(boxGeom, whitePlaster);
    stripedBox.add(boxMesh);

    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 }); // Dark Red
    const hLineGeom = new THREE.BoxGeometry(structureWidth, 0.4, 35.2);
    const vLineGeom = new THREE.BoxGeometry(0.4, stripedBoxHeight, 35.2);

    const hLine = new THREE.Mesh(hLineGeom, lineMaterial);
    hLine.position.y = 0;
    hLine.position.z = 0.1;
    stripedBox.add(hLine);
    
    for (let i = 0; i < 5; i++) {
        const vLine = new THREE.Mesh(vLineGeom, lineMaterial);
        vLine.position.x = (i - 2) * (structureWidth / 5);
        vLine.position.z = 0.1;
        stripedBox.add(vLine);
    }
    
    // New orange roof layer
    const orangeRoofHeight = 1.5;
    const orangeRoofY = stripedBoxY + stripedBoxHeight / 2 + orangeRoofHeight / 2;
    const orangeRoofGeom = new THREE.BoxGeometry(structureWidth, orangeRoofHeight, 35);
    const orangeRoof = new THREE.Mesh(orangeRoofGeom, vermilionRed);
    orangeRoof.position.y = orangeRoofY;
    mainStructureGroup.add(orangeRoof);
    
    // New golden roof layer
    const goldRoofHeight = 1.5;
    const goldRoofY = orangeRoofY + orangeRoofHeight / 2 + goldRoofHeight / 2;
    const goldRoofGeom = new THREE.BoxGeometry(structureWidth + 0.5, goldRoofHeight, 35 + 0.5);
    const goldRoof = new THREE.Mesh(goldRoofGeom, goldMaterial);
    goldRoof.position.y = goldRoofY;
    mainStructureGroup.add(goldRoof);

    // --- Railing on Golden Roof ---
    const railingHeight = 8;
    const railingY = goldRoofY + goldRoofHeight / 2;

    const frontRailing = createOrangeRailing(structureWidth + 0.5, railingHeight, vermilionRed);
    frontRailing.position.set(0, railingY, (35 + 0.5) / 2);
    mainStructureGroup.add(frontRailing);
    
    const backRailing = createOrangeRailing(structureWidth + 0.5, railingHeight, vermilionRed);
    backRailing.position.set(0, railingY, -(35 + 0.5) / 2);
    mainStructureGroup.add(backRailing);
    
    const leftRailing = createOrangeRailing(35 + 0.5, railingHeight, vermilionRed);
    leftRailing.rotation.y = Math.PI / 2;
    leftRailing.position.set(-(structureWidth + 0.5) / 2, railingY, 0);
    mainStructureGroup.add(leftRailing);
    
    const rightRailing = createOrangeRailing(35 + 0.5, railingHeight, vermilionRed);
    rightRailing.rotation.y = Math.PI / 2;
    rightRailing.position.set((structureWidth + 0.5) / 2, railingY, 0);
    mainStructureGroup.add(rightRailing);



    // --- Second Floor ---
    const secondFloorY = railingY + railingHeight + 1.5; // Place on top of railing
    const secondFloorGroup = new THREE.Group();
    secondFloorGroup.position.y = secondFloorY;
    mainStructureGroup.add(secondFloorGroup);

    const secondFloorWidth = 90;
    const secondFloorHeight = 20;
    
    // Side lattice walls
    const latticePanelWidth = (secondFloorWidth - centerBayWidth) / 2;
    const leftLatticePanel = createLatticePanel(latticePanelWidth, secondFloorHeight, vermilionRed, whitePlaster);
    leftLatticePanel.position.set(-(centerBayWidth / 2 + latticePanelWidth / 2), secondFloorHeight / 2, 0);
    secondFloorGroup.add(leftLatticePanel);
    
    const rightLatticePanel = createLatticePanel(latticePanelWidth, secondFloorHeight, vermilionRed, whitePlaster);
    rightLatticePanel.position.set(centerBayWidth / 2 + latticePanelWidth / 2, secondFloorHeight / 2, 0);
    secondFloorGroup.add(rightLatticePanel);


    // Second story railing
    const railing2 = createOrangeRailing(centerBayWidth, 12, vermilionRed);
    railing2.position.y = 0;
    railing2.position.z = 15;
    secondFloorGroup.add(railing2);

    // Back wall for second floor
    const secondBackWall = new THREE.Mesh(new THREE.BoxGeometry(secondFloorWidth, secondFloorHeight, 1), whitePlaster);
    secondBackWall.position.set(0, secondFloorHeight / 2, -15);
    secondFloorGroup.add(secondBackWall);

    // Side walls for second floor
    const secondSideWallGeom = new THREE.BoxGeometry(1, secondFloorHeight, 30);
    const secondSideWallLeft = new THREE.Mesh(secondSideWallGeom, whitePlaster);
    secondSideWallLeft.position.set(-secondFloorWidth / 2, secondFloorHeight / 2, 0);
    secondFloorGroup.add(secondSideWallLeft);
    const secondSideWallRight = new THREE.Mesh(secondSideWallGeom, whitePlaster);
    secondSideWallRight.position.set(secondFloorWidth / 2, secondFloorHeight / 2, 0);
    secondFloorGroup.add(secondSideWallRight);


    // --- Plaque (Gaku) ---
    const plaqueGroup = createPlaque(blackAccent);
    plaqueGroup.scale.set(0.9, 0.9, 0.9);
    secondFloorGroup.add(plaqueGroup);


    // --- Main Top Roof ---
    const topRoof = createHippedRoof(darkBrownRoof, secondFloorWidth + 50, 85, 18);
    topRoof.position.y = secondFloorHeight + 5; // Adjusted Y position
    secondFloorGroup.add(topRoof);


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
