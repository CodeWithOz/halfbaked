import { useRef, ReactFragment, useState, RefObject, FC } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Shelf, { shelfSideSpace, interBookSpace } from '../components/Shelf';
import Book from '../components/Book';
import useResizeObserver from '@react-hook/resize-observer';
import prisma from '@/lib/prisma';
import { Book as BookType, Author as AuthorType } from '@prisma/client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

async function customUpsertBook(book: BookEntry) {
  // Check if a book with the given title and authors exists
  const existingBook = await prisma.book.findFirst({
    where: {
      title: book.title,
      authors: {
        every: {
          name: { in: book.authors.map(author => author.name) } // Ensure every author in the book's authors array exists for this book
        }
      }
    }
  });

  if (existingBook) {
    // If the book exists, update it (if necessary)
    return await prisma.book.update({
      where: { id: existingBook.id },
      data: { coverUrl: book.coverUrl } // or any other fields you want to update
    });
  } else {
    // If the book doesn't exist, create it
    // This part might be more complex if you need to handle relations or other operations
    return await prisma.book.create({
      data: {
        title: book.title,
        coverUrl: book.coverUrl,
      }
    });
  }
}

async function customUpsertAuthor(author: AuthorEntry) {
  // Check if a author with the given name exists
  const existingAuthor = await prisma.author.findFirst({
    where: {
      name: author.name,
    }
  });

  if (existingAuthor) {
    // If the author exists, update it (if necessary)
    return await prisma.author.update({
      where: { id: existingAuthor.id },
      data: { name: author.name } // or any other fields you want to update
    });
  } else {
    // If the author doesn't exist, create it
    // This part might be more complex if you need to handle relations or other operations
    return await prisma.author.create({
      data: {
        name: author.name,
      }
    });
  }
}

async function upsertBooksAndAuthors(books: BookEntry[]) {
  const insertedBooks = []
  for (const book of books) {
    // Upsert the book based on title
    const upsertedBook = await customUpsertBook(book);
    insertedBooks.push(upsertedBook);

    // Iterate over the authors and associate them with the book
    for (const author of book.authors) {
      // Upsert the author based on name
      const upsertedAuthor = await customUpsertAuthor(author);

      // Associate the author with the book
      await prisma.book.update({
        where: { id: upsertedBook.id },
        data: {
          authors: {
            connect: { id: upsertedAuthor.id },
          },
        },
      });
    }
  }

  return insertedBooks;
}


const useSize = (ref: RefObject<HTMLElement>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  // update the state with the new size whenever the size changes
  useResizeObserver(ref, (entry) => setSize(entry.contentRect));
  return size;
};

// 96px is the width of the w-24 class in tailwind
// see here: https://tailwindcss.com/docs/width
const bookWidth = 96;

const renderShelves = (books: BookDetails[], shelfWidth: number): ReactFragment => {
  // get the max number of books that can fit on a shelf
  const availableSpace = shelfWidth - shelfSideSpace * 2;
  const booksPerShelf = Math.max(Math.floor(availableSpace / (bookWidth + interBookSpace)), 1);

  // split the books into shelves
  const shelves = books.reduce((acc, book, index) => {
    const shelfIndex = Math.floor(index / booksPerShelf);
    if (!acc[shelfIndex]) {
      acc[shelfIndex] = [];
    }
    acc[shelfIndex].push(book);
    return acc;
  }, [] as BookDetails[][]);

  return shelves.map((shelf: BookDetails[], i: number) => <Shelf key={`shelf-${i}`}>{shelf.map((book: BookDetails, i: number) => (<Book title={book.title} authors={book.authors} coverUrl={book.coverUrl} key={`book-${i}`}></Book>))}</Shelf>)
};

const delay = (time: number) => new Promise<void>(res => setTimeout(() => {
  res();
}, time));

export const getStaticProps: GetStaticProps = async () => {
  // const insertedBooks = await upsertBooksAndAuthors([
  //   {
  //     title: 'Manias, Panics, and Crashes (Seventh Edition)',
  //     coverUrl: 'https://halfbaked-media.s3.amazonaws.com/manias-panics-and-crashes.jpeg',
  //     authors: [
  //       {
  //         name: 'Robert Z. Aliber'
  //       },
  //       {
  //         name: 'Charles P. Kindleberger'
  //       },
  //     ]
  //   },
  //   {
  //     title: 'Story',
  //     coverUrl: 'https://halfbaked-media.s3.amazonaws.com/story.jpeg',
  //     authors: [
  //       {
  //         name: 'Robert McKee'
  //       },
  //     ]
  //   },
  //   {
  //     title: 'The Steal Like an Artist Audio Trilogy',
  //     coverUrl: 'https://halfbaked-media.s3.amazonaws.com/the-steal-like-an-artist-audio-trilogy.jpeg',
  //     authors: [
  //       {
  //         name: 'Austin Kleon'
  //       },
  //     ]
  //   },
  // ]);
  // console.log('insertedBooks', insertedBooks)
  const books = await prisma.book.findMany({
    include: {
      authors: true
    },
    orderBy: [
      {
        finishedOn: 'desc'
      }
    ]
  });

  return {
    props: { books: JSON.parse(JSON.stringify(books)) },
    revalidate: 10,
  };
};

const Home: FC<Props> = ({ books }) => {
  const ref = useRef<HTMLElement>(null);
  const shelfSize = useSize(ref);

  const [selectedDateRange, setSelectedDateRange] = useState<[Date, Date] | null>(getDefaultDateRange());

  function getDefaultDateRange(): [Date, Date] {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of the current year
    const endDate = new Date(currentYear, 11, 31); // December 31st of the current year
    return [startDate, endDate];
  }

  const [showDatePicker, setShowDatePicker] = useState(false);

  function handleDateRangeChange(dates: [Date, Date] | null) {
    setSelectedDateRange(dates);
    // Close the date picker after selection or clearing the choice, else keep it open
    setShowDatePicker(dates.filter(date => date !== null).length == 1);
  }

  // Filter the books based on the selected date range
  const filteredBooks = selectedDateRange && selectedDateRange.filter(date => date !== null).length === 2
    ? books.filter(book => {
      const finishedOn = new Date(book.finishedOn);
      const [startDate, endDate] = selectedDateRange;
      return finishedOn >= startDate && finishedOn <= endDate;
    })
    : books;

  return (
    <div>
      <Head>
        <title>Half-Baked Thoughts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main ref={ref} className="flex flex-col min-h-screen">
        <section className='flex justify-center items-center py-3 2xl:py-7 bg-[var(--color-shelf-top-section)] text-amber-900 relative z-10 text-xl lg:text-3xl 2xl:text-6xl font-bold'>
          <h1>
            My Book Shelf
          </h1>
          <button onClick={() => setShowDatePicker(!showDatePicker)} className="bg-[var(--color-shelf-side-panel)] rounded p-2 shadow-md absolute right-2">
            🗓️
          </button>
        </section>
        {showDatePicker && (
          <div className={`flex justify-center items-center py-3 bg-[var(--color-shelf-side-panel)] border border-[var(--color-shelf-top-section)]`}>
            <DatePicker
              className={"bg-[var(--color-shelf-side-panel)] px-8"}
              selected={selectedDateRange ? selectedDateRange[0] : null}
              startDate={selectedDateRange ? selectedDateRange[0] : null}
              endDate={selectedDateRange ? selectedDateRange[1] : null}
              onChange={dates => handleDateRangeChange(dates as [Date, Date])}
              selectsRange
              isClearable
              placeholderText="Select date range"
            />
          </div>
        )}
        <>
          {renderShelves(filteredBooks, shelfSize.width)}
        </>
        <section className='grow bg-[var(--color-shelf-bottom-panel-front)]'></section>
      </main>
    </div>
  );
};

export default Home;

type Props = {
  books: BookDetails[];
};

interface BookDetails extends Omit<BookType, 'finishedOn'> {
  finishedOn: string;
  authors: AuthorType[];
}

interface AuthorEntry { name: string }
interface BookEntry { title: string, coverUrl: string, authors: AuthorEntry[] }