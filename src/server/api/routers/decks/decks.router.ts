import { Visibility } from '@prisma/client'
import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import { getS3ImageUrl } from '~/server/common/s3'
import { DeckInputSchema } from '~/utils/validators/deck'

export const decksRouter = createTRPCRouter({
  createNewDeck: protectedProcedure
    .input(DeckInputSchema)
    .mutation(({ input: { topics, cards, ...input }, ctx }) => {
      return ctx.prisma.deck.create({
        data: {
          ...input,
          ownerId: ctx.session.user.id,
          topics: {
            connectOrCreate: topics?.map(topic => {
              return {
                where: { title: topic.toLocaleLowerCase() },
                create: {
                  title: topic.toLocaleLowerCase(),
                },
              }
            }),
          },
          cards: { create: cards },
        },
      })
    }),
  getPublicDecks: publicProcedure
    .input(
      z.object({
        page: z.number(),
      }),
    )
    .query(async ({ input: { page }, ctx }) => {
      const decks = await ctx.prisma.deck.findMany({
        where: { visibility: Visibility.Public },
        orderBy: { createdAt: 'desc' },
        take: 30,
        skip: page * 30,
      })

      return decks.map(deck => ({
        ...deck,
        image: getS3ImageUrl(deck.image),
      }))
    }),
})
