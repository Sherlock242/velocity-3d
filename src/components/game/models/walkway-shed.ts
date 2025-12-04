
import * as THREE from 'three';

export function createWalkwayShed(length: number, width: number, withPillars = true) {
  const shed = new THREE.Group();

  const pillarHeight = 12;
  const pillarRadius = 0.5;
  const roofArchHeight = 8;
  const numPillars = Math.floor(length / 15);

  const greenFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x006400, // Dark Green
    roughness: 0.5,
    metalness: 0.5,
  });

  const translucentRoofMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00, // Bright Green
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });

  const pillarGeom = new THREE.CylinderGeometry(
    pillarRadius,
    pillarRadius,
    pillarHeight,
    12
  );

  // --- Pillars and Railings ---
  if (withPillars) {
    for (let i = 0; i <= numPillars; i++) {
      const zPos = -length / 2 + i * (length / numPillars);

      // Left pillar
      const leftPillar = new THREE.Mesh(pillarGeom, greenFrameMaterial);
      leftPillar.position.set(-width / 2, pillarHeight / 2, zPos);
      shed.add(leftPillar);

      // Right pillar
      const rightPillar = new THREE.Mesh(pillarGeom, greenFrameMaterial);
      rightPillar.position.set(width / 2, pillarHeight / 2, zPos);
      shed.add(rightPillar);

      // Railings between pillars
      if (i < numPillars) {
        const railLength = length / numPillars;
        const railHeight = 3;
        const railGeom = new THREE.BoxGeometry(0.5, railHeight, railLength);
        
        const leftRail = new THREE.Mesh(railGeom, greenFrameMaterial);
        leftRail.position.set(-width/2, railHeight / 2, zPos + railLength / 2);
        shed.add(leftRail);
        
        const rightRail = new THREE.Mesh(railGeom, greenFrameMaterial);
        rightRail.position.set(width/2, railHeight / 2, zPos + railLength / 2);
        shed.add(rightRail);
      }
    }
  }

  // --- Arched Roof ---
  const numArches = numPillars * 2; // More arches for a smoother look
  for (let i = 0; i <= numArches; i++) {
    const zPos = -length / 2 + i * (length / numArches);
    
    // Create the arch shape
    const archShape = new THREE.Shape();
    archShape.moveTo(-width/2, 0);
    archShape.quadraticCurveTo(0, roofArchHeight, width/2, 0);

    const archPoints = archShape.getPoints(16);
    const archPath = new THREE.CatmullRomCurve3(archPoints.map(p => new THREE.Vector3(p.x, p.y, 0)));

    const archGeom = new THREE.TubeGeometry(archPath, 16, 0.3, 8, false);
    const arch = new THREE.Mesh(archGeom, greenFrameMaterial);
    arch.position.set(0, pillarHeight, zPos);
    shed.add(arch);

    // Add translucent panels between arches
    if (i < numArches) {
        const panelLength = length / numArches;
        const panelShape = new THREE.Shape();
        panelShape.moveTo(-width / 2, 0);
        panelShape.quadraticCurveTo(0, roofArchHeight, width / 2, 0);
        panelShape.lineTo(width / 2, 0.1); 
        panelShape.quadraticCurveTo(0, roofArchHeight - 0.1, -width / 2, 0.1); 
        
        const extrudeSettings = { depth: panelLength, bevelEnabled: false };
        const panelGeom = new THREE.ExtrudeGeometry(panelShape, extrudeSettings);
        const panel = new THREE.Mesh(panelGeom, translucentRoofMaterial);
        
        panel.position.set(0, pillarHeight, zPos);
        panel.rotation.y = 0; 

        shed.add(panel);
    }
  }
  
  // Longitudinal support beams
  const longBeamGeom = new THREE.BoxGeometry(0.5, 0.5, length);
  const topCenterBeam = new THREE.Mesh(longBeamGeom, greenFrameMaterial);
  topCenterBeam.position.set(0, pillarHeight + roofArchHeight - 0.25, 0);
  shed.add(topCenterBeam);

  const midLeftBeam = new THREE.Mesh(longBeamGeom, greenFrameMaterial);
  midLeftBeam.position.set(-width / 3, pillarHeight + roofArchHeight * 0.75, 0);
  shed.add(midLeftBeam);
  
  const midRightBeam = new THREE.Mesh(longBeamGeom, greenFrameMaterial);
  midRightBeam.position.set(width / 3, pillarHeight + roofArchHeight * 0.75, 0);
  shed.add(midRightBeam);


  shed.castShadow = true;
  shed.receiveShadow = true;

  return shed;
}
