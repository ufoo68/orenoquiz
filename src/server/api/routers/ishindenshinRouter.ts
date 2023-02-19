import type { IshinDenshinSessionState, IshinDenshinSessionResult } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";



export const ishindenshinRouter = createTRPCRouter({
  create: publicProcedure
    .mutation(async ({ ctx }) => {
      await ctx.prisma.ishinDenshinSession.create({ data: { state: 'WAIT', version: 1 } });
    }),
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.ishinDenshinSession.findMany();
    }),
  delete: publicProcedure.input(z.object({ sessionId: z.string() })).mutation(async ({ input, ctx }) => {
    await ctx.prisma.ishinDenshinSession.delete({ where: { id: input.sessionId } });
  }),
  getStatus: publicProcedure.input(z.object({ sessionId: z.string() })).query(async ({ input, ctx }) => {
    const session = await ctx.prisma.ishinDenshinSession.findUnique({ where: { id: input.sessionId } });
    if (!session) {
      return {
        state: 'WAIT' as IshinDenshinSessionState,
        version: 0,
        result: 'NONE' as IshinDenshinSessionResult,
      };
    }
    const { state, version, result } = session;
    return {
      state,
      version,
      result,
    }
  }),
  submitAnswer: publicProcedure.input(z.object(
    {
      sessionId: z.string(),
      version: z.number(),
      answereName: z.string(),
      boardImageUrl: z.string(),
    })).mutation(async ({ input, ctx }) => {
      const { boardImageUrl, ...params } = input;
      await ctx.prisma.ishinDenshinSubmit.create({
        data: {
          ...params,
          boardImageBuffer: Buffer.from(boardImageUrl, 'utf8'),
        }
      })
    }),
  getAnswer: publicProcedure.input(z.object({
    sessionId: z.string(),
    version: z.number(),
    answereName: z.string(),
  })).query(async ({ input, ctx }) => {
    const { sessionId, answereName, version } = input;
    const answer = await ctx.prisma.ishinDenshinSubmit.findFirst({
      where: {
        sessionId,
        answereName,
        version,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    const boardImageUrl = answer?.boardImageBuffer?.toString('utf8');
    return { boardImageUrl };
  }),
  getSubmited: publicProcedure.input(z.object({
    sessionId: z.string(),
    version: z.number(),
    answereName: z.string(),
  })).query(async ({ input, ctx }) => {
    const { sessionId, version, answereName } = input;
    const count = await ctx.prisma.ishinDenshinSubmit.count({
      where: {
        sessionId,
        version,
        answereName,
      }
    });
    return { submited: count > 0 };
  }),
  updateState: publicProcedure.input(z.object(
    {
      sessionId: z.string(),
      state: z.enum(['SHOW', 'WAIT']).optional(),
      result: z.enum(['MATCH', 'NOT_MATCH', 'NONE']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { sessionId, state, result } = input;
      await ctx.prisma.ishinDenshinSession.update({
        where: { id: sessionId },
        data: { state, result },
      });
    }),
  incrementVersion: publicProcedure.input(z.object(
    {
      sessionId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { sessionId } = input;
      await ctx.prisma.ishinDenshinSession.update({
        where: { id: sessionId },
        data: { state: 'WAIT', result: 'NONE', version: { increment: 1 } },
      });
    }),
});
