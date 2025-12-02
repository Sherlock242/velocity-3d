'use client';

import { ArrowLeft, ArrowRight, ChevronUp, Zap, ToyBrick, Car, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MiniMap from './mini-map';
import { Button } from '../ui/button';

type ControlMode = 'car' | 'person';

type HudProps = {
  speed: number;
  carPosition: { x: number; z: number };
  carRotation: number;
  gridSize: number;
  totalGridWidth: number;
  controlMode: ControlMode;
  onToggleControlMode: () => void;
  onToggleLargeMap: () => void;
  onAcceleratorPress: () => void;
  onAcceleratorRelease: () => void;
  onSteerLeftPress: () => void;
  onSteerLeftRelease: () => void;
  onSteerRightPress: () => void;
  onSteerRightRelease: () => void;
  isTopDownView: boolean;
  onExitTopDownView: () => void;
};

export default function Hud({
  speed,
  carPosition,
  carRotation,
  gridSize,
  totalGridWidth,
  controlMode,
  onToggleControlMode,
  onToggleLargeMap,
  onAcceleratorPress,
  onAcceleratorRelease,
  onSteerLeftPress,
  onSteerLeftRelease,
  onSteerRightPress,
  onSteerRightRelease,
  isTopDownView,
  onExitTopDownView,
}: HudProps) {
  return (
    <div className="absolute inset-0 pointer-events-none text-accent">
      {/* Speedometer */}
      <div className="absolute top-4 right-4">
        <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-accent" />
              <div className="text-right">
                <p className="text-2xl font-bold font-headline">
                  {Math.round(speed)}
                </p>
                <p className="text-xs text-accent/80">KM/H</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Mode */}
      <div className="absolute bottom-28 left-4 pointer-events-auto">
        <Button onClick={onToggleControlMode} variant="outline" size="icon" className='bg-card/50 backdrop-blur-sm border-accent/20 w-14 h-14'>
          {controlMode === 'car' ? <Car /> : <ToyBrick />}
        </Button>
      </div>

      {isTopDownView && (
        <div className="absolute top-4 right-1/2 translate-x-1/2 pointer-events-auto">
          <Button onClick={onExitTopDownView} variant="destructive">
            <X className="mr-2" /> Exit Top-Down View
          </Button>
        </div>
      )}


      {/* Minimap */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <button onClick={onToggleLargeMap}>
          <Card className="bg-card/50 backdrop-blur-sm border-accent/20 overflow-hidden hover:border-accent transition-colors">
            <CardContent className="p-0">
              <MiniMap
                carPosition={carPosition}
                carRotation={carRotation}
                gridSize={gridSize}
                totalGridWidth={totalGridWidth}
              />
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Touch Controls */}
      <div className="absolute bottom-4 left-4 flex items-end gap-2 pointer-events-auto">
        <button
          onMouseDown={onSteerLeftPress}
          onMouseUp={onSteerLeftRelease}
          onTouchStart={onSteerLeftPress}
          onTouchEnd={onSteerLeftRelease}
          className="w-20 h-20 bg-card/50 backdrop-blur-sm border-accent/20 rounded-lg flex justify-center items-center text-accent active:bg-accent/20 transition-colors"
        >
          <ArrowLeft className="w-10 h-10" />
        </button>
        <button
          onMouseDown={onSteerRightPress}
          onMouseUp={onSteerRightRelease}
          onTouchStart={onSteerRightPress}
          onTouchEnd={onSteerRightRelease}
          className="w-20 h-20 bg-card/50 backdrop-blur-sm border-accent/20 rounded-lg flex justify-center items-center text-accent active:bg-accent/20 transition-colors"
        >
          <ArrowRight className="w-10 h-10" />
        </button>
      </div>
      <div className="absolute bottom-4 right-4 flex items-end gap-2 pointer-events-auto">
        <button
          onMouseDown={onAcceleratorPress}
          onMouseUp={onAcceleratorRelease}
          onTouchStart={onAcceleratorPress}
          onTouchEnd={onAcceleratorRelease}
          className="w-20 h-28 bg-card/50 backdrop-blur-sm border-accent/20 rounded-lg flex flex-col justify-center items-center text-accent active:bg-accent/20 transition-colors"
        >
          <ChevronUp className="w-10 h-10" />
          <span className="font-bold text-sm">GAS</span>
        </button>
      </div>
    </div>
  );
}
