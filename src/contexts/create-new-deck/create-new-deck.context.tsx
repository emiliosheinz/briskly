import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSetAtom } from 'jotai'
import { useRouter } from 'next/router'

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

const uploadImageWithoutAwait = (uploadUrl: string, image?: File) => {
  if (!image) return

  fetch(uploadUrl, {
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

      await createNewDeckMutation.mutateAsync({
        ...values,
        topics,
        cards,
        image: uploadConfig.fileName,
      })

      uploadImageWithoutAwait(uploadConfig.uploadUrl, image)
      notify.success('Deck criado com sucesso!')
      router.replace(routes.home())
    } catch (error) {
      handleApiClientSideError({ error })
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue = {
    createNewDeckForm,
    submitDeckCreation,

    topics,
    addTopic,
    deleteTopic,

    cards,
    addCard,
    deleteCard,
    editCard,
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
