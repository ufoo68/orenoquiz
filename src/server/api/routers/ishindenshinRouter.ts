import type {
  IshinDenshinSessionState,
  IshinDenshinSessionResult,
} from '@prisma/client'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const ishindenshinRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const userId = (ctx.session.user as any)?.id as string
    await ctx.prisma.ishinDenshinSession.create({
      data: { userId, state: 'WAIT', version: 1 },
    })
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const userId = (ctx.session.user as any)?.id as string
    return ctx.prisma.ishinDenshinSession.findMany({
      where: { userId },
    })
  }),
  delete: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { sessionId } = input
      await ctx.prisma.ishinDenshinSession.delete({
        where: { id: sessionId },
      })
      await ctx.prisma.ishinDenshinSubmit.deleteMany({
        where: { sessionId },
      })
    }),
  getStatus: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const session = await ctx.prisma.ishinDenshinSession.findUnique({
        where: { id: input.sessionId },
      })
      if (!session) {
        return {
          state: 'WAIT' as IshinDenshinSessionState,
          version: 0,
          result: 'NONE' as IshinDenshinSessionResult,
        }
      }
      const { state, version, result } = session
      return {
        state,
        version,
        result,
      }
    }),
  submitAnswer: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        version: z.number(),
        answereName: z.string(),
        boardImageUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { boardImageUrl, ...params } = input
      await ctx.prisma.ishinDenshinSubmit.create({
        data: {
          ...params,
          boardImageBuffer: Buffer.from(boardImageUrl, 'utf8'),
        },
      })
    }),
  getAnswer: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        version: z.number(),
        answereName: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { sessionId, answereName, version } = input
      const answer = await ctx.prisma.ishinDenshinSubmit.findFirst({
        where: {
          sessionId,
          answereName,
          version,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      const boardImageUrl = answer?.boardImageBuffer?.toString('utf8')
      return { boardImageUrl }
    }),
  getSubmited: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        version: z.number(),
        answereName: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { sessionId, version, answereName } = input
      const count = await ctx.prisma.ishinDenshinSubmit.count({
        where: {
          sessionId,
          version,
          answereName,
        },
      })
      return { submited: count > 0 }
    }),
  updateState: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        state: z.enum(['SHOW', 'WAIT']).optional(),
        result: z.enum(['MATCH', 'NOT_MATCH', 'NONE']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { sessionId, state, result } = input
      await ctx.prisma.ishinDenshinSession.update({
        where: { id: sessionId },
        data: { state, result },
      })
    }),
  incrementVersion: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { sessionId } = input
      await ctx.prisma.ishinDenshinSession.update({
        where: { id: sessionId },
        data: { state: 'WAIT', result: 'NONE', version: { increment: 1 } },
      })
    }),
  versionReset: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { sessionId } = input
      await ctx.prisma.ishinDenshinSubmit.deleteMany({
        where: { sessionId },
      })
      await ctx.prisma.ishinDenshinSession.update({
        where: { id: sessionId },
        data: { state: 'WAIT', result: 'NONE', version: 1 },
      })
    }),
})
