import type { Deck } from '@prisma/client'

export type DeckCardListProps = {
  decks: Array<Deck>
}

export type ErrorProps = {
  onRetryPress: () => void
}
