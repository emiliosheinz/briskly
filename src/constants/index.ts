import { Visibility } from '@prisma/client'

import type { Option } from '~/components/radio-group'

export const MAX_VALID_ANSWERS_PER_CARD = 5
export const MINIMUM_ACCEPTED_SIMILARITY = 0.9
export const MAX_TOPICS_PER_DECK_AND_USER = 5
export const ITEMS_PER_PAGE = 30

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
    description: 'Todos com acesso direto ao link do Deck',
  },
]

export const STUDY_SESSION_BOXES = [
  { reviewGapInHours: 24 },
  { reviewGapInHours: 24 * 3 },
  { reviewGapInHours: 24 * 7 },
  { reviewGapInHours: 24 * 15 },
  { reviewGapInHours: 24 * 30 },
]
