import { type NextPage } from 'next'
import Head from 'next/head'

import { Header } from '~/components/header'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Briskly</title>
        <meta name='description' content='The perfect Flashcards app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Header />
      <main className='flex min-h-screen flex-col items-center justify-center bg-primary-50'>
        <h1>Under Development</h1>
      </main>
    </>
  )
}

export default Home
