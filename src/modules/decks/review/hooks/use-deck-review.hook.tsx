import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { api } from '~/utils/api'

type CardAnswerStages = 'question' | 'answer' | 'validation' | 'finished'

export function useDeckReview(deckId: string) {
  const {
    isLoading: isLoadingCards,
    isError: hasErrorLoadingCards,
    data: { studySessionBoxes } = {},
  } = api.studySession.getReviewSession.useQuery(
    { deckId },
    { refetchOnWindowFocus: false },
  )
  const cards = studySessionBoxes?.flatMap(({ cards }) => cards)

  const {
    mutate: answer,
    data: answerResult,
    reset: resetAnswerState,
    isLoading: isValidatingAnswer,
    isError: hasErrorValidatingAnswer,
  } = api.studySession.answerStudySessionCard.useMutation()

  const finishStudySessionForMutation =
    api.studySession.finishStudySessionForBox.useMutation()

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

  useEffect(() => {
    const hasAnsweredCard = cardAnswerStage === 'answer'
    const shouldShowValidationStep =
      hasAnsweredCard && !isValidatingAnswer && answerResult

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
  }, [cardAnswerStage, isValidatingAnswer, answerResult])

  useEffect(() => {
    if (cardAnswerStage === 'finished' && studySessionBoxes) {
      finishStudySessionForMutation.mutate({
        boxIds: studySessionBoxes?.map(({ id }) => id),
      })
    }
  }, [cardAnswerStage, studySessionBoxes, finishStudySessionForMutation])

  const goToNextCard = () => {
    if (!cards) return

    const isLastCard = currentCardIdx === cards.length - 1
    const nextCardIdx = isLastCard ? currentCardIdx : currentCardIdx + 1

    form.reset()
    resetAnswerState()
    setCurrentCardIdx(nextCardIdx)
    setCardAnswerStage(isLastCard ? 'finished' : 'question')
  }

  return {
    form,
    goToNextCard,
    cardAnswerStage,

    isLoadingCards,
    hasErrorLoadingCards,
    cards,

    answerResult,
    isValidatingAnswer,
    hasErrorValidatingAnswer,

    currentCard,
    currentCardIdx,

    answer: (values: { answer: string }) => {
      setCardAnswerStage('answer')
      answer({ ...values, boxCardId: currentCard?.id as string })
    },
  }
}
