import Link from 'next/link'

import { Feedback } from '~/components/feedback'
import { Image } from '~/components/image'
import { routes } from '~/utils/navigation'

import { Error } from './components/error.component'
import { FavoriteButton } from './components/favorite-button.component'
import { Loading } from './components/loading.component'
import type { DeckCardListProps } from './types/deck-card-list.types'

export function DeckCardList(props: DeckCardListProps) {
  const { decks } = props

  if (decks.length === 0) {
    return (
      <Feedback
        shouldHideButton
        title='Opsss,'
        subtitle='parece que nenhum deck foi encontrado no momento. Por favor, volte mais tarde!'
      />
    )
  }

  return (
    <div className='flex-w grid grid-cols-1 gap-5 sm:grid-cols-2'>
      {decks.map((deck, idx) => (
        <div
          key={deck.id}
          className='relative flex flex-col justify-between overflow-hidden rounded-md border border-primary-900 bg-primary-50 pb-8 text-primary-900 shadow-md lg:pb-0'
        >
          <Link
            href={routes.deckDetails(deck.id)}
            className='flex flex-col lg:h-64 lg:flex-row'
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
              <h5 className='mb-2 text-2xl font-bold tracking-tight'>
                {deck.title}
              </h5>
              <p className='mb-3 font-normal'>{deck.description}</p>
            </div>
          </Link>
          <FavoriteButton deck={deck} />
        </div>
      ))}
    </div>
  )
}

DeckCardList.Loading = Loading
DeckCardList.Error = Error
