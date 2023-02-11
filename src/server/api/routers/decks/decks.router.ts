import { Visibility } from '@prisma/client'
import { z } from 'zod'

import { ITEMS_PER_PAGE } from '~/constants'
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
      async ({
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
        const studySessionBoxes = await ctx.prisma.studySessionBox.findMany({
          where: {
            studySession: { deckId: id },
          },
          orderBy: { reviewGapInHours: 'asc' },
          distinct: ['studySessionId'],
        })

        return ctx.prisma.deck.update({
          where: { id },
          data: {
            ...input,
            cards: {
              delete: deletedCards?.map(({ id }) => ({ id })),
              create: newCards?.map(card => ({
                ...card,
                studySessionBoxCards: {
                  create: studySessionBoxes.map(box => ({
                    studySessionBoxId: box.id,
                  })),
                },
              })),
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
  /**
   * Based on https://trpc.io/docs/useInfiniteQuery
   */
  getPublicDecks: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ input: { cursor }, ctx }) => {
      const decks = await ctx.prisma.deck.findMany({
        where: { visibility: Visibility.Public },
        orderBy: { createdAt: 'desc' },
        take: ITEMS_PER_PAGE + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
      })

      const hasNextCursor = decks.length > ITEMS_PER_PAGE
      const nextCursor = hasNextCursor ? decks.pop()!.id : undefined

      return {
        nextCursor,
        decks: decks.map(deck => ({
          ...deck,
          image: getS3ImageUrl(deck.image),
        })),
      }
    }),
  toBeReviewed: protectedProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ input: { cursor }, ctx }) => {
      const { user } = ctx.session
      const now = new Date()

      const decks = await ctx.prisma.deck.findMany({
        take: ITEMS_PER_PAGE + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          studySessions: {
            some: {
              userId: user.id,
              studySessionBoxes: {
                some: {
                  studySessionBoxCards: { some: {} },
                  nextReview: { lte: now },
                },
              },
            },
          },
        },
      })

      const hasNextCursor = decks.length > ITEMS_PER_PAGE
      const nextCursor = hasNextCursor ? decks.pop()!.id : undefined

      return {
        decks: decks.map(deck => ({
          ...deck,
          image: getS3ImageUrl(deck.image),
        })),
        nextCursor,
      }
    }),
})
