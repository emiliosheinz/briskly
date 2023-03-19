export const routes = {
  home: () => '/',
  createNewDeck: () => '/decks/create/new',
  editDeck: (id: string) => `/decks/create/${id}`,
  deckDetails: (id: string) => `/decks/${id}`,
  reviewDeck: (id: string) => `/decks/review/${id}`,
  toBeReviewed: () => '/decks/review',
  userProfile: (id: string) => `/profile/${id}`,
  mostFavoriteDecks: () => '/decks/most-favorite',
  profileSettings: () => '/profile/settings',
  decksForYou: () => '/decks/for-you',
  favorites: () => '/decks/favorites',
  answerValidationReports: (id: string) => `/decks/reports/${id}`,
}
