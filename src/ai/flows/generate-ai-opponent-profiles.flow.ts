'use server';
/**
 * @fileOverview Generates AI opponent profiles with varying skill levels and driving styles from natural language prompts.
 *
 * - generateAiOpponentProfiles - A function that generates AI opponent profiles.
 * - AiOpponentProfileInput - The input type for the generateAiOpponentProfiles function.
 * - AiOpponentProfileOutput - The return type for the generateAiOpponentProfiles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiOpponentProfileInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A natural language prompt describing the desired AI opponent profiles, including skill levels and driving styles.'
    ),
});
export type AiOpponentProfileInput = z.infer<typeof AiOpponentProfileInputSchema>;

const AiOpponentProfileOutputSchema = z.object({
  profiles: z
    .array(
      z.object({
        skillLevel: z.string().describe('The skill level of the AI opponent.'),
        drivingStyle: z.string().describe('The driving style of the AI opponent.'),
        description: z.string().describe('A detailed description of the AI opponent.'),
      })
    )
    .describe('An array of AI opponent profiles.'),
});
export type AiOpponentProfileOutput = z.infer<typeof AiOpponentProfileOutputSchema>;

export async function generateAiOpponentProfiles(input: AiOpponentProfileInput): Promise<AiOpponentProfileOutput> {
  return generateAiOpponentProfilesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiOpponentProfilesPrompt',
  input: {schema: AiOpponentProfileInputSchema},
  output: {schema: AiOpponentProfileOutputSchema},
  prompt: `You are an AI game designer specializing in creating AI opponent profiles for racing games.

  Based on the provided prompt, generate a diverse set of AI opponent profiles with varying skill levels, driving styles, and descriptions.

  The output should be a JSON array of AI opponent profiles, each with the following fields:
  - skillLevel: The skill level of the AI opponent (e.g., beginner, intermediate, advanced, expert).
  - drivingStyle: The driving style of the AI opponent (e.g., aggressive, defensive, balanced, erratic).
  - description: A detailed description of the AI opponent, including their strengths, weaknesses, and preferred racing tactics.

  Prompt: {{{prompt}}}`,
});

const generateAiOpponentProfilesFlow = ai.defineFlow(
  {
    name: 'generateAiOpponentProfilesFlow',
    inputSchema: AiOpponentProfileInputSchema,
    outputSchema: AiOpponentProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
