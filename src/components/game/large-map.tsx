'use client';

import { useState } from 'react';
import { Eye, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type LargeMapProps = {
  gridSize: number;
  onSetTopDownView: (sector: number) => void;
  onTeleport: (sector: number) => void;
  onClose: () => void;
};

export default function LargeMap({
  gridSize,
  onSetTopDownView,
  onTeleport,
  onClose,
}: LargeMapProps) {
  const [selectedSector, setSelectedSector] = useState<number | null>(null);

  const handleSectorClick = (sectorNumber: number) => {
    setSelectedSector(sectorNumber);
  };

  const handleTopView = () => {
    if (selectedSector !== null) {
      onSetTopDownView(selectedSector);
    }
    setSelectedSector(null);
  };

  const handleTeleport = () => {
    if (selectedSector !== null) {
      onTeleport(selectedSector);
    }
    setSelectedSector(null);
  };

  const handleCloseDialog = () => {
    setSelectedSector(null);
  };

  return (
    <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center pointer-events-auto">
      <div className="relative bg-card p-4 rounded-lg shadow-2xl border-accent/20 border">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-accent"
          onClick={onClose}
        >
          <X />
        </Button>
        <h2 className="text-2xl font-bold text-center mb-4 text-primary">
          Select a Sector
        </h2>
        <div
          className="grid gap-1 bg-background p-1 rounded-md"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: 'clamp(300px, 90vw, 600px)',
            aspectRatio: '1 / 1',
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const sectorNumber = i + 1;
            return (
              <button
                key={sectorNumber}
                className="w-full h-full border border-accent/20 rounded-sm flex items-center justify-center text-accent font-bold text-xl hover:bg-accent/20 hover:text-primary transition-colors"
                onClick={() => handleSectorClick(sectorNumber)}
              >
                {sectorNumber}
              </button>
            );
          })}
        </div>
      </div>

      <AlertDialog open={selectedSector !== null} onOpenChange={handleCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sector {selectedSector}</AlertDialogTitle>
            <AlertDialogDescription>
              What would you like to do with this sector?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTopView} className='bg-secondary text-secondary-foreground hover:bg-secondary/80'>
              <Eye className="mr-2 h-4 w-4" />
              Top View
            </AlertDialogAction>
            <AlertDialogAction onClick={handleTeleport}>
              <Send className="mr-2 h-4 w-4" />
              Teleport
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
