import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const quizMasterRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ masterId: z.number() }))
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
});
