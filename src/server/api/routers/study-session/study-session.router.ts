import { Visibility } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { STUDY_SESSION_BOXES } from '~/constants'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

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
})
