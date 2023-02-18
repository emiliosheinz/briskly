import { DeckCardList } from '~/components/deck-card-list'
import { api } from '~/utils/api'

type UserDecksProps = {
  userId: string
  isVisible: boolean
}

export function UserDecks(props: UserDecksProps) {
  const { userId, isVisible } = props

  const { data, isLoading, isError, refetch } = api.decks.byUser.useQuery(
    { userId: userId },
    { enabled: isVisible },
  )

  if (isLoading) return <DeckCardList.Loading />

  if (isError) {
    return <DeckCardList.Error onRetryPress={refetch} />
  }

  return <DeckCardList decks={data} />
}
