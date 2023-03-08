import { z } from 'zod'
import type { QuestionContents } from '../../../types/question'
import type {
  QuizParticipantAnswerSelect,
  QuizParticipantAnswerSort,
} from '../../../types/quizParticipant'

import { createTRPCRouter, publicProcedure } from '../trpc'

export const quizParticipantRouter = createTRPCRouter({
  getAllCount: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ ctx, input }) => {
      const { sessionId } = input
      return ctx.prisma.participant.count({
        where: { sessionId },
      })
    }),
  getSubmitCount: publicProcedure
    .input(z.object({ sessionId: z.string(), questionId: z.string() }))
    .query(({ ctx, input }) => {
      const { sessionId, questionId } = input
      return ctx.prisma.participantSubimit.count({
        where: { sessionId, questionId },
      })
    }),
  getName: publicProcedure
    .input(z.object({ participantId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { participantId } = input
      const participant = await ctx.prisma.participant.findUnique({
        where: { id: participantId },
      })
      return participant?.name ?? participantId
    }),
  getIsSubmited: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        questionId: z.string(),
        participantId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { participantId, sessionId, questionId } = input
      const count = await ctx.prisma.participantSubimit.count({
        where: { participantId, sessionId, questionId },
      })
      return count > 0
    }),
  getIsWin: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        questionId: z.string(),
        participantId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { participantId, sessionId, questionId } = input
      const score = await ctx.prisma.participantScore.findFirst({
        where: { participantId, sessionId, questionId },
      })
      return score?.result === 'WIN'
    }),
  getWinCount: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        participantId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { participantId, sessionId } = input
      return ctx.prisma.participantScore.count({
        where: { participantId, sessionId, result: 'WIN' },
      })
    }),
  getQuestionWinCount: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        questionId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { questionId, sessionId } = input
      return ctx.prisma.participantScore.count({
        where: { questionId, sessionId, result: 'WIN' },
      })
    }),
  create: publicProcedure
    .input(z.object({ sessionId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId, name } = input
      const { id } = await ctx.prisma.participant.create({
        data: {
          sessionId,
          name,
        },
      })
      return id
    }),
  submitAnswer: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        participantId: z.string(),
        questionId: z.string(),
        answer: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { sessionId, participantId, questionId, answer } = input
      await ctx.prisma.participantSubimit.create({
        data: {
          sessionId,
          participantId,
          questionId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value: answer,
        },
      })
      const question = await ctx.prisma.quizQuestion.findUnique({
        where: { id: questionId },
      })
      const session = await ctx.prisma.quizSession.findUnique({
        where: { id: sessionId },
      })
      const startSec = session?.updatedAt.getTime() ?? 0
      const currentSec = Date.now()
      const contents = question?.contents as QuestionContents
      if (contents.type === 'select') {
        const selectAnswer = answer as QuizParticipantAnswerSelect
        await ctx.prisma.participantScore.create({
          data: {
            sessionId,
            participantId,
            questionId,
            result:
              selectAnswer.answerId === contents.answerId ? 'WIN' : 'LOSE',
            duration: currentSec - startSec
          },
        })
      } else if (contents.type === 'sort') {
        const sortAnswer = answer as QuizParticipantAnswerSort
        let isWin = true
        for (const ans of sortAnswer.answers) {
          const collectAnswer = contents.questions.find((q) => q.id === ans.id)
          if (collectAnswer?.order !== ans.order) {
            isWin = false
          }
        }
        await ctx.prisma.participantScore.create({
          data: {
            sessionId,
            participantId,
            questionId,
            result: isWin ? 'WIN' : 'LOSE',
            duration: currentSec - startSec,
          },
        })
      }
    }),
})
