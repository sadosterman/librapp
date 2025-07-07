'use server';

import { z } from 'zod';
import { generateBookCover } from '@/ai/flows/generate-book-cover';
import type { Book } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  author: z.string().min(1, 'Author is required.'),
  isbn: z.string().min(1, 'ISBN is required.'),
  category: z.string().min(1, 'Category is required.'),
  description: z.string().optional(),
  status: z.enum(['owned', 'wishlist']),
});

export type FormState = {
    success: boolean;
    book?: Book;
    errors?: {
        title?: string[];
        author?: string[];
        isbn?: string[];
        category?: string[];
        description?: string[];
        status?: string[];
        _general?: string[];
    }
}

export async function addBookAction(prevState: FormState, formData: FormData) : Promise<FormState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const parseResult = FormSchema.safeParse(rawFormData);

  if (!parseResult.success) {
    return { success: false, errors: parseResult.error.flatten().fieldErrors };
  }

  const { title, author, isbn, category, status, description } = parseResult.data;

  try {
    const coverData = await generateBookCover({ title, author, isbn });
    
    if (!coverData || !coverData.coverImageUrl) {
        throw new Error('Failed to generate book cover.');
    }
    
    const newBook: Book = {
      id: crypto.randomUUID(),
      title,
      author,
      isbn,
      category,
      status,
      description,
      coverImageUrl: coverData.coverImageUrl,
    };
    
    revalidatePath('/');
    return { success: true, book: newBook };
  } catch (error) {
    console.error('Error in addBookAction:', error);
    return { success: false, errors: { _general: ['Failed to add book. The cover generation might have failed.'] } };
  }
}
