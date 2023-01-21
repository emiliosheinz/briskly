import { Visibility } from '@prisma/client'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'

import { getServerAuthSession } from '~/server/common/auth'
import { prisma } from '~/server/common/db'
import { getS3ImageUrl } from '~/server/common/s3'

async function getDeckFromDatabase(deckId: string) {
  return await prisma.deck.findFirst({
    where: { id: deckId },
    include: {
      cards: { select: { id: true, question: true } },
      topics: true,
    },
  })
}

function buildDeckWithS3Image(deck: DeckQueryResult) {
  return {
    ...deck,
    image: getS3ImageUrl(deck.image),
  }
}

type DeckQueryResult = NonNullable<
  Awaited<ReturnType<typeof getDeckFromDatabase>>
>

export const getServerSideProps: GetServerSideProps<{
  deck: DeckQueryResult
}> = async context => {
  const deckId = context.params?.id as string

  if (!deckId) return { notFound: true }

  const deck = await getDeckFromDatabase(deckId)

  if (!deck) return { notFound: true }

  /**
   * If deck is not private anyone can access it
   */
  if (deck.visibility !== Visibility.Private) {
    return {
      props: {
        deck: buildDeckWithS3Image(deck),
      },
    }
  }

  const session = await getServerAuthSession(context)

  /**
   * Verifies if user is signed in and if is the owner of the deck
   */
  if (!session?.user) return { notFound: true }
  if (deck.ownerId !== session.user.id) return { notFound: true }

  return {
    props: {
      deck: buildDeckWithS3Image(deck),
    },
  }
}

const DeckDetails: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
  const { deck } = props

  console.log(deck)
  return <div>Olá!</div>
}

export default DeckDetails
