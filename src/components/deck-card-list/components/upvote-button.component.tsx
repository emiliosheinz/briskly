import { useState } from 'react'

import { ArrowUpCircleIcon as EmptyArrowUpIcon } from '@heroicons/react/24/outline'
import { ArrowUpCircleIcon as FilledArrowUpIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'

import { api } from '~/utils/api'
import { notify } from '~/utils/toast'

import type { UpvoteButtonProps } from '../deck-card-list.types'

export function UpvoteButton(props: UpvoteButtonProps) {
  const { deck } = props

  const { data: user } = useSession()

  const { mutate } = api.decks.toggleUpvote.useMutation()

  const [isUpvoted, setIsUpvoted] = useState(deck.isUpvoted)
  const [upvotes, setUpvotes] = useState(deck.upvotes)

  const Icon = isUpvoted ? FilledArrowUpIcon : EmptyArrowUpIcon

  return (
    <button
      onClick={async () => {
        if (user) {
          mutate({ deckId: deck.id })
          setIsUpvoted(!isUpvoted)
          setUpvotes(upvotes + (isUpvoted ? -1 : 1))
        } else {
          notify.warning('Você precisa estar logado para executar essa ação!')
        }
      }}
      className='absolute bottom-0 right-0 flex items-center gap-2 p-2'
    >
      <Icon className='h-8 w-8 text-primary-900' />
      <span>{upvotes}</span>
    </button>
  )
}
