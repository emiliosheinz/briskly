import { useState } from 'react'

import { HandThumbDownIcon } from '@heroicons/react/24/outline'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { Button } from '~/components/button'
import { Card } from '~/components/card'
import { Feedback } from '~/components/feedback'
import { Loader } from '~/components/loader'
import { Modal } from '~/components/modal'
import { TextArea } from '~/components/text-area'
import { Tooltip } from '~/components/tooltip'
import { useDeckReview } from '~/modules/decks/review/hooks/use-deck-review.hook'
import type { WithAuthentication } from '~/types/auth'
import { classNames } from '~/utils/css'
import { routes } from '~/utils/navigation'

export const getServerSideProps: GetServerSideProps<{
  deckId: string
}> = async context => {
  const deckId = context.params?.id as string

  if (!deckId) return { notFound: true }

  return {
    props: {
      deckId,
    },
  }
}

const ReviewDeckPage: WithAuthentication<
  NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>
> = props => {
  const { deckId } = props

  const router = useRouter()
  const [
    isReportAnswerValidationModalOpen,
    setIsReportAnswerValidationModalOpen,
  ] = useState(false)
  const [reportedCards, setReportedCards] = useState<string[]>([])

  const {
    form,
    deck,
    cards,
    answer,
    isLastCard,
    answerResult,
    currentCard,
    goToNextCard,
    currentCardIdx,
    isLoadingCards,
    cardAnswerStage,
    hasErrorLoadingCards,
  } = useDeckReview(deckId)

  const isLoadingAnswer = cardAnswerStage === 'loading'
  const shouldDisableButtonsAndInputs = isLoadingAnswer || !!answerResult
  const [userLastAnswer] = form.watch(['answer'])

  const okButton = {
    buttonLabel: 'Ok',
    onButtonClick: () => {
      router.replace(routes.deckDetails(deckId))
    },
  }

  const renderCardContent = () => {
    if (isLoadingAnswer) {
      return (
        <div className='flex flex-col items-center'>
          <Loader />
          <span className='sr-only'>Validando Resposta</span>
        </div>
      )
    }

    if (cardAnswerStage === 'question') {
      return <p className='text-base md:text-xl'>{currentCard?.question}</p>
    }

    if (cardAnswerStage === 'error')
      return (
        <Tooltip hint='Se o erro persistir você pode passar este Card pressionando o botão "Passar". Dessa forma você poderá tentar responder este Card novamente na sua próxima revisão.'>
          <span className='max-w-xs text-base text-error-700 md:text-xl'>
            Houve um erro ao validar a sua resposta. Tente novamente mais tarde!
          </span>
        </Tooltip>
      )

    if (!answerResult?.isRight) {
      return <span className='text-5xl sm:text-6xl'>😪</span>
    }

    return <span className='text-5xl sm:text-6xl'>🎉</span>
  }

  const renderButtons = () => {
    if (cardAnswerStage === 'validation') {
      return (
        <Button type='button' fullWidth onClick={goToNextCard}>
          {isLastCard ? 'Ok' : 'Próximo Card'}
        </Button>
      )
    }

    return (
      <>
        <Button
          fullWidth
          disabled={shouldDisableButtonsAndInputs}
          variant='bad'
          type='button'
          onClick={() => answer({ answer: undefined })}
        >
          Passar
        </Button>
        <Button disabled={shouldDisableButtonsAndInputs} fullWidth>
          Responder
        </Button>
      </>
    )
  }

  const renderReportButton = () => {
    const isCurrentCardAlreadyReported = reportedCards.includes(
      currentCard?.id ?? '',
    )

    if (
      answerResult?.isRight ||
      !userLastAnswer ||
      isCurrentCardAlreadyReported
    ) {
      return null
    }

    return (
      <button
        className='absolute bottom-0 right-0 p-5'
        type='button'
        onClick={() => setIsReportAnswerValidationModalOpen(true)}
        data-testid='report-button'
      >
        <HandThumbDownIcon className='h-8 w-8' />
      </button>
    )
  }

  const renderContent = () => {
    if (isLoadingCards) {
      return (
        <div className='flex w-full animate-pulse flex-col gap-5'>
          <span className='aspect-video w-full rounded-md bg-primary-200' />
          <span className='h-40 w-full rounded-md bg-primary-200 sm:h-44' />
          <span className='h-14 w-full rounded-md bg-primary-200' />
        </div>
      )
    }

    if (hasErrorLoadingCards) {
      return (
        <Feedback
          title='Erro inesperado'
          subtitle='Houve um erro ao iniciar revisão. Por favor, tente novamente mais tarde!'
          {...okButton}
        />
      )
    }

    if (cardAnswerStage === 'done') {
      return (
        <Feedback
          title='🎉 Parabéns!!!'
          customImageSrc='/images/swinging.svg'
          subtitle='Você revisou todos os Cards pendentes. Volte novamente na sua próxima revisão.'
          {...okButton}
        />
      )
    }

    if (!cards?.length) {
      return (
        <Feedback
          title='🎉 Woohooo!!!'
          customImageSrc='/images/swinging.svg'
          subtitle={() => (
            <>
              No momento nenhum Card precisa ser revisado. Por favor, volte mais
              tarde
              <Tooltip hint='Você não tem cards para revisar pois Briskly utiliza a metodologia de repetição espaçada para determinar quando você deve revisar um Card.' />
            </>
          )}
          {...okButton}
        />
      )
    }

    return (
      <div className='flex w-full flex-col gap-5'>
        <p className='text-center'>
          {currentCardIdx + 1}/{cards?.length}
        </p>
        <div className='group [perspective:1000px]'>
          <div
            className={classNames(
              'relative aspect-video w-full transition-all duration-500 [transform-style:preserve-3d]',
              cardAnswerStage === 'validation'
                ? '[transform:rotateY(180deg)]'
                : '',
            )}
          >
            <div className='absolute w-full [backface-visibility:hidden]'>
              <Card fullWidth>{renderCardContent()}</Card>
            </div>
            <div className='absolute w-full [transform:rotateY(180deg)] [backface-visibility:hidden]'>
              <Card fullWidth>
                <span className='text-base md:text-xl'>
                  {answerResult?.answer || 'Resposta não foi encontrada'}
                </span>
                {renderReportButton()}
              </Card>
            </div>
          </div>
        </div>
        <form
          className='flex flex-col gap-3'
          onSubmit={form.handleSubmit(values => answer(values))}
        >
          <TextArea
            id='answer'
            label='Resposta'
            {...form.register('answer')}
            disabled={shouldDisableButtonsAndInputs}
            error={form.formState?.errors['answer']?.message as string}
            data-testid='answer-input'
          />
          <div className='flex gap-5'>{renderButtons()}</div>
        </form>
      </div>
    )
  }

  const renderModal = () => {
    return (
      <Modal.ReportAnswerValidation
        isOpen={isReportAnswerValidationModalOpen}
        setIsOpen={setIsReportAnswerValidationModalOpen}
        answer={userLastAnswer}
        cardId={currentCard?.id ?? ''}
        onReportSuccess={reportedCardId => {
          setReportedCards(prev => [...prev, reportedCardId])
        }}
      />
    )
  }

  return (
    <>
      <Head>
        <title>{`Revisando ${deck?.title ?? 'Carregando...'}`}</title>
        <meta name='description' content={deck?.description ?? ''} />
      </Head>
      <div className='mx-auto flex w-full max-w-xl justify-center'>
        {renderContent()}
      </div>
      {renderModal()}
    </>
  )
}

ReviewDeckPage.requiresAuthentication = true

export default ReviewDeckPage
