import { useState } from 'react'

import { HeartIcon as EmptyHeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as FilledHeartIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'

import { api } from '~/utils/api'
import { notify } from '~/utils/toast'

import type { FavoriteButtonProps } from '../types/deck-card-list.types'

export function InnerFavoriteButton(props: FavoriteButtonProps) {
  const { deck } = props

  const { data: user } = useSession()
  const apiContext = api.useContext()

  const invalidateDeckQueries = () => {
    apiContext.decks.invalidate()
  }

  const { mutate: addFavorite } = api.decks.addFavorite.useMutation({
    onSuccess: invalidateDeckQueries,
  })
  const { mutate: removeFavorite } = api.decks.removeFavorite.useMutation({
    onSuccess: invalidateDeckQueries,
  })

  const [isFavorite, setIsFavorite] = useState(deck.isFavorite)
  const [favorites, setFavorites] = useState(deck.favorites)

  const Icon = isFavorite ? FilledHeartIcon : EmptyHeartIcon

  const handleButtonClick = () => {
    if (!user) {
      notify.warning('Você precisa estar logado para executar essa ação!')
      return
    }

    const toggleFavorite = isFavorite ? removeFavorite : addFavorite
    toggleFavorite({ deckId: deck.id })
    setIsFavorite(!isFavorite)
    setFavorites(favorites + (isFavorite ? -1 : 1))
  }

  return (
    <button
      onClick={handleButtonClick}
      className='absolute bottom-0 right-0 flex items-center gap-2 p-2'
    >
      <span>{favorites}</span>
      <Icon className='h-8 w-8 text-primary-900' />
    </button>
  )
}

export function FavoriteButton(props: FavoriteButtonProps) {
  return (
    <InnerFavoriteButton
      {...props}
      /**
       * Add key so the component gets updated when favorites or isFavorite changes
       */
      key={`${props.deck.isFavorite}-${props.deck.favorites}`}
    />
  )
}
