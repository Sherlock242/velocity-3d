'use client';

import * as React from 'react';
import GameWrapper from '@/components/game/game-wrapper';
import GameLobby from '@/components/game/game-lobby';

export default function Home() {
  const [isGameStarted, setIsGameStarted] = React.useState(false);

  if (!isGameStarted) {
    return <GameLobby onStartGame={() => setIsGameStarted(true)} />;
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-background text-foreground">
      <h1 className="sr-only">Velocity 3D</h1>
      <GameWrapper />
    </main>
  );
}
