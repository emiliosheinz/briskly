import { type NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Briskly</title>
        <meta name='description' content='The perfect Flashcards app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex flex-col items-center'>
        <h1>Home Page</h1>
        <h2>Under Development!</h2>
      </div>
    </>
  )
}

export default Home
