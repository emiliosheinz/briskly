import { InView } from 'react-intersection-observer'

import { type NextPage } from 'next'
import Head from 'next/head'

import { DeckCardList } from '~/components/deck-card-list'
import { Loader } from '~/components/loader'
import type { WithAuthentication } from '~/types/auth'
import { api } from '~/utils/api'

const DecksToBeReviewed: WithAuthentication<NextPage> = () => {
  const {
    data,
    isError,
    refetch,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.decks.toBeReviewed.useInfiniteQuery(
    {},
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
      keepPreviousData: true,
    },
  )

  const decks = data?.pages.flatMap(page => page.decks) ?? []
  const hasLoadedDecks = decks.length > 0

  const renderContent = () => {
    if (isLoading) return <DeckCardList.Loading />

    if (!hasLoadedDecks && isError) {
      return <DeckCardList.Error onRetryPress={refetch} />
    }

    return <DeckCardList decks={decks} />
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
      {renderContent()}
      <InView
        as='div'
        className='mt-5 flex w-full items-center justify-center'
        onChange={inView => {
          if (inView && hasNextPage && !isError && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
      >
        {isFetchingNextPage ? <Loader /> : null}
      </InView>
    </>
  )
}

DecksToBeReviewed.requiresAuthentication = true

export default DecksToBeReviewed
