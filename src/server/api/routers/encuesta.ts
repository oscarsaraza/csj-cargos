import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { separarNombre } from '~/lib/utils'

export const encuestaRouter = createTRPCRouter({
  listaCargosDespacho: protectedProcedure.query(async ({ ctx, input }) => {
    const email = `${ctx.user.username}@cendoj.ramajudicial.gov.co`
    const despacho = await ctx.db.despacho.findFirst({ where: { email } })

    if (!despacho)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No se encontró ningun despacho asociado a esta cuenta de usuario.',
      })

    const cargosDespacho = await ctx.db.datosUdae.findMany({
      where: { enlaceCsj: { datosCsj: { codigoDespacho: despacho.codigo } } },
      select: { id: true, descripcionCargo: true, datosEncuesta: { select: { id: true } } },
      orderBy: { descripcionCargo: 'asc' },
    })

    return { cargosDespacho: cargosDespacho }
  }),

  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const data = await ctx.db.datosUdae.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        datosEncuesta: true,
        descripcionCargo: true,
        gradoCargo: true,
        nombreDespacho: true,
        enlaceCsj: { include: { datosCsj: true } },
        enlaceDeaj: { include: { datosDeaj: true } },
      },
    })

    const tieneServidorEnProvisionalidad = data?.enlaceDeaj?.datosDeaj?.claseNombramiento === 'Provisionalidad'
    const documento = data?.datosEncuesta?.documento || data?.enlaceCsj?.datosCsj.cedula || ''
    const { nombres, apellidos } = data?.datosEncuesta || separarNombre(data?.enlaceCsj?.datosCsj.propiedad || '')
    const nombresEncuestaProv = data?.datosEncuesta
      ? { nombres: data?.datosEncuesta.nombresProv, apellidos: data?.datosEncuesta.apellidosProv }
      : null
    const documentoProv = data?.datosEncuesta?.documentoProv || data?.enlaceDeaj?.datosDeaj?.numDocumento || ''
    const { nombres: nombresProv, apellidos: apellidosProv } = tieneServidorEnProvisionalidad
      ? nombresEncuestaProv || separarNombre(data.enlaceDeaj?.datosDeaj?.servidor || '')
      : {}

    return {
      data,
      defaults: {
        nombres,
        apellidos,
        documento,
        documentoProv,
        nombresProv,
        apellidosProv,
        tieneServidorEnProvisionalidad,
      },
    }
  }),
})
