
import * as THREE from 'three';

// Helper to create the stone base for the lantern
function createLanternBase() {
    const baseGroup = new THREE.Group();
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });

    const bottomTierHeight = 1.5;
    const bottomTierRadius = 6;
    const bottomTier = new THREE.Mesh(
        new THREE.CylinderGeometry(bottomTierRadius, bottomTierRadius, bottomTierHeight, 6),
        baseMaterial
    );
    bottomTier.position.y = bottomTierHeight / 2;
    baseGroup.add(bottomTier);
    
    const topTierHeight = 3;
    const topTierRadius = 5;
    const topTier = new THREE.Mesh(
        new THREE.CylinderGeometry(topTierRadius, topTierRadius, topTierHeight, 6),
        baseMaterial
    );
    topTier.position.y = bottomTierHeight + topTierHeight / 2;
    baseGroup.add(topTier);

    return baseGroup;
}

export function createLantern(
    vermilionRed: THREE.Material,
    blackAccent: THREE.Material
) {
    const lanternGroup = new THREE.Group();

    // --- Materials ---
    const greenRoofMaterial = new THREE.MeshStandardMaterial({ color: 0x2a5543, roughness: 0.7 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.4 });
    const grayLightMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, emissive: 0x555555, emissiveIntensity: 0.3 });

    // --- Base ---
    const base = createLanternBase();
    lanternGroup.add(base);

    const postHeight = 25;
    const postRadius = 1.5;

    // --- Post ---
    const postGeom = new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 6);
    const post = new THREE.Mesh(postGeom, vermilionRed);
    post.position.y = 4.5 + postHeight / 2;
    lanternGroup.add(post);

    // --- Light Box ---
    const lightBoxY = 4.5 + postHeight;
    const lightBoxHeight = 10;
    const lightBoxRadius = 7;
    const lightBoxGroup = new THREE.Group();
    lightBoxGroup.position.y = lightBoxY + lightBoxHeight / 2;
    lanternGroup.add(lightBoxGroup);
    
    // Single hexagonal box
    const lightBoxGeom = new THREE.CylinderGeometry(lightBoxRadius, lightBoxRadius, lightBoxHeight, 6);
    const lightBoxMesh = new THREE.Mesh(lightBoxGeom, vermilionRed);
    lightBoxGroup.add(lightBoxMesh);

    // Add glass panels to each face
    const panelWidth = lightBoxRadius * 0.9;
    const panelHeight = lightBoxHeight * 0.7;
    const panelGeom = new THREE.PlaneGeometry(panelWidth, panelHeight);
    
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const panel = new THREE.Mesh(panelGeom, grayLightMaterial);
        
        panel.position.x = Math.sin(angle) * (lightBoxRadius * 0.8);
        panel.position.z = Math.cos(angle) * (lightBoxRadius * 0.8);
        panel.rotation.y = angle;
        
        lightBoxGroup.add(panel);
    }
    
    // --- Roof Structure ---
    const roofY = lightBoxY + lightBoxHeight;
    const roofGroup = new THREE.Group();
    roofGroup.position.y = roofY;
    lanternGroup.add(roofGroup);

    // Black base for the roof
    const roofBaseRadius = lightBoxRadius * 1.2;
    const roofBaseGeom = new THREE.CylinderGeometry(roofBaseRadius, roofBaseRadius, 1.5, 6);
    const roofBase = new THREE.Mesh(roofBaseGeom, blackAccent);
    roofBase.position.y = 0.75;
    roofGroup.add(roofBase);

    // Curved green roof
    const roofHeight = 5;
    const roofRadius = roofBaseRadius * 1.3;
    const roofShape = new THREE.Shape();
    roofShape.moveTo(0, roofHeight);
    roofShape.quadraticCurveTo(roofRadius * 0.5, roofHeight * 0.8, roofRadius, 0);
    roofShape.lineTo(0,0); // Close shape
    
    const roofPoints = roofShape.getPoints(8);
    const roofGeom = new THREE.LatheGeometry(roofPoints, 6, 0, Math.PI * 2);
    const roofMesh = new THREE.Mesh(roofGeom, greenRoofMaterial);
    roofMesh.position.y = 1.5;
    roofGroup.add(roofMesh);
    
    // Golden Finial (Top Sphere)
    const finialGeom = new THREE.SphereGeometry(1.2, 16, 8);
    const finial = new THREE.Mesh(finialGeom, goldMaterial);
    finial.position.y = 1.5 + roofHeight + 0.5;
    roofGroup.add(finial);

    return lanternGroup;
}
