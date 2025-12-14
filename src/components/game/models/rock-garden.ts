
import * as THREE from 'three';

export function createRockGarden() {
    const garden = new THREE.Group();
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
    const concreteMaterial = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, roughness: 0.8 });
    const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x4682B4, transparent: true, opacity: 0.8 });
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });

    function createRockWall(width: number, height: number, depth: number) {
        const wall = new THREE.Group();
        const segments = 10;
        for (let i = 0; i < segments; i++) {
            const rockGeom = new THREE.BoxGeometry(
                width / segments + (Math.random() - 0.5) * 5,
                height + (Math.random() - 0.5) * 10,
                depth + (Math.random() - 0.5) * 5
            );
            const rock = new THREE.Mesh(rockGeom, rockMaterial);
            rock.position.set(
                -width / 2 + (i + 0.5) * (width / segments),
                (Math.random() * height) / 4,
                (Math.random() - 0.5) * depth / 2
            );
            rock.rotation.set(Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2);
            wall.add(rock);
        }
        return wall;
    }

    // Main back wall
    const backWall = createRockWall(300, 100, 20);
    backWall.position.set(0, 50, -150);
    garden.add(backWall);

    // Side wall
    const sideWall = createRockWall(200, 80, 20);
    sideWall.position.set(150, 40, -50);
    sideWall.rotation.y = -Math.PI / 2;
    garden.add(sideWall);

    // --- Pavilion ---
    const pavilion = new THREE.Group();
    pavilion.position.set(0, 80, -140);
    const pavillionFloor = new THREE.Mesh(new THREE.BoxGeometry(200, 5, 50), concreteMaterial);
    pavilion.add(pavillionFloor);

    // Pavilion pillars and arches
    const numPillars = 10;
    for (let i = 0; i < numPillars; i++) {
        const pillarGeom = new THREE.CylinderGeometry(2, 2, 20, 12);
        const pillar = new THREE.Mesh(pillarGeom, concreteMaterial);
        const xPos = -90 + i * (180 / (numPillars - 1));
        pillar.position.set(xPos, 12.5, 20);
        pavilion.add(pillar);

        const arch = new THREE.Mesh(new THREE.TorusGeometry(8, 1, 8, 16, Math.PI), concreteMaterial);
        arch.position.set(xPos, 20, 20);
        arch.rotation.z = Math.PI;
        pavilion.add(arch);
    }
    
    // Pavilion Domes
    const domeGeom = new THREE.SphereGeometry(15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome1 = new THREE.Mesh(domeGeom, concreteMaterial);
    dome1.position.set(-60, 22.5, 0);
    pavilion.add(dome1);

    const dome2 = new THREE.Mesh(domeGeom, concreteMaterial);
    dome2.position.set(60, 22.5, 0);
    pavilion.add(dome2);

    garden.add(pavilion);


    // --- Waterfall ---
    const waterfallWidth = 150;
    const waterfallHeight = 80;
    const waterfallGeom = new THREE.PlaneGeometry(waterfallWidth, waterfallHeight, 10, 10);
    const positions = waterfallGeom.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const z = positions.getZ(i);
        positions.setZ(i, z + Math.sin(positions.getY(i) * 0.1) * 2);
    }
    const waterfallMaterial = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.7,
        metalness: 0.2,
        roughness: 0.3
    });
    const waterfall = new THREE.Mesh(waterfallGeom, waterfallMaterial);
    waterfall.position.set(0, 40, -139);
    garden.add(waterfall);

    // Mist particles
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const pMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const pVertices: number[] = [];
    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * waterfallWidth;
        const y = Math.random() * 10 - 5;
        const z = -135 + (Math.random() - 0.5) * 20;
        pVertices.push(x, y, z);
    }
    particles.setAttribute('position', new THREE.Float32BufferAttribute(pVertices, 3));
    const particleSystem = new THREE.Points(particles, pMaterial);
    garden.add(particleSystem);


    // --- Lower Pools and Paths ---
    const lowerPools = new THREE.Group();
    const poolGeom = new THREE.PlaneGeometry(280, 280);
    const pool = new THREE.Mesh(poolGeom, waterMaterial);
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = -2;
    lowerPools.add(pool);

    // Criss-crossing paths
    const pathMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.8 });
    const pathGeom1 = new THREE.BoxGeometry(150, 2, 20);
    const path1 = new THREE.Mesh(pathGeom1, pathMaterial);
    path1.position.set(0, 0, 0);
    lowerPools.add(path1);

    const pathGeom2 = new THREE.BoxGeometry(20, 2, 120);
    const path2 = new THREE.Mesh(pathGeom2, pathMaterial);
    path2.position.set(-50, 0, 50);
    lowerPools.add(path2);
    
    const path3 = path2.clone();
    path3.position.set(50, 0, -50);
    lowerPools.add(path3);

    garden.add(lowerPools);


    // --- Foliage ---
    for (let i = 0; i < 30; i++) {
        const tree = new THREE.Group();
        const trunkGeom = new THREE.CylinderGeometry(1, 1.5, 20 + Math.random() * 20, 8);
        const trunk = new THREE.Mesh(trunkGeom, new THREE.MeshStandardMaterial({color: 0x654321}));
        trunk.position.y = trunk.geometry.parameters.height / 2;
        tree.add(trunk);

        const canopyGeom = new THREE.SphereGeometry(10 + Math.random() * 10, 8, 6);
        const canopy = new THREE.Mesh(canopyGeom, foliageMaterial);
        canopy.position.y = trunk.geometry.parameters.height;
        tree.add(canopy);
        
        tree.position.set(
            150 + (Math.random() - 0.5) * 100,
            0,
            (Math.random() - 0.5) * 300
        );
        tree.rotation.y = Math.random() * Math.PI;
        garden.add(tree);
    }

    garden.scale.set(1.5, 1.5, 1.5);

    garden.castShadow = true;
    garden.receiveShadow = true;
    return garden;
}
