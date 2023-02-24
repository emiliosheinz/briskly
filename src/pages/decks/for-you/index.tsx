import { type NextPage } from 'next'
import { useRouter } from 'next/router'

import { DeckCardList } from '~/components/deck-card-list'
import { Feedback } from '~/components/feedback'
import type { WithAuthentication } from '~/types/auth'
import { api } from '~/utils/api'
import { routes } from '~/utils/navigation'

const DecksForYouPage: WithAuthentication<NextPage> = () => {
  const {
    data: decks,
    isError,
    refetch,
    isLoading,
  } = api.decks.forYou.useQuery()
  const router = useRouter()

  const renderContent = () => {
    if (isLoading) return <DeckCardList.Loading />

    if (isError) {
      return <DeckCardList.Error onRetryPress={refetch} />
    }

    if (!decks?.length) {
      return (
        <Feedback
          title='Nenhum Deck encontrado!'
          subtitle='Por favor, certifique-se que você cadastrou os seus tópicos de interesse na aba de configurações do seu perfil.'
          buttonLabel='Acessar Configurações'
          onButtonClick={() => router.push(routes.profileSettings())}
        />
      )
    }

    return <DeckCardList decks={decks} />
  }

  return <div className='flex flex-col items-center'>{renderContent()}</div>
}

DecksForYouPage.requiresAuthentication = true

export default DecksForYouPage
