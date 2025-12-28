import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { UpdateBookRequest, BookWithAuthors, ApiResponse } from '../../../types/book';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<BookWithAuthors | null>>
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid book ID' });
  }

  const bookId = parseInt(id, 10);

  if (isNaN(bookId)) {
    return res.status(400).json({ success: false, error: 'Book ID must be a number' });
  }

  if (req.method === 'GET') {
    return handleGet(bookId, req, res);
  } else if (req.method === 'PUT') {
    return handlePut(bookId, req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(bookId, req, res);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(
  bookId: number,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<BookWithAuthors>>
) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        authors: true,
      },
    });

    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    return res.status(200).json({ success: true, data: book });
  } catch (error) {
    console.error('Error fetching book:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch book',
    });
  }
}

async function handlePut(
  bookId: number,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<BookWithAuthors>>
) {
  try {
    const { title, coverUrl, finishedOn, authors } = req.body as UpdateBookRequest;

    // Validate required fields
    if (!title || !coverUrl || !finishedOn || !authors || authors.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, coverUrl, finishedOn, and authors',
      });
    }

    // Update book with authors
    const book = await prisma.book.update({
      where: { id: bookId },
      data: {
        title,
        coverUrl,
        finishedOn: new Date(finishedOn),
        authors: {
          set: [], // Disconnect all current authors
          connectOrCreate: authors.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: {
        authors: true,
      },
    });

    return res.status(200).json({ success: true, data: book });
  } catch (error) {
    console.error('Error updating book:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update book',
    });
  }
}

async function handleDelete(
  bookId: number,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<null>>
) {
  try {
    await prisma.book.delete({
      where: { id: bookId },
    });

    return res.status(200).json({ success: true, data: null });
  } catch (error) {
    console.error('Error deleting book:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete book',
    });
  }
}
