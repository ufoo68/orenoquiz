import type {
  IshinDenshinSessionState,
  IshinDenshinSessionResult,
} from '@prisma/client'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { IshinDenshinConfig } from '../../../types/ishindenshin'
import { getConfig } from 'next-s3-upload/utils/config'

export const ishindenshinRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const config: IshinDenshinConfig = {
      limit: 3,
      participants: {
        groomName: '新郎🤵🏻‍♂️',
        brideName: '新婦👰🏻‍♀️',
      },
    }
    await ctx.prisma.ishinDenshinSession.create({
      data: { userId, state: 'WAIT', version: 1, config },
    })
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
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
  getConfig: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const session = await ctx.prisma.ishinDenshinSession.findUnique({
        where: { id: input.sessionId },
      })
      return session?.config as IshinDenshinConfig
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
  updateConfig: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        config: z.object({
          standbyScreenUrl: z.string().optional(),
          limit: z.number(),
          participants: z.object({
            groomName: z.string(),
            brideName: z.string(),
          }),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { sessionId, config } = input
      await ctx.prisma.ishinDenshinSession.update({
        where: { id: sessionId },
        data: { config },
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
