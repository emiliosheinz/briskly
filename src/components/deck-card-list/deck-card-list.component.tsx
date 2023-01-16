import Link from 'next/link'

import { Image } from '~/components/image'

import type { DeckCardListProps } from './deck-card-list.types'
import { Error } from './error.component'
import { Loading } from './loading.component'

// TODO emiliosheinz: Redirect user to the right link
export function DeckCardList({ decks }: DeckCardListProps) {
  return (
    <div className='flex-w grid grid-cols-1 gap-5 sm:grid-cols-2'>
      {decks.map((deck, idx) => (
        <Link
          href='#'
          key={deck.id}
          className='flex flex-col overflow-hidden rounded-md border border-primary-900 bg-primary-50 shadow-md hover:bg-primary-100 lg:h-64 lg:flex-row'
        >
          <div className='relative flex aspect-square w-full lg:w-2/5'>
            <Image
              fill
              src={deck.image}
              priority={idx === 0}
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

DeckCardList.Loading = Loading
DeckCardList.Error = Error
