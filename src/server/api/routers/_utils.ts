import { Prisma } from '@prisma/client'

export const modelUdae = Prisma.dmmf.datamodel.models.find(({ name }) => name === 'DatosUdae')
export const modelCsj = Prisma.dmmf.datamodel.models.find(({ name }) => name === 'DatosCsj')
export const modelDeaj = Prisma.dmmf.datamodel.models.find(({ name }) => name === 'DatosDeaj')
export const modelActoAdministrativo = Prisma.dmmf.datamodel.models.find(({ name }) => name === 'ActoAdministrativo')

export const getColumnPrettyName = (columnName: string) =>
  columnName
    .match(/(^[a-z]|[A-Z])[a-z0-9]+/g)
    ?.map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(' ') ?? ''

export const orderTableColumns = (
  columns: { name: string; type: string; prettyName: string; modelName: string }[] = [],
  order: string[] = [],
) => {
  const sortedColumns = order
    .map((name) => columns.find((column) => column.name === name))
    .filter((column) => column !== undefined)
  const unsortedColumns = columns.filter((column) => !sortedColumns.includes(column))

  return [...sortedColumns, ...unsortedColumns]
}

export const getModelColumns = ({ name: modelName, fields }: (typeof Prisma.dmmf.datamodel.models)[0]) =>
  fields.map(({ name, type }) => ({ modelName, name, type, prettyName: getColumnPrettyName(name) }))
