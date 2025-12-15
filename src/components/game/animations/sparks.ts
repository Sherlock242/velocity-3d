
import * as THREE from 'three';

export function updateElectricSparks(sparks: THREE.Line[]) {
    sparks.forEach(spark => {
        if (Math.random() > 0.95) {
            spark.visible = true;
            const positions = spark.geometry.attributes.position;
            const startPoint = new THREE.Vector3(0, 0, 0);
            positions.setXYZ(0, startPoint.x, startPoint.y, startPoint.z);
            let currentPoint = startPoint.clone();

            for (let i = 1; i < positions.count; i++) {
                const nextPoint = currentPoint.clone().add(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 20,
                        (Math.random() - 0.5) * 20,
                        (Math.random() - 0.5) * 20
                    )
                );
                positions.setXYZ(i, nextPoint.x, nextPoint.y, nextPoint.z);
                currentPoint = nextPoint;
            }
            positions.needsUpdate = true;

        } else if (spark.visible) {
            if (Math.random() > 0.8) {
                spark.visible = false;
            }
        }
    });
}
