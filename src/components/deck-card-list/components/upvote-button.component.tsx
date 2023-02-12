import { useState } from 'react'

import { ArrowUpCircleIcon as EmptyArrowUpIcon } from '@heroicons/react/24/outline'
import { ArrowUpCircleIcon as FilledArrowUpIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'

import { api } from '~/utils/api'
import { notify } from '~/utils/toast'

import type { UpvoteButtonProps } from '../deck-card-list.types'

/**
 * TODO emiliosheinz: Improve upvotes handling by updating global cache
 */
export function InnerUpvoteButton(props: UpvoteButtonProps) {
  const { deck } = props

  const { data: user } = useSession()
  const apiContext = api.useContext()

  const invalidateDeckQueries = () => {
    apiContext.decks.byUser.invalidate()
    apiContext.decks.getMostUpvotedDecks.invalidate()
    apiContext.decks.getPublicDecks.invalidate()
    apiContext.decks.toBeReviewed.invalidate()
  }

  const { mutate: addUpvote } = api.decks.addUpvote.useMutation({
    onSuccess: invalidateDeckQueries,
  })
  const { mutate: removeUpvote } = api.decks.removeUpvote.useMutation({
    onSuccess: invalidateDeckQueries,
  })

  const [isUpvoted, setIsUpvoted] = useState(deck.isUpvoted)
  const [upvotes, setUpvotes] = useState(deck.upvotes)

  const Icon = isUpvoted ? FilledArrowUpIcon : EmptyArrowUpIcon

  const handleButtonClick = () => {
    if (!user) {
      notify.warning('Você precisa estar logado para executar essa ação!')
      return
    }

    const toggleUpvote = isUpvoted ? removeUpvote : addUpvote
    toggleUpvote({ deckId: deck.id })
    setIsUpvoted(!isUpvoted)
    setUpvotes(upvotes + (isUpvoted ? -1 : 1))
  }

  return (
    <button
      onClick={handleButtonClick}
      className='absolute bottom-0 right-0 flex items-center gap-2 p-2'
    >
      <Icon className='h-8 w-8 text-primary-900' />
      <span>{upvotes}</span>
    </button>
  )
}

export function UpvoteButton(props: UpvoteButtonProps) {
  return (
    <InnerUpvoteButton
      {...props}
      /**
       * Add key so the component gets updated when upvotes or isUpvoted changes
       */
      key={`${props.deck.isUpvoted}-${props.deck.upvotes}`}
    />
  )
}
