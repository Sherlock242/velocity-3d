
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { Bot, Map, Settings, Loader2 } from 'lucide-react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
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
import type { TrackTheme, Gear } from '@/lib/types';
import Hud from './hud';
import AiOpponentGenerator from './ai-opponent-generator';
import LargeMap from './large-map';
import { TRACK_THEMES, GRID_SIZE, TOTAL_GRID_WIDTH, CELL_SIZE } from '@/lib/game-constants';
import { DOME_WIDTH, DOME_DEPTH, DOME_HEIGHT } from '@/lib/dome-constants';
import { useGameState, type GameState } from './core/state';
import { setupScene } from './core/scene';
import { initAudio, initAudioOnInteraction } from './core/audio';
import { createWorld } from './core/world';
import { createAnimationLoop } from './core/animation';

export default function GameWrapper() {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [theme, setTheme] = React.useState<TrackTheme>('City');
  const [gameData, setGameData] = React.useState({
    speed: 0,
    time: 0,
    carPosition: { x: 0, z: 0 },
    carRotation: 0,
    controlMode: 'car' as 'car' | 'person',
    gear: 1 as Gear,
  });
  const [isReady, setIsReady] = React.useState(false);
  const [isLargeMapOpen, setIsLargeMapOpen] = React.useState(false);
  const [topDownSector, setTopDownSector] = React.useState<number | null>(null);

  const gameState = useGameState();

  const handleToggleControlMode = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (gameState.isTransformingRef.current) return;
    gameState.isTransformingRef.current = true;
    gameState.controlModeRef.current = gameState.controlModeRef.current === 'car' ? 'person' : 'car';
    setGameData(prev => ({ ...prev, controlMode: gameState.controlModeRef.current }));
  };

  const handleGearChange = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    let newGear = (gameState.gearRef.current + 1) as Gear;
    if (newGear > 3) newGear = 1;
    gameState.gearRef.current = newGear;
    setGameData(prev => ({ ...prev, gear: newGear }));
  };

  const handleTeleport = (sector: number) => {
    const { playerRef, velocityRef } = gameState;
    if (!playerRef.current) return;

    const halfTotalWidth = TOTAL_GRID_WIDTH / 2;
    const row = Math.floor((sector - 1) / GRID_SIZE);
    const col = (sector - 1) % GRID_SIZE;
    const sectorCenterX = col * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;
    const sectorCenterZ = row * CELL_SIZE - halfTotalWidth + CELL_SIZE / 2;

    let yPos = 5; // Default ground-level height

    // Check if the teleport destination is on the dome (Sectors 21-25)
    const isDomeSector = sector >= 21 && sector <= 25;
    if (isDomeSector) {
      const roadYPosition = 0.4;
      const tilePlaneY = roadYPosition + DOME_HEIGHT + 0.2;
      
      // Sectors 21 and 22 are on the flat tiled surface
      if (sector === 21 || sector === 22) {
        yPos = tilePlaneY;
      } else {
        // Sectors 23, 24, 25 are on the curved part of the dome
        const domeCenterX = 0;
        const domeCenterZ = (4 * CELL_SIZE - halfTotalWidth) + DOME_DEPTH / 2;
        const halfDomeWidth = DOME_WIDTH / 2;
        const peakOffsetX = -0.2 * DOME_WIDTH;
        const peakNormalizedX = peakOffsetX / halfDomeWidth;
        
        let nx = (sectorCenterX - domeCenterX) / halfDomeWidth;
        const nz = (sectorCenterZ - domeCenterZ) / DOME_DEPTH / 2;

        if (nx <= peakNormalizedX) {
          nx = peakNormalizedX;
        }

        const heightXComponent = Math.cos((nx - peakNormalizedX) * (Math.PI / (2 * (1 - Math.abs(peakNormalizedX)))));
        const heightZComponent = Math.cos(nz * Math.PI / 2);
        const yOffset = DOME_HEIGHT * heightXComponent * heightZComponent;
        
        yPos = roadYPosition + yOffset + 2; // Add a small buffer to avoid clipping
      }
    }

    playerRef.current.position.set(sectorCenterX, yPos, sectorCenterZ);
    velocityRef.current.set(0, 0, 0);

    setTopDownSector(null);
    setIsLargeMapOpen(false);
  };

  const handleSetTopDownView = (sector: number) => {
    setTopDownSector(sector);
    setIsLargeMapOpen(false);
  };

  React.useEffect(() => {
    const carOffset = new THREE.Vector3(0, 2, -10);
    const personOffset = new THREE.Vector3(0, 3, -10);
    
    if (gameData.controlMode === 'person') {
        gameState.cameraOrbitRef.current.radius = personOffset.length();
        gameState.cameraOrbitRef.current.phi = Math.acos(personOffset.y / personOffset.length());
        gameState.cameraOrbitRef.current.theta = Math.atan2(personOffset.x, personOffset.z) + (Math.PI * 1.5);
    } else {
        gameState.cameraOrbitRef.current.radius = carOffset.length();
        gameState.cameraOrbitRef.current.phi = Math.acos(carOffset.y / carOffset.length());
        gameState.cameraOrbitRef.current.theta = Math.atan2(carOffset.x, carOffset.z);
    }
  }, [gameData.controlMode, gameState.cameraOrbitRef]);


  React.useEffect(() => {
    let mountNode: HTMLDivElement | null = null;
    if (mountRef.current) {
      setIsReady(false);
      mountNode = mountRef.current;
    } else {
      return;
    }

    const { scene, camera, renderer, audioListener } = setupScene(mountNode);
    gameState.audioListenerRef.current = audioListener;

    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    gltfLoader.setDRACOLoader(dracoLoader);
    gameState.gltfLoaderRef.current = gltfLoader;
    
    // Camera drag controls
    let isDragging = false;
    let dragTouchId: number | null = null;
    let previousTouch: { x: number, y: number } | null = null;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isDragging) return;

        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        gameState.cameraOrbitRef.current.theta -= deltaX * 0.005;
        gameState.cameraOrbitRef.current.phi -= deltaY * 0.005;

        // Clamp phi to prevent camera flipping below ground or too high
        gameState.cameraOrbitRef.current.phi = THREE.MathUtils.clamp(
            gameState.cameraOrbitRef.current.phi,
            0.5,
            Math.PI / 2
        );

        previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
        isDragging = false;
    };

    const handleTouchStart = (event: TouchEvent) => {
        // Only start a new drag if we aren't already dragging
        if (dragTouchId === null && event.changedTouches.length > 0) {
            const touch = event.changedTouches[0];
            dragTouchId = touch.identifier;
            isDragging = true;
            previousTouch = { x: touch.clientX, y: touch.clientY };
        }
    };

    const handleTouchMove = (event: TouchEvent) => {
        if (!isDragging || dragTouchId === null) return;

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (touch.identifier === dragTouchId) {
                if (!previousTouch) {
                    previousTouch = { x: touch.clientX, y: touch.clientY };
                    return;
                }
                const deltaX = touch.clientX - previousTouch.x;
                const deltaY = touch.clientY - previousTouch.y;

                gameState.cameraOrbitRef.current.theta -= deltaX * 0.01;
                gameState.cameraOrbitRef.current.phi -= deltaY * 0.01;

                gameState.cameraOrbitRef.current.phi = THREE.MathUtils.clamp(
                    gameState.cameraOrbitRef.current.phi,
                    0.5,
                    Math.PI / 2
                );

                previousTouch = { x: touch.clientX, y: touch.clientY };
                break;
            }
        }
    };

    const handleTouchEnd = (event: TouchEvent) => {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (touch.identifier === dragTouchId) {
                isDragging = false;
                dragTouchId = null;
                previousTouch = null;
                break;
            }
        }
    };


    const onKeyDown = (e: KeyboardEvent) => {
      initAudioOnInteraction(gameState);
      if (e.key === 'ArrowUp' || e.key === 'w') gameState.inputRef.current.forward = true;
      if (e.key === 'ArrowDown' || e.key === 's') gameState.inputRef.current.backward = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.inputRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.inputRef.current.right = true;
      if (e.code === 'Space' && !e.repeat) {
        gameState.inputRef.current.jump = true;
      }
      if ((e.key === 'e' || e.key === 'E') && !e.repeat) {
        handleToggleControlMode();
      }
      if ((e.key === 'f' || e.key === 'F') && !e.repeat) {
        if (gameState.controlModeRef.current === 'car') {
          handleGearChange();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') gameState.inputRef.current.forward = false;
      if (e.key === 'ArrowDown' || e.key === 's') gameState.inputRef.current.backward = false;
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.inputRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.inputRef.current.right = false;
      if (e.code === 'Space') {
        gameState.inputRef.current.jump = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    
    mountNode.addEventListener('mousedown', handleMouseDown);
    mountNode.addEventListener('mousemove', handleMouseMove);
    mountNode.addEventListener('mouseup', handleMouseUp);
    mountNode.addEventListener('touchstart', handleTouchStart, { passive: true });
    mountNode.addEventListener('touchmove', handleTouchMove, { passive: false });
    mountNode.addEventListener('touchend', handleTouchEnd);
    mountNode.addEventListener('touchcancel', handleTouchEnd);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);


    createWorld(scene, theme, gameState);

    const animate = createAnimationLoop(scene, camera, renderer, gameState, toast, setGameData, topDownSector);

    // A one-time check after a delay to ensure everything is loaded and ready
    // This is a workaround for ensuring the GLTF model is loaded before we consider the game "ready"
    const readyTimeout = setTimeout(() => {
      setIsReady(true);
    }, 2000);


    animate();

    // --- CLEANUP ---
    return () => {
      clearTimeout(readyTimeout);
      if (gameState.animationFrameIdRef.current) {
        cancelAnimationFrame(gameState.animationFrameIdRef.current);
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);

      if (mountNode) {
        mountNode.removeEventListener('mousedown', handleMouseDown);
        mountNode.removeEventListener('mousemove', handleMouseMove);
        mountNode.removeEventListener('mouseup', handleMouseUp);
        mountNode.removeEventListener('touchstart', handleTouchStart);
        mountNode.removeEventListener('touchmove', handleTouchMove);
        mountNode.removeEventListener('touchend', handleTouchEnd);
        mountNode.removeEventListener('touchcancel', handleTouchEnd);
        if (renderer.domElement.parentNode === mountNode) {
          mountNode.removeChild(renderer.domElement);
        }
      }

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      renderer.dispose();
      
      gameState.obstacleCarsRef.current = [];
      gameState.walkingNpcsRef.current = [];
      gameState.staticCollidersRef.current = [];
      
      gameState.tireMarksRef.current.forEach(mark => {
        scene.remove(mark.mesh);
        (mark.mesh.material as THREE.Material).dispose();
        mark.mesh.geometry.dispose();
      });
      gameState.tireMarksRef.current = [];

      if (gameState.audioListenerRef.current?.context.state !== 'closed') {
        gameState.audioListenerRef.current?.context.close();
      }
      gameState.audioInitializedRef.current = false;
    };
  }, [theme, toast, topDownSector]);


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
            Press E to transform. F to change gear.
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
        {isLargeMapOpen && (
          <LargeMap
            gridSize={GRID_SIZE}
            onSetTopDownView={handleSetTopDownView}
            onTeleport={handleTeleport}
            onClose={() => setIsLargeMapOpen(false)}
          />
        )}
        {isReady && (
          <Hud
            speed={gameData.speed}
            carPosition={gameData.carPosition}
            carRotation={gameData.carRotation}
            gridSize={GRID_SIZE}
            totalGridWidth={TOTAL_GRID_WIDTH}
            controlMode={gameData.controlMode}
            gear={gameData.gear}
            onToggleControlMode={handleToggleControlMode}
            onGearChange={handleGearChange}
            onToggleLargeMap={() => setIsLargeMapOpen(prev => !prev)}
            onAcceleratorPress={() => {
              initAudioOnInteraction(gameState);
              gameState.inputRef.current.forward = true;
            }}
            onAcceleratorRelease={() => (gameState.inputRef.current.forward = false)}
            onBrakePress={() => {
              initAudioOnInteraction(gameState);
              gameState.inputRef.current.backward = true;
            }}
            onBrakeRelease={() => (gameState.inputRef.current.backward = false)}
            onSteerLeftPress={() => {
              initAudioOnInteraction(gameState);
              gameState.inputRef.current.left = true;
            }}
            onSteerLeftRelease={() => (gameState.inputRef.current.left = false)}
            onSteerRightPress={() => {
              initAudioOnInteraction(gameState);
              gameState.inputRef.current.right = true;
            }}
            onSteerRightRelease={() => (gameState.inputRef.current.right = false)}
            onJumpPress={() => {
              initAudioOnInteraction(gameState);
              gameState.inputRef.current.jump = true;
            }}
            onJumpRelease={() => {
              gameState.inputRef.current.jump = false;
            }}
            isTopDownView={topDownSector !== null}
            onExitTopDownView={() => setTopDownSector(null)}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

    