import { AnswerValidationReportStatus } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { MAX_VALID_ANSWERS_PER_CARD } from '~/constants'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const answerValidationReportsRouter = createTRPCRouter({
  reportAnswerValidation: protectedProcedure
    .input(
      z.object({
        answer: z.string().min(1),
        cardId: z.string().min(1),
      }),
    )
    .mutation(({ input: { answer, cardId }, ctx }) => {
      /** TODO emiliosheinz: Add more validations such as:
       * - Check if the user has a study session withing the card's deck
       * - Check if the user has already reported the answer
       * ...
       */
      return ctx.prisma.answerValidationReport.create({
        data: {
          answer,
          cardId,
          userId: ctx.session.user.id,
        },
      })
    }),
  getCardsWithAnswerValidationReports: protectedProcedure
    .input(z.object({ deckId: z.string().min(1) }))
    .query(async ({ input: { deckId }, ctx }) => {
      const deck = await ctx.prisma.deck.findFirst({
        where: { id: deckId, ownerId: ctx.session.user.id },
        select: {
          title: true,
          id: true,
          cards: {
            where: {
              answerValidationReports: {
                some: {
                  status: AnswerValidationReportStatus.Pending,
                },
              },
            },
            select: {
              id: true,
              question: true,
              answerValidationReports: {
                where: { status: AnswerValidationReportStatus.Pending },
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
      })

      if (!deck) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Deck não foi encontrado',
        })
      }

      return deck
    }),
  updateAnswerValidationReportStatus: protectedProcedure
    .input(
      z.object({
        answerValidationReportId: z.string().min(1),
        status: z.nativeEnum(AnswerValidationReportStatus),
      }),
    )
    .mutation(async ({ input: { answerValidationReportId, status }, ctx }) => {
      await new Promise(r => setTimeout(r, 3000))
      const answerValidationReport =
        await ctx.prisma.answerValidationReport.findFirst({
          where: { id: answerValidationReportId },
        })

      if (!answerValidationReport) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Report não foi encontrado',
        })
      }

      if (
        answerValidationReport.status !== AnswerValidationReportStatus.Pending
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Report já foi aceito ou recusado',
        })
      }

      const updateReport = () =>
        ctx.prisma.answerValidationReport.update({
          where: { id: answerValidationReportId },
          data: { status },
        })

      if (status === AnswerValidationReportStatus.Accepted) {
        const card = await ctx.prisma.card.findFirst({
          where: { id: answerValidationReport.cardId },
        })

        if (!card) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Card não foi encontrado',
          })
        }

        if (card.validAnswers.length > MAX_VALID_ANSWERS_PER_CARD) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Card já possui ${MAX_VALID_ANSWERS_PER_CARD} respostas válidas. Vá até o Deck e remova uma resposta válida antes de adicionar uma nova.`,
          })
        }

        const updateCard = () =>
          ctx.prisma.card.update({
            where: { id: card.id },
            data: {
              validAnswers: [
                ...card.validAnswers,
                answerValidationReport.answer,
              ],
            },
          })

        await Promise.all([updateReport(), updateCard()])
      } else {
        await updateReport()
      }
    }),
})
