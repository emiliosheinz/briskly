import type { Dispatch, SetStateAction } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import type { Deck, Topic, Visibility, Card } from '@prisma/client'
import noop from 'lodash/noop'
import { z } from 'zod'

import type { Option } from '~/components/radio-group'
import { DECK_VISIBILITY_OPTIONS } from '~/constants'
import type { CardInputSchema } from '~/utils/validators/card'
import { DeckInputSchema } from '~/utils/validators/deck'

export const DeckInputFormSchema = DeckInputSchema.pick({
  title: true,
  description: true,
}).extend({
  image: z.custom<FileList>(val => val instanceof FileList && val.length > 0, {
    message: 'A imagem do Deck é obrigatória',
  }),
})

export type FormInputValues = z.infer<typeof DeckInputFormSchema>

export type CardInput = z.infer<typeof CardInputSchema>

export type DeckWithCardsAndTopics = Deck & {
  cards: Array<Card>
  topics: Array<Topic>
}

export type CreateNewDeckContextProviderProps = {
  children: React.ReactNode
  deck?: DeckWithCardsAndTopics | null
}

export type CreateNewDeckContextState = {
  createNewDeckForm?: UseFormReturn<FormInputValues>
  submitDeckCreation: (values: FormInputValues) => Promise<void>

  topics: Array<string>
  addTopic: (topic: string) => void
  deleteTopic: (idx: number) => void

  cards: Array<CardInput>
  addCard: (card: CardInput) => void
  deleteCard: (idx: number) => void
  editCard: (idx: number, updatedCard: CardInput) => void

  visibilityOptions: Array<Option<Visibility>>
  visibility?: Option<Visibility>
  setVisibility: Dispatch<SetStateAction<Option<Visibility> | undefined>>
}

export const initialState: CreateNewDeckContextState = {
  submitDeckCreation: () => new Promise(noop),

  topics: [],
  addTopic: noop,
  deleteTopic: noop,

  cards: [],
  addCard: noop,
  deleteCard: noop,
  editCard: noop,

  visibilityOptions: DECK_VISIBILITY_OPTIONS,
  visibility: DECK_VISIBILITY_OPTIONS[0],
  setVisibility: noop,
}
