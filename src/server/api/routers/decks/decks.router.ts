import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { DeckSchema } from '~/utils/validators/deck'

export const decksRouter = createTRPCRouter({
  createNewDeck: protectedProcedure
    .input(DeckSchema)
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
})
