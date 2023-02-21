export const routes = {
  home: () => '/',
  createNewDeck: () => '/decks/create/new',
  editDeck: (id: string) => `/decks/create/${id}`,
  deckDetails: (id: string) => `/decks/${id}`,
  reviewDeck: (id: string) => `/decks/review/${id}`,
  toBeReviewed: () => '/decks/review',
  userProfile: (id: string) => `/profile/${id}`,
  mostUpvotedDecks: () => '/decks/most-upvoted',
  profileSettings: () => '/profile/settings',
  decksForYou: () => '/decks/for-you',
}
