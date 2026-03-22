import { ROAD_WIDTH, CELL_SIZE } from '@/lib/game-constants';
import type { GameState } from '../core/state';

export function checkTrackAndPenalties(gameState: GameState, toast: (options: { title: string; description: string; variant: 'destructive' }) => void) {
    const { playerRef, velocityRef, wasOffTrackRef, penaltyCheckCooldownRef } = gameState;
    if (!playerRef.current) return;
    
    const halfTotalWidth = (CELL_SIZE * 5) / 2;
    const currentRoadXIndex = Math.round((playerRef.current.position.x + halfTotalWidth) / CELL_SIZE);
    const currentRoadZIndex = Math.round((playerRef.current.position.z + halfTotalWidth) / CELL_SIZE);
    const nearestRoadX = currentRoadXIndex * CELL_SIZE - halfTotalWidth;
    const nearestRoadZ = currentRoadZIndex * CELL_SIZE - halfTotalWidth;
    const onHorizontalRoad = Math.abs(playerRef.current.position.z - nearestRoadZ) < ROAD_WIDTH / 2;
    const onVerticalRoad = Math.abs(playerRef.current.position.x - nearestRoadX) < ROAD_WIDTH / 2;
    const isOffTrack = !(onHorizontalRoad || onVerticalRoad);

    if (isOffTrack) {
        wasOffTrackRef.current = true;
        // Slow down the vehicle when off-road
        velocityRef.current.multiplyScalar(0.95);
    }
    
    if (!isOffTrack && wasOffTrackRef.current && !penaltyCheckCooldownRef.current) {
        wasOffTrackRef.current = false;
        penaltyCheckCooldownRef.current = true;
        setTimeout(() => (penaltyCheckCooldownRef.current = false), 5000);
        
        // AI Penalty assessment removed.
    }
}
