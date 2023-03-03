import { z } from "zod"
import { getSelectTypeInit } from "../../../types/question"

import { createTRPCRouter, publicProcedure } from "../trpc"

export const quizQuestionRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ questionId: z.string() }))
    .query(({ input, ctx }) => {
      const { questionId } = input
      return ctx.prisma.quizQuestion.findUnique({
        where: {
          id: questionId,
        },
      })
    }),
  getAll: publicProcedure
    .input(z.object({ masterId: z.string() }))
    .query(({ ctx, input }) => {
      const { masterId } = input
      return ctx.prisma.quizQuestion.findMany({
        where: { masterId },
      })
    }),
  create: publicProcedure
    .input(z.object({ masterId: z.string(), order: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { masterId, order } = input
      await ctx.prisma.quizQuestion.create({
        data: {
          masterId,
          title: "新しい問題",
          contents: getSelectTypeInit(),
          order,
        },
      })
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        order: z.number(),
        contents: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { id, title, order, contents } = input
      await ctx.prisma.quizQuestion.update({
        where: { id },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { title, order, contents },
      })
    }),
  delete: publicProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { questionId } = input
      await ctx.prisma.quizQuestion.delete({
        where: { id: questionId },
      })
    }),
})
