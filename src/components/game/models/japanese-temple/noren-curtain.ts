
import * as THREE from 'three';

// Helper to create the white decorative flags (noren)
export function createNorenCurtain() {
    const norenGroup = new THREE.Group();
    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
    const darkRedMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000, side: THREE.DoubleSide });

    const panelHeight = 20;
    const redLineWidth = 0.2;
    const emblemPanelWidth = 11;
    const gapPanelWidth = 8;
    const endPanelWidth = 5.5; // Half of emblem panel

    const totalWidth = (endPanelWidth * 2) + (emblemPanelWidth * 3) + (gapPanelWidth * 2) + (redLineWidth * 6);
    
    // Create one single background panel
    const mainPanelGeom = new THREE.PlaneGeometry(totalWidth, panelHeight);
    const mainPanel = new THREE.Mesh(mainPanelGeom, whiteMaterial);
    norenGroup.add(mainPanel);

    let currentX = -totalWidth / 2;

    // Helper function to add a red line
    const addRedLine = () => {
        const lineGeom = new THREE.BoxGeometry(redLineWidth, panelHeight, 0.1);
        const line = new THREE.Mesh(lineGeom, darkRedMaterial);
        line.position.x = currentX + redLineWidth / 2;
        line.position.z = 0.05;
        norenGroup.add(line);
        currentX += redLineWidth;
    };
    
    // Helper function to add emblem
    const addEmblem = (xPos: number) => {
        const circleRadius = 2.5;
        const circleGeom = new THREE.CircleGeometry(circleRadius, 32);
        const circle = new THREE.Mesh(circleGeom, blackMaterial);
        circle.position.x = xPos;
        circle.position.z = 0.1;
        norenGroup.add(circle);
    }

    // Build the curtain from left to right

    // 1. First half-width blank panel area
    currentX += endPanelWidth;

    // 2. First red line
    addRedLine();

    // 3. First emblem panel
    addEmblem(currentX + emblemPanelWidth / 2);
    currentX += emblemPanelWidth;
    
    // 4. Second red line
    addRedLine();

    // 5. First gap panel
    currentX += gapPanelWidth;

    // 6. Third red line
    addRedLine();

    // 7. Second emblem panel
    addEmblem(currentX + emblemPanelWidth / 2);
    currentX += emblemPanelWidth;

    // 8. Fourth red line
    addRedLine();
    
    // 9. Second gap panel
    currentX += gapPanelWidth;
    
    // 10. Fifth red line
    addRedLine();

    // 11. Third emblem panel
    addEmblem(currentX + emblemPanelWidth / 2);
    currentX += emblemPanelWidth;
    
    // 12. Sixth red line
    addRedLine();

    // 13. Final half-width blank panel
    currentX += endPanelWidth;


    return norenGroup;
}
