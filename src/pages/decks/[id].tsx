import type { GetServerSideProps } from 'next'
import { type NextPage } from 'next'
import Head from 'next/head'

import { Button } from '~/components/button'
import type { WithAuthentication } from '~/types/auth'

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
const DecksCrud: WithAuthentication<NextPage> = () => {
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
      <div className='flex flex-col gap-5'>
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
    </>
  )
}

DecksCrud.requiresAuthentication = true

export default DecksCrud
