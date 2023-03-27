import { z } from 'zod'
import type { QuizSessionState } from '../../../types/quizSession'
import { getQuizSessionStateRank } from '../../../types/quizSession'
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
      return (session?.state ?? { type: 'end' }) as QuizSessionState
    }),
  getAll: publicProcedure
    .input(z.object({ masterId: z.string() }))
    .query(({ ctx, input }) => {
      const { masterId } = input
      return ctx.prisma.quizSession.findMany({
        where: { masterId },
      })
    }),
  getTotalScore: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { sessionId } = input
      const scores = await ctx.prisma.participantScore.groupBy({
        by: ['participantId'],
        where: {
          sessionId,
          result: 'WIN',
        },
        _count: {
          participantId: true,
        },
        _sum: {
          duration: true,
        },
        orderBy: [
          {
            _count: {
              participantId: 'desc',
            },
          },
          {
            _sum: {
              duration: 'asc',
            },
          },
        ],
      })
      const rankScores = scores.map((score, i) => ({
        id: score.participantId,
        rank: i + 1,
        winCount: score._count.participantId,
      }))
      const participants = await ctx.prisma.participant.findMany({
        where: {
          sessionId,
        },
      })
      const outRankScores = participants
        .filter(
          (participant) =>
            !rankScores.map((score) => score.id).includes(participant.id)
        )
        .map((participant) => ({
          id: participant.id,
          rank: rankScores.length + 1,
          winCount: 0,
        }))
      return [...rankScores, ...outRankScores].map((score) => ({
        name:
          participants.find((participant) => participant.id === score.id)
            ?.name ?? '',
        ...score,
      }))
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
  updateStateReset: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId } = input
      const session = await ctx.prisma.quizSession.findUnique({
        where: { id: sessionId },
      })
      if (!session) {
        return
      }
      await ctx.prisma.participant.deleteMany({
        where: { sessionId },
      })
      await ctx.prisma.participantScore.deleteMany({
        where: { sessionId },
      })
      await ctx.prisma.participantSubimit.deleteMany({
        where: { sessionId },
      })
      await ctx.prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          state: getQuizSessionStateEntry(),
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
  updateStateNextQuestion: publicProcedure
    .input(z.object({ sessionId: z.string(), questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId, questionId } = input
      await ctx.prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          state: getQuizSessionStateQuestion(questionId),
        },
      })
    }),
  updateStateRank: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId } = input
      await ctx.prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          state: getQuizSessionStateRank(),
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
