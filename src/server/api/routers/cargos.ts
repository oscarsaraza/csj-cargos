import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

const getColumnPrettyName = (columnName: string) =>
  columnName
    .match(/(^[a-z]|[A-Z])[a-z0-9]+/g)
    ?.map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(' ') || ''

const getModelColumns = ({ fields }: (typeof Prisma.dmmf.datamodel.models)[0]) =>
  fields.map(({ name, type }) => ({ name, type, prettyName: getColumnPrettyName(name) }))

export const cargosRouter = createTRPCRouter({
  getPairingData: protectedProcedure.query(async ({ ctx }) => {
    const datosUdae = await ctx.db.datosUdae.findMany({
      where: { datosCsjId: { isSet: false } },
      orderBy: { numero: 'asc' },
    })
    const modelUdae = Prisma.dmmf.datamodel.models.find(({ name }) => name === 'DatosUdae')
    const columnsUdae = modelUdae ? getModelColumns(modelUdae) : []

    const datosCsj = await ctx.db.datosCsj.findMany({
      include: { datosUdae: true },
      orderBy: { numero: 'asc' },
    })
    const modelCsj = Prisma.dmmf.datamodel.models.find(({ name }) => name === 'DatosCsj')
    const columnsCsj = modelCsj ? getModelColumns(modelCsj) : []

    return { datosUdae, columnsUdae, datosCsj: datosCsj.filter((d) => d.datosUdae.length === 0), columnsCsj }
  }),

  savePairUdaeCsj: protectedProcedure
    .input(
      z.object({
        udaeRowId: z.string(),
        csjId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.datosUdae.update({
        where: { id: input.udaeRowId },
        data: { datosCsjId: input.csjId },
      })

      return result
    }),
})
