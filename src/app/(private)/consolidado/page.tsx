import { redirect } from 'next/navigation'
import { UnauthorizedUserMessage } from '~/app/_components/unauthorized-user'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { RouterOutputs } from '~/trpc/react'
import { api } from '~/trpc/server'
import { DescargaXlsxButton } from './descarga-xlsx-button'

export default async function Consolidado() {
  const { userId } = await api.users.getLoggedUser()
  if (!userId) redirect('/login')

  const user = await api.users.byId({ userId })
  if (!user) redirect('/login')

  if (user.role !== 'csj' && user.role !== 'deaj') return <UnauthorizedUserMessage email={`${user.username}`} />

  const datosAvance = await api.cargos.getDatosAvance()

  return (
    <div className="w-full max-w-full space-y-4">
      <h1 className="text-2xl font-bold">Consolidado</h1>

      <DescargaXlsxButton />

      <h1 className="text-2xl font-bold">Avance</h1>
      <TarjetasAvance datos={datosAvance} />

      <h1 className="text-2xl font-bold">
        Despachos con diligenciamiento incompleto ({datosAvance.progresoDespachos.length})
      </h1>
      <ProgresoDespachos datos={datosAvance.progresoDespachos} />
    </div>
  )
}

type TarjetasAvanceProps = RouterOutputs['cargos']['getDatosAvance']

function TarjetasAvance({ datos }: { datos: TarjetasAvanceProps }) {
  return (
    <div className="flex flex-row flex-wrap gap-4">
      <ProgressCard
        title="Emparejamiento CSJ"
        description={`${datos.avanceCsj}/${datos.totalUdae}`}
        progress={datos.porcCsj}
      />
      <ProgressCard
        title="Emparejamiento DEAJ"
        description={`${datos.avanceDeaj}/${datos.totalDeaj}`}
        progress={datos.porcDeaj}
      />
      <ProgressCard
        title="Revisión de actos administrativos"
        description={`${datos.totalActos}/${datos.totalUdae}`}
        progress={datos.porcActos}
      />
      <ProgressCard
        title="Recolección de información personal"
        description={`${datos.totalInfoTrabajadores}/${datos.totalUdae}`}
        progress={datos.porcInfoTrabajadores}
      />
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

function ProgresoDespachos({ datos }: { datos: TarjetasAvanceProps['progresoDespachos'] }) {
  return (
    <div className="flex flex-col flex-wrap gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-nowrap">Despacho</TableHead>
            <TableHead className="text-nowrap">Avance de diligenciamiento de cargos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datos.map((item) => {
            return (
              <TableRow key={item.nombreDespacho}>
                <TableCell>
                  {item.nombreDespacho} <span className="text-muted-foreground">{item.email}</span>
                </TableCell>
                <TableCell>
                  {item.diligenciados} de {item.cargos}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
