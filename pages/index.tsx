import Head from 'next/head'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Half-Baked Thoughts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <section className='flex justify-content-end align-items-start text-3xl font-bold underline'>
          <h1>
            Books I've read
          </h1>
        </section>
      </main>
    </div>
  )
}
