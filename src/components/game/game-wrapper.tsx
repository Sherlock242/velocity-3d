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

const TRACK_THEMES: Record<
  TrackTheme,
  { ground: THREE.Color; sky: THREE.Color; scenery: THREE.Color }
> = {
  Forest: {
    ground: new THREE.Color(0x228b22), // Grassy ground color
    sky: new THREE.Color(0x87ceeb),
    scenery: new THREE.Color(0x006400),
  },
  Desert: {
    ground: new THREE.Color(0xc2b280), // Sand color
    sky: new THREE.Color(0x00008b),
    scenery: new THREE.Color(0x8b4513),
  },
  City: {
    ground: new THREE.Color(0x696969), // Pavement color
    sky: new THREE.Color(0x343434),
    scenery: new THREE.Color(0x808080),
  },
};

const TRACK_WIDTH = 20;
const SEGMENT_LENGTH = 200;
const GROUND_WIDTH = 500;
const NUM_SEGMENTS = 10;
const TRACK_LENGTH = SEGMENT_LENGTH * NUM_SEGMENTS;

export default function GameWrapper() {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [theme, setTheme] = React.useState<TrackTheme>('Forest');
  const [gameData, setGameData] = React.useState({ speed: 0, time: 0 });
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
  const animationFrameIdRef = React.useRef<number>();

  // Camera control refs
  const orbitControlsRef = React.useRef({
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    azimuthAngle: Math.PI, // Start from behind the car
    polarAngle: Math.PI / 3, // Angle from the top
  });
  const cameraOffsetRef = React.useRef(new THREE.Vector3(0, 5, -10));

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
    mountNode.appendChild(renderer.domElement);
    
    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    scene.add(dirLight);
    
    // --- LAMBORGHINI CAR ---
    const car = new THREE.Group();
    car.position.y = 0.5;

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x0077ff, // Lamborghini blue
      metalness: 0.9,
      roughness: 0.1,
    });
    
    const bodyWidth = 2.2;
    const bodyLength = 4.5;
    const bodyHeight = 1.2;

    // Main body - custom shape for wedge
    const bodyShape = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Front (low)
      -bodyWidth / 2, 0, bodyLength / 2, // 0
       bodyWidth / 2, 0, bodyLength / 2, // 1
      -bodyWidth / 2, bodyHeight * 0.4, bodyLength / 2, // 2
       bodyWidth / 2, bodyHeight * 0.4, bodyLength / 2, // 3
      // Back (high)
      -bodyWidth / 2, 0, -bodyLength / 2, // 4
       bodyWidth / 2, 0, -bodyLength / 2, // 5
      -bodyWidth / 2, bodyHeight, -bodyLength / 2, // 6
       bodyWidth / 2, bodyHeight, -bodyLength / 2, // 7
    ]);

    bodyShape.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    bodyShape.setIndex([
      0, 1, 3, 0, 3, 2, // front face
      4, 6, 7, 4, 7, 5, // back face
      0, 4, 5, 0, 5, 1, // bottom face
      2, 3, 7, 2, 7, 6, // top face (sloped)
      1, 5, 7, 1, 7, 3, // right side
      0, 2, 6, 0, 6, 4  // left side
    ]);
    bodyShape.computeVertexNormals();
    const carBody = new THREE.Mesh(bodyShape, bodyMaterial);
    carBody.castShadow = true;
    car.add(carBody);

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0,
      roughness: 0,
      transparent: true,
      opacity: 0.6
    });

    // Windshield
    const windshieldGeom = new THREE.BufferGeometry();
    const windshieldVerts = new Float32Array([
        -bodyWidth/2 * 0.9, bodyHeight * 0.4, bodyLength/2, // 0
         bodyWidth/2 * 0.9, bodyHeight * 0.4, bodyLength/2, // 1
        -bodyWidth/2 * 0.8, bodyHeight, -bodyLength / 2 + 1.5, // 2
         bodyWidth/2 * 0.8, bodyHeight, -bodyLength / 2 + 1.5, // 3
    ]);
    windshieldGeom.setAttribute('position', new THREE.BufferAttribute(windshieldVerts, 3));
    windshieldGeom.setIndex([0,1,3, 0,3,2]);
    windshieldGeom.computeVertexNormals();
    const windshield = new THREE.Mesh(windshieldGeom, glassMaterial);
    car.add(windshield);


    // Spoiler
    const spoilerMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const spoilerWingGeom = new THREE.BoxGeometry(bodyWidth * 1.1, 0.05, 0.3);
    const spoilerWing = new THREE.Mesh(spoilerWingGeom, spoilerMaterial);
    spoilerWing.position.set(0, bodyHeight + 0.2, -bodyLength / 2 - 0.1);
    spoilerWing.castShadow = true;
    car.add(spoilerWing);
    
    const spoilerSupportGeom = new THREE.BoxGeometry(0.1, 0.2, 0.1);
    const spoilerSupport1 = new THREE.Mesh(spoilerSupportGeom, spoilerMaterial);
    spoilerSupport1.position.set(-bodyWidth/3, bodyHeight + 0.1, -bodyLength / 2 - 0.1);
    spoilerSupport1.castShadow = true;
    car.add(spoilerSupport1);
    
    const spoilerSupport2 = new THREE.Mesh(spoilerSupportGeom, spoilerMaterial);
    spoilerSupport2.position.set(bodyWidth/3, bodyHeight + 0.1, -bodyLength / 2 - 0.1);
    spoilerSupport2.castShadow = true;
    car.add(spoilerSupport2);


    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    wheelGeometry.rotateZ(Math.PI / 2); // Rotate to align with car's forward direction

    const wheels: THREE.Mesh[] = [];
    const wheelPositions = [
        new THREE.Vector3(bodyWidth/2, 0.2, bodyLength / 2 - 1),
        new THREE.Vector3(-bodyWidth/2, 0.2, bodyLength / 2 - 1),
        new THREE.Vector3(bodyWidth/2, 0.2, -bodyLength / 2 + 1),
        new THREE.Vector3(-bodyWidth/2, 0.2, -bodyLength / 2 + 1),
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.copy(pos);
        wheel.castShadow = true;
        car.add(wheel);
        wheels.push(wheel);
    });

    scene.add(car);
    carRef.current = car;

    camera.position.set(0, 5, -10);
    camera.lookAt(car.position);
    
    // --- INFINITE TRACK ---
    const trackSegments: THREE.Group[] = [];

    function createTrackSegment(segmentIndex: number) {
      const segmentGroup = new THREE.Group();

      // Ground
      const groundGeometry = new THREE.PlaneGeometry(GROUND_WIDTH, SEGMENT_LENGTH);
      const groundMaterial = new THREE.MeshStandardMaterial({ color: TRACK_THEMES[theme].ground });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      segmentGroup.add(ground);

      // Road
      const roadGeometry = new THREE.PlaneGeometry(TRACK_WIDTH, SEGMENT_LENGTH);
      const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.rotation.x = -Math.PI / 2;
      road.position.y = 0.01;
      road.receiveShadow = true;
      segmentGroup.add(road);

      // Markings
      const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const edgeLineGeometry = new THREE.PlaneGeometry(0.5, SEGMENT_LENGTH);
      const leftEdgeLine = new THREE.Mesh(edgeLineGeometry, lineMaterial);
      leftEdgeLine.position.set(-TRACK_WIDTH / 2 + 0.25, 0.02, 0);
      leftEdgeLine.rotation.x = -Math.PI / 2;
      segmentGroup.add(leftEdgeLine);
      const rightEdgeLine = new THREE.Mesh(edgeLineGeometry, lineMaterial);
      rightEdgeLine.position.set(TRACK_WIDTH / 2 - 0.25, 0.02, 0);
      rightEdgeLine.rotation.x = -Math.PI / 2;
      segmentGroup.add(rightEdgeLine);
      
      const dashLength = 8;
      const dashGap = 6;
      const dashGeometry = new THREE.PlaneGeometry(0.3, dashLength);
      for (let z = -SEGMENT_LENGTH / 2; z < SEGMENT_LENGTH / 2; z += dashLength + dashGap) {
          const dash = new THREE.Mesh(dashGeometry, lineMaterial);
          dash.position.set(0, 0.02, z);
          dash.rotation.x = -Math.PI / 2;
          segmentGroup.add(dash);
      }

      // Scenery
      const sceneryGeometry = new THREE.BoxGeometry(2, 20, 2);
      const sceneryMaterial = new THREE.MeshStandardMaterial({ color: TRACK_THEMES[theme].scenery });
      for (let i = 0; i < 10; i++) {
        const x = Math.random() < 0.5 ? TRACK_WIDTH/2 + 5 + Math.random() * 10 : -TRACK_WIDTH/2 - 5 - Math.random() * 10;
        const z = (Math.random() - 0.5) * SEGMENT_LENGTH;
        const sceneryObject = new THREE.Mesh(sceneryGeometry, sceneryMaterial);
        sceneryObject.position.set(x, 10, z);
        sceneryObject.castShadow = true;
        segmentGroup.add(sceneryObject);
      }
      
      // Position segment
      segmentGroup.position.z = segmentIndex * SEGMENT_LENGTH;
      scene.add(segmentGroup);
      return segmentGroup;
    }

    for (let i = 0; i < NUM_SEGMENTS; i++) {
        // We position segments ahead of the car's starting point
        trackSegments.push(createTrackSegment(i));
    }


    // --- EVENT LISTENERS ---
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
    const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // --- ORBIT CONTROLS LISTENERS ---
    const onPointerDown = (e: PointerEvent) => {
        if ((e.target as HTMLElement)?.closest('.pointer-events-auto')) return;
        orbitControlsRef.current.isDragging = true;
        orbitControlsRef.current.previousMousePosition.x = e.clientX;
        orbitControlsRef.current.previousMousePosition.y = e.clientY;
    };
    const onPointerUp = () => {
        orbitControlsRef.current.isDragging = false;
    };
    const onPointerMove = (e: PointerEvent) => {
        if (!orbitControlsRef.current.isDragging) return;

        const deltaX = e.clientX - orbitControlsRef.current.previousMousePosition.x;
        const deltaY = e.clientY - orbitControlsRef.current.previousMousePosition.y;

        orbitControlsRef.current.azimuthAngle -= deltaX * 0.005;
        orbitControlsRef.current.polarAngle -= deltaY * 0.005;

        // Clamp polar angle
        orbitControlsRef.current.polarAngle = Math.max(0.1, Math.min(Math.PI - 0.1, orbitControlsRef.current.polarAngle));

        orbitControlsRef.current.previousMousePosition.x = e.clientX;
        orbitControlsRef.current.previousMousePosition.y = e.clientY;
    };

    mountNode.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);


    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      if (!carRef.current) return;
      const car = carRef.current;
      const delta = clock.getDelta();
      gameTimeRef.current += delta;

      const maxSpeed = 100;
      const acceleration = 80;
      const turnSpeed = 2;
      const friction = 0.98;

      // --- MOVEMENT LOGIC ---
      let steerDirection = 0;
      if (inputRef.current.left) steerDirection = 1;
      if (inputRef.current.right) steerDirection = -1;

      if (velocityRef.current.length() > 0.1) {
        const turnAmount = steerDirection * turnSpeed * delta;
        car.rotation.y += turnAmount;
      }
      
      const forward = new THREE.Vector3();
      car.getWorldDirection(forward);
      
      let moveDirection = 0;
      if (inputRef.current.forward) moveDirection = 1;
      if (inputRef.current.backward) moveDirection = -1;

      if (moveDirection !== 0) {
        const force = forward.multiplyScalar(acceleration * moveDirection * delta);
        velocityRef.current.add(force);
      }
      
      velocityRef.current.multiplyScalar(friction);
      
      if (velocityRef.current.length() > maxSpeed) {
          velocityRef.current.normalize().multiplyScalar(maxSpeed);
      }
      
      car.position.add(velocityRef.current.clone().multiplyScalar(delta));

      // Rotate wheels
      const wheelRotationSpeed = velocityRef.current.length() * delta * 2;
      wheels.forEach(wheel => {
          wheel.rotation.x -= wheelRotationSpeed;
      });
      // Steer front wheels
      const steerAngle = steerDirection * 0.4; // Max steer angle
      wheels[0].rotation.y = steerAngle;
      wheels[1].rotation.y = steerAngle;

      // --- CAMERA LOGIC ---
      if (orbitControlsRef.current.isDragging) {
        // Orbit control logic
        const radius = 10;
        cameraOffsetRef.current.x = radius * Math.sin(orbitControlsRef.current.polarAngle) * Math.sin(orbitControlsRef.current.azimuthAngle);
        cameraOffsetRef.current.y = radius * Math.cos(orbitControlsRef.current.polarAngle);
        cameraOffsetRef.current.z = radius * Math.sin(orbitControlsRef.current.polarAngle) * Math.cos(orbitControlsRef.current.azimuthAngle);
        
        camera.position.copy(car.position).add(cameraOffsetRef.current);
        camera.lookAt(car.position);
      } else {
        // Default follow camera
        const defaultOffset = new THREE.Vector3(0, 5, -10);
        // Slowly revert to car's rotation for follow cam
        const targetAzimuth = car.rotation.y + Math.PI;
        orbitControlsRef.current.azimuthAngle += (targetAzimuth - orbitControlsRef.current.azimuthAngle) * 0.05;
        orbitControlsRef.current.polarAngle += (Math.PI / 3 - orbitControlsRef.current.polarAngle) * 0.05;

        const radius = 10;
        cameraOffsetRef.current.x = radius * Math.sin(orbitControlsRef.current.polarAngle) * Math.sin(orbitControlsRef.current.azimuthAngle);
        cameraOffsetRef.current.y = radius * Math.cos(orbitControlsRef.current.polarAngle);
        cameraOffsetRef.current.z = radius * Math.sin(orbitControlsRef.current.polarAngle) * Math.cos(orbitControlsRef.current.azimuthAngle);
        
        const idealOffset = defaultOffset.applyQuaternion(car.quaternion);
        const interpolatedOffset = cameraOffsetRef.current.clone().lerp(idealOffset, 0.1);

        camera.position.copy(car.position).add(interpolatedOffset);
        camera.lookAt(car.position);
      }


      // --- INFINITE TRACK LOGIC ---
      const carSegmentIndex = Math.floor(car.position.z / SEGMENT_LENGTH);
      trackSegments.forEach(segment => {
        const segmentZ = segment.position.z;
        // If a segment is far behind the car, move it to the front
        if(segmentZ < car.position.z - SEGMENT_LENGTH) {
          segment.position.z += TRACK_LENGTH;
        }
      });
      
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
        speed: velocityRef.current.length() * 3.6, // Convert m/s to km/h
        time: gameTimeRef.current,
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
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      
      if (mountNode) {
          mountNode.removeEventListener('pointerdown', onPointerDown);
          // Check if the renderer's DOM element is still a child of mountNode
          if (renderer.domElement.parentNode === mountNode) {
              mountNode.removeChild(renderer.domElement);
          }
      }
      
      // Dispose of Three.js objects
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
             // If material is an array
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      renderer.dispose();
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
        {isReady && (
          <Hud
            speed={gameData.speed}
            time={gameData.time}
            onAcceleratorPress={() => (inputRef.current.forward = true)}
            onAcceleratorRelease={() => (inputRef.current.forward = false)}
            onSteerLeftPress={() => (inputRef.current.left = true)}
            onSteerLeftRelease={() => (inputRef.current.left = false)}
            onSteerRightPress={() => (inputRef.current.right = true)}
            onSteerRightRelease={() => (inputRef.current.right = false)}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
