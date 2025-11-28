import GameWrapper from '@/components/game/game-wrapper';

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-background text-foreground">
      <h1 className="sr-only">Velocity 3D</h1>
      <GameWrapper />
    </main>
  );
}
