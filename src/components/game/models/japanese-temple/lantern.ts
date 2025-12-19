
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


// Helper for the parallelogram light box panel
function createLightPanel(width: number, height: number, frameMaterial: THREE.Material, lightMaterial: THREE.Material, yellowCircleMaterial: THREE.Material) {
    const panel = new THREE.Group();
    
    // Gray parallelogram shape for the light box
    const shape = new THREE.Shape();
    const slant = 2; // How much the sides are slanted
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width - slant, height);
    shape.lineTo(-slant, height);
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    const grayPanel = new THREE.Mesh(geometry, lightMaterial);
    grayPanel.position.set(-width / 2 + slant, -height / 2, 0);
    panel.add(grayPanel);

    // Orange border
    const borderThickness = 0.8;
    const borderTop = new THREE.Mesh(new THREE.BoxGeometry(width - slant, borderThickness, 0.5), frameMaterial);
    borderTop.position.set(0, height / 2 - borderThickness / 2, 0.3);
    panel.add(borderTop);

    const borderBottom = new THREE.Mesh(new THREE.BoxGeometry(width - slant, borderThickness, 0.5), frameMaterial);
    borderBottom.position.set(0, -height / 2 + borderThickness / 2, 0.3);
    panel.add(borderBottom);

    const borderLeftGeom = new THREE.BoxGeometry(borderThickness, height, 0.5);
    const borderLeft = new THREE.Mesh(borderLeftGeom, frameMaterial);
    borderLeft.position.set(-width/2, 0, 0.3);
    borderLeft.rotation.z = Math.atan(slant / height);
    panel.add(borderLeft);
    
    const borderRight = new THREE.Mesh(borderLeftGeom, frameMaterial);
    borderRight.position.set(width/2, 0, 0.3);
    borderRight.rotation.z = Math.atan(-slant / height);
    panel.add(borderRight);
    
    // Yellow circle marks
    const circleRadius = 0.3;
    const circleGeom = new THREE.CircleGeometry(circleRadius, 8);
    
    const circle1 = new THREE.Mesh(circleGeom, yellowCircleMaterial);
    circle1.position.set(-width/2 + borderThickness, height/2 - borderThickness/2, 0.6);
    panel.add(circle1);

    const circle2 = new THREE.Mesh(circleGeom, yellowCircleMaterial);
    circle2.position.set(width/2 - borderThickness, height/2 - borderThickness/2, 0.6);
    panel.add(circle2);

    return panel;
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
    const yellowCircleMaterial = new THREE.MeshStandardMaterial({color: 0xffd700});

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
    const lightBoxSize = 10;
    const lightBoxRadius = lightBoxSize / (2 * Math.tan(Math.PI / 6)); // Apothem to radius
    const lightBoxGroup = new THREE.Group();
    lightBoxGroup.position.y = lightBoxY;
    lanternGroup.add(lightBoxGroup);
    
    // Hexagonal light box frame and panels
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const panelWidth = 7;
        const panelHeight = 8;
        
        const panel = createLightPanel(panelWidth, panelHeight, vermilionRed, grayLightMaterial, yellowCircleMaterial);
        
        panel.position.x = Math.sin(angle) * (lightBoxRadius * 0.8);
        panel.position.z = Math.cos(angle) * (lightBoxRadius * 0.8);
        panel.rotation.y = angle;
        
        lightBoxGroup.add(panel);
    }

    // --- Roof Structure ---
    const roofY = lightBoxY + 4;
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
