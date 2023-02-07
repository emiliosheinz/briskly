import { Visibility } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { compareTwoStrings } from 'string-similarity'
import { z } from 'zod'

import { STUDY_SESSION_BOXES } from '~/constants'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { addHours } from '~/utils/date-time'

export const studySessionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ deckId: z.string().min(1) }))
    .mutation(async ({ input: { deckId }, ctx }) => {
      const hasStudySession = !!(await ctx.prisma.studySession.findFirst({
        where: { deckId, userId: ctx.session.user.id },
      }))

      if (hasStudySession) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Você já tem uma sessão de estudos vinculada a este Deck',
        })
      }

      const deck = await ctx.prisma.deck.findFirst({
        where: { id: deckId },
        include: { cards: true },
      })

      if (!deck) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Deck não foi encontrado em nossa base de dados',
        })
      }

      const isDeckPrivate = deck.visibility === Visibility.Private
      const isDeckOwner = deck.ownerId === ctx.session.user.id

      if (isDeckPrivate && !isDeckOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Para iniciar uma sessão de estudos o deck não deve ser privado ou vocês deve ser o dono do Deck',
        })
      }

      const studySession = await ctx.prisma.studySession.create({
        data: {
          deckId,
          userId: ctx.session.user.id,
        },
      })

      const [firstStudySessionBox] = await ctx.prisma.$transaction(
        STUDY_SESSION_BOXES.map(({ reviewGapInHours }) =>
          ctx.prisma.studySessionBox.create({
            data: {
              reviewGapInHours,
              studySessionId: studySession.id,
            },
          }),
        ),
      )

      if (!firstStudySessionBox) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro inesperado ao criar sessão de estudos',
        })
      }

      await ctx.prisma.studySessionBoxCard.createMany({
        data: deck.cards.map(({ id }) => ({
          cardId: id,
          studySessionBoxId: firstStudySessionBox.id,
        })),
      })
    }),
  getStudySessionBasicInfo: protectedProcedure
    .input(z.object({ deckId: z.string().min(1) }))
    .query(async ({ input: { deckId }, ctx }) => {
      const studySessionBoxes = await ctx.prisma.studySessionBox.findMany({
        where: {
          studySession: { deckId, userId: ctx.session.user.id },
        },
        orderBy: { lastReview: 'desc' },
        select: {
          createdAt: true,
          lastReview: true,
          reviewGapInHours: true,
          _count: {
            select: {
              studySessionBoxCards: true,
            },
          },
        },
      })

      if (studySessionBoxes.length === 0) return null

      const isFirstReview = studySessionBoxes.every(
        ({ lastReview }) => !lastReview,
      )
      let nextReviewDate

      if (isFirstReview) {
        nextReviewDate = studySessionBoxes[0]?.createdAt
      } else {
        const boxesWithCards = studySessionBoxes.filter(
          ({ _count: { studySessionBoxCards } }) => studySessionBoxCards > 0,
        )

        for (const box of boxesWithCards) {
          const lastReview = box.lastReview || box.createdAt
          const currentReviewDate = addHours(lastReview, box.reviewGapInHours)

          if (!nextReviewDate) {
            nextReviewDate = currentReviewDate
          } else if (currentReviewDate < nextReviewDate) {
            nextReviewDate = currentReviewDate
          }
        }
      }

      const lastReviewDate = studySessionBoxes.find(
        ({ lastReview }) => !!lastReview,
      )?.lastReview

      return {
        nextReviewDate,
        lastReviewDate,
      }
    }),
  getReviewSession: protectedProcedure
    .input(z.object({ deckId: z.string().min(1) }))
    .query(async ({ input: { deckId }, ctx }) => {
      const currentStudySession = await ctx.prisma.studySession.findFirst({
        where: { deckId, userId: ctx.session.user.id },
        include: {
          deck: {
            select: {
              title: true,
              description: true,
            },
          },
          studySessionBoxes: {
            select: {
              id: true,
              createdAt: true,
              lastReview: true,
              reviewGapInHours: true,
              studySessionBoxCards: {
                select: {
                  id: true,
                  card: {
                    select: { question: true },
                  },
                  studySessionAttempts: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      })

      if (!currentStudySession) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Nenhuma sessão de estudos foi encontrada',
        })
      }

      const isFirstReview = currentStudySession.studySessionBoxes.every(
        ({ lastReview }) => !lastReview,
      )

      const studySessionBoxes = isFirstReview
        ? currentStudySession.studySessionBoxes.filter((_, idx) => idx === 0)
        : currentStudySession.studySessionBoxes.filter(box => {
            const lastReview = box.lastReview || box.createdAt
            const nextReview = addHours(lastReview, box.reviewGapInHours)
            return nextReview < new Date()
          })

      if (studySessionBoxes.length === 0) {
        return {
          studySessionId: currentStudySession.id,
          studySessionBoxes: [],
        }
      }

      return {
        deck: currentStudySession.deck,
        studySessionId: currentStudySession.id,
        studySessionBoxes: studySessionBoxes.map(
          ({ studySessionBoxCards, id, lastReview }) => ({
            id,
            cards: studySessionBoxCards
              .filter(boxCard => {
                const lastAttempt = boxCard.studySessionAttempts[0]?.createdAt
                return !lastAttempt || !lastReview || lastAttempt < lastReview
              })
              .map(boxCard => ({
                id: boxCard.id,
                question: boxCard.card.question,
              })),
          }),
        ),
      }
    }),
  answerStudySessionCard: protectedProcedure
    .input(
      z.object({
        answer: z.string().min(1).optional(),
        boxCardId: z.string().min(1),
      }),
    )
    .mutation(async ({ input: { answer, boxCardId }, ctx }) => {
      const boxCard = await ctx.prisma.studySessionBoxCard.findUnique({
        where: { id: boxCardId },
        include: {
          card: true,
          studySessionBox: {
            include: {
              studySession: {
                include: {
                  user: true,
                  studySessionBoxes: {
                    orderBy: { reviewGapInHours: 'asc' },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      })

      if (!boxCard) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Não foi possível localizar o card',
        })
      }

      const { studySessionBox, card } = boxCard
      const { studySession, id: currentBoxId } = studySessionBox
      const { studySessionBoxes, user } = studySession

      const isCurrentUserStudySessionOwner = ctx.session.user.id === user.id

      if (!isCurrentUserStudySessionOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Este usuário não pode responder este card',
        })
      }

      const firstStudySessionBox = studySessionBoxes[0]

      if (!firstStudySessionBox) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Houve um erro ao atualizar o estado do seu Deck.',
        })
      }

      /**
       * If the user didn't answer the question, we move the card to the first box
       */
      if (!answer) {
        await ctx.prisma.studySessionBoxCard.update({
          where: { id: boxCardId },
          data: { studySessionBoxId: firstStudySessionBox.id },
        })

        return { isRight: false, answer: card.answer }
      }

      const isAnswerRight = compareTwoStrings(answer, card.answer) > 0.8

      let updateBoxCard
      const addNewAttempt = ctx.prisma.studySessionAttempt.create({
        data: {
          answer,
          isRight: isAnswerRight,
          studySessionBoxCardId: boxCardId,
        },
      })

      const currentBoxIdx = studySessionBoxes.findIndex(
        ({ id }) => id === currentBoxId,
      )
      const lastBoxIdx = studySessionBoxes.length - 1

      const isInTheLastBox = currentBoxIdx === lastBoxIdx

      if (isAnswerRight && !isInTheLastBox) {
        const nextStudySessionBox = studySessionBoxes[currentBoxIdx + 1]

        if (!nextStudySessionBox) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Houve um erro ao atualizar o estado do seu Deck.',
          })
        }

        updateBoxCard = ctx.prisma.studySessionBoxCard.update({
          where: { id: boxCardId },
          data: { studySessionBoxId: nextStudySessionBox.id },
        })
      } else {
        updateBoxCard = ctx.prisma.studySessionBoxCard.update({
          where: { id: boxCardId },
          data: { studySessionBoxId: firstStudySessionBox.id },
        })
      }

      await Promise.all([addNewAttempt, updateBoxCard])

      return { isRight: isAnswerRight, answer: card.answer }
    }),
  finishStudySessionForBox: protectedProcedure
    .input(z.object({ boxIds: z.array(z.string().min(1)) }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.$transaction(
        input.boxIds.map(boxId =>
          ctx.prisma.studySessionBox.update({
            where: { id: boxId },
            data: { lastReview: new Date() },
          }),
        ),
      )
    }),
})
