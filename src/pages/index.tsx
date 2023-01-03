/* eslint-disable unicorn/prefer-module */
import { type NextPage } from 'next'
import Head from 'next/head'

import { Button } from '~/components/button'
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
      <main className='flex min-h-screen flex-col items-center justify-center gap-5 bg-primary-50'>
        <div className='flex flex-wrap gap-3'>
          <Button>Primary Button</Button>
          <Button isLoading>Primary Button</Button>
          <Button disabled>Primary Button</Button>
        </div>
        <div className='flex flex-wrap gap-3'>
          <Button variant='secondary'>Secondary button</Button>
          <Button variant='secondary' isLoading>
            Secondary button
          </Button>
          <Button variant='secondary' disabled>
            Secondary button
          </Button>
        </div>
        <div className='flex flex-wrap gap-3'>
          <Button variant='bad'>Error Button</Button>
          <Button variant='bad' isLoading>
            Error Button
          </Button>
          <Button variant='bad' disabled>
            Error Button
          </Button>
        </div>
        {/* <Button variant='secondary' isLoading>
          Secondary button
        </Button>
        <Button variant='bad' isLoading>
          Error Button
        </Button> */}
      </main>
    </>
  )
}

export default Home
