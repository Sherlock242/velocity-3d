'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type HudProps = {
  speed: number;
  time: number;
  onAcceleratorPress: () => void;
  onAcceleratorRelease: () => void;
};

export default function Hud({
  speed,
  time,
  onAcceleratorPress,
  onAcceleratorRelease,
}: HudProps) {
  const formattedTime = (t: number) => {
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60);
    const milliseconds = Math.floor((t * 100) % 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none text-accent">
      {/* Speedometer */}
      <div className="absolute top-4 right-4">
        <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Zap className="w-8 h-8 text-accent" />
              <div className="text-right">
                <p className="text-4xl font-bold font-headline">
                  {Math.round(speed)}
                </p>
                <p className="text-sm text-accent/80">KM/H</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timer */}
      <div className="absolute top-4 left-4">
        <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
          <CardContent className="p-4">
            <p className="text-4xl font-bold font-headline">
              {formattedTime(time)}
            </p>
            <p className="text-sm text-accent/80">RACE TIME</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4">
        <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
          <CardContent className="p-4">
            <p className="font-bold text-lg mb-2 text-center">CONTROLS</p>
            <div className="flex justify-center items-center gap-2">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <div className="border border-accent rounded p-2 flex justify-center items-center">
                  <ArrowUp className="w-5 h-5" />
                </div>
                <div />
                <div className="border border-accent rounded p-2 flex justify-center items-center">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <div className="border border-accent rounded p-2 flex justify-center items-center">
                  <ArrowDown className="w-5 h-5" />
                </div>
                <div className="border border-accent rounded p-2 flex justify-center items-center">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accelerator */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <button
          onMouseDown={onAcceleratorPress}
          onMouseUp={onAcceleratorRelease}
          onTouchStart={onAcceleratorPress}
          onTouchEnd={onAcceleratorRelease}
          className="w-24 h-32 bg-card/50 backdrop-blur-sm border-accent/20 rounded-lg flex flex-col justify-center items-center text-accent active:bg-accent/20 transition-colors"
        >
          <ChevronUp className="w-12 h-12" />
          <span className="font-bold">GAS</span>
        </button>
      </div>
    </div>
  );
}
