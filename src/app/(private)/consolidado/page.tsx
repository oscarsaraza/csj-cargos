import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/server'

const bgBymodelName = {
  DatosUdae: 'bg-sky-50',
  DatosCsj: 'bg-lime-50',
  DatosDeaj: 'bg-amber-50',
  ActoAdministrativo: 'bg-pink-50',
  DatosActo: 'bg-pink-50',
  DatosEncuesta: 'bg-lime-50',
}

export default async function Consolidado() {
  const { columns, registros, datosAvance } = await api.cargos.getConsolidado()

  return (
    <div className="w-full max-w-full space-y-4">
      <h1>Consolidado ({registros.length} registros)</h1>

      <ScrollArea className="h-[920px] rounded-md border">
        <Table>
          <TableHeader className="sticky top-0">
            <TableRow>
              {columns.map(({ name, prettyName }) => (
                <TableHead key={name}>{prettyName}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((item) => (
              <TableRow key={item.id}>
                {columns.map(({ modelName, name }) => {
                  let fila = {}

                  if (modelName === 'DatosUdae') fila = item
                  else if (modelName === 'DatosCsj') fila = item.enlaceCsj?.datosCsj || {}
                  else if (modelName === 'DatosDeaj') fila = item.enlaceDeaj?.datosDeaj || {}
                  else if (modelName === 'ActoAdministrativo')
                    fila = item.datosActoAdministrativo?.actoAdministrativo || {}
                  else if (modelName === 'DatosActo') fila = item.datosActoAdministrativo || {}
                  else if (modelName === 'DatosEncuesta') fila = item.datosEncuesta || {}

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

      <div className="flex flex-row flex-wrap gap-4">
        <ProgressCard
          title="Emparejamiento CSJ"
          description={`${datosAvance.avanceCsj}/${datosAvance.totalUdae}`}
          progress={datosAvance.porcCsj}
        />
        <ProgressCard
          title="Emparejamiento DEAJ"
          description={`${datosAvance.avanceDeaj}/${datosAvance.totalDeaj}`}
          progress={datosAvance.porcDeaj}
        />
        <ProgressCard
          title="Revisión de actos administrativos"
          description={`${datosAvance.totalActos}/${datosAvance.totalUdae}`}
          progress={datosAvance.porcActos}
        />
        <ProgressCard
          title="Recolección de información personal"
          description={`${datosAvance.totalInfoTrabajadores}/${datosAvance.totalUdae}`}
          progress={datosAvance.porcInfoTrabajadores}
        />
      </div>
    </div>
  )
}

interface ItemProgressCardProps {
  title: string
  description: string
  progress: number
}

function ProgressCard({ title, description, progress }: ItemProgressCardProps) {
  return (
    <Card className="w-[360px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-xl font-bold">{progress.toFixed(2)}%</p>
        </div>
      </CardContent>
    </Card>
  )
}
