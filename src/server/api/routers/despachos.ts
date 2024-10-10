import { createTRPCRouter, protectedProcedure } from '../trpc'

export const despachosRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.despacho.findMany({ orderBy: [{ nombre: 'asc' }] })
  }),
})
