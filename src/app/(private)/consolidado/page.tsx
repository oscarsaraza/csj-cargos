import { redirect } from 'next/navigation'
import { UnauthorizedUserMessage } from '~/app/_components/unauthorized-user'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/server'

const bgBymodelName: Record<string, string> = {
  DatosUdae: 'bg-sky-50',
  DatosCsj: 'bg-lime-50',
  DatosDeaj: 'bg-amber-50',
  ActoAdministrativo: 'bg-pink-50',
  DatosActo: 'bg-pink-50',
  DatosEncuesta: 'bg-lime-50',
  DatosValidacion: 'bg-lime-100',
}

export default async function Consolidado() {
  const { columns, registros, datosAvance } = await api.cargos.getConsolidado()

  const { userId } = await api.users.getLoggedUser()
  if (!userId) redirect('/login')

  const user = await api.users.byId({ userId })
  if (!user) redirect('/login')

  if (user.role !== 'csj' && user.role !== 'deaj')
    return <UnauthorizedUserMessage email={`${user.username}@cendoj.ramajudicial.gov.co`} />

  return (
    <div className="w-full max-w-full space-y-4">
      <h1>Consolidado ({registros.length} registros)</h1>

      <div className="mx-auto max-w-full rounded-lg border">
        <div className="max-h-[640px] overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-background">
              <tr>
                {columns.map(({ name, prettyName }) => (
                  <th key={name} className="border-b text-center font-normal leading-none text-muted-foreground">
                    {prettyName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registros.map((fila) => (
                <tr key={fila.id?.value} className="hover:bg-muted/50">
                  {columns.map(({ modelName, name }) => {
                    const columnName = `${modelName}.${name}`
                    return (
                      <td
                        key={columnName}
                        className={cn(
                          'min-w-40 max-w-lg truncate text-nowrap border-b text-center',
                          bgBymodelName[modelName],
                        )}
                      >
                        {fila[columnName]?.value}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
