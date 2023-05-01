import { Visibility } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { STUDY_SESSION_BOXES } from '~/constants'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import { addHours, differenceInHours } from '~/utils/date-time'
import { verifyIfAnswerIsRight } from '~/utils/openai'

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

      const now = new Date()
      const deckCards = deck.cards.map(({ id }) => ({
        cardId: id,
      }))

      await ctx.prisma.$transaction(
        STUDY_SESSION_BOXES.map(({ reviewGapInHours }, idx) =>
          ctx.prisma.studySessionBox.create({
            data: {
              reviewGapInHours,
              studySessionId: studySession.id,
              nextReview: idx === 0 ? now : addHours(now, reviewGapInHours),
              studySessionBoxCards: {
                create: idx === 0 ? deckCards : [],
              },
            },
          }),
        ),
      )
    }),
  delete: protectedProcedure
    .input(z.object({ deckId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.studySession.delete({
        where: {
          userId_deckId: {
            deckId: input.deckId,
            userId: ctx.session.user.id,
          },
        },
      })
    }),
  getStudySessionBasicInfo: publicProcedure
    .input(z.object({ deckId: z.string().min(1) }))
    .query(async ({ input: { deckId }, ctx }) => {
      if (!ctx.session?.user) return null

      const findNextReviewBox = ctx.prisma.studySessionBox.findFirst({
        where: {
          studySession: {
            deckId,
            userId: ctx.session.user.id,
          },
          studySessionBoxCards: {
            some: {},
          },
        },
        orderBy: [
          {
            nextReview: 'asc',
          },
        ],
        select: {
          nextReview: true,
        },
      })

      const findLastReviewBox = ctx.prisma.studySessionBox.findFirst({
        where: {
          studySession: {
            deckId,
            userId: ctx.session.user.id,
          },
          lastReview: {
            not: null,
          },
        },
        orderBy: [
          {
            lastReview: 'desc',
          },
        ],
        select: {
          lastReview: true,
        },
      })

      const [nextReviewBox, lastReviewBox] = await ctx.prisma.$transaction([
        findNextReviewBox,
        findLastReviewBox,
      ])

      if (!nextReviewBox) return null

      return {
        nextReviewDate: nextReviewBox.nextReview,
        lastReviewDate: lastReviewBox?.lastReview,
      }
    }),
  getReviewSession: protectedProcedure
    .input(z.object({ deckId: z.string().min(1) }))
    .query(async ({ input: { deckId }, ctx }) => {
      const now = new Date()

      const findCurrentStudySession = ctx.prisma.studySession.findFirst({
        where: { deckId, userId: ctx.session.user.id },
        include: {
          deck: {
            select: {
              title: true,
              description: true,
            },
          },
          studySessionBoxes: {
            where: {
              nextReview: {
                lte: now,
              },
              studySessionBoxCards: {
                some: {},
              },
            },
            select: {
              id: true,
              createdAt: true,
              studySessionBoxCards: {
                select: {
                  id: true,
                  card: {
                    select: { question: true, id: true },
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

      const findLastReviewBox = ctx.prisma.studySessionBox.findFirst({
        where: {
          studySession: {
            deckId,
            userId: ctx.session.user.id,
          },
          lastReview: {
            not: null,
          },
        },
        orderBy: [
          {
            lastReview: 'desc',
          },
        ],
        select: {
          lastReview: true,
        },
      })

      const [currentStudySession, lastReviewBox] =
        await ctx.prisma.$transaction([
          findCurrentStudySession,
          findLastReviewBox,
        ])

      if (!currentStudySession) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Nenhuma sessão de estudos foi encontrada',
        })
      }

      const lastReview = lastReviewBox?.lastReview

      return {
        deck: currentStudySession.deck,
        studySessionId: currentStudySession.id,
        studySessionBoxes: currentStudySession.studySessionBoxes.map(
          ({ studySessionBoxCards, id }) => ({
            id,
            cards: studySessionBoxCards
              .filter(boxCard => {
                const lastAttempt = boxCard.studySessionAttempts[0]?.createdAt

                if (!lastAttempt) return true
                if (!lastReview) return false

                return lastAttempt < lastReview
              })
              .map(boxCard => ({
                id: boxCard.card.id,
                boxCardId: boxCard.id,
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

        return { isRight: false, answer: card.validAnswers.join('; ') }
      }

      const { isRight, highestSimilarity, mostSimilarAnswer } =
        await verifyIfAnswerIsRight(answer, card.validAnswers)

      let updateBoxCard
      const addNewAttempt = ctx.prisma.studySessionAttempt.create({
        data: {
          answer,
          isRight,
          mostSimilarAnswer,
          similarity: highestSimilarity,
          studySessionBoxCardId: boxCardId,
        },
      })

      const currentBoxIdx = studySessionBoxes.findIndex(
        ({ id }) => id === currentBoxId,
      )
      const lastBoxIdx = studySessionBoxes.length - 1

      const isInTheLastBox = currentBoxIdx === lastBoxIdx

      if (isRight && !isInTheLastBox) {
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

      return { isRight, answer: mostSimilarAnswer }
    }),
  finishReviewSession: protectedProcedure
    .input(
      z.object({
        studySessionId: z.string().min(1),
        reviewedBoxIds: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ input: { studySessionId, reviewedBoxIds }, ctx }) => {
      const now = new Date()
      const userId = ctx.session.user.id

      const isUserStudySessionOwner = await ctx.prisma.studySession.findFirst({
        where: { id: studySessionId, userId },
      })

      if (!isUserStudySessionOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Este usuário não pode atualizar esta sessão de estudos',
        })
      }

      const boxesWithExpiredNextReviewDate =
        await ctx.prisma.studySessionBox.findMany({
          where: {
            studySession: {
              userId,
              id: studySessionId,
            },
            nextReview: { lte: now },
          },
        })

      // Since nextReview is in the past it is the same as lastReview
      const updateBoxesNextReview = boxesWithExpiredNextReviewDate.map(
        ({ id, reviewGapInHours, nextReview: lastReview }) => {
          const hoursSinceLastReview = differenceInHours(now, lastReview)
          const gapsToSkip = Math.ceil(hoursSinceLastReview / reviewGapInHours)
          const nextReview = addHours(lastReview, gapsToSkip * reviewGapInHours)

          return ctx.prisma.studySessionBox.update({
            where: { id },
            data: { nextReview },
          })
        },
      )

      const updateReviewedBoxesLastReview =
        ctx.prisma.studySessionBox.updateMany({
          where: { id: { in: reviewedBoxIds }, studySessionId },
          data: { lastReview: now },
        })

      await ctx.prisma.$transaction([
        updateReviewedBoxesLastReview,
        ...updateBoxesNextReview,
      ])
    }),
})
