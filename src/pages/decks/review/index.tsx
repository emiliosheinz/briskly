import { type NextPage } from 'next'
import Head from 'next/head'

import { DecksToBeReviewed } from '~/components/deck-card-list'
import type { WithAuthentication } from '~/types/auth'

const DecksToBeReviewedPage: WithAuthentication<NextPage> = () => {
  return (
    <>
      <Head>
        <title>Decks para revisar</title>
        <meta
          name='description'
          content='Lista de decks que você precisa revisar'
        />
      </Head>
      <DecksToBeReviewed />
    </>
  )
}

DecksToBeReviewedPage.requiresAuthentication = true

export default DecksToBeReviewedPage
