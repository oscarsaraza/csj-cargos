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
  cargoExiste: z.enum(['Si', 'No', 'Si con novedad']),
  tipoNovedad: z.string(),
  tipoTraslado: z.string(),
  despachoTrasladoDestinoId: z.string().optional(),
  actoTrasladoId: z.string().optional(),
  observacionesNovedad: z.string(),
  observacionesDespacho: z.string(),
  observacionesClasificacion: z.string(),
  tieneServidorProp: z.boolean(),
  servidorPropiedad: servidorPropiedadSchema.nullable(),
  tieneServidorProv: z.boolean(),
  servidorProvisionalidad: servidorProvisionalidadSchema.nullable(),
})

export const encuestaRouter = createTRPCRouter({
  listaCargosDespacho: protectedProcedure.query(async ({ ctx }) => {
    const despachos = await ctx.db.despacho.findMany({
      where: {
        OR: [
          { email: `${ctx.user.username}@cendoj.ramajudicial.gov.co` },
          { email: `${ctx.user.username}@cndj.gov.co` },
        ],
      },
    })

    if (!despachos.length)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No se encontró ningun despacho asociado a esta cuenta de usuario.',
      })

    const codigos = despachos.map((despacho) => despacho.codigo)
    const nombres = despachos.map((despacho) => despacho.nombre)

    const cargosDespacho = await ctx.db.datosUdae.findMany({
      where: {
        OR: [{ enlaceCsj: { datosCsj: { codigoDespacho: { in: codigos } } } }, { nombreDespacho: { in: nombres } }],
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
        anioActoAdministrativo: true,
        numeroActoAdministrativo: true,
        tipoActoAdministrativo: true,
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
    const { datosUdaeId, servidorPropiedad, servidorProvisionalidad, ...data } = input

    const tieneServidorProp = data.tieneServidorProp ? 'Si' : 'No'
    const tieneServidorProv = data.tieneServidorProv ? 'Si' : 'No'
    const familiaresDependientes = parseInt(servidorPropiedad?.familiaresDependientes || '0')
    const familiaresDependientesProv = parseInt(servidorProvisionalidad?.familiaresDependientesProv || '0')

    const encuesta = {
      ...data,
      ...servidorPropiedad,
      ...servidorProvisionalidad,
      tieneServidorProp,
      tieneServidorProv,
      familiaresDependientes,
      familiaresDependientesProv,
    }

    try {
      await ctx.db.datosEncuesta.delete({ where: { datosUdaeId } })
    } catch (error) {}
    return ctx.db.datosEncuesta.create({ data: { datosUdaeId, ...encuesta } })
  }),
})
