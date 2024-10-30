import { z } from 'zod'
import { separarNombre } from '~/lib/utils'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { getModelColumns, modelCsj, modelDeaj, modelUdae, orderTableColumns } from './_utils'

const udaeColumnsOrder = [
  'municipioSedeFisica',
  'descripcionCargo',
  'nombreDespacho',
  'especialidad',
  'gradoCargo',
  'tipoActoAdministrativo',
  'anioActoAdministrativo',
  'numeroActoAdministrativo',
  'nombreEncuesta',
]
const csjColumnsOrder = ['municipio', 'cargo', 'depacho', 'propiedad']
const deajColumnsOrder = ['ciudadUbicacionLaboral', 'cargoTitular', 'dependenciaTitular']

export const cargosRouter = createTRPCRouter({
  getPairingDataCsj: protectedProcedure.query(async ({ ctx }) => {
    const datosUdae = await ctx.db.datosUdae.findMany({
      where: { enlaceCsj: null },
      select: {
        id: true,
        municipioSedeFisica: true,
        descripcionCargo: true,
        nombreDespacho: true,
        especialidad: true,
        gradoCargo: true,
        tipoActoAdministrativo: true,
        anioActoAdministrativo: true,
        numeroActoAdministrativo: true,
        datosEncuesta: true,
      },
      orderBy: [{ municipioSedeFisica: 'asc' }, { nombreDespacho: 'asc' }, { descripcionCargo: 'asc' }],
    })
    const columnsUdae = modelUdae
      ? [
          ...orderTableColumns(
            getModelColumns({
              ...modelUdae,
              fields: modelUdae.fields.filter((field) => udaeColumnsOrder.includes(field.name)),
            }),
            udaeColumnsOrder,
          ),
          {
            name: 'nombreEncuesta',
            type: 'string',
            prettyName: 'Nombre funcionario en encuesta',
            modelName: 'DatosUdae',
          },
        ]
      : []

    const datosCsj = await ctx.db.datosCsj.findMany({
      where: { enlace: null },
      orderBy: [{ municipio: 'asc' }, { depacho: 'asc' }, { cargo: 'asc' }],
    })
    const columnsCsj = modelCsj ? orderTableColumns(getModelColumns(modelCsj), csjColumnsOrder) : []

    return {
      datosUdae: datosUdae.map((fila) => ({
        ...fila,
        nombreEncuesta: fila.datosEncuesta
          ? `${fila.datosEncuesta?.nombresProv} ${fila.datosEncuesta?.apellidosProv}`.trim() ||
            `${fila.datosEncuesta?.nombres} ${fila.datosEncuesta?.apellidos}`.trim()
          : '',
      })),
      columnsUdae,
      datosCsj,
      columnsCsj,
    }
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

  getPairingDataDeaj: protectedProcedure.query(async ({ ctx }) => {
    const datosUdae = await ctx.db.datosUdae.findMany({
      where: { enlaceDeaj: null },
      orderBy: [{ municipioSedeFisica: 'asc' }, { nombreDespacho: 'asc' }, { descripcionCargo: 'asc' }],
    })
    const columnsUdae = modelUdae ? orderTableColumns(getModelColumns(modelUdae), udaeColumnsOrder) : []

    const datosDeaj = await ctx.db.datosDeaj.findMany({
      where: { enlace: null },
      orderBy: [{ ciudadUbicacionLaboral: 'asc' }, { dependenciaTitular: 'asc' }, { cargoTitular: 'asc' }],
    })
    const columnsDeaj = modelDeaj ? orderTableColumns(getModelColumns(modelDeaj), deajColumnsOrder) : []

    return { datosUdae, columnsUdae, datosDeaj, columnsDeaj }
  }),

  savePairUdaeDeaj: protectedProcedure
    .input(
      z.object({
        udaeRowId: z.string(),
        deajId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deaj = await ctx.db.datosDeaj.findUnique({ where: { id: input.deajId }, include: { enlace: true } })
      if (deaj?.enlace) throw new Error('El registro de la DEAJ ya se encuentra asociado a un registro de la UDAE.')

      const udae = await ctx.db.datosUdae.findUnique({ where: { id: input.udaeRowId }, include: { enlaceDeaj: true } })
      if (udae?.enlaceDeaj) throw new Error('El registro de la UDAE ya se encuentra asociado a un registro del DEAJ.')

      const result = await ctx.db.enlaceDeaj.create({
        data: { datosUdaeId: input.udaeRowId, datosDeajId: input.deajId, userId: ctx.user.userId },
      })

      return result
    }),

  getPairingDataActos: protectedProcedure
    .input(z.object({ mostrarTodos: z.boolean() }))
    .query(async ({ ctx, input }) => {
      const datosUdae = await ctx.db.datosUdae.findMany({
        where: input.mostrarTodos ? {} : { datosActoAdministrativo: null },
        include: { datosActoAdministrativo: { select: { id: true } } },
        orderBy: [{ municipioSedeFisica: 'asc' }, { nombreDespacho: 'asc' }, { descripcionCargo: 'asc' }],
      })
      const columnOrders = [
        'municipioSedeFisica',
        'descripcionCargo',
        'nombreDespacho',
        'tipoActoAdministrativo',
        'anioActoAdministrativo',
        'numeroActoAdministrativo',
      ]
      const columnsUdae = modelUdae ? orderTableColumns(getModelColumns(modelUdae), columnOrders) : []

      return { datosUdae, columnsUdae }
    }),

  getConsolidado: protectedProcedure.query(async ({ ctx }) => {
    const registros = await ctx.db.datosUdae.findMany({
      where: { OR: [{ enlaceCsj: { isNot: null } }, { enlaceDeaj: { isNot: null } }] },
      include: {
        enlaceCsj: { include: { datosCsj: true } },
        enlaceDeaj: { include: { datosDeaj: true } },
        datosActoAdministrativo: { include: { actoAdministrativo: true } },
        datosEncuesta: { include: { actoTraslado: true, despachoTrasladoDestino: true } },
      },
      orderBy: [{ numero: 'asc' }],
    })

    const columns = [
      { modelName: 'DatosUdae', name: 'numero', type: 'string', prettyName: 'Número' },
      { modelName: 'DatosUdae', name: 'jurisdiccion', type: 'string', prettyName: 'Jurisdicción' },
      { modelName: 'DatosUdae', name: 'consejoSeccional', type: 'string', prettyName: 'Consejo Seccional' },
      { modelName: 'DatosUdae', name: 'direccionSeccional', type: 'string', prettyName: 'Dirección Seccional' },
      { modelName: 'DatosUdae', name: 'distritoJudicial', type: 'string', prettyName: 'Distrito judicial' },
      { modelName: 'DatosUdae', name: 'circuitoJudicial', type: 'string', prettyName: 'Circuito judicial' },
      { modelName: 'DatosUdae', name: 'municipioSedeFisica', type: 'string', prettyName: 'Municipio' },
      { modelName: 'DatosUdae', name: 'dependencia', type: 'string', prettyName: 'Dependencia' },
      { modelName: 'DatosUdae', name: 'especialidad', type: 'string', prettyName: 'Especialidad' },
      { modelName: 'DatosUdae', name: 'subespecialidad', type: 'string', prettyName: 'Sub-especialidad' },
      { modelName: 'DatosUdae', name: 'nombreDespacho', type: 'string', prettyName: 'Nombre de Despacho' },
      { modelName: 'DatosUdae', name: 'descripcionCargo', type: 'string', prettyName: 'Descripción del cargo' },
      { modelName: 'DatosUdae', name: 'gradoCargo', type: 'string', prettyName: 'Grado del cargo' },
      {
        modelName: 'DatosUdae',
        name: 'tipoActoAdministrativo',
        type: 'string',
        prettyName: 'Tipo de Acto Administrativo',
      },
      {
        modelName: 'DatosUdae',
        name: 'numeroActoAdministrativo',
        type: 'string',
        prettyName: 'Número de Acto Administrativo',
      },
      {
        modelName: 'DatosUdae',
        name: 'anioActoAdministrativo',
        type: 'string',
        prettyName: 'Año de Acto Administrativo',
      },
      { modelName: 'DatosUdae', name: 'denominacionInicial', type: 'string', prettyName: 'Denominacion inicial' },
      { modelName: 'DatosUdae', name: 'gradoInicial', type: 'string', prettyName: 'Grado inicial' },
      {
        modelName: 'DatosUdae',
        name: 'actoAdministrativoModificatorio',
        type: 'string',
        prettyName: 'Acto Administrativo modificatorio',
      },
      { modelName: 'DatosUdae', name: 'observaciones', type: 'string', prettyName: 'Observaciones' },
      // **************************** ORIGEN PENDIENTE!!!
      { modelName: 'DatosCsj', name: '', type: 'string', prettyName: 'Sección (División o grupo)' },
      { modelName: 'DatosCsj', name: 'codigoDespacho', type: 'string', prettyName: 'Código del despacho' },
      {
        modelName: 'DatosEncuesta',
        name: 'cargoExiste',
        type: 'string',
        prettyName: '¿El cargo existe en este despacho?',
      },

      {
        modelName: 'DatosActo',
        name: 'actoCorrecto',
        type: 'string',
        prettyName: '¿El acto administrativo es correcto?',
      },
      { modelName: 'DatosActo', name: 'articulo', type: 'string', prettyName: 'Artículo' },
      { modelName: 'DatosActo', name: 'literal', type: 'string', prettyName: 'Literal' },
      { modelName: 'DatosActo', name: 'numeral', type: 'string', prettyName: 'Numeral' },

      {
        modelName: 'ActoAdministrativo',
        name: 'tipo',
        type: 'string',
        prettyName: 'Tipo de acto administrativo correcto',
      },
      {
        modelName: 'ActoAdministrativo',
        name: 'numero',
        type: 'string',
        prettyName: 'Número del acto administrativo correcto',
      },
      {
        modelName: 'ActoAdministrativo',
        name: 'anio',
        type: 'string',
        prettyName: 'Año del acto administrativo correcto',
      },
      { modelName: 'DatosActo', name: 'articuloCorrecto', type: 'string', prettyName: 'Artículo correcto' },
      { modelName: 'DatosActo', name: 'literalCorrecto', type: 'string', prettyName: 'Literal correcto' },
      { modelName: 'DatosActo', name: 'numeralCorrecto', type: 'string', prettyName: 'Numeral correcto' },

      {
        modelName: 'DatosEncuesta',
        name: 'observacionesDespacho',
        type: 'string',
        prettyName: 'Observaciones del nombre del despacho, cargo y grado',
      },

      // En carrera, En periodo individual, En libre nombramiento
      {
        modelName: 'DatosDeaj',
        name: 'naturaleza',
        type: 'string',
        prettyName: 'Clasificación del empleo (Art. 130 Ley 270)',
      },

      // En propiedad, En provisionalidad, En encargo, Cargo vacante
      {
        modelName: 'DatosDeaj',
        name: 'formaProvision',
        type: 'string',
        prettyName: 'Forma de provisión del cargo (Art. 132 Ley 270)',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'nombres',
        type: 'string',
        prettyName: 'Nombres del servidor judicial en propiedad',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'apellidos',
        type: 'string',
        prettyName: 'Apellidos del servidor judicial en propiedad',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'tipoDocumento',
        type: 'string',
        prettyName: 'Tipo de documento de identidad',
      },
      { modelName: 'DatosEncuesta', name: 'documento', type: 'string', prettyName: 'Número de documento de identidad' },
      { modelName: 'DatosEncuesta', name: 'nivelEscolaridad', type: 'string', prettyName: 'Nivel de escolaridad' },
      {
        modelName: 'DatosEncuesta',
        name: 'familiaresDependientes',
        type: 'string',
        prettyName: 'Familiares dependientes con los que convive (1er grado de consanguinidad/afinidad)',
      },

      {
        modelName: 'DatosEncuesta',
        name: 'tieneServidorProv',
        type: 'string',
        prettyName: 'El cargo tiene servidor en provisionalidad?',
      },
      {
        modelName: 'DatosDeaj',
        name: 'conFechaFin',
        type: 'string',
        prettyName: 'La provisionalidad tiene fecha de terminación',
      },
      {
        modelName: 'DatosDeaj',
        name: 'fechaFin',
        type: 'string',
        prettyName: 'Fecha en que finaliza la provisionalidad (DD/MM/AAAA)',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'nombresProv',
        type: 'string',
        prettyName: 'Nombres del servidor judicial en provisionalidad',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'apellidosProv',
        type: 'string',
        prettyName: 'Apellidos del servidor judicial en provisionalidad',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'tipoDocumentoProv',
        type: 'string',
        prettyName: 'Tipo de documento de identidad',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'documentoProv',
        type: 'string',
        prettyName: 'Número de documento de identidad',
      },
      { modelName: 'DatosEncuesta', name: 'nivelEscolaridadProv', type: 'string', prettyName: 'Nivel de escolaridad' },
      {
        modelName: 'DatosEncuesta',
        name: 'familiaresDependientesProv',
        type: 'string',
        prettyName: 'Familiares dependientes con los que convive (1er grado de consanguinidad/afinidad)',
      },

      { modelName: 'DatosActo', name: 'perfilCargo', type: 'string', prettyName: 'Perfil del cargo' },
      {
        modelName: 'DatosEncuesta',
        name: 'profesion1',
        type: 'string',
        prettyName: 'Profesión 1 (La que aplica para el cargo)',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'profesion2',
        type: 'string',
        prettyName: 'Profesión 2 (Profesión adicional)',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'profesion3',
        type: 'string',
        prettyName: 'Profesión 3 (Profesión adicional)',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'observacionesClasificacion',
        type: 'string',
        prettyName: 'Observaciones del nombre del despacho, cargo y grado',
      },

      {
        modelName: 'DatosEncuesta',
        name: 'tipoNovedad',
        type: 'string',
        prettyName: 'Tipo de novedad',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'tipoTraslado',
        type: 'string',
        prettyName: 'Tipo de traslado',
      },
      {
        modelName: 'DespachoDatosEncuesta',
        name: 'jurisdiccionTraslado',
        type: 'string',
        prettyName: 'Jurisdicción de destino',
      },
      {
        modelName: 'DespachoDatosEncuesta',
        name: 'distritoDestinoTraslado',
        type: 'string',
        prettyName: 'Distrito de destino',
      },
      {
        modelName: 'DespachoDatosEncuesta',
        name: 'circuitoDestinoTraslado',
        type: 'string',
        prettyName: 'Circuito de destino',
      },
      {
        modelName: 'DespachoDatosEncuesta',
        name: 'municipioDestinoTraslado',
        type: 'string',
        prettyName: 'Municipio de destino',
      },
      {
        modelName: 'DespachoDatosEncuesta',
        name: 'despachoDestinoTraslado',
        type: 'string',
        prettyName: 'Despacho de destino',
      },
      {
        modelName: 'DespachoDatosEncuesta',
        name: 'codigoDespachoDestinoTraslado',
        type: 'string',
        prettyName: 'Código de despacho de destino',
      },
      {
        modelName: 'ActoDatosEncuesta',
        name: 'tipo',
        type: 'string',
        prettyName: 'Tipo de acto administrativo (Traslado o supresión)',
      },
      {
        modelName: 'ActoDatosEncuesta',
        name: 'numero',
        type: 'string',
        prettyName: 'Número de acto administrativo (Traslado o supresión)',
      },
      {
        modelName: 'ActoDatosEncuesta',
        name: 'anio',
        type: 'string',
        prettyName: 'Año de acto administrativo (Traslado o supresión)',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'observacionesNovedad',
        type: 'string',
        prettyName: 'Observaciones de la novedad (Traslado o supresión)',
      },

      { modelName: 'DatosDeaj', name: 'idOcurrenciaTitular', type: 'string', prettyName: 'ID ocurrencia titular' },
    ]

    const flatRegistros = registros.map((item) => {
      const flat = columns
        .map((column) => {
          const { name, type, prettyName, modelName } = column

          let fila: Record<string, any> = {}
          if (modelName === 'DatosUdae') fila = item
          else if (modelName === 'DatosCsj') fila = item.enlaceCsj?.datosCsj || {}
          else if (modelName === 'DatosDeaj') fila = item.enlaceDeaj?.datosDeaj || {}
          else if (modelName === 'ActoAdministrativo') fila = item.datosActoAdministrativo?.actoAdministrativo || {}
          else if (modelName === 'DatosActo') fila = item.datosActoAdministrativo || {}
          else if (modelName === 'DatosEncuesta') fila = item.datosEncuesta || {}
          else if (modelName === 'ActoDatosEncuesta') fila = item.datosEncuesta?.actoTraslado || {}
          else if (modelName === 'DespachoDatosEncuesta') fila = item.datosEncuesta?.despachoTrasladoDestino || {}

          const value = String(fila?.[name] ?? '')
          return { name: `${modelName}.${name}`, type, prettyName, value }
        })
        .reduce((acc, item) => ({ ...acc, [item.name]: { type: item.type, value: item.value } }), {
          id: { type: 'string', value: item.id },
        }) as Record<string, { type: string; value: string }>

      const claseNombramiento = item.enlaceDeaj?.datosDeaj?.claseNombramiento
      const servidorEnPropiedad = !claseNombramiento || claseNombramiento === 'Propiedad'

      const nombreCompletoDeaj = (servidorEnPropiedad && item.enlaceDeaj?.datosDeaj?.servidor) || ''
      const nombreCompleto = item.enlaceCsj?.datosCsj?.propiedad || nombreCompletoDeaj
      const { nombres, apellidos } = separarNombre(nombreCompleto)
      flat['DatosCsj.propiedadApellidos'] = { type: 'string', value: apellidos }
      flat['DatosCsj.propiedad'] = { type: 'string', value: nombres }

      if (flat['DatosDeaj.servidor']?.value) {
        const nombreCompleto = item.enlaceDeaj?.datosDeaj?.servidor
        const { nombres, apellidos } = separarNombre(nombreCompleto)
        flat['DatosDeaj.servidorApellidos'] = { type: 'string', value: !servidorEnPropiedad ? apellidos : '' }
        flat['DatosDeaj.servidor'] = { type: 'string', value: !servidorEnPropiedad ? nombres : '' }
      }

      flat['DatosEncuesta.tieneServidorProv'] = { type: 'string', value: !servidorEnPropiedad ? 'Si' : 'No' }

      const fechaFinProv = item.enlaceDeaj?.datosDeaj?.fechaFin
      let conFechaFin = ''
      if (!servidorEnPropiedad) conFechaFin = fechaFinProv ? 'Si' : 'No'

      flat['DatosDeaj.conFechaFin'] = { type: 'string', value: conFechaFin }

      const actoCorrecto = item.datosActoAdministrativo?.actoCorrecto === 'Si' ? true : false
      const datosActo = item.datosActoAdministrativo

      flat['ActoAdministrativo.articulo'] = { type: 'string', value: actoCorrecto ? datosActo?.articulo || '' : '' }
      flat['ActoAdministrativo.literal'] = { type: 'string', value: actoCorrecto ? datosActo?.literal || '' : '' }
      flat['ActoAdministrativo.numeral'] = { type: 'string', value: actoCorrecto ? datosActo?.numeral || '' : '' }

      flat['ActoAdministrativo.tipo'] = {
        type: 'string',
        value: !actoCorrecto ? datosActo?.actoAdministrativo.tipo || '' : '',
      }
      flat['ActoAdministrativo.numero'] = {
        type: 'string',
        value: !actoCorrecto ? datosActo?.actoAdministrativo.numero || '' : '',
      }
      flat['ActoAdministrativo.anio'] = {
        type: 'string',
        value: !actoCorrecto ? datosActo?.actoAdministrativo.anio || '' : '',
      }
      flat['ActoAdministrativo.articuloCorrecto'] = {
        type: 'string',
        value: !actoCorrecto ? datosActo?.articulo || '' : '',
      }
      flat['ActoAdministrativo.literalCorrecto'] = {
        type: 'string',
        value: !actoCorrecto ? datosActo?.literal || '' : '',
      }
      flat['ActoAdministrativo.numeralCorrecto'] = {
        type: 'string',
        value: !actoCorrecto ? datosActo?.numeral || '' : '',
      }

      flat['DatosDeaj.formaProvision'] = !item.datosEncuesta
        ? { type: 'string', value: '' }
        : {
            type: 'string',
            value:
              item.datosEncuesta.tieneServidorProv === 'Si'
                ? 'En provisionalidad'
                : item.datosEncuesta.tieneServidorProp === 'Si'
                  ? 'En propiedad'
                  : 'Cargo vacante',
          }

      flat['DatosEncuesta.profesion1'] = {
        type: 'string',
        value: item.datosEncuesta?.tieneServidorProv
          ? item.datosEncuesta.profesion1Prov
          : item.datosEncuesta?.profesion1 || '',
      }
      flat['DatosEncuesta.profesion2'] = {
        type: 'string',
        value: item.datosEncuesta?.tieneServidorProv
          ? item.datosEncuesta.profesion2Prov
          : item.datosEncuesta?.profesion2 || '',
      }
      flat['DatosEncuesta.profesion3'] = {
        type: 'string',
        value: item.datosEncuesta?.tieneServidorProv
          ? item.datosEncuesta.profesion3Prov
          : item.datosEncuesta?.profesion3 || '',
      }

      return flat
    })

    return { registros: flatRegistros, columns }
  }),

  getDatosAvance: protectedProcedure.query(async ({ ctx }) => {
    const totalUdae = await ctx.db.datosUdae.count()
    const avanceCsj = await ctx.db.enlaceCsj.count()
    const avanceDeaj = await ctx.db.enlaceDeaj.count()
    const totalDeaj = await ctx.db.datosDeaj.count()
    const totalActos = await ctx.db.enlaceActoAdministrativo.count()
    const totalInfoTrabajadores = await ctx.db.datosEncuesta.count()

    const progresoDespachosSchema = z.array(
      z.object({
        cargos: z.number(),
        diligenciados: z.number(),
        nombreDespacho: z.string(),
        email: z.string().optional(),
      }),
    )
    const progresoDespachosRaw = await ctx.db.datosUdae.aggregateRaw({
      pipeline: [
        { $lookup: { from: 'DatosEncuesta', localField: '_id', foreignField: 'datosUdaeId', as: 'encuesta' } },
        { $addFields: { cuentaEncuesta: { $size: '$encuesta' } } },
        { $group: { _id: '$nombreDespacho', cargos: { $sum: 1 }, diligenciados: { $sum: '$cuentaEncuesta' } } },
        { $sort: { _id: 1 } },
        { $lookup: { from: 'Despacho', localField: '_id', foreignField: 'nombre', as: 'despacho' } },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            nombreDespacho: '$_id',
            email: { $first: '$despacho.email' },
            cargos: 1,
            diligenciados: 1,
          },
        },
        {
          $match: {
            $expr: { $gt: ['$cargos', '$diligenciados'] },
            $or: [{ email: { $regex: '@' } }, { email: { $exists: false } }],
          },
        },
      ],
    })

    const { data: progresoDespachos = [] } = progresoDespachosSchema.safeParse(progresoDespachosRaw)

    return {
      totalUdae,
      avanceCsj,
      porcCsj: (avanceCsj / totalUdae) * 100,
      avanceDeaj,
      totalDeaj,
      porcDeaj: (avanceDeaj / totalDeaj) * 100,
      totalActos,
      porcActos: (totalActos / totalUdae) * 100,
      totalInfoTrabajadores,
      porcInfoTrabajadores: (totalInfoTrabajadores / totalUdae) * 100,
      progresoDespachos,
    }
  }),
})
