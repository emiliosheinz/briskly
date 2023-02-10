import { type NextPage } from 'next'

import { DeckCardList } from '~/components/deck-card-list'
import { api } from '~/utils/api'

const Home: NextPage = () => {
  // TODO emiliosheinz: Add pagination
  const { isLoading, isError, data, refetch } =
    api.decks.getPublicDecks.useQuery({
      page: 0,
    })

  const renderContent = () => {
    if (isLoading) return <DeckCardList.Loading />
    if (isError) return <DeckCardList.Error onRetryPress={refetch} />

    return <DeckCardList decks={data} />
  }

  return <div className='flex flex-col items-center'>{renderContent()}</div>
}

export default Home
