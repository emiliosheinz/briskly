/* eslint-disable unicorn/prefer-module */
import { type NextPage } from 'next'
import Head from 'next/head'

import { Button } from '~/components/button'
import { Header } from '~/components/header'
import { Input } from '~/components/input'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Briskly</title>
        <meta name='description' content='The perfect Flashcards app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Header />
      <main className='flex min-h-screen flex-col items-center justify-center gap-2 bg-primary-50 p-2'>
        <h1>Home Page</h1>
        <h2>Under Development</h2>
      </main>
    </>
  )
}

export default Home
