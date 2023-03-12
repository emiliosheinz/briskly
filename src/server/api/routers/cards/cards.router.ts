import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { generateFlashCards } from '~/utils/openai'
import { DeckInputSchema } from '~/utils/validators/deck'

export const cardsRouter = createTRPCRouter({
  generateAiPoweredCards: protectedProcedure
    .input(DeckInputSchema.pick({ topics: true, title: true }))
    .mutation(({ input: { topics, title } }) => {
      return generateFlashCards({ topics, title })
    }),
})
