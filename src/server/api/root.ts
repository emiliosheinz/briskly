import { decksRouter } from './routers/decks'
import { filesRouter } from './routers/files'
import { studySessionRouter } from './routers/study-session'
import { createTRPCRouter } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  decks: decksRouter,
  files: filesRouter,
  studySession: studySessionRouter,
})

export type AppRouter = typeof appRouter
