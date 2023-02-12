export const routes = {
  home: () => '/',
  createNewDeck: () => '/decks/create/new',
  editDeck: (id: string) => `/decks/create/${id}`,
  deckDetails: (id: string) => `/decks/${id}`,
  reviewDeck: (id: string) => `/decks/review/${id}`,
  toBeReviewed: () => '/decks/review',
  mostUpvotedDecks: () => '/decks/most-upvoted',
}
