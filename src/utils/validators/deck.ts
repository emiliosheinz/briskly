import { z } from 'zod'

import { MAX_TOPICS_PER_DECK } from '~/constants'

import { TopicSchema } from './topic'

export const DeckSchema = z.object({
  title: z
    .string({
      required_error: 'O título do Deck é obrigatório',
      invalid_type_error: 'Título do Deck inválido',
    })
    .min(1, { message: 'O título do Deck é obrigatório' }),
  description: z
    .string({
      required_error: 'A descrição do Deck é obrigatória',
      invalid_type_error: 'Descrição do Deck inválida',
    })
    .min(1, { message: 'A descrição do Deck é obrigatória' }),
  image: z
    .string({
      required_error: 'A imagem do Deck é obrigatória',
      invalid_type_error: 'Imagem do Deck inválida',
    })
    .min(1, { message: 'A imagem do Deck é obrigatória' }),
  topics: z
    .array(TopicSchema)
    .max(MAX_TOPICS_PER_DECK, {
      message: `O número máximo de tópicos por Deck é ${MAX_TOPICS_PER_DECK}`,
    })
    .optional(),
})
