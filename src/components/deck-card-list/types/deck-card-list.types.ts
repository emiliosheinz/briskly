import type { Deck } from '@prisma/client'

export type DeckCardListProps = {
  decks: Array<Deck & { isUpvoted: boolean; upvotes: number }>
}

export type ErrorProps = {
  onRetryPress: () => void
}

export type UpvoteButtonProps = {
  deck: DeckCardListProps['decks'][number]
}
