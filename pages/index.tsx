import { useRef, ReactFragment, useState, RefObject, FC } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Shelf, { shelfSideSpace, interBookSpace } from '../components/Shelf'
import Book from '../components/Book'
import useResizeObserver from '@react-hook/resize-observer'
import prisma from '@/lib/prisma'
import { Book as BookType, Author as AuthorType } from '@prisma/client'

const useSize = (ref: RefObject<HTMLElement>) => {
  const [size, setSize] = useState({ width: 0, height: 0 })

  // update the state with the new size whenever the size changes
  useResizeObserver(ref, (entry) => setSize(entry.contentRect))
  return size
}

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
}

const delay = time => new Promise(res => setTimeout(() => {
  res(time);
}, time))

export const getStaticProps: GetStaticProps = async () => {
  let counter = 0
  // update/insert authors and books
  // for (let {bookId, authorIds} of [
  //   {
  //     bookId: 63,
  //     authorIds: [82],
  //   },
  // ]) {
  //   counter += 1
  //   await delay(100 * counter)
  //   prisma.book.update({
  //     where: {
  //       id: bookId,
  //     },
  //     data: {
  //       authors: {
  //         connect: authorIds.map(id => ({ id: id }))
  //       },
  //     },
  //   }).then(res => {
  //     console.log(`outcome of updating ${bookId} with ${authorIds}:`, res)
  //   }).catch(err => {
  //     console.error(`error while updating ${bookId} with ${authorIds}:`, err)
  //   })
  // }
  // const insertedAuthors = await prisma.author.createMany({
  //   data: [
  //     {
  //       name: 'Sun Tzu',
  //     },
  //   ],
  //   skipDuplicates: true
  // })
  // console.log('insertedAuthors', insertedAuthors)
  const books = await prisma.book.findMany({
    include: {
      authors: true
    },
    orderBy: [
      {
        finishedOn: 'desc'
      }
    ]
  })

  return {
    props: { books: JSON.parse(JSON.stringify(books)) },
    revalidate: 10,
  };
}

const Home: FC<Props> = ({ books }) => {
  const ref = useRef<HTMLElement>(null);
  const shelfSize = useSize(ref);

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
        </section>
        <>
          {renderShelves(books, shelfSize.width)}
        </>
        <section className='grow bg-[var(--color-shelf-bottom-panel-front)]'></section>
      </main>
    </div>
  )
}

export default Home

type Props = {
  books: BookDetails[]
}

interface BookDetails extends Omit<BookType, 'finishedOn'> {
  finishedOn: string
  authors: AuthorType[]
}