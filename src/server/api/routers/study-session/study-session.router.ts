import { Visibility } from '@prisma/client'
import { TRPCError } from '@trpc/server'
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

      // TODO emiliosheinz: Improve endpoint performance by grouping queries
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

      await ctx.prisma.studySessionBoxCard.createMany({
        data: deck.cards.map(({ id }) => ({
          cardId: id,
          studySessionBoxId: firstStudySessionBox!.id,
        })),
      })
    }),
  getLastAndNextReviewDates: protectedProcedure
    .input(
      z.object({
        deckId: z.string().min(1),
      }),
    )
    .query(async ({ input: { deckId }, ctx }) => {
      const studySession = await ctx.prisma.studySession.findFirst({
        where: { deckId: deckId, userId: ctx.session.user.id },
      })

      if (!studySession) return null

      const studySessionBoxes = await ctx.prisma.studySessionBox.findMany({
        where: { studySessionId: studySession.id },
        orderBy: { lastReview: 'desc' },
      })

      let nextReviewDateTime

      for (const box of studySessionBoxes) {
        const currentReviewDate = addHours(box.lastReview, box.reviewGapInHours)

        if (!nextReviewDateTime) {
          nextReviewDateTime = currentReviewDate
        } else if (currentReviewDate < nextReviewDateTime) {
          nextReviewDateTime = currentReviewDate
        }
      }

      return {
        nextReviewDateTime,
        lastReviewDateTime: studySessionBoxes[0]?.lastReview,
      }
    }),
  getReviewSession: protectedProcedure
    .input(z.object({ deckId: z.string().min(1) }))
    .query(async ({ input: { deckId }, ctx }) => {
      const { user } = ctx.session

      await new Promise(r => setTimeout(r, 1000))
      const currentStudySession = await ctx.prisma.studySession.findFirst({
        where: { deckId, userId: user.id },
        include: {
          studySessionBoxes: {
            where: { studySessionBoxCards: { some: {} } },
            // include: { studySessionBoxCards: { include: { card: true } } },
          },
        },
      })

      if (!currentStudySession) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Nenhuma sessão de estudos foi encontrada',
        })
      }

      const currentSessionBox = [...currentStudySession.studySessionBoxes].sort(
        (a, b) => {
          const aNextReviewDate = addHours(a.lastReview, a.reviewGapInHours)
          const bNextReviewDate = addHours(b.lastReview, b.reviewGapInHours)

          if (aNextReviewDate < bNextReviewDate) return -1
          if (aNextReviewDate > bNextReviewDate) return 1
          return 0
        },
      )[0]

      if (!currentSessionBox) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Nenhuma sessão de estudos foi encontrada',
        })
      }

      const studySessionBoxCards =
        await ctx.prisma.studySessionBoxCard.findMany({
          where: { studySessionBoxId: currentSessionBox.id },
          select: { id: true, card: { select: { question: true } } },
        })

      return {
        studySessionId: currentStudySession.id,
        currentSessionBox: {
          id: currentSessionBox.id,
          cards: studySessionBoxCards.map(({ id, card: { question } }) => ({
            id,
            question,
          })),
        },
      }
    }),
  answerStudySessionCard: protectedProcedure.mutation(async () => {
    await new Promise(r => setTimeout(r, 3000))
    if (Math.random() > Math.random()) {
      return { isCorrect: true }
    }

    if (Math.random() > Math.random()) {
      throw new Error('deu ruim')
    }

    return { isCorrect: false }
  }),
})
