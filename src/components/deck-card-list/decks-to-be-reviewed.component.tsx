import { InView } from 'react-intersection-observer'

import { Loader } from '~/components/loader'
import { api } from '~/utils/api'

import { DeckCardList } from './deck-card-list.component'
import type { DecksToBeReviewedProps } from './types/decks-to-be-reviewed.types'

export function DecksToBeReviewed(props: DecksToBeReviewedProps) {
  const { isVisible = true } = props

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
      enabled: isVisible,
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
