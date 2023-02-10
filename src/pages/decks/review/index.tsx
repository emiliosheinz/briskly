import { type NextPage } from 'next'
import Head from 'next/head'

import { DeckCardList } from '~/components/deck-card-list'
import type { WithAuthentication } from '~/types/auth'
import { api } from '~/utils/api'

// TODO emiliosheinz: Add pagination
const DecksToBeReviewed: WithAuthentication<NextPage> = () => {
  const { isLoading, isError, data, refetch } = api.decks.toBeReviewed.useQuery(
    { page: 0 },
  )

  const renderContent = () => {
    if (isLoading) return <DeckCardList.Loading />
    if (isError) return <DeckCardList.Error onRetryPress={refetch} />

    return <DeckCardList decks={data} />
  }

  return (
    <>
      <Head>
        <title>Decks para revisar</title>
        <meta
          name='description'
          content='Lista de decks que você precisa revisar'
        />
      </Head>
      <div className='flex flex-col items-center'>{renderContent()}</div>
    </>
  )
}

DecksToBeReviewed.requiresAuthentication = true

export default DecksToBeReviewed
