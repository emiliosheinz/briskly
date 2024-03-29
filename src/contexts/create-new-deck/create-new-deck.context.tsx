import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Visibility } from '@prisma/client'
import type { QueryFunctionContext } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useRouter } from 'next/router'

import { DECK_VISIBILITY_OPTIONS } from '~/constants'
import { env } from '~/env/client.mjs'
import { api, handleApiClientSideError } from '~/utils/api'
import { fullScreenLoaderAtom } from '~/utils/atoms'
import { compress } from '~/utils/image'
import { routes } from '~/utils/navigation'
import { notify } from '~/utils/toast'

import type {
  CardInput,
  CreateNewDeckContextProviderProps,
  CreateNewDeckContextState,
  DeckWithCardsAndTopics,
  FormInputValues,
  TopicInput,
} from './create-new-deck.types'
import { DeckInputFormSchema } from './create-new-deck.types'
import { initialState } from './create-new-deck.types'

const CreateNewDeckContext =
  React.createContext<CreateNewDeckContextState>(initialState)

const uploadImage = async (uploadUrl: string, image?: File) => {
  if (!image) return

  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: image,
  })
}

const fetchAiPoweredCards = async (
  context: QueryFunctionContext,
): Promise<Array<CardInput>> => {
  const [title, ...topics] = context.queryKey as [string]

  const params = new URLSearchParams({ title })
  for (const topic of topics) params.append('topics', topic)

  const url = `${env.NEXT_PUBLIC_BRISKLY_GENERATE_FLASH_CARDS_API_URL}/ai-powered-flashcards?${params}`

  const response = await fetch(url)

  if (!response.ok) {
    throw response
  }

  return response.json()
}

const isEditingDeck = (
  deck?: DeckWithCardsAndTopics | null,
): deck is DeckWithCardsAndTopics => !!deck

export function CreateNewDeckContextProvider(
  props: CreateNewDeckContextProviderProps,
) {
  const { children, deck } = props

  const apiContext = api.useContext()
  const setIsLoading = useSetAtom(fullScreenLoaderAtom)
  const router = useRouter()

  const invalidateDeckQueries = () => {
    apiContext.decks.byUser.invalidate()

    if (visibility?.value === Visibility.Public) {
      apiContext.decks.getPublicDecks.invalidate()
    }
  }

  /**
   * Deck related mutations
   */
  const createNewDeckMutation = api.decks.createNewDeck.useMutation({
    onSuccess: invalidateDeckQueries,
  })
  const updateDeckMutation = api.decks.updateDeck.useMutation({
    onSuccess: invalidateDeckQueries,
  })
  const deleteFileByUrlMutation = api.files.deleteFileByUrl.useMutation()
  const getFileUploadConfigMutation =
    api.files.getFileUploadConfig.useMutation()

  /**
   * Shared states between creation and edit
   */
  const [topics, setTopics] = useState<Array<TopicInput>>(deck?.topics || [])
  const [cards, setCards] = useState<Array<CardInput>>(
    (deck?.cards ?? []).map(card => ({
      ...card,
      validAnswers: card.validAnswers.join(';'),
    })),
  )
  const [visibility, setVisibility] = useState(
    DECK_VISIBILITY_OPTIONS.find(option => option.value === deck?.visibility) ||
      DECK_VISIBILITY_OPTIONS[0],
  )

  /**
   * Only used when isEditing is true
   * Needed to control removed and edited items due to database updates
   */
  const [deletedTopics, setDeletedTopics] = useState<Array<TopicInput>>([])
  const [deletedCards, setDeletedCards] = useState<Array<CardInput>>([])
  const [editedCards, setEditedCards] = useState<Array<CardInput>>([])

  const hasDeckAiPoweredCards = cards.some(card => card.isAiPowered)

  const createNewDeckForm = useForm<FormInputValues>({
    resolver: zodResolver(DeckInputFormSchema),
    defaultValues: {
      title: deck?.title ?? '',
      description: deck?.description ?? '',
      image: deck?.image,
    },
  })

  const {
    refetch: generateAiPoweredCardsMutation,
    isFetching: isGeneratingAiPoweredCards,
    isError: hasErrorGeneratingAiPoweredCards,
  } = useQuery(
    [createNewDeckForm.getValues().title, ...topics.map(({ title }) => title)],
    fetchAiPoweredCards,
    {
      retry: false,
      enabled: false,
      onSuccess: aiPoweredCards => {
        setCards(prevCards => [...prevCards, ...aiPoweredCards])
        notify.success('Bip Bop, cards gerados com sucesso. Aproveite 🤖')
      },
      onError: () => {
        notify.error('Ocorreu um erro ao gerar os cards. Tente novamente!')
      },
    },
  )

  /**
   * Healthcheck to wake up the generate flash cards API
   */
  useEffect(() => {
    fetch(`${env.NEXT_PUBLIC_BRISKLY_GENERATE_FLASH_CARDS_API_URL}/healthcheck`)
  }, [])

  const addTopic = (topic: string) => {
    setTopics(topics => [
      ...topics.filter(({ title }) => title !== topic),
      { title: topic.toLowerCase() },
    ])
  }

  const deleteTopic = (idx: number) => {
    const deletedTopic = topics[idx]

    /**
     * If is editing and topic has id adds deletedTopic to deletedTopics array
     * We need to do it to delete this topics from the Database later
     */
    if (isEditingDeck(deck) && deletedTopic?.id) {
      setDeletedTopics(topics => [...topics, deletedTopic])
    }

    setTopics(topics => [...topics.slice(0, idx), ...topics.slice(idx + 1)])
  }

  const addCard = (card: CardInput) => {
    setCards(cards => [...cards, card])
  }

  const editCard = (idx: number, updatedCard: CardInput) => {
    /**
     * Is is editing and updated card has id we need to save it in the
     * editedCards array to updated it later in the Database
     */
    if (isEditingDeck(deck) && !!updatedCard.id) {
      setEditedCards(editedCards => [...editedCards, updatedCard])
    }

    setCards(cards => [
      ...cards.slice(0, idx),
      updatedCard,
      ...cards.slice(idx + 1),
    ])
  }

  const deleteCard = (idx: number) => {
    const deletedCard = cards[idx]

    /**
     * If is editing and card has id adds deletedCard to deletedCards array
     * We need to do it to delete this card from the Database later
     */
    if (isEditingDeck(deck) && deletedCard?.id) {
      setDeletedCards(cards => [...cards, deletedCard])
    }

    setCards(cards => [...cards.slice(0, idx), ...cards.slice(idx + 1)])
  }

  const submitDeckCreation = async (values: FormInputValues) => {
    setIsLoading(true)

    try {
      const [uploadConfig, image] = await Promise.all([
        getFileUploadConfigMutation.mutateAsync(),
        compress(values.image[0] as File),
      ])

      const deck = await createNewDeckMutation.mutateAsync({
        ...values,
        cards,
        topics,
        image: uploadConfig.fileName,
        visibility: visibility?.value ?? Visibility.Private,
      })

      await uploadImage(uploadConfig.uploadUrl, image)

      notify.success('Deck criado com sucesso!')
      router.replace(routes.deckDetails(deck.id))
    } catch (error) {
      handleApiClientSideError({ error })
    } finally {
      setIsLoading(false)
    }
  }

  const submitDeckUpdate =
    ({ id: deckId, image: deckImageUrl }: DeckWithCardsAndTopics) =>
    async (values: FormInputValues) => {
      setIsLoading(true)

      try {
        let uploadConfig, image

        /**
         * If the current image is a file it means that a new one was uploaded
         * Else it means that it is the link that was loaded from the backend
         */
        const formImage = values.image[0]
        if (formImage instanceof File) {
          ;[uploadConfig, image] = await Promise.all([
            getFileUploadConfigMutation.mutateAsync(),
            compress(formImage),
          ])
          /**
           * When form image was changed we need to delete de old one from S3 bucket
           */
          deleteFileByUrlMutation.mutate({ url: deckImageUrl })
        }

        /**
         * !Worst case of complexity is a O square which can lead to long time runs
         */
        const editedAndNotDeleted = editedCards.filter(
          edited => !deletedCards.some(deleted => deleted.id === edited.id),
        )

        const mutationParams = {
          ...values,
          id: deckId,
          deletedCards,
          deletedTopics,
          image: uploadConfig?.fileName,
          editedCards: editedAndNotDeleted,
          newCards: cards.filter(({ id }) => !id),
          newTopics: topics.filter(({ id }) => !id),
          visibility: visibility?.value ?? Visibility.Private,
        }

        await updateDeckMutation.mutateAsync(mutationParams)

        /**
         * uploadConfig is only defined when image was modified
         */
        if (uploadConfig) {
          await uploadImage(uploadConfig.uploadUrl, image)
        }

        notify.success('Deck editado com sucesso!')
        router.back()
      } catch (error) {
        handleApiClientSideError({ error })
      } finally {
        setIsLoading(false)
      }
    }

  const generateAiPoweredCards = () => {
    if (isGeneratingAiPoweredCards) return

    const { title } = createNewDeckForm.getValues()

    if (topics.length === 0 || !title) {
      notify.warning(
        'Você precisa cadastrar ao menos 1 tópico e um título para gerar Cards de forma automática',
      )
      return
    }

    if (hasDeckAiPoweredCards) {
      notify.error('Este Deck já possui Cards gerados por uma IA')
      return
    }

    generateAiPoweredCardsMutation()
  }

  /**
   * If isEditingDeck uses update function (currying) else uses the creation function
   */
  const submitDeck = isEditingDeck(deck)
    ? submitDeckUpdate(deck)
    : submitDeckCreation

  const contextValue = {
    ...initialState,

    createNewDeckForm,
    submitDeck,

    topics,
    addTopic,
    deleteTopic,

    cards,
    addCard,
    deleteCard,
    editCard,

    visibility,
    setVisibility,

    generateAiPoweredCards,
    isGeneratingAiPoweredCards,
    hasErrorGeneratingAiPoweredCards,
  }

  return (
    <CreateNewDeckContext.Provider value={contextValue}>
      {children}
    </CreateNewDeckContext.Provider>
  )
}

export function useCreateNewDeckContext() {
  return useContext(CreateNewDeckContext)
}
