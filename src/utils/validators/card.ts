import { z } from 'zod'

export const CardSchema = z.object({
  question: z
    .string({
      required_error: 'A pergunta de um Card é obrigatória',
      invalid_type_error: 'Pergunta inválida',
    })
    .min(1, { message: 'A pergunta de um Card é obrigatória' })
    .max(250, { message: 'A pergunta não pode ter mais que 250 caracteres' }),
  answer: z
    .string({
      required_error: 'A resposta de um Card é obrigatória',
      invalid_type_error: 'Resposta inválida',
    })
    .min(1, { message: 'A resposta de um Card é obrigatória' })
    .max(250, { message: 'A resposta não pode ter mais que 250 caracteres' }),
})
