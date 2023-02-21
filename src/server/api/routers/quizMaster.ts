import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const quizMasterRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ masterId: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.quizMaster.findUnique({
        where: {
          id: input.masterId,
        }
      });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.quizMaster.findMany();
  }),
  create: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.quizMaster.create({
      data: { title: '新しいクイズ' },
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
    }),
});
