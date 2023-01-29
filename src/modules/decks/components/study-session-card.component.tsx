import { RectangleStackIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'

import { Button } from '~/components/button'
import { api } from '~/utils/api'
import { formatToDayMonthYearWithHourAndSeconds } from '~/utils/date-time'
import { routes } from '~/utils/navigation'

export const StudySessionCard = (props: { deckId: string }) => {
  const { deckId } = props

  const router = useRouter()

  const { data, isLoading } =
    api.studySession.getStudySessionBasicInfo.useQuery({
      deckId,
    })

  if (isLoading) {
    return (
      <div className='flex animate-pulse rounded-md bg-primary-200 p-20 sm:p-16'>
        <span className='sr-only'>Loading...</span>
      </div>
    )
  }

  if (!data) return null

  const { lastReviewDate, nextReviewDate } = data

  const hasNextReviewDateAfterNow =
    !nextReviewDate || nextReviewDate > new Date()

  const renderLastReview = () => {
    if (!lastReviewDate) return 'Você ainda não revisou este Deck'

    return `Última revisão: ${formatToDayMonthYearWithHourAndSeconds(
      lastReviewDate,
    )}`
  }

  const renderNextReview = () => {
    return `Próxima revisão: ${formatToDayMonthYearWithHourAndSeconds(
      nextReviewDate,
    )}`
  }

  return (
    <div className='flex flex-col gap-5 rounded-md bg-primary-50 p-5 shadow-md shadow-primary-200 ring-1 ring-primary-900 sm:flex-row'>
      <div className='flex flex-1 items-center gap-5'>
        <RectangleStackIcon className='h-16 w-16 text-primary-900' />
        <div className='flex flex-col text-primary-900'>
          <p className='text-lg sm:text-xl'>Sessão de estudos atual</p>
          <p className='text-base'>{renderLastReview()}</p>
          <p className='text-base'>{renderNextReview()}</p>
        </div>
      </div>
      <div className='hidden h-0 sm:flex sm:h-auto sm:items-end'>
        <Button disabled>Começar Revisão</Button>
      </div>
      <div className='block sm:hidden sm:w-0'>
        <Button
          fullWidth
          disabled={hasNextReviewDateAfterNow}
          onClick={() => router.push(routes.reviewDeck(deckId))}
        >
          Começar Revisão
        </Button>
      </div>
    </div>
  )
}
