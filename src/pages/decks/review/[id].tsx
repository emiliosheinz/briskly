import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { Button } from '~/components/button'
import { Card } from '~/components/card'
import { Loader } from '~/components/loader'
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

/**
 * TODO quando revisar o ultimo card atualizar o lastReview date do box
 */

const ReviewDeck: WithAuthentication<
  NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>
> = props => {
  const { deckId } = props

  const router = useRouter()

  const {
    form,
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

  const renderCardContent = () => {
    if (isLoadingAnswer) {
      return (
        <div className='flex flex-col items-center gap-2'>
          <span className='text-base md:text-2xl'>Validando Resposta</span>
          <Loader />
        </div>
      )
    }

    if (cardAnswerStage === 'question') {
      return <p className='text-base md:text-2xl'>{currentCard?.question}</p>
    }

    if (cardAnswerStage === 'error')
      return (
        <span className='max-w-xs text-base text-error-700 md:text-2xl'>
          Houve um erro ao validar a sua resposta. Tente novamente mais tarde!
        </span>
      )

    if (!answerResult?.isRight) {
      return <span className='text-5xl sm:text-8xl'>😪</span>
    }

    return <span className='text-5xl sm:text-8xl'>🎉</span>
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

  const renderContent = () => {
    if (isLoadingCards) {
      return (
        <div className='flex w-full animate-pulse flex-col gap-5'>
          <span className='aspect-video w-full bg-primary-200' />
          <span className='h-40 w-full bg-primary-200 sm:h-56' />
          <span className='h-16 w-full bg-primary-200' />
        </div>
      )
    }

    if (hasErrorLoadingCards) {
      return (
        <p className='my-16 max-w-sm text-center text-2xl text-primary-900'>
          😕 Houve um erro ao iniciar a sua revisão. Por favor, tente novamente
          mais tarde!
        </p>
      )
    }

    if (cardAnswerStage === 'done') {
      return (
        <div>
          <p className='my-16 max-w-sm text-center text-2xl text-primary-900'>
            🎉 Parabéns!!! Você revisou todos os Cards pendentes.
          </p>
          <Button
            fullWidth
            onClick={() => router.replace(routes.deckDetails(deckId))}
          >
            OK
          </Button>
        </div>
      )
    }

    if (!cards?.length) {
      return (
        <p className='my-16 max-w-sm text-center text-2xl text-primary-900'>
          🎉 No momento nenhum Card precisa ser revisado. Por favor, volte mais
          tarde
          <Tooltip hint='Você não tem cards para revisar pois Briskly utiliza a metodologia de repetição espaçada para determinar quando você deve revisar determinado card.' />
        </p>
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
          className='flex flex-col gap-3'
          onSubmit={form.handleSubmit(values => answer(values))}
        >
          <TextArea
            id='answer'
            label='Resposta'
            {...form.register('answer')}
            disabled={shouldDisableButtonsAndInputs}
            error={form.formState?.errors['answer']?.message as string}
          />
          <div className='flex gap-5'>{renderButtons()}</div>
        </form>
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
      <div className='mx-auto flex w-full max-w-3xl justify-center'>
        {renderContent()}
      </div>
    </>
  )
}

ReviewDeck.requiresAuthentication = true

export default ReviewDeck
