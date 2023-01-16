import { Button } from '../button'
import type { ErrorProps } from './deck-card-list.types'

export function Error(props: ErrorProps) {
  const { onRetryPress } = props

  return (
    <div className='m-auto flex max-w-xl flex-col items-center gap-10 p-10 sm:p-20'>
      <h2 className='text-center text-xl text-primary-900'>
        ❌ Ocorreu um erro ao buscas os seus Decks. Por favor, tente novamente
        mais tarde!
      </h2>
      <Button onClick={onRetryPress} variant='secondary'>
        Tentar Novamente
      </Button>
    </div>
  )
}
