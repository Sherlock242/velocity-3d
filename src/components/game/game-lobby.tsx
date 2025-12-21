'use client';

import * as React from 'react';
import * as THREE from 'three';
import { createPlayerCharacter } from '@/components/game/models/player-character';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';

type GameLobbyProps = {
  onStartGame: () => void;
};

export default function GameLobby({ onStartGame }: GameLobbyProps) {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const characterRef = React.useRef<THREE.Group>();
  const isDraggingRef = React.useRef(false);
  const previousMousePositionRef = React.useRef({ x: 0, y: 0 });
  const initialRotationY = React.useRef(0);
  const initialRotationX = React.useRef(0);

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
    camera.position.z = 20;
    camera.position.y = 8;

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
    const character = createPlayerCharacter(true, 'male');
    character.scale.set(1.5, 1.5, 1.5);
    character.position.y = 0; // Adjust position to center it
    scene.add(character);
    characterRef.current = character;
    initialRotationY.current = character.rotation.y;
    initialRotationX.current = character.rotation.x;


    const handleMouseDown = (event: MouseEvent | TouchEvent) => {
        isDraggingRef.current = true;
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handleMouseMove = (event: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current || !characterRef.current) return;

        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

        const deltaX = clientX - previousMousePositionRef.current.x;
        const deltaY = clientY - previousMousePositionRef.current.y;

        characterRef.current.rotation.y += deltaX * 0.01;
        characterRef.current.rotation.x += deltaY * 0.01;

        previousMousePositionRef.current = { x: clientX, y: clientY };
    };
    
    const handleMouseUp = () => {
        if (!isDraggingRef.current || !characterRef.current) return;
        isDraggingRef.current = false;

        // Snap back to original rotation
        characterRef.current.rotation.x = initialRotationX.current;
        
        // Store the end rotation and reset for idle animation
        initialRotationY.current = characterRef.current.rotation.y;
    };


    mountNode.addEventListener('mousedown', handleMouseDown);
    mountNode.addEventListener('mousemove', handleMouseMove);
    mountNode.addEventListener('mouseup', handleMouseUp);
    mountNode.addEventListener('mouseleave', handleMouseUp);
    
    mountNode.addEventListener('touchstart', handleMouseDown, { passive: false });
    mountNode.addEventListener('touchmove', handleMouseMove, { passive: false });
    mountNode.addEventListener('touchend', handleMouseUp);
    mountNode.addEventListener('touchcancel', handleMouseUp);


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
    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (characterRef.current && !isDraggingRef.current) {
        characterRef.current.rotation.y = initialRotationY.current + time * 0.0001; // Slow rotation
      }
      renderer.render(scene, camera);
    };
    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountNode.removeEventListener('mousedown', handleMouseDown);
      mountNode.removeEventListener('mousemove', handleMouseMove);
      mountNode.removeEventListener('mouseup', handleMouseUp);
      mountNode.removeEventListener('mouseleave', handleMouseUp);
      mountNode.removeEventListener('touchstart', handleMouseDown);
      mountNode.removeEventListener('touchmove', handleMouseMove);
      mountNode.removeEventListener('touchend', handleMouseUp);
      mountNode.removeEventListener('touchcancel', handleMouseUp);
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
        className="w-full h-full absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
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
