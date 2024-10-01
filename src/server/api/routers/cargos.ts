import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { getModelColumns, modelCsj, modelDeaj, modelUdae, orderTableColumns } from './_utils'

const udaeColumnsOrder = ['municipioSedeFisica', 'descripcionCargo', 'nombreDespacho']
const csjColumnsOrder = ['municipio', 'cargo', 'depacho', 'propiedad']
const deajColumnsOrder = ['ciudadUbicacionLaboral', 'cargoTitular', 'dependenciaTitular']

export const cargosRouter = createTRPCRouter({
  getPairingDataCsj: protectedProcedure.query(async ({ ctx }) => {
    const datosUdae = await ctx.db.datosUdae.findMany({
      where: { enlaceCsj: null },
      orderBy: [{ municipioSedeFisica: 'asc' }, { nombreDespacho: 'asc' }, { descripcionCargo: 'asc' }],
    })
    const columnsUdae = modelUdae ? orderTableColumns(getModelColumns(modelUdae), udaeColumnsOrder) : []

    const datosCsj = await ctx.db.datosCsj.findMany({
      where: { enlace: null },
      orderBy: [{ municipio: 'asc' }, { depacho: 'asc' }, { cargo: 'asc' }],
    })
    const columnsCsj = modelCsj ? orderTableColumns(getModelColumns(modelCsj), csjColumnsOrder) : []

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

  getPairingDataDeaj: protectedProcedure.query(async ({ ctx }) => {
    const datosUdae = await ctx.db.datosUdae.findMany({
      where: { enlaceDeaj: null },
      orderBy: [{ municipioSedeFisica: 'asc' }, { nombreDespacho: 'asc' }, { descripcionCargo: 'asc' }],
    })
    const columnsUdae = modelUdae ? orderTableColumns(getModelColumns(modelUdae), udaeColumnsOrder) : []

    const datosDeaj = await ctx.db.datosDeaj.findMany({
      where: { enlace: null },
      orderBy: [{ ciudadUbicacionLaboral: 'asc' }, { cargoTitular: 'asc' }, { dependenciaTitular: 'asc' }],
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

  getPairingDataActos: protectedProcedure.query(async ({ ctx }) => {
    const datosUdae = await ctx.db.datosUdae.findMany({
      where: { datosActoAdministrativo: null },
      orderBy: [{ municipioSedeFisica: 'asc' }, { nombreDespacho: 'asc' }, { descripcionCargo: 'asc' }],
    })
    const columnsUdae = modelUdae ? orderTableColumns(getModelColumns(modelUdae), udaeColumnsOrder) : []

    return { datosUdae, columnsUdae }
  }),

  getConsolidado: protectedProcedure.query(async ({ ctx }) => {
    const registros = await ctx.db.datosUdae.findMany({
      where: { OR: [{ enlaceCsj: { isNot: null } }, { enlaceDeaj: { isNot: null } }] },
      include: {
        enlaceCsj: { include: { datosCsj: true } },
        enlaceDeaj: { include: { datosDeaj: true } },
        datosActoAdministrativo: { include: { actoAdministrativo: true } },
        datosEncuesta: true
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

      // 'SECCIÓN (DIVISIÓN, O GRUPO)', // ???
      { modelName: 'DatosCsj', name: 'codigoDespacho', type: 'string', prettyName: 'Código del despacho' },
      // '¿El cargo existe en este despacho?', // Si, No, Si con novedad

      {
        modelName: 'DatosActo',
        name: 'actoCorrecto',
        type: 'string',
        prettyName: '¿El acto administrativo es correcto?',
      },
      { modelName: 'DatosActo', name: 'articulo', type: 'string', prettyName: 'Artículo' },
      { modelName: 'DatosActo', name: 'literal', type: 'string', prettyName: 'Literal' },
      { modelName: 'DatosActo', name: 'numeral', type: 'string', prettyName: 'Numeral' },

      /////////////// Sección en blanco a menos que "¿El acto administrativo es correcto?" sea igual a "No"
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
      { modelName: 'DatosActo', name: 'articulo', type: 'string', prettyName: 'Artículo correcto' },
      { modelName: 'DatosActo', name: 'literal', type: 'string', prettyName: 'Literal correcto' },
      { modelName: 'DatosActo', name: 'numeral', type: 'string', prettyName: 'Numeral correcto' },

      // 'OBSERVACIONES (Para nombre del despacho, cargo y grado) ',

      {
        modelName: 'DatosDeaj',
        name: 'claseNombramiento',
        type: 'string',
        prettyName: 'Clasificación del empleo (Art. 130 Ley 270)',
        // En carrera, En periodo individual, En libre nombramiento
      },
      {
        modelName: 'DatosDeaj',
        name: '', // ----- DatosCsj.estadoActual: PROPIEDAD, VACANTE ?????
        type: 'string',
        prettyName: 'Forma de provisión del cargo (Art. 132 Ley 270)',
        // En propiedad, En provisionalidad, En encargo, Cargo vacante
      },
      {
        modelName: 'DatosCsj',
        name: 'propiedad',
        type: 'string',
        prettyName: 'Nombres del servidor judicial en propiedad',
      },
      {
        modelName: 'DatosCsj',
        name: 'propiedadApellidos',
        type: 'string',
        prettyName: 'Apellidos del servidor judicial en propiedad',
      },
      {
        modelName: 'DatosEncuesta',
        name: 'tipoDocumento',
        type: 'string',
        prettyName: 'Tipo de documento de identidad',
      },
      { modelName: 'DatosEncuesta', name: 'cedula', type: 'string', prettyName: 'Número de documento de identidad' },
      { modelName: 'DatosEncuesta', name: 'nivelEscolaridad', type: 'string', prettyName: 'Nivel de escolaridad' },
      {
        modelName: 'DatosEncuesta',
        name: 'familiaresDependientes',
        type: 'string',
        prettyName: 'Familiares dependientes con los que convive (1er grado de consanguinidad/afinidad)',
      },

      {
        modelName: 'DatosDeaj',
        name: '',
        type: 'string',
        prettyName: 'El cargo tiene servidor en provisionalidad?', // Si, No
      },
      {
        modelName: 'DatosDeaj',
        name: '',
        type: 'string',
        prettyName: 'La provisionalidad tiene fecha de terminación',
        // 'La provisionalidad tiene fecha de terminación?', // Si cuando hay una fecha en que finaliza la provisionalidad, No en caso contrario
      },
      {
        modelName: 'DatosDeaj',
        name: 'fechaFin',
        type: 'string',
        prettyName: 'Fecha en que finaliza la provisionalidad (DD/MM/AAAA)',
      },
      {
        modelName: 'DatosDeaj',
        name: 'nombreReemplazo',
        type: 'string',
        prettyName: 'Nombres del servidor judicial en provisionalidad',
      },
      {
        modelName: 'DatosDeaj',
        name: 'apellidosReemplazo',
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
        name: 'cedulaProv',
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
        name: 'observaciones',
        type: 'string',
        prettyName: 'Observaciones',
      },

      // 'TIPO DE NOVEDAD (Movimiento del Cargo)',
      // 'TIPO DE TRASLADO',
      // 'JURISDICCIÓN DESTINO (Traslado)',
      // 'DISTRITO DESTINO (Traslado)',
      // 'CIRCUITO DESTINO (Traslado)',
      // 'MUNICIPIO DESTINO (Traslado)',
      // 'DESPACHO DESTINO (Traslado)',
      // 'CÓDIGO DEL DESPACHO DESTINO (Traslado)',
      // 'TIPO DE ACTO ADMINISTRATIVO (Traslado o supresión)',
      // 'NÚMERO DE ACTO ADMINISTRATIVO (Traslado o supresión)',
      // 'AÑO DEL ACTO ADMINISTRATIVO (Traslado o supresión)',
      // 'OBSERVACIONES DE LA NOVEDAD (Traslado o supresión)',

      { modelName: 'DatosDeaj', name: 'idOcurrenciaTitular', type: 'string', prettyName: 'ID ocurrencia titular' },
    ]

    const totalUdae = await ctx.db.datosUdae.count()
    const avanceCsj = await ctx.db.enlaceCsj.count()
    const avanceDeaj = await ctx.db.enlaceDeaj.count()
    const totalDeaj = await ctx.db.datosDeaj.count({ where: { claseNombramiento: 'Provisionalidad' } })
    const totalActos = await ctx.db.enlaceActoAdministrativo.count()

    const datosAvance = {
      totalUdae,
      avanceCsj,
      porcCsj: (avanceCsj / totalUdae) * 100,
      avanceDeaj,
      totalDeaj,
      porcDeaj: (avanceDeaj / totalDeaj) * 100,
      totalActos,
      porcActos: (totalActos / totalUdae) * 100,
      totalInfoTrabajadores: 0,
      porcInfoTrabajadores: 0,
    }

    return { registros, columns, datosAvance }
  }),
})
