'use client';

import * as React from 'react';
import * as THREE from 'three';
import { createLegoPerson } from '@/components/game/models/transformer';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';

type GameLobbyProps = {
  onStartGame: () => void;
};

export default function GameLobby({ onStartGame }: GameLobbyProps) {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const characterRef = React.useRef<THREE.Group>();

  React.useEffect(() => {
    if (!mountRef.current) return;

    const mountNode = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mountNode.clientWidth / mountNode.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 12;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountNode.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Character model
    const character = createLegoPerson(true, 'male');
    character.scale.set(1.5, 1.5, 1.5);
    character.position.y = 0; // Adjust position to center it
    scene.add(character);
    characterRef.current = character;

    // Handle window resize
    const handleResize = () => {
      if (mountNode) {
        camera.aspect = mountNode.clientWidth / mountNode.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (characterRef.current) {
        characterRef.current.rotation.y += 0.005; // Slow rotation
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountNode && renderer.domElement.parentNode === mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute top-8 left-8 text-left">
        <h1 className="text-4xl font-bold text-primary">Velocity 3D</h1>
        <p className="text-base text-muted-foreground mt-2">
          The futuristic racing experience.
        </p>
      </div>

      <div
        ref={mountRef}
        className="w-full h-full absolute inset-0 z-0"
      ></div>
      
      <div className="absolute bottom-16 right-8 z-10">
        <Button
          onClick={onStartGame}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-xl font-bold rounded-full"
        >
          <Car className="mr-3" />
          START
        </Button>
      </div>
    </div>
  );
}