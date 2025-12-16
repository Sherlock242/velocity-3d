
import * as THREE from 'three';
import { createKitsuneStatue } from './japanese-temple/kitsune-statue';
import { createNorenCurtain } from './japanese-temple/noren-curtain';
import { createPlaque } from './japanese-temple/plaque';
import { createPyramidRoof, createDougong, createGreenRailing, createGoldRailing, createLatticePanel } from './japanese-temple/helpers';

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
    const firstFloorHeight = 30;
    const pillarDiameter = 3.5;
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
    const noren = createNorenCurtain();
    noren.position.set(0, firstFloorHeight - 8, 16);
    noren.rotation.x = Math.random() * 0.1;
    mainStructureGroup.add(noren);

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

    // --- Inner Entrance ---
    const innerEntranceGroup = new THREE.Group();
    const innerPillarHeight = firstFloorHeight * 0.8;
    const innerPillarDiameter = 2.5;
    const innerEntranceWidth = centerBayWidth * 0.5;

    const innerPillarGeom = new THREE.CylinderGeometry(innerPillarDiameter, innerPillarDiameter, innerPillarHeight, 12);
    
    const leftInnerPillar = new THREE.Mesh(innerPillarGeom, vermilionRed);
    leftInnerPillar.position.set(-innerEntranceWidth / 2, innerPillarHeight / 2, 0);
    innerEntranceGroup.add(leftInnerPillar);

    const rightInnerPillar = new THREE.Mesh(innerPillarGeom, vermilionRed);
    rightInnerPillar.position.set(innerEntranceWidth / 2, innerPillarHeight / 2, 0);
    innerEntranceGroup.add(rightInnerPillar);

    const innerLintelGeom = new THREE.BoxGeometry(innerEntranceWidth, 3, 3);
    const innerLintel = new THREE.Mesh(innerLintelGeom, vermilionRed);
    innerLintel.position.set(0, innerPillarHeight, 0);
    innerEntranceGroup.add(innerLintel);

    innerEntranceGroup.position.z = -5; // Position it inside the main structure
    mainStructureGroup.add(innerEntranceGroup);

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


    // First Floor Roof Support
    const simpleRoofSupportGeom = new THREE.BoxGeometry(structureWidth, 3, 30);
    const simpleRoofSupport = new THREE.Mesh(simpleRoofSupportGeom, vermilionRed);
    simpleRoofSupport.position.y = firstFloorHeight + 1.5;
    mainStructureGroup.add(simpleRoofSupport);
    
    
    // --- Second Floor ---
    const secondFloorY = firstFloorHeight + 6;
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
    const plaqueGroup = createPlaque(blackAccent);
    plaqueGroup.scale.set(0.9, 0.9, 0.9);
    secondFloorGroup.add(plaqueGroup);


    // --- Main Top Roof ---
    const topRoof = createPyramidRoof(secondFloorWidth + 50, 85, 18, darkBrownRoof);
    topRoof.position.y = secondFloorHeight + 7.5; // Adjusted Y position
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
