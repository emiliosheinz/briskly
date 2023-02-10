import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import type { DeckWithCardsAndTopics } from '~/contexts/create-new-deck'
import {
  CreateNewDeckContextProvider,
  useCreateNewDeckContext,
} from '~/contexts/create-new-deck'
import { getServerAuthSession } from '~/server/common/auth'
import { prisma } from '~/server/common/db'
import { getS3ImageUrl } from '~/server/common/s3'
import type { WithAuthentication } from '~/types/auth'

const Cards = dynamic(() =>
  import('~/modules/decks/create/components/cards.component').then(
    module => module.Cards,
  ),
)
const MainInfo = dynamic(() =>
  import('~/modules/decks/create/components/main-info.component').then(
    module => module.MainInfo,
  ),
)
const SubmitButtons = dynamic(() =>
  import('~/modules/decks/create/components/submit-buttons.component').then(
    module => module.SubmitButtons,
  ),
)
const Topics = dynamic(() =>
  import('~/modules/decks/create/components/topics.component').then(
    module => module.Topics,
  ),
)
const Visibility = dynamic(() =>
  import('~/modules/decks/create/components/visibility.component').then(
    module => module.Visibility,
  ),
)

const NEW_DECK_ID = 'new'

export const getServerSideProps: GetServerSideProps<{
  deck?: DeckWithCardsAndTopics | null
}> = async context => {
  const deckId = context.params?.id as string

  if (!deckId) {
    return { notFound: true }
  }

  const session = await getServerAuthSession(context)

  if (!session?.user || deckId === NEW_DECK_ID) {
    return {
      props: {},
    }
  }

  const deck = await prisma.deck.findFirst({
    where: { id: deckId, ownerId: session.user.id },
    include: {
      cards: true,
      topics: true,
    },
  })

  if (!deck) {
    return { notFound: true }
  }

  return {
    props: {
      deck: {
        ...deck,
        image: getS3ImageUrl(deck.image),
      },
    },
  }
}

const DecksCrudContent = () => {
  const { createNewDeckForm, submitDeck } = useCreateNewDeckContext()

  const onSubmit = createNewDeckForm?.handleSubmit(submitDeck)

  return (
    <>
      <Head>
        <title>Criar Deck</title>
        <meta
          name='description'
          content='Crie um novo Deck e comece a estudar'
        />
      </Head>
      <form className='flex flex-col gap-5' onSubmit={onSubmit}>
        <MainInfo />
        <Topics />
        <Cards />
        <Visibility />
        <SubmitButtons />
      </form>
    </>
  )
}

const DecksCrud: WithAuthentication<
  NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>
> = props => {
  const { deck } = props

  return (
    <CreateNewDeckContextProvider deck={deck}>
      <DecksCrudContent />
    </CreateNewDeckContextProvider>
  )
}

DecksCrud.requiresAuthentication = true

export default DecksCrud
