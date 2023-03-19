import { BoltIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'

import { Button } from '~/components/button'
import { api } from '~/utils/api'
import { routes } from '~/utils/navigation'

type AnswerValidationReportsCardProps = {
  deckId: string
}

export function AnswerValidationReportsCard(
  props: AnswerValidationReportsCardProps,
) {
  const { deckId } = props

  const router = useRouter()

  const {
    isError,
    isLoading,
    data: hasDeckPendingAnswerValidationReports,
  } = api.answerValidationReports.hasDeckPendingAnswerValidationReports.useQuery(
    { deckId },
  )

  if (isLoading) {
    return (
      <div className='flex animate-pulse rounded-md bg-primary-200 p-20 sm:p-16'>
        <span className='sr-only'>Loading...</span>
      </div>
    )
  }

  if (isError || !hasDeckPendingAnswerValidationReports) return null

  const goToAnswerValidationReports = () => {
    router.push(routes.answerValidationReports(deckId))
  }

  return (
    <div className='relative flex flex-col gap-5 rounded-md bg-primary-50 p-5 shadow-md shadow-primary-200 ring-1 ring-primary-900 sm:flex-row'>
      <div className='flex flex-1 items-center gap-5'>
        <BoltIcon className='h-16 w-16 text-primary-900' />
        <div className='flex flex-col text-primary-900'>
          <p className='text-lg sm:text-xl'>Melhore o seu Deck agora mesmo!</p>
          <p className='max-w-2xl text-base'>
            Usuários solicitaram revisão das respostas de alguns dos cards do
            seu Deck. Acesse a seção de solicitações para fazer a revisão 🤗
          </p>
        </div>
      </div>
      <div className='flex items-end'>
        <div className='hidden h-0 sm:flex sm:h-auto sm:items-end'>
          <Button onClick={goToAnswerValidationReports}>
            Acessar solicitações
          </Button>
        </div>
        <div className='block w-full sm:hidden sm:w-0'>
          <Button fullWidth onClick={goToAnswerValidationReports}>
            Acessar solicitações
          </Button>
        </div>
      </div>
    </div>
  )
}
