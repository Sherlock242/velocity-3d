
import * as THREE from 'three';

export function createDanceStage() {
  const stage = new THREE.Group();
  stage.name = 'DanceStage';

  const stageWidth = 80;
  const stageDepth = 60;
  const stageHeight = 2;

  const stageMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.5 
  });

  const stageGeom = new THREE.BoxGeometry(stageWidth, stageHeight, stageDepth);
  const stageMesh = new THREE.Mesh(stageGeom, stageMaterial);
  stageMesh.position.y = stageHeight / 2;
  stageMesh.receiveShadow = true;
  stage.add(stageMesh);

  // Add some simple steps
  const stepHeight = 0.5;
  const stepDepth = 5;
  const numSteps = 4;

  for (let i = 0; i < numSteps; i++) {
    const stepGeom = new THREE.BoxGeometry(stageWidth * 0.4, stepHeight, stepDepth);
    const step = new THREE.Mesh(stepGeom, stageMaterial);
    step.position.set(0, (stepHeight / 2) + i * stepHeight, stageDepth / 2 + (stepDepth / 2) + i * stepDepth);
    stage.add(step);
  }

  return stage;
}

    