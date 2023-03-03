import { createTRPCRouter } from './trpc'
import { quizMasterRouter } from './routers/quizMaster'
import { ishindenshinRouter } from './routers/ishindenshinRouter'
import { quizQuestionRouter } from './routers/quizQuestion'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  quizMaster: quizMasterRouter,
  ishindenshin: ishindenshinRouter,
  quizQuestion: quizQuestionRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
