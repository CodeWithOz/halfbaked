import { Book, Author } from '@prisma/client';

export interface CreateBookRequest {
  title: string;
  coverUrl: string;
  finishedOn: string; // ISO date string
  authors: string[]; // array of author names
}

export interface UpdateBookRequest {
  title: string;
  coverUrl: string;
  finishedOn: string; // ISO date string
  authors: string[]; // array of author names
}

export interface BookWithAuthors extends Book {
  authors: Author[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
