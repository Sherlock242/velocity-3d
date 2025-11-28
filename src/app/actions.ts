'use server';

import {
  assessRacePenalty,
  type AssessRacePenaltyInput,
} from '@/ai/flows/adaptive-race-penalty.flow';
import { generateAiOpponentProfiles } from '@/ai/flows/generate-ai-opponent-profiles.flow';

export async function handleGenerateOpponents() {
  try {
    const result = await generateAiOpponentProfiles({
      prompt:
        'Generate 3 opponent profiles for a futuristic racing game. One should be a cautious beginner, one a balanced intermediate, and one an aggressive expert.',
    });
    return result.profiles;
  } catch (error) {
    console.error('Error generating opponent profiles:', error);
    return [];
  }
}

export async function handleAssessPenalty(input: AssessRacePenaltyInput) {
  try {
    const result = await assessRacePenalty(input);
    return result;
  } catch (error) {
    console.error('Error assessing penalty:', error);
    return { penalty: '', reason: 'Error assessing penalty' };
  }
}
