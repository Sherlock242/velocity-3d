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
import type { TrackTheme } from '@/lib/types';
import Hud from './hud';
import AiOpponentGenerator from './ai-opponent-generator';
import { handleAssessPenalty } from '@/app/actions';
import { createPlayerCar } from './models/player-car';
import { createObstacleCar } from './models/obstacle-car';
import { createGridAndScenery } from './world/track';
import {
  TRACK_THEMES,
  GRID_SIZE,
  CELL_SIZE,
  TOTAL_GRID_WIDTH,
  NUM_OBSTACLES,
  ROAD_WIDTH,
} from '@/lib/game-constants';

export default function GameWrapper() {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [theme, setTheme] = React.useState<TrackTheme>('City');
  const [gameData, setGameData] = React.useState({
    speed: 0,
    time: 0,
    carPosition: { x: 0, z: 0 },
  });
  const [isReady, setIsReady] = React.useState(false);

  // Game state refs
  const gameTimeRef = React.useRef(0);
  const carRef = React.useRef<THREE.Group>();
  const velocityRef = React.useRef(new THREE.Vector3());
  const inputRef = React.useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const wasOffTrackRef = React.useRef(false);
  const penaltyCheckCooldownRef = React.useRef(false);
  const collisionCooldownRef = React.useRef(false);
  const animationFrameIdRef = React.useRef<number>();
  const obstacleCarsRef = React.useRef<THREE.Group[]>([]);
  const tireMarksRef = React.useRef<
    { mesh: THREE.Mesh; createdAt: number }[]
  >([]);

  // Camera control refs
  const cameraOffsetRef = React.useRef(new THREE.Vector3(0, 2, -6));

  // Audio refs
  const audioListenerRef = React.useRef<THREE.AudioListener>();
  const engineSoundRef = React.useRef<THREE.Audio>();
  const skidSoundRef = React.useRef<THREE.Audio>();
  const audioInitializedRef = React.useRef(false);
  const engineOscillatorRef = React.useRef<OscillatorNode>();


  React.useEffect(() => {
    let mountNode: HTMLDivElement | null = null;
    if (mountRef.current) {
      setIsReady(false);
      mountNode = mountRef.current;
    } else {
      return;
    }

    // --- BASIC SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      5000 // Increased view distance for grid
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountNode.appendChild(renderer.domElement);

    // --- AUDIO SETUP ---
    const listener = new THREE.AudioListener();
    camera.add(listener);
    audioListenerRef.current = listener;

    const initAudio = () => {
      if (audioInitializedRef.current) return;
      if (listener.context.state === 'suspended') {
        listener.context.resume();
      }
      audioInitializedRef.current = true;

      // Engine sound
      const engineSound = new THREE.Audio(listener);
      const oscillator = listener.context.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 50;
      oscillator.start();
      engineSound.setNodeSource(oscillator);
      engineSound.setVolume(0);
      engineSoundRef.current = engineSound;
      engineOscillatorRef.current = oscillator;

      // Skid sound
      const skidSound = new THREE.Audio(listener);
      const skidNoiseBuffer = listener.context.createBuffer(1, listener.context.sampleRate * 2, listener.context.sampleRate);
      const output = skidNoiseBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      skidSound.setBuffer(skidNoiseBuffer);
      skidSound.setLoop(true);
      skidSound.setVolume(0);
      skidSound.play();
      skidSoundRef.current = skidSound;
    };


    // --- SKYBOX ---
    const skyGeometry = new THREE.BoxGeometry(4500, 4500, 4500);
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

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- PLAYER CAR ---
    const { car, wheels } = createPlayerCar();
    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
    car.position.x = 2 * CELL_SIZE - halfTotalWidth;
    scene.add(car);
    carRef.current = car;

    camera.position.set(0, 5, -10);
    camera.lookAt(car.position);

    // --- OBSTACLE CARS ---
    for (let i = 0; i < NUM_OBSTACLES; i++) {
      const obstacle = createObstacleCar();
      // Position them randomly on the grid
      const onVerticalRoad = Math.random() > 0.5;
      const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
      const positionOnRoad = (Math.random() - 0.5) * TOTAL_GRID_WIDTH;
      const halfGrid = TOTAL_GRID_WIDTH / 2;

      if (onVerticalRoad) {
        obstacle.position.x = roadIndex * CELL_SIZE - halfGrid;
        obstacle.position.z = positionOnRoad;
        obstacle.rotation.y = Math.random() > 0.5 ? 0 : Math.PI; // Face north or south
      } else {
        obstacle.position.x = positionOnRoad;
        obstacle.position.z = roadIndex * CELL_SIZE - halfGrid;
        obstacle.rotation.y = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2; // Face east or west
      }
      scene.add(obstacle);
      obstacleCarsRef.current.push(obstacle);
    }
    
    // --- GRID TRACK & SCENERY ---
    const gridGroup = createGridAndScenery(theme);
    scene.add(gridGroup);

    // --- EVENT LISTENERS ---
    const onKeyDown = (e: KeyboardEvent) => {
      initAudio();
      if (e.key === 'ArrowUp' || e.key === 'w') inputRef.current.forward = true;
      if (e.key === 'ArrowDown' || e.key === 's')
        inputRef.current.backward = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') inputRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd')
        inputRef.current.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') inputRef.current.forward = false;
      if (e.key === 'ArrowDown' || e.key === 's')
        inputRef.current.backward = false;
      if (e.key === 'ArrowLeft' || e.key === 'a') inputRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd')
        inputRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);


    const clock = new THREE.Clock();
    let currentSteerAngle = 0;

    const tireMarkGeometry = new THREE.PlaneGeometry(1, 4); // Small plane for a skid mark segment
    const tireMarkMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.6,
    });
    tireMarkMaterial.polygonOffset = true;
    tireMarkMaterial.polygonOffsetFactor = -1;

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      if (!carRef.current) return;
      const car = carRef.current;
      const delta = clock.getDelta();
      const now = clock.elapsedTime;
      gameTimeRef.current += delta;

      const maxSpeed = 100;
      const acceleration = 80;
      const turnSpeed = 2;
      const friction = 0.98;

      // --- MOVEMENT LOGIC ---
      let targetSteerDirection = 0;
      if (inputRef.current.left) targetSteerDirection = 1;
      if (inputRef.current.right) targetSteerDirection = -1;

      // Smoothly interpolate steering
      currentSteerAngle += (targetSteerDirection - currentSteerAngle) * 0.1;

      if (velocityRef.current.length() > 0.1) {
        const turnAmount = currentSteerAngle * turnSpeed * delta;
        car.rotation.y += turnAmount;
      }

      const forward = new THREE.Vector3();
      car.getWorldDirection(forward);

      let moveDirection = 0;
      if (inputRef.current.forward) moveDirection = 1;
      if (inputRef.current.backward) moveDirection = -1;

      if (moveDirection !== 0) {
        const force = forward.multiplyScalar(
          acceleration * moveDirection * delta
        );
        velocityRef.current.add(force);
      }

      velocityRef.current.multiplyScalar(friction);

      if (velocityRef.current.length() > maxSpeed) {
        velocityRef.current.normalize().multiplyScalar(maxSpeed);
      }

      car.position.add(velocityRef.current.clone().multiplyScalar(delta));
      
      // --- AUDIO & TIRE MARK LOGIC ---
      const speedRatio = velocityRef.current.length() / maxSpeed;
      const steerRatio = Math.abs(currentSteerAngle);
      const isDrifting = speedRatio > 0.2 && steerRatio > 0.5;

      if (audioInitializedRef.current && engineSoundRef.current && skidSoundRef.current && engineOscillatorRef.current) {
        engineSoundRef.current.setVolume(speedRatio * 0.1);
        engineOscillatorRef.current.frequency.setTargetAtTime(50 + speedRatio * 150, audioListenerRef.current!.context.currentTime, 0.01);

        const skidVolume = isDrifting ? speedRatio * steerRatio * 0.2 : 0;
        skidSoundRef.current.setVolume(skidVolume);
      }
      
      // Add tire marks when drifting
      if (isDrifting) {
        const tireMark = new THREE.Mesh(
          tireMarkGeometry,
          tireMarkMaterial.clone()
        );
        tireMark.position.copy(car.position);
        tireMark.position.y = 0.13; // Just above the road markings
        tireMark.quaternion.copy(car.quaternion);
        tireMark.rotateX(-Math.PI / 2);
        scene.add(tireMark);
        tireMarksRef.current.push({ mesh: tireMark, createdAt: now });
      }
      
      // Fade and remove old tire marks
      tireMarksRef.current = tireMarksRef.current.filter(mark => {
        const age = now - mark.createdAt;
        const FADE_DURATION = 2; // seconds
        if (age > FADE_DURATION) {
          scene.remove(mark.mesh);
          (mark.mesh.material as THREE.Material).dispose();
          mark.mesh.geometry.dispose();
          return false;
        } else {
          (mark.mesh.material as THREE.MeshStandardMaterial).opacity = 0.6 * (1 - age / FADE_DURATION);
          return true;
        }
      });


      // --- BOUNDARY CHECKS ---
      const halfGrid = TOTAL_GRID_WIDTH / 2;
      car.position.x = Math.max(-halfGrid, Math.min(halfGrid, car.position.x));
      car.position.z = Math.max(-halfGrid, Math.min(halfGrid, car.position.z));

      // Rotate wheels
      const wheelRotationSpeed = velocityRef.current.length() * delta * 2;
      wheels.forEach((wheel) => {
        wheel.rotation.x -= wheelRotationSpeed;
      });
      // Steer front wheels
      const maxSteerAngle = 0.4;
      const wheelSteerAngle = currentSteerAngle * maxSteerAngle;
      wheels[0].rotation.y = wheelSteerAngle;
      wheels[1].rotation.y = wheelSteerAngle;

      // --- CAMERA LOGIC ---
      const offset = cameraOffsetRef.current.clone();
      offset.applyQuaternion(car.quaternion);
      offset.add(car.position);

      camera.position.copy(offset);
      camera.lookAt(car.position);

      // --- OBSTACLE LOGIC ---
      const obstacleSpeed = 50;
      const playerCarBox = new THREE.Box3().setFromObject(car);

      obstacleCarsRef.current.forEach((obstacle) => {
        const forward = new THREE.Vector3();
        obstacle.getWorldDirection(forward);
        obstacle.position.add(forward.multiplyScalar(obstacleSpeed * delta));

        // Reset obstacle if it's outside the grid
        if (
          Math.abs(obstacle.position.x) > halfGrid + CELL_SIZE ||
          Math.abs(obstacle.position.z) > halfGrid + CELL_SIZE
        ) {
          const onVerticalRoad = Math.random() > 0.5;
          const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
          const positionOnRoad = (Math.random() - 0.5) * TOTAL_GRID_WIDTH;

          if (onVerticalRoad) {
            obstacle.position.x = roadIndex * CELL_SIZE - halfGrid;
            obstacle.position.z = positionOnRoad;
            obstacle.rotation.y = Math.random() > 0.5 ? 0 : Math.PI;
          } else {
            obstacle.position.x = positionOnRoad;
            obstacle.position.z = roadIndex * CELL_SIZE - halfGrid;
            obstacle.rotation.y =
              Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
          }
        }

        // Collision Detection
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
        if (playerCarBox.intersectsBox(obstacleBox) && !collisionCooldownRef.current) {
          collisionCooldownRef.current = true;
          velocityRef.current.multiplyScalar(0.1); // Drastic slowdown
          // Knockback
          const knockback = obstacle.position
            .clone()
            .sub(car.position)
            .normalize()
            .multiplyScalar(-5);
          car.position.add(knockback);

          toast({
            title: 'CRASH!',
            description: 'You hit another car!',
            variant: 'destructive',
          });

          setTimeout(() => {
            collisionCooldownRef.current = false;
          }, 2000); // 2 second cooldown
        }
      });

      // Penalty check for off-road
      const currentRoadXIndex = Math.round(
        (car.position.x + halfGrid) / CELL_SIZE
      );
      const currentRoadZIndex = Math.round(
        (car.position.z + halfGrid) / CELL_SIZE
      );
      const nearestRoadX = currentRoadXIndex * CELL_SIZE - halfGrid;
      const nearestRoadZ = currentRoadZIndex * CELL_SIZE - halfGrid;

      const onHorizontalRoad =
        Math.abs(car.position.z - nearestRoadZ) < ROAD_WIDTH / 2;
      const onVerticalRoad =
        Math.abs(car.position.x - nearestRoadX) < ROAD_WIDTH / 2;
      const isOffTrack = !(onHorizontalRoad || onVerticalRoad);

      if (isOffTrack) {
        wasOffTrackRef.current = true;
        velocityRef.current.multiplyScalar(0.95); // Slow down off-track
      }
      if (
        !isOffTrack &&
        wasOffTrackRef.current &&
        !penaltyCheckCooldownRef.current
      ) {
        wasOffTrackRef.current = false;
        penaltyCheckCooldownRef.current = true;
        setTimeout(() => (penaltyCheckCooldownRef.current = false), 5000); // 5 sec cooldown

        handleAssessPenalty({
          lapTime: gameTimeRef.current,
          trackPosition: 'Player went off-road and returned.',
          speed: velocityRef.current.length() * 3.6, // m/s to km/h approx
        }).then((result) => {
          if (result.penalty) {
            toast({
              title: 'Penalty Assessed!',
              description: `${result.penalty} - ${result.reason}`,
              variant: 'destructive',
            });
          }
        });
      }

      // Update HUD
      setGameData({
        speed: velocityRef.current.length() * 3.6, // Convert m/s to km/h
        time: gameTimeRef.current,
        carPosition: { x: car.position.x, z: car.position.z },
      });

      renderer.render(scene, camera);
    };

    animate();
    setIsReady(true);

    // --- CLEANUP ---
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);

      if (mountNode) {
        // Check if the renderer's DOM element is still a child of mountNode
        if (renderer.domElement.parentNode === mountNode) {
          mountNode.removeChild(renderer.domElement);
        }
      }

      // Dispose of Three.js objects
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            // If material is an array
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      renderer.dispose();
      obstacleCarsRef.current = [];
      tireMarksRef.current.forEach(mark => {
        scene.remove(mark.mesh);
        (mark.mesh.material as THREE.Material).dispose();
        mark.mesh.geometry.dispose();
      });
      tireMarksRef.current = [];
      audioListenerRef.current?.context.close();
      audioInitializedRef.current = false;
    };
  }, [theme, toast]);

  const initAudioOnInteraction = () => {
    if (!audioInitializedRef.current && audioListenerRef.current) {
      if (audioListenerRef.current.context.state === 'suspended') {
        audioListenerRef.current.context.resume().then(() => {
           // Call initAudio only after context is resumed
           if (!audioInitializedRef.current) {
             // This is a reconstruction of the initAudio function's logic
              const listener = audioListenerRef.current!;
              audioInitializedRef.current = true;

              // Engine sound
              const engineSound = new THREE.Audio(listener);
              const oscillator = listener.context.createOscillator();
              oscillator.type = 'sawtooth';
              oscillator.frequency.value = 50;
              oscillator.start();
              engineSound.setNodeSource(oscillator);
              engineSound.setVolume(0);
              engineSoundRef.current = engineSound;
              engineOscillatorRef.current = oscillator;

              // Skid sound
              const skidSound = new THREE.Audio(listener);
              const skidNoiseBuffer = listener.context.createBuffer(1, listener.context.sampleRate * 2, listener.context.sampleRate);
              const output = skidNoiseBuffer.getChannelData(0);
              for (let i = 0; i < output.length; i++) {
                output[i] = Math.random() * 2 - 1;
              }
              skidSound.setBuffer(skidNoiseBuffer);
              skidSound.setLoop(true);
              skidSound.setVolume(0);
              skidSound.play();
              skidSoundRef.current = skidSound;
           }
        });
      }
    }
  };


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-headline text-primary">
              Velocity 3D
            </h2>
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
              <RadioGroup
                value={theme}
                onValueChange={(v) => setTheme(v as TrackTheme)}
              >
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
          <p className="text-xs text-muted-foreground">
            Press B to toggle sidebar.
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div ref={mountRef} className="w-full h-full relative">
          {!isReady && (
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-background z-10">
              <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
              <p className="text-xl font-headline">Loading {theme} Grid...</p>
            </div>
          )}
        </div>
        {isReady && (
          <Hud
            speed={gameData.speed}
            carPosition={gameData.carPosition}
            gridSize={GRID_SIZE}
            totalGridWidth={TOTAL_GRID_WIDTH}
            onAcceleratorPress={() => {
              initAudioOnInteraction();
              inputRef.current.forward = true;
            }}
            onAcceleratorRelease={() => (inputRef.current.forward = false)}
            onSteerLeftPress={() => {
              initAudioOnInteraction();
              inputRef.current.left = true;
            }}
            onSteerLeftRelease={() => (inputRef.current.left = false)}
            onSteerRightPress={() => {
              initAudioOnInteraction();
              inputRef.current.right = true;
            }}
            onSteerRightRelease={() => (inputRef.current.right = false)}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
