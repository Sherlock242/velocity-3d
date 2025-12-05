
import * as THREE from 'three';

export function createOpenCollegeBuilding() {
  const collegeGroup = new THREE.Group();
  collegeGroup.name = 'openCollegeBuildingWrapper';

  const longWingWidth = 300;
  const shortWingWidth = 350;
  const wingDepth = 30;
  const numFloors = 4;
  const floorHeight = 25;

  const redMaterial = new THREE.MeshStandardMaterial({ color: 0x9a3e3e, roughness: 0.8 });
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });


  function createLattice(width: number, height: number) {
      const latticeGroup = new THREE.Group();
      const latticeMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });

      const numHolesX = Math.floor(width / 4);
      const numHolesY = Math.floor(height / 4);
      const holeSize = 2;
      const barWidth = 2;

      for (let i = 0; i <= numHolesY; i++) {
          const hBarGeom = new THREE.BoxGeometry(width, barWidth / 2, 1);
          const hBar = new THREE.Mesh(hBarGeom, latticeMaterial);
          hBar.position.y = -height / 2 + i * (holeSize + barWidth);
          latticeGroup.add(hBar);
      }

      for (let i = 0; i <= numHolesX; i++) {
          const vBarGeom = new THREE.BoxGeometry(barWidth / 2, height, 1);
          const vBar = new THREE.Mesh(vBarGeom, latticeMaterial);
          vBar.position.x = -width / 2 + i * (holeSize + barWidth);
          latticeGroup.add(vBar);
      }

      return latticeGroup;
  }

  function createFacade(width: number, depth: number, sections: number, isFront: boolean) {
    const facadeGroup = new THREE.Group();
    const zOffset = isFront ? depth / 2 : -depth / 2;

    for (let j = 0; j < sections; j++) {
        const sectionGroup = new THREE.Group();
        const sectionWidth = width / sections;
        const xPos = -width / 2 + j * sectionWidth + sectionWidth / 2;
        sectionGroup.position.x = xPos;
        
        // Vertical Pillar
        const pillarGeom = new THREE.BoxGeometry(4, floorHeight, 4);
        const pillar = new THREE.Mesh(pillarGeom, whiteMaterial);
        pillar.position.set(-sectionWidth/2 + 2, floorHeight / 2, zOffset + (isFront ? 2 : -2));
        sectionGroup.add(pillar);

        // Create facade sections
        const latticeHeight = floorHeight * 0.25;
        const panelHeight = floorHeight * 0.4;

        const topLattice = createLattice(sectionWidth - 4, latticeHeight);
        topLattice.position.set(0, floorHeight - latticeHeight / 2, zOffset + (isFront ? 1 : -1));
        sectionGroup.add(topLattice);

        const redPanel = new THREE.Mesh(
            new THREE.BoxGeometry(sectionWidth - 4, panelHeight, 2),
            redMaterial
        );
        redPanel.position.set(0, floorHeight - latticeHeight - panelHeight / 2, zOffset);
        sectionGroup.add(redPanel);
        
        const bottomLattice = createLattice(sectionWidth - 4, latticeHeight * 2, zOffset + (isFront ? 1 : -1));
        bottomLattice.position.set(0, floorHeight - latticeHeight - panelHeight - latticeHeight, zOffset + (isFront ? 1 : -1));
        sectionGroup.add(bottomLattice);

        facadeGroup.add(sectionGroup);
    }
    return facadeGroup;
  }

  function createWing(width: number, depth: number, isBackWing = false) {
      const wing = new THREE.Group();
      wing.name = 'collegeWing';

      const sectionWidth = 20;
      const numSections = Math.floor(width / sectionWidth);

      for (let i = 0; i < numFloors; i++) {
          const yPos = i * floorHeight;
          const floorGroup = new THREE.Group();
          floorGroup.position.y = yPos;

          // Main wall structure
          const mainWallGeom = new THREE.BoxGeometry(width, floorHeight, depth);
          const mainWall = new THREE.Mesh(mainWallGeom, whiteMaterial);
          mainWall.position.y = floorHeight / 2;
          floorGroup.add(mainWall);

          // Window behind facade
          const windowHeight = floorHeight * 0.6;
          const windowGeom = new THREE.PlaneGeometry(width - 4, windowHeight);
          const frontWindow = new THREE.Mesh(windowGeom, windowMaterial);
          frontWindow.position.set(0, floorHeight / 2, depth/2 + 0.1);
          const backWindow = new THREE.Mesh(windowGeom, windowMaterial);
          backWindow.position.set(0, floorHeight / 2, -depth/2 - 0.1);
          backWindow.rotation.y = Math.PI;
          floorGroup.add(frontWindow, backWindow);

          // Create the detailed facades
          const frontFacade = createFacade(width, depth, numSections, true);
          floorGroup.add(frontFacade);

          const backFacade = createFacade(width, depth, numSections, false);
          floorGroup.add(backFacade);

          if (isBackWing && i === 0) {
            const muralGeom = new THREE.PlaneGeometry(80, 20);
            const muralMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
            const mural = new THREE.Mesh(muralGeom, muralMaterial);
            mural.position.set(0, floorHeight / 2, -depth/2 - 0.2);
            mural.rotation.y = Math.PI;
            floorGroup.add(mural);
          }

          wing.add(floorGroup);
      }
      return wing;
  }
  
  const college = new THREE.Group();
  college.name = 'openCollegeBuilding';

  // Back Wing (long)
  const backWing = createWing(longWingWidth, wingDepth, true);
  backWing.position.z = -shortWingWidth / 2;
  backWing.name = 'backWing';
  college.add(backWing);
  
  // Left Wing (short)
  const leftWing = createWing(shortWingWidth, wingDepth);
  leftWing.position.x = -longWingWidth / 2;
  leftWing.rotation.y = Math.PI / 2;
  leftWing.name = 'leftWing';
  college.add(leftWing);
  
  // Right Wing (short)
  const rightWing = createWing(shortWingWidth, wingDepth);
  rightWing.position.x = longWingWidth / 2;
  rightWing.rotation.y = -Math.PI / 2;
  rightWing.name = 'rightWing';
  college.add(rightWing);

  // Stage
  const stageWidth = 80;
  const stageHeight = 5;
  const stageDepth = 40;
  const stageMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White color
  const stageGeom = new THREE.BoxGeometry(stageWidth, stageHeight, stageDepth);
  const stage = new THREE.Mesh(stageGeom, stageMaterial);
  stage.position.y = stageHeight / 2;
  stage.position.z = 0; // Center the stage in the courtyard
  stage.castShadow = true;
  stage.receiveShadow = true;
  college.add(stage);
  
  collegeGroup.add(college);

  // Rotate the entire college group to face the correct direction
  collegeGroup.rotation.y = Math.PI;

  collegeGroup.castShadow = true;
  collegeGroup.receiveShadow = true;

  return collegeGroup;
}
