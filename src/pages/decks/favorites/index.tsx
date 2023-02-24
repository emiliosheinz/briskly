import { type NextPage } from 'next'
import dynamic from 'next/dynamic'

import type { WithAuthentication } from '~/types/auth'

const UserFavoriteDecks = dynamic(() =>
  import('~/components/deck-card-list').then(
    module => module.UserFavoriteDecks,
  ),
)

const DecksFavoritesPage: WithAuthentication<NextPage> = () => {
  return <UserFavoriteDecks />
}

DecksFavoritesPage.requiresAuthentication = true

export default DecksFavoritesPage
