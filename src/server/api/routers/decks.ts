import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const decksRouter = createTRPCRouter({
  createNewDeck: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      const deck = ctx.prisma.deck.create({
        data: { ...input, ownerId: ctx.session.user.id },
      })

      return deck
    }),
})
