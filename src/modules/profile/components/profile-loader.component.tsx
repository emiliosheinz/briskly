import Head from 'next/head'

import { DeckCardList } from '~/components/deck-card-list'

export function ProfileLoader() {
  return (
    <>
      <Head>
        <title>Perfil do usuário</title>
      </Head>
      <span className='sr-only'>Carregando Perfil do usuário...</span>
      <div className='flex flex-col gap-5 md:flex-row'>
        <div className='flex animate-pulse items-center gap-5 md:flex-[2] md:flex-col'>
          <div className='aspect-square w-20 rounded-full bg-primary-200 md:h-64 md:w-64' />
          <div className='flex w-full flex-col gap-2'>
            <div className='h-5 w-full rounded-md bg-primary-200' />
            <div className='h-5 w-full rounded-md bg-primary-200' />
            <div className='h-5 w-full rounded-md bg-primary-200' />
          </div>
        </div>
        <div className='flex flex-col gap-5 md:flex-[6]'>
          <div className='h-10 w-full animate-pulse rounded-md bg-primary-200' />
          <DeckCardList.Loading />
        </div>
      </div>
    </>
  )
}
