import dynamic from 'next/dynamic'

const DecksToBeReviewed = dynamic(() =>
  import('~/components/deck-card-list').then(
    module => module.DecksToBeReviewed,
  ),
)
const UserDecks = dynamic(() =>
  import('../components/user-decks.component').then(module => module.UserDecks),
)

const UserFavoriteDecks = dynamic(() =>
  import('~/components/deck-card-list').then(
    module => module.UserFavoriteDecks,
  ),
)

const DecksWithStudySession = dynamic(() =>
  import('../components/decks-with-study-session.component').then(
    module => module.DecksWithStudySession,
  ),
)

export const profileMenuTabs = [
  {
    name: 'Decks',
    content: UserDecks,
    isProfileOwnerOnly: false,
  },
  {
    name: 'Meus Estudos',
    content: DecksWithStudySession,
    isProfileOwnerOnly: true,
  },
  {
    name: 'Para Revisar',
    content: DecksToBeReviewed,
    isProfileOwnerOnly: true,
  },
  {
    name: 'Meus Favoritos',
    content: UserFavoriteDecks,
    isProfileOwnerOnly: true,
  },
]
