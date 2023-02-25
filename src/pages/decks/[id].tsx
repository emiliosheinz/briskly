import { Fragment } from 'react'

import { Visibility } from '@prisma/client'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import { Card } from '~/components/card'
import { Image } from '~/components/image'
import { getServerAuthSession } from '~/server/common/auth'
import { prisma } from '~/server/common/db'
import { getS3ImageUrl } from '~/server/common/s3'

const Pill = dynamic(() =>
  import('~/components/pill').then(module => module.Pill),
)

const ActionsDropDown = dynamic(() =>
  import('~/modules/decks/components/actions-drop-down.component').then(
    module => module.ActionsDropDown,
  ),
)

const StudySessionCard = dynamic(() =>
  import('~/modules/decks/components/study-session-card.component').then(
    module => module.StudySessionCard,
  ),
)

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

const DeckDetailsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
  const { deck } = props

  const renderTopics = () => {
    if (deck.topics.length === 0) return null

    return (
      <>
        <h2 className='text-xl font-medium text-primary-900'>Tópicos:</h2>
        <ul className='flex flex-wrap gap-3'>
          {deck.topics.map(topic => (
            <li key={topic.id}>
              <Pill>{topic.title}</Pill>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{deck.title}</title>
        <meta name='description' content={deck.description} />
      </Head>
      <div className='relative flex flex-col gap-5'>
        <div className='flex flex-col gap-5 sm:flex-row'>
          <div className='relative aspect-square w-full sm:max-w-sm'>
            <Image
              fill
              priority
              src={deck.image}
              alt={`${deck.title} banner image`}
              className='rounded-md'
              sizes='384px'
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className='flex w-full flex-col gap-5 lg:pr-40'>
            <h1 className='text-2xl font-medium text-primary-900'>
              {deck.title}
            </h1>
            <p className='flex-1 text-base text-primary-900'>
              {deck.description}
            </p>
            {renderTopics()}
          </div>
        </div>
        <StudySessionCard deckId={deck.id} />
        <h2 className='text-xl font-medium text-primary-900'>Cards:</h2>
        <ul className='flex w-full flex-wrap gap-5'>
          {deck.cards.map(card => (
            <Card as='li' key={card.id}>
              {card.question}
            </Card>
          ))}
        </ul>
        <ActionsDropDown
          className='absolute top-0 right-0'
          deckId={deck.id}
          deckOwnerId={deck.ownerId}
        />
      </div>
    </>
  )
}

export default DeckDetailsPage
