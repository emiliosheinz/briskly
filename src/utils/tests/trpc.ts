import type { PrismaClient } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'

import { appRouter } from '~/server/api/root'
import { createInnerTRPCContext } from '~/server/api/trpc'

import { AUTH_STATES } from './with-next-auth'

export async function createTRPCCallerMock(params: {
  session: keyof typeof AUTH_STATES
}) {
  const sessionData = AUTH_STATES[params.session].data
  const ctx = await createInnerTRPCContext({ session: sessionData })
  const prisma = mockDeep<PrismaClient>()

  return {
    prisma,
    session: sessionData,
    caller: appRouter.createCaller({ ...ctx, prisma }),
  }
}
