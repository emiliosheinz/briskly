import { decksRouter } from './routers/decks'
import { filesRouter } from './routers/files'
import { createTRPCRouter } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  decks: decksRouter,
  files: filesRouter,
})

export type AppRouter = typeof appRouter
