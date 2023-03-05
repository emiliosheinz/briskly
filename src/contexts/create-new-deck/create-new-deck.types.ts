import type { Dispatch, SetStateAction } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import type { Deck, Topic, Visibility, Card } from '@prisma/client'
import noop from 'lodash/noop'
import { z } from 'zod'

import type { Option } from '~/components/radio-group'
import { DECK_VISIBILITY_OPTIONS } from '~/constants'
import type { CardInputSchema } from '~/utils/validators/card'
import { DeckInputSchema } from '~/utils/validators/deck'
import type { TopicInputSchema } from '~/utils/validators/topic'

export const DeckInputFormSchema = DeckInputSchema.pick({
  title: true,
  description: true,
}).extend({
  image: z.custom<FileList | string>(
    val =>
      (val instanceof FileList || typeof val === 'string') && val.length > 0,
    {
      message: 'A imagem do Deck é obrigatória',
    },
  ),
})

export type FormInputValues = z.infer<typeof DeckInputFormSchema>

export type CardInput = z.infer<typeof CardInputSchema>
export type TopicInput = z.infer<typeof TopicInputSchema>

export type DeckWithCardsAndTopics = Deck & {
  cards: Array<Card>
  topics: Array<Topic>
}

export type CreateNewDeckContextProviderProps = {
  children: React.ReactNode
  deck?: DeckWithCardsAndTopics | null
}

export type GenerateAiPoweredCardsParams = { topics: Array<TopicInput> }

export type CreateNewDeckContextState = {
  createNewDeckForm?: UseFormReturn<FormInputValues>
  submitDeck: (values: FormInputValues) => Promise<void>

  topics: Array<TopicInput>
  addTopic: (topic: string) => void
  deleteTopic: (idx: number) => void

  cards: Array<CardInput>
  addCard: (card: CardInput) => void
  deleteCard: (idx: number) => void
  editCard: (idx: number, updatedCard: CardInput) => void

  visibilityOptions: Array<Option<Visibility>>
  visibility?: Option<Visibility>
  setVisibility: Dispatch<SetStateAction<Option<Visibility> | undefined>>

  generateAiPoweredCards: (params: GenerateAiPoweredCardsParams) => void
  isGeneratingAiPoweredCards: boolean
  hasErrorGeneratingAiPoweredCards: boolean
}

export const initialState: CreateNewDeckContextState = {
  submitDeck: () => new Promise(noop),

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

  generateAiPoweredCards: noop,
  isGeneratingAiPoweredCards: false,
  hasErrorGeneratingAiPoweredCards: false,
}
