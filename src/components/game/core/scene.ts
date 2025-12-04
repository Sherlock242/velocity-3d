import * as THREE from 'three';

export function setupScene(mountNode: HTMLDivElement) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        5000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountNode.appendChild(renderer.domElement);

    const audioListener = new THREE.AudioListener();
    camera.add(audioListener);

    // Skybox
    const skyGeometry = new THREE.BoxGeometry(4900, 4900, 4900);
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `;
    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 middleColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        vec3 finalColor;
        if (h > 0.0) {
          finalColor = mix(middleColor, topColor, pow(h, exponent));
        } else {
          finalColor = mix(middleColor, bottomColor, pow(-h, exponent));
        }
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
    const uniforms = {
        topColor: { value: new THREE.Color(0x0077ff) },
        middleColor: { value: new THREE.Color(0xffe488) },
        bottomColor: { value: new THREE.Color(0xff8c00) },
        offset: { value: 0 },
        exponent: { value: 0.6 }
    };
    const skyMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    scene.add(dirLight);
    
    camera.position.set(0, 5, -10);

    return { scene, camera, renderer, audioListener };
}
