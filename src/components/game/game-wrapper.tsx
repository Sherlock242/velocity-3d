'use client';

import * as React from 'react';
import * as THREE from 'three';
import { Bot, Map, Settings, Loader2 } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { TrackTheme, OpponentProfile } from '@/lib/types';
import Hud from './hud';
import AiOpponentGenerator from './ai-opponent-generator';
import { handleAssessPenalty } from '@/app/actions';
import { Button } from '../ui/button';

const TRACK_THEMES: Record<
  TrackTheme,
  { ground: THREE.Color; sky: THREE.Color; scenery: THREE.Color }
> = {
  Forest: {
    ground: new THREE.Color(0x228b22),
    sky: new THREE.Color(0x87ceeb),
    scenery: new THREE.Color(0x006400),
  },
  Desert: {
    ground: new THREE.Color(0xc2b280),
    sky: new THREE.Color(0x00008b),
    scenery: new THREE.Color(0x8b4513),
  },
  City: {
    ground: new THREE.Color(0x696969),
    sky: new THREE.Color(0x343434),
    scenery: new THREE.Color(0x808080),
  },
};

const TRACK_WIDTH = 20;
const TRACK_LENGTH = 1000;

export default function GameWrapper() {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [theme, setTheme] = React.useState<TrackTheme>('Forest');
  const [gameData, setGameData] = React.useState({ speed: 0, time: 0 });
  const [isReady, setIsReady] = React.useState(false);

  // Game state refs
  const gameTimeRef = React.useRef(0);
  const carRef = React.useRef<THREE.Mesh>();
  const velocityRef = React.useRef(new THREE.Vector3());
  const inputRef = React.useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const wasOffTrackRef = React.useRef(false);
  const penaltyCheckCooldownRef = React.useRef(false);

  React.useEffect(() => {
    if (!mountRef.current) return;
    setIsReady(false);
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = TRACK_THEMES[theme].sky;
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    
    const mountNode = mountRef.current;
    mountNode.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Car
    const carGeometry = new THREE.BoxGeometry(2, 1, 4);
    const carMaterial = new THREE.MeshStandardMaterial({
      color: 0x7df9ff,
      metalness: 0.8,
      roughness: 0.2,
    });
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.y = 1;
    car.castShadow = true;
    scene.add(car);
    carRef.current = car;

    // Track
    const groundGeometry = new THREE.PlaneGeometry(TRACK_WIDTH, TRACK_LENGTH);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: TRACK_THEMES[theme].ground });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Scenery
    const sceneryGeometry = new THREE.BoxGeometry(2, 20, 2);
    const sceneryMaterial = new THREE.MeshStandardMaterial({ color: TRACK_THEMES[theme].scenery });
    for (let i = 0; i < 100; i++) {
        const x = Math.random() < 0.5 ? TRACK_WIDTH/2 + 5 + Math.random() * 10 : -TRACK_WIDTH/2 - 5 - Math.random() * 10;
        const z = (Math.random() - 0.5) * TRACK_LENGTH;
        const sceneryObject = new THREE.Mesh(sceneryGeometry, sceneryMaterial);
        sceneryObject.position.set(x, 10, z);
        sceneryObject.castShadow = true;
        scene.add(sceneryObject);
    }

    camera.position.set(0, 5, -10);
    camera.lookAt(car.position);

    // Input handlers
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') inputRef.current.forward = true;
      if (e.key === 'ArrowDown' || e.key === 's') inputRef.current.backward = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') inputRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') inputRef.current.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') inputRef.current.forward = false;
      if (e.key === 'ArrowDown' || e.key === 's') inputRef.current.backward = false;
      if (e.key === 'ArrowLeft' || e.key === 'a') inputRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') inputRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    
    // Resize handler
    const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      gameTimeRef.current += delta;
      
      const maxSpeed = 100;
      const acceleration = 80;
      const turnSpeed = 2;
      const friction = 0.98;

      if (inputRef.current.forward) {
        velocityRef.current.z += acceleration * delta;
      }
      if (inputRef.current.backward) {
        velocityRef.current.z -= acceleration * delta;
      }
      
      velocityRef.current.z = Math.max(-maxSpeed/4, Math.min(maxSpeed, velocityRef.current.z));
      
      const speed = velocityRef.current.length();
      if(speed > 0.1) {
        const steer = (inputRef.current.left ? 1 : 0) - (inputRef.current.right ? 1 : 0);
        car.rotation.y += steer * turnSpeed * delta * (velocityRef.current.z / maxSpeed);
      }
      
      velocityRef.current.multiplyScalar(friction);

      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(car.quaternion).multiplyScalar(velocityRef.current.z * delta);
      car.position.add(forward);

      // Camera follow
      const cameraOffset = new THREE.Vector3(0, 5, -10).applyQuaternion(car.quaternion);
      camera.position.lerp(car.position.clone().add(cameraOffset), 0.1);
      camera.lookAt(car.position);

      // Penalty check
      const isOffTrack = Math.abs(car.position.x) > TRACK_WIDTH / 2;
      if (isOffTrack) {
        wasOffTrackRef.current = true;
        velocityRef.current.multiplyScalar(0.95); // Slow down off-track
      }
      if (!isOffTrack && wasOffTrackRef.current && !penaltyCheckCooldownRef.current) {
        wasOffTrackRef.current = false;
        penaltyCheckCooldownRef.current = true;
        setTimeout(() => penaltyCheckCooldownRef.current = false, 5000); // 5 sec cooldown

        handleAssessPenalty({
            lapTime: gameTimeRef.current,
            trackPosition: 'Player went off-track and returned.',
            speed: velocityRef.current.length() * 3.6, // m/s to km/h approx
        }).then(result => {
            if(result.penalty) {
                toast({
                    title: "Penalty Assessed!",
                    description: `${result.penalty} - ${result.reason}`,
                    variant: "destructive",
                });
            }
        });
      }
      
      // Update HUD
      setGameData({
        speed: velocityRef.current.length() * 3.6,
        time: gameTimeRef.current,
      });

      renderer.render(scene, camera);
    };

    animate();
    setIsReady(true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      if (mountNode && mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [theme, toast]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-headline text-primary">Velocity 3D</h2>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Settings />
              Settings
            </SidebarGroupLabel>
            <div className="p-2 space-y-4">
              <Label className="flex items-center gap-2 text-base">
                <Map /> Track Environment
              </Label>
              <RadioGroup value={theme} onValueChange={(v) => setTheme(v as TrackTheme)}>
                {Object.keys(TRACK_THEMES).map((themeName) => (
                  <div key={themeName} className="flex items-center space-x-2">
                    <RadioGroupItem value={themeName} id={themeName} />
                    <Label htmlFor={themeName}>{themeName}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </SidebarGroup>
          <Separator />
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Bot />
              AI Opponents
            </SidebarGroupLabel>
             <div className="p-2">
                <AiOpponentGenerator />
             </div>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <p className="text-xs text-muted-foreground">Press B to toggle sidebar.</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div ref={mountRef} className="w-full h-full relative">
            {!isReady && (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-background z-10">
                    <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
                    <p className="text-xl font-headline">Loading {theme} Track...</p>
                </div>
            )}
        </div>
        {isReady && <Hud speed={gameData.speed} time={gameData.time} />}
      </SidebarInset>
    </SidebarProvider>
  );
}
