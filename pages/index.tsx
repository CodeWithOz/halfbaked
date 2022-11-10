import Head from 'next/head'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Half-Baked Thoughts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <section className='flex justify-center py-3 2xl:py-7 bg-amber-600 text-amber-900 shadow-full shadow-amber-900 items-center text-xl lg:text-3xl 2xl:text-6xl font-bold'>
          <h1>
            Books I've read
          </h1>
        </section>
      </main>
    </div>
  )
}
