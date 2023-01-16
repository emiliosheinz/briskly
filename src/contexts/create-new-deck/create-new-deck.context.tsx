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
  Card,
  CreateNewDeckContextProviderProps,
  CreateNewDeckContextState,
  FormValues,
} from './create-new-deck.types'
import { DeckFormSchema } from './create-new-deck.types'
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
  const { children } = props

  const setIsLoading = useSetAtom(fullScreenLoaderAtom)
  const router = useRouter()

  const createNewDeckMutation = api.decks.createNewDeck.useMutation()
  const getFileUploadConfigMutation =
    api.files.getFileUploadConfig.useMutation()

  const [topics, setTopics] = useState<Array<string>>([])
  const [cards, setCards] = useState<Array<Card>>([])
  const [visibility, setVisibility] = useState(DECK_VISIBILITY_OPTIONS[0])

  const createNewDeckForm = useForm<FormValues>({
    resolver: zodResolver(DeckFormSchema),
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

  const addCard = (card: Card) => {
    setCards(cards => [...cards, card])
  }

  const deleteCard = (idx: number) => {
    setCards(cards => [...cards.slice(0, idx), ...cards.slice(idx + 1)])
  }

  const editCard = (idx: number, updatedCard: Card) => {
    setCards(cards => [
      ...cards.slice(0, idx),
      updatedCard,
      ...cards.slice(idx + 1),
    ])
  }

  const submitDeckCreation = async (values: FormValues) => {
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
