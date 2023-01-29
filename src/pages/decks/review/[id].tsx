import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import Head from 'next/head'
import { z } from 'zod'

import { Button } from '~/components/button'
import { Card } from '~/components/card'
import { Loader } from '~/components/loader'
import { TextArea } from '~/components/text-area'
import type { WithAuthentication } from '~/types/auth'
import { api } from '~/utils/api'
import { classNames } from '~/utils/css'

type FormInputValues = {
  answer: string
}

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

/**
 * TODO quando revisar o ultimo card atualizar o lastReview date do box
 */

const ReviewDeck: WithAuthentication<
  NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>
> = props => {
  const { deckId } = props

  const {
    isLoading,
    isError,
    data: { studySessionBoxes } = {},
  } = api.studySession.getReviewSession.useQuery(
    { deckId },
    { refetchOnWindowFocus: false },
  )
  const cards = studySessionBoxes?.flatMap(({ cards }) => cards)

  const {
    isLoading: isValidatingAnswer,
    data: answerResult,
    isError: hasErrorValidatingCard,
    mutate: answerCard,
    reset: resetAnswerState,
  } = api.studySession.answerStudySessionCard.useMutation()

  const finishStudySessionForMutation =
    api.studySession.finishStudySessionForBox.useMutation()

  const {
    handleSubmit,
    register,
    formState,
    reset: resetForm,
  } = useForm<FormInputValues>({
    resolver: zodResolver(
      z.object({ answer: z.string().min(1, 'Campo obrigatório') }),
    ),
  })

  const [currentCardIdx, setCurrentCardIdx] = useState(0)
  const [currentCardStage, setCurrentCardStage] = useState<
    'question' | 'answer' | 'validation' | 'finished'
  >('question')

  const validationTimeout = useRef<NodeJS.Timeout>()

  const currentCard = cards?.[currentCardIdx]
  const shouldDisableButtonsAndInputs = isValidatingAnswer || !!answerResult

  useEffect(() => {
    const hasAnsweredCard = currentCardStage === 'answer'
    const shouldShowValidationStep =
      hasAnsweredCard && !isValidatingAnswer && answerResult

    if (shouldShowValidationStep) {
      /**
       * Delays the validation state so user will be able to see the feedback
       */
      validationTimeout.current = setTimeout(() => {
        setCurrentCardStage('validation')
      }, 2000)
    } else {
      clearTimeout(validationTimeout.current)
    }
  }, [currentCardStage, isValidatingAnswer, answerResult])

  useEffect(() => {
    if (currentCardStage === 'finished' && studySessionBoxes) {
      finishStudySessionForMutation.mutate({
        boxIds: studySessionBoxes?.map(({ id }) => id),
      })
    }
  }, [currentCardStage, studySessionBoxes, finishStudySessionForMutation])

  const goToNextCard = () => {
    if (!cards) return

    const isLastCard = currentCardIdx === cards.length - 1
    const nextCardIdx = isLastCard ? currentCardIdx : currentCardIdx + 1

    resetForm()
    resetAnswerState()
    setCurrentCardIdx(nextCardIdx)
    setCurrentCardStage(isLastCard ? 'finished' : 'question')
  }

  const renderCardContent = () => {
    if (isValidatingAnswer) {
      return (
        <div className='flex flex-col items-center gap-2'>
          <span className='text-base md:text-2xl'>Validando Resposta</span>
          <Loader />
        </div>
      )
    }

    if (currentCardStage === 'question') {
      return <p className='text-base md:text-2xl'>{currentCard?.question}</p>
    }

    if (hasErrorValidatingCard || !answerResult)
      return (
        <span className='max-w-xs text-base text-error-700 md:text-2xl'>
          Houve um erro ao validar a sua resposta. Tente novamente mais tarde!
        </span>
      )

    if (!answerResult.isRight) {
      return <span className='text-5xl sm:text-8xl'>😪</span>
    }

    return <span className='text-5xl sm:text-8xl'>🎉</span>
  }

  const renderButtons = () => {
    if (currentCardStage === 'validation') {
      return (
        <Button type='button' fullWidth onClick={goToNextCard}>
          Próximo Card
        </Button>
      )
    }

    return (
      <>
        <Button
          fullWidth
          disabled={shouldDisableButtonsAndInputs}
          variant='secondary'
          type='button'
          onClick={() => {
            console.log('TODO emiliosheinz: not implemented')
          }}
        >
          Passar
        </Button>
        <Button disabled={shouldDisableButtonsAndInputs} fullWidth>
          Responder
        </Button>
      </>
    )
  }

  const renderContent = () => {
    if (isLoading)
      return (
        <div className='flex w-full animate-pulse flex-col gap-5'>
          <span className='aspect-video w-full bg-primary-200' />
          <span className='h-40 w-full bg-primary-200 sm:h-56' />
          <span className='h-16 w-full bg-primary-200' />
        </div>
      )

    if (isError)
      return (
        <p className='my-16 max-w-sm text-center text-2xl text-primary-900'>
          😕 Houve um erro ao iniciar a sua revisão. Por favor, tente novamente
          mais tarde!
        </p>
      )

    if (currentCardStage === 'finished')
      return (
        <p className='my-16 max-w-sm text-center text-2xl text-primary-900'>
          🎉 Parabéns!!! Você revisou todos os Cards pendentes.
        </p>
      )

    // TODO emiliosheinz: Adicionar tooltip explicando porque nenhum card precisa ser revisado
    if (!cards?.length)
      return (
        <p className='my-16 max-w-sm text-center text-2xl text-primary-900'>
          🎉 No momento nenhum Card precisa ser revisado. Por favor, volte mais
          tarde.
        </p>
      )

    return (
      <>
        <p className='text-center'>
          {currentCardIdx + 1}/{cards?.length}
        </p>
        <div className='group [perspective:1000px]'>
          <div
            className={classNames(
              'relative aspect-video w-full transition-all duration-500 [transform-style:preserve-3d]',
              currentCardStage === 'validation'
                ? '[transform:rotateY(180deg)]'
                : '',
            )}
          >
            <div className='absolute w-full'>
              <Card fullWidth>{renderCardContent()}</Card>
            </div>
            <div className='absolute w-full [transform:rotateY(180deg)] [backface-visibility:hidden]'>
              <Card fullWidth>
                <span className='text-base md:text-2xl'>
                  {answerResult?.answer}
                </span>
              </Card>
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(values => {
            answerCard({ ...values, boxCardId: currentCard?.id as string })
            setCurrentCardStage('answer')
          })}
          className='flex flex-col gap-3'
        >
          <TextArea
            disabled={shouldDisableButtonsAndInputs}
            label='Resposta'
            id='answer'
            {...register('answer')}
            error={formState?.errors['answer']?.message as string}
          />
          <div className='flex gap-5'>{renderButtons()}</div>
        </form>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Revisão</title>
        <meta name='description' content='' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='mx-auto flex max-w-3xl flex-col items-center gap-5'>
        {renderContent()}
      </div>
    </>
  )
}

ReviewDeck.requiresAuthentication = true

export default ReviewDeck
