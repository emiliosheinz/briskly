import { type NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import { Image } from '~/components/image'
import { api } from '~/utils/api'

const Home: NextPage = () => {
  const { isLoading, isError, data } = api.decks.getPublicDecks.useQuery({
    page: 0,
  })

  const renderContent = () => {
    if (isLoading) return 'Carregando...'
    if (isError) return 'Deu erro!'

    console.log(data)
    return (
      <div className='flex-w grid grid-cols-1 gap-5 sm:grid-cols-2'>
        {data.map(deck => (
          <Link
            href='#'
            key={deck.id}
            className='flex flex-col overflow-hidden rounded-md border border-primary-900 bg-primary-50 shadow-md hover:bg-primary-100 lg:flex-row'
          >
            <div className='relative flex aspect-square w-full lg:w-2/5'>
              <Image
                fill
                src={deck.image}
                style={{ objectFit: 'cover' }}
                alt={`${deck.title} image`}
                sizes='(min-width: 1024px) 250px,
                 (min-width: 640px) 50vw, 
                 100vw'
              />
            </div>
            <div className='flex flex-1 flex-col p-4'>
              <h5 className='mb-2 text-2xl font-bold tracking-tight text-primary-900'>
                {deck.title}
              </h5>
              <p className='mb-3 font-normal text-primary-900'>
                {deck.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Briskly</title>
        <meta name='description' content='The perfect Flashcards app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex flex-col items-center'>{renderContent()}</div>
    </>
  )
}

export default Home
