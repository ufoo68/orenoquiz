import { z } from 'zod'
import { getSelectTypeInit } from '../../../types/question'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const quizMasterRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const userId = ctx.session.user.id
    return ctx.prisma.quizMaster.findMany({
      where: { userId },
    })
  }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const userId = ctx.session.user.id
    const { id } = await ctx.prisma.quizMaster.create({
      data: { title: '', userId },
    })
    await ctx.prisma.quizQuestion.create({
      data: {
        masterId: id,
        title: '',
        contents: getSelectTypeInit(),
      },
    })
  }),
  updateTitle: protectedProcedure
    .input(z.object({ masterId: z.string(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { masterId, title } = input
      await ctx.prisma.quizMaster.update({
        where: { id: masterId },
        data: { title },
      })
    }),
  delete: protectedProcedure
    .input(z.object({ masterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { masterId } = input
      await ctx.prisma.quizMaster.delete({
        where: { id: masterId },
      })
      await ctx.prisma.quizQuestion.deleteMany({
        where: { masterId },
      })
      const sessions = await ctx.prisma.quizSession.findMany({
        where: { masterId },
      })
      await ctx.prisma.quizSession.deleteMany({ where: { masterId } })
      await ctx.prisma.participant.deleteMany({
        where: { sessionId: { in: sessions.map((s) => s.id) } },
      })
      await ctx.prisma.participantScore.deleteMany({
        where: { sessionId: { in: sessions.map((s) => s.id) } },
      })
      await ctx.prisma.participantSubimit.deleteMany({
        where: { sessionId: { in: sessions.map((s) => s.id) } },
      })
    }),
})
