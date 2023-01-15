import { Visibility } from '@prisma/client'

import type { Option } from '~/components/radio-group'

export const MAX_TOPICS_PER_DECK = 5

export const DECK_VISIBILITY_OPTIONS: Array<Option<Visibility>> = [
  {
    name: 'Público',
    value: Visibility.Public,
    description: 'Todas as pessoas com acesso a este site',
  },
  {
    name: 'Privado',
    value: Visibility.Private,
    description: 'Apenas você e pessoas com acesso a sua conta',
  },
  {
    name: 'Apenas com link',
    value: Visibility.WithLink,
    description: 'Todo com acesso direto ao link do Deck',
  },
]
