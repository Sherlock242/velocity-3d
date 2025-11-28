'use client';

import {
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type HudProps = {
  speed: number;
  time: number;
  onAcceleratorPress: () => void;
  onAcceleratorRelease: () => void;
  onSteerLeftPress: () => void;
  onSteerLeftRelease: () => void;
  onSteerRightPress: () => void;
  onSteerRightRelease: () => void;
};

export default function Hud({
  speed,
  time,
  onAcceleratorPress,
  onAcceleratorRelease,
  onSteerLeftPress,
  onSteerLeftRelease,
  onSteerRightPress,
  onSteerRightRelease,
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

      {/* Timer */}
      <div className="absolute top-4 left-4">
        <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
          <CardContent className="p-2">
            <p className="text-2xl font-bold font-headline">
              {formattedTime(time)}
            </p>
            <p className="text-xs text-accent/80">RACE TIME</p>
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