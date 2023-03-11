import { Visibility } from '@prisma/client'
import { z } from 'zod'

import { MAX_TOPICS_PER_DECK_AND_USER } from '~/constants'

import { CardInputSchema } from './card'
import { TopicInputSchema } from './topic'

export const DeckInputSchema = z.object({
  id: z.string().optional(),
  title: z
    .string({
      required_error: 'O título do Deck é obrigatório',
      invalid_type_error: 'Título do Deck inválido',
    })
    .min(1, { message: 'O título do Deck é obrigatório' })
    .max(50, { message: 'O título não pode ter mais que 50 caracteres' }),
  description: z
    .string({
      required_error: 'A descrição do Deck é obrigatória',
      invalid_type_error: 'Descrição do Deck inválida',
    })
    .min(1, { message: 'A descrição do Deck é obrigatória' })
    .max(250, { message: 'A descrição não pode ter mais que 250 caracteres' }),
  image: z
    .string({
      required_error: 'A imagem do Deck é obrigatória',
      invalid_type_error: 'Imagem do Deck inválida',
    })
    .min(1, { message: 'A imagem do Deck é obrigatória' }),
  topics: z.array(TopicInputSchema).max(MAX_TOPICS_PER_DECK_AND_USER, {
    message: `O número máximo de tópicos por Deck é ${MAX_TOPICS_PER_DECK_AND_USER}`,
  }),
  cards: z
    .array(CardInputSchema)
    .min(1, { message: 'Um deck deve ter ao menos 1 Card' }),
  visibility: z.nativeEnum(Visibility, {
    required_error: 'Defina a visibilidade do seu Deck',
    invalid_type_error: 'Visibilidade definida inválida',
  }),
})

export const UpdateDeckInputSchema = DeckInputSchema.pick({
  title: true,
  description: true,
  visibility: true,
}).extend({
  id: z.string(),
  image: DeckInputSchema.shape.image.optional(),
  deletedTopics: z.array(TopicInputSchema).optional(),
  newTopics: z.array(TopicInputSchema).optional(),
  deletedCards: z.array(CardInputSchema).optional(),
  newCards: z.array(CardInputSchema).optional(),
  editedCards: z.array(CardInputSchema).optional(),
})
