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
  FormInputValues,
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

export function CreateNewDeckContextProvider(
  props: CreateNewDeckContextProviderProps,
) {
  const { children, deck } = props

  // const isEditing = !deck

  const setIsLoading = useSetAtom(fullScreenLoaderAtom)
  const router = useRouter()

  const createNewDeckMutation = api.decks.createNewDeck.useMutation()
  const getFileUploadConfigMutation =
    api.files.getFileUploadConfig.useMutation()

  const [topics, setTopics] = useState<Array<string>>(
    deck?.topics.map(topic => topic.title) || [],
  )
  const [cards, setCards] = useState<Array<CardInput>>(
    deck?.cards.map(card => card) || [],
  )

  console.log(deck?.visibility, DECK_VISIBILITY_OPTIONS[0])
  const [visibility, setVisibility] = useState(
    DECK_VISIBILITY_OPTIONS.find(option => option.value === deck?.visibility) ||
      DECK_VISIBILITY_OPTIONS[0],
  )

  const createNewDeckForm = useForm<FormInputValues>({
    resolver: zodResolver(DeckInputFormSchema),
    defaultValues: {
      title: deck?.title ?? '',
      description: deck?.description ?? '',
      // TODO rever lógica para edição da imagem
      // image: deck?.image,
    },
  })

  const addTopic = (topic: string) => {
    setTopics(topics => [
      ...topics.filter(t => t !== topic),
      topic.toLowerCase(),
    ])
  }

  const deleteTopic = (idx: number) => {
    setTopics(topics => [...topics.slice(0, idx), ...topics.slice(idx + 1)])
  }

  const addCard = (card: CardInput) => {
    setCards(cards => [...cards, card])
  }

  const deleteCard = (idx: number) => {
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
        compress(values.image[0]),
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

  const contextValue = {
    ...initialState,

    createNewDeckForm,
    submitDeckCreation,

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
