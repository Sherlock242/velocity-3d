import type { AiOpponentProfileOutput } from '@/ai/flows/generate-ai-opponent-profiles.flow';

export type TrackTheme = 'Forest' | 'Desert' | 'City';

export type OpponentProfile = AiOpponentProfileOutput['profiles'][0];

export type ControlMode = 'car' | 'person';

export type Gear = 1 | 2 | 3;
