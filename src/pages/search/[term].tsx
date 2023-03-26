import { InView } from 'react-intersection-observer'

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import Head from 'next/head'

import { DeckCardList } from '~/components/deck-card-list'
import { Loader } from '~/components/loader'
import { api } from '~/utils/api'

export const getServerSideProps: GetServerSideProps<{
  searchedTerm: string
}> = async context => {
  const searchedTerm = context.params?.term as string

  if (!searchedTerm) return { notFound: true }

  return {
    props: {
      searchedTerm,
    },
  }
}

const SearchDecksPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
  const { searchedTerm } = props

  const {
    data,
    isError,
    refetch,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.decks.searchByTerm.useInfiniteQuery(
    { term: searchedTerm },
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
        <title>{`Decks sobre ${searchedTerm}`}</title>
        <meta
          name='description'
          content={`Uma lista completa de decks sobre ${searchedTerm}`}
        />
      </Head>
      <h1 className='mb-5 text-2xl font-semibold'>{`Resultados para "${searchedTerm}"`}</h1>
      <div className='flex flex-col items-center'>
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
      </div>
    </>
  )
}

export default SearchDecksPage
