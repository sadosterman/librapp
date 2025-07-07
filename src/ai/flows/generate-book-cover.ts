'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate book cover images based on book information.
 *
 * - generateBookCover - A function that takes book details and returns a cover image URL.
 * - GenerateBookCoverInput - The input type for the generateBookCover function.
 * - GenerateBookCoverOutput - The return type for the generateBookCover function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBookCoverInputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
  isbn: z.string().describe('The ISBN of the book.'),
});
export type GenerateBookCoverInput = z.infer<typeof GenerateBookCoverInputSchema>;

const GenerateBookCoverOutputSchema = z.object({
  coverImageUrl: z.string().describe('The URL of the generated book cover image.'),
});
export type GenerateBookCoverOutput = z.infer<typeof GenerateBookCoverOutputSchema>;

export async function generateBookCover(input: GenerateBookCoverInput): Promise<GenerateBookCoverOutput> {
  return generateBookCoverFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookCoverPrompt',
  input: {schema: GenerateBookCoverInputSchema},
  output: {schema: GenerateBookCoverOutputSchema},
  prompt: `Generate a book cover image based on the following information:

Title: {{{title}}}
Author: {{{author}}}
ISBN: {{{isbn}}}

The image should be visually appealing and relevant to the book's content.`,
});

const generateBookCoverFlow = ai.defineFlow(
  {
    name: 'generateBookCoverFlow',
    inputSchema: GenerateBookCoverInputSchema,
    outputSchema: GenerateBookCoverOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a book cover image based on the following information:\n\nTitle: ${input.title}\nAuthor: ${input.author}\nISBN: ${input.isbn}\n\nThe image should be visually appealing and relevant to the book's content.`, // simple prompt
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    return {coverImageUrl: media.url!};
  }
);
