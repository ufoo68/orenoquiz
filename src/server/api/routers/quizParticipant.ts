import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '../trpc'

export const quizParticipantRouter = createTRPCRouter({
  getAllCount: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ ctx, input }) => {
      const { sessionId } = input
      return ctx.prisma.participant.count({
        where: { sessionId },
      })
    }),
  create: publicProcedure
    .input(z.object({ sessionId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId, name } = input
      const { id } = await ctx.prisma.participant.create({
        data: {
          sessionId,
          name,
        },
      })
      return id
    }),
})
