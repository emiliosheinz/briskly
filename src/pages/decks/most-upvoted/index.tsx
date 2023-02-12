import { type NextPage } from 'next'

import { DeckCardList } from '~/components/deck-card-list'
import { api } from '~/utils/api'

const MostUpvotedDecks: NextPage = () => {
  const {
    data: decks,
    isError,
    refetch,
    isLoading,
  } = api.decks.getMostUpvotedDecks.useQuery()

  const renderContent = () => {
    if (isLoading) return <DeckCardList.Loading />

    if (isError) {
      return <DeckCardList.Error onRetryPress={refetch} />
    }

    return <DeckCardList decks={decks} />
  }

  return <div className='flex flex-col items-center'>{renderContent()}</div>
}

export default MostUpvotedDecks
