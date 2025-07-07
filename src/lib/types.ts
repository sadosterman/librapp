export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description?: string;
  coverImageUrl: string;
  status: 'owned' | 'wishlist';
};
