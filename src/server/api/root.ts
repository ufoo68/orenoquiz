import { createTRPCRouter } from "./trpc";
import { quizMasterRouter } from "./routers/quizMaster";
import { ishindenshinRouter } from "./routers/ishindenshinRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  quizMaster: quizMasterRouter,
  ishindenshin: ishindenshinRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
