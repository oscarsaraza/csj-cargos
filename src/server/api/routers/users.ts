import { createTRPCRouter, protectedProcedure } from '../trpc'

export const usersRouter = createTRPCRouter({
  getLoggedUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),
})
