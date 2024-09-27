import { TipoActoAdministrativo } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { getModelColumns, modelActoAdministrativo, orderTableColumns } from './_utils'

const columnsOrder = ['tipo', 'anio', 'numero']

export const actosRouter = createTRPCRouter({
  getList: protectedProcedure.query(async ({ ctx }) => {
    const actos = await ctx.db.actoAdministrativo.findMany({
      orderBy: [{ anio: 'desc' }, { numero: 'desc' }],
    })
    const columns = modelActoAdministrativo
      ? orderTableColumns(getModelColumns(modelActoAdministrativo), columnsOrder)
      : []
    return { actos, columns }
  }),

  save: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        tipo: z.nativeEnum(TipoActoAdministrativo),
        anio: z.string(),
        numero: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id) return ctx.db.actoAdministrativo.update({ where: { id: input.id }, data: input })
      else return ctx.db.actoAdministrativo.create({ data: input })
    }),

  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.actoAdministrativo.findUnique({ where: { id: input.id } })
  }),

  remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const acto = await ctx.db.actoAdministrativo.findUnique({ where: { id: input.id }, include: { enlacesUdae: true } })

    if (acto?.enlacesUdae.length)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'El acto administrativo se encuentra asociado a uno o más registros de la UDAE.',
      })

    return ctx.db.actoAdministrativo.delete({ where: { id: input.id } })
  }),
})
