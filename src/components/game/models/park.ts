
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


export function createLuisPark() {
  const park = new THREE.Group();

  // Park Ground
  const groundGeom = new THREE.PlaneGeometry(400, 400);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x55903c, roughness: 0.9 });
  const ground = new THREE.Mesh(groundGeom, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  park.add(ground);

  // Trees
  const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  
  for (let i = 0; i < 30; i++) {
    const tree = new THREE.Group();
    const canopyGeom = new THREE.SphereGeometry(Math.random() * 10 + 5, 8, 6);
    const canopy = new THREE.Mesh(canopyGeom, treeMaterial);
    canopy.position.y = Math.random() * 10 + 20;
    tree.add(canopy);

    const trunkGeom = new THREE.CylinderGeometry(1, 2, canopy.position.y, 8);
    const trunk = new THREE.Mesh(trunkGeom, trunkMaterial);
    trunk.position.y = canopy.position.y / 2;
    tree.add(trunk);
    
    const x = (Math.random() - 0.5) * 380;
    const z = (Math.random() - 0.5) * 380;
    tree.position.set(x, 0, z);
    tree.castShadow = true;
    park.add(tree);
  }

  // Paths
  const pathMaterial = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
  const mainPathGeom = new THREE.PlaneGeometry(20, 400);
  const mainPath = new THREE.Mesh(mainPathGeom, pathMaterial);
  mainPath.rotation.x = -Math.PI / 2;
  mainPath.position.y = 0.1;
  park.add(mainPath);

  const crossPathGeom = new THREE.PlaneGeometry(400, 20);
  const crossPath = new THREE.Mesh(crossPathGeom, pathMaterial);
  crossPath.rotation.x = -Math.PI / 2;
  crossPath.position.y = 0.1;
  crossPath.position.z = 50;
  park.add(crossPath);

  // Park Sign - Basic version without TextGeometry
  const signGroup = new THREE.Group();
  signGroup.name = "LuisParkSign";
  const signPostGeom = new THREE.CylinderGeometry(1, 1, 15, 8);
  const signPostMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const post1 = new THREE.Mesh(signPostGeom, signPostMaterial);
  post1.position.set(-15, 7.5, 0);
  signGroup.add(post1);
  const post2 = post1.clone();
  post2.position.x = 15;
  signGroup.add(post2);

  const signBoardGeom = new THREE.BoxGeometry(40, 10, 2);
  const signBoardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const signBoard = new THREE.Mesh(signBoardGeom, signBoardMaterial);
  signBoard.position.y = 15;
  signGroup.add(signBoard);
  
  signGroup.position.set(0, 0, -190);
  park.add(signGroup);


  return park;
}

    