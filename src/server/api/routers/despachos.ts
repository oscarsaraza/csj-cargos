import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const despachosRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.despacho.findMany({ orderBy: [{ nombre: 'asc' }] })
  }),

  byUsuarioId: protectedProcedure.input(z.object({ usuarioId: z.string() })).query(async ({ ctx, input }) => {
    const usuario = await ctx.db.user.findUnique({ where: { id: input.usuarioId } })
    const despacho = await ctx.db.despacho.findFirst({
      where: {
        OR: [
          { email: `${usuario?.username}@cendoj.ramajudicial.gov.co` },
          { email: `${usuario?.username}@cndj.gov.co` },
        ],
      },
    })
    return despacho
  }),

  saveObservacionesListado: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        observacionesListado: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.despacho.update({
        where: { id: input.id },
        data: { observacionesListadoCargos: input.observacionesListado },
      })
    }),
})
