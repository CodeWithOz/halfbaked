import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { CreateBookRequest, BookWithAuthors, ApiResponse } from '../../../types/book';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<BookWithAuthors | BookWithAuthors[]>>
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<BookWithAuthors[]>>
) {
  try {
    const books = await prisma.book.findMany({
      include: {
        authors: true,
      },
      orderBy: {
        finishedOn: 'desc',
      },
    });

    return res.status(200).json({ success: true, data: books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch books',
    });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<BookWithAuthors>>
) {
  try {
    const { title, coverUrl, finishedOn, authors } = req.body as CreateBookRequest;

    // Validate required fields
    if (!title || !coverUrl || !finishedOn || !authors || authors.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, coverUrl, finishedOn, and authors',
      });
    }

    // Create book with authors
    const book = await prisma.book.create({
      data: {
        title,
        coverUrl,
        finishedOn: new Date(finishedOn),
        authors: {
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

    return res.status(201).json({ success: true, data: book });
  } catch (error) {
    console.error('Error creating book:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create book',
    });
  }
}
