'use server';
/**
 * @fileOverview This file defines a Genkit flow for adaptive race penalty assessment.
 *
 * The flow analyzes player driving behavior and applies penalties for rule violations.
 * Exported functions:
 * - assessRacePenalty: Assesses and applies race penalties based on driving behavior.
 * Exported types:
 * - AssessRacePenaltyInput: Input type for the assessRacePenalty function.
 * - AssessRacePenaltyOutput: Output type for the assessRacePenalty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessRacePenaltyInputSchema = z.object({
  lapTime: z.number().describe('The player’s lap time in seconds.'),
  trackPosition: z.string().describe('A description of the player’s position on the track. Include whether the player is on or off the track, and if off, how far off the track.'),
  speed: z.number().describe('The player’s speed in km/h.'),
  penaltiesApplied: z.string().optional().describe('A description of penalties already applied this race.'),
});
export type AssessRacePenaltyInput = z.infer<typeof AssessRacePenaltyInputSchema>;

const AssessRacePenaltyOutputSchema = z.object({
  penalty: z.string().describe('A description of any penalty to apply, or an empty string if no penalty is warranted.'),
  reason: z.string().describe('The reason for the penalty, if any, or an empty string if no penalty is warranted.'),
});
export type AssessRacePenaltyOutput = z.infer<typeof AssessRacePenaltyOutputSchema>;

export async function assessRacePenalty(input: AssessRacePenaltyInput): Promise<AssessRacePenaltyOutput> {
  return assessRacePenaltyFlow(input);
}

const assessRacePenaltyPrompt = ai.definePrompt({
  name: 'assessRacePenaltyPrompt',
  input: {schema: AssessRacePenaltyInputSchema},
  output: {schema: AssessRacePenaltyOutputSchema},
  prompt: `You are a racing steward assessing penalties for a racing game.

  The player has completed a lap with the following characteristics:
  - Lap time: {{{lapTime}}} seconds
  - Track position: {{{trackPosition}}}
  - Speed: {{{speed}}} km/h
  - Penalties Applied: {{{penaltiesApplied}}}

  Assess whether the player should receive a penalty. Consider track position, speed, and lap time relative to reasonable values for the track.

  Return a penalty if the player has cut a corner, gained an unfair advantage, or otherwise violated track rules.
  If a penalty is warranted, describe the penalty and the reason for the penalty. If no penalty is warranted, the penalty and reason should be empty strings.

  {{output.schema}}
  `,
});

const assessRacePenaltyFlow = ai.defineFlow(
  {
    name: 'assessRacePenaltyFlow',
    inputSchema: AssessRacePenaltyInputSchema,
    outputSchema: AssessRacePenaltyOutputSchema,
  },
  async input => {
    const {output} = await assessRacePenaltyPrompt(input);
    return output!;
  }
);
