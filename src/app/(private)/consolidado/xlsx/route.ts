import * as XLSX from 'xlsx'
import { api } from '~/trpc/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { columns, registros } = await api.cargos.getConsolidado()

  const XLSX_FILE_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const FILE_EXTENSION = '.xlsx'

  const columnKeys = columns.map((col) => `${col.modelName}.${col.name}`)

  const xlsxData = [
    {
      name: 'consolidado',
      data: [
        columns.map((col) => col.prettyName),
        ...registros.map((registro) => columnKeys.map((col) => registro[col]?.value || '')),
      ],
    },
  ]

  const workSheets = xlsxData.reduce((ws, d) => ({ ...ws, [d.name]: XLSX.utils.aoa_to_sheet(d.data) }), {})
  const workBook = { Sheets: workSheets, SheetNames: xlsxData.map((d) => d.name) }
  const xslxBuffer = XLSX.write(workBook, { bookType: 'xlsx', type: 'array' })
  const fileData = new Blob([xslxBuffer], { type: XLSX_FILE_TYPE })

  return new Response(fileData, {
    status: 200,
    headers: {
      'Content-Type': XLSX_FILE_TYPE,
      'Content-Disposition': `attachment; filename=${'consolidado' + FILE_EXTENSION}`,
    },
  })
}
