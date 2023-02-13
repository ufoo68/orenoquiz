import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const ishindenshinRouter = createTRPCRouter({
  create: publicProcedure.input(z.object({ answereCount: z.number() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.ishinDenshinSession.create({
        data: {
          answereCount: input.answereCount,
        }
      });
    }),
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.ishinDenshinSession.findMany();
    }),
  delete: publicProcedure.input(z.object({ sessionId: z.string() })).mutation(({ input, ctx }) => {
    return ctx.prisma.ishinDenshinSession.delete({ where: { id: input.sessionId } });
  })
});
