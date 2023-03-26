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
          cards: {
            create: cards.map(card => ({
              ...card,
              validAnswers: card.validAnswers.split(';'),
            })),
          },
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
                validAnswers: card.validAnswers.split(';'),
                studySessionBoxCards: {
                  create: studySessionBoxes.map(box => ({
                    studySessionBoxId: box.id,
                  })),
                },
              })),
              update: editedCards?.map(({ id, ...card }) => ({
                where: { id },
                data: {
                  ...card,
                  validAnswers: card.validAnswers.split(';'),
                },
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
      const user = ctx.session?.user

      const decks = await ctx.prisma.deck.findMany({
        where: { visibility: Visibility.Public },
        orderBy: { createdAt: 'desc' },
        take: ITEMS_PER_PAGE + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          favorites: true,
        },
      })

      const hasNextCursor = decks.length > ITEMS_PER_PAGE
      const nextCursor = hasNextCursor ? decks.pop()!.id : undefined

      return {
        nextCursor,
        decks: decks.map(deck => ({
          ...deck,
          image: getS3ImageUrl(deck.image),
          favorites: deck.favorites.length,
          isFavorite: user
            ? deck.favorites.some(favorite => favorite.userId === user.id)
            : false,
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
        include: {
          favorites: true,
        },
      })

      const hasNextCursor = decks.length > ITEMS_PER_PAGE
      const nextCursor = hasNextCursor ? decks.pop()!.id : undefined

      return {
        decks: decks.map(deck => ({
          ...deck,
          image: getS3ImageUrl(deck.image),
          favorites: deck.favorites.length,
          isFavorite: deck.favorites
            .map(favorite => favorite.userId)
            .includes(user.id),
        })),
        nextCursor,
      }
    }),
  byUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input: { userId }, ctx }) => {
      const { user: signedInUser } = ctx.session

      const isUserGettingItsOwnDecks = signedInUser.id === userId

      const decks = await ctx.prisma.deck.findMany({
        where: {
          ownerId: userId,
          visibility: isUserGettingItsOwnDecks ? undefined : Visibility.Public,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          favorites: true,
        },
      })

      return decks.map(deck => ({
        ...deck,
        image: getS3ImageUrl(deck.image),
        favorites: deck.favorites.length,
        isFavorite: deck.favorites
          .map(favorite => favorite.userId)
          .includes(signedInUser.id),
      }))
    }),
  addFavorite: protectedProcedure
    .input(z.object({ deckId: z.string() }))
    .mutation(async ({ input: { deckId }, ctx }) => {
      const { user } = ctx.session

      await ctx.prisma.favorite.create({
        data: {
          deckId,
          userId: user.id,
        },
      })
    }),
  removeFavorite: protectedProcedure
    .input(z.object({ deckId: z.string() }))
    .mutation(async ({ input: { deckId }, ctx }) => {
      const { user } = ctx.session

      await ctx.prisma.favorite.deleteMany({
        where: { deckId, userId: user.id },
      })
    }),
  getMostFavoriteDecks: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.user

    const decks = await ctx.prisma.deck.findMany({
      where: { visibility: Visibility.Public, favorites: { some: {} } },
      orderBy: { favorites: { _count: 'desc' } },
      take: 10,
      include: {
        favorites: true,
      },
    })

    return decks.map(deck => ({
      ...deck,
      image: getS3ImageUrl(deck.image),
      favorites: deck.favorites.length,
      isFavorite: user
        ? deck.favorites.some(favorite => favorite.userId === user.id)
        : false,
    }))
  }),
  forYou: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.session

    const userTopics = await ctx.prisma.topic.findMany({
      where: { users: { some: { id: user.id } } },
    })

    if (userTopics.length === 0) {
      return []
    }

    const decks = await ctx.prisma.deck.findMany({
      where: {
        visibility: Visibility.Public,
        topics: {
          some: {
            id: {
              in: userTopics.map(topic => topic.id),
            },
          },
        },
      },
      select: {
        id: true,
        image: true,
        title: true,
        description: true,
        favorites: true,
        visibility: true,
        ownerId: true,
        updatedAt: true,
        createdAt: true,
        topics: {
          where: {
            id: {
              in: userTopics.map(topic => topic.id),
            },
          },
        },
      },
      orderBy: [
        {
          topics: {
            _count: 'desc',
          },
        },
        {
          favorites: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      take: 30,
    })

    return decks.map(deck => ({
      ...deck,
      image: getS3ImageUrl(deck.image),
      favorites: deck.favorites.length,
      isFavorite: user
        ? deck.favorites.some(favorite => favorite.userId === user.id)
        : false,
    }))
  }),
  favorites: protectedProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ input: { cursor }, ctx }) => {
      const { user } = ctx.session

      const favorites = await ctx.prisma.favorite.findMany({
        where: {
          userId: user.id,
        },
        include: {
          deck: {
            include: {
              favorites: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: ITEMS_PER_PAGE + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
      })

      const hasNextCursor = favorites.length > ITEMS_PER_PAGE
      const nextCursor = hasNextCursor ? favorites.pop()!.id : undefined

      return {
        nextCursor,
        decks: favorites
          .map(({ deck }) => deck)
          .map(deck => ({
            ...deck,
            image: getS3ImageUrl(deck.image),
            favorites: deck.favorites.length,
            isFavorite: user
              ? deck.favorites.some(favorite => favorite.userId === user.id)
              : false,
          })),
      }
    }),
  searchByTerm: publicProcedure
    .input(z.object({ term: z.string(), cursor: z.string().nullish() }))
    .query(async ({ input: { term, cursor }, ctx }) => {
      const user = ctx.session?.user

      const decks = await ctx.prisma.deck.findMany({
        where: {
          OR: [
            {
              title: { contains: term, mode: 'insensitive' },
            },
            {
              description: { contains: term, mode: 'insensitive' },
            },
            {
              topics: {
                some: { title: { contains: term, mode: 'insensitive' } },
              },
            },
          ],
          visibility: Visibility.Public,
        },
        orderBy: { createdAt: 'desc' },
        take: ITEMS_PER_PAGE + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          favorites: true,
        },
      })

      const hasNextCursor = decks.length > ITEMS_PER_PAGE
      const nextCursor = hasNextCursor ? decks.pop()!.id : undefined

      return {
        nextCursor,
        decks: decks.map(deck => ({
          ...deck,
          image: getS3ImageUrl(deck.image),
          favorites: deck.favorites.length,
          isFavorite: user
            ? deck.favorites.some(favorite => favorite.userId === user.id)
            : false,
        })),
      }
    }),
})
