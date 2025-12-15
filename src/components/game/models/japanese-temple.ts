
import * as THREE from 'three';

export function createJapaneseTemple() {
    const temple = new THREE.Group();
    temple.name = 'JapaneseTemple';

    const redMaterial = new THREE.MeshStandardMaterial({ color: 0xaa2222, roughness: 0.7 });
    const darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x3b2a24, roughness: 0.8 });
    const whiteWallMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6, roughness: 0.5 });
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });

    // --- Base Platform ---
    const baseWidth = 80;
    const baseDepth = 60;
    const baseHeight = 5;
    const baseGeom = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const base = new THREE.Mesh(baseGeom, stoneMaterial);
    base.position.y = baseHeight / 2;
    temple.add(base);

    // --- Main Hall (1st Floor) ---
    const mainHall = new THREE.Group();
    mainHall.position.y = baseHeight;
    temple.add(mainHall);

    const hallWidth = 70;
    const hallDepth = 50;
    const hallHeight = 20;

    // Walls
    const wallGeom = new THREE.BoxGeometry(hallWidth, hallHeight, hallDepth);
    const wall = new THREE.Mesh(wallGeom, whiteWallMaterial);
    wall.position.y = hallHeight / 2;
    mainHall.add(wall);

    // Red Pillars and Frames
    const pillarGeom = new THREE.BoxGeometry(2, hallHeight, 2);
    const pillarPositions = [
        { x: -hallWidth/2, z: hallDepth/2 }, { x: hallWidth/2, z: hallDepth/2 },
        { x: -hallWidth/2, z: -hallDepth/2 }, { x: hallWidth/2, z: -hallDepth/2 },
        { x: 0, z: hallDepth/2 }, { x: -hallWidth/4, z: hallDepth/2 }, { x: hallWidth/4, z: hallDepth/2 },
    ];
    pillarPositions.forEach(pos => {
        const pillar = new THREE.Mesh(pillarGeom, redMaterial);
        pillar.position.set(pos.x, hallHeight / 2, pos.z);
        mainHall.add(pillar);
    });

    // Entrance
    const entranceGeom = new THREE.BoxGeometry(15, 15, 2);
    const entrance = new THREE.Mesh(entranceGeom, darkWoodMaterial);
    entrance.position.set(0, 7.5, hallDepth/2);
    mainHall.add(entrance);

    // --- Main Roof ---
    function createRoof(width: number, depth: number, height: number) {
        const roof = new THREE.Group();
        const mainRoofGeom = new THREE.ConeGeometry(width * 0.7, height, 4);
        const mainRoof = new THREE.Mesh(mainRoofGeom, darkWoodMaterial);
        mainRoof.rotation.y = Math.PI / 4;
        mainRoof.position.y = height / 2;
        roof.add(mainRoof);
        
        // Extended eaves
        const eavesGeom = new THREE.BoxGeometry(width, 2, depth);
        const eaves = new THREE.Mesh(eavesGeom, darkWoodMaterial);
        eaves.position.y = 1;
        roof.add(eaves);
        
        return roof;
    }
    
    const mainRoof = createRoof(hallWidth + 10, hallDepth + 10, 15);
    mainRoof.position.y = hallHeight;
    mainHall.add(mainRoof);

    // --- Second Tier ---
    const secondTier = new THREE.Group();
    secondTier.position.y = hallHeight + 10;
    mainHall.add(secondTier);

    const tierWidth = 40;
    const tierDepth = 30;
    const tierHeight = 12;

    const tierWallGeom = new THREE.BoxGeometry(tierWidth, tierHeight, tierDepth);
    const tierWall = new THREE.Mesh(tierWallGeom, whiteWallMaterial);
    tierWall.position.y = tierHeight / 2;
    secondTier.add(tierWall);

    const tierRoof = createRoof(tierWidth + 10, tierDepth + 10, 10);
    tierRoof.position.y = tierHeight;
    secondTier.add(tierRoof);
    
    // Gold ornaments (simplified)
    const ornamentGeom = new THREE.SphereGeometry(1, 8, 6);
    const ornament1 = new THREE.Mesh(ornamentGeom, goldMaterial);
    ornament1.position.set(0, tierHeight + 10, 0);
    secondTier.add(ornament1);


    temple.castShadow = true;
    temple.receiveShadow = true;
    temple.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    return temple;
}
