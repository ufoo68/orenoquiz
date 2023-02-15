import type { IshinDenshinSessionState } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";



export const ishindenshinRouter = createTRPCRouter({
  create: publicProcedure.input(z.object({ answereCount: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.ishinDenshinSession.create({
        data: {
          answereCount: input.answereCount,
        }
      });
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
      };
    }
    const { state, version } = session;
    return {
      state,
      version,
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
});
