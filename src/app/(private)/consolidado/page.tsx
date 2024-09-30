import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/server'
import { EnlaceActoForm } from './enlace-acto-form'

const bgBymodelName = {
  DatosUdae: 'bg-sky-50',
  DatosCsj: 'bg-lime-50',
  DatosDeaj: 'bg-amber-50',
  ActoAdministrativo: 'bg-pink-50',
  DatosActo: 'bg-pink-50',
}

export default async function Consolidado() {
  const { columns, registros } = await api.cargos.getConsolidado()
  const { actos } = await api.actos.getList()

  return (
    <div className="w-full max-w-full space-y-4">
      <h1>Consolidado ({registros.length} registros)</h1>

      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datos de acto administrativo</TableHead>
              {columns.map(({ name, prettyName }) => (
                <TableHead key={name}>{prettyName}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="w-48">
                  <EnlaceActoForm datosUdaeId={item.id} actosAdministrativosList={actos} />
                </TableCell>
                {columns.map(({ modelName, name }) => {
                  let fila = {}

                  if (modelName === 'DatosCsj') fila = item.enlaceCsj?.datosCsj || {}
                  else if (modelName === 'DatosDeaj') fila = item.enlaceDeaj?.datosDeaj || {}
                  else if (modelName === 'ActoAdministrativo')
                    fila = item.datosActoAdministrativo?.actoAdministrativo || {}
                  else if (modelName === 'DatosActo') fila = item.datosActoAdministrativo || {}
                  else fila = item

                  return (
                    <TableCell className={cn('bg- max-w-lg truncate text-nowrap', bgBymodelName[modelName])} key={name}>
                      {fila[name] ? String(fila[name]) : '-'}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* <div className="mt-2 flex items-center justify-between">
        <Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
          {'<'}
        </Button>
        <span>Página {page}</span>
        <Button onClick={() => setPage(page + 1)} disabled={data.length < ITEMS_PER_PAGE}>
          {'>'}
        </Button>
      </div> */}
    </div>
  )
}
