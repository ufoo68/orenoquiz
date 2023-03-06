import { z } from 'zod'
import type { QuizSessionState } from '../../../types/quizSession'
import { getQuizSessionStateAnswer } from '../../../types/quizSession'
import { getQuizSessionStateQuestion } from '../../../types/quizSession'
import { getQuizSessionStateEntry } from '../../../types/quizSession'

import { createTRPCRouter, publicProcedure } from '../trpc'

export const quizSessionRouter = createTRPCRouter({
  getState: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { sessionId } = input
      const session = await ctx.prisma.quizSession.findUnique({
        where: {
          id: sessionId,
        },
      })
      return session?.state as QuizSessionState
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
      const { masterId } = input
      await ctx.prisma.quizSession.create({
        data: {
          masterId,
          state: getQuizSessionStateEntry(),
        },
      })
    }),
  updateStateStart: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId } = input
      const session = await ctx.prisma.quizSession.findUnique({
        where: { id: sessionId },
      })
      if (!session) {
        return
      }
      const quiz = await ctx.prisma.quizMaster.findUnique({
        where: { id: session.masterId },
      })
      if (!quiz) {
        return
      }
      const question = await ctx.prisma.quizQuestion.findFirst({
        where: { masterId: quiz.id, order: 1 },
      })
      if (!question) {
        return
      }
      await ctx.prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          state: getQuizSessionStateQuestion(question.id),
        },
      })
    }),
  updateStateAnswer: publicProcedure
    .input(z.object({ sessionId: z.string(), questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId, questionId } = input
      await ctx.prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          state: getQuizSessionStateAnswer(questionId),
        },
      })
    }),
  delete: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId } = input
      await ctx.prisma.quizSession.delete({
        where: { id: sessionId },
      })
      await ctx.prisma.participant.deleteMany({
        where: { sessionId },
      })
      await ctx.prisma.participantScore.deleteMany({
        where: { sessionId },
      })
      await ctx.prisma.participantSubimit.deleteMany({
        where: { sessionId },
      })
    }),
})
