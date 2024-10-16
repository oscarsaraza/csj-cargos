import { nullable, z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const enlaceActosRouter = createTRPCRouter({
  save: protectedProcedure
    .input(
      z.object({
        datosUdaeId: z.string(),
        actoAdministrativoId: z.string(),
        articulo: z.string(),
        literal: z.string().nullable(),
        numeral: z.string().nullable(),
        perfilCargo: z.string().default(''),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const datosUdae = await ctx.db.datosUdae.findUnique({
        where: { id: input.datosUdaeId },
        select: { anioActoAdministrativo: true, numeroActoAdministrativo: true, datosActoAdministrativo: true },
      })
      const acto = await ctx.db.actoAdministrativo.findUnique({ where: { id: input.actoAdministrativoId } })
      const actoCorrecto =
        acto?.anio === datosUdae?.anioActoAdministrativo?.toString() &&
        acto?.numero === datosUdae?.numeroActoAdministrativo
          ? 'Si'
          : 'No'

      const data = {
        articulo: input.articulo,
        literal: input.literal,
        numeral: input.numeral,
        perfilCargo: input.perfilCargo,
        actoAdministrativoId: input.actoAdministrativoId,
        userId: ctx.user.userId,
        actoCorrecto,
      }

      if (!datosUdae?.datosActoAdministrativo)
        return ctx.db.datosUdae.update({
          where: { id: input.datosUdaeId },
          data: { datosActoAdministrativo: { create: data } },
        })
      else return ctx.db.enlaceActoAdministrativo.update({ where: { datosUdaeId: input.datosUdaeId }, data })
    }),

  remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    // TODO: Only "deleteMany" works...
    return ctx.db.enlaceActoAdministrativo.deleteMany({ where: { id: input.id } })
  }),

  datosFormularioEdicion: protectedProcedure
    .input(
      z.object({
        datosUdaeId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.datosUdae.findUnique({
        where: { id: input.datosUdaeId },
        select: {
          id: true,

          circuitoJudicial: true,
          municipioSedeFisica: true,
          nombreDespacho: true,
          descripcionCargo: true,
          gradoCargo: true,

          tipoActoAdministrativo: true,
          anioActoAdministrativo: true,
          numeroActoAdministrativo: true,
          datosActoAdministrativo: { include: { actoAdministrativo: true } },
        },
      })
    }),
})
