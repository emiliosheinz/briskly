import { Visibility } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { compareTwoStrings } from 'string-similarity'
import { z } from 'zod'

import { STUDY_SESSION_BOXES } from '~/constants'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { addHours } from '~/utils/date-time'

export const studySessionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        deckId: z.string().min(1),
      }),
    )
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
  getHasDeckStudySession: protectedProcedure
    .input(
      z.object({
        deckId: z.string().min(1),
      }),
    )
    .query(async ({ input: { deckId }, ctx }) => {
      const studySession = await ctx.prisma.studySession.findFirst({
        where: { deckId: deckId, userId: ctx.session.user.id },
      })

      return { hasDeckStudySession: !!studySession }
    }),
  getReviewSession: protectedProcedure
    .input(z.object({ deckId: z.string().min(1) }))
    .query(async ({ input: { deckId }, ctx }) => {
      const { user } = ctx.session

      const currentStudySession = await ctx.prisma.studySession.findFirst({
        where: { deckId, userId: user.id },
        include: {
          studySessionBoxes: {
            where: { studySessionBoxCards: { some: {} } },
            select: {
              id: true,
              createdAt: true,
              lastReview: true,
              reviewGapInHours: true,
              studySessionBoxCards: {
                select: { id: true, card: { select: { question: true } } },
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
        studySessionId: currentStudySession.id,
        studySessionBoxes: studySessionBoxes.map(
          ({ studySessionBoxCards, id }) => ({
            id,
            cards: studySessionBoxCards.map(boxCard => ({
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
        answer: z.string().min(1),
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
          message: 'Não foi possível localizar este o card',
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
      const firstBoxIx = 0

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
        const firstStudySessionBox = studySessionBoxes[firstBoxIx]

        if (!firstStudySessionBox) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Houve um erro ao atualizar o estado do seu Deck.',
          })
        }

        updateBoxCard = ctx.prisma.studySessionBoxCard.update({
          where: { id: boxCardId },
          data: { studySessionBoxId: firstStudySessionBox.id },
        })
      }

      await Promise.all([addNewAttempt, updateBoxCard])

      return { isRight: isAnswerRight, answer: card.answer }
    }),
  finishStudySessionForBox: protectedProcedure
    .input(
      z.object({
        boxIds: z.array(z.string().min(1)),
      }),
    )
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
