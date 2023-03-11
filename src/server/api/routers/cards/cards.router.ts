import { z } from 'zod'

import { MAX_TOPICS_PER_DECK_AND_USER } from '~/constants'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { generateFlashCards } from '~/utils/openai'
import { TopicInputSchema } from '~/utils/validators/topic'

export const cardsRouter = createTRPCRouter({
  generateAiPoweredCards: protectedProcedure
    .input(
      z.object({
        topics: z
          .array(TopicInputSchema)
          .min(1)
          .max(MAX_TOPICS_PER_DECK_AND_USER),
      }),
    )
    .mutation(({ input: { topics } }) => {
      return generateFlashCards({ topics })
    }),
})
