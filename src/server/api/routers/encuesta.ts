import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { separarNombre } from '~/lib/utils'

const servidorPropiedadSchema = z.object({
  tipoDocumento: z.string(),
  documento: z.string(),
  nombres: z.string(),
  apellidos: z.string(),
  nivelEscolaridad: z.string(),
  familiaresDependientes: z.string().optional().default('0'),
  profesion1: z.string(),
  profesion2: z.string().optional().default(''),
  profesion3: z.string().optional().default(''),
})

const servidorProvisionalidadSchema = z.object({
  tipoDocumentoProv: z.string(),
  documentoProv: z.string(),
  nombresProv: z.string(),
  apellidosProv: z.string(),
  nivelEscolaridadProv: z.string(),
  familiaresDependientesProv: z.string().default('0'),
  profesion1Prov: z.string(),
  profesion2Prov: z.string().optional().default(''),
  profesion3Prov: z.string().optional().default(''),
})

const saveEncuestaSchema = z.object({
  datosUdaeId: z.string(),
  tieneServidorProp: z.boolean(),
  servidorPropiedad: servidorPropiedadSchema.nullable(),
  tieneServidorProv: z.boolean(),
  servidorProvisionalidad: servidorProvisionalidadSchema.nullable(),
})

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
      where: {
        OR: [{ enlaceCsj: { datosCsj: { codigoDespacho: despacho.codigo } } }, { nombreDespacho: despacho.nombre }],
      },
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
    const tieneServidorEnPropiedad =
      data?.enlaceCsj?.datosCsj.estadoActual === 'PROPIEDAD' ||
      data?.enlaceDeaj?.datosDeaj?.claseNombramiento === 'Propiedad'
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
        tieneServidorEnPropiedad,
      },
    }
  }),

  save: protectedProcedure.input(saveEncuestaSchema).mutation(async ({ ctx, input }) => {
    const { datosUdaeId, ...data } = input
    const tieneServidorProv = data.tieneServidorProv ? 'Si' : 'No'
    const familiaresDependientes = parseInt(data.servidorPropiedad?.familiaresDependientes || '0')
    const familiaresDependientesProv = parseInt(data.servidorProvisionalidad?.familiaresDependientesProv || '0')

    return ctx.db.datosEncuesta.upsert({
      where: { datosUdaeId },
      create: {
        datosUdaeId,
        ...data.servidorPropiedad,
        ...data.servidorProvisionalidad,
        tieneServidorProv,
        familiaresDependientes,
        familiaresDependientesProv,
      },
      update: {
        ...data.servidorPropiedad,
        ...data.servidorProvisionalidad,
        tieneServidorProv,
        familiaresDependientes,
        familiaresDependientesProv,
      },
    })
  }),
})
