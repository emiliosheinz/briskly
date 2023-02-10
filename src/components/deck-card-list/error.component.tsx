import { Feedback } from '~/components/feedback'

import type { ErrorProps } from './deck-card-list.types'

export function Error(props: ErrorProps) {
  const { onRetryPress } = props

  return (
    <Feedback
      title='Erro inesperado!'
      subtitle='Ocorreu um erro ao buscar os seus Decks. Por favor, tente novamente mais tarde!'
      buttonLabel='Tentar Novamente'
      onButtonClick={onRetryPress}
    />
  )
}
