'use client';

import * as React from 'react';
import GameWrapper from '@/components/game/game-wrapper';
import GameLobby from '@/components/game/game-lobby';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [isGameStarted, setIsGameStarted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleStartGame = () => {
    setIsLoading(true);
    // Give the UI a moment to render the loader before starting the heavy game load
    setTimeout(() => {
      setIsGameStarted(true);
    }, 100);
  };

  if (isLoading && !isGameStarted) {
     return (
       <div className="absolute inset-0 flex flex-col justify-center items-center bg-background z-10">
         <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
         <p className="text-xl font-headline">Starting Engine...</p>
       </div>
     );
  }

  if (!isGameStarted) {
    return <GameLobby onStartGame={handleStartGame} />;
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-background text-foreground">
      <h1 className="sr-only">Velocity 3D</h1>
      <GameWrapper />
    </main>
  );
}
