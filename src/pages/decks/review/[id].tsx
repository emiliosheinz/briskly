import { useEffect, useRef, useState } from 'react'

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import Head from 'next/head'

import { Button } from '~/components/button'
import { Card } from '~/components/card'
import { Loader } from '~/components/loader'
import { TextArea } from '~/components/text-area'
import type { WithAuthentication } from '~/types/auth'
import { api } from '~/utils/api'
import { classNames } from '~/utils/css'

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

const ReviewDeck: WithAuthentication<
  NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>
> = props => {
  const { deckId } = props

  const {
    isLoading,
    isError,
    data: { currentSessionBox } = {},
  } = api.studySession.getReviewSession.useQuery({ deckId })

  const {
    isLoading: isValidatingAnswer,
    data: answerResult,
    isError: hasErrorValidatingCard,
    mutate: answerCard,
    reset: resetAnswerState,
  } = api.studySession.answerStudySessionCard.useMutation()

  const [currentCardIdx, setCurrentCardIdx] = useState(0)
  const [currentCardStage, setCurrentCardStage] = useState<
    'question' | 'answer' | 'validation'
  >('question')

  const validationTimeout = useRef<NodeJS.Timeout>()

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

  const goToNextCard = () => {
    resetAnswerState()
    setCurrentCardStage('question')
    setCurrentCardIdx(idx => idx + 1)
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
      return (
        <p className='text-base md:text-2xl'>
          {currentSessionBox?.cards[currentCardIdx]?.question}
        </p>
      )
    }

    if (hasErrorValidatingCard || !answerResult)
      return (
        <span className='max-w-xs text-base text-error-700 md:text-2xl'>
          Houve um erro ao validar a sua resposta. Tente novamente mais tarde!
        </span>
      )

    if (!answerResult.isCorrect) {
      return <span className='text-5xl sm:text-8xl'>😪</span>
    }

    return <span className='text-5xl sm:text-8xl'>🎉</span>
  }

  const renderButtons = () => {
    if (currentCardStage === 'validation') {
      return (
        <Button fullWidth onClick={goToNextCard}>
          Próximo Card
        </Button>
      )
    }

    return (
      <>
        <Button
          fullWidth
          variant='secondary'
          onClick={() => setCurrentCardIdx(idx => idx + 1)}
        >
          Passar
        </Button>
        <Button
          fullWidth
          onClick={async () => {
            answerCard()
            setCurrentCardStage('answer')
          }}
        >
          Responder
        </Button>
      </>
    )
  }

  const renderContent = () => {
    if (isLoading) return <span>Loading...</span>
    if (isError) return <span>Error</span>

    return (
      <div className='mx-auto flex max-w-3xl flex-col gap-5'>
        <p className='text-center'>
          {currentCardIdx + 1}/{currentSessionBox?.cards.length}
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
                <span className='text-base md:text-2xl'>Resposta</span>
              </Card>
            </div>
          </div>
        </div>
        <TextArea label='Resposta' id='answer' />
        <div className='flex gap-5'>{renderButtons()}</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Revisão</title>
        <meta name='description' content='' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {renderContent()}
    </>
  )
}

ReviewDeck.requiresAuthentication = true

export default ReviewDeck
