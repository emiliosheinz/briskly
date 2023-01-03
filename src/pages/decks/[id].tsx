import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import Head from 'next/head'

import { Button } from '~/components/button'
import { Header } from '~/components/header'

const NEW_DECK_ID = 'new'

export const getServerSideProps: GetServerSideProps = async context => {
  if (!context.params?.id || context.params?.id !== NEW_DECK_ID) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}
const DecksCrud: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <>
      <Head>
        <title>Criar Deck</title>
        <meta
          name='description'
          content='Crie um novo Deck e comece a estudar'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Header />
      <main className='min-h-screen w-full bg-primary-50'>
        <div className='m-auto flex max-w-7xl flex-col gap-5 p-5'>
          <h1 className='text-2xl font-semibold'>Criar Deck</h1>
          <div className='h-96 w-full bg-primary-200'></div>
          <h2 className='text-xl font-semibold'>Tópicos</h2>
          <div className='h-48 w-full bg-primary-200'></div>
          <h2 className='text-xl font-semibold'>Cards</h2>
          <div className='h-60 w-full bg-primary-200'></div>
          <h2 className='text-xl font-semibold'>Visibilidade</h2>
          <div className='h-10 w-full bg-primary-200'></div>
          <div className='h-10 w-full bg-primary-200'></div>
          <div className='h-10 w-full bg-primary-200'></div>
          <footer className='flex justify-end gap-5'>
            <Button variant='bad'>Cancelar</Button>
            <Button>Salvar</Button>
          </footer>
        </div>
      </main>
    </>
  )
}

export default DecksCrud
