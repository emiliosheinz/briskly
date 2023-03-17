import { z } from 'zod'

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
})
