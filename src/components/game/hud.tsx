'use client';

import { ArrowLeft, ArrowRight, ChevronUp, Zap, ToyBrick, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  onAcceleratorPress: () => void;
  onAcceleratorRelease: () => void;
  onSteerLeftPress: () => void;
  onSteerLeftRelease: () => void;
  onSteerRightPress: () => void;
  onSteerRightRelease: () => void;
};

export default function Hud({
  speed,
  carPosition,
  carRotation,
  gridSize,
  totalGridWidth,
  controlMode,
  onToggleControlMode,
  onAcceleratorPress,
  onAcceleratorRelease,
  onSteerLeftPress,
  onSteerLeftRelease,
  onSteerRightPress,
  onSteerRightRelease,
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
      <div className="absolute top-20 right-4 pointer-events-auto">
        <Button onClick={onToggleControlMode} variant="outline" size="lg" className='bg-card/50 backdrop-blur-sm border-accent/20'>
          {controlMode === 'car' ? <Car className="mr-2" /> : <ToyBrick className="mr-2" />}
          {controlMode === 'car' ? 'Mode: Car' : 'Mode: Person'}
        </Button>
      </div>


      {/* Minimap */}
      <div className="absolute top-4 left-4">
        <Card className="bg-card/50 backdrop-blur-sm border-accent/20 overflow-hidden">
          <CardContent className="p-0">
            <MiniMap
              carPosition={carPosition}
              carRotation={carRotation}
              gridSize={gridSize}
              totalGridWidth={totalGridWidth}
            />
          </CardContent>
        </Card>
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

    