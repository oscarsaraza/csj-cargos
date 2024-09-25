import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const usersRouter = createTRPCRouter({
  getLoggedUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),

  byId: protectedProcedure.input(z.object({ userId: z.string() })).query(({ ctx, input }) => {
    return ctx.db.user.findFirst({ where: { id: input.userId } })
  }),
})
