import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Visibility } from '@prisma/client'
import { useSetAtom } from 'jotai'
import { useRouter } from 'next/router'

import { DECK_VISIBILITY_OPTIONS } from '~/constants'
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

const isEditingDeck = (
  deck?: DeckWithCardsAndTopics | null,
): deck is DeckWithCardsAndTopics => !!deck

export function CreateNewDeckContextProvider(
  props: CreateNewDeckContextProviderProps,
) {
  const { children, deck } = props

  const setIsLoading = useSetAtom(fullScreenLoaderAtom)
  const router = useRouter()

  const createNewDeckMutation = api.decks.createNewDeck.useMutation()
  const updateDeckMutation = api.decks.updateDeck.useMutation()
  const deleteFileByUrlMutation = api.files.deleteFileByUrl.useMutation()
  const getFileUploadConfigMutation =
    api.files.getFileUploadConfig.useMutation()

  const [topics, setTopics] = useState<Array<TopicInput>>(deck?.topics || [])
  const [cards, setCards] = useState<Array<CardInput>>(
    deck?.cards.map(card => card) || [],
  )

  /**
   * Only used when isEditing is true
   */
  const [deletedTopics, setDeletedTopics] = useState<Array<TopicInput>>([])
  const [deletedCards, setDeletedCards] = useState<Array<CardInput>>([])

  const [visibility, setVisibility] = useState(
    DECK_VISIBILITY_OPTIONS.find(option => option.value === deck?.visibility) ||
      DECK_VISIBILITY_OPTIONS[0],
  )

  const createNewDeckForm = useForm<FormInputValues>({
    resolver: zodResolver(DeckInputFormSchema),
    defaultValues: {
      title: deck?.title ?? '',
      description: deck?.description ?? '',
      image: deck?.image,
    },
  })

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
     * We need to do it to delete this topics from the Database
     */
    if (isEditingDeck(deck) && deletedTopic?.id) {
      setDeletedTopics(topics => [...topics, deletedTopic])
    }

    setTopics(topics => [...topics.slice(0, idx), ...topics.slice(idx + 1)])
  }

  const addCard = (card: CardInput) => {
    setCards(cards => [...cards, card])
  }

  const deleteCard = (idx: number) => {
    const deletedCard = cards[idx]

    /**
     * If is editing and card has id adds deletedCard to deletedCards array
     * We need to do it to delete this card from the Database
     */
    if (isEditingDeck(deck) && deletedCard?.id) {
      setDeletedCards(cards => [...cards, deletedCard])
    }

    setCards(cards => [...cards.slice(0, idx), ...cards.slice(idx + 1)])
  }

  const editCard = (idx: number, updatedCard: CardInput) => {
    setCards(cards => [
      ...cards.slice(0, idx),
      updatedCard,
      ...cards.slice(idx + 1),
    ])
  }

  const submitDeckCreation = async (values: FormInputValues) => {
    setIsLoading(true)

    try {
      const [uploadConfig, image] = await Promise.all([
        getFileUploadConfigMutation.mutateAsync(),
        compress(values.image[0] as File),
      ])

      const safeVisibility = visibility ? visibility.value : Visibility.Private

      await createNewDeckMutation.mutateAsync({
        ...values,
        topics,
        cards,
        visibility: safeVisibility,
        image: uploadConfig.fileName,
      })
      await uploadImage(uploadConfig.uploadUrl, image)

      notify.success('Deck criado com sucesso!')
      router.replace(routes.home())
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
          deleteFileByUrlMutation.mutate({ url: deckImageUrl })
        }

        const safeVisibility = visibility
          ? visibility.value
          : Visibility.Private
        /**
         * Only topics and cards without id where recently added
         */
        const newTopics = topics.filter(({ id }) => !id)
        const newCards = cards.filter(({ id }) => !id)

        await updateDeckMutation.mutateAsync({
          ...values,
          id: deckId,
          newCards,
          deletedCards,
          newTopics,
          deletedTopics,
          image: uploadConfig?.fileName,
          visibility: safeVisibility,
        })

        if (uploadConfig) {
          await uploadImage(uploadConfig.uploadUrl, image)
        }

        notify.success('Deck criado com sucesso!')
        router.replace(routes.home())
      } catch (error) {
        console.log(error)
        handleApiClientSideError({ error })
      } finally {
        setIsLoading(false)
      }
    }

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
