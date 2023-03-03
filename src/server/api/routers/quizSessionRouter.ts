import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '../trpc'

export const quizSessionRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ questionId: z.string() }))
    .query(({ input, ctx }) => {
      const { questionId } = input
      return ctx.prisma.quizSession.findUnique({
        where: {
          id: questionId,
        },
      })
    }),
  getAll: publicProcedure
    .input(z.object({ masterId: z.string() }))
    .query(({ ctx, input }) => {
      const { masterId } = input
      return ctx.prisma.quizSession.findMany({
        where: { masterId },
      })
    }),
  create: publicProcedure
    .input(z.object({ masterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { masterId} = input
      await ctx.prisma.quizSession.create({
        data: {
          masterId,
          state: {},
        },
      })
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        state: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { id, state } = input
      await ctx.prisma.quizSession.update({
        where: { id },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { state },
      })
    }),
  delete: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId } = input
      await ctx.prisma.quizSession.delete({
        where: { id: sessionId },
      })
    }),
})
