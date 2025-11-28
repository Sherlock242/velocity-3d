import type { AiOpponentProfileOutput } from '@/ai/flows/generate-ai-opponent-profiles.flow';

export type TrackTheme = 'Forest' | 'Desert' | 'City';

export type OpponentProfile = AiOpponentProfileOutput['profiles'][0];
