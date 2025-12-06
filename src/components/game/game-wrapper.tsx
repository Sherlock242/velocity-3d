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
import type { TrackTheme, Gear } from '@/lib/types';
import Hud from './hud';
import AiOpponentGenerator from './ai-opponent-generator';
import LargeMap from './large-map';
import { TRACK_THEMES, GRID_SIZE, TOTAL_GRID_WIDTH } from '@/lib/game-constants';
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

  const handleToggleControlMode = () => {
    if (gameState.isTransformingRef.current) return;
    gameState.isTransformingRef.current = true;
    gameState.controlModeRef.current = gameState.controlModeRef.current === 'car' ? 'person' : 'car';
    setGameData(prev => ({ ...prev, controlMode: gameState.controlModeRef.current }));
  };

  const handleGearChange = () => {
    let newGear = (gameState.gearRef.current + 1) as Gear;
    if (newGear > 3) newGear = 1;
    gameState.gearRef.current = newGear;
    setGameData(prev => ({ ...prev, gear: newGear }));
  };

  const handleSectorSelect = (sector: number) => {
    setTopDownSector(sector);
    setIsLargeMapOpen(false);
  };


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

    const onKeyDown = (e: KeyboardEvent) => {
      initAudio(gameState);
      if (e.key === 'ArrowUp' || e.key === 'w') gameState.inputRef.current.forward = true;
      if (e.key === 'ArrowDown' || e.key === 's') gameState.inputRef.current.backward = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.inputRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.inputRef.current.right = true;
      if (e.key === 'e' || e.key === 'E') {
        handleToggleControlMode();
      }
      if (e.key === 'f' || e.key === 'F') {
        handleGearChange();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') gameState.inputRef.current.forward = false;
      if (e.key === 'ArrowDown' || e.key === 's') gameState.inputRef.current.backward = false;
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.inputRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.inputRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);


    createWorld(scene, theme, gameState);

    const animate = createAnimationLoop(scene, camera, renderer, gameState, toast, setGameData, topDownSector);

    animate();
    setIsReady(true);

    // --- CLEANUP ---
    return () => {
      if (gameState.animationFrameIdRef.current) {
        cancelAnimationFrame(gameState.animationFrameIdRef.current);
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);

      if (mountNode) {
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
            onSectorSelect={handleSectorSelect}
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
            isTopDownView={topDownSector !== null}
            onExitTopDownView={() => setTopDownSector(null)}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
