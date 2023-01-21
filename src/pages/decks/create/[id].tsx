import { useState } from 'react'

import { PlusCircleIcon } from '@heroicons/react/24/outline'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { Button } from '~/components/button'
import { Card } from '~/components/card'
import { ImageUploader } from '~/components/image-uploader'
import { Input } from '~/components/input'
import type { CardFormInputValues } from '~/components/modal/new-card/new-card-modal.types'
import { Pill } from '~/components/pill'
import { RadioGroup } from '~/components/radio-group'
import { TextArea } from '~/components/text-area'
import { MAX_TOPICS_PER_DECK } from '~/constants'
import type { DeckWithCardsAndTopics } from '~/contexts/create-new-deck'
import {
  CreateNewDeckContextProvider,
  useCreateNewDeckContext,
} from '~/contexts/create-new-deck'
import { getServerAuthSession } from '~/server/common/auth'
import { prisma } from '~/server/common/db'
import { getS3ImageUrl } from '~/server/common/s3'
import type { WithAuthentication } from '~/types/auth'
import { routes } from '~/utils/navigation'

const NEW_DECK_ID = 'new'

const NewCardModal = dynamic(() =>
  import('~/components/modal').then(m => m.Modal.NewCard),
)
const NewTopicModal = dynamic(() =>
  import('~/components/modal').then(m => m.Modal.NewTopic),
)

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

const MainInfoSection = () => {
  const { createNewDeckForm } = useCreateNewDeckContext()

  const { formState, register } = createNewDeckForm ?? {}

  return (
    <>
      <h1 className='text-2xl font-semibold'>Criar Deck</h1>
      <div className='flex w-full flex-col gap-3 sm:flex-row sm:gap-6'>
        <div className='sm:w-[327px]'>
          <ImageUploader
            id='image'
            {...register?.('image')}
            defaultValue={formState?.defaultValues?.image as string}
            error={formState?.errors['image']?.message as string}
          />
        </div>
        <div className='flex flex-col gap-1 sm:flex-1'>
          <Input
            label='Titulo'
            id='title'
            {...register?.('title')}
            error={formState?.errors['title']?.message as string}
          />
          <TextArea
            label='Descrição'
            id='description'
            rows={8}
            {...register?.('description')}
            error={formState?.errors['description']?.message as string}
          />
        </div>
      </div>
    </>
  )
}

const TopicsSection = () => {
  const { topics, addTopic, deleteTopic } = useCreateNewDeckContext()

  const [isCreatingTopic, setIsCreatingTopic] = useState(false)

  return (
    <>
      <h2 className='text-xl font-semibold'>Tópicos</h2>
      <div className='flex w-full flex-wrap gap-4'>
        {topics.map(({ title: topic }, idx) => (
          <Pill key={topic} isDeletable onClick={() => deleteTopic(idx)}>
            {topic}
          </Pill>
        ))}
        <Pill
          isDisabled={topics.length >= MAX_TOPICS_PER_DECK}
          onClick={() => setIsCreatingTopic(true)}
        >
          <PlusCircleIcon className='w-6, h-6' />
        </Pill>
      </div>
      <NewTopicModal
        isOpen={isCreatingTopic}
        setIsOpen={setIsCreatingTopic}
        onSubmit={values => addTopic(values.title)}
      />
    </>
  )
}

type NewCardModalState = {
  isOpen: boolean
  cardIdx?: number
}

const CardsSection = () => {
  const { cards, addCard, deleteCard, editCard } = useCreateNewDeckContext()

  const [newCardModalState, setNewCardModalState] = useState<NewCardModalState>(
    { isOpen: false },
  )

  const isCreatingNewCard = newCardModalState.cardIdx === undefined

  const modalFieldsValues = isCreatingNewCard
    ? { answer: '', question: '' }
    : cards[newCardModalState.cardIdx!]

  const handleNewCardFormSubmit = (values: CardFormInputValues) => {
    if (isCreatingNewCard) {
      addCard(values)
    } else {
      editCard(newCardModalState.cardIdx!, values)
    }
  }

  const closeModal = (isOpen: boolean) => {
    setNewCardModalState(state => ({
      ...state,
      isOpen,
    }))
  }

  return (
    <>
      <h2 className='text-xl font-semibold'>Cards</h2>
      <div className='w-ful jus flex flex-wrap gap-5'>
        {cards.map((card, idx) => (
          <Card
            isEditable
            key={`${card.question}-${card.answer}`}
            onDeletePress={() => deleteCard(idx)}
            onEditPress={() => {
              setNewCardModalState({ isOpen: true, cardIdx: idx })
            }}
          >
            {card.question}
          </Card>
        ))}
        <Card onClick={() => setNewCardModalState({ isOpen: true })}>
          <PlusCircleIcon className='h-12 w-12' />
        </Card>
      </div>
      <NewCardModal
        isOpen={newCardModalState.isOpen}
        setIsOpen={closeModal}
        onSubmit={handleNewCardFormSubmit}
        defaultValues={modalFieldsValues}
      />
    </>
  )
}

const VisibilitySection = () => {
  const { setVisibility, visibility, visibilityOptions } =
    useCreateNewDeckContext()

  return (
    <RadioGroup
      label='Visibilidade'
      options={visibilityOptions}
      selected={visibility}
      onChange={setVisibility}
    />
  )
}

const SubmitButtonsSection = () => {
  const router = useRouter()

  return (
    <footer className='mt-5 flex justify-end gap-5'>
      <Button
        variant='bad'
        type='button'
        onClick={() => router.replace(routes.home())}
      >
        Cancelar
      </Button>
      <Button type='submit'>Salvar</Button>
    </footer>
  )
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
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <form className='flex flex-col gap-5' onSubmit={onSubmit}>
        <MainInfoSection />
        <TopicsSection />
        <CardsSection />
        <VisibilitySection />
        <SubmitButtonsSection />
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
