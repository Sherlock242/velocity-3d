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
import { createTransformer, updateTransformerAnimation, createLegoPerson } from './models/transformer';
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

type ControlMode = 'car' | 'person';

export default function GameWrapper() {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [theme, setTheme] = React.useState<TrackTheme>('City');
  const [gameData, setGameData] = React.useState({
    speed: 0,
    time: 0,
    carPosition: { x: 0, z: 0 },
    carRotation: 0,
    controlMode: 'car' as ControlMode,
  });
  const [isReady, setIsReady] = React.useState(false);

  // Game state refs
  const gameTimeRef = React.useRef(0);
  const playerRef = React.useRef<THREE.Group>();
  const velocityRef = React.useRef(new THREE.Vector3());
  const inputRef = React.useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const wasOffTrackRef = React.useRef(false);
  const penaltyCheckCooldownRef = React.useRef(false);
  const animationFrameIdRef = React.useRef<number>();
  const obstacleCarsRef = React.useRef<THREE.Group[]>([]);
  const tireMarksRef = React.useRef<
    { mesh: THREE.Mesh; createdAt: number }[]
  >([]);
  const fountainWaterJetRef = React.useRef<THREE.Mesh>();
  const walkingNpcsRef = React.useRef<THREE.Group[]>([]);


  // Control mode refs
  const controlModeRef = React.useRef<ControlMode>('car');
  const isTransformingRef = React.useRef(false);
  const transformProgressRef = React.useRef(0);


  // Camera control refs
  const cameraOffsetRef = React.useRef(new THREE.Vector3(0, 2, -6));

  // Audio refs
  const audioListenerRef = React.useRef<THREE.AudioListener>();
  const engineSoundRef = React.useRef<THREE.Audio>();
  const skidSoundRef = React.useRef<THREE.Audio>();
  const audioInitializedRef = React.useRef(false);
  const engineOscillatorRef = React.useRef<OscillatorNode>();

  const handleToggleControlMode = () => {
    if (isTransformingRef.current) return;
    isTransformingRef.current = true;
    controlModeRef.current = controlModeRef.current === 'car' ? 'person' : 'car';
    setGameData(prev => ({ ...prev, controlMode: controlModeRef.current }));
  };


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

    // --- PLAYER TRANSFORMER ---
    const transformer = createTransformer();
    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
    transformer.position.x = 2 * CELL_SIZE - halfTotalWidth;
    scene.add(transformer);
    playerRef.current = transformer;

    camera.position.set(0, 5, -10);
    camera.lookAt(transformer.position);


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
    const gridGroup = createGridAndScenery(theme, walkingNpcsRef);
    scene.add(gridGroup);
    
    // Find the water jet to animate it
    const waterJet = gridGroup.getObjectByName('fountainWaterJet');
    if (waterJet instanceof THREE.Mesh) {
      fountainWaterJetRef.current = waterJet;
    }


    // --- EVENT LISTENERS ---
    const onKeyDown = (e: KeyboardEvent) => {
      initAudio();
      if (e.key === 'ArrowUp' || e.key === 'w') inputRef.current.forward = true;
      if (e.key === 'ArrowDown' || e.key === 's')
        inputRef.current.backward = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') inputRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd')
        inputRef.current.right = true;
      if (e.key === 'e' || e.key === 'E') {
        handleToggleControlMode();
      }
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
      if (!playerRef.current) return;
      const player = playerRef.current;
      const delta = clock.getDelta();
      const now = clock.elapsedTime;
      gameTimeRef.current += delta;
      
      // Animate fountain
      if (fountainWaterJetRef.current) {
        const waterJet = fountainWaterJetRef.current;
        const time = now * 5;
        waterJet.scale.y = Math.sin(time) * 0.5 + 0.5; // Scale from 0 to 1
        waterJet.position.y = (waterJet.scale.y * 10) / 2 + 8; // Adjust position based on scale
      }


      // Handle transformation animation
      if (isTransformingRef.current) {
        const transformSpeed = 2; // speed of transformation
        if (controlModeRef.current === 'person') {
          transformProgressRef.current += delta * transformSpeed;
          if (transformProgressRef.current >= 1) {
            transformProgressRef.current = 1;
            isTransformingRef.current = false;
          }
        } else { // transforming to car
          transformProgressRef.current -= delta * transformSpeed;
          if (transformProgressRef.current <= 0) {
            transformProgressRef.current = 0;
            isTransformingRef.current = false;
          }
        }
      }
      
      // Update animation (transformation and walking)
      updateTransformerAnimation(
        player as THREE.Group & { userData: { parts: any } },
        transformProgressRef.current,
        velocityRef.current.length(),
        now
      );

      // --- NPC WALKING ---
      walkingNpcsRef.current.forEach(npc => {
        const npcSpeed = 1;
        const walkSpeed = 5;
        const npcParts = npc.userData.parts;
        const walkAmount = Math.sin(now * walkSpeed + npc.uuid.charCodeAt(0));
        npcParts.leftLeg.rotation.x = walkAmount * 0.5;
        npcParts.rightLeg.rotation.x = -walkAmount * 0.5;
        npcParts.leftArm.rotation.x = -walkAmount * 0.4;
        npcParts.rightArm.rotation.x = walkAmount * 0.4;

        // Move forward
        const forward = new THREE.Vector3();
        npc.getWorldDirection(forward);
        npc.position.add(forward.multiplyScalar(npcSpeed * delta));
        
        // Simple random turning
        if (Math.random() < 0.01) {
          npc.rotation.y += (Math.random() - 0.5) * Math.PI / 2;
        }

        // Boundary check within their cell
        const bounds = npc.userData.bounds as THREE.Box2;
        if (!bounds.containsPoint(new THREE.Vector2(npc.position.x, npc.position.z))) {
            // If outside, turn around
            npc.rotation.y += Math.PI;
        }
      });


      if (controlModeRef.current === 'car' && !isTransformingRef.current) {
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
          player.rotation.y += turnAmount;
        }

        const forward = new THREE.Vector3();
        player.getWorldDirection(forward);

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

        player.position.add(velocityRef.current.clone().multiplyScalar(delta));
        
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
          tireMark.position.copy(player.position);
          tireMark.position.y = 0.13; // Just above the road markings
          tireMark.quaternion.copy(player.quaternion);
          tireMark.rotateX(-Math.PI / 2);
          scene.add(tireMark);
          tireMarksRef.current.push({ mesh: tireMark, createdAt: now });
        }
        
        // Rotate wheels (part of transformer model)
        const wheels = player.userData.parts.wheels;
        const wheelRotationSpeed = velocityRef.current.length() * delta * 2;
        wheels.forEach((wheel: THREE.Mesh) => {
          wheel.rotation.x -= wheelRotationSpeed;
        });
        // Steer front wheels
        const maxSteerAngle = 0.4;
        const wheelSteerAngle = currentSteerAngle * maxSteerAngle;
        wheels[0].rotation.y = wheelSteerAngle;
        wheels[1].rotation.y = wheelSteerAngle;


      } else if (controlModeRef.current === 'person' && !isTransformingRef.current) {
         // --- PERSON MOVEMENT LOGIC ---
        const personMoveSpeed = 50;
        const personTurnSpeed = 3;
        const maxPersonSpeed = 50 / 3.6; // 50 km/h in m/s
        velocityRef.current.multiplyScalar(0.95); // friction

        if (inputRef.current.forward) {
          const forward = new THREE.Vector3();
          player.getWorldDirection(forward);
          velocityRef.current.add(forward.multiplyScalar(personMoveSpeed * delta));
        }
        if (inputRef.current.backward) {
          const forward = new THREE.Vector3();
          player.getWorldDirection(forward);
          velocityRef.current.add(forward.multiplyScalar(-personMoveSpeed * delta * 0.5));
        }
        if (inputRef.current.left) {
          player.rotation.y += personTurnSpeed * delta;
        }
        if (inputRef.current.right) {
          player.rotation.y -= personTurnSpeed * delta;
        }
        
        if (velocityRef.current.length() > maxPersonSpeed) {
          velocityRef.current.normalize().multiplyScalar(maxPersonSpeed);
        }

        player.position.add(velocityRef.current.clone().multiplyScalar(delta));

        // Stop sounds
        if (audioInitializedRef.current && engineSoundRef.current && skidSoundRef.current) {
            engineSoundRef.current.setVolume(0);
            skidSoundRef.current.setVolume(0);
        }
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
      player.position.x = Math.max(-halfGrid, Math.min(halfGrid, player.position.x));
      player.position.z = Math.max(-halfGrid, Math.min(halfGrid, player.position.z));


      // --- CAMERA LOGIC ---
      const offset = cameraOffsetRef.current.clone();
      if (controlModeRef.current === 'person') {
        offset.set(0, 4, -8); // Camera higher and further for person
      } else {
        offset.set(0, 2, -6);
      }

      offset.applyQuaternion(player.quaternion);
      offset.add(player.position);

      camera.position.copy(offset);
      camera.lookAt(player.position);

      // --- OBSTACLE LOGIC ---
      const obstacleSpeed = 50;
      const playerCarBox = new THREE.Box3().setFromObject(player);

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
        if (playerCarBox.intersectsBox(obstacleBox)) {
          velocityRef.current.multiplyScalar(0.1); // Drastic slowdown
          // Knockback
          const knockback = obstacle.position
            .clone()
            .sub(player.position)
            .normalize()
            .multiplyScalar(-5);
          player.position.add(knockback);
        }
      });

      // Penalty check for off-road
      const currentRoadXIndex = Math.round(
        (player.position.x + halfGrid) / CELL_SIZE
      );
      const currentRoadZIndex = Math.round(
        (player.position.z + halfGrid) / CELL_SIZE
      );
      const nearestRoadX = currentRoadXIndex * CELL_SIZE - halfGrid;
      const nearestRoadZ = currentRoadZIndex * CELL_SIZE - halfGrid;

      const onHorizontalRoad =
        Math.abs(player.position.z - nearestRoadZ) < ROAD_WIDTH / 2;
      const onVerticalRoad =
        Math.abs(player.position.x - nearestRoadX) < ROAD_WIDTH / 2;
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
      setGameData(prev => ({
        ...prev,
        speed: velocityRef.current.length() * 3.6, // Convert m/s to km/h
        time: gameTimeRef.current,
        carPosition: { x: player.position.x, z: player.position.z },
        carRotation: player.rotation.y,
      }));

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
      walkingNpcsRef.current = [];
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
            Press E to transform.
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
            carRotation={gameData.carRotation}
            gridSize={GRID_SIZE}
            totalGridWidth={TOTAL_GRID_WIDTH}
            controlMode={gameData.controlMode}
            onToggleControlMode={handleToggleControlMode}
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
