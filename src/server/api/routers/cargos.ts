import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

const getColumnPrettyName = (columnName: string) =>
  columnName
    .match(/(^[a-z]|[A-Z])[a-z0-9]+/g)
    ?.map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(' ') ?? ''

const getModelColumns = ({ fields }: (typeof Prisma.dmmf.datamodel.models)[0]) =>
  fields.map(({ name, type }) => ({ name, type, prettyName: getColumnPrettyName(name) }))

export const cargosRouter = createTRPCRouter({
  getPairingDataCsj: protectedProcedure.query(async ({ ctx }) => {
    const datosUdae = await ctx.db.datosUdae.findMany({ where: { enlaceCsj: null }, orderBy: { numero: 'asc' } })
    const modelUdae = Prisma.dmmf.datamodel.models.find(({ name }) => name === 'DatosUdae')
    const columnsUdae = modelUdae ? getModelColumns(modelUdae) : []

    const datosCsj = await ctx.db.datosCsj.findMany({ where: { enlace: null }, orderBy: { numero: 'asc' } })
    const modelCsj = Prisma.dmmf.datamodel.models.find(({ name }) => name === 'DatosCsj')
    const columnsCsj = modelCsj ? getModelColumns(modelCsj) : []

    return { datosUdae, columnsUdae, datosCsj, columnsCsj }
  }),

  savePairUdaeCsj: protectedProcedure
    .input(
      z.object({
        udaeRowId: z.string(),
        csjId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const csj = await ctx.db.datosCsj.findUnique({ where: { id: input.csjId }, include: { enlace: true } })
      if (csj?.enlace) throw new Error('El registro del CSJ ya se encuentra asociado a un registro de la UDAE.')

      const udae = await ctx.db.datosUdae.findUnique({ where: { id: input.udaeRowId }, include: { enlaceCsj: true } })
      if (udae?.enlaceCsj) throw new Error('El registro de la UDAE ya se encuentra asociado a un registro del CSJ.')

      const result = await ctx.db.enlaceCsj.create({
        data: { datosUdaeId: input.udaeRowId, datosCsjId: input.csjId, userId: ctx.user.userId },
      })

      return result
    }),
})
