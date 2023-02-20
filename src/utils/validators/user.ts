import { z } from 'zod'

import { MAX_TOPICS_PER_DECK_AND_USER } from '~/constants'

import { TopicInputSchema } from './topic'

export const UpdateUserInputSchema = z.object({
  name: z
    .string({
      required_error: 'O campo nome é obrigatório',
      invalid_type_error: 'O nome é inválido',
    })
    .min(1, { message: 'O campo nome é obrigatório' })
    .max(250, { message: 'O nome dever ter no máximo 250 caracteres' }),
  description: z
    .string({
      required_error: 'O campo descrição é obrigatório',
      invalid_type_error: 'A descrição é inválida',
    })
    .min(1, { message: 'O campo descrição é obrigatório' })
    .max(500, { message: 'A descrição dever ter no máximo 250 caracteres' }),
  newTopics: z
    .array(TopicInputSchema)
    .max(MAX_TOPICS_PER_DECK_AND_USER, {
      message: `O número máximo de tópicos por usuário é ${MAX_TOPICS_PER_DECK_AND_USER}`,
    })
    .optional(),
  deletedTopics: z.array(TopicInputSchema).optional(),
})
