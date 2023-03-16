import { z } from 'zod'
import { getSelectTypeInit } from '../../../types/question'

import { createTRPCRouter, publicProcedure } from '../trpc'

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
  getNextQuestionId: publicProcedure
    .input(z.object({ questionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { questionId } = input
      const question = await ctx.prisma.quizQuestion.findUnique({
        where: {
          id: questionId,
        },
      })
      if (!question) {
        return ''
      }
      const nextQuestion = await ctx.prisma.quizQuestion.findFirst({
        where: {
          masterId: question.masterId,
          order: question.order + 1,
        },
      })
      return nextQuestion?.id ?? ''
    }),
  getAll: publicProcedure
    .input(z.object({ masterId: z.string() }))
    .query(({ ctx, input }) => {
      const { masterId } = input
      return ctx.prisma.quizQuestion.findMany({
        where: { masterId },
        orderBy: { order: 'asc' },
      })
    }),
  create: publicProcedure
    .input(z.object({ masterId: z.string(), order: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { masterId, order } = input
      await ctx.prisma.quizQuestion.create({
        data: {
          masterId,
          title: '新しい問題',
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
  changeOrder: publicProcedure.input(z.object({
    question1: z.object({
      id: z.string(),
      order: z.number(),
    }),
    question2: z.object({
      id: z.string(),
      order: z.number(),
    }),
  })).mutation(async ({ ctx, input }) => {
    const { question1, question2 } = input
    await ctx.prisma.quizQuestion.update({
      where: { id: question1.id },
      data: { order: question1.order },
    })
    await ctx.prisma.quizQuestion.update({
      where: { id: question2.id },
      data: { order: question2.order },
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
