import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { api } from '~/utils/api'

type CardAnswerStages =
  | 'question'
  | 'loading'
  | 'answered'
  | 'validation'
  | 'done'
  | 'error'

export function useDeckReview(deckId: string) {
  const apiContext = api.useContext()

  const {
    isLoading: isLoadingCards,
    isError: hasErrorLoadingCards,
    data: { studySessionBoxes, studySessionId, deck } = {},
  } = api.studySession.getReviewSession.useQuery({ deckId }, { cacheTime: 0 })

  const cards = studySessionBoxes?.flatMap(({ cards }) => cards)

  const {
    mutateAsync: answer,
    data: answerResult,
    reset: resetAnswerState,
  } = api.studySession.answerStudySessionCard.useMutation()

  const { mutate: finishReviewSession } =
    api.studySession.finishReviewSession.useMutation({
      onSuccess: () => {
        apiContext.decks.toBeReviewed.invalidate()
        apiContext.studySession.getStudySessionBasicInfo.invalidate({ deckId })
      },
    })

  const form = useForm<{ answer: string }>({
    resolver: zodResolver(
      z.object({
        answer: z.string().min(1, 'Campo obrigatório'),
      }),
    ),
  })

  const [currentCardIdx, setCurrentCardIdx] = useState(0)
  const [cardAnswerStage, setCardAnswerStage] =
    useState<CardAnswerStages>('question')

  const validationTimeout = useRef<NodeJS.Timeout>()
  const currentCard = cards?.[currentCardIdx]
  const isLastCard = cards ? currentCardIdx === cards.length - 1 : false

  /**
   * useEffect to automatically show the card answer when user has answered the card
   */
  useEffect(() => {
    const hasAnsweredCard = cardAnswerStage === 'answered'
    const shouldShowValidationStep = hasAnsweredCard && answerResult

    if (shouldShowValidationStep) {
      /**
       * Delays the validation state so user will be able to see the feedback
       */
      validationTimeout.current = setTimeout(() => {
        setCardAnswerStage('validation')
      }, 2000)
    } else {
      clearTimeout(validationTimeout.current)
    }
  }, [cardAnswerStage, answerResult])

  useEffect(() => {
    const isLastCardValidation = isLastCard && cardAnswerStage === 'validation'

    if (isLastCardValidation && studySessionId) {
      finishReviewSession({
        studySessionId,
        reviewedBoxIds: studySessionBoxes?.map(({ id }) => id) ?? [],
      })
    }
  }, [
    isLastCard,
    studySessionId,
    cardAnswerStage,
    studySessionBoxes,
    finishReviewSession,
  ])

  const goToNextCard = () => {
    if (!cards) return
    const nextCardIdx = isLastCard ? currentCardIdx : currentCardIdx + 1

    form.reset()
    resetAnswerState()
    setCurrentCardIdx(nextCardIdx)
    setCardAnswerStage(isLastCard ? 'done' : 'question')
  }

  const submitCardAnswer = async (params: { answer?: string }) => {
    try {
      if (!currentCard?.id) throw new Error('Card not found')

      setCardAnswerStage('loading')
      await answer({
        boxCardId: currentCard.id,
        answer: params.answer,
      })
      setCardAnswerStage('answered')
    } catch {
      setCardAnswerStage('error')
    }
  }

  return {
    form,
    goToNextCard,
    cardAnswerStage,
    isLastCard,

    isLoadingCards,
    hasErrorLoadingCards,
    cards,
    deck,

    answerResult,

    currentCard,
    currentCardIdx,

    answer: submitCardAnswer,
  }
}
