import Head from 'next/head'
import Shelf from '../components/Shelf'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Half-Baked Thoughts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <section className='flex justify-center items-center py-3 2xl:py-7 bg-[var(--color-shelf-top-section)] text-amber-900 relative z-10 text-xl lg:text-3xl 2xl:text-6xl font-bold'>
          <h1>
            My Book Shelf
          </h1>
        </section>
        <section>
          <Shelf>
            {[1, 2, 3, 4, 5, 6].map((book) => (<div className='h-32 w-24 bg-slate-200 shadow shadow-black' key={book}>Book {book}</div>))}
          </Shelf>
        </section>
        <section>
          <Shelf>
            {[1, 2, 3, 4, 5, 6].map((book) => (<div className='h-32 w-24 bg-slate-200 shadow shadow-black' key={book}>Book {book}</div>))}
          </Shelf>
        </section>
      </main>
    </div>
  )
}
