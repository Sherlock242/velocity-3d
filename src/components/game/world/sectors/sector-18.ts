
import * as THREE from 'three';
import { createWardencliffHouse } from '../../models/wardencliff-house';
import type { MutableRefObject } from 'react';

type Sector18Props = {
  cellCenterX: number;
  cellCenterZ: number;
  staticCollidersRef: MutableRefObject<THREE.Group[]>;
  electricSparksRef: MutableRefObject<THREE.Line[]>;
};

function createElectricSparks(count: number, position: THREE.Vector3) {
    const sparks: THREE.Line[] = [];
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });

    for (let i = 0; i < count; i++) {
        const points = [];
        const startPoint = new THREE.Vector3(0,0,0);
        points.push(startPoint);
        let currentPoint = startPoint.clone();
        const numSegments = Math.floor(Math.random() * 5) + 3;
        for (let j = 0; j < numSegments; j++) {
            const nextPoint = currentPoint.clone().add(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20
                )
            );
            points.push(nextPoint);
            currentPoint = nextPoint;
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const sparkLine = new THREE.Line(geometry, material);
        sparkLine.visible = false;
        sparks.push(sparkLine);
    }
    
    const group = new THREE.Group();
    group.position.copy(position);
    sparks.forEach(s => group.add(s));
    
    return { group, sparks };
}


export function createSector18({
  cellCenterX,
  cellCenterZ,
  staticCollidersRef,
  electricSparksRef,
}: Sector18Props): THREE.Group {
  const sectorGroup = new THREE.Group();

  const wardencliffHouse = createWardencliffHouse();
  wardencliffHouse.position.set(cellCenterX, 0, cellCenterZ);
  sectorGroup.add(wardencliffHouse);
  staticCollidersRef.current.push(wardencliffHouse);

  const tower = wardencliffHouse.getObjectByName('WardencliffTower');
  const topSphere = wardencliffHouse.getObjectByName('wardencliffTopSphere');
  if(topSphere) {
    const topSphereWorldPos = new THREE.Vector3();
    topSphere.getWorldPosition(topSphereWorldPos);
    
    const { group: sparksGroup, sparks } = createElectricSparks(10, topSphereWorldPos);
    sectorGroup.add(sparksGroup);
    electricSparksRef.current = sparks;
  }


  return sectorGroup;
}
