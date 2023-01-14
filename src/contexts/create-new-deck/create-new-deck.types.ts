import type { UseFormReturn } from 'react-hook-form'

import noop from 'lodash/noop'
import { z } from 'zod'

import type { CardSchema } from '~/utils/validators/card'
import { DeckSchema } from '~/utils/validators/deck'

export const DeckFormSchema = DeckSchema.pick({
  title: true,
  description: true,
}).extend({
  image: z.custom<FileList>(val => val instanceof FileList && val.length > 0, {
    message: 'A imagem do Deck é obrigatória',
  }),
})

export type FormValues = z.infer<typeof DeckFormSchema>

export type Card = z.infer<typeof CardSchema>

export type CreateNewDeckContextProviderProps = {
  children: React.ReactNode
}

export type CreateNewDeckContextState = {
  createNewDeckForm?: UseFormReturn<FormValues>
  submitDeckCreation: (values: FormValues) => Promise<void>

  topics: Array<string>
  addTopic: (topic: string) => void
  deleteTopic: (idx: number) => void

  cards: Array<Card>
  addCard: (card: Card) => void
  deleteCard: (idx: number) => void
  editCard: (idx: number, updatedCard: Card) => void
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
}
