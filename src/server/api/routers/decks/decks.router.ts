import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const decksRouter = createTRPCRouter({
  createNewDeck: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        image: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.deck.create({
        data: { ...input, ownerId: ctx.session.user.id, topic },
      })
    }),
})
