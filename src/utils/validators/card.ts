import { z } from 'zod'

import { MAX_VALID_ANSWERS_PER_CARD } from '~/constants'

export const CardInputSchema = z.object({
  id: z.string().optional(),
  isAiPowered: z.boolean().optional(),
  question: z
    .string({
      required_error: 'A pergunta de um Card é obrigatória',
      invalid_type_error: 'Pergunta inválida',
    })
    .min(1, { message: 'A pergunta de um Card é obrigatória' })
    .max(250, { message: 'A pergunta não pode ter mais que 250 caracteres' }),
  validAnswers: z
    .string({
      required_error: 'A resposta de um Card é obrigatória',
      invalid_type_error: 'Resposta inválida',
    })
    .min(1, { message: 'A resposta de um Card é obrigatória' })
    .refine(
      (answers: string) =>
        answers.split(';').length <= MAX_VALID_ANSWERS_PER_CARD,
      `Um Card não pode ter mais que ${10} respostas válidas`,
    )
    .refine(
      (answers: string) =>
        answers.split(';').every(answer => answer.length <= 250),
      'Cada resposta não pode ter mais que 250 caracteres',
    ),
})
