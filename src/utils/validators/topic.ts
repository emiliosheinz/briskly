import { z } from 'zod'

export const TopicInputSchema = z.object({
  id: z.string().optional(),
  title: z
    .string({
      required_error: 'O tópico é obrigatório',
      invalid_type_error: 'Tópico inválido',
    })
    .min(1, { message: 'O tópico é obrigatório' })
    .max(50, { message: 'O tópico tem limite de 50 caracteres' }),
})
