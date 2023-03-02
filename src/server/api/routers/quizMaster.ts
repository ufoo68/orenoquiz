import { z } from "zod";
import { getSelectTypeInit } from "../../../types/question";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const quizMasterRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.quizMaster.findMany();
  }),
  create: publicProcedure.mutation(async ({ ctx }) => {
    const { id } = await ctx.prisma.quizMaster.create({
      data: { title: '新しいクイズ' },
    });
    await ctx.prisma.quizQuestion.create({
      data: { masterId: id, title: '新しい問題', contents: getSelectTypeInit() }
    });
  }),
  updateTitle: publicProcedure.input(z.object({ masterId: z.string(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { masterId, title } = input;
      await ctx.prisma.quizMaster.update({
        where: { id: masterId },
        data: { title },
      });
    }),
  delete: publicProcedure.input(z.object({ masterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { masterId } = input;
      await ctx.prisma.quizMaster.delete({
        where: { id: masterId },
      });
      await ctx.prisma.quizQuestion.deleteMany({
        where: { masterId },
      });
    }),
});
