import type { Deck } from '@prisma/client'

export type DeckCardListProps = {
  decks: Array<Deck & { isFavorite: boolean; favorites: number }>
}

export type ErrorProps = {
  onRetryPress: () => void
}

export type FavoriteButtonProps = {
  deck: DeckCardListProps['decks'][number]
}
