import { RectangleStackIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useSetAtom } from 'jotai'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import { Button } from '~/components/button'
import { Tooltip } from '~/components/tooltip'
import { api, handleApiClientSideError } from '~/utils/api'
import { fullScreenLoaderAtom } from '~/utils/atoms'
import { formatToDayMonthYearWithHourAndSeconds } from '~/utils/date-time'
import { routes } from '~/utils/navigation'
import { notify } from '~/utils/toast'

export const StudySessionCard = (props: { deckId: string }) => {
  const { deckId } = props

  const router = useRouter()
  const apiContext = api.useContext()
  const setIsLoading = useSetAtom(fullScreenLoaderAtom)
  const { data: session } = useSession()

  const { data, isLoading, isError } =
    api.studySession.getStudySessionBasicInfo.useQuery({
      deckId,
    })
  const createStudySessionMutation = api.studySession.create.useMutation({
    onSuccess: () => {
      apiContext.decks.toBeReviewed.invalidate()
      apiContext.decks.withStudySession.invalidate()
      apiContext.studySession.getStudySessionBasicInfo.invalidate({ deckId })
    },
  })
  const deleteStudySessionMutation = api.studySession.delete.useMutation({
    onSuccess: () => {
      apiContext.decks.toBeReviewed.invalidate()
      apiContext.decks.withStudySession.invalidate()
      apiContext.studySession.getStudySessionBasicInfo.invalidate({ deckId })
      notify.success('Sessão de estudo deletada com sucesso!')
    },
  })

  if (isLoading) {
    return (
      <div className='flex animate-pulse rounded-md bg-primary-200 p-20 sm:p-16'>
        <span className='sr-only'>Loading...</span>
      </div>
    )
  }

  if (isError) return null

  const { lastReviewDate, nextReviewDate } = data || {}
  const hasActiveStudySession = !!data
  const isUserLoggedIn = !!session?.user
  const hasNextReviewDateAfterNow =
    !nextReviewDate || nextReviewDate > new Date()
  const shouldDisableButton = hasActiveStudySession
    ? hasNextReviewDateAfterNow
    : false

  const renderButtonLabel = () => {
    if (hasActiveStudySession) return 'Começar Revisão'
    return 'Estudar com este Deck'
  }

  const handleButtonClick = async () => {
    if (hasActiveStudySession) {
      router.push(routes.reviewDeck(deckId))
    } else {
      if (!isUserLoggedIn) {
        notify.warning(
          'Você precisa estar logado para começar a estudar com este Deck',
        )
        return
      }

      try {
        setIsLoading(true)

        await createStudySessionMutation.mutateAsync({ deckId })

        notify.success('Sessão de estudo criada com sucesso!')
        router.push(routes.reviewDeck(deckId))
      } catch (error) {
        handleApiClientSideError({ error })
      } finally {
        setIsLoading(false)
      }
    }
  }

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

  const renderMainContent = () => {
    if (!data) {
      return (
        <div className='flex flex-col text-primary-900'>
          <p className='text-lg sm:text-xl'>Você está pronto?</p>
          <p className='text-base '>
            Comece a estudar agora mesmo e você verá o seu conhecimento decolar
            🚀
          </p>
        </div>
      )
    }

    return (
      <div className='flex flex-col text-primary-900'>
        <p className='text-lg sm:text-xl'>Sessão de estudos atual</p>
        <p className='text-base'>{renderLastReview()}</p>
        <p className='text-base'>{renderNextReview()}</p>
      </div>
    )
  }

  const renderDeleteButton = (params?: { fullWidth: boolean }) => {
    if (!hasActiveStudySession) return null

    return (
      <Button
        variant='bad'
        fullWidth={params?.fullWidth ?? false}
        onClick={() => deleteStudySessionMutation.mutate({ deckId })}
        isLoading={deleteStudySessionMutation.isLoading}
      >
        <TrashIcon className='h-5 w-5 text-error-700' />
        Apagar Sessão
      </Button>
    )
  }

  const renderButtons = () => {
    return (
      <>
        <div className='hidden h-0 gap-5 md:flex md:h-auto md:items-end'>
          {renderDeleteButton()}
          <Button disabled={shouldDisableButton} onClick={handleButtonClick}>
            {renderButtonLabel()}
          </Button>
        </div>
        <div className='block space-y-5 md:hidden md:w-0'>
          {renderDeleteButton({ fullWidth: true })}
          <Button
            fullWidth
            disabled={shouldDisableButton}
            onClick={handleButtonClick}
          >
            {renderButtonLabel()}
          </Button>
        </div>
      </>
    )
  }

  const renderTooltip = () => {
    if (hasActiveStudySession) {
      return (
        <Tooltip hint='Ter uma sessão de estudos ativa em um Deck significa que você poderá revisar periodicamente os Cards dele. Caso o botão "Começar Revisão" esteja ativo significa que você tem cards a serem revisados, caso contrário significa que todos os cards foram revisados e você deve voltar aqui novamente na próxima data de revisão indicada.' />
      )
    }
    return (
      <Tooltip hint='Deixe que Briskly faça todo o trabalho por você! Com nossa plataforma, você pode se concentrar no que realmente importa: aprender. Não se preocupe com nada, desde a organização dos seus Cards até o agendamento de seus estudos, Briskly irá cuidar de tudo para você. Comece agora e experimente a eficiência em primeira mão' />
    )
  }

  return (
    <div className='relative flex flex-col gap-5 rounded-md bg-primary-50 p-5 shadow-md shadow-primary-200 ring-1 ring-primary-900 md:flex-row'>
      <div className='flex flex-1 items-center gap-5'>
        <RectangleStackIcon className='h-16 w-16 text-primary-900' />
        {renderMainContent()}
      </div>
      {renderButtons()}
      <div className='absolute right-2 top-2'>{renderTooltip()}</div>
    </div>
  )
}
