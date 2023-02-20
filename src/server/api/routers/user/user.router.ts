import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { UpdateUserInputSchema } from '~/utils/validators/user'

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      return ctx.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          email: true,
          topics: true,
          image: true,
        },
      })
    }),
  updateUser: protectedProcedure
    .input(UpdateUserInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, description, newTopics, deletedTopics } = input
      const { user } = ctx.session

      return ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          description,
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
    }),
})
