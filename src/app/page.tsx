'use client';

import * as React from 'react';
import type { Book } from '@/lib/types';
import { AddBookSheet } from '@/components/add-book-sheet';
import { BookCard } from '@/components/book-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Library, PlusCircle, BookHeart, BookMarked, ArrowDownUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type SortOption = 'title-asc' | 'title-desc' | 'author-asc' | 'author-desc';

export default function Home() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [hydrated, setHydrated] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'owned' | 'wishlist'>('owned');
  const [sortOption, setSortOption] = React.useState<SortOption>('title-asc');

  React.useEffect(() => {
    try {
      const storedBooks = localStorage.getItem('shelfwise-books');
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      }
    } catch (error) {
      console.error("Failed to parse books from localStorage", error);
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated) {
      localStorage.setItem('shelfwise-books', JSON.stringify(books));
    }
  }, [books, hydrated]);

  const handleAddBook = (newBook: Book) => {
    setBooks((prevBooks) => [...prevBooks, newBook]);
    setActiveTab(newBook.status);
  };

  const handleDeleteBook = (id: string) => {
    setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
  };
  
  const sortedBooks = React.useMemo(() => {
    return [...books].sort((a, b) => {
      switch (sortOption) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'author-asc':
          return a.author.localeCompare(b.author);
        case 'author-desc':
          return b.author.localeCompare(a.author);
        default:
          return 0;
      }
    });
  }, [books, sortOption]);

  const ownedBooks = sortedBooks.filter((book) => book.status === 'owned');
  const wishlistBooks = sortedBooks.filter((book) => book.status === 'wishlist');

  const BookGrid = ({ booksToShow }: { booksToShow: Book[] }) => {
    if (!hydrated) {
        return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-card rounded-lg shadow-md aspect-[2/3] animate-pulse" />)}
        </div>
    }
    
    if (booksToShow.length === 0) {
      return (
        <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
          <div className="flex justify-center mb-4">
            {activeTab === 'owned' ? 
              <BookMarked className="w-16 h-16 text-muted-foreground" /> :
              <BookHeart className="w-16 h-16 text-muted-foreground" />
            }
          </div>
          <h3 className="text-xl font-semibold font-headline">Your {activeTab === 'owned' ? 'collection' : 'wishlist'} is empty</h3>
          <p className="text-muted-foreground mt-2 mb-4">Add a book to get started!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {booksToShow.map((book) => (
          <BookCard key={book.id} book={book} onDelete={handleDeleteBook} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-headline tracking-tight">ShelfWise</h1>
          </div>
          <AddBookSheet onBookAdded={handleAddBook}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          </AddBookSheet>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'owned' | 'wishlist')}>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <TabsList>
              <TabsTrigger value="owned">My Collection</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            </TabsList>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ArrowDownUp className="mr-2 h-4 w-4" />
                  Sort By
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setSortOption('title-asc')}>Title (A-Z)</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortOption('title-desc')}>Title (Z-A)</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortOption('author-asc')}>Author (A-Z)</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortOption('author-desc')}>Author (Z-A)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <TabsContent value="owned">
            <BookGrid booksToShow={ownedBooks} />
          </TabsContent>
          <TabsContent value="wishlist">
            <BookGrid booksToShow={wishlistBooks} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
                Built with 📚 by an expert engineer.
            </p>
        </div>
      </footer>
    </div>
  );
}
