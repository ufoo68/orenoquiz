import { z } from 'zod'
import type { QuestionContents } from '../../../types/question'
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
  getWithoutAnswer: publicProcedure
    .input(z.object({ questionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { questionId } = input
      const question = await ctx.prisma.quizQuestion.findUnique({
        where: {
          id: questionId,
        },
      })
      if (!question) {
        return null
      }
      const contents = question.contents as QuestionContents
      return {
        ...question,
        contents:
          contents.type === 'select'
            ? {
                ...contents,
                answerId: '',
              }
            : {
                ...contents,
                questions: contents.questions.map(({ id, label }) => ({
                  id,
                  label,
                })),
              },
      }
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
          title: '',
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
  changeOrder: publicProcedure
    .input(
      z.object({
        id: z.string(),
        order: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, order } = input
      await ctx.prisma.quizQuestion.update({
        where: { id },
        data: { order },
      })
    }),
  delete: publicProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { questionId } = input
      const question = await ctx.prisma.quizQuestion.findUnique({
        where: { id: questionId },
      })
      if (!question) {
        return
      }
      await ctx.prisma.quizQuestion.updateMany({
        where: { masterId: question.masterId, order: { gt: question.order } },
        data: { order: { decrement: 1 } },
      })
      await ctx.prisma.quizQuestion.delete({
        where: { id: questionId },
      })
    }),
})
