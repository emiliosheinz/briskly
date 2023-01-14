import { z } from 'zod'

export const TopicSchema = z
  .string({
    required_error: 'O tópico é obrigatório',
    invalid_type_error: 'Tópico inválido',
  })
  .min(1, { message: 'O tópico é obrigatório' })
