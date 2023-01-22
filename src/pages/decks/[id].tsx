import { Fragment } from 'react'

import { Menu, Transition } from '@headlessui/react'
import {
  PencilSquareIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline'
import { Visibility } from '@prisma/client'
import { useSetAtom } from 'jotai'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { Card } from '~/components/card'
import { Image } from '~/components/image'
import { getServerAuthSession } from '~/server/common/auth'
import { prisma } from '~/server/common/db'
import { getS3ImageUrl } from '~/server/common/s3'
import { api, handleApiClientSideError } from '~/utils/api'
import { fullScreenLoaderAtom } from '~/utils/atoms'
import { classNames } from '~/utils/css'
import { routes } from '~/utils/navigation'
import { notify } from '~/utils/toast'

const Pill = dynamic(() =>
  import('~/components/pill').then(module => module.Pill),
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

function ActionsDropDown({
  className,
  deckId,
}: {
  className?: string
  deckId: string
}) {
  const router = useRouter()
  const setIsLoading = useSetAtom(fullScreenLoaderAtom)
  const deleteDeckMutation = api.decks.deleteDeck.useMutation()
  const createStudySessionMutation = api.studySession.create.useMutation()

  const actions = [
    {
      label: 'Editar Deck',
      icon: PencilSquareIcon,
      onClick: () => router.push(routes.editDeck(deckId)),
    },
    {
      label: 'Excluir Deck',
      icon: TrashIcon,
      onClick: async () => {
        try {
          setIsLoading(true)

          await deleteDeckMutation.mutateAsync({ id: deckId })

          notify.success('Deck excluído com sucesso!')
          router.back()
        } catch (error) {
          handleApiClientSideError({ error })
        } finally {
          setIsLoading(false)
        }
      },
    },
    {
      label: 'Estudar com este Deck',
      icon: RectangleStackIcon,
      onClick: async () => {
        try {
          setIsLoading(true)

          await createStudySessionMutation.mutateAsync({ deckId })

          notify.success('Sessão de estudo criada com sucesso!')
          router.back()
        } catch (error) {
          handleApiClientSideError({ error })
        } finally {
          setIsLoading(false)
        }
      },
    },
  ]

  return (
    <div className={className}>
      <Menu as='div' className='relative inline-block text-left'>
        <div>
          <Menu.Button className='m-2 rounded-sm bg-primary-50'>
            <EllipsisVerticalIcon
              className='hover:text-violet-100 h-8 w-8 text-primary-900'
              aria-hidden='true'
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <Menu.Items className='absolute right-0 w-56 origin-top-right rounded-md bg-primary-50 shadow-lg ring-1 ring-primary-900 ring-opacity-10 focus:outline-none'>
            <div className='px-1 py-1 '>
              {actions.map(action => (
                <Menu.Item key={action.label}>
                  {({ active }) => (
                    <button
                      onClick={action.onClick}
                      className={classNames(
                        'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm',
                        active
                          ? 'bg-primary-800 text-primary-50'
                          : 'text-primary-900',
                      )}
                    >
                      <action.icon className='h-6 w-6' />
                      <span>{action.label}</span>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}

const DeckDetails: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
  const { deck } = props

  const { data: session } = useSession()

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

  const renderActionButtons = () => {
    const isCurrentUserDeckOwner = session?.user?.id === deck.ownerId

    if (!session?.user || !isCurrentUserDeckOwner) return null

    return (
      <ActionsDropDown className='absolute top-0 right-0' deckId={deck.id} />
    )
  }

  return (
    <>
      <Head>
        <title>{deck.title}</title>
        <meta name='description' content={deck.description} />
        <link rel='icon' href='/favicon.ico' />
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
        <h2 className='text-xl font-medium text-primary-900'>Cards:</h2>
        <ul className='flex w-full flex-wrap gap-5'>
          {deck.cards.map(card => (
            <Card as='li' key={card.id}>
              {card.question}
            </Card>
          ))}
        </ul>
        {renderActionButtons()}
      </div>
    </>
  )
}

export default DeckDetails
