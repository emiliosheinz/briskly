import { Visibility } from '@prisma/client'
import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import { deleteObjectFromS3, getS3ImageUrl } from '~/server/common/s3'
import { DeckInputSchema, UpdateDeckInputSchema } from '~/utils/validators/deck'

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
                where: { title: topic.title.toLocaleLowerCase() },
                create: {
                  title: topic.title.toLocaleLowerCase(),
                },
              }
            }),
          },
          cards: { create: cards },
        },
      })
    }),
  updateDeck: protectedProcedure
    .input(UpdateDeckInputSchema)
    .mutation(
      ({
        input: {
          id,
          newCards,
          newTopics,
          deletedCards,
          deletedTopics,
          editedCards,
          ...input
        },
        ctx,
      }) => {
        return ctx.prisma.deck.update({
          where: { id },
          data: {
            ...input,
            cards: {
              delete: deletedCards?.map(({ id }) => ({ id })),
              create: newCards,
              update: editedCards?.map(({ id, ...card }) => ({
                where: { id },
                data: card,
              })),
            },
            topics: {
              disconnect: deletedTopics?.map(({ id }) => ({ id })),
              connectOrCreate: newTopics?.map(topic => {
                return {
                  where: { title: topic.title.toLocaleLowerCase() },
                  create: {
                    title: topic.title.toLocaleLowerCase(),
                  },
                }
              }),
            },
          },
        })
      },
    ),
  deleteDeck: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const deck = await ctx.prisma.deck.findFirstOrThrow({ where: { id } })
      await deleteObjectFromS3(deck.image)
      await ctx.prisma.deck.delete({ where: { id } })
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
